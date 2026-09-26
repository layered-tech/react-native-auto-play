import { Platform } from 'react-native';
import { NitroModules } from 'react-native-nitro-modules';
import { SignInMethods } from '../types/SignInMethod';
import { NitroActionUtil } from '../utils/NitroAction';
import { Template } from './Template';
export const HybridSignInTemplate = Platform.OS === 'android'
    ? NitroModules.createHybridObject('SignInTemplate')
    : null;
/**
 * A template for signing in to an account.
 * @namespace Android
 */
export class SignInTemplate extends Template {
    template = this;
    constructor(config) {
        super(config);
        const { headerActions, actions, ...rest } = config;
        const nitroConfig = {
            ...rest,
            id: this.id,
            headerActions: NitroActionUtil.convert(this.template, headerActions),
            actions: NitroActionUtil.convert(this.template, actions),
        };
        if (config.signInMethod.method === SignInMethods.PIN &&
            (config.signInMethod.pin?.length > 12 || config.signInMethod.pin?.length < 1)) {
            throw new Error('PIN must be 1-12 characters');
        }
        HybridSignInTemplate?.createSignInTemplate(nitroConfig);
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
            headerActions: NitroActionUtil.convert(this.template, headerActions),
            actions: NitroActionUtil.convert(this.template, actions),
        };
        if (nitroConfig.signInMethod?.method === SignInMethods.PIN &&
            (nitroConfig.signInMethod.pin?.length > 12 || nitroConfig.signInMethod.pin?.length < 1)) {
            throw new Error('PIN must be 1-12 characters');
        }
        return HybridSignInTemplate?.updateTemplate(this.id, nitroConfig);
    }
}
