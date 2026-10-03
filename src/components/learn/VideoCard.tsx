import React, { useEffect, useState } from 'react';
import { CirclePlay, ExternalLink, BookOpen, WifiOff } from 'lucide-react';
import type { ReferenceLink } from '../../content/types';

const clock = (seconds: number): string => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

const segmentLabel = (r: ReferenceLink): string | null =>
  r.startSeconds !== undefined && r.endSeconds !== undefined ? `${clock(r.startSeconds)}–${clock(r.endSeconds)}` : null;

const linkStyle: React.CSSProperties = { textDecoration: 'none', color: 'inherit' };

/**
 * A video that plays inside the app once tapped (so nothing is loaded from YouTube until then),
 * with a plain link underneath as the fallback when the player is blocked or the device is offline.
 */
export const VideoCard: React.FC<{ reference: ReferenceLink }> = ({ reference }) => {
  const [playing, setPlaying] = useState(false);
  const [online, setOnline] = useState(() => typeof navigator === 'undefined' || navigator.onLine !== false);

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
  const segment = segmentLabel(reference);

  const params = new URLSearchParams({ rel: '0', playsinline: '1', modestbranding: '1' });
  if (reference.startSeconds !== undefined) params.set('start', String(reference.startSeconds));
  if (reference.endSeconds !== undefined) params.set('end', String(reference.endSeconds));
  const embed = `https://www.youtube-nocookie.com/embed/${reference.youtubeId}?${params.toString()}`;

  return (
    <div className="card" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ position: 'relative', aspectRatio: '16 / 9', borderRadius: 14, overflow: 'hidden', background: '#1d0848' }}>
        {playing && online ? (
          <iframe
            src={embed}
            title={reference.title}
            allow="encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            aria-label={`Play video: ${reference.title}`}
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

      <div>
        <div style={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.35 }}>{reference.title}</div>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: 2 }}>
          {reference.source}{segment ? ` · watch ${segment}` : ''}
        </div>
      </div>

      <a className="chip" href={reference.url} target="_blank" rel="noopener noreferrer" style={{ ...linkStyle, alignSelf: 'flex-start' }}>
        <ExternalLink size={16} />
        <span>Open on YouTube</span>
      </a>
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
