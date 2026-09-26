//
//  HybridMapTemplate.swift
//  Pods
//
//  Created by Manuel Auer on 15.10.25.
//

import CarPlay
import Foundation
import NitroModules

class HybridMapTemplate: HybridMapTemplateSpec {
    private func withMapTemplateOnMainActor(
        templateId: String,
        perform action: @MainActor @escaping (MapTemplate) throws -> Void
    ) throws {
        try RootModule.performOnMainActor {
            try RootModule.withAutoPlayTemplate(templateId: templateId) {
                (template: MapTemplate) in
                try action(template)
            }
        }
    }

    func createMapTemplate(config: MapTemplateConfig) throws {
        try RootModule.performOnMainActor {
            let template = MapTemplate(config: config)

            try RootModule.withTemplateStore { templateStore in
                templateStore.addTemplate(
                    template: template,
                    templateId: config.id
                )
            }
        }
    }

    func setTemplateMapButtons(templateId: String, buttons: [NitroMapButton]?)
        throws -> Promise<Void>
    {
        return Promise.async {
            try await MainActor.run {
                try RootModule.withAutoPlayTemplate(templateId: templateId) {
                    (template: MapTemplate) in
                    template.mapButtons = buttons
                    template.invalidate()
                }
            }
        }
    }

    func showNavigationAlert(templateId: String, alert: NitroNavigationAlert)
        throws
    {
        try withMapTemplateOnMainActor(templateId: templateId) {
            (template: MapTemplate) in
            template.showAlert(alertConfig: alert)
        }
    }

    func updateNavigationAlert(
        templateId: String,
        navigationAlertId: Double,
        title: AutoText,
        subtitle: AutoText?
    ) throws {
        try withMapTemplateOnMainActor(templateId: templateId) {
            (template: MapTemplate) in
            template.updateNavigationAlert(
                alertId: navigationAlertId,
                title: title,
                subtitle: subtitle
            )
        }
    }

    func dismissNavigationAlert(templateId: String, navigationAlertId: Double)
        throws
    {
        try withMapTemplateOnMainActor(templateId: templateId) {
            (template: MapTemplate) in
            template.dismissNavigationAlert(alertId: navigationAlertId)
        }
    }

    func showTripSelector(
        templateId: String,
        trips: [TripsConfig],
        selectedTripId: String?,
        textConfig: TripPreviewTextConfiguration,
        onTripSelected: @escaping (_ tripId: String, _ routeId: String) -> Void,
        onTripStarted: @escaping (_ tripId: String, _ routeId: String) -> Void,
        onBackPressed: @escaping () -> Void,
        mapButtons: [NitroMapButton]
    ) throws -> TripSelectorCallback {
        var callback: TripSelectorCallback?

        try RootModule.performOnMainActor {
            try RootModule.withAutoPlayTemplate(templateId: templateId) {
                (template: MapTemplate) in
                callback = template.showTripSelector(
                    trips: trips,
                    selectedTripId: selectedTripId,
                    textConfig: textConfig,
                    onTripSelected: onTripSelected,
                    onTripStarted: onTripStarted,
                    onBackPressed: onBackPressed,
                    mapButtons: mapButtons
                )
            }
        }

        guard let callback = callback else {
            throw AutoPlayError.templateNotFound(templateId)
        }

        return callback
    }

    func hideTripSelector(templateId: String) throws {
        try withMapTemplateOnMainActor(templateId: templateId) {
            (template: MapTemplate) in
            template.hideTripSelector()
        }
    }

    func updateVisibleTravelEstimate(
        templateId: String,
        visibleTravelEstimate: VisibleTravelEstimate
    ) throws {
        try withMapTemplateOnMainActor(templateId: templateId) {
            (template: MapTemplate) in
            template.updateVisibleTravelEstimate(
                visibleTravelEstimate: visibleTravelEstimate
            )
        }
    }

    func updateTravelEstimates(templateId: String, steps: [TripPoint]) throws {
        try withMapTemplateOnMainActor(templateId: templateId) {
            (template: MapTemplate) in
            template.updateTravelEstimates(steps: steps)
        }
    }

    func updateManeuvers(templateId: String, maneuvers: NitroManeuver) throws {
        try withMapTemplateOnMainActor(templateId: templateId) {
            (template: MapTemplate) in
            switch maneuvers {
            case .first(let routingManeuvers):
                {
                    template.updateManeuvers(maneuvers: routingManeuvers)
                }()
            case .second(let messageManeuver):
                {
                    template.updateManeuvers(messageManeuver: messageManeuver)
                }()
            case .third(let loading):
                {
                    template.updateManeuversLoading(loading: loading)
                }()
            }

        }
    }

    func registerManeuvers(
        templateId: String,
        maneuvers: [NitroRoutingManeuver]
    ) throws {
        try withMapTemplateOnMainActor(templateId: templateId) {
            (template: MapTemplate) in
            template.registerManeuvers(maneuvers: maneuvers)
        }
    }

    func startNavigation(templateId: String, trip: TripConfig) throws -> Promise<Void> {
        return Promise.async {
            try await MainActor.run {
                try RootModule.withAutoPlayTemplate(templateId: templateId) {
                    (template: MapTemplate) in
                    let trip = Parser.parseTrip(tripConfig: trip)
                    template.startNavigation(trip: trip)
                }
            }
        }
    }

    func stopNavigation(
        templateId: String,
        reason: NavigationStopReason
    ) throws {
        try withMapTemplateOnMainActor(templateId: templateId) {
            (template: MapTemplate) in
            template.stopNavigation(reason: reason)
        }
    }

    func setManeuverState(templateId: String, state: ManeuverState) throws {
        try withMapTemplateOnMainActor(templateId: templateId) {
            (template: MapTemplate) in
            template.setManeuverState(state: state)
        }
    }

    func updateOptionsPanel(templateId: String, config: NitroOptionsPanelConfig?) throws
        -> Promise<Void>
    {
        return Promise.async {
            try await MainActor.run {
                try RootModule.withAutoPlayTemplate(templateId: templateId) {
                    (template: MapTemplate) in
                    template.updateOptionsPanel(config: config)
                }
            }
        }
    }
}
