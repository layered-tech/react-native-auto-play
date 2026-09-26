"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HybridVoice = void 0;
const react_native_1 = require("react-native");
const react_native_nitro_modules_1 = require("react-native-nitro-modules");
const NitroImage_1 = require("../utils/NitroImage");
const _native = react_native_nitro_modules_1.NitroModules.createHybridObject('Voice');
const startVoiceInput = async (options) => {
    const { onChunk, silenceThresholdMs, maxDurationMs, listeningText, listeningImage, preferSpeechToText, language, startSound, endSound, encoding, } = options ?? {};
    const listeningImageRepeats = listeningImage?.type === 'asset' ? listeningImage.repeats : undefined;
    const startSoundUri = startSound != null ? react_native_1.Image.resolveAssetSource(startSound)?.uri : undefined;
    const endSoundUri = endSound != null ? react_native_1.Image.resolveAssetSource(endSound)?.uri : undefined;
    return await _native.startVoiceInput(silenceThresholdMs, maxDurationMs, listeningText, NitroImage_1.NitroImageUtil.convert(listeningImage), listeningImageRepeats, preferSpeechToText, onChunk, language, startSoundUri, endSoundUri, encoding);
};
exports.HybridVoice = {
    /**
     * Returns true if all permissions required for voice input are granted.
     * On iOS: checks both microphone and speech recognition authorization.
     * On Android: checks RECORD_AUDIO permission.
     */
    hasVoiceInputPermission: () => _native.hasVoiceInputPermission(),
    /**
     * Request all permissions required for voice input.
     * On iOS: requests microphone permission then speech recognition authorization.
     * On Android: requests RECORD_AUDIO via car context when connected, otherwise
     * via the React Native application context.
     * Returns true only if all required permissions were granted.
     */
    requestVoiceInputPermission: () => _native.requestVoiceInputPermission(),
    /**
     * Start an in-app voice session.
     *
     * When preferSpeechToText is true:
     *   iOS — streams audio buffers into SFSpeechRecognizer during recording;
     *          onChunk fires with partial transcription results; resolves with
     *          { transcription } or falls back to { audio } if unavailable.
     *   Android — checks SpeechRecognizer availability upfront; if available it
     *              owns the mic and streams partial results via onChunk; if not
     *              available falls back to PCM recording.
     *
     * When preferSpeechToText is false (default):
     *   Both platforms record raw PCM; onChunk fires with audio chunks;
     *   resolves with { audio }.
     *
     * @param silenceThresholdMs  ms of silence before auto-stop (default 1500)
     * @param maxDurationMs       hard cap on recording duration (default 10000)
     * @param listeningText       iOS only — text shown on CPVoiceControlTemplate
     * @param preferSpeechToText  request STT transcription instead of raw PCM
     * @param onChunk             optional streaming callback
     * @param language            specify the language for the SpeechRecognizer, falls back to system language if not set
     * @param encoding            PCM encoding for onChunk audio and the final result (default LINEAR16)
     */
    startVoiceInput,
    /**
     * Stop the active voice session early.
     * For PCM mode: resolves startVoiceInput with audio captured so far.
     * For STT mode: finalises the recognition request.
     * No-op if no session is active.
     */
    stopVoiceInput: () => _native.stopVoiceInput(),
};
