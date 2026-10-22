import { useEffect, useState } from 'react';
import { PermissionsAndroid } from 'react-native';
import { HybridAndroidAutoTelemetry } from '../hybrid/HybridAndroidAutoTelemetry';
import { HybridAutoPlay } from '../hybrid/HybridAutoPlay';
/**
 * Hook to check if the telemetry permissions are granted. If the permissions are not granted, it will request them from the user.
 *
 * @namespace Android
 * @param requestTelemetryPermissions If true, the telemetry permissions will be requested from the user. Can be set to false initially, in case other permissions need to be requested first, so the permission request dialogs do not overlap.
 * @param requiredPermissions The permissions to check.
 */
export const useAndroidAutoTelemetry = ({ requestTelemetryPermissions = true, requiredPermissions = [], automotivePermissionRequest, isAndroidAutomotive = false, }) => {
    const [permissionsGranted, setPermissionsGranted] = useState(null);
    const [telemetry, setTelemetry] = useState(undefined);
    const [error, setError] = useState(undefined);
    const [isConnected, setIsConnected] = useState(isAndroidAutomotive);
    useEffect(() => {
        if (isAndroidAutomotive) {
            return;
        }
        const removeDidConnect = HybridAutoPlay.addListener('didConnect', () => setIsConnected(true));
        const removeDidDisconnect = HybridAutoPlay.addListener('didDisconnect', () => setIsConnected(false));
        setIsConnected(HybridAutoPlay.isConnected());
        return () => {
            removeDidConnect();
            removeDidDisconnect();
        };
    }, [isAndroidAutomotive]);
    useEffect(() => {
        const checkPermissions = async () => {
            const state = await Promise.all(requiredPermissions.map((permission) => PermissionsAndroid.check(permission).catch(() => false)));
            setPermissionsGranted(state.every((granted) => granted));
        };
        void checkPermissions();
    }, [requiredPermissions]);
    useEffect(() => {
        if (!isConnected || !permissionsGranted) {
            return;
        }
        try {
            const remove = HybridAndroidAutoTelemetry?.registerTelemetryListener(setTelemetry);
            return () => remove?.();
        }
        catch (e) {
            if (e instanceof Error) {
                setError(`${e.name}: ${e.message}\n${e.stack ?? ''}`.trim());
            }
            else {
                setError(String(e));
            }
        }
        return;
    }, [isConnected, permissionsGranted]);
    useEffect(() => {
        if (!requestTelemetryPermissions || requiredPermissions.length === 0) {
            return;
        }
        if (permissionsGranted !== false) {
            // either wait for permission request to finish or do nothing in case permissions are granted already
            return;
        }
        if (automotivePermissionRequest?.message != null) {
            HybridAndroidAutoTelemetry?.requestAutomotivePermissions(requiredPermissions, automotivePermissionRequest.message, automotivePermissionRequest.grantButtonText, automotivePermissionRequest.cancelButtonText)
                .then(({ granted, denied }) => {
                const isGranted = granted.length === requiredPermissions.length;
                setPermissionsGranted(isGranted);
                if (!isGranted) {
                    setError(`Android Automotive permissions denied: [${denied.join(',')}]`);
                }
            })
                .catch((e) => {
                const message = e instanceof Error ? e.message : String(e);
                setError(message);
            });
            return;
        }
        // PermissionsAndroid is not aware of Android Auto related permissions
        PermissionsAndroid.requestMultiple(requiredPermissions)
            .then((result) => {
            const isGranted = requiredPermissions.every((permission) => result[permission] === 'granted');
            if (!isGranted) {
                console.warn('Android Auto telemetry permissions not granted');
                return;
            }
            setPermissionsGranted(true);
        })
            .catch((e) => console.error('Android Auto telemetry permissions error', e));
    }, [
        requestTelemetryPermissions,
        requiredPermissions,
        permissionsGranted,
        automotivePermissionRequest?.cancelButtonText,
        automotivePermissionRequest?.grantButtonText,
        automotivePermissionRequest?.message,
    ]);
    return {
        /**
         * null on pending permission check, True if the telemetry permissions are granted, false otherwise.
         */
        permissionsGranted,
        /**
         * The telemetry data, might be a partial update not containing all properties of the regular timed updates.
         * For example gear changes are emitted immediately without all the other telemetry data.
         */
        telemetry,
        /**
         * The error message if the telemetry listener failed to start.
         */
        error,
    };
};
