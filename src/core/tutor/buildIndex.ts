import type { ConceptRecord, HonestyTag, LessonBlock, LessonRecord } from '../../content/types.ts';
import { mathToText } from '../../content/lessonText.ts';
import { wordCount } from './search.ts';
import type { ParsedNotes } from './notes.ts';
import type { ChunkKind, CourseMapEntry, TutorChunk, TutorIndex } from './types.ts';

/**
 * Builds the tutor's knowledge (`tutor/index.json`) from two sources:
 *   - every lesson page, split into passages, so nothing in the course is missing; and
 *   - the richer hand-written notes in `tutor/notes/`, which add examples, FAQs and mix-ups.
 * Quizzes are never used, so the tutor cannot leak an answer.
 */

export const MAX_CHUNK_WORDS = 400;
const SPLIT_AT_WORDS = 250;
/** A labelled bullet gets its own passage only when it says enough to stand alone. */
const OWN_CHUNK_MIN_WORDS = 15;

export interface BuildInput {
  lessons: LessonRecord[];
  concepts: Record<string, ConceptRecord>;
  activities: Record<string, { title: string; kind: 'game' | 'sim' }>;
  notes: ParsedNotes[];
}

export interface BuildResult {
  index: TutorIndex;
  errors: string[];
}

/** "Module 3", "Hardware module 2", "Math lesson 4". */
export function whereOf(lesson: LessonRecord): string {
  if (lesson.part === 1) return `Module ${lesson.moduleLabel}`;
  if (lesson.part === 2) return `Hardware module ${lesson.moduleLabel}`;
  return `Math ${lesson.moduleLabel.toLowerCase()}`;
}

