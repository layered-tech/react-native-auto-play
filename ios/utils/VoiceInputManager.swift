import AVFoundation
import CarPlay
import NitroModules
import Speech

/// Retains the player and itself until playback finishes — AVAudioPlayer.delegate is weak.
private final class AudioPlayerDelegate: NSObject, AVAudioPlayerDelegate, @unchecked Sendable {
    private let onFinish: () -> Void
    private var keepAlive: AudioPlayerDelegate?
    private var player: AVAudioPlayer?

    init(player: AVAudioPlayer, _ onFinish: @escaping () -> Void) {
        self.onFinish = onFinish
        self.player = player
        super.init()
        keepAlive = self
    }

    private func finish() {
        player = nil
        keepAlive = nil
        onFinish()
    }

    func audioPlayerDidFinishPlaying(_: AVAudioPlayer, successfully _: Bool) { finish() }
    func audioPlayerDecodeErrorDidOccur(_: AVAudioPlayer, error _: Error?) { finish() }
}

/// CheckedContinuation wrapper that can only be resumed once, safe across concurrent stop() and recognition callbacks.
private final class ResultBox: @unchecked Sendable {
    private var continuation: CheckedContinuation<VoiceInputResult, Error>?
    private let lock = NSLock()

    init(_ continuation: CheckedContinuation<VoiceInputResult, Error>) {
        self.continuation = continuation
    }

    func resume(returning result: VoiceInputResult) {
        lock.lock()
        defer { lock.unlock() }
        continuation?.resume(returning: result)
        continuation = nil
    }

    func resume(throwing error: Error) {
        lock.lock()
        defer { lock.unlock() }
        continuation?.resume(throwing: error)
        continuation = nil
    }
}

/// Serializes access to the process-wide AVAudioSession and prevents a superseded
/// voice manager from deactivating the session owned by its replacement.
private final class VoiceAudioSessionCoordinator: @unchecked Sendable {
    struct Lease: Sendable {
        fileprivate let generation: UInt
    }

    private struct Configuration {
        let category: AVAudioSession.Category
        let mode: AVAudioSession.Mode
        let options: AVAudioSession.CategoryOptions
    }

    static let shared = VoiceAudioSessionCoordinator()

    private let queue = DispatchQueue(
        label: "com.iternio.react-native-auto-play.voice-audio-session"
    )
    private var activeGenerations = Set<UInt>()
    private var nextGeneration: UInt = 0
    private var previousConfiguration: Configuration?

    private init() {}

    func activate() throws -> Lease {
        return try queue.sync {
            let session = AVAudioSession.sharedInstance()

            if activeGenerations.isEmpty,
                previousConfiguration != nil
            {
                tryRestorePreviousConfiguration()
            }

            if previousConfiguration == nil {
                previousConfiguration = Configuration(
                    category: session.category,
                    mode: session.mode,
                    options: session.categoryOptions
                )
            }

            nextGeneration &+= 1
            let lease = Lease(generation: nextGeneration)
            activeGenerations.insert(lease.generation)

            do {
                try session.setCategory(
                    .playAndRecord,
                    mode: .measurement,
                    options: []
                )
                try session.setActive(true)
                return lease
            }
            catch {
                activeGenerations.remove(lease.generation)
                if activeGenerations.isEmpty {
                    tryRestorePreviousConfiguration()
                }
                throw error
            }
        }
    }

    func deactivate(_ lease: Lease) {
        queue.sync {
            guard activeGenerations.remove(lease.generation) != nil else {
                return
            }

            if activeGenerations.isEmpty {
                tryRestorePreviousConfiguration()
            }
        }
    }

    private func tryRestorePreviousConfiguration() {
        guard activeGenerations.isEmpty,
            let previousConfiguration
        else { return }

        let session = AVAudioSession.sharedInstance()
        do {
            try session.setActive(
                false,
                options: .notifyOthersOnDeactivation
            )
            try session.setCategory(
                previousConfiguration.category,
                mode: previousConfiguration.mode,
                options: previousConfiguration.options
            )
            self.previousConfiguration = nil
        }
        catch {
            // Retain the configuration so the next zero-owner transition can retry.
        }
    }
}

