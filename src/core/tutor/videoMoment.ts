import { formatClock } from '../learn/video.ts';
import type { TutorChunk, TutorFocus } from './types.ts';
import { LIMITS } from './types.ts';

/**
 * "Ask about this video": the learner tapped the button under a lesson video, so their question is about what the video is
 * saying right now. The tutor does not have the video itself; it has our own notes about each stretch of it (see
 * `tutor/notes`, sections that begin with a `Video:` line). This picks the notes for the moment the learner is at, and
 * turns them into the same "focus" that the other Ask buttons use.
 */

export interface VideoRef {
  youtubeId?: string;
  title: string;
  source: string;
}

type VideoChunk = TutorChunk & { video: NonNullable<TutorChunk['video']> };

const hasVideo = (c: TutorChunk): c is VideoChunk => c.video !== undefined;

/** The notes that are about this video, earliest first. */
export function notesForVideo(chunks: TutorChunk[], youtubeId: string | undefined): VideoChunk[] {
  if (!youtubeId) return [];
  return chunks
    .filter(hasVideo)
    .filter((c) => c.video.id === youtubeId && c.kind !== 'faq')
    .sort((a, b) => a.video.start - b.video.start);
}

/**
 * The notes for the moment `seconds` into the video: the stretch that contains it, otherwise the latest one that started
 * before it, otherwise the first one (the learner has not started yet, or the player gave no time).
 */
export function noteAt(notes: VideoChunk[], seconds: number | null): VideoChunk | undefined {
  if (notes.length === 0) return undefined;
  if (seconds === null || !Number.isFinite(seconds)) return notes[0];
  const inside = notes.filter((n) => seconds >= n.video.start && seconds < n.video.end);
  if (inside.length > 0) return inside[inside.length - 1];
  const before = notes.filter((n) => n.video.start <= seconds);
  return before.length > 0 ? before[before.length - 1] : notes[0];
}

/** Cuts text to at most `max` characters at the end of a sentence (or a word). */
function fit(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '), cut.lastIndexOf('! '));
  if (stop > max * 0.5) return cut.slice(0, stop + 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:\s]+$/, '')}…`;
}

/** What to hand to the tutor for "Ask about this video" at `seconds` (null when the video has not started). */
export function videoMomentFocus(chunks: TutorChunk[], video: VideoRef, seconds: number | null): TutorFocus {
  const note = noteAt(notesForVideo(chunks, video.youtubeId), seconds);
  const at = seconds !== null && Number.isFinite(seconds) && seconds > 0 ? ` at ${formatClock(seconds)}` : '';
  const label = fit(`The video "${video.title}" (${video.source})${at}`, LIMITS.focusLabelChars);
  if (!note) {
    return { label, text: fit(`The learner is watching the video "${video.title}" by ${video.source}${at}.`, LIMITS.focusTextChars) };
  }
  return { label, text: fit(note.text, LIMITS.focusTextChars) };
}
