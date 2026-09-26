"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListTemplate = void 0;
const react_native_nitro_modules_1 = require("react-native-nitro-modules");
const NitroAction_1 = require("../utils/NitroAction");
const NitroMapButton_1 = require("../utils/NitroMapButton");
const NitroSection_1 = require("../utils/NitroSection");
const Template_1 = require("./Template");
const HybridListTemplate = react_native_nitro_modules_1.NitroModules.createHybridObject('ListTemplate');
class ListTemplate extends Template_1.Template {
    template = this;
    constructor(config) {
        super(config);
        const { headerActions, mapConfig, sections, ...rest } = config;
        const nitroConfig = {
            ...rest,
            id: this.id,
            headerActions: NitroAction_1.NitroActionUtil.convert(this.template, headerActions),
            sections: NitroSection_1.NitroSectionUtil.convert(this.template, sections),
            mapConfig: mapConfig
                ? {
                    mapButtons: NitroMapButton_1.NitroMapButton.convert(this.template, mapConfig.mapButtons),
                    headerActions: NitroAction_1.NitroActionUtil.convert(this.template, mapConfig.headerActions),
                }
                : undefined,
        };
        HybridListTemplate.createListTemplate(nitroConfig);
    }
    updateSections(sections) {
        return HybridListTemplate.updateListTemplateSections(this.id, NitroSection_1.NitroSectionUtil.convert(this.template, sections));
    }
}
exports.ListTemplate = ListTemplate;
