import type { AutoText } from '../types/Text';
import { type NitroAction } from '../utils/NitroAction';
import { type GridButton, type NitroGridButton } from '../utils/NitroGrid';
import type { BaseMapTemplateConfig, PanelHeaderActions } from './MapTemplate';
import { type HeaderActions, type NitroBaseMapTemplateConfig, Template, type TemplateConfig } from './Template';
/**
 * Controls the size of Android grid items. A selected size requires Android Car API 8.
 * @namespace Android
 */
export type GridImageSize = 'unset' | 'large' | 'medium' | 'small';
export interface NitroGridTemplateConfig extends TemplateConfig {
    headerActions?: Array<NitroAction>;
    title: AutoText;
    buttons: Array<NitroGridButton>;
    imageSize?: GridImageSize;
    mapConfig?: NitroBaseMapTemplateConfig;
}
export type GridTemplateConfig = Omit<NitroGridTemplateConfig, 'headerActions' | 'buttons' | 'mapConfig'> & {
    /**
     * action buttons, usually at the the top right on Android and a top bar on iOS
     */
    headerActions?: HeaderActions<GridTemplate>;
    buttons: Array<GridButton<GridTemplate>>;
    /**
     * Controls the size of all images in the Android grid. Defaults to `unset`, which preserves
     * the platform's standard grid layout. `large`, `medium`, and `small` require Android Car API
     * 8. Ignored (with a `__DEV__` warning) when `mapConfig` is also set — `MapWithContentTemplate`
     * does not support the sized grid content type.
     * @namespace Android
     */
    imageSize?: GridImageSize;
    /**
     * If mapConfig is defined, it will use a MapWithContentTemplate with the current template. This results in a GridTemplate with a map in background. No actions need to be specified, can be empty object.
     * @namespace Android - uses MapWithContentTemplate
     * @namespace iOS - renders as a CPMapPanel on the current root map template (iOS 27+);
     * `headerActions` here is Android-only — on iOS this template's own `headerActions` are
     * applied to the root map template's nav bar instead, since CarPlay has no separate header
     * for the map behind a panel.
     */
    mapConfig?: Omit<BaseMapTemplateConfig<GridTemplate>, 'headerActions'> & {
        headerActions?: PanelHeaderActions<GridTemplate>;
    };
};
export declare class GridTemplate extends Template<GridTemplateConfig, HeaderActions<GridTemplate>> {
    private template;
    constructor(config: GridTemplateConfig);
    updateGrid(buttons: Array<GridButton<GridTemplate>>): Promise<void>;
}
