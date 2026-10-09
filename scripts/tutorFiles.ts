import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ACTIVITIES } from '../src/content/activities';
import { CONCEPTS } from '../src/content/concepts';
import { LESSONS } from '../src/content/lessons';
import { buildIndex } from '../src/core/tutor/buildIndex.ts';
import type { BuildResult } from '../src/core/tutor/buildIndex.ts';
import { parseNotes } from '../src/core/tutor/notes.ts';
import type { ParsedNotes } from '../src/core/tutor/notes.ts';
import type { TutorIndex } from '../src/core/tutor/types.ts';

/** Reading the tutor's files from disk. Shared by the build script and the tests. */

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const NOTES_DIR = path.join(ROOT, 'tutor', 'notes');
export const INDEX_PATH = path.join(ROOT, 'tutor', 'index.json');

export function loadNotes(dir = NOTES_DIR): { notes: ParsedNotes[]; errors: string[] } {
  const notes: ParsedNotes[] = [];
  const errors: string[] = [];
  if (!existsSync(dir)) return { notes, errors };
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.md')).sort()) {
    const parsed = parseNotes(readFileSync(path.join(dir, file), 'utf8'), file);
    errors.push(...parsed.errors);
    if (parsed.notes) notes.push(parsed.notes);
  }
  return { notes, errors };
}

/** The index as it should be right now, built from the lessons and the notes folder. */
export function buildFromDisk(): BuildResult {
  const { notes, errors } = loadNotes();
  const built = buildIndex({ lessons: LESSONS, concepts: CONCEPTS, activities: ACTIVITIES, notes });
  return { index: built.index, errors: [...errors, ...built.errors] };
}

/** The file format: readable, one value per line, so changes show up clearly in a code review. */
export const serialise = (index: TutorIndex): string => `${JSON.stringify(index, null, 1)}\n`;
