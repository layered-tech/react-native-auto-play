import { Platform } from 'react-native';
import { NitroModules } from 'react-native-nitro-modules';
import { NitroActionUtil } from '../utils/NitroAction';
import { NitroMapConfigUtil } from '../utils/NitroMapConfig';
import { NitroSectionUtil } from '../utils/NitroSection';
import { Template, } from './Template';
const HybridInformationTemplate = NitroModules.createHybridObject('InformationTemplate');
export class InformationTemplate extends Template {
    template = this;
    constructor(config) {
        super(config);
        const { headerActions, mapConfig, items, actions, ...rest } = config;
        const platformActions = Platform.OS === 'android'
            ? NitroActionUtil.convert(this.template, actions?.android)
            : NitroActionUtil.convert(this.template, actions?.ios);
        const section = this.getSection(items);
        const nitroConfig = {
            ...rest,
            id: this.id,
            headerActions: NitroActionUtil.convert(this.template, headerActions),
            actions: platformActions,
            section: NitroSectionUtil.convert(this.template, section)?.at(0) ?? {
                items: [],
                type: 'default',
            },
            mapConfig: NitroMapConfigUtil.convert(this.template, mapConfig),
            platform: NitroMapConfigUtil.convertIos(this.template, mapConfig?.ios),
        };
        HybridInformationTemplate.createInformationTemplate(nitroConfig);
    }
    updateItems(items) {
        const section = this.getSection(items);
        return HybridInformationTemplate.updateInformationTemplateSections(this.id, NitroSectionUtil.convert(this.template, section)?.at(0) ?? { items: [], type: 'default' });
    }
    getSection(items) {
        return {
            type: 'default',
            items: items ?? [],
        };
    }
}
