import React from 'react';
import { Eyebrow } from '../shared/Arcade';
import { PIXEL, RETRO, panelStyle } from '../shared/arcadeTheme';
import type { Theme } from '../shared/arcadeTheme';
import { pct } from './labUtils';

/** Small components shared by the labs: slider, bar chart, collapsible maths box, info box (helpers are in labUtils.ts). */

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  /** Text shown for the current value. */
  display: string;
  accent: string;
}

export const LabSlider: React.FC<SliderProps> = ({ label, value, min, max, step, onChange, display, accent }) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
      <Eyebrow>{label}</Eyebrow>
      <span style={{ fontFamily: RETRO, fontSize: '1.35rem', color: accent }}>{display}</span>
    </span>
    <input type="range" min={min} max={max} step={step} value={value} aria-label={label}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ width: '100%', minHeight: 44, accentColor: accent }} />
  </label>
);

export interface Bar {
  label: string;
  /** What the maths predicts, 0..1. Drawn as a marker so it is visible without colour. */
  expected: number;
  /** What was measured, 0..1; omitted when nothing has been measured yet. */
  observed?: number;
  note?: string;
}

/** Horizontal bars: filled = measured, dashed marker = predicted. Values are also written out. */
export const BarChart: React.FC<{ bars: Bar[]; theme: Theme; showObserved?: boolean }> = ({ bars, theme, showObserved = true }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    {bars.map((b) => {
      const value = showObserved && b.observed !== undefined ? b.observed : b.expected;
      return (
        <div key={b.label} style={{ display: 'grid', gridTemplateColumns: '52px 1fr 92px', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: RETRO, fontSize: '1.3rem' }}>{b.label}</span>
          <div style={{ position: 'relative', height: 22, background: 'rgba(255,255,255,0.08)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, height: '100%', background: theme.accent, transition: 'width .25s' }} />
            {showObserved && b.observed !== undefined && (
              <div aria-hidden="true" style={{
                position: 'absolute', top: 0, bottom: 0, left: `${Math.min(1, b.expected) * 100}%`,
                borderLeft: '3px dashed #fff', opacity: 0.9,
              }} />
            )}
          </div>
          <span style={{ fontFamily: RETRO, fontSize: '1.15rem', textAlign: 'right', lineHeight: 1.1 }}>
            {showObserved && b.observed !== undefined ? pct(b.observed, 1) : pct(b.expected, 1)}
            {showObserved && b.observed !== undefined && (
              <span style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                {b.note ?? `exp ${pct(b.expected, 1)}`}
              </span>
            )}
          </span>
        </div>
      );
    })}
  </div>
);

/** "Show the math" toggle with a monospace panel. */
export const MathBox: React.FC<{ open: boolean; onToggle: () => void; children: React.ReactNode }> = ({ open, onToggle, children }) => (
  <>
    <button className="chip" style={{ alignSelf: 'flex-start' }} aria-expanded={open} onClick={onToggle}>
      {open ? 'Hide the math' : 'Show the math'}
    </button>
    {open && (
      <div style={{ ...panelStyle, background: 'rgba(0,0,0,0.3)', fontFamily: RETRO, fontSize: '1.15rem', lineHeight: 1.4 }}>
        {children}
      </div>
    )}
  </>
);

/** Plain explanatory box that sits under a lab's controls. */
export const InfoBox: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 6 }}>
    <span style={{ fontFamily: PIXEL, fontSize: '0.55rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{title}</span>
    <div style={{ fontSize: '0.88rem', lineHeight: 1.5, color: '#f1eaff' }}>{children}</div>
  </div>
);
