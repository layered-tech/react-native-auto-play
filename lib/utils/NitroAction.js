import { Platform } from 'react-native';
import { NitroImageUtil } from './NitroImage';
const getImage = (action) => {
    if (action.type === 'text') {
        return undefined;
    }
    if (action.image.type === 'glyph' && action.image.fontScale == null) {
        action.image.fontScale = Platform.OS === 'android' ? 1.0 : 0.8;
    }
    return NitroImageUtil.convert(action.image);
};
const getTitle = (action) => {
    if (action.type === 'image') {
        return undefined;
    }
    return action.title;
};
// appIcon can not be pressed but we wanna have a non-optional onPress on native side
const getAppIconAction = (alignment) => ({
    type: 'appIcon',
    onPress: () => null,
    alignment,
});
const convertToNitro = (template, action, alignment) => {
    const { type } = action;
    if (type === 'appIcon') {
        return getAppIconAction(alignment);
    }
    const { onPress } = action;
    if (type === 'back') {
        return { type, onPress: () => onPress(template), alignment };
    }
    const { enabled, flags, style } = action;
    const title = getTitle(action);
    const image = getImage(action);
    return {
        onPress: () => onPress(template),
        type: 'custom',
        enabled,
        flags,
        image,
        title,
        alignment,
        style,
    };
};
const convertActionButtons = (template, actions) => {
    return actions?.map((action) => convertToNitro(template, action, undefined));
};
function convertIos(template, actions) {
    if (actions == null) {
        return undefined;
    }
    const nitroActions = [];
    if (actions.backButton != null) {
        nitroActions.push({
            type: 'back',
            onPress: () => actions.backButton?.onPress(template),
            alignment: undefined,
        });
    }
    if (actions.leadingNavigationBarButtons != null) {
        for (const button of actions.leadingNavigationBarButtons) {
            const { onPress, enabled } = button;
            const image = getImage(button);
            const title = getTitle(button);
            nitroActions.push({
                type: 'custom',
                enabled,
                image,
                onPress: () => onPress(template),
                title,
                alignment: 'leading',
            });
        }
    }
    if (actions.trailingNavigationBarButtons) {
        for (const button of actions.trailingNavigationBarButtons) {
            const { onPress, enabled } = button;
            const image = getImage(button);
            const title = getTitle(button);
            nitroActions.push({
                type: 'custom',
                enabled,
                image,
                onPress: () => onPress(template),
                title,
                alignment: 'trailing',
            });
        }
    }
    return nitroActions;
}
function convertAndroid(template, actions) {
    if (actions == null) {
        return undefined;
    }
    if (Array.isArray(actions)) {
        return convertActionButtons(template, actions);
    }
    const nitroActions = [];
    const { startHeaderAction, endHeaderActions = [] } = actions;
    if (startHeaderAction != null) {
        const action = startHeaderAction.type === 'appIcon'
            ? getAppIconAction('leading')
            : {
                ...startHeaderAction,
                alignment: 'leading',
                onPress: () => startHeaderAction.onPress(template),
            };
        nitroActions.push(action);
    }
    for (const action of endHeaderActions) {
        nitroActions.push(convertToNitro(template, action, 'trailing'));
    }
    return nitroActions;
}
function convert(template, actions) {
    if (Array.isArray(actions)) {
        return convertActionButtons(template, actions);
    }
    return Platform.OS === 'android'
        ? convertAndroid(template, actions?.android)
        : convertIos(template, actions?.ios);
}
export const NitroActionUtil = { convert };
