"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafeAreaInsetsContext = void 0;
exports.SafeAreaInsetsProvider = SafeAreaInsetsProvider;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const HybridAutoPlay_1 = require("../hybrid/HybridAutoPlay");
const DEFAULT = { top: 0, bottom: 0, left: 0, right: 0 };
exports.SafeAreaInsetsContext = (0, react_1.createContext)(DEFAULT);
function SafeAreaInsetsProvider({ children, moduleName, }) {
    const [insets, setInsets] = (0, react_1.useState)(DEFAULT);
    (0, react_1.useEffect)(() => {
        const removeSafeAreaInsetsListener = HybridAutoPlay_1.HybridAutoPlay.addSafeAreaInsetsListener(moduleName, (safeAreaInsets) => {
            setInsets(safeAreaInsets);
        });
        return () => {
            removeSafeAreaInsetsListener();
        };
    }, [moduleName]);
    return (0, jsx_runtime_1.jsx)(exports.SafeAreaInsetsContext.Provider, { value: insets, children: children });
}