/** The first sentence, cut to at most `max` characters at a word. */
export function firstSentence(text: string, max: number): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  const m = /^(.+?[.!?])(\s|$)/.exec(flat);
  const sentence = m ? m[1] : flat;
  if (sentence.length <= max) return sentence;
  const cut = sentence.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:\s]+$/, '')}…`;
}

const bulletLine = (b: { label?: string; text: string; math?: Parameters<typeof mathToText>[0] }): string =>
  `${b.label ? `${b.label}: ` : ''}${b.text}${b.math ? ` ${mathToText(b.math)}` : ''}`;

interface Group {
  heading: string;
  lines: string[];
}

/** Turns the lesson's blocks into groups of text: one overview, plus a group for each substantial labelled point. */
function groupBlocks(blocks: LessonBlock[]): Group[] {
  const overview: Group = { heading: 'Overview', lines: [] };
  const own: Group[] = [];
  for (const block of blocks) {
    if (block.type !== 'bullets') {
      overview.lines.push(block.text);
      continue;
    }
    for (const item of block.items) {
      const line = bulletLine(item);
      if (item.label && wordCount(line) >= OWN_CHUNK_MIN_WORDS) own.push({ heading: item.label, lines: [line.slice(item.label.length + 2)] });
      else overview.lines.push(item.label ? `${item.label}: ${item.text}${item.math ? ` ${mathToText(item.math)}` : ''}` : line);
    }
  }
  return [...(overview.lines.length ? [overview] : []), ...own];
}

/** Splits text longer than `limit` words at sentence ends, so every passage stays a manageable size. */
export function splitLong(text: string, limit = SPLIT_AT_WORDS): string[] {
  if (wordCount(text) <= limit) return [text];
  const sentences = text.split(/(?<=[.!?])\s+/);
  const parts: string[] = [];
  let current: string[] = [];
  let words = 0;
  for (const s of sentences) {
    const n = wordCount(s);
    if (current.length > 0 && words + n > limit) {
      parts.push(current.join(' '));
      current = [];
      words = 0;
    }
    current.push(s);
    words += n;
  }
  if (current.length) parts.push(current.join(' '));
  return parts;
}

function courseMapEntry(lesson: LessonRecord, order: number, concepts: Record<string, ConceptRecord>): CourseMapEntry {
  const concept = concepts[lesson.linkedConceptId];
  // a concept with a single lesson describes that lesson well; a shared one (hardware, maths) would not
  const own = concept && concept.relatedLessons.length === 1 ? concept.summary : undefined;
  const firstText = lesson.blocks
    .map((b) => (b.type === 'bullets' ? b.items.map(bulletLine).join(' ') : b.text))
    .find((t) => t.trim() !== '');
  return {
    lessonId: lesson.id,
    order,
    part: lesson.part,
    where: whereOf(lesson),
    title: lesson.title,
    summary: firstSentence(own ?? firstText ?? lesson.title, 160),
  };
}

export function buildIndex(input: BuildInput): BuildResult {
  const { lessons, concepts, activities, notes } = input;
  const errors: string[] = [];
  const chunks: TutorChunk[] = [];
  const courseMap = lessons.map((l, order) => courseMapEntry(l, order, concepts));

  const notesById = new Map<string, ParsedNotes>();
  for (const n of notes) {
    if (!lessons.some((l) => l.id === n.id)) errors.push(`tutor/notes/${n.id}.md: no lesson has the id "${n.id}"`);
    else if (notesById.has(n.id)) errors.push(`tutor/notes/${n.id}.md: duplicate notes file`);
    else notesById.set(n.id, n);
  }

  lessons.forEach((lesson, order) => {
    const parsed = notesById.get(lesson.id);
    const tag: HonestyTag | undefined = parsed?.tag ?? lesson.honestyTag ?? concepts[lesson.linkedConceptId]?.honestyTag;
    const base = { lessonId: lesson.id, lessonTitle: lesson.title, where: whereOf(lesson), order, part: lesson.part, tag };
    let fromLesson = 0;
    const addLesson = (heading: string, kind: ChunkKind, text: string) => {
      const pieces = splitLong(text);
      pieces.forEach((piece, i) => {
        fromLesson += 1;
        chunks.push({
          ...base,
          id: `${lesson.id}#l${fromLesson}`,
          heading: pieces.length > 1 ? `${heading} (part ${i + 1})` : heading,
          kind,
          text: piece,
          from: 'lesson',
        });
      });
    };

    if (lesson.ahaMoment) addLesson('The key idea', 'explain', lesson.ahaMoment);
    for (const g of groupBlocks(lesson.blocks)) addLesson(g.heading, 'explain', g.lines.join('\n'));
    if (lesson.misconceptionToFix) addLesson('A common mix-up', 'misconception', lesson.misconceptionToFix);

    const doing = lesson.activities
      .map((a) => activities[a.id])
      .filter((a): a is NonNullable<typeof a> => a !== undefined)
      .map((a) => `${a.kind === 'game' ? 'Play' : 'Try the lab'}: ${a.title}`);
    const watching = lesson.references.filter((r) => r.kind === 'video').map((r) => `Watch: ${r.title} (${r.source})`);
    if (doing.length + watching.length > 0) addLesson('Games, labs and videos for this module', 'links', [...doing, ...watching].join('\n'));

    const seen = new Set<string>();
    parsed?.sections.forEach((s, i) => {
      const where = `tutor/notes/${lesson.id}.md, "${s.heading}"`;
      if (!s.text) errors.push(`${where}: the section is empty`);
      if (wordCount(s.text) > MAX_CHUNK_WORDS) errors.push(`${where}: ${wordCount(s.text)} words is over the ${MAX_CHUNK_WORDS} word limit; split it into two sections`);
      const key = `${s.kind}:${s.heading.toLowerCase()}`;
      if (seen.has(key)) errors.push(`${where}: this heading is used twice`);
      seen.add(key);
      chunks.push({ ...base, id: `${lesson.id}#n${i + 1}`, heading: s.heading, kind: s.kind, text: s.text, from: 'notes' });
    });
  });

  for (const c of chunks) if (!c.tag) errors.push(`${c.id}: no honesty tag (set "tag:" in the notes header or on the lesson)`);
  return { index: { version: 1, courseMap, chunks }, errors };
}