/// Records 16 kHz / 16-bit mono PCM from the car mic, or transcribes via SFSpeechRecognizer.
class VoiceInputManager {
    private var audioEngine: AVAudioEngine?
    private var activeInterfaceController: AutoPlayInterfaceController?
    private var voiceControlTemplate: CPVoiceControlTemplate?
    private var resultBox: ResultBox?
    private var samples: [Int16] = []
    private var isStopping = false
    private var cancelledByUser = false
    private let stopLock = NSLock()

    // STT
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private var recognitionActivityGeneration: UInt = 0
    private var recognitionFinalizationWorkItem: DispatchWorkItem?
    private var recognitionInactivityWorkItem: DispatchWorkItem?
    private var latestPartialTranscript: String?
    private var isSTTMode = false

    // Timing
    private var captureTimeoutWorkItem: DispatchWorkItem?
    private var recordingStart: Date?
    private var silenceStart: Date?
    private var firstBufferContinuation: CheckedContinuation<Void, Never>?

    // PCM result/onChunk audio encoding — STT transcription itself is unaffected
    private var encoding: VoiceAudioEncoding = .linear16

    private static let sampleRate: Double = 16_000
    private static let tapBufferSize: AVAudioFrameCount = 4_096
    private static let silenceAmplitudeThreshold = 500
    private static let warmupMs: Double = 500
    private static let recognitionFinalizationTimeout: TimeInterval = 7

    private static let targetFormat = AVAudioFormat(
        commonFormat: .pcmFormatInt16,
        sampleRate: sampleRate,
        channels: 1,
        interleaved: true
    )!

    // MARK: - Public

    func start(
        interfaceController: AutoPlayInterfaceController?,
        silenceThresholdMs: Double,
        maxDurationMs: Double,
        listeningText: String,
        listeningImage: Variant_GlyphImage_AssetImage_RemoteImage?,
        listeningImageRepeats: Bool?,
        preferSpeechToText: Bool,
        onChunk: ((_ chunk: VoiceInputChunk) -> Void)?,
        language: String?,
        startSoundUri: String?,
        endSoundUri: String?,
        encoding: VoiceAudioEncoding
    ) async throws -> VoiceInputResult {
        self.encoding = encoding
        let canStart = stopLock.withLock {
            guard !isStopping else { return false }
            cancelledByUser = false
            activeInterfaceController = interfaceController
            return true
        }
        guard canStart else { throw VoiceInputError.noActiveSession }

        // Keep one generation-aware lease for start sound, capture, and end sound.
        let audioSessionLease = try VoiceAudioSessionCoordinator.shared.activate()
        defer {
            VoiceAudioSessionCoordinator.shared.deactivate(audioSessionLease)
        }

        let result = try await withCheckedThrowingContinuation { cont in
            let box = ResultBox(cont)
            let canBeginCapture = self.stopLock.withLock {
                guard !self.isStopping else { return false }
                self.resultBox = box
                self.samples = []
                self.isSTTMode = false
                self.latestPartialTranscript = nil
                self.recognitionActivityGeneration = 0
                return true
            }

            guard canBeginCapture else {
                box.resume(throwing: VoiceInputError.noActiveSession)
                return
            }

            do {
                try self.startCapture(
                    interfaceController: interfaceController,
                    silenceThresholdMs: silenceThresholdMs,
                    maxDurationMs: maxDurationMs,
                    preferSpeechToText: preferSpeechToText,
                    onChunk: onChunk,
                    language: language
                )
            }
            catch {
                let recognitionState = self.stopLock.withLock {
                    () -> (SFSpeechRecognitionTask?, DispatchWorkItem?) in
                    self.resultBox = nil
                    self.isStopping = true
                    let recognitionTask = self.recognitionTask
                    let finalizationWorkItem =
                        self.recognitionFinalizationWorkItem
                    self.recognitionTask = nil
                    self.recognitionFinalizationWorkItem = nil
                    self.latestPartialTranscript = nil
                    return (recognitionTask, finalizationWorkItem)
                }
                recognitionState.1?.cancel()
                recognitionState.0?.cancel()
                self.cleanup(interfaceController: interfaceController)
                box.resume(throwing: error)
                return
            }

            // Start sound fires immediately; template is deferred until the first tap buffer so the mic indicator is already on.
            if let uri = startSoundUri {
                Task { await self.playSound(uri: uri) }
            }
            if let interfaceController = interfaceController {
                Task {
                    await withCheckedContinuation { (cont: CheckedContinuation<Void, Never>) in
                        let shouldWaitForBuffer = self.stopLock.withLock {
                            guard !self.isStopping else { return false }
                            self.firstBufferContinuation = cont
                            return true
                        }
                        if !shouldWaitForBuffer {
                            cont.resume()
                        }
                    }
                    // Skip if stop() fired before the first buffer — cleanup already dismissed.
                    guard !self.stopLock.withLock({ self.isStopping }) else { return }
                    await self.presentVoiceTemplate(
                        interfaceController: interfaceController,
                        listeningText: listeningText,
                        listeningImage: listeningImage,
                        listeningImageRepeats: listeningImageRepeats
                    )
                }
            }
        }

        if let uri = endSoundUri {
            await playSound(uri: uri)
        }

        return result
    }

