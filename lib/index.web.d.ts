import { View, type ViewProps } from 'react-native';
import type { AndroidAutomotive } from './specs/AndroidAutomotive.nitro';
import type { AutoPlay } from './specs/AutoPlay.nitro';
import type { Voice } from './specs/Voice.nitro';
import type { GridTemplate as RealGridTemplate } from './templates/GridTemplate';
import type { InformationTemplate as RealInformationTemplate } from './templates/InformationTemplate';
import type { ListTemplate as RealListTemplate } from './templates/ListTemplate';
import type { MapTemplate as RealMapTemplate } from './templates/MapTemplate';
import type { MessageTemplate as RealMessageTemplate } from './templates/MessageTemplate';
import type { SearchTemplate as RealSearchTemplate } from './templates/SearchTemplate';
import type { SignInTemplate as RealSignInTemplate } from './templates/SignInTemplate';
import type { Template as RealTemplate } from './templates/Template';
import type { SafeAreaInsets } from './types/Event';
import type { Telemetry } from './types/Telemetry';
export * from './Constants';
export * from './hooks/useMapTemplate';
export type { ActiveCarUxRestrictions, AppFocusState, } from './specs/AndroidAutomotive.nitro';
export { CarUxRestrictions } from './specs/AndroidAutomotive.nitro';
export type { GridImageSize, GridTemplateConfig } from './templates/GridTemplate';
export type { InformationItems, InformationTemplateConfig } from './templates/InformationTemplate';
export type { DefaultRow, ListImageType, ListTemplateConfig, MultiSection, RadioRow, Section, SingleSection, TextRow, ToggleRow, WaypointCoordinate, WaypointRow, } from './templates/ListTemplate';
export type { BaseMapTemplateConfig, ChargerLocation, ChargerOutlet, ChargingConnector, HeaderActionsAndroidMap, MapButtons, MapHeaderActions, MapTemplateConfig, OptionsPanelChargerSection, OptionsPanelConfig, OptionsPanelGridSection, OptionsPanelListSection, OptionsPanelSection, PanelActionsIos, PanelHeaderActions, Point, TripSelectorCallback, VisibleTravelEstimate, } from './templates/MapTemplate';
export type { MessageTemplateConfig } from './templates/MessageTemplate';
export type { SearchSection, SearchTemplateConfig } from './templates/SearchTemplate';
export type { SignInTemplateConfig } from './templates/SignInTemplate';
export type { ActionButton, HeaderActions, HeaderActionsAndroid, HeaderActionsIos, NitroBaseMapTemplateConfig, NitroTemplateConfig, TemplateConfig, } from './templates/Template';
export * from './types/Button';
export * from './types/Event';
export * from './types/Image';
export * from './types/Maneuver';
export * from './types/RootComponent';
export * from './types/SignInMethod';
export * from './types/Telemetry';
export * from './types/Text';
export * from './types/Trip';
export type { VoiceInputChunk, VoiceInputOptions, VoiceInputResult } from './types/Voice';
export * from './utils/ErrorUtil';
export type { AlertPriority, NavigationAlert as Alert, NavigationAlertAction as AlertAction, } from './utils/NitroAlert';
export type { ThemedColor } from './utils/NitroColor';
export type { GridButton } from './utils/NitroGrid';
export declare enum AutoPlayModules {
    App = "main",
    AutoPlayRoot = "AutoPlayRoot",
    CarPlayDashboard = "CarPlayDashboard"
}
export declare const useSafeAreaInsets: () => SafeAreaInsets;
export declare const SafeAreaView: (props: ViewProps) => import("react").CElement<ViewProps, View>;
export declare function setIconFont(_name: string, _glyphMap?: Record<string, number>): void;
export declare const useFocusedEffect: () => void;
export declare const useVoiceInput: () => {
    voiceInputResult: undefined;
    resetVoiceInputResult: () => void;
};
export declare const useAndroidAutoTelemetry: () => {
    permissionsGranted: boolean | null;
    telemetry: Telemetry | undefined;
    error: string | undefined;
};
export declare const AutoPlayCluster: Record<string, unknown>;
export declare const CarPlayDashboard: Record<string, unknown>;
export declare const HybridAndroidAutomotive: AndroidAutomotive | null;
export { HybridAndroidAutoTelemetry } from './hybrid/HybridAndroidAutoTelemetry';
export { HybridAndroidWindowInformation } from './hybrid/HybridAndroidWindowInformation';
export declare const HybridAutoPlay: AutoPlay;
export declare const HybridVoice: Voice;
export declare const Template: new (...args: never[]) => RealTemplate<unknown, unknown>;
export declare const ListTemplate: new (...args: never[]) => RealListTemplate;
export declare const GridTemplate: new (...args: never[]) => RealGridTemplate;
export declare const InformationTemplate: new (...args: never[]) => RealInformationTemplate;
export declare const MessageTemplate: new (...args: never[]) => RealMessageTemplate;
export declare const MapTemplate: new (...args: never[]) => RealMapTemplate;
export declare const SearchTemplate: new (...args: never[]) => RealSearchTemplate;
export declare const SignInTemplate: new (...args: never[]) => RealSignInTemplate;
