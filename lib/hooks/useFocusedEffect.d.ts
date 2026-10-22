/**
 * An effect hook that only runs when the CarPlay/Android Auto screen is visible to the user and dependencies have changed.
 * It behaves like `useEffect`, but the effect function is only executed if the screen is visible.
 *
 * @param moduleName The name of the root module to listen to for focus changes - one of AutoPlayModules or a cluster uuid.
 * @param effect The effect function to run.
 * @param deps An array of dependencies for the effect.
 */
export declare function useFocusedEffect(moduleName: string, effect: () => void | (() => void), deps: readonly unknown[]): void;
