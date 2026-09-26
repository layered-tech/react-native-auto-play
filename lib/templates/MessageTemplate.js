import { Platform } from 'react-native';
import { NitroModules } from 'react-native-nitro-modules';
import uuid from 'react-native-uuid';
import { HybridAutoPlay } from '../hybrid/HybridAutoPlay';
import { NitroActionUtil } from '../utils/NitroAction';
import { NitroImageUtil } from '../utils/NitroImage';
import { NitroMapButton } from '../utils/NitroMapButton';
const HybridMessageTemplate = NitroModules.createHybridObject('MessageTemplate');
/**
 * This template is always pushed on top and will stay on top until it is popped.
 * Other templates being pushed will end up below this one on the stack.
 * Pushing another MessageTemplate will pop the currently shown one.
 */
export class MessageTemplate {
    template = this;
    id = uuid.v4();
    constructor(config) {
        const { headerActions, image, mapConfig, actions, ...rest } = config;
        const platformActions = Platform.OS === 'android'
            ? NitroActionUtil.convert(this.template, actions?.android)
            : NitroActionUtil.convert(this.template, actions?.ios);
        const nitroConfig = {
            ...rest,
            id: this.id,
            headerActions: NitroActionUtil.convert(this.template, headerActions),
            image: NitroImageUtil.convert(image),
            actions: platformActions,
            mapConfig: mapConfig
                ? {
                    mapButtons: NitroMapButton.convert(this.template, mapConfig.mapButtons),
                    headerActions: NitroActionUtil.convert(this.template, mapConfig.headerActions),
                }
                : undefined,
        };
        HybridMessageTemplate.createMessageTemplate(nitroConfig);
    }
    /**
     * push this template on the stack and show it to the user
     */
    push() {
        return HybridAutoPlay.pushTemplate(this.id);
    }
}
