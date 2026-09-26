import { NitroImageUtil } from './NitroImage';
function convert(attributedStrings) {
    return attributedStrings.map((attributedString) => ({
        ...attributedString,
        images: attributedString.images?.map((image) => ({
            ...image,
            image: NitroImageUtil.convert(image.image),
        })),
    }));
}
export const NitroAttributedStringUtil = { convert };
