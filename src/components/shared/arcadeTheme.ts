import type { CSSProperties } from 'react';

/** Shared look for every game: tokens and style objects (components live in Arcade.tsx). */

export const PIXEL = "'Press Start 2P', monospace";
export const RETRO = "'VT323', monospace";

export interface Theme {
  accent: string;
  edge: string;
  glow: string;
}

export const THEMES = {
  yellow: { accent: '#ffd23f', edge: '#d99a00', glow: 'rgba(255, 210, 63, 0.25)' },
  violet: { accent: '#8b5cf6', edge: '#5b2fc4', glow: 'rgba(139, 92, 246, 0.3)' },
  mint: { accent: '#2ee6a6', edge: '#12a574', glow: 'rgba(46, 230, 166, 0.25)' },
  orange: { accent: '#ff9f1c', edge: '#c76d00', glow: 'rgba(255, 159, 28, 0.25)' },
  sky: { accent: '#38c8ff', edge: '#0d8fc4', glow: 'rgba(56, 200, 255, 0.25)' },
  pink: { accent: '#ff5c8a', edge: '#c42e5c', glow: 'rgba(255, 92, 138, 0.25)' },
} satisfies Record<string, Theme>;

export const TONES = {
  good: { color: '#2ee6a6', bg: 'rgba(46, 230, 166, 0.15)' },
  bad: { color: '#ff5c8a', bg: 'rgba(255, 92, 138, 0.15)' },
  warn: { color: '#ffd23f', bg: 'rgba(255, 210, 63, 0.12)' },
  info: { color: '#38c8ff', bg: 'rgba(56, 200, 255, 0.12)' },
};
export type Tone = keyof typeof TONES;

export const frameStyle = (t: Theme): CSSProperties => ({
  background: '#1d0848',
  border: `3px solid ${t.accent}`,
  borderRadius: 20,
  padding: 16,
  boxShadow: `0 6px 0 ${t.edge}, 0 0 30px ${t.glow}`,
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
  position: 'relative',
  overflow: 'hidden',
});

/** Dark rounded panel used for play areas, readouts and info boxes. */
export const panelStyle: CSSProperties = {
  background: 'rgba(0, 0, 0, 0.25)',
  border: '2px solid rgba(255, 255, 255, 0.14)',
  borderRadius: 18,
  padding: 12,
};

/** Playfield: the main interactive area of a game. */
export const stageStyle: CSSProperties = {
  background: 'radial-gradient(circle at 50% 20%, #4a26a0 0%, #1d0848 85%)',
  border: '2px solid rgba(255, 255, 255, 0.14)',
  borderRadius: 18,
};

/** For rows of small buttons; three of these fit a phone-width card. */
export const rowChip: CSSProperties = {
  flex: '1 1 0',
  minWidth: 0,
  justifyContent: 'center',
  padding: '8px 4px',
  gap: 4,
  fontSize: '0.5rem',
};

