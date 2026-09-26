"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFocusedEffect = useFocusedEffect;
const react_1 = require("react");
const HybridAutoPlay_1 = require("../hybrid/HybridAutoPlay");
/**
 * An effect hook that only runs when the CarPlay/Android Auto screen is visible to the user and dependencies have changed.
 * It behaves like `useEffect`, but the effect function is only executed if the screen is visible.
 *
 * @param moduleName The name of the root module to listen to for focus changes - one of AutoPlayModules or a cluster uuid.
 * @param effect The effect function to run.
 * @param deps An array of dependencies for the effect.
 */
function useFocusedEffect(moduleName, effect, deps) {
    const [isFocused, setIsFocused] = (0, react_1.useState)(false);
    const effectRef = (0, react_1.useRef)(effect);
    (0, react_1.useEffect)(() => {
        effectRef.current = effect;
    }, [effect]);
    (0, react_1.useEffect)(() => {
        return HybridAutoPlay_1.HybridAutoPlay.addListenerRenderState(moduleName, (state) => {
            if (state === 'willAppear' || state === 'willDisappear') {
                // react on actual visibility changes only
                return;
            }
            setIsFocused(state === 'didAppear');
        });
    }, [moduleName]);
    (0, react_1.useEffect)(() => {
        if (!isFocused) {
            return;
        }
        return effectRef.current();
    }, [isFocused, ...deps]);
}
