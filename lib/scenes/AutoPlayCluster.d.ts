import React from 'react';
import type { ZoomEvent } from '../specs/Cluster.nitro';
import type { ColorScheme, RootComponentInitialProps } from '../types/RootComponent';
import type { AutoAttributedString } from '../utils/NitroAttributedString';
declare class Cluster {
    private component;
    private attributedInactiveDescriptionVariants;
    /**
     * Holds all cluster scene/session IDs and if they have a window/surface connected
     */
    private clusters;
    constructor();
    private registerComponent;
    private applyAttributedInactiveDescriptionVariants;
    setComponent(component: React.ComponentType<RootComponentInitialProps>): Promise<void>;
    /**
     * sets the text that is shown while no navigation is ongoing
     * applies specified strings to all connected cluster of content type "Instruction Card"
     * @namespace iOS
     */
    setAttributedInactiveDescriptionVariants(attributedInactiveDescriptionVariants: Array<AutoAttributedString>): void;
    addListenerColorScheme(callback: (clusterId: string, payload: ColorScheme) => void): import("..").CleanupCallback;
    /**
     * add listener for cluster zoom buttons
     * @namespace iOS
     */
    addListenerZoom(callback: (clusterId: string, payload: ZoomEvent) => void): import("..").CleanupCallback | undefined;
    /**
     * add listener for compass enable/disable
     * @namespace iOS
     */
    addListenerCompass(callback: (clusterId: string, payload: boolean) => void): import("..").CleanupCallback | undefined;
    /**
     * add listener for speed limit enable/disable
     * @namespace iOS
     */
    addListenerSpeedLimit(callback: (clusterId: string, payload: boolean) => void): import("..").CleanupCallback | undefined;
}
/**
 * @namespace Android
 * @namespace iOS >= 15.4
 */
export declare const AutoPlayCluster: Cluster;
export {};
