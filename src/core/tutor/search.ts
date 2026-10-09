import type { TutorChunk } from './types.ts';

/**
 * Keyword search (BM25) over the tutor's passages. Pure TypeScript with no DOM, so the app, the
 * serverless function and the tests all share it.
 *
 * The one rule that matters: a search only returns passages up to the learner's position in the course,
 * so the tutor never teaches a later module early.
 */

const STOP_WORDS = new Set(
  (
    'a an the is are was were be been am do does did of to in on at for with and or but if then than so as by it its ' +
    'this that these those i you me my we our your what why how when where which who whom can could should would will ' +
    'just about into from there their they them he she his her also very really some any not no yes tell explain ' +
    'please mean means meant like get gets make makes thing things one ones dont doesnt isnt cant wont hi hello thanks thank ' +
    'much many more most than too whats thats theres hows whys lets im ive youre ' +
    // everyday verbs and nouns that would otherwise match a passage by accident ("write me a poem")
    'write writes written wrote look looks looked see seen say says said use used uses using work works working ' +
    'give gives show shows need needs want wants find finds help helps happen happens happened example examples ' +
    'know knows think thinks way ways kind sort try tries ' +
    // small English words that carry no topic
    'after before during between each other another again always never often still even only same such own both either ' +
    'whether because while since until over under down out off now new ever back'
  ).split(' '),
);

/** Words whose plain suffix-stripping would not line up with their other forms. */
const IRREGULAR: Record<string, string> = {
  bases: 'basis',
  matrices: 'matrix',
  indices: 'index',
  vertices: 'vertex',
  superpositions: 'superposition',
};

/** Extra words to look for when a learner uses another name for the same thing. Query side only, at half weight. */
const SYNONYMS: Record<string, string[]> = {
  qbit: ['qubit'],
  cubit: ['qubit'],
  kubit: ['qubit'],
  spooky: ['entanglement', 'bell'],
  collapse: ['measurement'],
  collapses: ['measurement'],
  cx: ['cnot'],
  cnot: ['cx'],
  hadamard: ['h'],
  h: ['hadamard'],
  bloch: ['sphere'],
  noise: ['error', 'decoherence'],
  noisy: ['error', 'decoherence'],
  faster: ['speedup'],
  speedup: ['faster'],
  encryption: ['cryptography'],
  secure: ['cryptography'],
  ket: ['dirac'],
  bra: ['dirac'],
  clone: ['cloning', 'copy'],
  copy: ['cloning'],
  random: ['probability'],
  chance: ['probability'],
  odds: ['probability'],
  wave: ['interference'],
  cancel: ['interference'],
  cancels: ['interference'],
  superconducting: ['transmon'],
  hype: ['why'],
  speed: ['faster'],
};

