import { AppRegistry, DeviceEventEmitter, Platform, type TaskProvider } from 'react-native';
import type { AutoPlay as NitroAutoPlay } from './specs/AutoPlay.nitro';

const ALL_CAR_SESSIONS_DISCONNECTED_EVENT = 'react-native-auto-play.allCarSessionsDisconnected';

const createTaskProvider =
  (hybridAutoPlay: NitroAutoPlay): TaskProvider =>
  () =>
  () =>
    new Promise<void>((resolve) => {
      let isFinished = false;
      const finishIfCarRuntimeStopped = () => {
        if (isFinished || hybridAutoPlay.isCarServiceRunning()) {
          return;
        }

        isFinished = true;
        subscription.remove();
        resolve();
      };
      const subscription = DeviceEventEmitter.addListener(
        ALL_CAR_SESSIONS_DISCONNECTED_EVENT,
        finishIfCarRuntimeStopped
      );

      // The final native session can disappear while React is still starting.
      // Reconcile after listener registration so that transition cannot be lost.
      finishIfCarRuntimeStopped();
    });

const registerHeadlessTask = (hybridAutoPlay: NitroAutoPlay) => {
  if (Platform.OS !== 'android') {
    return;
  }
  AppRegistry.registerHeadlessTask('AndroidAutoHeadlessJsTask', createTaskProvider(hybridAutoPlay));
};

export default { registerHeadlessTask };
