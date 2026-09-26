"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchTemplate = void 0;
const react_native_nitro_modules_1 = require("react-native-nitro-modules");
const NitroAction_1 = require("../utils/NitroAction");
const NitroSection_1 = require("../utils/NitroSection");
const Template_1 = require("./Template");
const HybridSearchTemplate = react_native_nitro_modules_1.NitroModules.createHybridObject('SearchTemplate');
class SearchTemplate extends Template_1.Template {
    template = this;
    constructor(config) {
        super(config);
        const { headerActions, results, ...rest } = config;
        const nitroConfig = {
            ...rest,
            id: this.id,
            headerActions: NitroAction_1.NitroActionUtil.convert(this.template, headerActions),
            results: NitroSection_1.NitroSectionUtil.convert(this.template, results)?.at(0) ?? {
                items: [],
                type: 'default',
            },
        };
        HybridSearchTemplate.createSearchTemplate(nitroConfig);
    }
    updateSearchResults(results) {
        return HybridSearchTemplate.updateSearchResults(this.id, NitroSection_1.NitroSectionUtil.convert(this.template, results)?.at(0) ?? {
            items: [],
            type: 'default',
        });
    }
}
exports.SearchTemplate = SearchTemplate;
