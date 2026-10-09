import { CHUNK_KINDS } from './types.ts';
import type { ChunkKind } from './types.ts';
import type { HonestyTag } from '../../content/types.ts';

/**
 * The hand-written tutor notes live in `tutor/notes/<lessonId>.md`:
 *
 *   ---
 *   id: module_1
 *   tag: Simplified model        (optional; otherwise the lesson's own honesty tag is used)
 *   ---
 *
 *   ## Explain: What a qubit is
 *   Plain text, one idea, roughly 100 to 300 words.
 *
 *   ## FAQ: Is a qubit really 0 and 1 at once?
 *   The answer.
 *
 * A section heading is `## Kind: Heading`, where Kind is Explain, Example, FAQ, Glossary or Misconception.
 */

export interface NoteSection {
  kind: ChunkKind;
  heading: string;
  text: string;
}

export interface ParsedNotes {
  id: string;
  tag?: HonestyTag;
  sections: NoteSection[];
}

export const HONESTY_TAGS: HonestyTag[] = ['Analogy', 'Simplified model', 'Accurate', 'Experimental/Contested'];

/** Kinds an author may write by hand (Links are made from the lesson's games, labs and videos). */
const WRITABLE_KINDS = CHUNK_KINDS.filter((k) => k !== 'links');
const KIND_NAMES: Record<string, ChunkKind> = {
  explain: 'explain',
  example: 'example',
  faq: 'faq',
  glossary: 'glossary',
  misconception: 'misconception',
};

export interface ParseResult {
  notes?: ParsedNotes;
  errors: string[];
}

/** Reads one notes file. `fileName` is the file's name without folders, e.g. "module_1.md". */
export function parseNotes(source: string, fileName: string): ParseResult {
  const errors: string[] = [];
  const fail = (msg: string) => errors.push(`${fileName}: ${msg}`);
  const lines = source.replace(/\r\n/g, '\n').split('\n');

  let i = 0;
  while (i < lines.length && lines[i].trim() === '') i += 1;
  if (lines[i]?.trim() !== '---') {
    fail('the file must start with a --- header containing "id: <lesson id>"');
    return { errors };
  }
  i += 1;
  const header: Record<string, string> = {};
  while (i < lines.length && lines[i].trim() !== '---') {
    const m = /^\s*([a-z]+)\s*:\s*(.*?)\s*$/.exec(lines[i]);
    if (m) header[m[1]] = m[2];
    else if (lines[i].trim() !== '') fail(`header line not understood: "${lines[i].trim()}"`);
    i += 1;
  }
  if (i >= lines.length) {
    fail('the --- header is never closed');
    return { errors };
  }
  i += 1;

  const expectedId = fileName.replace(/\.md$/, '');
  if (header.id !== expectedId) fail(`header id "${header.id ?? ''}" must match the file name (${expectedId})`);
  let tag: HonestyTag | undefined;
  if (header.tag !== undefined) {
    if (HONESTY_TAGS.includes(header.tag as HonestyTag)) tag = header.tag as HonestyTag;
    else fail(`tag "${header.tag}" must be one of: ${HONESTY_TAGS.join(', ')}`);
  }

  const sections: NoteSection[] = [];
  let current: { kind: ChunkKind; heading: string; lines: string[] } | null = null;
  const flush = () => {
    if (!current) return;
    const text = current.lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    sections.push({ kind: current.kind, heading: current.heading, text });
    current = null;
  };
  for (; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.startsWith('## ')) {
      flush();
      const m = /^##\s+([A-Za-z]+)\s*:\s*(.+?)\s*$/.exec(line);
      const kind = m ? KIND_NAMES[m[1].toLowerCase()] : undefined;
      if (!m || !kind) {
        fail(`section "${line.trim()}" must look like "## Kind: Heading" with Kind one of ${WRITABLE_KINDS.join(', ')}`);
        continue;
      }
      current = { kind, heading: m[2], lines: [] };
    } else if (current) {
      current.lines.push(line);
    } else if (line.trim() !== '') {
      fail(`text before the first "## Kind: Heading" section: "${line.trim().slice(0, 40)}"`);
    }
  }
  flush();
  if (sections.length === 0) fail('has no sections');

  return errors.length > 0 ? { errors } : { notes: { id: expectedId, tag, sections }, errors };
}
