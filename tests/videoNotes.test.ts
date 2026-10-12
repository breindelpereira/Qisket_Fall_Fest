
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { LESSONS } from '../src/content/lessons';
import { buildIndex } from '../src/core/tutor/buildIndex';
import { parseNotes } from '../src/core/tutor/notes';
import { LIMITS } from '../src/core/tutor/types';
import type { TutorChunk, TutorIndex } from '../src/core/tutor/types';
import { noteAt, notesForVideo, videoMomentFocus } from '../src/core/tutor/videoMoment';
import { ROOT } from '../scripts/tutorFiles';
import { ACTIVITIES } from '../src/content/activities';
import { CONCEPTS } from '../src/content/concepts';

const INDEX = JSON.parse(readFileSync(path.join(ROOT, 'tutor', 'index.json'), 'utf8')) as TutorIndex;

/**
 * Notes about the lesson videos. Each section that begins with a `Video: <id> m:ss-m:ss` line is our own summary of that
 * stretch of one of the lesson's videos, so the tutor can answer "what does the video say about ..." and "ask about this
 * video" can hand it the notes for the moment the learner has reached.
 */

const file = (header: string, section: string) => `---\nid: ${header}\n---\n\n${section}\n`;

describe('Notes about a video: reading the Video line', () => {
  it('takes the id and the time range from the first line and keeps it out of the text', () => {
    const r = parseNotes(file('module_4', '## Explain: One stretch\nVideo: GzbKb59my3U 1:05-2:40\nWhat the video says here.'), 'module_4.md');
    expect(r.errors).toEqual([]);
    expect(r.notes?.sections[0]).toEqual({
      kind: 'explain', heading: 'One stretch', text: 'What the video says here.', video: { id: 'GzbKb59my3U', start: 65, end: 160 },
    });
  });

  it('accepts a leading underscore or dash in the id, as YouTube ids can have', () => {
    const r = parseNotes(file('hw_module_7', '## Explain: A\nVideo: _otDRv7IN28 0:09-2:29\nText.\n\n## Explain: B\nVideo: -UlxHPIEVqA 0:00-1:00\nText.'), 'hw_module_7.md');
    expect(r.errors).toEqual([]);
    expect(r.notes?.sections.map((s) => s.video?.id)).toEqual(['_otDRv7IN28', '-UlxHPIEVqA']);
  });

  it('refuses a Video line it cannot read, rather than putting it in the answer', () => {
    for (const bad of ['Video: abc 1:00-2:00', 'Video: GzbKb59my3U 1:00', 'Video: GzbKb59my3U 1-2']) {
      const r = parseNotes(file('module_4', `## Explain: One\n${bad}\nText.`), 'module_4.md');
      expect(r.errors.join(' '), bad).toMatch(/Video line must look like/);
    }
  });

  it('is optional: a section without it is an ordinary note', () => {
    const r = parseNotes(file('module_4', '## FAQ: A question?\nAn answer.'), 'module_4.md');
    expect(r.notes?.sections[0].video).toBeUndefined();
  });
});

