import type { AutoText } from '../types/Text';
import { type NitroAction } from '../utils/NitroAction';
import { type NitroSection, type Section } from '../utils/NitroSection';
import type { BaseMapTemplateConfig, PanelHeaderActions } from './MapTemplate';
import { type HeaderActions, type NitroBaseMapTemplateConfig, Template, type TemplateConfig } from './Template';
/**
 * Controls the Android image size for a list item.
 * @namespace Android
 */
export type ListImageType = 'large' | 'medium' | 'small' | 'extra_small' | 'icon';
export type { DefaultRow, MultiSection, RadioRow, Section, SingleSection, TextRow, ToggleRow, WaypointCoordinate, WaypointRow, } from '../utils/NitroSection';
export interface NitroListTemplateConfig extends TemplateConfig {
    headerActions?: Array<NitroAction>;
    title: AutoText;
    sections?: Array<NitroSection>;
    mapConfig?: NitroBaseMapTemplateConfig;
}
export type ListTemplateConfig = Omit<NitroListTemplateConfig, 'headerActions' | 'sections' | 'mapConfig'> & {
    /**
     * action buttons, usually at the the top right on Android and a top bar on iOS
     */
    headerActions?: HeaderActions<ListTemplate>;
    /**
     * a container that groups your list items into sections.
     * must have a single selected item in case it is a radio list.
     * in case it does not the first item will be selected.
     * in case it has multiple only the first selected one will be shown as selected.
     */
    sections?: Section<ListTemplate>;
    /**
     * If mapConfig is defined, it will use a MapWithContentTemplate with the current template. This results in a ListTemplate with a map in background. No actions need to be specified, can be empty object.
     * @namespace Android - uses MapWithContentTemplate
     * @namespace iOS - renders as a CPMapPanel on the current root map template (iOS 27+);
     * `headerActions` here is Android-only — on iOS this template's own `headerActions` are
     * applied to the root map template's nav bar instead, since CarPlay has no separate header
     * for the map behind a panel.
     */
    mapConfig?: Omit<BaseMapTemplateConfig<ListTemplate>, 'headerActions'> & {
        headerActions?: PanelHeaderActions<ListTemplate>;
    };
};
export declare class ListTemplate extends Template<ListTemplateConfig, HeaderActions<ListTemplate>> {
    private template;
    constructor(config: ListTemplateConfig);
    updateSections(sections?: Section<ListTemplate>): Promise<void>;
}