    private func playSound(uri: String) async {
        guard let url = URL(string: uri) else { return }
        do {
            // URLSession handles both http:// (Metro dev server) and file:// (release bundle)
            let (data, _) = try await URLSession.shared.data(from: url)
            await withCheckedContinuation { (cont: CheckedContinuation<Void, Never>) in
                DispatchQueue.main.async {
                    do {
                        let player = try AVAudioPlayer(data: data)
                        let delegate = AudioPlayerDelegate(player: player) { cont.resume() }
                        player.delegate = delegate
                        player.prepareToPlay()
                        player.play()
                    }
                    catch {
                        cont.resume()
                    }
                }
            }
        }
        catch {
            print(error)
            // fail silently — a broken sound file must not block voice input
        }
    }

    func stop(interfaceController: AutoPlayInterfaceController? = nil) {
        stop(
            interfaceController: interfaceController,
            expectedRecognitionActivityGeneration: nil
        )
    }

    private func stop(
        interfaceController: AutoPlayInterfaceController?,
        expectedRecognitionActivityGeneration: UInt?
    ) {
        stopLock.lock()
        if let expectedRecognitionActivityGeneration,
            expectedRecognitionActivityGeneration != recognitionActivityGeneration
        {
            stopLock.unlock()
            return
        }

        guard !isStopping else {
            stopLock.unlock()
            return
        }
        isStopping = true
        let wasCancelled = cancelledByUser
        let wasSTTMode = isSTTMode
        let capturedRequest = recognitionRequest
        let captureWorkItem = captureTimeoutWorkItem
        captureTimeoutWorkItem = nil
        let inactivityWorkItem = recognitionInactivityWorkItem
        recognitionInactivityWorkItem = nil
        let box = wasSTTMode ? nil : resultBox
        let capturedSamples = wasSTTMode ? [] : samples
        if !wasSTTMode {
            resultBox = nil
            samples = []
        }
        stopLock.unlock()
        captureWorkItem?.cancel()
        inactivityWorkItem?.cancel()

        if wasSTTMode {
            capturedRequest?.endAudio()
            scheduleRecognitionFinalization(
                interfaceController: interfaceController
            )
        }
        else {
            cleanup(interfaceController: interfaceController)
            if wasCancelled {
                box?.resume(throwing: AutoPlayError.voiceInputCancelled)
            }
            else {
                box?.resume(returning: makePCMResult(from: capturedSamples))
            }
        }
    }

