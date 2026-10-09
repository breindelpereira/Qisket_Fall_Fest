import type { ActivityRef, TutorIndex } from './types.ts';

const MAX_STARTERS = 3;
const FALLBACK = ['What is a qubit?', 'What does measurement do?', 'Why is quantum computing useful?'];
const STUCK = `I'm stuck. Can you give me a hint?`;

/**
 * Questions to offer as buttons. They are the FAQ headings from the notes: first the open lesson's, then the most recent
 * lessons the learner has reached, so a suggestion never points past their position.
 *
 * While a game is open (or was just left) the suggestions are about that game instead: a request for a hint when it is
 * still being played, or what it showed when it is over, then the game's own common doubts.
 */
export function starterQuestions(index: TutorIndex, lessonId: string | undefined, order: number, activity?: Pick<ActivityRef, 'id' | 'status'>): string[] {
  const picked: string[] = [];
  const add = (heading: string) => {
    if (picked.length < MAX_STARTERS && !picked.includes(heading)) picked.push(heading);
  };

  if (activity) {
    const game = index.chunks.filter((c) => c.activityId === activity.id);
    const closing = game.find((c) => /^what does finishing/i.test(c.heading));
    if (activity.status === 'playing') add(STUCK);
    else if (closing) add(closing.heading);
    for (const c of game.filter((x) => x.kind === 'faq' && !/stuck/i.test(x.heading))) add(c.heading);
  }

  // passages about a game are for that game only, never a suggestion for someone who is not playing it
  const faqs = index.chunks.filter((c) => c.kind === 'faq' && c.order <= order && !c.activityId);
  for (const c of faqs.filter((x) => x.lessonId === lessonId)) add(c.heading);
  for (const c of [...faqs].sort((a, b) => b.order - a.order)) add(c.heading);
  for (const q of FALLBACK) add(q);
  return picked;
}
