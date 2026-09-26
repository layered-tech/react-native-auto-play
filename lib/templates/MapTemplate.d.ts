import React from 'react';
import type { AutoText } from '..';
import type { ActionButtonAndroid, ImageButton, MapButton, MapPanButton, TextButton } from '../types/Button';
import type { AutoManeuver, ManeuverState, RoutingManeuver } from '../types/Maneuver';
import type { ColorScheme, RootComponentInitialProps } from '../types/RootComponent';
import type { TripConfig, TripPoint, TripPreviewTextConfiguration, TripsConfig } from '../types/Trip';
import { type NitroAction } from '../utils/NitroAction';
import { type NavigationAlert } from '../utils/NitroAlert';
import { type NitroColor, type ThemedColor } from '../utils/NitroColor';
import { type NitroManeuver } from '../utils/NitroManeuver';
import { NitroMapButton } from '../utils/NitroMapButton';
import { type OptionsPanelConfig } from '../utils/NitroOptionsPanel';
import { type HeaderActionsIos, type NitroBaseMapTemplateConfig, Template, type TemplateConfig } from './Template';
export type { ChargerLocation, ChargerOutlet, ChargingConnector, OptionsPanelChargerSection, OptionsPanelConfig, OptionsPanelGridSection, OptionsPanelListSection, OptionsPanelSection, } from '../utils/NitroOptionsPanel';
export type Point = {
    x: number;
    y: number;
};
export type VisibleTravelEstimate = 'first' | 'last';
export declare enum NavigationStopReason {
    Arrived = 0,
    Cancelled = 1
}
export type HeaderActionsAndroidMap<T> = Array<ActionButtonAndroid<T>> & {
    length: 1 | 2 | 3 | 4;
};
export interface NitroMapTemplateConfig extends TemplateConfig, NitroBaseMapTemplateConfig {
    /**
     * show either the next or final step travel estimates, defaults to final step so last
     */
    visibleTravelEstimate?: VisibleTravelEstimate;
    /**
     * callback for single finger pan gesture
     * @param translation distance in pixels along the x & y axis that has been scrolled since the last touch position during the scroll event
     * @param velocity the velocity of the pan gesture, iOS only
     */
    onDidPan?: (translation: Point, velocity?: Point) => void;
    /**
     * callback for pinch to zoom gesture
     * @param center x & y coordinate of the focal point in pixels
     * @param scale the scaling factor
     */
    onDidUpdateZoomGestureWithCenter?: (center: Point, scale: number) => void;
    /**
     * single press event callback
     * @param center coordinates of the click event in pixel
     * @namespace Android
     */
    onClick?: (center: Point) => void;
    /**
     * double tap event callback
     * @param center coordinates of the click event in pixel
     * @namespace Android
     */
    onDoubleClick?: (center: Point) => void;
    /**
     * callback for color scheme changes
     */
    onAppearanceDidChange?: (colorScheme: ColorScheme) => void;
    onStopNavigation(): void;
    onAutoDriveEnabled?: () => void;
    mapButtons?: Array<NitroMapButton>;
    headerActions?: Array<NitroAction>;
    defaultGuidanceBackgroundColor?: NitroColor;
    /**
     * specify the percentage of screen height/width the pan button should scroll
     * @namespace iOS
     */
    panButtonScrollPercentage?: 0 | 0.05 | 0.1 | 0.15 | 0.2 | 0.25 | 0.3 | 0.35 | 0.4 | 0.45 | 0.5 | 0.55 | 0.6 | 0.65 | 0.7 | 0.75 | 0.8 | 0.85 | 0.9 | 0.95 | 1;
}
export type MapButtons<T> = Array<MapButton<T> | MapPanButton> & {
    length: 1 | 2 | 3 | 4;
};
export type MapHeaderActions<T> = {
    android?: HeaderActionsAndroidMap<T>;
    ios?: HeaderActionsIos<T>;
};
/**
 * @namespace iOS - not supported; CarPlay has no separate header for the map behind a panel, so
 * the panel template's own `headerActions` are applied to the root map template's nav bar instead.
 */
export type PanelHeaderActions<T> = Omit<MapHeaderActions<T>, 'ios'>;
/**
 * @namespace iOS - a CPMapPanel can only show one CPTextButton (with a title) and one
 * optional icon-only button (any title is dropped natively), so a second action must be an
 * ImageButton rather than a TextButton, and a third action isn't supported at all.
 */
