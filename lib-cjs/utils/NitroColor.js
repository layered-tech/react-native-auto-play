"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NitroColorUtil = void 0;
const react_native_1 = require("react-native");
const DefaultNitroColor = {
    darkColor: convertColor('white'),
    lightColor: convertColor('black'),
    isDefault: true,
};
function convertColor(color) {
    // since we accept only string it can return a number only
    return (0, react_native_1.processColor)(color);
}
function convert(color) {
    if (color == null) {
        return undefined;
    }
    if (typeof color === 'string') {
        if (color === 'default') {
            return DefaultNitroColor;
        }
        const convertedColor = convertColor(color);
        return { darkColor: convertedColor, lightColor: convertedColor };
    }
    const darkColor = convertColor(color.darkColor);
    const lightColor = convertColor(color.lightColor);
    return {
        darkColor,
        lightColor,
    };
}
exports.NitroColorUtil = { convert };
