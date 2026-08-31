package com.margelo.nitro.swe.iternio.reactnativeautoplay

import com.margelo.nitro.core.Promise
import com.margelo.nitro.swe.iternio.reactnativeautoplay.template.AndroidAutoTemplate
import com.margelo.nitro.swe.iternio.reactnativeautoplay.template.ListTemplate
import com.margelo.nitro.swe.iternio.reactnativeautoplay.utils.ThreadUtil

class HybridListTemplate : HybridListTemplateSpec() {

    override fun createListTemplate(config: ListTemplateConfig) {
        val context = AndroidAutoSession.getRootContext()
            ?: throw IllegalArgumentException("createListTemplate failed, carContext not found")

        val template = ListTemplate(context, config)
        AndroidAutoTemplate.setTemplate(config.id, template)
    }

    override fun updateListTemplateSections(
        templateId: String, sections: Array<NitroSection>?
    ): Promise<Unit> {
        return Promise.async {
            val template = AndroidAutoTemplate.getTemplate<ListTemplate>(templateId)
            val result = ThreadUtil.postOnUiAndAwait {
                template.updateSections(sections)
            }

            if (result.isFailure) {
                throw result.exceptionOrNull()
                    ?: UnknownError("unknown error updating list sections")
            }
        }
    }
}
