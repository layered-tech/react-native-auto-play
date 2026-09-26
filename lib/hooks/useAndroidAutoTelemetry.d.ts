import type { AndroidAutoPermissions, Telemetry } from '../types/Telemetry';
type Props = {
    /**
     * Can be used to delay asking for permissions if set to false. True by default.
     * Can be used to request other permissions first, so the permission request dialogs do not overlap.
     * @default true
     */
    requestTelemetryPermissions: true;
    /**
     * The permissions to check.
     */
    requiredPermissions: Array<AndroidAutoPermissions>;
    /**
     * Android Automotive specific permission request properties
     */
    automotivePermissionRequest?: {
        /**
         * message to be shown on the permission request screen
         */
        message: string;
        /**
         * primary action button text
         */
        grantButtonText: string;
        /**
         * secondary action button text, if not specified button will not be shown
         */
        cancelButtonText?: string;
    };
    /**
     * set to true in case your build variant targets Android Automotive
     */
    isAndroidAutomotive?: boolean;
} | {
    requestTelemetryPermissions: false | undefined;
    requiredPermissions?: never;
    automotivePermissionRequest?: never;
    isAndroidAutomotive?: boolean;
};
/**
 * Hook to check if the telemetry permissions are granted. If the permissions are not granted, it will request them from the user.
 *
 * @namespace Android
 * @param requestTelemetryPermissions If true, the telemetry permissions will be requested from the user. Can be set to false initially, in case other permissions need to be requested first, so the permission request dialogs do not overlap.
 * @param requiredPermissions The permissions to check.
 */
export declare const useAndroidAutoTelemetry: ({ requestTelemetryPermissions, requiredPermissions, automotivePermissionRequest, isAndroidAutomotive, }: Props) => {
    /**
     * null on pending permission check, True if the telemetry permissions are granted, false otherwise.
     */
    permissionsGranted: boolean | null;
    /**
     * The telemetry data, might be a partial update not containing all properties of the regular timed updates.
     * For example gear changes are emitted immediately without all the other telemetry data.
     */
    telemetry: Telemetry | undefined;
    /**
     * The error message if the telemetry listener failed to start.
     */
    error: string | undefined;
};
export {};
