import AVFoundation
import NitroModules
import Speech

class HybridVoice: HybridVoiceSpec {
    private let voiceInputLock = NSLock()
    private var voiceInputManager: VoiceInputManager?

    func hasVoiceInputPermission() throws -> Bool {
        let micGranted = AVAudioSession.sharedInstance().recordPermission == .granted
        let speechGranted = SFSpeechRecognizer.authorizationStatus() == .authorized
        return micGranted && speechGranted
    }

    func requestVoiceInputPermission() throws -> Promise<Bool> {
        return Promise.async {
            let micGranted = await withCheckedContinuation { cont in
                AVAudioSession.sharedInstance().requestRecordPermission { granted in
                    cont.resume(returning: granted)
                }
            }
            guard micGranted else { return false }

            return await withCheckedContinuation { cont in
                SFSpeechRecognizer.requestAuthorization { status in
                    cont.resume(returning: status == .authorized)
                }
            }
        }
    }

    func startVoiceInput(
        silenceThresholdMs: Double?,
        maxDurationMs: Double?,
        listeningText: String?,
        listeningImage: Variant_GlyphImage_AssetImage_RemoteImage?,
        listeningImageRepeats: Bool?,
        preferSpeechToText: Bool?,
        onChunk: ((_ chunk: VoiceInputChunk) -> Void)?,
        language: String?,
        startSoundUri: String?,
        endSoundUri: String?,
        encoding: VoiceAudioEncoding?
    ) throws -> Promise<VoiceInputResult> {
        let manager = VoiceInputManager()
        let previousManager = swapVoiceInputManager(manager)
        previousManager?.stop()

        return Promise.async {
            defer {
                self.clearVoiceInputManager(ifCurrent: manager)
            }

            guard self.voiceInputManagerIsCurrent(manager) else {
                throw VoiceInputError.noActiveSession
            }

            let interfaceController = try? await RootModule.withInterfaceController { $0 }

            guard self.voiceInputManagerIsCurrent(manager) else {
                throw VoiceInputError.noActiveSession
            }

            return try await manager.start(
                interfaceController: interfaceController,
                silenceThresholdMs: silenceThresholdMs ?? 1_500,
                maxDurationMs: maxDurationMs ?? 10_000,
                listeningText: listeningText ?? "Listening...",
                listeningImage: listeningImage,
                listeningImageRepeats: listeningImageRepeats,
                preferSpeechToText: preferSpeechToText ?? false,
                onChunk: onChunk,
                language: language,
                startSoundUri: startSoundUri,
                endSoundUri: endSoundUri,
                encoding: encoding ?? .linear16
            )
        }
    }

    func stopVoiceInput() throws {
        swapVoiceInputManager(nil)?.stop()
    }

    private func swapVoiceInputManager(
        _ manager: VoiceInputManager?
    ) -> VoiceInputManager? {
        voiceInputLock.lock()
        let previousManager = voiceInputManager
        voiceInputManager = manager
        voiceInputLock.unlock()
        return previousManager
    }

    private func clearVoiceInputManager(
        ifCurrent manager: VoiceInputManager
    ) {
        voiceInputLock.lock()
        if voiceInputManager === manager {
            voiceInputManager = nil
        }
        voiceInputLock.unlock()
    }

    private func voiceInputManagerIsCurrent(
        _ manager: VoiceInputManager
    ) -> Bool {
        voiceInputLock.lock()
        let isCurrent = voiceInputManager === manager
        voiceInputLock.unlock()
        return isCurrent
    }
}
