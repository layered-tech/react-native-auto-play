import type { LocalAutoImage } from '../types/Image';
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
    /**
     * no remote images, attributed strings are not redrawn once a download finishes, see README
     */
    images?: Array<{
        image: LocalAutoImage;
        position: number;
    }>;
};
declare function convert(attributedStrings: Array<AutoAttributedString>): Array<NitroAttributedString>;
export declare const NitroAttributedStringUtil: {
    convert: typeof convert;
};
export {};
