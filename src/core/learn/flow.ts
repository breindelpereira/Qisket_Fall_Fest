import type { ActivityLink, ActivityRole, LessonRecord, LessonStep, ReferenceLink } from '../../content/types';

/**
 * The order a lesson page presents things in: play a game to meet the idea, watch a video to put words to it, then use a
 * lab to see how it really works, then practise. A lesson can override the order with `flow`, and steps with nothing
 * the learner can open today are skipped, so a lesson whose game is not built yet simply starts with its video.
 */
export const DEFAULT_FLOW: LessonStep[] = ['discover', 'watch', 'explore', 'apply'];

export const roleOf = (a: ActivityLink): ActivityRole => a.role ?? (a.kind === 'game' ? 'discover' : 'explore');

export interface Stage {
  step: LessonStep;
  activities: ActivityLink[];
  videos: ReferenceLink[];
  readings: ReferenceLink[];
}

export interface LessonFlow {
  stages: Stage[];
  /** Activities that are planned but cannot be opened yet. */
  soon: ActivityLink[];
}

/** The lesson's stage order, with any step it forgot to list added at the end so nothing is dropped. */
export function flowOrder(lesson: Pick<LessonRecord, 'flow'>): LessonStep[] {
  const order = [...(lesson.flow ?? DEFAULT_FLOW)];
  for (const step of DEFAULT_FLOW) if (!order.includes(step)) order.push(step);
  return order;
}

export function lessonFlow(
  lesson: Pick<LessonRecord, 'activities' | 'references' | 'flow'>,
  availableGameIds: string[],
  availableSimIds: string[],
): LessonFlow {
  const ready = (a: ActivityLink) => (a.kind === 'game' ? availableGameIds : availableSimIds).includes(a.id);
  const videos = lesson.references.filter((r) => r.kind === 'video');
  const readings = lesson.references.filter((r) => r.kind === 'reading');

  const stages: Stage[] = [];
  for (const step of flowOrder(lesson)) {
    if (step === 'watch') {
      if (videos.length + readings.length > 0) stages.push({ step, activities: [], videos, readings });
    } else {
      const activities = lesson.activities.filter((a) => roleOf(a) === step && ready(a));
      if (activities.length > 0) stages.push({ step, activities, videos: [], readings: [] });
    }
  }
  return { stages, soon: lesson.activities.filter((a) => !ready(a)) };
}

export const STEP_TITLES: Record<LessonStep, string> = {
  discover: 'Play',
  watch: 'Watch and read',
  explore: 'Try the lab',
  apply: 'Put it to work',
};

export const STEP_HINTS: Record<LessonStep, string> = {
  discover: 'Start by playing. You will meet the idea before you meet its name.',
  watch: 'Now put words to it.',
  explore: 'See how it really works, and change the numbers yourself.',
  apply: 'Use what you learned.',
};
