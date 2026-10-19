import { NitroModules } from 'react-native-nitro-modules';
import { NitroActionUtil } from '../utils/NitroAction';
import { NitroSectionUtil } from '../utils/NitroSection';
import { Template, } from './Template';
const HybridSearchTemplate = NitroModules.createHybridObject('SearchTemplate');
export class SearchTemplate extends Template {
    template = this;
    constructor(config) {
        super(config);
        const { headerActions, results, ...rest } = config;
        const nitroConfig = {
            ...rest,
            id: this.id,
            headerActions: NitroActionUtil.convert(this.template, headerActions),
            results: NitroSectionUtil.convert(this.template, results)?.at(0) ?? {
                items: [],
                type: 'default',
            },
        };
        HybridSearchTemplate.createSearchTemplate(nitroConfig);
    }
    updateSearchResults(results) {
        return HybridSearchTemplate.updateSearchResults(this.id, NitroSectionUtil.convert(this.template, results)?.at(0) ?? {
            items: [],
            type: 'default',
        });
    }
}