    private func failVoiceInput(
        _ error: Error,
        interfaceController: AutoPlayInterfaceController?
    ) {
        let failureState = stopLock.withLock {
            () -> (
                ResultBox,
                SFSpeechRecognitionTask?,
                DispatchWorkItem?
            )? in
            guard !isStopping, let resultBox else { return nil }

            isStopping = true
            let state = (
                resultBox,
                recognitionTask,
                recognitionFinalizationWorkItem
            )
            self.resultBox = nil
            samples = []
            recognitionTask = nil
            recognitionFinalizationWorkItem = nil
            latestPartialTranscript = nil
            isSTTMode = false
            return state
        }

        guard let failureState else { return }

        failureState.2?.cancel()
        failureState.1?.cancel()
        cleanup(interfaceController: interfaceController)
        failureState.0.resume(throwing: error)
    }

    // MARK: - Private

    private func startCapture(
        interfaceController: AutoPlayInterfaceController?,
        silenceThresholdMs: Double,
        maxDurationMs: Double,
        preferSpeechToText: Bool,
        onChunk: ((_ chunk: VoiceInputChunk) -> Void)?,
        language: String?
    ) throws {
        guard AVAudioSession.sharedInstance().recordPermission == .granted else {
            throw VoiceInputError.microphonePermissionDenied
        }

        guard stopLock.withLock({ !isStopping }) else {
            throw VoiceInputError.noActiveSession
        }
        var activeRecognitionRequest: SFSpeechAudioBufferRecognitionRequest? = nil

        if preferSpeechToText, SFSpeechRecognizer.authorizationStatus() == .authorized,
            let recognizer = language != nil
                ? SFSpeechRecognizer(locale: Locale(identifier: language!))
                : SFSpeechRecognizer(locale: Locale.current),
            recognizer.isAvailable
        {
            let request = SFSpeechAudioBufferRecognitionRequest()
            request.shouldReportPartialResults = true
            request.taskHint = .search
            activeRecognitionRequest = request
            stopLock.withLock {
                recognitionRequest = request
                isSTTMode = true
            }

            let task = recognizer.recognitionTask(with: request) { [weak self] result, error in
                guard let self else { return }

                if error != nil {
                    self.finishSpeechRecognition(
                        transcription: nil,
                        interfaceController: interfaceController
                    )
                    return
                }

                guard let result else { return }

                if result.isFinal {
                    self.finishSpeechRecognition(
                        transcription: result.bestTranscription.formattedString,
                        interfaceController: interfaceController
                    )
                }
                else {
                    let partialTranscript =
                        result.bestTranscription.formattedString
                    let trimmedPartialTranscript =
                        partialTranscript
                        .trimmingCharacters(in: .whitespacesAndNewlines)
                    let partialState = self.stopLock.withLock {
                        () -> (shouldEmit: Bool, activityGeneration: UInt?) in
                        guard self.resultBox != nil else { return (false, nil) }
                        let previousPartialTranscript = (self.latestPartialTranscript ?? "")
                            .trimmingCharacters(in: .whitespacesAndNewlines)
                        self.latestPartialTranscript = partialTranscript
                        let transcriptChanged =
                            !self.isStopping
                            && !trimmedPartialTranscript.isEmpty
                            && trimmedPartialTranscript != previousPartialTranscript
                        guard transcriptChanged else {
                            return (!self.isStopping, nil)
                        }

                        self.recognitionActivityGeneration &+= 1
                        return (!self.isStopping, self.recognitionActivityGeneration)
                    }
                    if partialState.shouldEmit {
                        onChunk?(
                            VoiceInputChunk(
                                partial: partialTranscript,
                                audio: nil
                            )
                        )
                    }
                    if let activityGeneration = partialState.activityGeneration {
                        self.scheduleRecognitionInactivityTimeout(
                            silenceThresholdMs: silenceThresholdMs,
                            interfaceController: interfaceController,
                            activityGeneration: activityGeneration
                        )
                    }
                }
            }

            let shouldRetainTask = stopLock.withLock {
                guard resultBox != nil else { return false }
                recognitionTask = task
                return true
            }
            if !shouldRetainTask {
                task.cancel()
            }
        }

        let engine = AVAudioEngine()
        let inputNode = engine.inputNode
        let nativeFormat = inputNode.outputFormat(forBus: 0)

        guard let converter = AVAudioConverter(from: nativeFormat, to: VoiceInputManager.targetFormat) else {
            throw VoiceInputError.converterUnavailable
        }

        stopLock.withLock {
            recordingStart = Date()
            silenceStart = nil
            firstBufferContinuation = nil
        }

        inputNode.installTap(
            onBus: 0,
            bufferSize: VoiceInputManager.tapBufferSize,
            format: nativeFormat
        ) { [weak self] buffer, _ in
            guard let self else { return }

            self.stopLock.lock()
            let stopping = self.isStopping
            let recordingStartSnapshot = self.recordingStart
            let firstBufferCont = self.firstBufferContinuation
            self.firstBufferContinuation = nil
            self.stopLock.unlock()

            firstBufferCont?.resume()

            guard !stopping else { return }

            let captureIsActive = self.stopLock.withLock {
                guard !self.isStopping else { return false }
                activeRecognitionRequest?.append(buffer)
                return true
            }
            guard captureIsActive else { return }

            // Convert to 16kHz int16 for accumulation and PCM chunks
            let outputFrameCapacity = AVAudioFrameCount(
                Double(buffer.frameLength) * VoiceInputManager.sampleRate / nativeFormat.sampleRate
            )
            guard
                let outputBuffer = AVAudioPCMBuffer(
                    pcmFormat: VoiceInputManager.targetFormat,
                    frameCapacity: outputFrameCapacity
                )
            else { return }

            var conversionError: NSError?
            let status = converter.convert(to: outputBuffer, error: &conversionError) { _, outStatus in
                outStatus.pointee = .haveData
                return buffer
            }
            guard status != .error, let int16Data = outputBuffer.int16ChannelData else { return }

            let frameCount = Int(outputBuffer.frameLength)
            let newSamples = Array(UnsafeBufferPointer(start: int16Data[0], count: frameCount))
            let samplesWereAppended = self.stopLock.withLock {
                guard !self.isStopping else { return false }
                self.samples.append(contentsOf: newSamples)
                return true
            }
            guard samplesWereAppended else { return }

            // PCM chunk callback
            if activeRecognitionRequest == nil, let onChunk {
                let pcmData = newSamples.withUnsafeBufferPointer { Data(buffer: $0) }
                if let chunkBuffer = try? ArrayBuffer.copy(data: self.encodeAudio(pcmData)) {
                    onChunk(VoiceInputChunk(partial: nil, audio: chunkBuffer))
                }
            }

            let now = Date()

            // PCM silence is amplitude-based. STT silence follows recognizer activity instead.
            if activeRecognitionRequest == nil,
                let start = recordingStartSnapshot,
                now.timeIntervalSince(start) * 1000 >= VoiceInputManager.warmupMs
            {
                let peak = newSamples.reduce(0) { max($0, abs(Int($1))) }
                // `silenceStart` is also cleared from cleanup() on another
                // thread, so the read-modify-write has to hold stopLock.
                let silenceElapsedMs = self.stopLock.withLock { () -> Double? in
                    guard peak < VoiceInputManager.silenceAmplitudeThreshold else {
                        self.silenceStart = nil
                        return nil
                    }

                    let silenceBegin = self.silenceStart ?? now
                    self.silenceStart = silenceBegin

                    return now.timeIntervalSince(silenceBegin) * 1000
                }

                if let silenceElapsedMs, silenceElapsedMs >= silenceThresholdMs {
                    self.triggerAutoStop(interfaceController: interfaceController)
                }
            }
        }

        stopLock.lock()
        guard !isStopping else {
            stopLock.unlock()
            inputNode.removeTap(onBus: 0)
            throw VoiceInputError.noActiveSession
        }

        do {
            try engine.start()
            audioEngine = engine
            stopLock.unlock()
        }
        catch {
            stopLock.unlock()
            inputNode.removeTap(onBus: 0)
            throw error
        }

        scheduleCaptureTimeout(
            maxDurationMs: maxDurationMs,
            interfaceController: interfaceController
        )
    }

