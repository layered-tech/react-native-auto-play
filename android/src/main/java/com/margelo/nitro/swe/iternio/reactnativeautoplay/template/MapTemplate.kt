package com.margelo.nitro.swe.iternio.reactnativeautoplay.template

import android.graphics.Color
import androidx.car.app.AppManager
import androidx.car.app.CarContext
import androidx.car.app.model.Action
import androidx.car.app.model.ActionStrip
import androidx.car.app.model.Alert
import androidx.car.app.model.AlertCallback
import androidx.car.app.model.CarColor
import androidx.car.app.model.Template
import androidx.car.app.navigation.model.Destination
import androidx.car.app.navigation.model.MessageInfo
import androidx.car.app.navigation.model.NavigationTemplate
import androidx.car.app.navigation.model.RoutingInfo
import androidx.car.app.navigation.model.TravelEstimate
import androidx.car.app.navigation.model.Trip
import com.facebook.react.bridge.UiThreadUtil
import com.margelo.nitro.swe.iternio.reactnativeautoplay.AlertActionStyle
import com.margelo.nitro.swe.iternio.reactnativeautoplay.AlertDismissalReason
import com.margelo.nitro.swe.iternio.reactnativeautoplay.AndroidAutoScreen
import com.margelo.nitro.swe.iternio.reactnativeautoplay.AndroidAutoService
import com.margelo.nitro.swe.iternio.reactnativeautoplay.AndroidAutoSession
import com.margelo.nitro.swe.iternio.reactnativeautoplay.MapTemplateConfig
import com.margelo.nitro.swe.iternio.reactnativeautoplay.NitroAction
import com.margelo.nitro.swe.iternio.reactnativeautoplay.NitroManeuver
import com.margelo.nitro.swe.iternio.reactnativeautoplay.NitroMapButton
import com.margelo.nitro.swe.iternio.reactnativeautoplay.NitroNavigationAlert
import com.margelo.nitro.swe.iternio.reactnativeautoplay.NavigationManagerCoordinator
import com.margelo.nitro.swe.iternio.reactnativeautoplay.TripConfig
import com.margelo.nitro.swe.iternio.reactnativeautoplay.TripPoint
import com.margelo.nitro.swe.iternio.reactnativeautoplay.VisibleTravelEstimate
import java.security.InvalidParameterException

