import { useCallback, useEffect, useRef, useState } from 'react';
import { createShakeDetector } from '../core/games/shakeMeasure';
import type { ShakeOptions } from '../core/games/shakeMeasure';
import type { Orientation } from '../core/games/sensorControl';
import { askForPermission, listenMotion, listenOrientation, needsPermissionTap, sensorEventExists } from '../utils/motion';
import type { SensorKind } from '../utils/motion';

/**
 * 'checking'    waiting to see whether the sensor really sends readings
 * 'needs-tap'   the system wants a tap and a permission first (iOS)
 * 'on'          readings are arriving
 * 'unavailable' no sensor, or it never sent a real reading (a laptop): the game uses touch
 * 'denied'      the learner said no: the game uses touch
 */
export type SensorStatus = 'checking' | 'needs-tap' | 'on' | 'unavailable' | 'denied';

/** How long to wait for a first real reading before deciding there is no sensor. */
const WAIT_MS = 1500;

/** The newest value, readable from an event handler without re-attaching the listener each render. */
function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}

function useSensor(kind: SensorKind, attach: (onReading: () => void) => () => void) {
  const [status, setStatus] = useState<SensorStatus>(() => (sensorEventExists(kind) ? (needsPermissionTap(kind) ? 'needs-tap' : 'checking') : 'unavailable'));
  const [started, setStarted] = useState(() => status === 'checking');
  const attachRef = useLatest(attach);

  useEffect(() => {
    if (!started) return undefined;
    let got = false;
    const stop = attachRef.current(() => {
      if (!got) {
        got = true;
        setStatus('on');
      }
    });
    const timer = setTimeout(() => {
      if (!got) setStatus('unavailable');
    }, WAIT_MS);
    return () => {
      clearTimeout(timer);
      stop();
    };
  }, [started, attachRef]);

  const enable = useCallback(async () => {
    const answer = await askForPermission(kind);
    if (answer === 'granted') {
      setStatus('checking');
      setStarted(true);
    } else {
      setStatus('denied');
    }
  }, [kind]);

  return { status, enable };
}

/** Calls `onReading` for every orientation reading that has a tilt in it. */
export function useOrientation(onReading: (r: Orientation) => void) {
  const callback = useLatest(onReading);
  return useSensor('orientation', (first) =>
    listenOrientation((r) => {
      // a laptop sends one reading made of nulls: that is not a sensor
      if (r.beta === null && r.gamma === null) return;
      first();
      callback.current(r);
    }),
  );
}

/** Calls `onShake` once for every shake. */
export function useShake(onShake: () => void, options?: ShakeOptions) {
  const callback = useLatest(onShake);
  const optionsRef = useLatest(options);
  return useSensor('motion', (first) => {
    const detector = createShakeDetector(optionsRef.current);
    return listenMotion((s) => {
      first();
      if (detector.push(s)) callback.current();
    });
  });
}

/** One sentence that says what the sensor is doing, for the screen. */
export function sensorMessage(status: SensorStatus, action: string): string {
  switch (status) {
    case 'on':
      return `Sensor on: ${action}.`;
    case 'checking':
      return 'Looking for the phone\'s motion sensor…';
    case 'needs-tap':
      return 'This phone asks for permission before a game can read its motion sensor.';
    case 'denied':
      return 'Motion was not allowed, so the touch controls are on. That works just as well.';
    default:
      return 'No motion sensor here, so the touch controls are on. On a phone with a sensor you can tilt or shake instead.';
  }
}
