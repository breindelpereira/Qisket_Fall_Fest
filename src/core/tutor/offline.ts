import { asksForHint, isGameQuestion, withGameBasics } from './game.ts';
import { tokenize } from './search.ts';
import type { Searcher, SearchHit } from './search.ts';
import { starterQuestions } from './starters.ts';
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

export type OfflineInput = Pick<TutorRequest, 'question' | 'order' | 'lessonId' | 'level'> & Partial<Pick<TutorRequest, 'activity'>>;

/** A later passage must contain at least this share of the question's words before we say the question is about it. */
const LATER_MIN_COVERAGE = 0.6;
/** If a passage the learner can already see contains this many of the question's words, it can answer, even if a later one matches too. */
const EARLY_GOOD_ENOUGH = 2;

/**
 * Is this question really about something taught later in the course? One stray word is not enough ("win" in "world cup" appears
 * in a later lesson): the later passage has to contain most of the question, and the best passage the learner can already see
 * must contain clearly less of it (a single shared word like "algorithm" does not count). `best` is the best early match, if any.
 */
export function laterTopic(searcher: Searcher, input: OfflineInput, best?: SearchHit): SearchHit | undefined {
  const [later] = searcher.search(input.question, { maxOrder: Number.MAX_SAFE_INTEGER, minOrder: input.order + 1, allowPart3: true, limit: 1 });
  if (!later || later.coverage < LATER_MIN_COVERAGE) return undefined;
  if (!best) return later;
  // pointing a beginner at the Math Companion is only worth it when nothing in the course so far matches
  return later.chunk.part !== 3 && best.matched < EARLY_GOOD_ENOUGH && later.matched > best.matched ? later : undefined;
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

/** "Hi", "thanks", "ok": nothing to look up. */
export const isSmallTalk = (question: string): boolean => tokenize(question).length === 0;

/** A friendly reply to small talk that points at something to ask. Needs no model and no network. */
export function smallTalkAnswer(input: Pick<OfflineInput, 'order' | 'lessonId'>, index: TutorIndex): TutorResponse {
  const [example] = starterQuestions(index, input.lessonId, input.order);
  return {
    answer: `Hi! I'm Dr Quantum. Ask me anything about the lessons you have reached${example ? `, for example: "${example}"` : ''}.`,
    sources: [],
    provider: 'prepared',
  };
}

/**
 * An answer built straight from the notes, with no model. Used when the online tutor is off or cannot be reached, and by the
 * function itself when nothing in the learner's part of the course matches the question.
 */
export function offlineAnswer(searcher: Searcher, input: OfflineInput, index: TutorIndex): TutorResponse {
  if (isSmallTalk(input.question) && !isGameQuestion(input.activity, input.question)) return smallTalkAnswer(input, index);
  const allowPart3 = input.level === 'math';
  const { activity } = input;
  // while a game is open its own notes are searched too, and a plain "I'm stuck" still finds the game
  const [top] = withGameBasics(
    searcher.search(input.question, { maxOrder: input.order, focusLessonId: input.lessonId, allowPart3, activityId: activity?.id, limit: 1 }),
    index,
    activity,
    input.question,
  );
  const later = laterTopic(searcher, input, top);
  if (later) return laterAnswer(later, index);
  if (top) {
    const c = top.chunk;
    const source: TutorSource = { lessonId: c.lessonId, heading: c.heading, where: c.where };
    const tagNote = c.tag === 'Analogy' || c.tag === 'Simplified model' ? ` (This is ${c.tag === 'Analogy' ? 'an analogy' : 'a simplified model'}.)` : '';
    // the game's own hint is on the device, so a learner who is stuck can have it even when no tutor can be reached
    const hint = activity && activity.status === 'playing' && activity.hint && asksForHint(input.question) ? `\n\nThe game's hint for this step: ${activity.hint}` : '';
    return {
      answer: `From ${c.where}: ${c.heading}\n\n${trimWords(body(c.text), 80)}${tagNote}${hint}`,
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
