import { NitroModules } from 'react-native-nitro-modules';
import { NitroActionUtil } from '../utils/NitroAction';
import { NitroMapConfigUtil } from '../utils/NitroMapConfig';
import { NitroSectionUtil } from '../utils/NitroSection';
import { Template, } from './Template';
const HybridListTemplate = NitroModules.createHybridObject('ListTemplate');
export class ListTemplate extends Template {
    template = this;
    constructor(config) {
        super(config);
        const { headerActions, mapConfig, sections, ...rest } = config;
        const nitroConfig = {
            ...rest,
            id: this.id,
            headerActions: NitroActionUtil.convert(this.template, headerActions),
            sections: NitroSectionUtil.convert(this.template, sections),
            mapConfig: NitroMapConfigUtil.convert(this.template, mapConfig),
            platform: NitroMapConfigUtil.convertIos(this.template, mapConfig?.ios),
        };
        HybridListTemplate.createListTemplate(nitroConfig);
    }
    updateSections(sections) {
        return HybridListTemplate.updateListTemplateSections(this.id, NitroSectionUtil.convert(this.template, sections));
    }
}