    private func triggerAutoStop(interfaceController: AutoPlayInterfaceController?) {
        DispatchQueue.global(qos: .userInitiated).async {
            self.stop(interfaceController: interfaceController)
        }
    }

    private func scheduleCaptureTimeout(
        maxDurationMs: Double,
        interfaceController: AutoPlayInterfaceController?
    ) {
        let workItem = DispatchWorkItem { [weak self] in
            self?.stop(interfaceController: interfaceController)
        }

        let scheduleState = stopLock.withLock {
            () -> (shouldSchedule: Bool, previousWorkItem: DispatchWorkItem?) in
            guard resultBox != nil, !isStopping else {
                return (false, nil)
            }

            let previousWorkItem = captureTimeoutWorkItem
            captureTimeoutWorkItem = workItem
            return (true, previousWorkItem)
        }

        scheduleState.previousWorkItem?.cancel()
        guard scheduleState.shouldSchedule else { return }

        DispatchQueue.global(qos: .userInitiated).asyncAfter(
            deadline: .now() + max(maxDurationMs, 0) / 1_000,
            execute: workItem
        )
    }

    private func scheduleRecognitionInactivityTimeout(
        silenceThresholdMs: Double,
        interfaceController: AutoPlayInterfaceController?,
        activityGeneration: UInt
    ) {
        let workItem = DispatchWorkItem { [weak self] in
            self?.stop(
                interfaceController: interfaceController,
                expectedRecognitionActivityGeneration: activityGeneration
            )
        }

        let scheduleState = stopLock.withLock {
            () -> (shouldSchedule: Bool, previousWorkItem: DispatchWorkItem?) in
            guard resultBox != nil,
                !isStopping,
                activityGeneration == recognitionActivityGeneration
            else {
                return (false, nil)
            }

            let previousWorkItem = recognitionInactivityWorkItem
            recognitionInactivityWorkItem = workItem
            return (true, previousWorkItem)
        }

        scheduleState.previousWorkItem?.cancel()
        guard scheduleState.shouldSchedule else { return }

        DispatchQueue.global(qos: .userInitiated).asyncAfter(
            deadline: .now() + max(silenceThresholdMs, 0) / 1_000,
            execute: workItem
        )
    }

