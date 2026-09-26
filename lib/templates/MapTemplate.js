import React from 'react';
import { AppRegistry, Platform } from 'react-native';
import { NitroModules } from 'react-native-nitro-modules';
import { MapTemplateProvider } from '../components/MapTemplateContext';
import { SafeAreaInsetsProvider } from '../components/SafeAreaInsetsContext';
import { WindowInformationWrapper } from '../components/WindowInformationWrapper';
import { HybridAutoPlay } from '../hybrid/HybridAutoPlay';
import { NitroActionUtil } from '../utils/NitroAction';
import { NitroAlertUtil } from '../utils/NitroAlert';
import { NitroColorUtil } from '../utils/NitroColor';
import { NitroManeuverUtil, } from '../utils/NitroManeuver';
import { NitroMapButton } from '../utils/NitroMapButton';
import { NitroOptionsPanelUtil } from '../utils/NitroOptionsPanel';
import { Template, } from './Template';
const HybridMapTemplate = NitroModules.createHybridObject('MapTemplate');
export var NavigationStopReason;
(function (NavigationStopReason) {
    NavigationStopReason[NavigationStopReason["Arrived"] = 0] = "Arrived";
    NavigationStopReason[NavigationStopReason["Cancelled"] = 1] = "Cancelled";
})(NavigationStopReason || (NavigationStopReason = {}));
function convertRoutingManeuvers(maneuvers) {
    return maneuvers.reduce((convertedManeuvers, maneuver) => {
        if (maneuver != null) {
            convertedManeuvers.push(NitroManeuverUtil.convert(maneuver));
        }
        return convertedManeuvers;
    }, []);
}
export function convertAutoManeuver(maneuvers) {
    if (Array.isArray(maneuvers)) {
        return convertRoutingManeuvers(maneuvers);
    }
    if (maneuvers.type === 'loading') {
        return {
            isLoading: true,
            cardBackgroundColor: NitroColorUtil.convert(maneuvers.cardBackgroundColor),
            text: maneuvers.text != null ? maneuvers.text : undefined,
        };
    }
    return NitroManeuverUtil.convert(maneuvers);
}
export class MapTemplate extends Template {
    id = 'AutoPlayRoot';
    template = this;
    constructor(config) {
        super(config);
        const { component, mapButtons, headerActions, onStopNavigation, onAutoDriveEnabled, defaultGuidanceBackgroundColor, optionsPanel, ...baseConfig } = config;
        AppRegistry.registerComponent(this.id, () => (props) => React.createElement(MapTemplateProvider, {
            mapTemplate: this.template,
            // biome-ignore lint/correctness/noChildrenProp: there is no other way in a ts file
            children: React.createElement(SafeAreaInsetsProvider, {
                moduleName: this.id,
                // biome-ignore lint/correctness/noChildrenProp: there is no other way in a ts file
                children: React.createElement(WindowInformationWrapper, {
                    moduleName: this.id,
                    component,
                    componentProps: props,
                }),
            }),
        }));
        const nitroConfig = {
            ...baseConfig,
            id: this.id,
            headerActions: NitroActionUtil.convert(this.template, headerActions),
            mapButtons: NitroMapButton.convert(this.template, mapButtons),
            onStopNavigation: () => onStopNavigation(this.template),
            onAutoDriveEnabled: onAutoDriveEnabled ? () => onAutoDriveEnabled(this.template) : undefined,
            defaultGuidanceBackgroundColor: defaultGuidanceBackgroundColor != null
                ? NitroColorUtil.convert(defaultGuidanceBackgroundColor)
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
        if (Platform.OS !== 'ios') {
            return;
        }
        return HybridMapTemplate.updateOptionsPanel(this.id, NitroOptionsPanelUtil.convert(this.template, optionsPanel));
    }
    setMapButtons(mapButtons) {
        const buttons = NitroMapButton.convert(this.template, mapButtons);
        return HybridMapTemplate.setTemplateMapButtons(this.id, buttons);
    }
    setHeaderActions(headerActions) {
        const nitroActions = NitroActionUtil.convert(this.template, headerActions);
        return HybridAutoPlay.setTemplateHeaderActions(this.id, nitroActions);
    }
    /**
     * brings up a navigation alert
     * ⚠️ updating an existing alert is currently broken on Android Automotive, it brings up a new alert for each call
     * @returns a callback to dismiss or update the navigation alert
     */
    showAlert(alert) {
        return HybridMapTemplate.showNavigationAlert(this.id, NitroAlertUtil.convert(alert));
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
            Platform.OS === 'android' &&
            new Set(trips.flatMap((t) => t.routeChoices.flatMap((r) => r.steps.at(-1)?.name))).size > 1) {
            console.warn('found non distinct destination names, while this is possible it might lead to exceeding the step count, check https://developer.android.com/design/ui/cars/guides/ux-requirements/plan-task-flows#steps-refreshes for details');
        }
        const buttons = NitroMapButton.convert(this.template, mapButtons);
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
