import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, Captions, CaptionsOff, CirclePlay, ExternalLink, Maximize, Minimize, Pause, Play, RotateCcw, RotateCw, WifiOff } from 'lucide-react';
import type { ReferenceLink } from '../../content/types';
import {
  SPEEDS, atClipEnd, captionCommands, clampSeek, clipOf, clipPosition, embedUrl, describePlayerError, formatClock, formatSpeed,
  readPrefs, watchUrl, writePrefs,
} from '../../core/learn/video';
import type { PlayerPrefs, Speed } from '../../core/learn/video';
import { Banner } from '../shared/Arcade';
import { useYouTubePlayer } from './useYouTubePlayer';

const linkStyle: React.CSSProperties = { textDecoration: 'none', color: 'inherit' };
/** localStorage can be missing or blocked (private windows, previews); the player then just does not remember. */
const storage = (): Storage | null => {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
};

const iconButton: React.CSSProperties = { width: 48, minHeight: 48, padding: 0, justifyContent: 'center', flexShrink: 0 };

/**
 * A lesson video. Tapping the poster plays it inside the app (nothing is loaded from YouTube until then).
 *
 * - A reference with a segment plays only that segment: YouTube's own controls are hidden (so nobody can scrub into the
 *   rest of the video), the app draws its own play / pause / back-10-seconds / replay controls and a progress bar for
 *   the segment, and playback stops at the end instead of showing YouTube's suggestions. The learner can drag the bar
 *   (inside the segment only), skip 10 seconds either way, change the speed and switch English captions on or off;
 *   the last two are remembered for every video.
 * - YouTube does not always allow in-app playback (it can ask for a sign-in inside an app webview), so the page listens
 *   to the player and "Watch on YouTube" is always available as the dependable fallback.
 */
