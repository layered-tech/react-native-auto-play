//
//  TemplateStore.swift
//  Pods
//
//  Created by Manuel Auer on 03.10.25.
//
import CarPlay

class TemplateStore {
    /// Guards `store`. Templates are added from the JS thread (the
    /// `createXTemplate` hybrid methods are synchronous and never hop actors)
    /// while the CarPlay delegate callbacks remove/purge them on the main thread
    private let lock = NSLock()
    private var store: [String: AutoPlayTemplate] = [:]

    private func withLock<T>(_ body: () -> T) -> T {
        lock.lock()
        defer { lock.unlock() }
        return body()
    }

    @MainActor
    func getCPTemplate(templateId key: String) -> CPTemplate? {
        return try? withLock { store[key] }?.getTemplate()
    }

    @MainActor
    func getTemplate(templateId: String) throws -> AutoPlayTemplate {
        if let template = withLock({ store[templateId] }) {
            return template
        }
        throw AutoPlayError.templateNotFound(templateId)
    }

    @MainActor
    func addTemplate(template: AutoPlayTemplate, templateId: String) {
        withLock { store[templateId] = template }
    }

    @MainActor
    func removeTemplate(templateId: String) {
        let removed = withLock { store.removeValue(forKey: templateId) }

        removed?.onPopped()
    }

    @MainActor
    func removeTemplates(templateIds: [String]) {
        let removed = withLock {
            templateIds.compactMap { store.removeValue(forKey: $0) }
        }

        removed.forEach { template in template.onPopped() }
    }

    @MainActor
    func removeSearchTemplates(
        matching templates: [String: CPSearchTemplate]
    ) -> [String] {
        var matchingTemplateIds: [String] = []

        for (templateId, template) in templates {
            if (try? withLock { store[templateId] }?.getTemplate()) === template {
                matchingTemplateIds.append(templateId)
            }
        }

        removeTemplates(templateIds: matchingTemplateIds)

        return matchingTemplateIds
    }

    @MainActor
    func traitCollectionDidChange() {
        let templates = withLock { Array(store.values) }

        templates.forEach { template in template.traitCollectionDidChange() }
    }

    @MainActor
    func disconnect() {
        /// notify every visible template about it being gone
        let removed = withLock {
            let templates = Array(store.values)
            store = [:]

            return templates
        }

        removed.forEach { template in template.onPopped() }
    }
}
