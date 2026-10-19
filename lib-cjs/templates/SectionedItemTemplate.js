"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectionedItemTemplate = void 0;
const react_native_nitro_modules_1 = require("react-native-nitro-modules");
const NitroAction_1 = require("../utils/NitroAction");
const NitroGrid_1 = require("../utils/NitroGrid");
const NitroMapConfig_1 = require("../utils/NitroMapConfig");
const NitroSection_1 = require("../utils/NitroSection");
const Template_1 = require("./Template");
const HybridSectionedItemTemplate = react_native_nitro_modules_1.NitroModules.createHybridObject('SectionedItemTemplate');
const convertSections = (template, sections) => {
    // empty sections are dropped, Android's ListTemplate fallback rejects them
    const filledSections = sections?.filter((section) => section.type === 'grid' ? section.buttons.length > 0 : section.items.length > 0);
    return filledSections?.map((section) => {
        if (section.type === 'grid') {
            return {
                title: section.title,
                buttons: NitroGrid_1.NitroGridUtil.convert(template, section.buttons),
            };
        }
        const [nitroSection] = NitroSection_1.NitroSectionUtil.convert(template, [section]) ?? [];
        if (nitroSection == null) {
            throw new Error('converting sections failed');
        }
        return nitroSection;
    });
};
class SectionedItemTemplate extends Template_1.Template {
    template = this;
    constructor(config) {
        super(config);
        const { headerActions, mapConfig, sections, ...rest } = config;
        const nitroConfig = {
            ...rest,
            id: this.id,
            headerActions: NitroAction_1.NitroActionUtil.convert(this.template, headerActions),
            sections: convertSections(this.template, sections),
            mapConfig: NitroMapConfig_1.NitroMapConfigUtil.convert(this.template, mapConfig),
            platform: NitroMapConfig_1.NitroMapConfigUtil.convertIos(this.template, mapConfig?.ios),
        };
        HybridSectionedItemTemplate.createSectionedItemTemplate(nitroConfig);
    }
    updateSections(sections) {
        return HybridSectionedItemTemplate.updateSectionedItemTemplateSections(this.id, convertSections(this.template, sections));
    }
}
exports.SectionedItemTemplate = SectionedItemTemplate;
