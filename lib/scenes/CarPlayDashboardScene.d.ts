import React from 'react';
import type { BaseCarPlayDashboardButton } from '../specs/CarPlayDashboard.nitro';
import type { EventName, VisibilityState } from '../types/Event';
import type { AutoImage } from '../types/Image';
import type { ColorScheme, RootComponentInitialProps } from '../types/RootComponent';
export interface CarPlayDashboardButton extends BaseCarPlayDashboardButton {
    image: AutoImage;
}
export type CarPlayDashboardEvent = EventName | VisibilityState;
declare class Dashboard {
    private component;
    private componentRegistered;
    isConnected: boolean;
    readonly id = "CarPlayDashboard";
    constructor();
    private setIsConnected;
    private registerComponent;
    setComponent(component: React.ComponentType<RootComponentInitialProps>): void;
    /**
     * sets the dashboard shortcut buttons, make sure to supply at least one button as soon as possible,
     * otherwise the dashboard will not show up!
     * @namespace iOS
     */
    setButtons(buttons: Array<CarPlayDashboardButton>): void;
    /**
     * attach a listener for generic notifications like didConnect, didDisconnect, ...
     * @namespace iOS
     * @param eventType generic events
     * @returns callback to remove the listener
     */
    addListener(event: EventName, callback: () => void): import("..").CleanupCallback;
    addListenerRenderState(callback: (payload: VisibilityState) => void): import("..").CleanupCallback;
    addListenerColorScheme(callback: (payload: ColorScheme) => void): import("..").CleanupCallback;
}
export declare const CarPlayDashboard: Dashboard;
export {};
