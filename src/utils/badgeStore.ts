/**
 * Which badges the learner has already looked at, so the app can mark new ones. This is only a convenience: badges
 * themselves are worked out from progress (see core/learn/badges.ts) and are never stored. It fails quietly: with no
 * storage, every earned badge simply shows as new until the Progress screen is opened, and the memory copy keeps the
 * answer for the rest of the visit.
 *
 * It is a tiny external store, so the Home card and the Progress screen agree about what is new.
 */
const KEY = 'qisket_badges_seen_v1';
let memory: string[] | null = null;
const listeners = new Set<() => void>();

function load(): string[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.filter((x): x is string => typeof x === 'string');
      }
      return [];
    }
  } catch {
    // fall through to an empty list
  }
  return [];
}

/** The ids seen so far. The same array is returned until something changes (so React can compare it). */
export function readSeenBadges(): string[] {
  if (memory === null) memory = load();
  return memory;
}

export function writeSeenBadges(ids: string[]): void {
  const unique = [...new Set(ids)];
  const current = readSeenBadges();
  if (unique.length === current.length && unique.every((id, i) => id === current[i])) return;
  memory = unique;
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(unique));
  } catch {
    // ignore: the memory copy still works for this visit
  }
  listeners.forEach((l) => l());
}

export function subscribeSeenBadges(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
