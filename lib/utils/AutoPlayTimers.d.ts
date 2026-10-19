/**
 * Replaces the global `setTimeout`/`setInterval`/`clearTimeout`/`clearInterval` and
 * `requestAnimationFrame`/`cancelAnimationFrame` with implementations backed by the native
 * `AutoPlayTiming` module, so they keep running while the app is actively driving a car
 * surface even though the phone itself is backgrounded or its screen is locked. React
 * Native's own timers throttle or pause in that state regardless of whether the process is
 * actually still alive, which would otherwise stall ETA updates and telemetry polling.
 *
 * `requestIdleCallback`/`cancelIdleCallback` are deliberately not covered: bridgeless RN
 * backs those with a separate native module unrelated to `setTimeout`/`requestAnimationFrame`
 * (and its own callback delivery path is an unimplemented stub on iOS), so there is nothing
 * for this library to intercept there.
 *
 * All due-time bookkeeping happens natively -- this is a thin pass-through, so JS only
 * crosses the bridge when a timer actually fires, not on some fixed interval.
 *
 * Call this **once**, as early as possible in your app -- ideally the first line of your
 * entry file, before any other import -- so nothing else has already captured a reference to
 * the original globals. Safe to call more than once; only the first call has any effect.
 */
export declare function installAutoPlayTimers(): void;