export type PanelActionsIos<T> = [TextButton<T>] | [TextButton<T>, ImageButton<T>];
export type BaseMapTemplateConfig<T> = {
    /**
     * buttons that represent actions on the map template, usually on the bottom right corner
     * @namespace Android - adding a pan button will always make the pan button the first one
     * @namespace iOS - the pan button can be on any position
     */
    mapButtons?: MapButtons<T>;
    /**
     * action buttons, usually at the the top right on Android and a top bar on iOS
     */
    headerActions?: MapHeaderActions<T>;
};
export type MapTemplateConfig = Omit<NitroMapTemplateConfig, 'mapButtons' | 'headerActions' | 'onStopNavigation' | 'onAutoDriveEnabled' | 'defaultGuidanceBackgroundColor'> & BaseMapTemplateConfig<MapTemplate> & {
    /**
     * react component that is rendered
     */
    component: React.ComponentType<RootComponentInitialProps>;
    /**
     * the panel shown when tapping the ellipsis button next to the travel estimates during active navigation (iOS 27+).
     * No-op on Android
     * @namespace iOS
     */
    optionsPanel?: OptionsPanelConfig<MapTemplate>;
    /**
     * Notification that navigation was stopped. May occur when another source such as the car head unit starts navigating.
     * The navigation session on Android Auto/CarPlay is stopped already when this callback is triggered, make sure to stop other things like TTS too.
     */
    onStopNavigation(template: MapTemplate): void;
    /**
     * Notifies the app that, from this point onwards, when the user chooses to navigate to a destination, the app should start simulating a drive towards that destination.
     * @namespace Android
     */
    onAutoDriveEnabled?: (template: MapTemplate) => void;
    /**
     * Use this to set the default maneuver background color on iOS.
     * Only used when starting navigation and not providing any maneuvers yet,
     * visible on the system provided loading maneuver then.
     * @namespace iOS
     */
    defaultGuidanceBackgroundColor?: ThemedColor | string;
};
export interface TripSelectorCallback {
    setSelectedTrip: (id: string) => void;
}
export declare function convertAutoManeuver(maneuvers: AutoManeuver): NitroManeuver;
export declare class MapTemplate extends Template<MapTemplateConfig, MapTemplateConfig['headerActions']> {
    id: string;
    private template;
    constructor(config: MapTemplateConfig);
    /**
     * @namespace iOS updates the panel shown when tapping the ellipsis button
     * next to the travel estimates during navigation (iOS 27+).
     */
    updateOptionsPanel(optionsPanel?: OptionsPanelConfig<MapTemplate>): Promise<void> | undefined;
    setMapButtons(mapButtons: MapTemplateConfig['mapButtons']): Promise<void>;
    setHeaderActions(headerActions: MapTemplateConfig['headerActions']): Promise<void>;
    /**
     * brings up a navigation alert
     * ⚠️ updating an existing alert is currently broken on Android Automotive, it brings up a new alert for each call
     * @returns a callback to dismiss or update the navigation alert
     */
    showAlert(alert: NavigationAlert): void;
    updateAlert(alertId: number, title: AutoText, subtitle?: AutoText): void;
    dismissAlert(alertId: number): void;
    /**
     * @namespace Android brings up a custom trip selector mimicking the CarPlay trip selector as close as possible
     * @namespace iOS brings up the stock CarPlay trip selector
     * @returns a callback to update the shown trip
     */
    showTripSelector({ trips, selectedTripId, textConfig, onTripSelected, onTripStarted, onBackPressed, mapButtons, }: {
        trips: Array<TripsConfig>;
        selectedTripId?: string;
        textConfig: TripPreviewTextConfiguration;
        onTripSelected: (tripId: string, routeId: string) => void;
        onTripStarted: (tripId: string, routeId: string) => void;
        onBackPressed: () => void;
        /**
         * @namespace iOS - always shown no matter if navigation is started or not
         * @namespace Android - these buttons will only be shown when navigation is not started, otherwise AA will not show them
         */
        mapButtons?: MapTemplateConfig['mapButtons'];
    }): TripSelectorCallback;
    hideTripSelector(): void;
    updateVisibleTravelEstimate(visibleTravelEstimate: VisibleTravelEstimate): void;
    /**
     * updates travel estimates
     * @param steps all future steps, do not put in origin or passed steps
     */
    updateTravelEstimates(steps: Array<TripPoint>): void;
    /**
     * sets or updates maneuvers, make sure to call startNavigation first!
     * @namespace Android sets all the supplied maneuvers whenever called
     * @namespace iOS will update travelEstimates only when passing in maneuvers with the same id
     */
    updateManeuvers(maneuvers: AutoManeuver): void;
    /**
     * Registers the complete known route for vehicle displays while updateManeuvers
     * continues to control the smaller visible maneuver window.
     */
    registerManeuvers(maneuvers: Array<RoutingManeuver>): void;
    /**
     * either use showTripSelector to show a set of trips and let the user start the navigation session
     * or use this to start a navigation session without asking the user
     */
    startNavigation(trip: TripConfig): Promise<void>;
    stopNavigation(reason?: NavigationStopReason): void;
    /**
     * Sets the current maneuver state indicating progress within a maneuver.
     * Transition through: continue → initial → prepare → execute → continue
     * @namespace iOS sets CPManeuverState on the CPNavigationSession, used by instrument cluster and HUD
     * @namespace Android no-op, Android Auto does not have an equivalent API
     */
    setManeuverState(state: ManeuverState): void;
}
