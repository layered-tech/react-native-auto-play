"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridTemplate = void 0;
const react_native_1 = require("react-native");
const react_native_nitro_modules_1 = require("react-native-nitro-modules");
const NitroAction_1 = require("../utils/NitroAction");
const NitroGrid_1 = require("../utils/NitroGrid");
const NitroMapConfig_1 = require("../utils/NitroMapConfig");
const Template_1 = require("./Template");
const HybridGridTemplate = react_native_nitro_modules_1.NitroModules.createHybridObject('GridTemplate');
class GridTemplate extends Template_1.Template {
    template = this;
    constructor(config) {
        super(config);
        const { headerActions, buttons, mapConfig, ...rest } = config;
        if (__DEV__ &&
            react_native_1.Platform.OS === 'android' &&
            mapConfig != null &&
            rest.imageSize != null &&
            rest.imageSize !== 'unset') {
            console.warn('GridTemplate: imageSize is ignored on Android when mapConfig is set, a sized grid on the map crashes Android Auto (https://issuetracker.google.com/issues/572287914)');
        }
        const nitroConfig = {
            ...rest,
            id: this.id,
            headerActions: NitroAction_1.NitroActionUtil.convert(this.template, headerActions),
            buttons: NitroGrid_1.NitroGridUtil.convert(this.template, buttons),
            mapConfig: NitroMapConfig_1.NitroMapConfigUtil.convert(this.template, mapConfig),
            platform: NitroMapConfig_1.NitroMapConfigUtil.convertIos(this.template, mapConfig?.ios),
        };
        HybridGridTemplate.createGridTemplate(nitroConfig);
    }
    updateGrid(buttons) {
        return HybridGridTemplate.updateGridTemplateButtons(this.id, NitroGrid_1.NitroGridUtil.convert(this.template, buttons));
    }
}
exports.GridTemplate = GridTemplate;
