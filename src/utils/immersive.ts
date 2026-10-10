import { Capacitor, registerPlugin } from '@capacitor/core';

/** The small Android plugin in android/.../ImmersivePlugin.java. It does not exist in the browser. */
interface ImmersivePlugin {
  set(options: { on: boolean }): Promise<void>;
}

const Immersive = registerPlugin<ImmersivePlugin>('Immersive');

/**
 * Hides (or brings back) the phone's status bar and navigation buttons, for full-screen video. In a browser, and in an app
 * build that does not have the plugin, it does nothing and never throws.
 */
export async function setImmersive(on: boolean): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await Immersive.set({ on });
  } catch {
    // the plugin is missing or the activity is gone: the video still works, with the bars showing
  }
}
