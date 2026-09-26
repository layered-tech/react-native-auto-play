"use strict";
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
exports.setIconFont = exports.CarUxRestrictions = exports.AutoPlayModules = exports.HybridAndroidAutomotive = exports.HybridVoice = exports.HybridAutoPlay = exports.HybridAndroidWindowInformation = exports.HybridAndroidAutoTelemetry = void 0;
const react_native_1 = require("react-native");
const react_native_nitro_modules_1 = require("react-native-nitro-modules");
const HybridAndroidAutoTelemetry_1 = require("./hybrid/HybridAndroidAutoTelemetry");
Object.defineProperty(exports, "HybridAndroidAutoTelemetry", { enumerable: true, get: function () { return HybridAndroidAutoTelemetry_1.HybridAndroidAutoTelemetry; } });
const HybridAndroidWindowInformation_1 = require("./hybrid/HybridAndroidWindowInformation");
Object.defineProperty(exports, "HybridAndroidWindowInformation", { enumerable: true, get: function () { return HybridAndroidWindowInformation_1.HybridAndroidWindowInformation; } });
const HybridAutoPlay_1 = require("./hybrid/HybridAutoPlay");
Object.defineProperty(exports, "HybridAutoPlay", { enumerable: true, get: function () { return HybridAutoPlay_1.HybridAutoPlay; } });
const HybridVoice_1 = require("./hybrid/HybridVoice");
Object.defineProperty(exports, "HybridVoice", { enumerable: true, get: function () { return HybridVoice_1.HybridVoice; } });
exports.HybridAndroidAutomotive = react_native_1.Platform.OS === 'android'
    ? react_native_nitro_modules_1.NitroModules.createHybridObject('AndroidAutomotive')
    : null;
/**
 * These are the static module names for the app running on the mobile device, head unit screen and the CarPlay dashboard.
 * Clusters generate uuids on native side that are passed in the RootComponentInitialProps
 */
var AutoPlayModules;
(function (AutoPlayModules) {
    AutoPlayModules["App"] = "main";
    AutoPlayModules["AutoPlayRoot"] = "AutoPlayRoot";
    AutoPlayModules["CarPlayDashboard"] = "CarPlayDashboard";
})(AutoPlayModules || (exports.AutoPlayModules = AutoPlayModules = {}));
__exportStar(require("./Constants"), exports);
__exportStar(require("./components/SafeAreaView"), exports);
__exportStar(require("./hooks/useAndroidAutoTelemetry"), exports);
__exportStar(require("./hooks/useFocusedEffect"), exports);
__exportStar(require("./hooks/useMapTemplate"), exports);
__exportStar(require("./hooks/useSafeAreaInsets"), exports);
__exportStar(require("./hooks/useVoiceInput"), exports);
__exportStar(require("./scenes/AutoPlayCluster"), exports);
__exportStar(require("./scenes/CarPlayDashboardScene"), exports);
var AndroidAutomotive_nitro_1 = require("./specs/AndroidAutomotive.nitro");
Object.defineProperty(exports, "CarUxRestrictions", { enumerable: true, get: function () { return AndroidAutomotive_nitro_1.CarUxRestrictions; } });
__exportStar(require("./templates/GridTemplate"), exports);
__exportStar(require("./templates/InformationTemplate"), exports);
__exportStar(require("./templates/ListTemplate"), exports);
__exportStar(require("./templates/MapTemplate"), exports);
__exportStar(require("./templates/MessageTemplate"), exports);
__exportStar(require("./templates/SearchTemplate"), exports);
__exportStar(require("./templates/SignInTemplate"), exports);
__exportStar(require("./templates/Template"), exports);
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
var NitroImage_1 = require("./utils/NitroImage");
Object.defineProperty(exports, "setIconFont", { enumerable: true, get: function () { return NitroImage_1.setIconFont; } });
