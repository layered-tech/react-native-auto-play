import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useEffect, useState } from 'react';
import { HybridAutoPlay } from '../hybrid/HybridAutoPlay';
const DEFAULT = { top: 0, bottom: 0, left: 0, right: 0 };
export const SafeAreaInsetsContext = createContext(DEFAULT);
export function SafeAreaInsetsProvider({ children, moduleName, }) {
    const [insets, setInsets] = useState(DEFAULT);
    useEffect(() => {
        const removeSafeAreaInsetsListener = HybridAutoPlay.addSafeAreaInsetsListener(moduleName, (safeAreaInsets) => {
            setInsets(safeAreaInsets);
        });
        return () => {
            removeSafeAreaInsetsListener();
        };
    }, [moduleName]);
    return _jsx(SafeAreaInsetsContext.Provider, { value: insets, children: children });
}
