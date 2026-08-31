package com.margelo.nitro.swe.iternio.reactnativeautoplay

import android.content.Intent
import android.os.Binder
import android.os.IBinder
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.jstasks.HeadlessJsTaskConfig
import com.facebook.react.modules.core.DeviceEventManagerModule

class HeadlessTaskService : HeadlessJsTaskService() {
    // we use a bound service so it will never be killed when Android Auto is active
    inner class LocalBinder : Binder() {
        fun getService() = this@HeadlessTaskService
    }

    private val mBinder = LocalBinder()

    override fun onCreate() {
        super.onCreate()
        instance = this
    }

    override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig {
        val data = intent?.extras?.let {
            Arguments.fromBundle(it)
        } ?: Arguments.createMap()

        return HeadlessJsTaskConfig(
            taskKey = "AndroidAutoHeadlessJsTask", data = data, isAllowedInForeground = true
        )
    }

    override fun onBind(intent: Intent): IBinder? {
        // Start the headless task when bound
        UiThreadUtil.runOnUiThread {
            startTask(getTaskConfig(intent))
        }
        return mBinder
    }

    override fun onDestroy() {
        if (instance === this) {
            instance = null
        }
        super.onDestroy()
    }

    private fun emitAllCarSessionsDisconnected() {
        reactContext?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)?.emit(
            ALL_CAR_SESSIONS_DISCONNECTED_EVENT,
            null
        )
    }

    companion object {
        private const val ALL_CAR_SESSIONS_DISCONNECTED_EVENT =
            "react-native-auto-play.allCarSessionsDisconnected"

        @Volatile
        private var instance: HeadlessTaskService? = null

        fun notifyAllCarSessionsDisconnected() {
            instance?.emitAllCarSessionsDisconnected()
        }
    }
}
