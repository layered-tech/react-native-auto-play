import type { MapButtons } from '../templates/MapTemplate';
import { type NitroImage } from './NitroImage';
type NitroMapButtonType = 'pan' | 'custom';
export type NitroMapButton = {
    type: NitroMapButtonType;
    image: NitroImage;
    onPress?: () => void;
};
export declare const NitroMapButton: {
    convert: <T>(template: T, mapButtons?: MapButtons<T>) => Array<NitroMapButton> | undefined;
};
export {};
