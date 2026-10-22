"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NitroAttributedStringUtil = void 0;
const NitroImage_1 = require("./NitroImage");
function convert(attributedStrings) {
    return attributedStrings.map((attributedString) => ({
        ...attributedString,
        images: attributedString.images?.map((image) => ({
            ...image,
            image: NitroImage_1.NitroImageUtil.convert(image.image),
        })),
    }));
}
exports.NitroAttributedStringUtil = { convert };
