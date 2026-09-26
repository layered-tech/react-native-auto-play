"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NitroGridUtil = void 0;
const NitroImage_1 = require("./NitroImage");
const convert = (template, buttons) => {
    return buttons.map((button) => ({
        title: button.title,
        image: NitroImage_1.NitroImageUtil.convert(button.image),
        onPress: () => button.onPress(template),
    }));
};
exports.NitroGridUtil = { convert };
