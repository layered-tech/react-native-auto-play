import { Platform } from 'react-native';
import { NitroModules } from 'react-native-nitro-modules';
import { NitroActionUtil } from '../utils/NitroAction';
import { NitroGridUtil } from '../utils/NitroGrid';
import { NitroMapConfigUtil } from '../utils/NitroMapConfig';
import { Template, } from './Template';
const HybridGridTemplate = NitroModules.createHybridObject('GridTemplate');
export class GridTemplate extends Template {
    template = this;
    constructor(config) {
        super(config);
        const { headerActions, buttons, mapConfig, ...rest } = config;
        if (__DEV__ &&
            Platform.OS === 'android' &&
            mapConfig != null &&
            rest.imageSize != null &&
            rest.imageSize !== 'unset') {
            console.warn('GridTemplate: imageSize is ignored on Android when mapConfig is set, a sized grid on the map crashes Android Auto (https://issuetracker.google.com/issues/572287914)');
        }
        const nitroConfig = {
            ...rest,
            id: this.id,
            headerActions: NitroActionUtil.convert(this.template, headerActions),
            buttons: NitroGridUtil.convert(this.template, buttons),
            mapConfig: NitroMapConfigUtil.convert(this.template, mapConfig),
            platform: NitroMapConfigUtil.convertIos(this.template, mapConfig?.ios),
        };
        HybridGridTemplate.createGridTemplate(nitroConfig);
    }
    updateGrid(buttons) {
        return HybridGridTemplate.updateGridTemplateButtons(this.id, NitroGridUtil.convert(this.template, buttons));
    }
}
