import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { wordCount } from '../src/core/tutor/search.ts';
import { buildFromDisk, INDEX_PATH, serialise } from './tutorFiles';

/**
 * Builds tutor/index.json from the lessons and tutor/notes/*.md.
 *   npm run tutor:index            writes the file
 *   npm run tutor:index -- --check fails if the file is out of date (used by the tests)
 */
const { index, errors } = buildFromDisk();
if (errors.length > 0) {
  console.error(`The tutor notes have ${errors.length} problem${errors.length === 1 ? '' : 's'}:\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

const text = serialise(index);
if (process.argv.includes('--check')) {
  const current = existsSync(INDEX_PATH) ? readFileSync(INDEX_PATH, 'utf8').replace(/\r\n/g, '\n') : '';
  if (current !== text) {
    console.error('tutor/index.json is out of date. Run: npm run tutor:index');
    process.exit(1);
  }
  console.log('tutor/index.json is up to date.');
} else {
  writeFileSync(INDEX_PATH, text);
  const notes = index.chunks.filter((c) => c.from === 'notes');
  const words = index.chunks.reduce((n, c) => n + wordCount(c.text), 0);
  console.log(`Wrote tutor/index.json: ${index.chunks.length} passages (${notes.length} from the tutor notes, ${index.chunks.length - notes.length} from the lessons), ${words} words.`);
  const without = index.courseMap.filter((e) => !notes.some((c) => c.lessonId === e.lessonId));
  if (without.length > 0) console.log(`No tutor notes yet for: ${without.map((e) => e.lessonId).join(', ')} (the lesson text is still searchable).`);
}
