import React from 'react';
import { AppRegistry, Platform } from 'react-native';
import { NitroModules } from 'react-native-nitro-modules';
import { SafeAreaInsetsProvider } from '../components/SafeAreaInsetsContext';
import { HybridAutoPlay } from '../hybrid/HybridAutoPlay';
import { NitroImageUtil } from '../utils/NitroImage';
const HybridCarPlayDashboard = Platform.OS === 'ios'
    ? NitroModules.createHybridObject('CarPlayDashboard')
    : null;
class Dashboard {
    component = null;
    componentRegistered = false;
    isConnected = false;
    id = 'CarPlayDashboard';
    constructor() {
        if (HybridCarPlayDashboard == null) {
            return;
        }
        HybridCarPlayDashboard.addListener('didConnect', () => this.setIsConnected(true));
        HybridCarPlayDashboard.addListener('didDisconnect', () => this.setIsConnected(false));
    }
    setIsConnected(isConnected) {
        this.isConnected = isConnected;
        this.registerComponent();
    }
    registerComponent() {
        if (HybridCarPlayDashboard == null) {
            return;
        }
        const { component, isConnected } = this;
        if (component == null) {
            return;
        }
        if (!this.componentRegistered) {
            AppRegistry.registerComponent(this.id, () => (props) => React.createElement(SafeAreaInsetsProvider, {
                moduleName: this.id,
                // biome-ignore lint/correctness/noChildrenProp: there is no other way in a ts file
                children: React.createElement(component, props),
            }));
            this.componentRegistered = true;
        }
        if (isConnected) {
            HybridCarPlayDashboard.initRootView();
        }
    }
    setComponent(component) {
        if (Platform.OS !== 'ios') {
            console.warn(`CarPlayDashboard.setComponent is not supported on ${Platform.OS}`);
            return;
        }
        if (this.component != null) {
            throw new Error('CarPlayDashboard.setComponent can be called once only');
        }
        this.component = component;
        this.registerComponent();
    }
    /**
     * sets the dashboard shortcut buttons, make sure to supply at least one button as soon as possible,
     * otherwise the dashboard will not show up!
     * @namespace iOS
     */
    setButtons(buttons) {
        if (HybridCarPlayDashboard == null) {
            console.warn(`CarPlayDashboard.setButtons is not supported on ${Platform.OS}`);
            return;
        }
        HybridCarPlayDashboard.setButtons(buttons.map((button) => ({ ...button, image: NitroImageUtil.convert(button.image) })));
    }
    /**
     * attach a listener for generic notifications like didConnect, didDisconnect, ...
     * @namespace iOS
     * @param eventType generic events
     * @returns callback to remove the listener
     */
    addListener(event, callback) {
        if (HybridCarPlayDashboard == null) {
            throw new Error(`CarPlayDashboard.addListener is not supported on ${Platform.OS}`);
        }
        return HybridCarPlayDashboard.addListener(event, callback);
    }
    addListenerRenderState(callback) {
        if (HybridCarPlayDashboard == null) {
            throw new Error(`CarPlayDashboard.addListener is not supported on ${Platform.OS}`);
        }
        return HybridAutoPlay.addListenerRenderState(this.id, callback);
    }
    addListenerColorScheme(callback) {
        if (HybridCarPlayDashboard == null) {
            throw new Error(`CarPlayDashboard.addListener is not supported on ${Platform.OS}`);
        }
        return HybridCarPlayDashboard.addListenerColorScheme(callback);
    }
}
export const CarPlayDashboard = new Dashboard();
