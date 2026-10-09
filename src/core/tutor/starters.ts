import type { TutorIndex } from './types.ts';

const MAX_STARTERS = 3;
const FALLBACK = ['What is a qubit?', 'What does measurement do?', 'Why is quantum computing useful?'];

/**
 * Questions to offer as buttons. They are the FAQ headings from the notes: first the open lesson's, then the most recent
 * lessons the learner has reached, so a suggestion never points past their position.
 */
export function starterQuestions(index: TutorIndex, lessonId: string | undefined, order: number): string[] {
  const faqs = index.chunks.filter((c) => c.kind === 'faq' && c.order <= order);
  const picked: string[] = [];
  const add = (heading: string) => {
    if (picked.length < MAX_STARTERS && !picked.includes(heading)) picked.push(heading);
  };
  for (const c of faqs.filter((x) => x.lessonId === lessonId)) add(c.heading);
  for (const c of [...faqs].sort((a, b) => b.order - a.order)) add(c.heading);
  for (const q of FALLBACK) add(q);
  return picked;
}
