import { describe, it, expect } from 'vitest';
import {
  END_MARGIN, EMBED_ORIGIN, LOAD_TIMEOUT_MS, PLAYER_HANDSHAKE, SLOW_START_MS,
  atClipEnd, clipOf, clipPosition, describePlayerError, embedUrl, formatClock, isPlayerOrigin, isPlayingState,
  nextStatus, parsePlayerMessage, playerCommand, watchUrl,
} from '../src/core/learn/video';
import type { PlayerEvent, PlayerStatus } from '../src/core/learn/video';
import { LESSON_BY_ID, LESSONS } from '../src/content/lessons';
import type { ReferenceLink } from '../src/content/types';

const wired = LESSON_BY_ID.module_1.references[0];
const noSegment = LESSON_BY_ID.module_4.references[0];

describe('Lesson video links', () => {
  it('the watch link opens the video at the start of the segment', () => {
    expect(watchUrl(wired)).toBe('https://www.youtube.com/watch?v=OWJCfOvochA&t=138s');
    expect(watchUrl(noSegment)).toBe('https://www.youtube.com/watch?v=GzbKb59my3U');
    // a start of 0 needs no time parameter
    expect(watchUrl(LESSON_BY_ID.module_2.references[0])).toBe('https://www.youtube.com/watch?v=RQWpF2Gb-gU');
  });

  it('falls back to the stored url when a reference has no video id', () => {
    const reading: ReferenceLink = { kind: 'reading', title: 'x', source: 'y', url: 'https://example.com/page' };
    expect(watchUrl(reading)).toBe('https://example.com/page');
  });

  it('the embed uses the privacy-friendly domain, the segment, and lets the page listen to the player', () => {
    const url = new URL(embedUrl(wired, 'http://localhost:5173'));
    expect(url.origin).toBe(EMBED_ORIGIN);
    expect(url.pathname).toBe('/embed/OWJCfOvochA');
    const p = url.searchParams;
    expect(p.get('start')).toBe('138');
    expect(p.get('end')).toBe('375');
    expect(p.get('enablejsapi')).toBe('1');
    expect(p.get('autoplay')).toBe('1');
    expect(p.get('rel')).toBe('0');
    expect(p.get('playsinline')).toBe('1');
    expect(p.get('origin')).toBe('http://localhost:5173');
  });

  it('only sends the page origin when it is http(s), because YouTube rejects custom app schemes', () => {
    expect(new URL(embedUrl(wired, 'https://localhost')).searchParams.get('origin')).toBe('https://localhost');
    expect(new URL(embedUrl(wired, 'capacitor://localhost')).searchParams.has('origin')).toBe(false);
    expect(new URL(embedUrl(wired, 'file://')).searchParams.has('origin')).toBe(false);
    expect(new URL(embedUrl(wired)).searchParams.has('origin')).toBe(false);
  });

  it('a video without a segment has no start or end', () => {
    const p = new URL(embedUrl(noSegment, 'http://localhost')).searchParams;
    expect(p.has('start')).toBe(false);
    expect(p.has('end')).toBe(false);
  });

  it('every video in the course gets a valid embed and watch link', () => {
    for (const ref of LESSONS.flatMap((l) => l.references).filter((r) => r.kind === 'video')) {
      expect(() => new URL(embedUrl(ref, 'https://localhost'))).not.toThrow();
      expect(watchUrl(ref)).toContain(`v=${ref.youtubeId}`);
    }
  });

  it('only trusts messages that come from YouTube', () => {
    expect(isPlayerOrigin('https://www.youtube-nocookie.com')).toBe(true);
    expect(isPlayerOrigin('https://www.youtube.com')).toBe(true);
    expect(isPlayerOrigin('https://evil.example.com')).toBe(false);
    expect(isPlayerOrigin('https://www.youtube.com.evil.example')).toBe(false);
  });
});

