"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindowInformationWrapper = WindowInformationWrapper;
const react_1 = require("react");
const HybridAndroidWindowInformation_1 = require("../hybrid/HybridAndroidWindowInformation");
/**
 * Renders a user-provided root component and keeps its `window` prop up to date when the host
 * recreates the render surface with new dimensions (some head units run Android Auto windowed
 * and resize it at runtime), so consumers can simply read `props.window` without registering a
 * listener themselves.
 * On iOS this only passes the initial props through — CarPlay windows keep their size for the
 * lifetime of a scene, so there is nothing to subscribe to.
 */
function WindowInformationWrapper({ moduleName, component, componentProps, }) {
    const [window, setWindow] = (0, react_1.useState)(componentProps.window);
    (0, react_1.useEffect)(() => {
        return HybridAndroidWindowInformation_1.HybridAndroidWindowInformation?.addWindowInformationListener(moduleName, setWindow);
    }, [moduleName]);
    return (0, react_1.createElement)(component, { ...componentProps, window });
}