    private func scheduleRecognitionFinalization(
        interfaceController: AutoPlayInterfaceController?
    ) {
        let workItem = DispatchWorkItem { [weak self] in
            self?.finishSpeechRecognition(
                transcription: nil,
                interfaceController: interfaceController
            )
        }

        let shouldSchedule = stopLock.withLock {
            guard resultBox != nil else { return false }
            recognitionFinalizationWorkItem?.cancel()
            recognitionFinalizationWorkItem = workItem
            return true
        }

        guard shouldSchedule else { return }

        DispatchQueue.global(qos: .userInitiated).asyncAfter(
            deadline: .now()
                + VoiceInputManager.recognitionFinalizationTimeout,
            execute: workItem
        )
    }

    private func finishSpeechRecognition(
        transcription: String?,
        interfaceController: AutoPlayInterfaceController?
    ) {
        let resultState = stopLock.withLock {
            () -> (
                ResultBox,
                Bool,
                [Int16],
                String?,
                SFSpeechRecognitionTask?,
                DispatchWorkItem?
            )? in
            guard let resultBox else { return nil }

            isStopping = true
            let resolvedTranscript =
                transcription ?? latestPartialTranscript
            let state = (
                resultBox,
                cancelledByUser,
                samples,
                resolvedTranscript,
                recognitionTask,
                recognitionFinalizationWorkItem
            )

            self.resultBox = nil
            samples = []
            recognitionTask = nil
            recognitionFinalizationWorkItem = nil
            latestPartialTranscript = nil
            isSTTMode = false

            return state
        }

        guard let resultState else { return }

        resultState.5?.cancel()
        resultState.4?.cancel()
        cleanup(interfaceController: interfaceController)

        if resultState.1 {
            resultState.0.resume(
                throwing: AutoPlayError.voiceInputCancelled
            )
            return
        }

        let transcript = resultState.3?.trimmingCharacters(
            in: .whitespacesAndNewlines
        )
        if let transcript, !transcript.isEmpty {
            resultState.0.resume(
                returning: VoiceInputResult(
                    transcription: transcript,
                    audio: nil
                )
            )
            return
        }

        resultState.0.resume(
            returning: makePCMResult(from: resultState.2)
        )
    }