/** Applied to the raw text before splitting into words. */
function normalise(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/q[-\s]bit/g, 'qubit')
    .replace(/['’]s\b/g, '')
    .replace(/['’]/g, '');
}

/** A light stemmer: enough that "measuring", "measured" and "measurement" meet, and nothing more. */
export function stem(word: string): string {
  if (IRREGULAR[word]) return IRREGULAR[word];
  let w = word;
  if (w.length <= 3) return w;
  if (w.endsWith('ies') && w.length > 4) w = `${w.slice(0, -3)}y`;
  else if (w.endsWith('sses')) w = w.slice(0, -2);
  else if (w.endsWith('s') && !/(ss|us|is)$/.test(w)) w = w.slice(0, -1);
  const strip = (suffix: string, min = 4): boolean => {
    if (w.endsWith(suffix) && w.length - suffix.length >= min) {
      w = w.slice(0, -suffix.length);
      return true;
    }
    return false;
  };
  // one suffix per word, longest meaning first
  if (!(strip('ation') || strip('ement') || strip('ment') || strip('ence') || strip('ance') || strip('ing', 3) || strip('ed', 3))) {
    if (w.length >= 8) strip('er', 5);
  }
  if (w.endsWith('e') && w.length > 3) w = w.slice(0, -1);
  return w;
}

/** Single letters are kept only when they name a gate or a basis state. */
const KEEP_SINGLE = new Set(['h', 'x', 'y', 'z', 't', '0', '1', '2', '3']);

export function tokenize(text: string): string[] {
  const words = normalise(text).match(/[a-z0-9]+/g) ?? [];
  const out: string[] = [];
  for (const w of words) {
    if (STOP_WORDS.has(w)) continue;
    if (w.length === 1 && !KEEP_SINGLE.has(w)) continue;
    out.push(stem(w));
  }
  return out;
}

/** The query's words, each with a weight: what was typed counts fully, alternative names count half. */
export function queryTerms(query: string): Map<string, number> {
  const terms = new Map<string, number>();
  const words = (normalise(query).match(/[a-z0-9]+/g) ?? []).filter((w) => !STOP_WORDS.has(w) && (w.length > 1 || KEEP_SINGLE.has(w)));
  for (const w of words) terms.set(stem(w), 1);
  for (const w of words) {
    for (const alt of SYNONYMS[w] ?? []) {
      const s = stem(alt);
      if (!terms.has(s)) terms.set(s, 0.5);
    }
  }
  return terms;
}

export interface SearchOptions {
  /** Only passages from lessons up to this position in the course (inclusive). */
  maxOrder: number;
  /** Only passages from lessons at or after this position. Used to find what is coming later. */
  minOrder?: number;
  /** The lesson the learner has open: its passages count for more. */
  focusLessonId?: string;
  /** Math Companion passages are left out unless this is set (or the learner has that lesson open). */
  allowPart3?: boolean;
  limit?: number;
  /** Stop adding passages once this many words are collected. */
  maxWords?: number;
}

export interface SearchHit {
  chunk: TutorChunk;
  score: number;
  /** How many of the question's own words (not the alternative names) the passage contains. */
  matched: number;
  /** The same as a share of the question's words, 0 to 1. */
  coverage: number;
}

export interface Searcher {
  search(query: string, options: SearchOptions): SearchHit[];
}

const K1 = 1.2;
const B = 0.75;
const HEADING_WEIGHT = 3;
const FOCUS_BOOST = 1.3;
const BOOSTS = { misconception: 1.2, faq: 1.15 } as const;
const NOTES_BOOST = 1.1;
/** A passage must score at least this share of the best one, or it is only noise. */
const RELATIVE_FLOOR = 0.25;

export const wordCount = (text: string): number => (text.match(/\S+/g) ?? []).length;

export function createSearcher(chunks: TutorChunk[]): Searcher {
  const docs = chunks.map((chunk) => {
    const tf = new Map<string, number>();
    const add = (tokens: string[], weight: number) => {
      for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + weight);
    };
    const headingTokens = tokenize(chunk.heading);
    add(headingTokens, HEADING_WEIGHT);
    add(tokenize(chunk.lessonTitle), 1);
    const bodyTokens = tokenize(chunk.text);
    add(bodyTokens, 1);
    const length = headingTokens.length * HEADING_WEIGHT + bodyTokens.length;
    return { chunk, tf, length };
  });

  const docFreq = new Map<string, number>();
  for (const d of docs) for (const t of d.tf.keys()) docFreq.set(t, (docFreq.get(t) ?? 0) + 1);
  const avgLength = docs.reduce((n, d) => n + d.length, 0) / Math.max(1, docs.length);
  const idf = (term: string) => {
    const n = docFreq.get(term) ?? 0;
    return Math.log(1 + (docs.length - n + 0.5) / (n + 0.5));
  };

  return {
    search(query, options) {
      const terms = queryTerms(query);
      if (terms.size === 0) return [];
      const { maxOrder, minOrder = 0, focusLessonId, allowPart3 = false, limit = 5, maxWords = 1800 } = options;

      const asked = [...terms].filter(([, weight]) => weight === 1).map(([term]) => term);
      const hits: SearchHit[] = [];
      for (const d of docs) {
        const c = d.chunk;
        if (c.order > maxOrder || c.order < minOrder) continue;
        if (c.part === 3 && !allowPart3 && c.lessonId !== focusLessonId) continue;
        let score = 0;
        for (const [term, weight] of terms) {
          const f = d.tf.get(term);
          if (!f) continue;
          score += weight * idf(term) * ((f * (K1 + 1)) / (f + K1 * (1 - B + (B * d.length) / avgLength)));
        }
        if (score <= 0) continue;
        if (c.lessonId === focusLessonId) score *= FOCUS_BOOST;
        if (c.kind === 'misconception') score *= BOOSTS.misconception;
        if (c.kind === 'faq') score *= BOOSTS.faq;
        if (c.from === 'notes') score *= NOTES_BOOST;
        const covered = asked.filter((term) => d.tf.has(term)).length;
        hits.push({ chunk: c, score, matched: covered, coverage: asked.length ? covered / asked.length : 0 });
      }
      hits.sort((a, b) => b.score - a.score || a.chunk.order - b.chunk.order || a.chunk.id.localeCompare(b.chunk.id));

      const best = hits[0]?.score ?? 0;
      const picked: SearchHit[] = [];
      let words = 0;
      for (const h of hits) {
        if (picked.length >= limit || h.score < best * RELATIVE_FLOOR) break;
        const n = wordCount(h.chunk.text);
        if (picked.length > 0 && words + n > maxWords) continue;
        picked.push(h);
        words += n;
      }
      return picked;
    },
  };
}
