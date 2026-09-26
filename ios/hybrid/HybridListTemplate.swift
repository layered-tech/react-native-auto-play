//
//  HybridListTemplate.swift
//  Pods
//
//  Created by Manuel Auer on 15.10.25.
//

import NitroModules
import UIKit

class HybridListTemplate: HybridListTemplateSpec {
    func createListTemplate(config: ListTemplateConfig) throws {
        try RootModule.performOnMainActor {
            let template = ListTemplate(config: config)

            try RootModule.withTemplateStore { templateStore in
                templateStore.addTemplate(
                    template: template,
                    templateId: config.id
                )
            }
        }
    }

    func updateListTemplateSections(
        templateId: String,
        sections: [NitroSection]?
    ) throws -> Promise<Void> {
        return Promise.async {
            try await MainActor.run {
                let backgroundTask = UIApplication.shared.beginBackgroundTask(
                    withName: "CarPlay list update"
                )

                defer {
                    UIApplication.shared.endBackgroundTask(backgroundTask)
                }

                try RootModule.withAutoPlayTemplate(templateId: templateId) {
                    (template: ListTemplate) in
                    template.updateSections(sections: sections)
                }
            }
        }
    }
}
