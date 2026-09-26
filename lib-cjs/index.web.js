"use strict";
// Web/Jest stub for the native CarPlay/Android Auto surface. Nothing here talks to a real native
// module — every function call resolves to `undefined` (or an already-resolved promise, which is
// indistinguishable from `undefined` to an `await`er) rather than throwing. Types are preserved by
// casting against the real exports, so callers still get full type-checking/autocomplete.
//
// Anything below that's already safe as-is (pure types, plain enums, or modules that neither
// create native objects nor import anything that does) is re-exported directly instead of stubbed.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignInTemplate = exports.SearchTemplate = exports.MapTemplate = exports.MessageTemplate = exports.InformationTemplate = exports.GridTemplate = exports.ListTemplate = exports.Template = exports.HybridVoice = exports.HybridAutoPlay = exports.HybridAndroidWindowInformation = exports.HybridAndroidAutoTelemetry = exports.HybridAndroidAutomotive = exports.CarPlayDashboard = exports.AutoPlayCluster = exports.useAndroidAutoTelemetry = exports.useVoiceInput = exports.useFocusedEffect = exports.SafeAreaView = exports.useSafeAreaInsets = exports.AutoPlayModules = exports.CarUxRestrictions = void 0;
exports.setIconFont = setIconFont;
const react_1 = require("react");
const react_native_1 = require("react-native");
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
__exportStar(require("./Constants"), exports);
__exportStar(require("./hooks/useMapTemplate"), exports);
var AndroidAutomotive_nitro_1 = require("./specs/AndroidAutomotive.nitro");
Object.defineProperty(exports, "CarUxRestrictions", { enumerable: true, get: function () { return AndroidAutomotive_nitro_1.CarUxRestrictions; } });
__exportStar(require("./types/Button"), exports);
__exportStar(require("./types/Event"), exports);
__exportStar(require("./types/Image"), exports);
__exportStar(require("./types/Maneuver"), exports);
__exportStar(require("./types/RootComponent"), exports);
__exportStar(require("./types/SignInMethod"), exports);
__exportStar(require("./types/Telemetry"), exports);
__exportStar(require("./types/Text"), exports);
__exportStar(require("./types/Trip"), exports);
__exportStar(require("./utils/ErrorUtil"), exports);
var AutoPlayModules;
(function (AutoPlayModules) {
    AutoPlayModules["App"] = "main";
    AutoPlayModules["AutoPlayRoot"] = "AutoPlayRoot";
    AutoPlayModules["CarPlayDashboard"] = "CarPlayDashboard";
})(AutoPlayModules || (exports.AutoPlayModules = AutoPlayModules = {}));
const NO_INSETS = { top: 0, bottom: 0, left: 0, right: 0 };
const useSafeAreaInsets = () => NO_INSETS;
exports.useSafeAreaInsets = useSafeAreaInsets;
const SafeAreaView = (props) => (0, react_1.createElement)(react_native_1.View, props);
exports.SafeAreaView = SafeAreaView;
function setIconFont(_name, _glyphMap) { }
const useFocusedEffect = () => { };
exports.useFocusedEffect = useFocusedEffect;
const useVoiceInput = () => ({
    voiceInputResult: undefined,
    resetVoiceInputResult: () => { },
});
exports.useVoiceInput = useVoiceInput;
const useAndroidAutoTelemetry = () => ({
    permissionsGranted: null,
    telemetry: undefined,
    error: undefined,
});
exports.useAndroidAutoTelemetry = useAndroidAutoTelemetry;
exports.AutoPlayCluster = createNoopObject();
exports.CarPlayDashboard = createNoopObject();
exports.HybridAndroidAutomotive = null;
var HybridAndroidAutoTelemetry_1 = require("./hybrid/HybridAndroidAutoTelemetry");
Object.defineProperty(exports, "HybridAndroidAutoTelemetry", { enumerable: true, get: function () { return HybridAndroidAutoTelemetry_1.HybridAndroidAutoTelemetry; } });
var HybridAndroidWindowInformation_1 = require("./hybrid/HybridAndroidWindowInformation");
Object.defineProperty(exports, "HybridAndroidWindowInformation", { enumerable: true, get: function () { return HybridAndroidWindowInformation_1.HybridAndroidWindowInformation; } });
exports.HybridAutoPlay = createNoopObject();
exports.HybridVoice = createNoopObject();
exports.Template = createNoopClass();
exports.ListTemplate = createNoopClass();
exports.GridTemplate = createNoopClass();
exports.InformationTemplate = createNoopClass();
exports.MessageTemplate = createNoopClass();
exports.MapTemplate = createNoopClass();
exports.SearchTemplate = createNoopClass();
exports.SignInTemplate = createNoopClass();
