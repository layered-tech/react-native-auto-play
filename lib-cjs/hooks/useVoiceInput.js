"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useVoiceInput = void 0;
const react_1 = require("react");
const HybridAutoPlay_1 = require("../hybrid/HybridAutoPlay");
const useVoiceInput = () => {
    const [isConnected, setIsConnected] = (0, react_1.useState)(false);
    const [voiceInputResult, setVoiceInputResult] = (0, react_1.useState)();
    /**
     * Resets the voice input result to undefined. This is useful when you want to clear the voice input result after processing it.
     */
    const resetVoiceInputResult = (0, react_1.useCallback)(() => {
        setVoiceInputResult(undefined);
    }, []);
    (0, react_1.useEffect)(() => {
        const removeDidConnect = HybridAutoPlay_1.HybridAutoPlay.addListener('didConnect', () => setIsConnected(true));
        const removeDidDisconnect = HybridAutoPlay_1.HybridAutoPlay.addListener('didDisconnect', () => setIsConnected(false));
        setIsConnected(HybridAutoPlay_1.HybridAutoPlay.isConnected());
        return () => {
            removeDidConnect();
            removeDidDisconnect();
        };
    }, []);
    (0, react_1.useEffect)(() => {
        if (!isConnected) {
            return;
        }
        const remove = HybridAutoPlay_1.HybridAutoPlay.addListenerVoiceInput((coordinates, query, requestType) => {
            setVoiceInputResult({ coordinates, query, requestType });
        });
        return () => {
            remove();
        };
    }, [isConnected]);
    return { voiceInputResult, resetVoiceInputResult };
};
exports.useVoiceInput = useVoiceInput;
