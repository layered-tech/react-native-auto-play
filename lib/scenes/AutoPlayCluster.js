import React from 'react';
import { AppRegistry, Platform } from 'react-native';
import { NitroModules } from 'react-native-nitro-modules';
import { SafeAreaInsetsProvider } from '../components/SafeAreaInsetsContext';
import { WindowInformationWrapper } from '../components/WindowInformationWrapper';
import { convertAutoManeuver, NavigationStopReason } from '../templates/MapTemplate';
import { NitroImageUtil } from '../utils/NitroImage';
const HybridCluster = NitroModules.createHybridObject('Cluster');
class Cluster {
    component = null;
    attributedInactiveDescriptionVariants = [];
    connectionStateListeners = new Set();
    /**
     * Holds all cluster scene/session IDs and if they have a window/surface connected
     */
    clusters = {};
    constructor() {
        HybridCluster.addListener('didConnect', (clusterId) => {
            if (this.clusters[clusterId] != null) {
                // in case didConnectWithWindow fires before didConnect
                return;
            }
            this.clusters[clusterId] = false;
            this.applyAttributedInactiveDescriptionVariants();
            this.emitConnectionState();
        });
        HybridCluster.addListener('didConnectWithWindow', (clusterId) => {
            this.clusters[clusterId] = false;
            this.emitConnectionState();
            this.registerComponent().catch((e) => {
                console.error(e);
            });
        });
        HybridCluster.addListener('didDisconnectFromWindow', (clusterId) => {
            if (this.clusters[clusterId] == null) {
                // in case didDisconnect fires before didDisconnectFromWindow
                return;
            }
            this.clusters[clusterId] = false;
            this.emitConnectionState();
        });
        HybridCluster.addListener('didDisconnect', (clusterId) => {
            delete this.clusters[clusterId];
            this.emitConnectionState();
        });
    }
    emitConnectionState() {
        const isConnected = this.hasConnectedSessions();
        for (const listener of this.connectionStateListeners) {
            listener(isConnected);
        }
    }
    async registerComponent() {
        const { component } = this;
        if (component == null) {
            return;
        }
        const clusterIds = Object.entries(this.clusters)
            .filter(([_, registered]) => !registered)
            .map(([clusterId]) => clusterId);
        for (const clusterId of clusterIds) {
            AppRegistry.registerComponent(clusterId, () => (props) => React.createElement(SafeAreaInsetsProvider, {
                moduleName: clusterId,
                // biome-ignore lint/correctness/noChildrenProp: there is no other way in a ts file
                children: React.createElement(WindowInformationWrapper, {
                    moduleName: clusterId,
                    component,
                    componentProps: props,
                }),
            }));
            this.clusters[clusterId] = true;
            await HybridCluster.initRootView(clusterId);
        }
        this.applyAttributedInactiveDescriptionVariants();
    }
    applyAttributedInactiveDescriptionVariants() {
        if (Platform.OS !== 'ios') {
            return;
        }
        const variants = this.attributedInactiveDescriptionVariants.map((v) => ({
            ...v,
            images: v.images?.map((i) => ({ ...i, image: NitroImageUtil.convert(i.image) })),
        }));
        for (const clusterId of Object.keys(this.clusters)) {
            HybridCluster.setAttributedInactiveDescriptionVariants(clusterId, variants);
        }
    }
    setComponent(component) {
        if (this.component != null) {
            throw new Error('ClusterScene.setComponent can be called once only');
        }
        this.component = component;
        return this.registerComponent();
    }
    hasConnectedSessions() {
        return Object.keys(this.clusters).length > 0;
    }
    addConnectionStateListener(callback) {
        this.connectionStateListeners.add(callback);
        callback(this.hasConnectedSessions());
        return () => {
            this.connectionStateListeners.delete(callback);
        };
    }
    /**
     * Registers callbacks used by Android when a cluster session is the only
     * active car session.
     * @namespace Android
     */
    setNavigationCallbacks({ onStopNavigation, onAutoDriveEnabled, }) {
        if (Platform.OS !== 'android') {
            return;
        }
        HybridCluster.setNavigationCallbacks(onStopNavigation, onAutoDriveEnabled);
    }
    /** @namespace Android */
    startNavigation(trip) {
        if (Platform.OS !== 'android') {
            return;
        }
        HybridCluster.startNavigation(trip);
    }
    /** @namespace Android */
    updateTravelEstimates(steps) {
        if (Platform.OS !== 'android') {
            return;
        }
        HybridCluster.updateTravelEstimates(steps);
    }
    /** @namespace Android */
    updateManeuvers(maneuvers) {
        if (Platform.OS !== 'android') {
            return;
        }
        HybridCluster.updateManeuvers(convertAutoManeuver(maneuvers));
    }
    /** @namespace Android */
    stopNavigation(reason = NavigationStopReason.Cancelled) {
        if (Platform.OS !== 'android') {
            return;
        }
        HybridCluster.stopNavigation(reason);
    }
    /**
     * sets the text that is shown while no navigation is ongoing
     * applies specified strings to all connected cluster of content type "Instruction Card"
     * @namespace iOS
     */
    setAttributedInactiveDescriptionVariants(attributedInactiveDescriptionVariants) {
        if (Platform.OS !== 'ios') {
            console.warn(`ClusterScene.setAttributedInactiveDescriptionVariants not supported for ${Platform.OS}`);
            return;
        }
        this.attributedInactiveDescriptionVariants = attributedInactiveDescriptionVariants;
        this.applyAttributedInactiveDescriptionVariants();
    }
    addListenerColorScheme(callback) {
        return HybridCluster.addListenerColorScheme(callback);
    }
    /**
     * add listener for cluster zoom buttons
     * @namespace iOS
     */
    addListenerZoom(callback) {
        if (Platform.OS !== 'ios') {
            return;
        }
        return HybridCluster.addListenerZoom(callback);
    }
    /**
     * add listener for compass enable/disable
     * @namespace iOS
     */
    addListenerCompass(callback) {
        if (Platform.OS !== 'ios') {
            return;
        }
        return HybridCluster.addListenerCompass(callback);
    }
    /**
     * add listener for speed limit enable/disable
     * @namespace iOS
     */
    addListenerSpeedLimit(callback) {
        if (Platform.OS !== 'ios') {
            return;
        }
        return HybridCluster.addListenerSpeedLimit(callback);
    }
}
/**
 * @namespace Android
 * @namespace iOS >= 15.4
 */
export const AutoPlayCluster = new Cluster();
