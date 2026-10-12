import React from 'react';
import { HonestyTagBadge } from './HonestyTag';
import type { HonestyTag } from '../../content/types';
import { PIXEL, TONES, frameStyle } from './arcadeTheme';
import type { Theme, Tone } from './arcadeTheme';

/** Shared game components: frame, header, title, banner, eyebrow, modal. Tokens are in arcadeTheme.ts. */

export const ArcadeFrame: React.FC<{ theme: Theme; children: React.ReactNode }> = ({ theme, children }) => (
  <div style={frameStyle(theme)}>{children}</div>
);

interface HeaderProps {
  theme: Theme;
  label: string;
  tag: HonestyTag;
  /** Optional short readout between the label and the tag, e.g. a score. */
  middle?: React.ReactNode;
}

export const ArcadeHeader: React.FC<HeaderProps> = ({ theme, label, tag, middle }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
    <span style={{ fontFamily: PIXEL, fontSize: '0.58rem', color: theme.accent }}>{label}</span>
    {middle}
    <HonestyTagBadge tag={tag} />
  </div>
);

export const GameTitle: React.FC<{ title: string; story?: React.ReactNode }> = ({ title, story }) => (
  <div>
    <h2 style={{ fontFamily: PIXEL, fontSize: '0.78rem', lineHeight: 1.6, marginBottom: story ? 6 : 0 }}>{title}</h2>
    {story && <p style={{ fontSize: '0.92rem', lineHeight: 1.45, color: 'var(--text-secondary)' }}>{story}</p>}
  </div>
);

interface BannerProps {
  tone: Tone;
  title?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  center?: boolean;
}

export const Banner: React.FC<BannerProps> = ({ tone, title, children, icon, center }) => (
  <div role="status" style={{
    background: TONES[tone].bg,
    border: `2px solid ${TONES[tone].color}`,
    borderRadius: 16,
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    alignItems: center ? 'center' : 'stretch',
    textAlign: center ? 'center' : 'left',
  }}>
    {title && (
      <div style={{ fontFamily: PIXEL, fontSize: '0.68rem', lineHeight: 1.6, color: TONES[tone].color, display: 'flex', gap: 8, alignItems: 'center', justifyContent: center ? 'center' : 'flex-start' }}>
        {icon}{title}
      </div>
    )}
    {children && <div style={{ fontSize: '0.88rem', lineHeight: 1.45, color: '#f1eaff' }}>{children}</div>}
  </div>
);

/** Small label above a group of controls. */
export const Eyebrow: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color }) => (
  <span style={{ fontFamily: PIXEL, fontSize: '0.55rem', lineHeight: 1.5, color: color ?? 'var(--text-secondary)' }}>{children}</span>
);

/** Full-screen dialog used for rules and briefings. */
export const ArcadeModal: React.FC<{ theme: Theme; title: string; onClose: () => void; children: React.ReactNode; closeLabel?: string }> = ({
  theme, title, onClose, children, closeLabel = 'Got it',
}) => {
  // Escape closes a dialog on a computer
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
  <div onClick={onClose} style={{
    position: 'fixed', inset: 0, background: 'rgba(23, 6, 54, 0.8)', backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 100,
  }}>
    <div role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()} style={{
      ...frameStyle(theme), maxWidth: 380, width: '100%', maxHeight: '85vh', overflowY: 'auto',
    }}>
      <h2 style={{ fontFamily: PIXEL, fontSize: '0.78rem', lineHeight: 1.6, color: theme.accent }}>{title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.88rem', color: '#f1eaff', lineHeight: 1.5 }}>{children}</div>
      <button className="btn" onClick={onClose}>{closeLabel}</button>
    </div>
  </div>
  );
};
