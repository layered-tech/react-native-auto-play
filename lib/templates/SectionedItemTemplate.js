import { NitroModules } from 'react-native-nitro-modules';
import { NitroActionUtil } from '../utils/NitroAction';
import { NitroGridUtil } from '../utils/NitroGrid';
import { NitroMapConfigUtil } from '../utils/NitroMapConfig';
import { NitroSectionUtil, } from '../utils/NitroSection';
import { Template, } from './Template';
const HybridSectionedItemTemplate = NitroModules.createHybridObject('SectionedItemTemplate');
const convertSections = (template, sections) => {
    // empty sections are dropped, Android's ListTemplate fallback rejects them
    const filledSections = sections?.filter((section) => section.type === 'grid' ? section.buttons.length > 0 : section.items.length > 0);
    return filledSections?.map((section) => {
        if (section.type === 'grid') {
            return {
                title: section.title,
                buttons: NitroGridUtil.convert(template, section.buttons),
            };
        }
        const [nitroSection] = NitroSectionUtil.convert(template, [section]) ?? [];
        if (nitroSection == null) {
            throw new Error('converting sections failed');
        }
        return nitroSection;
    });
};
export class SectionedItemTemplate extends Template {
    template = this;
    constructor(config) {
        super(config);
        const { headerActions, mapConfig, sections, ...rest } = config;
        const nitroConfig = {
            ...rest,
            id: this.id,
            headerActions: NitroActionUtil.convert(this.template, headerActions),
            sections: convertSections(this.template, sections),
            mapConfig: NitroMapConfigUtil.convert(this.template, mapConfig),
            platform: NitroMapConfigUtil.convertIos(this.template, mapConfig?.ios),
        };
        HybridSectionedItemTemplate.createSectionedItemTemplate(nitroConfig);
    }
    updateSections(sections) {
        return HybridSectionedItemTemplate.updateSectionedItemTemplateSections(this.id, convertSections(this.template, sections));
    }
}
