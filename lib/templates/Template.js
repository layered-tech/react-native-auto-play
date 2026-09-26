import uuid from 'react-native-uuid';
import { HybridAutoPlay } from '../hybrid/HybridAutoPlay';
import { NitroActionUtil } from '../utils/NitroAction';
export class Template {
    id;
    constructor(config) {
        // templates that render on a surface provide their own id, others use a auto generated one
        this.id =
            'id' in config && config.id != null && typeof config.id === 'string' ? config.id : uuid.v4();
    }
    /**
     * set as root template on the stack
     */
    setRootTemplate() {
        return HybridAutoPlay.setRootTemplate(this.id);
    }
    /**
     * push this template on the stack and show it to the user
     */
    push() {
        return HybridAutoPlay.pushTemplate(this.id);
    }
    /**
     * remove all templates above this one from the stack
     */
    popTo() {
        return HybridAutoPlay.popToTemplate(this.id);
    }
    setHeaderActions(headerActions) {
        const nitroActions = NitroActionUtil.convert(this, headerActions);
        return HybridAutoPlay.setTemplateHeaderActions(this.id, nitroActions);
    }
}
