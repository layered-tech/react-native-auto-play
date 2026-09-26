package com.margelo.nitro.swe.iternio.reactnativeautoplay

import com.margelo.nitro.core.Promise
import com.margelo.nitro.swe.iternio.reactnativeautoplay.template.AndroidAutoTemplate
import com.margelo.nitro.swe.iternio.reactnativeautoplay.template.SearchTemplate
import com.margelo.nitro.swe.iternio.reactnativeautoplay.utils.ThreadUtil

class HybridSearchTemplate : HybridSearchTemplateSpec() {

    override fun createSearchTemplate(config: SearchTemplateConfig) {
        val context = AndroidAutoSession.getRootContext()
            ?: throw IllegalArgumentException("createSearchTemplate failed, carContext not found")

        val template = SearchTemplate(context, config)
        AndroidAutoTemplate.setTemplate(config.id, template)
    }

    override fun updateSearchResults(templateId: String, results: NitroSection): Promise<Unit> {
        return Promise.async {
            val template = AndroidAutoTemplate.getTemplate(templateId) as? SearchTemplate
                ?: throw IllegalArgumentException(
                    "updateSearchResults failed, template $templateId not found or not a SearchTemplate"
                )

            val result = ThreadUtil.postOnUiAndAwait {
                template.updateSearchResults(results)
            }

            if (result.isFailure) {
                throw result.exceptionOrNull()
                    ?: UnknownError("unknown error updating search results")
            }
        }
    }
}
