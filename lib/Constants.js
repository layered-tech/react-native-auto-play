import { Platform } from 'react-native';
const isIos27OrGreater = Platform.OS === 'ios' && Math.floor(Number(Platform.Version)) >= 27;
const Constants = {
    isIos27OrGreater,
};
export { Constants };
