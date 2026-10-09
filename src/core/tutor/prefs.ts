import { TUTOR_LEVELS } from './types.ts';
import type { TutorLevel } from './types.ts';

export const CONSENT_KEY = 'qisket_tutor_consent_v1';
export const LEVEL_KEY = 'qisket_tutor_level_v1';

/** `online`: questions may be sent to the online tutor. `offline`: answer only from the notes on the device. */
export type TutorConsent = 'online' | 'offline';

type Store = Pick<Storage, 'getItem' | 'setItem'> | null;

function read(store: Store, key: string): string | null {
  try {
    return store?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function write(store: Store, key: string, value: string): void {
  try {
    store?.setItem(key, value);
  } catch {
    // storage blocked: the choice just is not remembered
  }
}

/** `null` means the learner has not been asked yet. */
export function readConsent(store: Store): TutorConsent | null {
  const v = read(store, CONSENT_KEY);
  return v === 'online' || v === 'offline' ? v : null;
}

export const writeConsent = (store: Store, value: TutorConsent): void => write(store, CONSENT_KEY, value);

export function readLevel(store: Store): TutorLevel {
  const v = read(store, LEVEL_KEY);
  return (TUTOR_LEVELS as readonly string[]).includes(v ?? '') ? (v as TutorLevel) : 'beginner';
}

export const writeLevel = (store: Store, value: TutorLevel): void => write(store, LEVEL_KEY, value);
