import type { AutoImage } from '../types/Image';
import { type NitroImage } from './NitroImage';
type NitroAttributedStringImage = {
    image: NitroImage;
    position: number;
};
export type NitroAttributedString = {
    text: string;
    images?: Array<NitroAttributedStringImage>;
};
export type AutoAttributedString = {
    text: string;
    images?: Array<{
        image: AutoImage;
        position: number;
    }>;
};
declare function convert(attributedStrings: Array<AutoAttributedString>): Array<NitroAttributedString>;
export declare const NitroAttributedStringUtil: {
    convert: typeof convert;
};
export {};