describe('Notes about a video: building the index', () => {
  const lesson = LESSONS.find((l) => l.id === 'module_4')!;
  const ref = lesson.references.find((r) => r.kind === 'video' && r.youtubeId)!;
  const build = (video: { id: string; start: number; end: number }) =>
    buildIndex({
      lessons: [lesson], concepts: CONCEPTS, activities: ACTIVITIES,
      notes: [{ id: 'module_4', sections: [{ kind: 'explain', heading: 'About the video', text: 'It shows a pattern.', video }] }],
    });

  it('says which video and where in the passage, and keeps the span on the chunk', () => {
    const { index, errors } = build({ id: ref.youtubeId!, start: ref.startSeconds ?? 0, end: 100 });
    expect(errors).toEqual([]);
    const c = index.chunks.find((x) => x.from === 'notes')!;
    expect(c.video).toEqual({ id: ref.youtubeId, start: ref.startSeconds ?? 0, end: 100 });
    expect(c.text).toContain(`From the video "${ref.title}" (${ref.source})`);
    expect(c.text).toContain('It shows a pattern.');
  });

  it('refuses a video that is not one of the lesson\'s', () => {
    expect(build({ id: 'AAAAAAAAAAA', start: 0, end: 10 }).errors.join(' ')).toMatch(/not one of this lesson's videos/);
  });

  it('refuses a range that ends before it starts, or runs past the part the lesson plays', () => {
    expect(build({ id: ref.youtubeId!, start: 30, end: 30 }).errors.join(' ')).toMatch(/must end after it starts/);
    expect(build({ id: ref.youtubeId!, start: 0, end: (ref.endSeconds ?? 0) + 5 }).errors.join(' ')).toMatch(/ends after the part of the video/);
  });
});

describe('Notes about a video: the real notes', () => {
  const videoChunks = INDEX.chunks.filter((c): c is TutorChunk & { video: NonNullable<TutorChunk['video']> } => c.video !== undefined);

  it('exist, and every one belongs to a video its own lesson plays, inside the part it plays', () => {
    expect(videoChunks.length).toBeGreaterThan(100);
    for (const c of videoChunks) {
      const lesson = LESSONS.find((l) => l.id === c.lessonId)!;
      const ref = lesson.references.find((r) => r.kind === 'video' && r.youtubeId === c.video.id);
      expect(ref, `${c.id} "${c.heading}"`).toBeDefined();
      expect(c.video.end, c.id).toBeGreaterThan(c.video.start);
      if (ref?.startSeconds !== undefined) expect(c.video.start, c.id).toBeGreaterThanOrEqual(ref.startSeconds);
      if (ref?.endSeconds !== undefined) expect(c.video.end, c.id).toBeLessThanOrEqual(ref.endSeconds);
    }
  });

  /**
   * Videos with no notes yet. The captions of these could not be fetched when the notes were written (YouTube refused
   * the requests), and a note is never written for a video nobody has read. Take a video off this list when its notes
   * are added: the test fails in both directions so the list stays honest.
   */
  const PENDING = new Set<string>([
    'math_week_0:fNk_zzaMoSs',
    'math_lesson_1:lRR-qgjaKlg',
    'math_lesson_2:rD_fH7O-D5Y',
    'math_lesson_2:G9d0QWM82sU',
    'math_lesson_3:ETkBuBdl3wc',
    'math_lesson_4:kk4gd4TIokw',
    'math_lesson_4:VHlqY44fOg0',
    'math_lesson_5:c30KrWjHaw4',
  ]);

  it('cover every lesson video, except the ones listed as still to do', () => {
    const missing = new Set<string>();
    for (const lesson of LESSONS) {
      for (const r of lesson.references) {
        if (r.kind !== 'video' || !r.youtubeId) continue;
        const has = videoChunks.some((c) => c.lessonId === lesson.id && c.video.id === r.youtubeId);
        if (!has) missing.add(`${lesson.id}:${r.youtubeId}`);
      }
    }
    expect([...missing].sort()).toEqual([...PENDING].sort());
  });

  it('are our own words, short enough to be a summary and not a copy of a transcript', () => {
    for (const c of videoChunks) {
      const words = c.text.split(/\s+/).length;
      expect(words, `${c.id} "${c.heading}"`).toBeLessThanOrEqual(260);
    }
  });
});

describe('Ask about this video: choosing the notes for the moment', () => {
  const mk = (id: string, start: number, end: number, text: string, kind: TutorChunk['kind'] = 'explain'): TutorChunk => ({
    id, lessonId: 'module_x', lessonTitle: 'X', where: 'Module X', order: 0, part: 1, heading: id, kind, text, from: 'notes',
    video: { id: 'VIDEO123456', start, end },
  });
  const chunks = [mk('b', 60, 120, 'Second part.'), mk('a', 0, 60, 'First part.'), mk('c', 120, 200, 'Third part.'), mk('faq', 0, 200, 'A FAQ.', 'faq')];
  const notes = notesForVideo(chunks, 'VIDEO123456');

  it('lists the stretches earliest first and leaves out the general FAQ', () => {
    expect(notes.map((n) => n.id)).toEqual(['a', 'b', 'c']);
    expect(notesForVideo(chunks, 'OTHER000000')).toEqual([]);
    expect(notesForVideo(chunks, undefined)).toEqual([]);
  });

  it('picks the stretch that contains the moment, else the latest before it, else the first', () => {
    expect(noteAt(notes, 90)?.id).toBe('b');
    expect(noteAt(notes, 60)?.id).toBe('b'); // a boundary belongs to the stretch that starts there
    expect(noteAt(notes, 500)?.id).toBe('c');
    expect(noteAt(notes, null)?.id).toBe('a');
    expect(noteAt([], 10)).toBeUndefined();
  });

  const video = { youtubeId: 'VIDEO123456', title: 'A Video', source: 'A Channel' };

  it('hands the tutor those notes, labelled with the video and the time', () => {
    const f = videoMomentFocus(chunks, video, 95);
    expect(f.label).toBe('The video "A Video" (A Channel) at 1:35');
    expect(f.text).toBe('Second part.');
  });

  it('still says which video it is when there are no notes, and fits the limits the function checks', () => {
    const none = videoMomentFocus([], video, null);
    expect(none.label).toBe('The video "A Video" (A Channel)');
    expect(none.text).toContain('A Video');
    const long = videoMomentFocus([mk('l', 0, 10, `${'A sentence that goes on. '.repeat(100)}`)], video, 5);
    expect(long.text.length).toBeLessThanOrEqual(LIMITS.focusTextChars);
    expect(long.label.length).toBeLessThanOrEqual(LIMITS.focusLabelChars);
  });
});
