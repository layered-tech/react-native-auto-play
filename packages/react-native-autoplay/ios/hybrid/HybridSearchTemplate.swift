//
//  HybridSearchTemplate.swift
//  Pods
//
//  Created by Samuel Brucksch on 28.10.25.
//

import NitroModules
import UIKit

class HybridSearchTemplate: HybridSearchTemplateSpec {
    func createSearchTemplate(config: SearchTemplateConfig) throws {
        try RootModule.performOnMainActor {
            let template = SearchTemplate(config: config)

            try RootModule.withTemplateStore { templateStore in
                templateStore.addTemplate(
                    template: template,
                    templateId: config.id
                )
            }
        }
    }

    func updateSearchResults(templateId: String, results: NitroSection) throws
        -> Promise<Void>
    {
        return Promise.async {
            try await MainActor.run {
                let backgroundTask = UIApplication.shared.beginBackgroundTask(
                    withName: "CarPlay search update"
                )

                defer {
                    UIApplication.shared.endBackgroundTask(backgroundTask)
                }

                try RootModule.withAutoPlayTemplate(templateId: templateId) {
                    (template: SearchTemplate) in
                    template.updateSearchResults(results: results)
                }
            }
        }
    }
}
