import type { ActionButton, AppButton, BackButton, CustomActionButtonAndroid, ImageButton } from '..';
import type { SignInTemplate as NitroSignInTemplate } from '../specs/SignInTemplate.nitro';
import { type SignInMethod } from '../types/SignInMethod';
import { type NitroAction } from '../utils/NitroAction';
import { Template, type TemplateConfig } from './Template';
export declare const HybridSignInTemplate: NitroSignInTemplate | null;
export interface NitroSignInTemplateConfig extends TemplateConfig {
    title?: string;
    additionalText?: string;
    signInMethod?: SignInMethod;
    headerActions?: Array<NitroAction>;
    actions?: Array<NitroAction>;
    instructions?: string;
}
export type SignInHeaderActions<T> = {
    android: {
        startHeaderAction?: AppButton | BackButton<T>;
        /**
         * Actions for the sign-in template.
         * Note: Android Auto only allows 1 action with a custom title in the action strip.
         */
        endHeaderActions?: [CustomActionButtonAndroid<SignInTemplate>, ImageButton<SignInTemplate>] | [ImageButton<SignInTemplate>, CustomActionButtonAndroid<SignInTemplate>] | [CustomActionButtonAndroid<SignInTemplate>];
    };
};
export type SignInTemplateConfig = Omit<NitroSignInTemplateConfig, 'headerActions' | 'actions' | 'signInMethod'> & {
    headerActions?: SignInHeaderActions<SignInTemplate>;
    actions?: Array<ActionButton<SignInTemplate>>;
    signInMethod: SignInMethod;
};
export type SignInTemplateUpdateConfig = Omit<NitroSignInTemplateConfig, 'headerActions' | 'actions'> & {
    headerActions?: SignInHeaderActions<SignInTemplate>;
    actions?: Array<ActionButton<SignInTemplate>>;
};
/**
 * A template for signing in to an account.
 * @namespace Android
 */
export declare class SignInTemplate extends Template<SignInTemplateConfig, SignInHeaderActions<SignInTemplate>> {
    private template;
    constructor(config: SignInTemplateConfig);
    /**
     * Updates the template with new config. The config is merged with the current one,
     * so if values are not provided, they will stay. To change values, they need to be overridden.
     *
     * @param updatedConfig - The updated config for the template.
     * @returns A promise that resolves when the template is updated.
     */
    updateTemplate(updatedConfig: SignInTemplateUpdateConfig): Promise<void> | undefined;
}
