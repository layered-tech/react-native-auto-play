import { jsx as _jsx } from "react/jsx-runtime";
import { createContext } from 'react';
export const MapTemplateContext = createContext(null);
export function MapTemplateProvider({ children, mapTemplate, }) {
    return _jsx(MapTemplateContext.Provider, { value: mapTemplate, children: children });
}
