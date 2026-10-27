import { NitroModules } from 'react-native-nitro-modules';
import type { DefaultRow, SingleSection } from '..';
import { HybridAutoPlay } from '../hybrid/HybridAutoPlay';
import type { ListTemplate as NitroListTemplate } from '../specs/ListTemplate.nitro';
import type { SearchTemplate as NitroSearchTemplate } from '../specs/SearchTemplate.nitro';
import type { AutoText } from '../types/Text';
import { type NitroAction, NitroActionUtil } from '../utils/NitroAction';
import { NitroMapConfigUtil } from '../utils/NitroMapConfig';
import { type NitroSection, NitroSectionUtil } from '../utils/NitroSection';
import type { MapConfig } from './MapTemplate';
import {
  type HeaderActions,
  type NitroTemplateConfig,
  Template,
  type TemplateConfig,
} from './Template';

const HybridSearchTemplate = NitroModules.createHybridObject<NitroSearchTemplate>('SearchTemplate');
const HybridListTemplate = NitroModules.createHybridObject<NitroListTemplate>('ListTemplate');

export type SearchSection<T> = {
  type: 'default';
  items: Array<DefaultRow<T>>;
};

export interface NitroSearchTemplateConfig extends TemplateConfig {
  headerActions?: Array<NitroAction>;
  title: AutoText;
  results: NitroSection;
  /** The JS wrapper owns submitted results when mapConfig is configured. */
  handlesSubmittedResults?: boolean;
  /**
   * Text that is put into the searchbar as initial value
   * @namespace Android
   */
  initialSearchText?: string;
  /**
   * Placeholder value in the search bar until text is entered
   * @namespace Android
   */
  searchHint?: string;
  /**
   * Called when the user types on the keyboard. Should be debounced to avoid excessive calls to backend.
   * @param searchText the text that the user has entered into the search bar
   */
  onSearchTextChanged: (searchText: string) => void;
  /**
   * Called when the user presses enter or search button to confirm search explicitly.
   * Can be used to trigger a backend call immediately, but might never be called if the user selects a search result item from autocomplete results instead.
   * @param searchText the text that the user has entered into the search bar
   */
  onSearchTextSubmitted: (searchText: string) => void;
}

export type SearchTemplateConfig = Omit<
  NitroSearchTemplateConfig,
  'headerActions' | 'results' | 'onPopped' | 'handlesSubmittedResults'
> & {
  /**
   * action buttons, usually at the the top right on Android and a top bar on iOS
   * @namespace Android
   */
  headerActions?: HeaderActions<SearchTemplate>;
  /**
   * List of search results to show in the search results screen
   */
  results?: SearchSection<SearchTemplate>;
  /**
   * Submitted results use a ListTemplate over the root map. Autocomplete stays in the search UI.
   * Android requires Car API 7; CarPlay requires iOS 27. Older hosts show a regular results list.
   * The root must be a MapTemplate. Header actions belong to this SearchTemplate on both screens.
   */
  mapConfig?: MapConfig<SearchTemplate>;

  /**
   * Submitted map results report dismissal on both platforms. The native CarPlay keyboard
   * does not reliably report being popped when mapConfig is omitted.
   */
  onPopped?: TemplateConfig['onPopped'];
};

export class SearchTemplate extends Template<SearchTemplateConfig, HeaderActions<SearchTemplate>> {
  private template = this;
  private config: SearchTemplateConfig;
  private results: NitroSection;
  private submittedResultsId?: string;
  private submittedResultsCreated = false;

  constructor(config: SearchTemplateConfig) {
    super(config);

    this.config = config;
    const { headerActions, results, mapConfig, ...rest } = config;
    this.results = NitroSectionUtil.convert(this.template, results)?.at(0) ?? {
      items: [],
      type: 'default',
    };

    const nitroConfig: NitroSearchTemplateConfig & NitroTemplateConfig = {
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

  private async presentSubmittedResults(resultsId: string): Promise<void> {
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
    } catch (error) {
      this.submittedResultsId = undefined;
      this.submittedResultsCreated = false;
      this.config.onPopped?.();
      console.warn('Failed to present submitted search results', error);
    }
  }

  public updateSearchResults(results?: SingleSection<SearchTemplate>) {
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

  public override popTo() {
    return HybridAutoPlay.popToTemplate(this.submittedResultsId ?? this.id);
  }

  public override setHeaderActions(headerActions?: HeaderActions<SearchTemplate>) {
    this.config.headerActions = headerActions;
    const nitroActions = NitroActionUtil.convert(this.template, headerActions);
    return HybridAutoPlay.setTemplateHeaderActions(
      this.submittedResultsId ?? this.id,
      nitroActions
    );
  }
}