    private func cleanup(
        interfaceController suppliedInterfaceController:
            AutoPlayInterfaceController?
    ) {
        audioEngine?.inputNode.removeTap(onBus: 0)
        audioEngine?.stop()
        audioEngine = nil
        recognitionRequest = nil
        // Drain firstBufferContinuation so the template Task doesn't hang if stop() fired before the first buffer.
        let cleanupState = stopLock.withLock {
            () -> (
                CheckedContinuation<Void, Never>?,
                AutoPlayInterfaceController?,
                String?,
                DispatchWorkItem?,
                DispatchWorkItem?
            ) in
            recordingStart = nil
            silenceStart = nil
            let pendingContinuation = firstBufferContinuation
            firstBufferContinuation = nil
            let interfaceController =
                suppliedInterfaceController ?? activeInterfaceController
            activeInterfaceController = nil
            let voiceTemplateId = voiceControlTemplate?.id
            voiceControlTemplate = nil
            let captureWorkItem = captureTimeoutWorkItem
            captureTimeoutWorkItem = nil
            let inactivityWorkItem = recognitionInactivityWorkItem
            recognitionInactivityWorkItem = nil
            return (
                pendingContinuation,
                interfaceController,
                voiceTemplateId,
                captureWorkItem,
                inactivityWorkItem
            )
        }
        cleanupState.0?.resume()
        cleanupState.3?.cancel()
        cleanupState.4?.cancel()
        if let interfaceController = cleanupState.1,
            let voiceTemplateId = cleanupState.2
        {
            dismissVoiceTemplate(
                interfaceController: interfaceController,
                templateId: voiceTemplateId
            )
        }
    }

    private func makePCMResult(from samples: [Int16]) -> VoiceInputResult {
        let data = samples.withUnsafeBufferPointer { Data(buffer: $0) }
        let buffer = try? ArrayBuffer.copy(data: encodeAudio(data))
        return VoiceInputResult(transcription: nil, audio: buffer)
    }

    private func encodeAudio(_ pcm16le: Data) -> Data {
        switch encoding {
        case .linear16: return pcm16le
        case .mulaw: return G711.encodeUlaw(pcm16le)
        case .alaw: return G711.encodeAlaw(pcm16le)
        }
    }

    // CPVoiceControlState enforces a maximum image size of 150x150 points.
    private static let voiceImageMaxSize = CGSize(width: 150, height: 150)

    // CPVoiceControlState enforces a 0.3s–5s animation cycle; the 0.3s floor is system-applied, clamp only the ceiling.
    private static let maxVoiceImageCycleDuration: TimeInterval = 5.0

