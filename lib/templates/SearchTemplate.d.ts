import type { DefaultRow, SingleSection } from '..';
import type { AutoText } from '../types/Text';
import { type NitroAction } from '../utils/NitroAction';
import { type NitroSection } from '../utils/NitroSection';
import { type HeaderActions, Template, type TemplateConfig } from './Template';
export type SearchSection<T> = {
    type: 'default';
    items: Array<DefaultRow<T>>;
};
export interface NitroSearchTemplateConfig extends TemplateConfig {
    headerActions?: Array<NitroAction>;
    title: AutoText;
    results: NitroSection;
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
export type SearchTemplateConfig = Omit<NitroSearchTemplateConfig, 'headerActions' | 'results' | 'onPopped'> & {
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
     * @namespace Android
     */
    onPopped?: TemplateConfig['onPopped'];
};
export declare class SearchTemplate extends Template<SearchTemplateConfig, HeaderActions<SearchTemplate>> {
    private template;
    constructor(config: SearchTemplateConfig);
    updateSearchResults(results?: SingleSection<SearchTemplate>): Promise<void>;
}
