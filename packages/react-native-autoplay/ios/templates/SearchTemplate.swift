//
//  SearchTemplate.swift
//  Pods
//
//  Created by Samuel Brucksch on 28.10.25.
//

import CarPlay

class SearchTemplate: AutoPlayTemplate, CPSearchTemplateDelegate {
    var template: CPSearchTemplate
    var config: SearchTemplateConfig
    var results: NitroSection

    override var autoDismissMs: Double? {
        return config.autoDismissMs
    }

    override func getTemplate() -> CPTemplate {
        return template
    }

    var completionHandler: (([CPListItem]) -> Void)?
    var pushedListTemplate: ListTemplate?
    var searchText = ""
    var isInitialized = false

    init(config: SearchTemplateConfig) {
        self.config = config
        results = config.results

        template = CPSearchTemplate(id: config.id)
    }

    func updateSearchResults(results: NitroSection) {
        self.results = results
        invalidate()
    }

    private func completePendingSearchResults(_ items: [CPListItem] = []) {
        guard let completionHandler else {
            return
        }

        self.completionHandler = nil
        completionHandler(items)
    }

    @MainActor
    override func _invalidate() {
        // if we have pushed a list template update it
        if let listTemplate = pushedListTemplate {
            listTemplate.updateSections(sections: [results])
        }

        // otherwise update the search results on the search template
        guard self.completionHandler != nil else {
            return
        }

        guard let traitCollection = SceneStore.getRootTraitCollection() else {
            return
        }

        let listItems = Parser.parseSearchResults(
            section: results,
            traitCollection: traitCollection
        )
        completePendingSearchResults(listItems)
    }

    override func onWillAppear(animated: Bool) {
        self.pushedListTemplate = nil
        config.onWillAppear?(animated)
    }

    override func onDidAppear(animated: Bool) {
        config.onDidAppear?(animated)
        template.delegate = self
    }

    override func onWillDisappear(animated: Bool) {
        completePendingSearchResults()
        config.onWillDisappear?(animated)
        template.delegate = nil
    }

    override func onDidDisappear(animated: Bool) {
        config.onDidDisappear?(animated)
    }

    override func onPopped() {
        completePendingSearchResults()
        config.onPopped?()
    }

    // MARK: - CPSearchTemplateDelegate

    func searchTemplate(
        _ searchTemplate: CPSearchTemplate,
        updatedSearchText searchText: String,
        completionHandler: @escaping ([CPListItem]) -> Void
    ) {
        if !isInitialized {
            self.searchText = searchText
            completePendingSearchResults()
            self.completionHandler = completionHandler
            // this makes sure we show the initial items when opening up the template
            invalidate()
            isInitialized = true
            return
        }

        self.searchText = searchText

        // CarPlay requires every text-update completion handler to be resolved.
        // Keep the current rows until keyboard Search publishes the next set.
        if let traitCollection = SceneStore.getRootTraitCollection() {
            completionHandler(
                Parser.parseSearchResults(
                    section: results,
                    traitCollection: traitCollection
                )
            )
        }
        else {
            completionHandler(
                results.items.map { row in
                    CPListItem(
                        text: row.title.text,
                        detailText: row.detailedText?.text
                    )
                }
            )
        }

        if pushedListTemplate != nil {
            return
        }

        config.onSearchTextChanged(searchText)
    }

    func searchTemplate(
        _ searchTemplate: CPSearchTemplate,
        selectedResult item: CPListItem,
        completionHandler: @escaping () -> Void
    ) {
        item.handler?(item, completionHandler)
    }

    func searchTemplateSearchButtonPressed(
        _ searchTemplate: CPSearchTemplate
    ) {

        completePendingSearchResults()

        let submittedSearchLoadingResults = NitroSection(
            title: nil,
            items: [
                NitroRow(
                    title: AutoText(
                        text: "Searching...",
                        distance: nil,
                        duration: nil
                    ),
                    detailedText: AutoText(
                        text: "Looking for places near the car.",
                        distance: nil,
                        duration: nil
                    ),
                    browsable: nil,
                    enabled: false,
                    image: nil,
                    checked: nil,
                    onPress: nil,
                    selected: nil
                )
            ],
            type: .default
        )
        self.results = submittedSearchLoadingResults

        // Create a stable ListTemplate that owns loading and completed results.
        let listConfig = ListTemplateConfig(
            id: "\(config.id)-results",
            onWillAppear: nil,
            onWillDisappear: nil,
            onDidAppear: nil,
            onDidDisappear: nil,
            onPopped: nil,
            autoDismissMs: nil,
            headerActions: config.headerActions,
            title: config.title,
            sections: [submittedSearchLoadingResults],
            mapConfig: nil
        )

        let listTemplate = ListTemplate(config: listConfig)
        self.pushedListTemplate = listTemplate

        // Push the template
        Task { @MainActor in
            do {
                try await RootModule.withSceneAndInterfaceController {
                    scene,
                    interfaceController in

                    scene.templateStore.addTemplate(
                        template: listTemplate,
                        templateId: listConfig.id
                    )

                    listTemplate.invalidate()

                    // Start JS work only after its update target is retained
                    // and registered, so fast responses cannot be dropped.
                    self.config.onSearchTextSubmitted(self.searchText)

                    let _ = try await interfaceController.pushTemplate(
                        listTemplate.template,
                        animated: true
                    )
                }
            }
            catch {
                if self.pushedListTemplate === listTemplate {
                    self.pushedListTemplate = nil
                }

                try? RootModule.withTemplateStore { templateStore in
                    guard
                        let storedTemplate = try? templateStore.getTemplate(
                            templateId: listConfig.id
                        ),
                        storedTemplate === listTemplate
                    else { return }

                    templateStore.removeTemplate(templateId: listConfig.id)
                }

                print("Failed to push list template: \(error)")
            }
        }
    }
}
