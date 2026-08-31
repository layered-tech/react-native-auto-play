package com.margelo.nitro.swe.iternio.reactnativeautoplay

import com.facebook.react.bridge.UiThreadUtil
import com.margelo.nitro.core.Promise
import com.margelo.nitro.swe.iternio.reactnativeautoplay.template.MapTemplate
import com.margelo.nitro.swe.iternio.reactnativeautoplay.utils.ThreadUtil
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CopyOnWriteArrayList

class HybridCluster : HybridClusterSpec() {
    init {
        listeners.clear()
        colorSchemeListeners.clear()
        UiThreadUtil.runOnUiThread {
            MapTemplate.clearClusterNavigationCallbacks()
        }
    }

    override fun addListener(
        eventType: ClusterEventName, callback: (String) -> Unit
    ): () -> Unit {
        val callbacks = listeners.getOrPut(eventType) { CopyOnWriteArrayList() }
        callbacks.add(callback)

        val queuedClusterIds = eventQueue[eventType].orEmpty()
        val connectedClusterIds =
            if (eventType == ClusterEventName.DIDCONNECTWITHWINDOW) {
                AndroidAutoSession.getClusterSessions()
            } else {
                emptyArray()
            }

        (queuedClusterIds + connectedClusterIds).distinct().forEach {
            callback(it)
        }
        eventQueue[eventType] = emptyArray<String>()

        return {
            listeners[eventType]?.removeAll { it === callback }
        }
    }

    override fun initRootView(clusterId: String): Promise<Unit> {
        return Promise.async {
            if (VirtualRenderer.hasRenderer(clusterId)) {
                return@async
            }
            val carContext = AndroidAutoSession.getCarContext(clusterId)
                ?: throw IllegalArgumentException("initRootView failed, carContext for $clusterId cluster not found")
            val result = ThreadUtil.postOnUiAndAwait {
                VirtualRenderer(carContext, clusterId, isCluster = true)
            }
            if (result.isFailure) {
                throw result.exceptionOrNull()
                    ?: UnknownError("unknown error initializing the virtual screen")
            }
        }
    }

    override fun setAttributedInactiveDescriptionVariants(
        clusterId: String, attributedInactiveDescriptionVariants: Array<NitroAttributedString>
    ) {
        throw IllegalAccessException("setAttributedInactiveDescriptionVariants is supported on iOS only")
    }

    override fun addListenerColorScheme(callback: (String, ColorScheme) -> Unit): () -> Unit {
        colorSchemeListeners.add(callback)

        return {
            colorSchemeListeners.remove(callback)
        }
    }

    override fun addListenerZoom(callback: (String, ZoomEvent) -> Unit): () -> Unit {
        throw IllegalAccessException("addListenerZoom is supported on iOS only")
    }

    override fun addListenerCompass(callback: (String, Boolean) -> Unit): () -> Unit {
        throw IllegalAccessException("addListenerCompass is supported on iOS only")
    }

    override fun addListenerSpeedLimit(callback: (String, Boolean) -> Unit): () -> Unit {
        throw IllegalAccessException("addListenerSpeedLimit is supported on iOS only")
    }

    override fun setNavigationCallbacks(
        onStopNavigation: () -> Unit,
        onAutoDriveEnabled: (() -> Unit)?
    ) {
        UiThreadUtil.runOnUiThread {
            MapTemplate.setClusterNavigationCallbacks(
                onStopNavigation,
                onAutoDriveEnabled
            )
        }
    }

    override fun startNavigation(trip: TripConfig) {
        UiThreadUtil.runOnUiThread {
            MapTemplate.startNavigation(trip)
        }
    }

    override fun updateTravelEstimates(steps: Array<TripPoint>) {
        UiThreadUtil.runOnUiThread {
            MapTemplate.updateTravelEstimates(steps)
        }
    }

    override fun updateManeuvers(maneuvers: NitroManeuver) {
        UiThreadUtil.runOnUiThread {
            MapTemplate.updateManeuvers(maneuvers)
        }
    }

    override fun stopNavigation(reason: NavigationStopReason) {
        UiThreadUtil.runOnUiThread {
            MapTemplate.stopNavigation()
        }
    }

    companion object {
        const val TAG = "HybridCluster"

        private val listeners =
            ConcurrentHashMap<ClusterEventName, CopyOnWriteArrayList<(clusterId: String) -> Unit>>()
        private val eventQueue = ConcurrentHashMap<ClusterEventName, Array<String>>()

        private val colorSchemeListeners =
            mutableListOf<(clusterId: String, colorScheme: ColorScheme) -> Unit>()

        fun emit(event: ClusterEventName, clusterId: String) {
            if (listeners[event].isNullOrEmpty()) {
                val clusterIds = eventQueue.getOrPut(event) { emptyArray<String>() }
                eventQueue[event] = clusterIds.plus(clusterId)
                return
            }

            listeners[event]?.forEach { it(clusterId) }
        }

        fun emitColorScheme(clusterId: String, colorScheme: ColorScheme) {
            colorSchemeListeners.forEach {
                it(clusterId, colorScheme)
            }
        }
    }
}
