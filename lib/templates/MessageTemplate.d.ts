import type { AutoImage, BaseMapTemplateConfig, CustomActionButtonAndroid, HeaderActions, TextButton } from '..';
import type { AutoText } from '../types/Text';
import { type NitroAction } from '../utils/NitroAction';
import { type NitroImage } from '../utils/NitroImage';
import type { PanelActionsIos, PanelHeaderActions } from './MapTemplate';
import type { NitroBaseMapTemplateConfig, TemplateConfig } from './Template';
export interface NitroMessageTemplateConfig extends TemplateConfig {
    headerActions?: Array<NitroAction>;
    /**
     * @namespace Android title shown on header
     * @namespace iOS title shown when mapConfig is set, otherwise it isn't supported
     */
    title?: AutoText;
    message: AutoText;
    actions?: Array<NitroAction>;
    image?: NitroImage;
    mapConfig?: NitroBaseMapTemplateConfig;
}
type MessageActionsAndroid<T> = [CustomActionButtonAndroid<T>] | [CustomActionButtonAndroid<T>, CustomActionButtonAndroid<T>];
type MessageTemplateBaseConfig = Omit<NitroMessageTemplateConfig, 'headerActions' | 'image' | 'mapConfig' | 'actions'> & {
    /**
     * action buttons, usually at the top right on Android
     * @namespace iOS `ios` only takes effect once this renders as a CPMapPanel (`mapConfig` set,
     * iOS 27+) and is applied to the root map template's nav bar — without `mapConfig` (or below
     * iOS 27, where `mapConfig` is a no-op) this template is a full-screen `CPAlertTemplate`, which
     * has no nav bar at all, so `ios` is silently unused there.
     */
    headerActions?: HeaderActions<MessageTemplate>;
    /**
     * image shown at the top of the message on Android
     * @namespace Android
     */
    image?: AutoImage;
};
/**
 * `actions`/`mapConfig` are a discriminated union — `mapConfig` restricts `actions.ios` to at
 * most one `TextButton` plus one icon-only `ImageButton` (a `CPMapPanel` can't show more), vs. up
 * to three `TextButton`s otherwise. If your `mapConfig` value comes from a variable/prop rather
 * than an inline literal, TS can't narrow which branch applies — assign it to a local `const` and
 * branch with `if (mapConfig) { ... } else { ... }` into two separate constructor calls instead
 * of passing it straight through to one.
 */
export type MessageTemplateConfig = MessageTemplateBaseConfig & ({
    mapConfig?: undefined;
    /**
     * @namespace Android up to 2 buttons of type TextButton, TextAndImageButton or ImageButton
     * @namespace iOS - up to 3 buttons of type TextButton
     */
    actions?: {
        android?: MessageActionsAndroid<MessageTemplate>;
        ios?: [
            TextButton<MessageTemplate>,
            TextButton<MessageTemplate>,
            TextButton<MessageTemplate>
        ] | [TextButton<MessageTemplate>, TextButton<MessageTemplate>] | [TextButton<MessageTemplate>];
    };
} | {
    /**
     * If mapConfig is defined, it will use a MapWithContentTemplate with the current
     * template. This results in a MessageTemplate with a map in background. No actions
     * need to be specified, can be empty object.
     * @namespace Android - uses MapWithContentTemplate
     * @namespace iOS - renders as a CPMapPanel on the current root map template (iOS 27+),
     * trading the usual full-screen modal alert presentation for panel content;
     * `headerActions` here is Android-only — on iOS this template's own `headerActions` are
     * applied to the root map template's nav bar instead, since CarPlay has no separate
     * header for the map behind a panel.
     */
    mapConfig: Omit<BaseMapTemplateConfig<MessageTemplate>, 'headerActions'> & {
        headerActions?: PanelHeaderActions<MessageTemplate>;
    };
    /**
     * @namespace Android up to 2 buttons of type TextButton, TextAndImageButton or ImageButton
     * @namespace iOS - the panel can only show one TextButton plus one optional icon-only
     * ImageButton, see PanelActionsIos
     */
    actions?: {
        android?: MessageActionsAndroid<MessageTemplate>;
        ios?: PanelActionsIos<MessageTemplate>;
    };
});
/**
 * This template is always pushed on top and will stay on top until it is popped.
 * Other templates being pushed will end up below this one on the stack.
 * Pushing another MessageTemplate will pop the currently shown one.
 */
export declare class MessageTemplate {
    private template;
    id: string;
    constructor(config: MessageTemplateConfig);
    /**
     * push this template on the stack and show it to the user
     */
    push(): Promise<void>;
}
export {};
