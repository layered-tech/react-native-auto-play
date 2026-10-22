"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarPlayDashboard = void 0;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const react_native_nitro_modules_1 = require("react-native-nitro-modules");
const SafeAreaInsetsContext_1 = require("../components/SafeAreaInsetsContext");
const HybridAutoPlay_1 = require("../hybrid/HybridAutoPlay");
const NitroImage_1 = require("../utils/NitroImage");
const HybridCarPlayDashboard = react_native_1.Platform.OS === 'ios'
    ? react_native_nitro_modules_1.NitroModules.createHybridObject('CarPlayDashboard')
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
            react_native_1.AppRegistry.registerComponent(this.id, () => (props) => react_1.default.createElement(SafeAreaInsetsContext_1.SafeAreaInsetsProvider, {
                moduleName: this.id,
                // biome-ignore lint/correctness/noChildrenProp: there is no other way in a ts file
                children: react_1.default.createElement(component, props),
            }));
            this.componentRegistered = true;
        }
        if (isConnected) {
            HybridCarPlayDashboard.initRootView();
        }
    }
    setComponent(component) {
        if (react_native_1.Platform.OS !== 'ios') {
            console.warn(`CarPlayDashboard.setComponent is not supported on ${react_native_1.Platform.OS}`);
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
            console.warn(`CarPlayDashboard.setButtons is not supported on ${react_native_1.Platform.OS}`);
            return;
        }
        HybridCarPlayDashboard.setButtons(buttons.map((button) => ({ ...button, image: NitroImage_1.NitroImageUtil.convert(button.image) })));
    }
    /**
     * attach a listener for generic notifications like didConnect, didDisconnect, ...
     * @namespace iOS
     * @param eventType generic events
     * @returns callback to remove the listener
     */
    addListener(event, callback) {
        if (HybridCarPlayDashboard == null) {
            throw new Error(`CarPlayDashboard.addListener is not supported on ${react_native_1.Platform.OS}`);
        }
        return HybridCarPlayDashboard.addListener(event, callback);
    }
    addListenerRenderState(callback) {
        if (HybridCarPlayDashboard == null) {
            throw new Error(`CarPlayDashboard.addListener is not supported on ${react_native_1.Platform.OS}`);
        }
        return HybridAutoPlay_1.HybridAutoPlay.addListenerRenderState(this.id, callback);
    }
    addListenerColorScheme(callback) {
        if (HybridCarPlayDashboard == null) {
            throw new Error(`CarPlayDashboard.addListener is not supported on ${react_native_1.Platform.OS}`);
        }
        return HybridCarPlayDashboard.addListenerColorScheme(callback);
    }
}
exports.CarPlayDashboard = new Dashboard();
