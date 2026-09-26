import type { HybridObject } from 'react-native-nitro-modules';
import type { NavigationStopReason } from '../templates/MapTemplate';
import type { CleanupCallback } from '../types/Event';
import type { ColorScheme } from '../types/RootComponent';
import type { TripConfig, TripPoint } from '../types/Trip';
import type { NitroAttributedString } from '../utils/NitroAttributedString';
import type { NitroManeuver } from '../utils/NitroManeuver';
type ClusterEventName = 'didConnect' | 'didConnectWithWindow' | 'didDisconnect' | 'didDisconnectFromWindow';
export type ZoomEvent = 'in' | 'out';
export interface Cluster extends HybridObject<{
    android: 'kotlin';
    ios: 'swift';
}> {
    addListener(eventType: ClusterEventName, callback: (clusterId: string) => void): CleanupCallback;
    initRootView(clusterId: string): Promise<void>;
    setAttributedInactiveDescriptionVariants(clusterId: string, attributedInactiveDescriptionVariants: Array<NitroAttributedString>): void;
    addListenerColorScheme(callback: (clusterId: string, payload: ColorScheme) => void): CleanupCallback;
    addListenerZoom(callback: (clusterId: string, payload: ZoomEvent) => void): CleanupCallback;
    addListenerCompass(callback: (clusterId: string, payload: boolean) => void): CleanupCallback;
    addListenerSpeedLimit(callback: (clusterId: string, payload: boolean) => void): CleanupCallback;
    setNavigationCallbacks(onStopNavigation: () => void, onAutoDriveEnabled?: () => void): void;
    startNavigation(trip: TripConfig): void;
    updateTravelEstimates(steps: Array<TripPoint>): void;
    updateManeuvers(maneuvers: NitroManeuver): void;
    stopNavigation(reason: NavigationStopReason): void;
}
export {};
