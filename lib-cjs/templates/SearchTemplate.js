"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchTemplate = void 0;
const react_native_nitro_modules_1 = require("react-native-nitro-modules");
const HybridAutoPlay_1 = require("../hybrid/HybridAutoPlay");
const NitroAction_1 = require("../utils/NitroAction");
const NitroMapConfig_1 = require("../utils/NitroMapConfig");
const NitroSection_1 = require("../utils/NitroSection");
const Template_1 = require("./Template");
const HybridSearchTemplate = react_native_nitro_modules_1.NitroModules.createHybridObject('SearchTemplate');
const HybridListTemplate = react_native_nitro_modules_1.NitroModules.createHybridObject('ListTemplate');
class SearchTemplate extends Template_1.Template {
    template = this;
    config;
    results;
    submittedResultsId;
    submittedResultsCreated = false;
    constructor(config) {
        super(config);
        this.config = config;
        const { headerActions, results, mapConfig, ...rest } = config;
        this.results = NitroSection_1.NitroSectionUtil.convert(this.template, results)?.at(0) ?? {
            items: [],
            type: 'default',
        };
        const nitroConfig = {
            ...rest,
            id: this.id,
            headerActions: NitroAction_1.NitroActionUtil.convert(this.template, headerActions),
            results: this.results,
            handlesSubmittedResults: mapConfig != null,
            onSearchTextSubmitted: (text) => {
                if (mapConfig != null && this.submittedResultsId == null) {
                    this.submittedResultsId = `${this.id}-results`;
                    void this.presentSubmittedResults(this.submittedResultsId);
                }
                config.onSearchTextSubmitted(text);
            },
            onPopped: () => {
                // Removing the keyboard is part of the map transition, not dismissal of the search.
                if (this.submittedResultsId == null) {
                    config.onPopped?.();
                }
            },
        };
        HybridSearchTemplate.createSearchTemplate(nitroConfig);
    }
    async presentSubmittedResults(resultsId) {
        try {
            // Expose the root map once, without creating an intermediate native results screen.
            // Queries and updates proceed meanwhile; the list is created with the latest cached rows.
            await HybridAutoPlay_1.HybridAutoPlay.popToRootTemplate(false);
            if (this.submittedResultsId !== resultsId) {
                return;
            }
            HybridListTemplate.createListTemplate({
                id: resultsId,
                title: this.config.title,
                headerActions: NitroAction_1.NitroActionUtil.convert(this.template, this.config.headerActions),
                sections: [this.results],
                mapConfig: NitroMapConfig_1.NitroMapConfigUtil.convert(this.template, this.config.mapConfig),
                platform: NitroMapConfig_1.NitroMapConfigUtil.convertIos(this.template, this.config.mapConfig?.ios),
                onPopped: () => {
                    this.submittedResultsId = undefined;
                    this.submittedResultsCreated = false;
                    this.config.onPopped?.();
                },
            });
            this.submittedResultsCreated = true;
            await HybridAutoPlay_1.HybridAutoPlay.pushTemplate(resultsId);
        }
        catch (error) {
            this.submittedResultsId = undefined;
            this.submittedResultsCreated = false;
            this.config.onPopped?.();
            console.warn('Failed to present submitted search results', error);
        }
    }
    updateSearchResults(results) {
        this.results = NitroSection_1.NitroSectionUtil.convert(this.template, results)?.at(0) ?? {
            items: [],
            type: 'default',
        };
        if (this.submittedResultsId != null) {
            return this.submittedResultsCreated
                ? HybridListTemplate.updateListTemplateSections(this.submittedResultsId, [this.results])
                : Promise.resolve();
        }
        return HybridSearchTemplate.updateSearchResults(this.id, this.results);
    }
    popTo() {
        return HybridAutoPlay_1.HybridAutoPlay.popToTemplate(this.submittedResultsId ?? this.id);
    }
    setHeaderActions(headerActions) {
        this.config.headerActions = headerActions;
        const nitroActions = NitroAction_1.NitroActionUtil.convert(this.template, headerActions);
        return HybridAutoPlay_1.HybridAutoPlay.setTemplateHeaderActions(this.submittedResultsId ?? this.id, nitroActions);
    }
}
exports.SearchTemplate = SearchTemplate;
