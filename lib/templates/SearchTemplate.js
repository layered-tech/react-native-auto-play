import { NitroModules } from 'react-native-nitro-modules';
import { HybridAutoPlay } from '../hybrid/HybridAutoPlay';
import { NitroActionUtil } from '../utils/NitroAction';
import { NitroMapConfigUtil } from '../utils/NitroMapConfig';
import { NitroSectionUtil } from '../utils/NitroSection';
import { Template, } from './Template';
const HybridSearchTemplate = NitroModules.createHybridObject('SearchTemplate');
const HybridListTemplate = NitroModules.createHybridObject('ListTemplate');
export class SearchTemplate extends Template {
    template = this;
    config;
    results;
    submittedResultsId;
    submittedResultsCreated = false;
    constructor(config) {
        super(config);
        this.config = config;
        const { headerActions, results, mapConfig, ...rest } = config;
        this.results = NitroSectionUtil.convert(this.template, results)?.at(0) ?? {
            items: [],
            type: 'default',
        };
        const nitroConfig = {
            ...rest,
            id: this.id,
            headerActions: NitroActionUtil.convert(this.template, headerActions),
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
            await HybridAutoPlay.popToRootTemplate(false);
            if (this.submittedResultsId !== resultsId) {
                return;
            }
            HybridListTemplate.createListTemplate({
                id: resultsId,
                title: this.config.title,
                headerActions: NitroActionUtil.convert(this.template, this.config.headerActions),
                sections: [this.results],
                mapConfig: NitroMapConfigUtil.convert(this.template, this.config.mapConfig),
                platform: NitroMapConfigUtil.convertIos(this.template, this.config.mapConfig?.ios),
                onPopped: () => {
                    this.submittedResultsId = undefined;
                    this.submittedResultsCreated = false;
                    this.config.onPopped?.();
                },
            });
            this.submittedResultsCreated = true;
            await HybridAutoPlay.pushTemplate(resultsId);
        }
        catch (error) {
            this.submittedResultsId = undefined;
            this.submittedResultsCreated = false;
            this.config.onPopped?.();
            console.warn('Failed to present submitted search results', error);
        }
    }
    updateSearchResults(results) {
        this.results = NitroSectionUtil.convert(this.template, results)?.at(0) ?? {
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
        return HybridAutoPlay.popToTemplate(this.submittedResultsId ?? this.id);
    }
    setHeaderActions(headerActions) {
        this.config.headerActions = headerActions;
        const nitroActions = NitroActionUtil.convert(this.template, headerActions);
        return HybridAutoPlay.setTemplateHeaderActions(this.submittedResultsId ?? this.id, nitroActions);
    }
}
