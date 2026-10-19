import type { AutoImage } from '../types/Image';
import type { AutoText } from '../types/Text';
import { type NitroImage } from './NitroImage';
export type GridButton<T> = {
    title: AutoText;
    image: AutoImage;
    onPress: (template: T) => void;
};
export type NitroGridButton = {
    title: AutoText;
    image: NitroImage;
    onPress: () => void;
};
export declare const NitroGridUtil: {
    convert: <T>(template: T, buttons: Array<GridButton<T>>) => NitroGridButton[];
};
