import type { CustomActionButtonAndroid, TextButton } from '../types/Button';
import type { AutoText } from '../types/Text';
import { type NitroAction } from '../utils/NitroAction';
import { type NitroSection } from '../utils/NitroSection';
import type { TextRow } from './ListTemplate';
import type { BaseMapTemplateConfig, PanelActionsIos, PanelHeaderActions } from './MapTemplate';
import { type HeaderActions, type NitroBaseMapTemplateConfig, Template, type TemplateConfig } from './Template';
type InformationActionsAndroid<T> = [CustomActionButtonAndroid<T>] | [CustomActionButtonAndroid<T>, CustomActionButtonAndroid<T>];
export interface NitroInformationTemplateConfig extends TemplateConfig {
    headerActions?: Array<NitroAction>;
    title: AutoText;
    section: NitroSection;
    actions?: Array<NitroAction>;
    mapConfig?: NitroBaseMapTemplateConfig;
}
export type InformationItems = [TextRow] | [TextRow, TextRow] | [TextRow, TextRow, TextRow] | [TextRow, TextRow, TextRow, TextRow];
type InformationTemplateBaseConfig = Omit<NitroInformationTemplateConfig, 'headerActions' | 'section' | 'mapConfig' | 'actions'> & {
    /**
     * action buttons, usually at the the top right on Android and a top bar on iOS
     */
    headerActions?: HeaderActions<InformationTemplate>;
    /**
     * @namespace Android this is a PaneTemplate with a list of rows. Each row can have a title with up to 2 rows and a detailedText with up to 4 rows, either as a single string that is automatically wrapped or a string with line breaks. However if the text is too long it might be broken into multiple rows and then truncated, if more than 4 rows are required due to wrapping.
     * @namespace iOS this is an InformationTemplate, ⚠️ the row image is NOT supported
     */
    items?: InformationItems;
};
/**
 * `actions`/`mapConfig` are a discriminated union — `mapConfig` restricts `actions.ios` to at
 * most one `TextButton` plus one icon-only `ImageButton` (a `CPMapPanel` can't show more), vs. up
 * to three `TextButton`s otherwise. If your `mapConfig` value comes from a variable/prop rather
 * than an inline literal, TS can't narrow which branch applies — assign it to a local `const` and
 * branch with `if (mapConfig) { ... } else { ... }` into two separate constructor calls instead
 * of passing it straight through to one.
 */
export type InformationTemplateConfig = InformationTemplateBaseConfig & ({
    mapConfig?: undefined;
    /**
     * @namespace Android up to 2 buttons of type TextButton, TextAndImageButton or ImageButton
     * @namespace iOS - up to 3 buttons of type TextButton
     */
    actions?: {
        android?: InformationActionsAndroid<InformationTemplate>;
        ios?: [
            TextButton<InformationTemplate>,
            TextButton<InformationTemplate>,
            TextButton<InformationTemplate>
        ] | [TextButton<InformationTemplate>, TextButton<InformationTemplate>] | [TextButton<InformationTemplate>];
    };
} | {
    /**
     * If mapConfig is defined, it will use a MapWithContentTemplate with the current template. This results in a PaneTemplate with a map in background. No actions need to be specified, can be empty object.
     * @namespace Android - uses MapWithContentTemplate
     * @namespace iOS - renders as a CPMapPanel on the current root map template (iOS 27+);
     * `headerActions` here is Android-only — on iOS this template's own `headerActions` are
     * applied to the root map template's nav bar instead, since CarPlay has no separate
     * header for the map behind a panel.
     */
    mapConfig: Omit<BaseMapTemplateConfig<InformationTemplate>, 'headerActions'> & {
        headerActions?: PanelHeaderActions<InformationTemplate>;
    };
    /**
     * @namespace Android up to 2 buttons of type TextButton, TextAndImageButton or ImageButton
     * @namespace iOS - the panel can only show one TextButton plus one optional icon-only
     * ImageButton, see PanelActionsIos
     */
    actions?: {
        android?: InformationActionsAndroid<InformationTemplate>;
        ios?: PanelActionsIos<InformationTemplate>;
    };
});
export declare class InformationTemplate extends Template<InformationTemplateConfig, HeaderActions<InformationTemplate>> {
    private template;
    constructor(config: InformationTemplateConfig);
    updateItems(items?: InformationItems): Promise<void>;
    private getSection;
}
export {};
