"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Constants = void 0;
const react_native_1 = require("react-native");
const isIos27OrGreater = react_native_1.Platform.OS === 'ios' && Math.floor(Number(react_native_1.Platform.Version)) >= 27;
const Constants = {
    isIos27OrGreater,
};
exports.Constants = Constants;
