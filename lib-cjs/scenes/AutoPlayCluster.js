"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoPlayCluster = void 0;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const react_native_nitro_modules_1 = require("react-native-nitro-modules");
const SafeAreaInsetsContext_1 = require("../components/SafeAreaInsetsContext");
const WindowInformationWrapper_1 = require("../components/WindowInformationWrapper");
const NitroImage_1 = require("../utils/NitroImage");
const HybridCluster = react_native_nitro_modules_1.NitroModules.createHybridObject('Cluster');
class Cluster {
    component = null;
    attributedInactiveDescriptionVariants = [];
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
        });
        HybridCluster.addListener('didConnectWithWindow', (clusterId) => {
            this.clusters[clusterId] = false;
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
        });
        HybridCluster.addListener('didDisconnect', (clusterId) => {
            delete this.clusters[clusterId];
        });
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
            react_native_1.AppRegistry.registerComponent(clusterId, () => (props) => react_1.default.createElement(SafeAreaInsetsContext_1.SafeAreaInsetsProvider, {
                moduleName: clusterId,
                // biome-ignore lint/correctness/noChildrenProp: there is no other way in a ts file
                children: react_1.default.createElement(WindowInformationWrapper_1.WindowInformationWrapper, {
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
        if (react_native_1.Platform.OS !== 'ios') {
            return;
        }
        const variants = this.attributedInactiveDescriptionVariants.map((v) => ({
            ...v,
            images: v.images?.map((i) => ({ ...i, image: NitroImage_1.NitroImageUtil.convert(i.image) })),
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
    /**
     * sets the text that is shown while no navigation is ongoing
     * applies specified strings to all connected cluster of content type "Instruction Card"
     * @namespace iOS
     */
    setAttributedInactiveDescriptionVariants(attributedInactiveDescriptionVariants) {
        if (react_native_1.Platform.OS !== 'ios') {
            console.warn(`ClusterScene.setAttributedInactiveDescriptionVariants not supported for ${react_native_1.Platform.OS}`);
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
        if (react_native_1.Platform.OS !== 'ios') {
            return;
        }
        return HybridCluster.addListenerZoom(callback);
    }
    /**
     * add listener for compass enable/disable
     * @namespace iOS
     */
    addListenerCompass(callback) {
        if (react_native_1.Platform.OS !== 'ios') {
            return;
        }
        return HybridCluster.addListenerCompass(callback);
    }
    /**
     * add listener for speed limit enable/disable
     * @namespace iOS
     */
    addListenerSpeedLimit(callback) {
        if (react_native_1.Platform.OS !== 'ios') {
            return;
        }
        return HybridCluster.addListenerSpeedLimit(callback);
    }
}
/**
 * @namespace Android
 * @namespace iOS >= 15.4
 */
exports.AutoPlayCluster = new Cluster();
