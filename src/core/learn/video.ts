import type { ReferenceLink } from '../../content/types';

/**
 * Helpers for the lesson videos. Playing inside the app is best effort: YouTube sometimes refuses embedded players
 * (it asks for a sign-in, or reports error 153 when a webview sends no referrer), so the app listens to the player
 * and always keeps a plain "Watch on YouTube" link as the fallback.
 */

/** Origin the privacy-friendly embed is served from; messages to and from the player use it. */
export const EMBED_ORIGIN = 'https://www.youtube-nocookie.com';
const PLAYER_ORIGINS: string[] = [EMBED_ORIGIN, 'https://www.youtube.com'];

/** How long to wait for the player to answer at all before treating it as blocked or offline. */
export const LOAD_TIMEOUT_MS = 12000;
/** How long a ready player may sit without starting before we point to the YouTube link. */
export const SLOW_START_MS = 10000;

export const isPlayerOrigin = (origin: string): boolean => PLAYER_ORIGINS.includes(origin);

/** The normal YouTube page, opened in the YouTube app or the browser, at the start of the segment. */
export function watchUrl(reference: ReferenceLink): string {
  if (!reference.youtubeId) return reference.url;
  const start = reference.startSeconds ? `&t=${reference.startSeconds}s` : '';
  return `https://www.youtube.com/watch?v=${reference.youtubeId}${start}`;
}

/** A segment of a video: the part the lesson wants watched. */
export interface Clip {
  start: number;
  end: number;
}

/** The segment to show, or null when the reference is a whole video. */
export function clipOf(reference: ReferenceLink): Clip | null {
  const { startSeconds: start, endSeconds: end } = reference;
  return start !== undefined && end !== undefined && end > start ? { start, end } : null;
}

/** Playback is paused this many seconds before the end so YouTube never shows its end screen (other videos). */
export const END_MARGIN = 0.35;

export function clipPosition(clip: Clip, currentTime: number): { elapsed: number; total: number; fraction: number } {
  const total = clip.end - clip.start;
  const elapsed = Math.min(Math.max(currentTime - clip.start, 0), total);
  return { elapsed, total, fraction: total > 0 ? elapsed / total : 0 };
}

export const atClipEnd = (clip: Clip, currentTime: number): boolean => currentTime >= clip.end - END_MARGIN;