describe('Reading the player messages', () => {
  const msg = (o: object) => JSON.stringify(o);

  it('understands ready, state changes and errors', () => {
    expect(parsePlayerMessage(msg({ event: 'onReady' }))).toEqual({ type: 'ready' });
    expect(parsePlayerMessage(msg({ event: 'onStateChange', info: 1 }))).toEqual({ type: 'state', state: 1 });
    expect(parsePlayerMessage(msg({ event: 'onStateChange', info: -1 }))).toEqual({ type: 'state', state: -1 });
    expect(parsePlayerMessage(msg({ event: 'onError', info: 153 }))).toEqual({ type: 'error', code: 153 });
  });

  it('reads the playback position when the player reports one', () => {
    expect(parsePlayerMessage(msg({ event: 'infoDelivery', info: { currentTime: 140.25, playbackRate: 1 } }))).toEqual({ type: 'time', seconds: 140.25 });
    expect(parsePlayerMessage(msg({ event: 'infoDelivery', info: { currentTime: 0 } }))).toEqual({ type: 'time', seconds: 0 });
  });

  it('ignores everything else without throwing', () => {
    expect(parsePlayerMessage(msg({ event: 'infoDelivery', info: { muted: false, volume: 100 } }))).toBeNull();
    expect(parsePlayerMessage(msg({ event: 'infoDelivery', info: { currentTime: 'soon' } }))).toBeNull();
    expect(parsePlayerMessage(msg({ event: 'infoDelivery' }))).toBeNull();
    expect(parsePlayerMessage(msg({ event: 'onStateChange', info: 'playing' }))).toBeNull();
    expect(parsePlayerMessage(msg({ event: 'onError' }))).toBeNull();
    expect(parsePlayerMessage('not json')).toBeNull();
    expect(parsePlayerMessage({ event: 'onReady' })).toBeNull();
    expect(parsePlayerMessage(undefined)).toBeNull();
    expect(parsePlayerMessage(null)).toBeNull();
    expect(parsePlayerMessage(42)).toBeNull();
  });

  it('the handshake says the page is listening and subscribes to the three events it needs', () => {
    expect(PLAYER_HANDSHAKE[0]).toMatchObject({ event: 'listening', channel: 'widget' });
    const subscribed = PLAYER_HANDSHAKE.slice(1).map((m) => (m as { args: string[] }).args[0]);
    expect(subscribed).toEqual(['onReady', 'onStateChange', 'onError']);
    // all messages must survive JSON round trips because they are posted as strings
    for (const m of PLAYER_HANDSHAKE) expect(JSON.parse(JSON.stringify(m))).toEqual(m);
  });
});

describe('Player status', () => {
  const run = (start: PlayerStatus, events: PlayerEvent[]): PlayerStatus => events.reduce(nextStatus, start);
  const ready: PlayerEvent = { type: 'ready' };
  const state = (s: number): PlayerEvent => ({ type: 'state', state: s });

  it('goes loading -> ready -> playing for a normal start', () => {
    expect(run('loading', [])).toBe('loading');
    expect(run('loading', [ready])).toBe('ready');
    expect(run('loading', [ready, state(5)])).toBe('ready');
    expect(run('loading', [ready, state(3)])).toBe('playing'); // buffering means it is starting
    expect(run('loading', [ready, state(3), state(1)])).toBe('playing');
  });

  it('an error always wins, whatever came before', () => {
    expect(run('loading', [{ type: 'error', code: 153 }])).toBe('error');
    expect(run('playing', [{ type: 'error', code: 150 }])).toBe('error');
  });

  it('a learner who paused or finished is never treated as stuck', () => {
    expect(run('loading', [ready, state(1), state(2)])).toBe('playing');
    expect(run('loading', [ready, state(1), state(0)])).toBe('playing');
    expect(run('loading', [ready, state(1), state(-1)])).toBe('playing');
  });

  it('a late "ready" does not undo an error, but starting to play does', () => {
    expect(run('error', [ready])).toBe('error');
    expect(run('error', [state(1)])).toBe('playing');
    expect(run('error', [state(2)])).toBe('ready');
  });

  it('a position report never changes the status', () => {
    expect(run('loading', [{ type: 'time', seconds: 5 }])).toBe('loading');
    expect(run('ready', [{ type: 'time', seconds: 5 }])).toBe('ready');
    expect(run('error', [{ type: 'time', seconds: 5 }])).toBe('error');
  });

  it('timeouts are long enough for slow networks but short enough to help', () => {
    expect(LOAD_TIMEOUT_MS).toBeGreaterThanOrEqual(8000);
    expect(LOAD_TIMEOUT_MS).toBeLessThanOrEqual(20000);
    expect(SLOW_START_MS).toBeGreaterThanOrEqual(5000);
    expect(SLOW_START_MS).toBeLessThanOrEqual(15000);
  });
});

describe('Player error wording', () => {
  it('explains the common YouTube errors in plain language', () => {
    expect(describePlayerError(100)).toMatch(/removed|private/);
    expect(describePlayerError(101)).toMatch(/owner/);
    expect(describePlayerError(150)).toMatch(/owner/);
    expect(describePlayerError(153)).toMatch(/webview/);
    expect(describePlayerError(null)).toMatch(/offline|blocked/);
    expect(describePlayerError(5)).toMatch(/problem/);
  });
});