export const VideoCard: React.FC<{ reference: ReferenceLink }> = ({ reference }) => {
  const [embedOn, setEmbedOn] = useState(false);
  const [online, setOnline] = useState(() => typeof navigator === 'undefined' || navigator.onLine !== false);
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenRefused, setFullscreenRefused] = useState(false);
  const [prefs, setPrefs] = useState<PlayerPrefs>(() => readPrefs(storage()));
  const frameRef = useRef<HTMLIFrameElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const clip = clipOf(reference);
  const showPlayer = embedOn && online;
  const player = useYouTubePlayer(frameRef, showPlayer);
  const { send } = player;

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === wrapperRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // Once the player is up, apply the remembered speed and captions (and again after a retry or a change)
  const live = showPlayer && (player.status === 'ready' || player.status === 'playing');
  useEffect(() => {
    if (!live) return;
    send('setPlaybackRate', prefs.speed);
    for (const c of captionCommands(prefs.captions)) send(c.func, ...c.args);
  }, [live, player.attempt, prefs, send]);

  const choose = (next: PlayerPrefs) => {
    setPrefs(next);
    writePrefs(storage(), next);
  };

  // Reached the end of the segment (or YouTube ended it): hold there rather than let YouTube show other videos
  const finished =
    clip !== null && player.status !== 'error' && (player.state === 0 || (player.time !== null && atClipEnd(clip, player.time)));
  useEffect(() => {
    if (finished) send('pauseVideo');
  }, [finished, send]);

  const replay = () => {
    if (!clip) return;
    player.setTime(clip.start);
    send('seekTo', clip.start, true);
    send('playVideo');
  };
  const toggle = () => {
    if (finished) replay();
    else send(player.playing ? 'pauseVideo' : 'playVideo');
  };
  const seekTo = (target: number) => {
    if (!clip) return;
    const safe = clampSeek(clip, target);
    player.setTime(safe);
    send('seekTo', safe, true);
  };
  const skip = (delta: number) => {
    if (!clip) return;
    // Skipping out of a finished clip would otherwise leave the finished screen on top
    seekTo((finished ? clip.end : player.time ?? clip.start) + delta);
    if (finished) send('playVideo');
  };
  const toggleFullscreen = () => {
    const el = wrapperRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.().catch(() => setFullscreenRefused(true));
  };

  // A finished clip reads as complete (the player is paused a moment before the very end)
  const position = clip ? clipPosition(clip, finished ? clip.end : player.time ?? clip.start) : null;
  const problem = showPlayer && player.status === 'error';
  const stuck = showPlayer && player.status === 'ready' && player.slow;
  const externalIsPrimary = !online || problem || stuck;
  const canFullscreen = typeof document !== 'undefined' && document.fullscreenEnabled && !fullscreenRefused;
  const segment = clip ? `${formatClock(clip.start)}–${formatClock(clip.end)}` : null;

  return (
    <div
      className="card"
      data-player-status={showPlayer ? player.status : 'idle'}
      data-clip={clip ? 'true' : 'false'}
      style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      <div
        ref={wrapperRef}
        style={fullscreen
          ? { height: '100%', display: 'flex', flexDirection: 'column', background: '#000', padding: 12, gap: 8 }
          : { display: 'flex', flexDirection: 'column', gap: 10 }}
      >
        <div
          style={{
            position: 'relative', borderRadius: 14, overflow: 'hidden', background: '#1d0848',
            ...(fullscreen ? { flex: 1, minHeight: 0 } : { aspectRatio: '16 / 9' }),
          }}
        >
          {showPlayer ? (
            <>
              <iframe
                key={player.attempt}
                ref={frameRef}
                src={embedUrl(reference, window.location.origin)}
                title={reference.title}
                tabIndex={clip ? -1 : undefined}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen={!clip}
                referrerPolicy="strict-origin-when-cross-origin"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
              />
              {clip && (
                // Sits over the video so taps pause and play it instead of reaching YouTube's own links and overlays
                <button
                  onClick={toggle}
                  tabIndex={-1}
                  aria-hidden="true"
                  style={{ position: 'absolute', inset: 0, width: '100%', background: 'transparent' }}
                />
              )}
              {clip && finished && (
                <div style={{
                  position: 'absolute', inset: 0, background: '#1d0848', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16, textAlign: 'center',
                }}>
                  <span className="pixel" style={{ fontSize: '0.7rem', color: '#2ee6a6' }}>CLIP FINISHED</span>
                  <span style={{ fontSize: '0.85rem', lineHeight: 1.4, color: 'var(--text-secondary)' }}>
                    That was the part of the video this lesson uses.
                  </span>
                  <button className="btn" onClick={replay} style={{ width: 'auto', minWidth: 160 }}>
                    <RotateCcw size={18} />
                    <span>Replay clip</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <button
              onClick={() => setEmbedOn(true)}
              aria-label={`Play video here: ${reference.title}`}
              style={{
                position: 'absolute', inset: 0, width: '100%', color: '#fff', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 8,
                background: 'radial-gradient(circle at 50% 30%, #6a4ec2 0%, #2a0f5c 85%)',
              }}
            >
              {online ? <CirclePlay size={54} color="#ffd23f" /> : <WifiOff size={44} color="#ddd0fa" />}
              <span className="pixel" style={{ fontSize: '0.6rem' }}>{online ? 'PLAY HERE' : 'OFFLINE'}</span>
            </button>
          )}
        </div>

        {clip && showPlayer && position && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              type="range"
              aria-label="Seek within the clip"
              min={0}
              max={Math.max(1, Math.round(position.total))}
              step={1}
              value={Math.round(position.elapsed)}
              aria-valuetext={`${formatClock(position.elapsed)} of ${formatClock(position.total)}`}
              onChange={(e) => clip && seekTo(clip.start + Number(e.target.value))}
              style={{ width: '100%', minHeight: 44, accentColor: '#ffd23f' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }} aria-hidden="true">
              <span className="retro-num" style={{ fontSize: '1.2rem' }}>{formatClock(position.elapsed)}</span>
              <span className="retro-num" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>{formatClock(position.total)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                className="btn"
                onClick={toggle}
                aria-label={finished ? 'Replay clip' : player.playing ? 'Pause' : 'Play'}
                style={{ ...iconButton, width: 64 }}
              >
                {finished ? <RotateCcw size={22} /> : player.playing ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
              </button>
              <button className="chip" onClick={() => skip(-10)} aria-label="Back 10 seconds" style={{ ...iconButton, width: 'auto', padding: '0 14px' }}>
                <RotateCcw size={16} />
                <span>10s</span>
              </button>
              <button className="chip" onClick={() => skip(10)} aria-label="Forward 10 seconds" style={{ ...iconButton, width: 'auto', padding: '0 14px' }}>
                <span>10s</span>
                <RotateCw size={16} />
              </button>
              {canFullscreen && (
                <button
                  className="chip"
                  onClick={toggleFullscreen}
                  aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}
                  style={{ ...iconButton, marginLeft: 'auto' }}
                >
                  {fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
              )}
            </div>
            <div role="group" aria-label="Speed and captions" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {SPEEDS.map((v: Speed) => (
                <button
                  key={v}
                  className="chip"
                  aria-pressed={prefs.speed === v}
                  aria-label={`Speed ${formatSpeed(v)}`}
                  onClick={() => choose({ ...prefs, speed: v })}
                  style={{ minWidth: 48, justifyContent: 'center', padding: '8px 6px', fontSize: '0.55rem' }}
                >
                  {formatSpeed(v)}
                </button>
              ))}
              <button
                className="chip"
                aria-pressed={prefs.captions}
                aria-label={prefs.captions ? 'Captions on. Tap to turn off' : 'Captions off. Tap to turn on'}
                onClick={() => choose({ ...prefs, captions: !prefs.captions })}
                style={{ marginLeft: 'auto', justifyContent: 'center', padding: '8px 12px' }}
              >
                {prefs.captions ? <Captions size={18} /> : <CaptionsOff size={18} />}
                <span>CC</span>
              </button>
            </div>
            {prefs.captions && (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                English captions show when the video has them. Not every video does.
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <div style={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.35 }}>{reference.title}</div>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: 2 }}>
          {reference.source}{segment ? ` · plays ${segment} of the full video` : ''}
        </div>
      </div>

      {problem && (
        <Banner tone="warn" title="COULDN'T PLAY HERE">
          <div style={{ marginBottom: 10 }}>{describePlayerError(player.errorCode)} You can watch it on YouTube instead.</div>
          <button className="chip" onClick={player.retry}>
            <RotateCcw size={16} />
            <span>Try again</span>
          </button>
        </Banner>
      )}

      {stuck && (
        <Banner tone="info">
          Not starting? {clip ? 'Tap the video or the play button.' : 'Tap the play button in the video.'} If it asks you to sign in, use Watch on YouTube below instead.
        </Banner>
      )}

      <a
        className={externalIsPrimary ? 'btn' : 'chip'}
        href={watchUrl(reference)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${externalIsPrimary ? 'Watch' : 'Open'} on YouTube${clip ? `: opens the full video at ${formatClock(clip.start)}` : ''}`}
        style={{ textDecoration: 'none', ...(externalIsPrimary ? {} : { alignSelf: 'flex-start' }) }}
      >
        <ExternalLink size={externalIsPrimary ? 18 : 16} />
        <span>{externalIsPrimary ? 'Watch on YouTube' : 'Open on YouTube'}</span>
      </a>
      {externalIsPrimary && clip && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: -4 }}>
          YouTube opens the full video at {formatClock(clip.start)}. This lesson uses {segment}.
        </div>
      )}
      {!online && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          You look offline. Videos need internet, so open the link when you are back online.
        </div>
      )}
    </div>
  );
};

/** A link to an article or course page. */
export const ReadingCard: React.FC<{ reference: ReferenceLink }> = ({ reference }) => (
  <a
    className="card"
    href={reference.url}
    target="_blank"
    rel="noopener noreferrer"
    style={{ ...linkStyle, padding: 14, display: 'flex', alignItems: 'center', gap: 12, minHeight: 64 }}
  >
    <span style={{
      width: 44, height: 44, borderRadius: 14, background: 'var(--sky)', boxShadow: '0 4px 0 var(--sky-edge)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <BookOpen size={22} color="var(--ink)" strokeWidth={2.6} />
    </span>
    <span style={{ flex: 1, minWidth: 0 }}>
      <span style={{ display: 'block', fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.3 }}>{reference.title}</span>
      <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{reference.source}</span>
    </span>
    <ExternalLink size={18} color="var(--text-secondary)" aria-hidden="true" />
  </a>
);
