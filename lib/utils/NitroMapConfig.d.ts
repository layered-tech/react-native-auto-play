import type { MapConfig, MapConfigWithoutActions } from '../templates/MapTemplate';
import type { NitroBaseMapTemplateConfig, NitroPanelTemplatePlatformConfig } from '../templates/Template';
export declare const NitroMapConfigUtil: {
    convert: <T>(template: T, mapConfig?: MapConfigWithoutActions<T>) => NitroBaseMapTemplateConfig | undefined;
    convertIos: <T>(template: T, ios?: MapConfig<T>["ios"]) => NitroPanelTemplatePlatformConfig | undefined;
};
