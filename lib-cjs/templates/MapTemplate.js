"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapTemplate = exports.NavigationStopReason = void 0;
exports.convertAutoManeuver = convertAutoManeuver;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const react_native_nitro_modules_1 = require("react-native-nitro-modules");
const MapTemplateContext_1 = require("../components/MapTemplateContext");
const SafeAreaInsetsContext_1 = require("../components/SafeAreaInsetsContext");
const WindowInformationWrapper_1 = require("../components/WindowInformationWrapper");
const HybridAutoPlay_1 = require("../hybrid/HybridAutoPlay");
const NitroAction_1 = require("../utils/NitroAction");
const NitroAlert_1 = require("../utils/NitroAlert");
const NitroColor_1 = require("../utils/NitroColor");
const NitroManeuver_1 = require("../utils/NitroManeuver");
const NitroMapButton_1 = require("../utils/NitroMapButton");
const NitroOptionsPanel_1 = require("../utils/NitroOptionsPanel");
const Template_1 = require("./Template");
const HybridMapTemplate = react_native_nitro_modules_1.NitroModules.createHybridObject('MapTemplate');
var NavigationStopReason;
(function (NavigationStopReason) {
    NavigationStopReason[NavigationStopReason["Arrived"] = 0] = "Arrived";
    NavigationStopReason[NavigationStopReason["Cancelled"] = 1] = "Cancelled";
})(NavigationStopReason || (exports.NavigationStopReason = NavigationStopReason = {}));
function convertRoutingManeuvers(maneuvers) {
    return maneuvers.reduce((convertedManeuvers, maneuver) => {
        if (maneuver != null) {
            convertedManeuvers.push(NitroManeuver_1.NitroManeuverUtil.convert(maneuver));
        }
        return convertedManeuvers;
    }, []);
}
function convertAutoManeuver(maneuvers) {
    if (Array.isArray(maneuvers)) {
        return convertRoutingManeuvers(maneuvers);
    }
    if (maneuvers.type === 'loading') {
        return {
            isLoading: true,
            cardBackgroundColor: NitroColor_1.NitroColorUtil.convert(maneuvers.cardBackgroundColor),
            text: maneuvers.text != null ? maneuvers.text : undefined,
        };
    }
    return NitroManeuver_1.NitroManeuverUtil.convert(maneuvers);
}
class MapTemplate extends Template_1.Template {
    id = 'AutoPlayRoot';
    template = this;
    constructor(config) {
        super(config);
        const { component, mapButtons, headerActions, onStopNavigation, onAutoDriveEnabled, defaultGuidanceBackgroundColor, optionsPanel, ...baseConfig } = config;
        react_native_1.AppRegistry.registerComponent(this.id, () => (props) => react_1.default.createElement(MapTemplateContext_1.MapTemplateProvider, {
            mapTemplate: this.template,
            // biome-ignore lint/correctness/noChildrenProp: there is no other way in a ts file
            children: react_1.default.createElement(SafeAreaInsetsContext_1.SafeAreaInsetsProvider, {
                moduleName: this.id,
                // biome-ignore lint/correctness/noChildrenProp: there is no other way in a ts file
                children: react_1.default.createElement(WindowInformationWrapper_1.WindowInformationWrapper, {
                    moduleName: this.id,
                    component,
                    componentProps: props,
                }),
            }),
        }));
        const nitroConfig = {
            ...baseConfig,
            id: this.id,
            headerActions: NitroAction_1.NitroActionUtil.convert(this.template, headerActions),
            mapButtons: NitroMapButton_1.NitroMapButton.convert(this.template, mapButtons),
            onStopNavigation: () => onStopNavigation(this.template),
            onAutoDriveEnabled: onAutoDriveEnabled ? () => onAutoDriveEnabled(this.template) : undefined,
            defaultGuidanceBackgroundColor: defaultGuidanceBackgroundColor != null
                ? NitroColor_1.NitroColorUtil.convert(defaultGuidanceBackgroundColor)
                : undefined,
        };
        HybridMapTemplate.createMapTemplate(nitroConfig);
        // routed through updateOptionsPanel, not embedded in nitroConfig above — nitrogen can't generate
        // a spec for a variant type nested that deep inside NitroMapTemplateConfig.
        this.updateOptionsPanel(optionsPanel);
    }
    /**
     * @namespace iOS updates the panel shown when tapping the ellipsis button
     * next to the travel estimates during navigation (iOS 27+).
     */
    updateOptionsPanel(optionsPanel) {
        if (react_native_1.Platform.OS !== 'ios') {
            return;
        }
        return HybridMapTemplate.updateOptionsPanel(this.id, NitroOptionsPanel_1.NitroOptionsPanelUtil.convert(this.template, optionsPanel));
    }
    setMapButtons(mapButtons) {
        const buttons = NitroMapButton_1.NitroMapButton.convert(this.template, mapButtons);
        return HybridMapTemplate.setTemplateMapButtons(this.id, buttons);
    }
    setHeaderActions(headerActions) {
        const nitroActions = NitroAction_1.NitroActionUtil.convert(this.template, headerActions);
        return HybridAutoPlay_1.HybridAutoPlay.setTemplateHeaderActions(this.id, nitroActions);
    }
    /**
     * brings up a navigation alert
     * ⚠️ updating an existing alert is currently broken on Android Automotive, it brings up a new alert for each call
     * @returns a callback to dismiss or update the navigation alert
     */
    showAlert(alert) {
        return HybridMapTemplate.showNavigationAlert(this.id, NitroAlert_1.NitroAlertUtil.convert(alert));
    }
    updateAlert(alertId, title, subtitle) {
        HybridMapTemplate.updateNavigationAlert(this.id, alertId, title, subtitle);
    }
    dismissAlert(alertId) {
        HybridMapTemplate.dismissNavigationAlert(this.id, alertId);
    }
    /**
     * @namespace Android brings up a custom trip selector mimicking the CarPlay trip selector as close as possible
     * @namespace iOS brings up the stock CarPlay trip selector
     * @returns a callback to update the shown trip
     */
    showTripSelector({ trips, selectedTripId, textConfig, onTripSelected, onTripStarted, onBackPressed, mapButtons, }) {
        if (trips.length === 0 ||
            trips.some((t) => t.routeChoices.length === 0 || t.routeChoices.some((r) => r.steps.length < 2))) {
            throw new Error('Invalid trips passed, either no trips or some trips routeChoice or steps are empty');
        }
        if (__DEV__ &&
            react_native_1.Platform.OS === 'android' &&
            new Set(trips.flatMap((t) => t.routeChoices.flatMap((r) => r.steps.at(-1)?.name))).size > 1) {
            console.warn('found non distinct destination names, while this is possible it might lead to exceeding the step count, check https://developer.android.com/design/ui/cars/guides/ux-requirements/plan-task-flows#steps-refreshes for details');
        }
        const buttons = NitroMapButton_1.NitroMapButton.convert(this.template, mapButtons);
        return HybridMapTemplate.showTripSelector(this.id, trips, selectedTripId, textConfig, onTripSelected, onTripStarted, onBackPressed, buttons ?? []);
    }
    hideTripSelector() {
        HybridMapTemplate.hideTripSelector(this.id);
    }
    updateVisibleTravelEstimate(visibleTravelEstimate) {
        HybridMapTemplate.updateVisibleTravelEstimate(this.id, visibleTravelEstimate);
    }
    /**
     * updates travel estimates
     * @param steps all future steps, do not put in origin or passed steps
     */
    updateTravelEstimates(steps) {
        HybridMapTemplate.updateTravelEstimates(this.id, steps);
    }
    /**
     * sets or updates maneuvers, make sure to call startNavigation first!
     * @namespace Android sets all the supplied maneuvers whenever called
     * @namespace iOS will update travelEstimates only when passing in maneuvers with the same id
     */
    updateManeuvers(maneuvers) {
        HybridMapTemplate.updateManeuvers(this.id, convertAutoManeuver(maneuvers));
    }
    /**
     * Registers the complete known route for vehicle displays while updateManeuvers
     * continues to control the smaller visible maneuver window.
     */
    registerManeuvers(maneuvers) {
        HybridMapTemplate.registerManeuvers(this.id, convertRoutingManeuvers(maneuvers));
    }
    /**
     * either use showTripSelector to show a set of trips and let the user start the navigation session
     * or use this to start a navigation session without asking the user
     */
    startNavigation(trip) {
        return HybridMapTemplate.startNavigation(this.id, trip);
    }
    stopNavigation(reason = NavigationStopReason.Cancelled) {
        HybridMapTemplate.stopNavigation(this.id, reason);
    }
    /**
     * Sets the current maneuver state indicating progress within a maneuver.
     * Transition through: continue → initial → prepare → execute → continue
     * @namespace iOS sets CPManeuverState on the CPNavigationSession, used by instrument cluster and HUD
     * @namespace Android no-op, Android Auto does not have an equivalent API
     */
    setManeuverState(state) {
        HybridMapTemplate.setManeuverState(this.id, state);
    }
}
exports.MapTemplate = MapTemplate;
