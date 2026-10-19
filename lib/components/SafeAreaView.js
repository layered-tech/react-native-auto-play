import { jsx as _jsx } from "react/jsx-runtime";
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from '../hooks/useSafeAreaInsets';
export const SafeAreaView = (props) => {
    const { style, ...rest } = props;
    const safeAreaInsets = useSafeAreaInsets();
    return (_jsx(View, { style: [
            style,
            {
                ...StyleSheet.absoluteFill,
                paddingTop: safeAreaInsets.top,
                paddingBottom: safeAreaInsets.bottom,
                paddingRight: safeAreaInsets.right,
                paddingLeft: safeAreaInsets.left,
                pointerEvents: 'box-none',
            },
        ], ...rest }));
};
