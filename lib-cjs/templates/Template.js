"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Template = void 0;
const react_native_uuid_1 = __importDefault(require("react-native-uuid"));
const HybridAutoPlay_1 = require("../hybrid/HybridAutoPlay");
const NitroAction_1 = require("../utils/NitroAction");
class Template {
    id;
    constructor(config) {
        // templates that render on a surface provide their own id, others use a auto generated one
        this.id =
            'id' in config && config.id != null && typeof config.id === 'string' ? config.id : react_native_uuid_1.default.v4();
    }
    /**
     * set as root template on the stack
     */
    setRootTemplate() {
        return HybridAutoPlay_1.HybridAutoPlay.setRootTemplate(this.id);
    }
    /**
     * push this template on the stack and show it to the user
     */
    push() {
        return HybridAutoPlay_1.HybridAutoPlay.pushTemplate(this.id);
    }
    /**
     * remove all templates above this one from the stack
     */
    popTo() {
        return HybridAutoPlay_1.HybridAutoPlay.popToTemplate(this.id);
    }
    setHeaderActions(headerActions) {
        const nitroActions = NitroAction_1.NitroActionUtil.convert(this, headerActions);
        return HybridAutoPlay_1.HybridAutoPlay.setTemplateHeaderActions(this.id, nitroActions);
    }
}
exports.Template = Template;
