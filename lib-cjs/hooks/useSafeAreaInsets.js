"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSafeAreaInsets = void 0;
const react_1 = require("react");
const SafeAreaInsetsContext_1 = require("../components/SafeAreaInsetsContext");
const useSafeAreaInsets = () => {
    return (0, react_1.useContext)(SafeAreaInsetsContext_1.SafeAreaInsetsContext);
};
exports.useSafeAreaInsets = useSafeAreaInsets;
