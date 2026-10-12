import type { Orientation } from '../core/games/sensorControl';
import type { Sample } from '../core/games/shakeMeasure';

/**
 * Reading the phone's own sensors (orientation and acceleration), and buzzing it. Everything here fails quietly: a laptop,
 * a refused permission or a phone without the sensor all end the same way, with the function reporting that nothing is
 * available so that the game can fall back to touch. Nothing in this file decides anything about the physics: the
 * readings are handed to the pure functions in core/games.
 */
export type SensorKind = 'orientation' | 'motion';

type EventClass = { requestPermission?: () => Promise<'granted' | 'denied'> };

const eventClass = (kind: SensorKind): EventClass | undefined => {
  if (typeof window === 'undefined') return undefined;
  const w = window as unknown as Record<string, EventClass | undefined>;
  return w[kind === 'orientation' ? 'DeviceOrientationEvent' : 'DeviceMotionEvent'];
};

/** True when this browser or webview has the event at all (a laptop usually does, and never sends a real reading). */
export const sensorEventExists = (kind: SensorKind): boolean => eventClass(kind) !== undefined;

/** iOS asks for a tap and then a permission; Android webviews do not. */
export const needsPermissionTap = (kind: SensorKind): boolean => typeof eventClass(kind)?.requestPermission === 'function';

export async function askForPermission(kind: SensorKind): Promise<'granted' | 'denied'> {
  const ask = eventClass(kind)?.requestPermission;
  if (typeof ask !== 'function') return 'granted';
  try {
    return await ask.call(eventClass(kind));
  } catch {
    return 'denied';
  }
}

/** Listens to orientation. Returns the function that stops listening. */
export function listenOrientation(callback: (r: Orientation) => void): () => void {
  const handler = (e: Event) => {
    const o = e as DeviceOrientationEvent;
    callback({ alpha: o.alpha ?? null, beta: o.beta ?? null, gamma: o.gamma ?? null });
  };
  window.addEventListener('deviceorientation', handler);
  return () => window.removeEventListener('deviceorientation', handler);
}

/** Listens to acceleration including gravity. Returns the function that stops listening. */
export function listenMotion(callback: (s: Sample) => void): () => void {
  const handler = (e: Event) => {
    const a = (e as DeviceMotionEvent).accelerationIncludingGravity;
    if (!a || a.x == null || a.y == null || a.z == null) return;
    callback({ t: Date.now(), x: a.x, y: a.y, z: a.z });
  };
  window.addEventListener('devicemotion', handler);
  return () => window.removeEventListener('devicemotion', handler);
}

/** A short buzz where the device allows it; does nothing elsewhere. */
export function buzz(pattern: number | number[]): void {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') navigator.vibrate(pattern);
  } catch {
    // some webviews throw when vibration is blocked: that is fine
  }
}

/**
 * Are we inside the installed app (or a development server)? The three sensor games are for the app and are not shown in
 * the website build, where a laptop has no tilt and no shake.
 */
export function isAppBuild(isNative: boolean, isDev: boolean): boolean {
  return isNative || isDev;
}
