"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMapTemplate = void 0;
const react_1 = require("react");
const MapTemplateContext_1 = require("../components/MapTemplateContext");
/**
 * provides access to the map template
 * obviously this works only on the map template component and its children
 */
const useMapTemplate = () => {
    return (0, react_1.useContext)(MapTemplateContext_1.MapTemplateContext);
};
exports.useMapTemplate = useMapTemplate;
