"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NitroMapConfigUtil = void 0;
const react_native_1 = require("react-native");
const NitroAction_1 = require("./NitroAction");
const NitroMapButton_1 = require("./NitroMapButton");
const convert = (template, mapConfig) => {
    if (mapConfig == null) {
        return undefined;
    }
    return {
        mapButtons: NitroMapButton_1.NitroMapButton.convert(template, mapConfig.mapButtons),
        headerActions: react_native_1.Platform.OS === 'android'
            ? NitroAction_1.NitroActionUtil.convert(template, mapConfig.android?.headerActions)
            : undefined,
    };
};
/**
 * converts `mapConfig.ios`, native still calls these the panel options since `mapConfig` renders
 * as a CPMapPanel on iOS
 */
const convertIos = (template, ios) => {
    if (react_native_1.Platform.OS !== 'ios' || ios == null) {
        return undefined;
    }
    const { showCloseButton, primaryAction, secondaryAction } = ios;
    return {
        showsPanelCloseButton: showCloseButton,
        panelButtonConfiguration: primaryAction
            ? NitroAction_1.NitroActionUtil.convert(template, secondaryAction ? [primaryAction, secondaryAction] : [primaryAction])
            : undefined,
    };
};
exports.NitroMapConfigUtil = { convert, convertIos };
