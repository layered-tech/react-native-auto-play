"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignInTemplate = exports.HybridSignInTemplate = void 0;
const react_native_1 = require("react-native");
const react_native_nitro_modules_1 = require("react-native-nitro-modules");
const SignInMethod_1 = require("../types/SignInMethod");
const NitroAction_1 = require("../utils/NitroAction");
const Template_1 = require("./Template");
exports.HybridSignInTemplate = react_native_1.Platform.OS === 'android'
    ? react_native_nitro_modules_1.NitroModules.createHybridObject('SignInTemplate')
    : null;
/**
 * A template for signing in to an account.
 * @namespace Android
 */
class SignInTemplate extends Template_1.Template {
    template = this;
    constructor(config) {
        super(config);
        const { headerActions, actions, ...rest } = config;
        const nitroConfig = {
            ...rest,
            id: this.id,
            headerActions: NitroAction_1.NitroActionUtil.convert(this.template, headerActions),
            actions: NitroAction_1.NitroActionUtil.convert(this.template, actions),
        };
        if (config.signInMethod.method === SignInMethod_1.SignInMethods.PIN &&
            (config.signInMethod.pin?.length > 12 || config.signInMethod.pin?.length < 1)) {
            throw new Error('PIN must be 1-12 characters');
        }
        exports.HybridSignInTemplate?.createSignInTemplate(nitroConfig);
    }
    /**
     * Updates the template with new config. The config is merged with the current one,
     * so if values are not provided, they will stay. To change values, they need to be overridden.
     *
     * @param updatedConfig - The updated config for the template.
     * @returns A promise that resolves when the template is updated.
     */
    updateTemplate(updatedConfig) {
        const { headerActions, actions, ...rest } = updatedConfig;
        const nitroConfig = {
            ...rest,
            id: this.id,
            headerActions: NitroAction_1.NitroActionUtil.convert(this.template, headerActions),
            actions: NitroAction_1.NitroActionUtil.convert(this.template, actions),
        };
        if (nitroConfig.signInMethod?.method === SignInMethod_1.SignInMethods.PIN &&
            (nitroConfig.signInMethod.pin?.length > 12 || nitroConfig.signInMethod.pin?.length < 1)) {
            throw new Error('PIN must be 1-12 characters');
        }
        return exports.HybridSignInTemplate?.updateTemplate(this.id, nitroConfig);
    }
}
exports.SignInTemplate = SignInTemplate;