class MapTemplate(
    context: CarContext, config: MapTemplateConfig, initNavigationManager: Boolean = false
) : AndroidAutoTemplate<MapTemplateConfig>(context, config) {

    override val isRenderTemplate = true
    override val templateId: String
        get() = config.id
    override val autoDismissMs = config.autoDismissMs

    private var alertPriority = 0
    private var alertIds: HashSet<Int> = HashSet()

    init {
        if (initNavigationManager) {
            UiThreadUtil.runOnUiThread {
                setRootNavigationCallbacks(
                    context,
                    config.onStopNavigation,
                    config.onAutoDriveEnabled
                )
            }
        }
    }

    override fun parse(): Template {
        return NavigationTemplate.Builder().apply {
            setBackgroundColor(cardBackgroundColor)
            config.mapButtons?.let { buttons ->
                setMapActionStrip(Parser.parseMapActions(context, buttons))
            }
            config.headerActions?.let { headerActions ->
                setActionStrip(Parser.parseMapHeaderActions(context, headerActions))
            } ?: run {
                setActionStrip(
                    ActionStrip.Builder()
                        .addAction(Action.APP_ICON)
                        .build()
                )
            }
            val travelEstimates =
                if (config.visibleTravelEstimate == VisibleTravelEstimate.FIRST) destinationTravelEstimates.firstOrNull() else destinationTravelEstimates.lastOrNull()
            travelEstimates?.let {
                setDestinationTravelEstimate(
                    Parser.parseTravelEstimates(it.travelEstimates)
                )
            }
            if (isNavigating) {
                navigationInfo?.let {
                    setNavigationInfo(it)
                }
            }
            config.onDidChangePanningInterface?.let {
                setPanModeListener { isInPanMode ->
                    it(isInPanMode)
                }
            }
        }.build()
    }

    override fun setTemplateHeaderActions(headerActions: Array<NitroAction>?) {
        config = config.copy(headerActions = headerActions)
        super.applyConfigUpdate()
    }

    override fun onWillAppear() {
        config.onWillAppear?.let { it(null) }
    }

    override fun onWillDisappear() {
        config.onWillDisappear?.let { it(null) }
    }

    override fun onDidAppear() {
        config.onDidAppear?.let { it(null) }
    }

    override fun onDidDisappear() {
        config.onDidDisappear?.let { it(null) }
    }

    override fun onPopped() {
        config.onPopped?.let { it() }
        templates.remove(templateId)
    }

    fun setMapActions(buttons: Array<NitroMapButton>?) {
        config = config.copy(mapButtons = buttons)
        applyConfigUpdate()
    }

    fun showAlert(alertConfig: NitroNavigationAlert) {
        if (alertPriority > alertConfig.priority) {
            // ignore alerts with lower priority than current alert
            return
        }

        val title = Parser.parseText(alertConfig.title)
        val durationMillis = alertConfig.durationMs.toLong()

        val alert = Alert.Builder(alertConfig.id.toInt(), title, durationMillis).apply {
            var isAutoDismissal = false

            alertConfig.subtitle?.let { subtitle -> setSubtitle(Parser.parseText(subtitle)) }
            alertConfig.image?.let { image -> setIcon(Parser.parseImage(context, image)) }
            addAction(Action.Builder().apply {
                setTitle(alertConfig.primaryAction.title)
                setFlags(Action.FLAG_PRIMARY)
                setFlags(Action.FLAG_DEFAULT)
                setOnClickListener(alertConfig.primaryAction.onPress)
                alertConfig.primaryAction.style?.let { style ->
                    if (style == AlertActionStyle.DESTRUCTIVE) {
                        setBackgroundColor(CarColor.RED)
                    }
                }
            }.build())
            alertConfig.secondaryAction?.let { action ->
                addAction(Action.Builder().apply {
                    setTitle(action.title)
                    setOnClickListener(action.onPress)
                    action.style?.let { style ->
                        if (style == AlertActionStyle.DESTRUCTIVE) {
                            setBackgroundColor(CarColor.RED)
                        }
                    }
                }.build())
            }
            setCallback(object : AlertCallback {
                override fun onCancel(reason: Int) {
                    isAutoDismissal = true
                    when (reason) {
                        AlertCallback.REASON_TIMEOUT -> alertConfig.onDidDismiss?.let {
                            it(
                                AlertDismissalReason.TIMEOUT
                            )
                        }

                        AlertCallback.REASON_USER_ACTION -> alertConfig.onDidDismiss?.let {
                            it(AlertDismissalReason.USER)
                        }

                        AlertCallback.REASON_NOT_SUPPORTED -> {
                            alertConfig.onDidDismiss?.let { it(AlertDismissalReason.SYSTEM) }
                        }
                    }
                }

                override fun onDismiss() {
                    alertIds.remove(alertConfig.id.toInt())
                    if (alertIds.isEmpty()) {
                        alertPriority = 0
                    }

                    if (!isAutoDismissal) {
                        alertConfig.onDidDismiss?.let {
                            it(AlertDismissalReason.USER)
                        }
                    }
                }
            })
        }.build()

        if (!alertIds.contains(alert.id)) {
            alertIds.add(alert.id)
            alertPriority = alertConfig.priority.toInt()
        }

        try {
            context.getCarService(AppManager::class.java).showAlert(alert)
            alertConfig.onWillShow?.let { it() }
        } catch (error: Exception) {
            alertIds.remove(alert.id)
            if (alertIds.isEmpty()) alertPriority = 0
            alertConfig.onDidDismiss?.let { it(AlertDismissalReason.SYSTEM) }
        }
    }

    fun updateVisibleTravelEstimate(
        visibleTravelEstimate: VisibleTravelEstimate
    ) {
        config = config.copy(visibleTravelEstimate = visibleTravelEstimate)
        applyConfigUpdate()
    }

    companion object {
        private data class NavigationCallbacks(
            val onStopNavigation: () -> Unit,
            val onAutoDriveEnabled: (() -> Unit)?,
            val carContext: CarContext? = null
        )

        private var rootNavigationCallbacks: NavigationCallbacks? = null
        private var clusterNavigationCallbacks: NavigationCallbacks? = null
        var isNavigating = false
        var navigationInfo: NavigationTemplate.NavigationInfo? = null
        var cardBackgroundColor: CarColor = CarColor.createCustom(Color.BLACK, Color.BLACK)

        private var destinationTravelEstimates: Array<TripPoint> = arrayOf()

        fun getTripDestinations(): Map<Destination, TravelEstimate> {
            return mutableMapOf<Destination, TravelEstimate>().apply {
                destinationTravelEstimates.forEach { step ->
                    val destination = Destination.Builder().apply {
                        setName(step.name)
                    }.build()

                    val travelEstimates = Parser.parseTravelEstimates(step.travelEstimates)

                    put(destination, travelEstimates)
                }
            }
        }

        private fun createDestinationTrip(): Trip {
            return Trip.Builder().apply {
                getTripDestinations().forEach {
                    addDestination(it.key, it.value)
                }
            }.build()
        }

        fun updateTripDestinations() {
            val trip = createDestinationTrip()
            UiThreadUtil.runOnUiThread {
                NavigationManagerCoordinator.updateTrip(trip)
            }
        }

        fun startNavigation(trip: TripConfig) {
            isNavigating = true
            val steps = trip.routeChoice.steps

            destinationTravelEstimates = steps

            AndroidAutoScreen.invalidateSurfaceScreens()

            UiThreadUtil.runOnUiThread {
                NavigationManagerCoordinator.startNavigation(createDestinationTrip())
            }

            AndroidAutoService.instance?.startForeground()
        }

        fun updateTravelEstimates(steps: Array<TripPoint>) {
            destinationTravelEstimates = steps

            AndroidAutoScreen.invalidateSurfaceScreens()
        }

        fun stopNavigation() {
            navigationEnded()
        }

        fun navigationEnded() {
            NavigationManagerCoordinator.navigationEnded()
            clearNavigationPresentation()
        }

        internal fun onHostNavigationStopped() {
            clearNavigationPresentation()
            getNavigationCallbacks()?.onStopNavigation?.invoke()
        }

        internal fun onAutoDriveEnabled() {
            getNavigationCallbacks()?.onAutoDriveEnabled?.invoke()
        }

        internal fun setClusterNavigationCallbacks(
            onStopNavigation: () -> Unit,
            onAutoDriveEnabled: (() -> Unit)?
        ) {
            clusterNavigationCallbacks = NavigationCallbacks(
                onStopNavigation,
                onAutoDriveEnabled
            )
        }

        internal fun clearClusterNavigationCallbacks() {
            clusterNavigationCallbacks = null
        }

        internal fun clearRootNavigationCallbacks(context: CarContext) {
            if (rootNavigationCallbacks?.carContext === context) {
                rootNavigationCallbacks = null
            }
        }

        private fun setRootNavigationCallbacks(
            context: CarContext,
            onStopNavigation: () -> Unit,
            onAutoDriveEnabled: (() -> Unit)?
        ) {
            rootNavigationCallbacks = NavigationCallbacks(
                onStopNavigation,
                onAutoDriveEnabled,
                context
            )
        }

        private fun getNavigationCallbacks(): NavigationCallbacks? {
            return if (AndroidAutoSession.getIsConnected()) {
                rootNavigationCallbacks ?: clusterNavigationCallbacks
            } else {
                clusterNavigationCallbacks
            }
        }

        private fun clearNavigationPresentation() {
            isNavigating = false
            destinationTravelEstimates = arrayOf()
            navigationInfo = null

            AndroidAutoService.instance?.clearNavigationNotification()
            AndroidAutoScreen.invalidateSurfaceScreens()
        }

        fun updateManeuvers(maneuvers: NitroManeuver) {
            if (!isNavigating) {
                return
            }

            val context = NavigationManagerCoordinator.getNavigationCarContext()
                ?: throw InvalidParameterException("updateManeuvers, could not get a car context")

            val routingInfo = maneuvers.asFirstOrNull()
            val messageInfo = maneuvers.asSecondOrNull()
            val loadingInfo = maneuvers.asThirdOrNull()

            if (routingInfo.isNullOrEmpty() && messageInfo == null && loadingInfo == null) {
                navigationInfo = null
                AndroidAutoScreen.invalidateSurfaceScreens()
                return
            }

            if (loadingInfo != null) {
                cardBackgroundColor = Parser.parseColor(loadingInfo.cardBackgroundColor)
                navigationInfo = RoutingInfo.Builder().setLoading(true).build()
                AndroidAutoScreen.invalidateSurfaceScreens()
                return
            }

            if (messageInfo != null) {
                val backgroundColor =
                    if (context.isDarkMode) messageInfo.cardBackgroundColor.darkColor else messageInfo.cardBackgroundColor.lightColor
                cardBackgroundColor = Parser.parseColor(backgroundColor)

                navigationInfo = MessageInfo.Builder(messageInfo.title).apply {
                    messageInfo.text?.let {
                        setText(it)
                    }
                    messageInfo.image?.let {
                        setImage(Parser.parseImage(context, it))
                    }
                }.build()

                AndroidAutoScreen.invalidateSurfaceScreens()
                return
            }

            val current = routingInfo?.getOrNull(0)
            val next = routingInfo?.getOrNull(1)

            if (current == null) {
                return
            }

            val backgroundColor =
                if (context.isDarkMode) current.cardBackgroundColor.darkColor else current.cardBackgroundColor.lightColor
            cardBackgroundColor = Parser.parseColor(backgroundColor)

            val currentStep = Parser.parseStep(context, current)
            val currentDistance = Parser.parseDistance(current.travelEstimates.distanceRemaining)

            val nextStep = next?.let { Parser.parseStep(context, it) }

            AndroidAutoService.instance?.let {
                val notificationIcon = Parser.parseImageToBitmap(
                    context,
                    current.symbolImage.asFirstOrNull(),
                    current.symbolImage.asSecondOrNull(),
                    current.symbolImage.asThirdOrNull()
                )

                val notificationText = currentStep.cue?.toString()

                val notificationTitle = "${currentDistance.displayDistance.toInt()} ${
                    Parser.parseDistanceUnit(currentDistance.displayUnit)
                }"

                it.notify(
                    notificationTitle, notificationText, notificationIcon
                )
            }

            navigationInfo = RoutingInfo.Builder().apply {
                setCurrentStep(
                    currentStep, currentDistance
                )
                nextStep?.let { setNextStep(it) }
            }.build()

            AndroidAutoScreen.invalidateSurfaceScreens()

            UiThreadUtil.runOnUiThread {
                val trip = Trip.Builder().apply {
                    addStep(
                        currentStep, Parser.parseTravelEstimates(current.travelEstimates)
                    )
                    nextStep?.let {
                        addStep(it, Parser.parseTravelEstimates(next.travelEstimates))
                    }
                    getTripDestinations().forEach {
                        addDestination(it.key, it.value)
                    }
                }.build()
                NavigationManagerCoordinator.updateTrip(trip)
            }
        }
    }
}
