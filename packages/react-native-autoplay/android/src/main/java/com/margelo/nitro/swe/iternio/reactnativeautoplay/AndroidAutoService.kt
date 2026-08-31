package com.margelo.nitro.swe.iternio.reactnativeautoplay

import android.Manifest
import android.annotation.SuppressLint
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.ComponentName
import android.content.Intent
import android.content.ServiceConnection
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.car.app.CarAppService
import androidx.car.app.Session
import androidx.car.app.SessionInfo
import androidx.car.app.notification.CarAppExtender
import androidx.car.app.notification.CarNotificationManager
import androidx.car.app.validation.HostValidator
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import com.margelo.nitro.swe.iternio.reactnativeautoplay.utils.AppInfo

class AndroidAutoService : CarAppService() {
    private lateinit var notificationManager: NotificationManager
    private lateinit var carNotificationManager: CarNotificationManager

    private var isServiceBound = false
    private var hasNotificationContent = false
    private var lastNotificationTitle: String? = null
    private var lastNotificationText: String? = null
    private var lastNotificationIcon: Bitmap? = null

    @SuppressLint("PrivateResource")
    override fun createHostValidator(): HostValidator {
        return if ((applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
            HostValidator.ALLOW_ALL_HOSTS_VALIDATOR
        } else {
            HostValidator.Builder(applicationContext)
                .addAllowedHosts(androidx.car.app.R.array.hosts_allowlist_sample).build()
        }
    }

    override fun onCreate() {
        super.onCreate()
        instance = this

        notificationManager = getSystemService(NotificationManager::class.java)
        carNotificationManager = CarNotificationManager.from(this)
        val appLabel = AppInfo.getApplicationLabel(this)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            getSystemService(NotificationManager::class.java).createNotificationChannel(
                NotificationChannel(
                    CHANNEL_ID, appLabel, NotificationManager.IMPORTANCE_DEFAULT
                )
            )
        }
    }

    override fun onCreateSession(sessionInfo: SessionInfo): Session {
        val session = AndroidAutoSession(sessionInfo)

        if (sessionInfo.displayType == SessionInfo.DISPLAY_TYPE_CLUSTER) {
            return session
        }

        session.lifecycle.addObserver(sessionLifecycleObserver)

        return session
    }

    override fun onDestroy() {
        super.onDestroy()
        instance = null

        stopForeground(STOP_FOREGROUND_REMOVE)
    }

    private val sessionLifecycleObserver = object : DefaultLifecycleObserver {
        override fun onCreate(owner: LifecycleOwner) {
            this@AndroidAutoService.startForeground()

            val serviceIntent = Intent(applicationContext, HeadlessTaskService::class.java)
            bindService(serviceIntent, connection, BIND_AUTO_CREATE)
        }

        override fun onDestroy(owner: LifecycleOwner) {
            if (isServiceBound) {
                unbindService(connection)
                isServiceBound = false
            }

            this@AndroidAutoService.stopForeground(STOP_FOREGROUND_REMOVE)
        }
    }

    private val connection: ServiceConnection = object : ServiceConnection {
        override fun onServiceConnected(
            className: ComponentName, service: IBinder
        ) {
            isServiceBound = true
        }

        override fun onServiceDisconnected(arg0: ComponentName) {
            isServiceBound = false
        }
    }

    private fun createNotificationBuilder(
        title: String?, text: String?, largeIcon: Bitmap?
    ): NotificationCompat.Builder {
        val hasNavigationContent =
            BuildConfig.IS_NAVIGATION_APP && (title != null || text != null || largeIcon != null)
        val notificationCategory = if (hasNavigationContent) {
            NotificationCompat.CATEGORY_NAVIGATION
        } else {
            NotificationCompat.CATEGORY_SERVICE
        }
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification).setOngoing(true)
            .setCategory(notificationCategory).setOnlyAlertOnce(true)
            .setWhen(System.currentTimeMillis()).setPriority(NotificationCompat.PRIORITY_LOW)
            .apply {
                if (hasNavigationContent) {
                    extend(
                        CarAppExtender.Builder()
                            .setImportance(NotificationManagerCompat.IMPORTANCE_LOW)
                            .build()
                    )
                }
                title?.let {
                    setContentTitle(it)
                }
                text?.let {
                    setContentText(it)
                    setTicker(it)
                }
                largeIcon?.let {
                    setLargeIcon(it)
                }
            }
    }

    fun startForeground() {
        val isLocationPermissionGranted =
            checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED || checkSelfPermission(
                Manifest.permission.ACCESS_FINE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED

        if (!isLocationPermissionGranted) {
            Log.w(TAG, "location permission not granted, unable to start foreground service!")
            return
        }

        try {
            startForeground(
                NOTIFICATION_ID, createNotificationBuilder(null, null, null).build()
            )
            rememberNotificationContent(null, null, null)
        } catch (e: SecurityException) {
            Log.e(TAG, "failed to start foreground service", e)
        }
    }

    fun notify(title: String?, text: String?, icon: Bitmap?) {
        if (notificationContentMatches(title, text, icon)) {
            return
        }

        val notificationBuilder = createNotificationBuilder(title, text, icon)
        if (BuildConfig.IS_NAVIGATION_APP && (title != null || text != null || icon != null)) {
            carNotificationManager.notify(NOTIFICATION_ID, notificationBuilder)
        } else {
            notificationManager.notify(NOTIFICATION_ID, notificationBuilder.build())
        }
        rememberNotificationContent(title, text, icon)
    }

    fun clearNavigationNotification() {
        clearNotificationContent()
        notify(null, null, null)
    }

    private fun notificationContentMatches(
        title: String?, text: String?, icon: Bitmap?
    ): Boolean {
        if (!hasNotificationContent || title != lastNotificationTitle || text != lastNotificationText) {
            return false
        }

        val previousIcon = lastNotificationIcon
        return when {
            icon === previousIcon -> true
            icon == null || previousIcon == null -> false
            else -> try {
                icon.sameAs(previousIcon)
            } catch (_: IllegalArgumentException) {
                false
            }
        }
    }

    private fun rememberNotificationContent(
        title: String?, text: String?, icon: Bitmap?
    ) {
        hasNotificationContent = true
        lastNotificationTitle = title
        lastNotificationText = text
        lastNotificationIcon = icon
    }

    private fun clearNotificationContent() {
        hasNotificationContent = false
        lastNotificationTitle = null
        lastNotificationText = null
        lastNotificationIcon = null
    }

    companion object {
        const val TAG = "AndroidAutoService"
        private const val NOTIFICATION_ID = 1
        private const val CHANNEL_ID = "AutoPlayServiceChannel"

        var instance: AndroidAutoService? = null
            private set
    }
}
