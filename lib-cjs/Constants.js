"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Constants = void 0;
const react_native_1 = require("react-native");
// Platform.Version is a string like '27.0.1' on iOS, which Number() turns into NaN
const isIos27OrGreater = react_native_1.Platform.OS === 'ios' && Number.parseInt(String(react_native_1.Platform.Version), 10) >= 27;
const Constants = {
    isIos27OrGreater,
};
exports.Constants = Constants;
