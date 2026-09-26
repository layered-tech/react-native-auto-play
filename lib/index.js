import { Platform } from 'react-native';
import { NitroModules } from 'react-native-nitro-modules';
import { HybridAndroidAutoTelemetry } from './hybrid/HybridAndroidAutoTelemetry';
import { HybridAndroidWindowInformation } from './hybrid/HybridAndroidWindowInformation';
import { HybridAutoPlay } from './hybrid/HybridAutoPlay';
import { HybridVoice } from './hybrid/HybridVoice';
export { HybridAndroidAutoTelemetry, HybridAndroidWindowInformation, HybridAutoPlay, HybridVoice };
export const HybridAndroidAutomotive = Platform.OS === 'android'
    ? NitroModules.createHybridObject('AndroidAutomotive')
    : null;
/**
 * These are the static module names for the app running on the mobile device, head unit screen and the CarPlay dashboard.
 * Clusters generate uuids on native side that are passed in the RootComponentInitialProps
 */
export var AutoPlayModules;
(function (AutoPlayModules) {
    AutoPlayModules["App"] = "main";
    AutoPlayModules["AutoPlayRoot"] = "AutoPlayRoot";
    AutoPlayModules["CarPlayDashboard"] = "CarPlayDashboard";
})(AutoPlayModules || (AutoPlayModules = {}));
export * from './Constants';
export * from './components/SafeAreaView';
export * from './hooks/useAndroidAutoTelemetry';
export * from './hooks/useFocusedEffect';
export * from './hooks/useMapTemplate';
export * from './hooks/useSafeAreaInsets';
export * from './hooks/useVoiceInput';
export * from './scenes/AutoPlayCluster';
export * from './scenes/CarPlayDashboardScene';
export { CarUxRestrictions } from './specs/AndroidAutomotive.nitro';
export * from './templates/GridTemplate';
export * from './templates/InformationTemplate';
export * from './templates/ListTemplate';
export * from './templates/MapTemplate';
export * from './templates/MessageTemplate';
export * from './templates/SearchTemplate';
export * from './templates/SignInTemplate';
export * from './templates/Template';
export * from './types/Button';
export * from './types/Event';
export * from './types/Image';
export * from './types/Maneuver';
export * from './types/RootComponent';
export * from './types/SignInMethod';
export * from './types/Telemetry';
export * from './types/Text';
export * from './types/Trip';
export * from './utils/ErrorUtil';
export { setIconFont } from './utils/NitroImage';
