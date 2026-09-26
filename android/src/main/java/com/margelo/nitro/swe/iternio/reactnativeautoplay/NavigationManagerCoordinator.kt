package com.margelo.nitro.swe.iternio.reactnativeautoplay

import android.util.Log
import androidx.car.app.CarContext
import androidx.car.app.navigation.NavigationManager
import androidx.car.app.navigation.NavigationManagerCallback
import androidx.car.app.navigation.model.Trip
import com.margelo.nitro.swe.iternio.reactnativeautoplay.template.MapTemplate

internal object NavigationManagerCoordinator {
    private data class SessionNavigationManager(
        val sessionId: String,
        val isRootSession: Boolean,
        val carContext: CarContext,
        val navigationManager: NavigationManager,
        var navigationStarted: Boolean = false
    )

    private val sessionManagers = linkedMapOf<String, SessionNavigationManager>()
    private var ownerSessionId: String? = null
    private var navigationIsActive = false
    private var latestTrip: Trip? = null

    fun registerSession(
        sessionId: String,
        carContext: CarContext,
        isRootSession: Boolean
    ) {
        val replacedManager = sessionManagers.remove(sessionId)
        val replacedOwner = ownerSessionId == sessionId
        replacedManager?.let {
            clearNavigationManagerCallback(it)
        }
        if (replacedOwner) {
            ownerSessionId = null
        }

        val navigationManager = carContext.getCarService(NavigationManager::class.java)
        val sessionManager = SessionNavigationManager(
            sessionId,
            isRootSession,
            carContext,
            navigationManager
        )

        navigationManager.setNavigationManagerCallback(
            object : NavigationManagerCallback {
                override fun onAutoDriveEnabled() {
                    if (ownerSessionId == sessionId) {
                        MapTemplate.onAutoDriveEnabled()
                    }
                }

                override fun onStopNavigation() {
                    handleHostNavigationStopped(sessionId)
                }
            }
        )

        sessionManagers[sessionId] = sessionManager
        if (replacedOwner) {
            ownerSessionId = sessionId
            replayNavigationOnOwner(sessionManager)
        } else {
            selectOwnerIfNeeded()
        }
    }

    fun unregisterSession(sessionId: String) {
        val removedManager = sessionManagers.remove(sessionId) ?: return
        clearNavigationManagerCallback(removedManager)

        if (ownerSessionId == sessionId) {
            ownerSessionId = null
        }

        selectOwnerIfNeeded()
    }

    fun startNavigation(trip: Trip) {
        navigationIsActive = true
        latestTrip = trip
        selectOwnerIfNeeded()
        sendTripToOwner(trip)
    }

    fun updateTrip(trip: Trip) {
        if (!navigationIsActive) {
            return
        }

        latestTrip = trip
        sendTripToOwner(trip)
    }

    fun navigationEnded() {
        val owner = getOwner()
        val shouldNotifyHost = navigationIsActive && owner?.navigationStarted == true

        navigationIsActive = false
        latestTrip = null
        sessionManagers.values.forEach {
            it.navigationStarted = false
        }

        if (!shouldNotifyHost || owner == null) {
            return
        }

        try {
            owner.navigationManager.navigationEnded()
        } catch (error: IllegalStateException) {
            Log.w(TAG, "Unable to end navigation on the active car session", error)
        }
    }

    fun getNavigationCarContext(): CarContext? {
        selectOwnerIfNeeded()
        return getOwner()?.carContext
    }

    private fun handleHostNavigationStopped(sessionId: String) {
        if (ownerSessionId != sessionId || !navigationIsActive) {
            return
        }

        navigationIsActive = false
        latestTrip = null
        sessionManagers.values.forEach {
            it.navigationStarted = false
        }
        MapTemplate.onHostNavigationStopped()
    }

    private fun selectOwnerIfNeeded() {
        if (getOwner() != null) {
            return
        }

        val selectedOwner = sessionManagers.values.firstOrNull {
            it.isRootSession
        } ?: sessionManagers.values.firstOrNull()

        ownerSessionId = selectedOwner?.sessionId

        if (selectedOwner != null) {
            replayNavigationOnOwner(selectedOwner)
        }
    }

    private fun replayNavigationOnOwner(owner: SessionNavigationManager) {
        if (!navigationIsActive || !ensureNavigationStarted(owner)) {
            return
        }

        latestTrip?.let {
            updateTrip(owner, it)
        }
    }

    private fun sendTripToOwner(trip: Trip) {
        val owner = getOwner() ?: return

        if (!ensureNavigationStarted(owner)) {
            return
        }

        updateTrip(owner, trip)
    }

    private fun ensureNavigationStarted(owner: SessionNavigationManager): Boolean {
        if (owner.navigationStarted) {
            return true
        }

        return try {
            owner.navigationManager.navigationStarted()
            owner.navigationStarted = true
            true
        } catch (error: IllegalStateException) {
            Log.w(TAG, "Unable to start navigation on the active car session", error)
            false
        }
    }

    private fun updateTrip(owner: SessionNavigationManager, trip: Trip) {
        try {
            owner.navigationManager.updateTrip(trip)
        } catch (error: IllegalStateException) {
            Log.w(TAG, "Unable to update the active car session trip", error)
        }
    }

    private fun clearNavigationManagerCallback(sessionManager: SessionNavigationManager) {
        if (sessionManager.navigationStarted) {
            return
        }

        try {
            sessionManager.navigationManager.clearNavigationManagerCallback()
        } catch (error: IllegalStateException) {
            Log.w(TAG, "Unable to clear the disconnected navigation callback", error)
        }
    }

    private fun getOwner(): SessionNavigationManager? {
        return ownerSessionId?.let {
            sessionManagers[it]
        }
    }

    private const val TAG = "NavigationCoordinator"
}
