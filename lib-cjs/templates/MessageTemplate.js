"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageTemplate = void 0;
const react_native_1 = require("react-native");
const react_native_nitro_modules_1 = require("react-native-nitro-modules");
const react_native_uuid_1 = __importDefault(require("react-native-uuid"));
const HybridAutoPlay_1 = require("../hybrid/HybridAutoPlay");
const NitroAction_1 = require("../utils/NitroAction");
const NitroImage_1 = require("../utils/NitroImage");
const NitroMapButton_1 = require("../utils/NitroMapButton");
const HybridMessageTemplate = react_native_nitro_modules_1.NitroModules.createHybridObject('MessageTemplate');
/**
 * This template is always pushed on top and will stay on top until it is popped.
 * Other templates being pushed will end up below this one on the stack.
 * Pushing another MessageTemplate will pop the currently shown one.
 */
class MessageTemplate {
    template = this;
    id = react_native_uuid_1.default.v4();
    constructor(config) {
        const { headerActions, image, mapConfig, actions, ...rest } = config;
        const platformActions = react_native_1.Platform.OS === 'android'
            ? NitroAction_1.NitroActionUtil.convert(this.template, actions?.android)
            : NitroAction_1.NitroActionUtil.convert(this.template, actions?.ios);
        const nitroConfig = {
            ...rest,
            id: this.id,
            headerActions: NitroAction_1.NitroActionUtil.convert(this.template, headerActions),
            image: NitroImage_1.NitroImageUtil.convert(image),
            actions: platformActions,
            mapConfig: mapConfig
                ? {
                    mapButtons: NitroMapButton_1.NitroMapButton.convert(this.template, mapConfig.mapButtons),
                    headerActions: NitroAction_1.NitroActionUtil.convert(this.template, mapConfig.headerActions),
                }
                : undefined,
        };
        HybridMessageTemplate.createMessageTemplate(nitroConfig);
    }
    /**
     * push this template on the stack and show it to the user
     */
    push() {
        return HybridAutoPlay_1.HybridAutoPlay.pushTemplate(this.id);
    }
}
exports.MessageTemplate = MessageTemplate;
