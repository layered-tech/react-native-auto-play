import { NitroImageUtil } from './NitroImage';
const convert = (template, buttons) => {
    return buttons.map((button) => ({
        title: button.title ?? { text: '' },
        image: NitroImageUtil.convert(button.image),
        onPress: () => button.onPress(template),
    }));
};
export const NitroGridUtil = { convert };