    // Uses Parser.decodeImage instead of RCTConvert to preserve animation frames for GIF/APNG/WebP.
    private func loadVoiceImage(image: Variant_GlyphImage_AssetImage_RemoteImage?, traitCollection: UITraitCollection)
        -> UIImage?
    {
        guard let image else { return nil }

        if let assetImage = image.assetImage {
            guard let url = URL(string: assetImage.uri),
                let data = try? Data(contentsOf: url),
                let uiImage = Parser.decodeImage(
                    data: data,
                    scale: CGFloat(assetImage.scale),
                    maxDuration: VoiceInputManager.maxVoiceImageCycleDuration
                )
            else { return nil }

            if uiImage.images != nil {
                return Parser.resizeAnimated(uiImage, max: VoiceInputManager.voiceImageMaxSize)
            }

            if assetImage.color == nil {
                return Parser.resize(uiImage, max: VoiceInputManager.voiceImageMaxSize)
            }

            guard let tinted = Parser.parseAssetImage(assetImage: assetImage, traitCollection: traitCollection) else {
                return nil
            }
            return Parser.resize(tinted, max: VoiceInputManager.voiceImageMaxSize)
        }

        if let glyphImage = image.glyphImage {
            return
                SymbolFont
                .imageFromGlyph(
                    glyphImage: glyphImage,
                    size: 150,  // according to docs on CPVoiceControlState.image
                    foregroundColor: glyphImage.color,
                    backgroundColor: glyphImage.backgroundColor,
                    fontScale: glyphImage.fontScale ?? 1.0,
                    traitCollection: traitCollection
                )
        }

        return nil
    }

    @MainActor
    private func presentVoiceTemplate(
        interfaceController: AutoPlayInterfaceController,
        listeningText: String,
        listeningImage: Variant_GlyphImage_AssetImage_RemoteImage?,
        listeningImageRepeats: Bool?
    ) async {
        let traitCollection = SceneStore.getRootTraitCollection() ?? UITraitCollection.current
        let image = loadVoiceImage(
            image: listeningImage,
            traitCollection: traitCollection
        )

        let repeats = listeningImageRepeats ?? (image?.images != nil)
        let listeningState = CPVoiceControlState(
            identifier: "listening",
            titleVariants: [listeningText],
            image: image,
            repeats: repeats
        )

        let voiceTemplate = VoiceInputTemplate(
            voiceControlStates: [listeningState],
            id: "voice-input-\(UUID().uuidString)"
        ) { [weak self] in
            guard let self else { return }
            self.stopLock.withLock {
                if !self.isStopping { self.cancelledByUser = true }
            }
            self.stop()
        }

        let shouldPresent = stopLock.withLock {
            guard !isStopping else { return false }
            voiceControlTemplate = voiceTemplate.template
            return true
        }

        guard shouldPresent else {
            try? RootModule.withTemplateStore { templateStore in
                templateStore.removeTemplate(templateId: voiceTemplate.template.id)
            }
            return
        }

        let wasPresented =
            (try? await interfaceController.presentTemplate(
                voiceTemplate.template,
                animated: true
            )) ?? false

        guard wasPresented else {
            let shouldFailVoiceInput = stopLock.withLock {
                if voiceControlTemplate?.id == voiceTemplate.template.id {
                    voiceControlTemplate = nil
                }
                return !isStopping
            }
            try? RootModule.withTemplateStore { templateStore in
                templateStore.removeTemplate(templateId: voiceTemplate.template.id)
            }
            if shouldFailVoiceInput {
                failVoiceInput(
                    VoiceInputError.voiceTemplatePresentationFailed,
                    interfaceController: interfaceController
                )
            }
            return
        }

        guard !stopLock.withLock({ isStopping }) else {
            dismissVoiceTemplate(
                interfaceController: interfaceController,
                templateId: voiceTemplate.template.id
            )
            return
        }

        voiceTemplate.template.activateVoiceControlState(withIdentifier: "listening")
    }

    private func dismissVoiceTemplate(
        interfaceController: AutoPlayInterfaceController,
        templateId: String
    ) {
        Task { @MainActor in
            if interfaceController.interfaceController.presentedTemplate?.id
                == templateId
            {
                try? await interfaceController.dismissTemplate(animated: true)
            }
        }
    }
}

enum VoiceInputError: Error {
    case microphonePermissionDenied
    case converterUnavailable
    case noActiveSession
    case voiceTemplatePresentationFailed
}
