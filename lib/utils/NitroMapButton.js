import { Platform } from 'react-native';
import { NitroImageUtil } from './NitroImage';
const convert = (template, mapButtons) => {
    if (mapButtons == null) {
        return undefined;
    }
    return mapButtons?.map((button) => {
        const { type } = button;
        const onPress = button.type === 'custom' ? () => button.onPress(template) : undefined;
        if (button.image.type === 'glyph') {
            const backgroundColor = Platform.OS === 'android'
                ? 'transparent'
                : 'backgroundColor' in button.image
                    ? button.image.backgroundColor
                    : 'transparent';
            const fontScale = button.image.fontScale ?? (Platform.OS === 'android' ? 1.0 : 0.65);
            return {
                type,
                onPress,
                image: NitroImageUtil.convert({ ...button.image, backgroundColor, fontScale }),
            };
        }
        return {
            type,
            onPress,
            image: NitroImageUtil.convert(button.image),
        };
    });
};
export const NitroMapButton = { convert };