describe('Playing only the segment', () => {
  const grover = LESSON_BY_ID.module_6.references[0]; // 15:52 to 29:30

  it('finds the segment of a reference, and none for a whole video', () => {
    expect(clipOf(wired)).toEqual({ start: 138, end: 375 });
    expect(clipOf(grover)).toEqual({ start: 952, end: 1770 });
    expect(clipOf(noSegment)).toBeNull();
    expect(clipOf({ ...wired, startSeconds: 400, endSeconds: 100 })).toBeNull();
    expect(clipOf({ ...wired, endSeconds: undefined })).toBeNull();
    // a segment that starts at 0:00 is still a segment
    expect(clipOf(LESSON_BY_ID.module_2.references[0])).toEqual({ start: 0, end: 952 });
  });

  it('a segment gets a player without the YouTube controls, so it cannot be scrubbed or seeked from the keyboard', () => {
    const p = new URL(embedUrl(wired, 'http://localhost:5173')).searchParams;
    expect(p.get('controls')).toBe('0');
    expect(p.get('disablekb')).toBe('1');
    expect(p.get('fs')).toBe('0');
    expect(p.get('iv_load_policy')).toBe('3');
    // YouTube is also told the segment, as a second line of defence
    expect(p.get('start')).toBe('138');
    expect(p.get('end')).toBe('375');
  });

  it('a whole video keeps the normal YouTube controls', () => {
    const p = new URL(embedUrl(noSegment, 'http://localhost:5173')).searchParams;
    expect(p.has('controls')).toBe(false);
    expect(p.has('disablekb')).toBe(false);
    expect(p.has('fs')).toBe(false);
  });

  it('shows progress inside the segment only', () => {
    const clip = clipOf(wired)!; // 138 to 375, 237 seconds
    expect(clipPosition(clip, 138)).toEqual({ elapsed: 0, total: 237, fraction: 0 });
    expect(clipPosition(clip, 256.5).fraction).toBeCloseTo(0.5, 9);
    expect(clipPosition(clip, 375).fraction).toBe(1);
    // before the start or after the end the bar stays within 0..100%
    expect(clipPosition(clip, 0).elapsed).toBe(0);
    expect(clipPosition(clip, 9999)).toMatchObject({ elapsed: 237, fraction: 1 });
  });

  it('stops a moment before the end so YouTube never shows its suggestions', () => {
    const clip = clipOf(wired)!;
    expect(atClipEnd(clip, 374)).toBe(false);
    expect(atClipEnd(clip, clip.end - END_MARGIN)).toBe(true);
    expect(atClipEnd(clip, 374.8)).toBe(true);
    expect(atClipEnd(clip, 400)).toBe(true);
    expect(atClipEnd(clip, 138)).toBe(false);
    expect(END_MARGIN).toBeGreaterThan(0);
    expect(END_MARGIN).toBeLessThan(1);
  });

  it('formats times as m:ss and h:mm:ss', () => {
    expect(formatClock(0)).toBe('0:00');
    expect(formatClock(138)).toBe('2:18');
    expect(formatClock(237)).toBe('3:57');
    expect(formatClock(375)).toBe('6:15');
    expect(formatClock(952)).toBe('15:52');
    expect(formatClock(1770)).toBe('29:30');
    expect(formatClock(3725)).toBe('1:02:05');
    expect(formatClock(59.9)).toBe('0:59');
    expect(formatClock(-4)).toBe('0:00');
  });

  it('knows which player states count as playing', () => {
    expect([1, 3].every(isPlayingState)).toBe(true);
    expect([-1, 0, 2, 5].some(isPlayingState)).toBe(false);
  });

  it('builds commands the player understands, as plain JSON', () => {
    expect(playerCommand('playVideo')).toEqual({ event: 'command', func: 'playVideo', args: [], id: 1, channel: 'widget' });
    expect(playerCommand('seekTo', 138, true)).toMatchObject({ func: 'seekTo', args: [138, true] });
    expect(JSON.parse(JSON.stringify(playerCommand('pauseVideo')))).toEqual(playerCommand('pauseVideo'));
  });

  it('only videos with a segment are restricted; whole videos keep the normal controls', () => {
    const videos = LESSONS.flatMap((l) => l.references.filter((r) => r.kind === 'video'));
    for (const v of videos) {
      const hasSegment = v.startSeconds !== undefined || v.endSeconds !== undefined;
      expect(clipOf(v) !== null, `${v.title}`).toBe(hasSegment);
      expect(embedUrl(v).includes('controls=0'), `${v.title}`).toBe(hasSegment);
    }
    // the three original segments are still clipped
    const clipped = videos.filter((v) => clipOf(v));
    for (const id of ['OWJCfOvochA', 'RQWpF2Gb-gU']) expect(clipped.map((v) => v.youtubeId)).toContain(id);
  });
});
