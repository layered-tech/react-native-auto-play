"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapTemplateContext = void 0;
exports.MapTemplateProvider = MapTemplateProvider;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
exports.MapTemplateContext = (0, react_1.createContext)(null);
function MapTemplateProvider({ children, mapTemplate, }) {
    return (0, jsx_runtime_1.jsx)(exports.MapTemplateContext.Provider, { value: mapTemplate, children: children });
}
