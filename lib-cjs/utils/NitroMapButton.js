"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NitroMapButton = void 0;
const react_native_1 = require("react-native");
const NitroImage_1 = require("./NitroImage");
const convert = (template, mapButtons) => {
    if (mapButtons == null) {
        return undefined;
    }
    return mapButtons?.map((button) => {
        const { type } = button;
        const onPress = button.type === 'custom' ? () => button.onPress(template) : undefined;
        if (button.image.type === 'glyph') {
            const backgroundColor = react_native_1.Platform.OS === 'android'
                ? 'transparent'
                : 'backgroundColor' in button.image
                    ? button.image.backgroundColor
                    : 'transparent';
            const fontScale = button.image.fontScale ?? (react_native_1.Platform.OS === 'android' ? 1.0 : 0.65);
            return {
                type,
                onPress,
                image: NitroImage_1.NitroImageUtil.convert({ ...button.image, backgroundColor, fontScale }),
            };
        }
        return {
            type,
            onPress,
            image: NitroImage_1.NitroImageUtil.convert(button.image),
        };
    });
};
exports.NitroMapButton = { convert };
