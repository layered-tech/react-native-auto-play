// Web/Jest stub for the native CarPlay/Android Auto surface. Nothing here talks to a real native
// module — every function call resolves to `undefined` (or an already-resolved promise, which is
// indistinguishable from `undefined` to an `await`er) rather than throwing. Types are preserved by
// casting against the real exports, so callers still get full type-checking/autocomplete.
//
// Anything below that's already safe as-is (pure types, plain enums, or modules that neither
// create native objects nor import anything that does) is re-exported directly instead of stubbed.
import { createElement } from 'react';
import { View } from 'react-native';
function noop() {
    return undefined;
}
/** Any property access returns a no-op function, so any method call is safe regardless of name. */
function createNoopObject() {
    return new Proxy({}, {
        get: (_target, prop) => (prop === 'then' || prop === 'toJSON' ? undefined : noop),
    });
}
function createNoopClass() {
    function NoopInstance() {
        return createNoopObject();
    }
    return NoopInstance;
}
export * from './Constants';
export * from './hooks/useMapTemplate';
export { CarUxRestrictions } from './specs/AndroidAutomotive.nitro';
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
export var AutoPlayModules;
(function (AutoPlayModules) {
    AutoPlayModules["App"] = "main";
    AutoPlayModules["AutoPlayRoot"] = "AutoPlayRoot";
    AutoPlayModules["CarPlayDashboard"] = "CarPlayDashboard";
})(AutoPlayModules || (AutoPlayModules = {}));
const NO_INSETS = { top: 0, bottom: 0, left: 0, right: 0 };
export const useSafeAreaInsets = () => NO_INSETS;
export const SafeAreaView = (props) => createElement(View, props);
export function setIconFont(_name, _glyphMap) { }
export const useFocusedEffect = () => { };
export const useVoiceInput = () => ({
    voiceInputResult: undefined,
    resetVoiceInputResult: () => { },
});
export const useAndroidAutoTelemetry = () => ({
    permissionsGranted: null,
    telemetry: undefined,
    error: undefined,
});
export const AutoPlayCluster = createNoopObject();
export const CarPlayDashboard = createNoopObject();
export const HybridAndroidAutomotive = null;
export { HybridAndroidAutoTelemetry } from './hybrid/HybridAndroidAutoTelemetry';
export { HybridAndroidWindowInformation } from './hybrid/HybridAndroidWindowInformation';
export const HybridAutoPlay = createNoopObject();
export const HybridVoice = createNoopObject();
export const Template = createNoopClass();
export const ListTemplate = createNoopClass();
export const GridTemplate = createNoopClass();
export const InformationTemplate = createNoopClass();
export const MessageTemplate = createNoopClass();
export const MapTemplate = createNoopClass();
export const SearchTemplate = createNoopClass();
export const SignInTemplate = createNoopClass();