/** "3:57", or "1:02:05" for long videos. */
export function formatClock(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  const h = Math.floor(whole / 3600);
  const m = Math.floor((whole % 3600) / 60);
  const sec = String(whole % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}

/**
 * The in-app player. `pageOrigin` (window.location.origin) lets YouTube check where it is embedded; it is only sent
 * for http(s) pages, because custom schemes such as capacitor://localhost are rejected by YouTube.
 * A reference with a segment gets a player without YouTube's own controls (no scrubbing to other parts of the video,
 * no keyboard seeking); the app draws its own controls and stops at the end of the segment.
 */
export function embedUrl(reference: ReferenceLink, pageOrigin?: string): string {
  const params = new URLSearchParams({ rel: '0', playsinline: '1', modestbranding: '1', autoplay: '1', enablejsapi: '1' });
  if (pageOrigin && /^https?:\/\//.test(pageOrigin)) params.set('origin', pageOrigin);
  if (reference.startSeconds !== undefined) params.set('start', String(reference.startSeconds));
  if (reference.endSeconds !== undefined) params.set('end', String(reference.endSeconds));
  if (clipOf(reference)) {
    params.set('controls', '0');
    params.set('disablekb', '1');
    params.set('fs', '0');
    params.set('iv_load_policy', '3');
  }
  return `${EMBED_ORIGIN}/embed/${reference.youtubeId}?${params.toString()}`;
}

/** Messages that make the embedded player report its events back to the page. */
export const PLAYER_HANDSHAKE: object[] = [
  { event: 'listening', id: 1, channel: 'widget' },
  ...['onReady', 'onStateChange', 'onError'].map((name) => ({
    event: 'command', func: 'addEventListener', args: [name], id: 1, channel: 'widget',
  })),
];

export type PlayerFunc =
  | 'playVideo' | 'pauseVideo' | 'seekTo' | 'setPlaybackRate' | 'loadModule' | 'unloadModule' | 'setOption';

/** A command for the embedded player (posted as a string, like the handshake). */
export function playerCommand(func: PlayerFunc, ...args: unknown[]): object {
  return { event: 'command', func, args, id: 1, channel: 'widget' };
}

/** Playback speeds offered under the video. */
export const SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const;
export type Speed = (typeof SPEEDS)[number];
export const formatSpeed = (speed: number): string => `${speed}×`;

/**
 * Commands that switch English captions on or off. YouTube shows them only when the video has an English track
 * (manual or automatic), so turning them on for a video without one simply shows nothing.
 */
export function captionCommands(on: boolean): { func: PlayerFunc; args: unknown[] }[] {
  return on
    ? [
        { func: 'loadModule', args: ['captions'] },
        { func: 'setOption', args: ['captions', 'track', { languageCode: 'en' }] },
      ]
    : [{ func: 'unloadModule', args: ['captions'] }];
}

/** Where to seek to when the learner drags the bar or skips: always inside the clip, and short of the very end. */
export function clampSeek(clip: Clip, target: number): number {
  return Math.min(Math.max(target, clip.start), clip.end - END_MARGIN - 0.25);
}

/** Remembered choices for the video player (shared by every video). */
export interface PlayerPrefs {
  speed: Speed;
  captions: boolean;
}

export const DEFAULT_PREFS: PlayerPrefs = { speed: 1, captions: false };
export const PREFS_KEY = 'qisket_video_prefs_v1';

interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function readPrefs(store: KeyValueStore | null): PlayerPrefs {
  try {
    const raw = store?.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const data = JSON.parse(raw) as Partial<PlayerPrefs>;
    const speed = SPEEDS.find((v) => v === data.speed) ?? DEFAULT_PREFS.speed;
    return { speed, captions: data.captions === true };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function writePrefs(store: KeyValueStore | null, prefs: PlayerPrefs): void {
  try {
    store?.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // storage can be blocked or full; the player works without remembering
  }
}

export type PlayerEvent =
  | { type: 'ready' }
  | { type: 'state'; state: number }
  | { type: 'time'; seconds: number }
  | { type: 'error'; code: number };

/** Reads one message from the player. Anything that is not a recognised event gives null. */
export function parsePlayerMessage(data: unknown): PlayerEvent | null {
  if (typeof data !== 'string') return null;
  let message: { event?: unknown; info?: { currentTime?: unknown } | number | null };
  try {
    message = JSON.parse(data);
  } catch {
    return null;
  }
  if (message.event === 'onReady') return { type: 'ready' };
  if (message.event === 'onStateChange' && typeof message.info === 'number') return { type: 'state', state: message.info };
  if (message.event === 'onError' && typeof message.info === 'number') return { type: 'error', code: message.info };
  if (message.event === 'infoDelivery' && message.info && typeof message.info === 'object' && typeof message.info.currentTime === 'number') {
    return { type: 'time', seconds: message.info.currentTime };
  }
  return null;
}

export type PlayerStatus = 'loading' | 'ready' | 'playing' | 'error';

/** True while the video is playing or buffering towards playing. */
export const isPlayingState = (state: number): boolean => state === 1 || state === 3;

/** Player states from YouTube: -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued. */
export function nextStatus(status: PlayerStatus, event: PlayerEvent): PlayerStatus {
  if (event.type === 'error') return 'error';
  if (event.type === 'time') return status;
  if (event.type === 'ready') return status === 'loading' ? 'ready' : status;
  if (event.state === 1 || event.state === 3) return 'playing';
  // paused, ended or cued: once a video has played it stays "playing" so we never nag a learner who paused
  return status === 'loading' || status === 'error' ? 'ready' : status;
}

/** Plain-language reason for a YouTube player error code (null means the player never answered). */
export function describePlayerError(code: number | null): string {
  switch (code) {
    case 100:
      return 'This video was removed or made private.';
    case 101:
    case 150:
      return "The video's owner doesn't allow it to play inside other apps.";
    case 153:
      return "YouTube couldn't check which app is asking, which happens in some app webviews.";
    case null:
      return "The player didn't respond. You may be offline, or YouTube may be blocked on this network.";
    default:
      return 'The player ran into a problem.';
  }
}
