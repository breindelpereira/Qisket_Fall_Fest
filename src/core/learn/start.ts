import type { ActivityLink, LessonRecord, LessonStep } from '../../content/types';
import { flowOrder, lessonFlow } from './flow';

/**
 * How a module begins. The first time a learner opens a module that starts with a game or lab, they are asked whether to
 * play it first (recommended) or watch the video first, instead of landing in the middle of the page. The answer is
 * remembered per module: "play" and "all" keep the usual order, "watch" puts the video first.
 */
export type StartChoice = 'play' | 'watch' | 'all';

export interface StartOffer {
  /** The game or lab the module would normally open with. */
  activity: ActivityLink;
  /** Whether the module has a video to offer as the other way in. */
  canWatch: boolean;
}

/** What to offer at the start of a module, or null when it already starts with its video (nothing to choose). */
export function startOffer(
  lesson: Pick<LessonRecord, 'activities' | 'references' | 'flow'>,
  availableGameIds: string[],
  availableSimIds: string[],
): StartOffer | null {
  const { stages } = lessonFlow(lesson, availableGameIds, availableSimIds);
  const first = stages[0];
  if (!first || first.step === 'watch') return null;
  return { activity: first.activities[0], canWatch: stages.some((s) => s.step === 'watch') };
}

/** The stage order for a module after the learner's choice: "watch" moves the video to the front. */
export function flowFor(lesson: Pick<LessonRecord, 'flow'>, choice: StartChoice | undefined): LessonStep[] {
  const order = flowOrder(lesson);
  return choice === 'watch' ? ['watch', ...order.filter((s) => s !== 'watch')] : order;
}

/** True once there is any sign the learner has begun the module: a remembered choice or any progress on it. */
export function hasStarted(choice: StartChoice | undefined, progress: { status: string; played: boolean; explored: boolean }): boolean {
  return choice !== undefined || progress.status !== 'new' || progress.played || progress.explored;
}

export const START_KEY = 'qisket_lesson_start_v1';

interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const CHOICES: StartChoice[] = ['play', 'watch', 'all'];

export function readStartChoices(store: KeyValueStore | null): Record<string, StartChoice> {
  try {
    const raw = store?.getItem(START_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
    const out: Record<string, StartChoice> = {};
    for (const [id, value] of Object.entries(data)) {
      if (CHOICES.includes(value as StartChoice)) out[id] = value as StartChoice;
    }
    return out;
  } catch {
    return {};
  }
}

/** Returns the updated map; storage that is blocked or full just means the choice is not remembered. */
export function writeStartChoice(
  store: KeyValueStore | null,
  current: Record<string, StartChoice>,
  lessonId: string,
  choice: StartChoice,
): Record<string, StartChoice> {
  const next = { ...current, [lessonId]: choice };
  try {
    store?.setItem(START_KEY, JSON.stringify(next));
  } catch {
    // not remembered, still applied for this visit
  }
  return next;
}
