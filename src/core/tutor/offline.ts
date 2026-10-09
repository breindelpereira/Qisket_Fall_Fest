import { tokenize } from './search.ts';
import type { Searcher, SearchHit } from './search.ts';
import type { TutorIndex, TutorRequest, TutorResponse, TutorSource } from './types.ts';

/** Shortens text to about `max` words, ending at a sentence if one is close enough. */
export function trimWords(text: string, max: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= max) return words.join(' ');
  const cut = words.slice(0, max).join(' ');
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  if (end > cut.length * 0.4) return cut.slice(0, end + 1);
  return `${cut.replace(/[,;:\s]+$/, '')}…`;
}

/** Passage text on one line, so line breaks from the notes do not show up in a chat bubble. */
const body = (text: string): string => text.replace(/\s+/g, ' ').trim();

export type OfflineInput = Pick<TutorRequest, 'question' | 'order' | 'lessonId' | 'level'>;

/** A later passage has to score this many times higher than the best earlier one before the question counts as a later topic. */
const LATER_DOMINATES = 1.5;

/**
 * Is this question really about something taught later in the course? Words like "algorithm" can match early notes by chance,
 * so a later passage must clearly beat the best early one. `bestScore` is the best early match, if there was one.
 */
export function laterTopic(searcher: Searcher, input: OfflineInput, bestScore?: number): SearchHit | undefined {
  const [later] = searcher.search(input.question, { maxOrder: Number.MAX_SAFE_INTEGER, minOrder: input.order + 1, allowPart3: true, limit: 1 });
  if (!later) return undefined;
  if (bestScore === undefined) return later;
  // pointing a beginner at the Math Companion is only worth it when nothing in the course so far matches
  return later.chunk.part !== 3 && later.score > bestScore * LATER_DOMINATES ? later : undefined;
}

/** The "that comes later" reply. It names the module and teaches nothing. */
export function laterAnswer(later: SearchHit, index: Pick<TutorIndex, 'courseMap'>): TutorResponse {
  const entry = index.courseMap.find((e) => e.lessonId === later.chunk.lessonId);
  return {
    answer: `Good question! That one is covered later, in ${later.chunk.where}${entry ? ` (${entry.title})` : ''}. Keep going and you will get there. Until then, ask me about something you have already met.`,
    sources: [],
    provider: 'offline',
  };
}

/**
 * An answer built straight from the notes, with no model. Used when the online tutor is off or cannot be reached, and by the
 * function itself when nothing in the learner's part of the course matches the question.
 */
export function offlineAnswer(searcher: Searcher, input: OfflineInput, index: TutorIndex): TutorResponse {
  const allowPart3 = input.level === 'math';
  const [top] = searcher.search(input.question, { maxOrder: input.order, focusLessonId: input.lessonId, allowPart3, limit: 1 });
  const later = laterTopic(searcher, input, top?.score);
  if (later) return laterAnswer(later, index);
  if (top) {
    const c = top.chunk;
    const source: TutorSource = { lessonId: c.lessonId, heading: c.heading, where: c.where };
    const tagNote = c.tag === 'Analogy' || c.tag === 'Simplified model' ? ` (This is ${c.tag === 'Analogy' ? 'an analogy' : 'a simplified model'}.)` : '';
    return {
      answer: `From ${c.where}: ${c.heading}\n\n${trimWords(body(c.text), 80)}${tagNote}`,
      sources: [source],
      provider: 'offline',
    };
  }

  const here = index.courseMap.find((e) => e.lessonId === input.lessonId) ?? index.courseMap.find((e) => e.order === input.order);
  return {
    answer: `I could not find that in my notes. Try asking it another way${here ? `, or ask about ${here.title}` : ''}. I can only help with quantum computing and this course.`,
    sources: [],
    provider: 'offline',
  };
}

export interface PreparedAnswer {
  id: string;
  /** Ways a learner might ask it. */
  questions: string[];
  answer: string;
  sources: TutorSource[];
}

const SAME_QUESTION = 0.75;

const overlap = (a: string[], b: string[]): number => {
  const sa = new Set(a);
  const sb = new Set(b);
  if (sa.size === 0 || sb.size === 0) return 0;
  let shared = 0;
  for (const t of sa) if (sb.has(t)) shared += 1;
  return shared / (sa.size + sb.size - shared);
};

/**
 * Pre-written answers for the questions we expect in a demo. They need no network, and they only apply once the
 * learner has reached the lesson they come from.
 */
export function matchPrepared(list: PreparedAnswer[], question: string, order: number, index: Pick<TutorIndex, 'courseMap'>): TutorResponse | null {
  const asked = tokenize(question);
  if (asked.length === 0) return null;
  for (const p of list) {
    if (!p.questions.some((q) => overlap(asked, tokenize(q)) >= SAME_QUESTION)) continue;
    const reached = p.sources.every((s) => {
      const entry = index.courseMap.find((e) => e.lessonId === s.lessonId);
      return entry !== undefined && entry.order <= order;
    });
    if (!reached) continue;
    return { answer: p.answer, sources: p.sources, provider: 'prepared' };
  }
  return null;
}
