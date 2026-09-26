package com.margelo.nitro.swe.iternio.reactnativeautoplay

import android.content.Intent
import android.content.res.Configuration
import android.util.Log
import androidx.car.app.CarContext
import androidx.car.app.Screen
import androidx.car.app.Session
import androidx.car.app.SessionInfo
import androidx.car.app.model.CarIcon
import androidx.car.app.model.MessageTemplate
import androidx.car.app.model.Template
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import com.margelo.nitro.swe.iternio.reactnativeautoplay.template.AndroidAutoTemplate
import com.margelo.nitro.swe.iternio.reactnativeautoplay.template.MapTemplate
import com.margelo.nitro.swe.iternio.reactnativeautoplay.utils.AppInfo
import java.net.URLDecoder
import java.util.Locale
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CopyOnWriteArrayList

class AndroidAutoSession(sessionInfo: SessionInfo) :
    Session() {

    private val isCluster = sessionInfo.displayType == SessionInfo.DISPLAY_TYPE_CLUSTER
    private val clusterId = if (isCluster) UUID.randomUUID().toString() else null
    private val moduleName = clusterId ?: ROOT_SESSION
    private val navigationSessionId = UUID.randomUUID().toString()

    private fun getInitialTemplate(): Template {
        if (isCluster) {

            // clusters can not display any actions but still need one to not crash...
            val action =
                NitroAction(null, null, null, {}, NitroActionType.APPICON, null, null, null)

            // clusters can host NavigationTemplate only which is a MapTemplate on AutoPlay
            val config = MapTemplateConfig(
                moduleName,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                {},
                null,
                null,
                arrayOf(action),
                null,
                null,
                null
            )

            val template = MapTemplate(context = carContext, config, initNavigationManager = false)
            AndroidAutoTemplate.setTemplate(moduleName, template)

            return template.parse()
        }

        val appName = AppInfo.getApplicationLabel(carContext)

        return MessageTemplate.Builder(appName).apply {
            setIcon(CarIcon.APP_ICON)
        }.build()
    }

    override fun onCreateScreen(intent: Intent): Screen {
        val initialTemplate = getInitialTemplate()
        val screen = AndroidAutoScreen(carContext, moduleName, initialTemplate)

        sessions[moduleName] = ScreenContext(
            carContext = carContext, session = this, state = VisibilityState.DIDDISAPPEAR
        )

        clusterId?.let {
            clusterSessions.add(it)
        }

        if (BuildConfig.IS_NAVIGATION_APP) {
            NavigationManagerCoordinator.registerSession(
                navigationSessionId,
                carContext,
                isRootSession = clusterId == null
            )
        }

        lifecycle.addObserver(sessionLifecycleObserver)

        if (clusterId == null) {
            HybridAutoPlay.emit(EventName.DIDCONNECT)
            handleNavigationIntent(intent)
        } else {
            HybridCluster.emit(ClusterEventName.DIDCONNECTWITHWINDOW, clusterId)
        }

        return screen
    }

    override fun onCarConfigurationChanged(configuration: Configuration) {
        val colorScheme = if (carContext.isDarkMode) ColorScheme.DARK else ColorScheme.LIGHT

        // This display's native backdrop (root or cluster) must follow the car's day/night
        // (car-app quality MR-1). Forwarded before the early returns below — the root template
        // may not be a MapTemplate yet (e.g. a pre-trip MessageTemplate) and must still switch.
        VirtualRenderer.onColorSchemeChanged(moduleName, carContext.isDarkMode)

        if (clusterId != null) {
            HybridCluster.emitColorScheme(clusterId, colorScheme)
            AndroidAutoScreen.getScreen(clusterId)?.applyConfigUpdate(invalidate = true)
            return
        }

        val marker = AndroidAutoScreen.getScreen(ROOT_SESSION)?.marker ?: return
        val config = AndroidAutoTemplate.getConfig(marker) as? MapTemplateConfig? ?: return

        if (config.onAppearanceDidChange != null) {
            config.onAppearanceDidChange(colorScheme)
        }

        AndroidAutoScreen.invalidateScreens()
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleNavigationIntent(intent)
    }

    private enum class NavigationSchemeClass(val logValue: String) {
        MISSING("missing"),
        GEO("geo"),
        OTHER("other")
    }

    private enum class NavigationCoordinateState(val logValue: String) {
        MISSING("missing"),
        ZERO("zero"),
        VALID("valid"),
        INVALID("invalid")
    }

    private enum class NavigationIntentClass(val logValue: String) {
        MISSING("missing"),
        NAVIGATION("navigation"),
        DIRECTIONS("directions"),
        ADD_A_STOP("add_a_stop"),
        UNSUPPORTED("unsupported"),
        DUPLICATE("duplicate"),
        MALFORMED("malformed")
    }

    private enum class NavigationRequestType(val bridgeValue: String) {
        NAVIGATION("navigation"),
        DIRECTIONS("directions"),
        SEARCH("search"),
        QUERY("query")
    }

    private enum class NavigationRejectionReason(val logValue: String) {
        MISSING_DATA("missing_data"),
        UNSUPPORTED_SCHEME("unsupported_scheme"),
        NON_OPAQUE_GEO_URI("non_opaque_geo_uri"),
        FRAGMENT_NOT_SUPPORTED("fragment_not_supported"),
        MISSING_SCHEME_SPECIFIC_PART("missing_scheme_specific_part"),
        MALFORMED_ENCODING("malformed_encoding"),
        DUPLICATE_QUERY("duplicate_query"),
        DUPLICATE_INTENT("duplicate_intent"),
        MALFORMED_COORDINATES("malformed_coordinates"),
        UNSUPPORTED_ADD_STOP("unsupported_add_stop"),
        UNSUPPORTED_INTENT("unsupported_intent"),
        MISSING_DESTINATION("missing_destination")
    }

    private data class ParsedNavigationCoordinates(
        val state: NavigationCoordinateState,
        val location: Location? = null
    )

    private data class ParsedNavigationParameters(
        val query: String?,
        val queryPresent: Boolean,
        val intentPresent: Boolean,
        val intentClass: NavigationIntentClass,
        val rejectionReason: NavigationRejectionReason? = null
    )

    private fun handleNavigationIntent(intent: Intent) {
        val isSearchRequest = intent.action == Intent.ACTION_VIEW

        if (!isSearchRequest && intent.action != CarContext.ACTION_NAVIGATE) {
            return
        }

        val data = intent.data
        if (data == null) {
            logNavigationIntentRejection(
                NavigationRejectionReason.MISSING_DATA,
                NavigationSchemeClass.MISSING,
                NavigationCoordinateState.MISSING,
                queryPresent = false,
                intentClass = NavigationIntentClass.MISSING
            )
            return
        }

        val schemeClass = when {
            data.scheme == null -> NavigationSchemeClass.MISSING
            data.scheme.equals("geo", ignoreCase = true) -> NavigationSchemeClass.GEO
            else -> NavigationSchemeClass.OTHER
        }
        val encodedSchemeSpecificPart = data.encodedSchemeSpecificPart
        val coordinates = if (encodedSchemeSpecificPart.isNullOrBlank()) {
            ParsedNavigationCoordinates(NavigationCoordinateState.MISSING)
        } else {
            parseNavigationCoordinates(encodedSchemeSpecificPart.substringBefore('?'))
        }
        val parameters = if (encodedSchemeSpecificPart.isNullOrBlank()) {
            ParsedNavigationParameters(
                query = null,
                queryPresent = false,
                intentPresent = false,
                intentClass = NavigationIntentClass.MISSING
            )
        } else {
            parseNavigationParameters(encodedSchemeSpecificPart.substringAfter('?', ""))
        }

        if (schemeClass != NavigationSchemeClass.GEO) {
            logNavigationIntentRejection(
                NavigationRejectionReason.UNSUPPORTED_SCHEME,
                schemeClass,
                coordinates.state,
                parameters.queryPresent,
                parameters.intentClass
            )
            return
        }

        if (!data.isOpaque) {
            logNavigationIntentRejection(
                NavigationRejectionReason.NON_OPAQUE_GEO_URI,
                schemeClass,
                coordinates.state,
                parameters.queryPresent,
                parameters.intentClass
            )
            return
        }

        if (data.fragment != null) {
            logNavigationIntentRejection(
                NavigationRejectionReason.FRAGMENT_NOT_SUPPORTED,
                schemeClass,
                coordinates.state,
                parameters.queryPresent,
                parameters.intentClass
            )
            return
        }

        if (encodedSchemeSpecificPart.isNullOrBlank()) {
            logNavigationIntentRejection(
                NavigationRejectionReason.MISSING_SCHEME_SPECIFIC_PART,
                schemeClass,
                NavigationCoordinateState.MISSING,
                queryPresent = false,
                intentClass = NavigationIntentClass.MISSING
            )
            return
        }

        parameters.rejectionReason?.let { rejectionReason ->
            logNavigationIntentRejection(
                rejectionReason,
                schemeClass,
                coordinates.state,
                parameters.queryPresent,
                parameters.intentClass
            )
            return
        }

        when (parameters.intentClass) {
            NavigationIntentClass.ADD_A_STOP -> {
                logNavigationIntentRejection(
                    NavigationRejectionReason.UNSUPPORTED_ADD_STOP,
                    schemeClass,
                    coordinates.state,
                    parameters.queryPresent,
                    parameters.intentClass
                )
                return
            }

            NavigationIntentClass.UNSUPPORTED -> {
                logNavigationIntentRejection(
                    NavigationRejectionReason.UNSUPPORTED_INTENT,
                    schemeClass,
                    coordinates.state,
                    parameters.queryPresent,
                    parameters.intentClass
                )
                return
            }

            else -> Unit
        }

        if (coordinates.state == NavigationCoordinateState.INVALID) {
            logNavigationIntentRejection(
                NavigationRejectionReason.MALFORMED_COORDINATES,
                schemeClass,
                coordinates.state,
                parameters.queryPresent,
                parameters.intentClass
            )
            return
        }

        val requestType = when {
            isSearchRequest -> NavigationRequestType.SEARCH
            parameters.intentClass == NavigationIntentClass.DIRECTIONS ->
                NavigationRequestType.DIRECTIONS
            coordinates.state == NavigationCoordinateState.ZERO &&
                parameters.query != null &&
                !parameters.intentPresent -> NavigationRequestType.QUERY
            else -> NavigationRequestType.NAVIGATION
        }

        if (coordinates.state == NavigationCoordinateState.VALID) {
            logNavigationIntentAccepted(
                requestType,
                coordinates.state,
                parameters.queryPresent,
                parameters.intentClass
            )
            HybridAutoPlay.emitVoiceInput(
                coordinates.location,
                parameters.query,
                requestType.bridgeValue
            )
            return
        }

        if (
            coordinates.state == NavigationCoordinateState.ZERO &&
            parameters.query != null &&
            (
                parameters.intentClass == NavigationIntentClass.NAVIGATION ||
                    parameters.intentClass == NavigationIntentClass.DIRECTIONS
                )
        ) {
            logNavigationIntentAccepted(
                requestType,
                coordinates.state,
                parameters.queryPresent,
                parameters.intentClass
            )
            HybridAutoPlay.emitVoiceInput(
                null,
                parameters.query,
                requestType.bridgeValue
            )
            return
        }

        logNavigationIntentRejection(
            NavigationRejectionReason.MISSING_DESTINATION,
            schemeClass,
            coordinates.state,
            parameters.queryPresent,
            parameters.intentClass
        )
    }

    private fun logNavigationIntentAccepted(
        requestType: NavigationRequestType,
        coordinateState: NavigationCoordinateState,
        queryPresent: Boolean,
        intentClass: NavigationIntentClass
    ) {
        Log.i(
            TAG,
            "Accepted voice intent " +
                "requestType=${requestType.bridgeValue} " +
                "coordinateState=${coordinateState.logValue} " +
                "queryPresent=$queryPresent " +
                "intentClass=${intentClass.logValue}"
        )
    }

    private fun parseNavigationParameters(encodedQuery: String): ParsedNavigationParameters {
        val queryValues = mutableListOf<String>()
        val intentValues = mutableListOf<String>()
        val queryPresent = hasEncodedNavigationParameter(encodedQuery, "q")
        val intentPresent = hasEncodedNavigationParameter(encodedQuery, "intent")

        try {
            encodedQuery.split('&').forEach { encodedParameter ->
                if (encodedParameter.isEmpty()) {
                    return@forEach
                }

                val encodedKey = encodedParameter.substringBefore('=')
                val decodedKey = URLDecoder.decode(encodedKey, Charsets.UTF_8.name())

                if (decodedKey != "q" && decodedKey != "intent") {
                    return@forEach
                }

                val decodedValue = URLDecoder.decode(
                    encodedParameter.substringAfter('=', ""),
                    Charsets.UTF_8.name()
                )

                if (decodedKey == "q") {
                    queryValues.add(decodedValue)
                } else {
                    intentValues.add(decodedValue)
                }
            }
        } catch (_: IllegalArgumentException) {
            return ParsedNavigationParameters(
                query = null,
                queryPresent = queryPresent,
                intentPresent = intentPresent,
                intentClass = NavigationIntentClass.MALFORMED,
                rejectionReason = NavigationRejectionReason.MALFORMED_ENCODING
            )
        }

        val intentClass = when {
            intentValues.size > 1 -> NavigationIntentClass.DUPLICATE
            intentValues.isEmpty() -> NavigationIntentClass.NAVIGATION
            else -> when (intentValues.single().trim().lowercase(Locale.ROOT)) {
                "navigation" -> NavigationIntentClass.NAVIGATION
                "directions" -> NavigationIntentClass.DIRECTIONS
                "add_a_stop" -> NavigationIntentClass.ADD_A_STOP
                else -> NavigationIntentClass.UNSUPPORTED
            }
        }

        if (queryValues.size > 1) {
            return ParsedNavigationParameters(
                query = null,
                queryPresent = true,
                intentPresent = intentPresent,
                intentClass = intentClass,
                rejectionReason = NavigationRejectionReason.DUPLICATE_QUERY
            )
        }

        if (intentValues.size > 1) {
            return ParsedNavigationParameters(
                query = queryValues.singleOrNull()?.trim()?.takeIf { it.isNotEmpty() },
                queryPresent = queryPresent,
                intentPresent = intentPresent,
                intentClass = intentClass,
                rejectionReason = NavigationRejectionReason.DUPLICATE_INTENT
            )
        }

        return ParsedNavigationParameters(
            query = queryValues.singleOrNull()?.trim()?.takeIf { it.isNotEmpty() },
            queryPresent = queryPresent,
            intentPresent = intentPresent,
            intentClass = intentClass
        )
    }

    private fun hasEncodedNavigationParameter(
        encodedQuery: String,
        parameterName: String
    ): Boolean {
        return encodedQuery.split('&').any { encodedParameter ->
            try {
                URLDecoder.decode(
                    encodedParameter.substringBefore('='),
                    Charsets.UTF_8.name()
                ) == parameterName
            } catch (_: IllegalArgumentException) {
                false
            }
        }
    }

    private fun parseNavigationCoordinates(coordinatesPart: String): ParsedNavigationCoordinates {
        if (coordinatesPart.isEmpty()) {
            return ParsedNavigationCoordinates(NavigationCoordinateState.INVALID)
        }

        val parts = coordinatesPart.split(",")
        if (parts.size != 2) {
            return ParsedNavigationCoordinates(NavigationCoordinateState.INVALID)
        }

        val lat = parts[0].toDoubleOrNull()
            ?: return ParsedNavigationCoordinates(NavigationCoordinateState.INVALID)
        val lon = parts[1].toDoubleOrNull()
            ?: return ParsedNavigationCoordinates(NavigationCoordinateState.INVALID)

        if (!lat.isFinite() || !lon.isFinite()) {
            return ParsedNavigationCoordinates(NavigationCoordinateState.INVALID)
        }

        if (lat !in -90.0..90.0 || lon !in -180.0..180.0) {
            return ParsedNavigationCoordinates(NavigationCoordinateState.INVALID)
        }

        if (lat == 0.0 && lon == 0.0) {
            return ParsedNavigationCoordinates(NavigationCoordinateState.ZERO)
        }

        return ParsedNavigationCoordinates(
            NavigationCoordinateState.VALID,
            Location(lat, lon)
        )
    }

    private fun logNavigationIntentRejection(
        reason: NavigationRejectionReason,
        schemeClass: NavigationSchemeClass,
        coordinateState: NavigationCoordinateState,
        queryPresent: Boolean,
        intentClass: NavigationIntentClass
    ) {
        Log.w(
            TAG,
            "Rejected navigation intent " +
                "reason=${reason.logValue} " +
                "scheme=${schemeClass.logValue} " +
                "coordinateState=${coordinateState.logValue} " +
                "queryPresent=$queryPresent " +
                "intentClass=${intentClass.logValue}"
        )
    }

    private val sessionLifecycleObserver = object : DefaultLifecycleObserver {
        override fun onCreate(owner: LifecycleOwner) {
            sessions[moduleName]?.state = VisibilityState.WILLAPPEAR
            HybridAutoPlay.emitRenderState(moduleName, VisibilityState.WILLAPPEAR)
        }

        override fun onResume(owner: LifecycleOwner) {
            sessions[moduleName]?.state = VisibilityState.DIDAPPEAR
            HybridAutoPlay.emitRenderState(moduleName, VisibilityState.DIDAPPEAR)
        }

        override fun onPause(owner: LifecycleOwner) {
            sessions[moduleName]?.state = VisibilityState.WILLDISAPPEAR
            HybridAutoPlay.emitRenderState(moduleName, VisibilityState.WILLDISAPPEAR)
        }

        override fun onStop(owner: LifecycleOwner) {
            sessions[moduleName]?.state = VisibilityState.DIDDISAPPEAR
            HybridAutoPlay.emitRenderState(moduleName, VisibilityState.DIDDISAPPEAR)
        }

        override fun onDestroy(owner: LifecycleOwner) {
            if (BuildConfig.IS_NAVIGATION_APP) {
                if (clusterId == null) {
                    MapTemplate.clearRootNavigationCallbacks(carContext)
                }
                NavigationManagerCoordinator.unregisterSession(navigationSessionId)
            }
            sessions.remove(moduleName)
            VirtualRenderer.removeRenderer(moduleName)
            clusterId?.let {
                HybridCluster.emit(ClusterEventName.DIDDISCONNECT, clusterId)
                clusterSessions.remove(it)
                return
            }

            HybridAutoPlay.clearPendingVoiceInput()
            HybridAutoPlay.emit(EventName.DIDDISCONNECT)
        }
    }

    data class ScreenContext(
        val carContext: CarContext, val session: AndroidAutoSession, var state: VisibilityState
    )

    companion object {
        const val TAG = "AndroidAutoSession"
        const val ROOT_SESSION = "AutoPlayRoot"

        private val sessions = ConcurrentHashMap<String, ScreenContext>()

        private val clusterSessions = CopyOnWriteArrayList<String>()

        fun getIsConnected(): Boolean {
            return sessions.containsKey(ROOT_SESSION)
        }

        fun getState(marker: String): VisibilityState? {
            return sessions[marker]?.state
        }

        fun getCarContext(marker: String): CarContext? {
            return sessions[marker]?.carContext
        }

        fun getRootContext(): CarContext? {
            return sessions[ROOT_SESSION]?.carContext
        }

        fun getClusterSessions(): Array<String> {
            return clusterSessions.toTypedArray()
        }
    }
}
