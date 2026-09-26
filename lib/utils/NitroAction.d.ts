import type { MapHeaderActions } from '../templates/MapTemplate';
import type { ActionButton, HeaderActions } from '../templates/Template';
import type { ButtonStyle } from '../types/Button';
import type { AlertActionStyle } from './NitroAlert';
import { type NitroImage } from './NitroImage';
type NitroActionType = 'appIcon' | 'back' | 'custom';
type NitroAlignment = 'leading' | 'trailing';
type NitroButtonStyle = ButtonStyle | AlertActionStyle;
/**
 * used to convert the very specific typescript typing in an easier to handle type for native code
 */
export type NitroAction = {
    title?: string;
    image?: NitroImage;
    enabled?: boolean;
    onPress: () => void;
    type: NitroActionType;
    alignment?: NitroAlignment;
    flags?: number;
    /**
     * Only used for non header actions
     * @namespace iOS
     * @default default
     */
    style?: NitroButtonStyle;
};
declare function convert<T>(template: T, actions: HeaderActions<T> | Array<ActionButton<T>> | MapHeaderActions<T>): Array<NitroAction>;
declare function convert<T>(template: T, actions?: HeaderActions<T> | Array<ActionButton<T>> | MapHeaderActions<T>): Array<NitroAction> | undefined;
export declare const NitroActionUtil: {
    convert: typeof convert;
};
export {};
