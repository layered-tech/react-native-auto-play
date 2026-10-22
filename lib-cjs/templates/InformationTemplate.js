"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InformationTemplate = void 0;
const react_native_1 = require("react-native");
const react_native_nitro_modules_1 = require("react-native-nitro-modules");
const NitroAction_1 = require("../utils/NitroAction");
const NitroMapConfig_1 = require("../utils/NitroMapConfig");
const NitroSection_1 = require("../utils/NitroSection");
const Template_1 = require("./Template");
const HybridInformationTemplate = react_native_nitro_modules_1.NitroModules.createHybridObject('InformationTemplate');
class InformationTemplate extends Template_1.Template {
    template = this;
    constructor(config) {
        super(config);
        const { headerActions, mapConfig, items, actions, ...rest } = config;
        const platformActions = react_native_1.Platform.OS === 'android'
            ? NitroAction_1.NitroActionUtil.convert(this.template, actions?.android)
            : NitroAction_1.NitroActionUtil.convert(this.template, actions?.ios);
        const section = this.getSection(items);
        const nitroConfig = {
            ...rest,
            id: this.id,
            headerActions: NitroAction_1.NitroActionUtil.convert(this.template, headerActions),
            actions: platformActions,
            section: NitroSection_1.NitroSectionUtil.convert(this.template, section)?.at(0) ?? {
                items: [],
                type: 'default',
            },
            mapConfig: NitroMapConfig_1.NitroMapConfigUtil.convert(this.template, mapConfig),
            platform: NitroMapConfig_1.NitroMapConfigUtil.convertIos(this.template, mapConfig?.ios),
        };
        HybridInformationTemplate.createInformationTemplate(nitroConfig);
    }
    updateItems(items) {
        const section = this.getSection(items);
        return HybridInformationTemplate.updateInformationTemplateSections(this.id, NitroSection_1.NitroSectionUtil.convert(this.template, section)?.at(0) ?? { items: [], type: 'default' });
    }
    getSection(items) {
        return {
            type: 'default',
            items: items ?? [],
        };
    }
}
exports.InformationTemplate = InformationTemplate;
