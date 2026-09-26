"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafeAreaView = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const useSafeAreaInsets_1 = require("../hooks/useSafeAreaInsets");
const SafeAreaView = (props) => {
    const { style, ...rest } = props;
    const safeAreaInsets = (0, useSafeAreaInsets_1.useSafeAreaInsets)();
    return ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: [
            style,
            {
                ...react_native_1.StyleSheet.absoluteFill,
                paddingTop: safeAreaInsets.top,
                paddingBottom: safeAreaInsets.bottom,
                paddingRight: safeAreaInsets.right,
                paddingLeft: safeAreaInsets.left,
                pointerEvents: 'box-none',
            },
        ], ...rest }));
};
exports.SafeAreaView = SafeAreaView;
