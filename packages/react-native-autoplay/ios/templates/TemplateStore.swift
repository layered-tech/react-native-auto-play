//
//  TemplateStore.swift
//  Pods
//
//  Created by Manuel Auer on 03.10.25.
//
import CarPlay

class TemplateStore {
    private var store: [String: AutoPlayTemplate] = [:]

    @MainActor
    func getCPTemplate(templateId key: String) -> CPTemplate? {
        return store[key]?.getTemplate()
    }

    @MainActor
    func getTemplate(templateId: String) throws -> AutoPlayTemplate {
        if let template = store[templateId] {
            return template
        }
        throw AutoPlayError.templateNotFound(templateId)
    }

    @MainActor
    func addTemplate(template: AutoPlayTemplate, templateId: String) {
        store[templateId] = template
    }

    @MainActor
    func removeTemplate(templateId: String) {
        store[templateId]?.onPopped()

        store.removeValue(forKey: templateId)
    }

    @MainActor
    func removeTemplates(templateIds: [String]) {
        for templateId in templateIds {
            store[templateId]?.onPopped()
        }

        store = store.filter { !templateIds.contains($0.key) }
    }

    @MainActor
    func removeSearchTemplates(
        matching templates: [String: CPSearchTemplate]
    ) -> [String] {
        var matchingTemplateIds: [String] = []

        for (templateId, template) in templates {
            if store[templateId]?.getTemplate() === template {
                matchingTemplateIds.append(templateId)
            }
        }

        removeTemplates(templateIds: matchingTemplateIds)

        return matchingTemplateIds
    }

    @MainActor
    func traitCollectionDidChange() {
        for template in store.values {
            template.traitCollectionDidChange()
        }
    }

    @MainActor
    func disconnect() {
        store = [:]
    }
}
