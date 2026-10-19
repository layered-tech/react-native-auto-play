import { Platform } from 'react-native';
import { NitroActionUtil } from './NitroAction';
import { NitroMapButton } from './NitroMapButton';
const convert = (template, mapConfig) => {
    if (mapConfig == null) {
        return undefined;
    }
    return {
        mapButtons: NitroMapButton.convert(template, mapConfig.mapButtons),
        headerActions: Platform.OS === 'android'
            ? NitroActionUtil.convert(template, mapConfig.android?.headerActions)
            : undefined,
    };
};
/**
 * converts `mapConfig.ios`, native still calls these the panel options since `mapConfig` renders
 * as a CPMapPanel on iOS
 */
const convertIos = (template, ios) => {
    if (Platform.OS !== 'ios' || ios == null) {
        return undefined;
    }
    const { showCloseButton, primaryAction, secondaryAction } = ios;
    return {
        showsPanelCloseButton: showCloseButton,
        panelButtonConfiguration: primaryAction
            ? NitroActionUtil.convert(template, secondaryAction ? [primaryAction, secondaryAction] : [primaryAction])
            : undefined,
    };
};
export const NitroMapConfigUtil = { convert, convertIos };
