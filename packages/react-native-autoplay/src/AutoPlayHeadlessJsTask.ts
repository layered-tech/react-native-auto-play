import { AppRegistry, Platform, type TaskProvider } from 'react-native';
import type { AutoPlay as NitroAutoPlay } from './specs/AutoPlay.nitro';

const createTaskProvider =
  (hybridAutoPlay: NitroAutoPlay): TaskProvider =>
  () =>
  () =>
    new Promise<void>((resolve) => {
      const remove = hybridAutoPlay.addListener('didDisconnect', () => {
        resolve();
        remove();
      });
    });

const registerHeadlessTask = (hybridAutoPlay: NitroAutoPlay) => {
  if (Platform.OS !== 'android') {
    return;
  }
  AppRegistry.registerHeadlessTask('AndroidAutoHeadlessJsTask', createTaskProvider(hybridAutoPlay));
};

export default { registerHeadlessTask };
