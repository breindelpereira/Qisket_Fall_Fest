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

export interface Series {
  label: string;
  points: { x: number; y: number }[];
  color: string;
  /** Dashed lines tell a second series apart without relying on colour. */
  dashed?: boolean;
}

export interface Marker {
  /** A vertical line at this x, or a horizontal line at this y. */
  x?: number;
  y?: number;
  label: string;
}

interface LineChartProps {
  series: Series[];
  xLabel: string;
  yLabel: string;
  /** Written under the chart for screen readers and as a caption. */
  summary: string;
  xMax?: number;
  yMax?: number;
  markers?: Marker[];
  formatX?: (x: number) => string;
  formatY?: (y: number) => string;
}

/** A small line chart in SVG: no library, text labels on the axes, dashed lines for the second series, labelled markers. */
export const LineChart: React.FC<LineChartProps> = ({
  series, xLabel, yLabel, summary, xMax, yMax, markers = [], formatX = (x) => String(+x.toFixed(2)), formatY = (y) => String(+y.toFixed(2)),
}) => {
  const W = 320;
  const H = 170;
  const L = 40;
  const R = 10;
  const T = 22;
  const B = 34;
  const allX = series.flatMap((s) => s.points.map((p) => p.x));
  const allY = series.flatMap((s) => s.points.map((p) => p.y));
  const x1 = xMax ?? Math.max(...allX, 1e-9);
  const y1 = yMax ?? Math.max(...allY, 1e-9);
  const sx = (x: number) => L + (Math.min(x, x1) / x1) * (W - L - R);
  const sy = (y: number) => T + (1 - Math.min(Math.max(y, 0), y1) / y1) * (H - T - B);
  const ticks = [0, 0.5, 1];
  return (
    <figure style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`${yLabel} against ${xLabel}. ${summary}`}>
        <rect x={L} y={T} width={W - L - R} height={H - T - B} fill="rgba(0,0,0,0.25)" rx="6" />
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={sy(t * y1)} y2={sy(t * y1)} stroke="rgba(255,255,255,0.12)" />
            <text x={L - 4} y={sy(t * y1) + 3} fontSize="9" fill="#ddd0fa" textAnchor="end">{formatY(t * y1)}</text>
            <text x={sx(t * x1)} y={H - B + 12} fontSize="9" fill="#ddd0fa" textAnchor={t === 0 ? 'start' : t === 1 ? 'end' : 'middle'}>{formatX(t * x1)}</text>
          </g>
        ))}
        {markers.map((m, i) =>
          m.x !== undefined ? (
            <g key={i}>
              <line x1={sx(m.x)} x2={sx(m.x)} y1={T} y2={H - B} stroke="#fff" strokeDasharray="2 3" opacity="0.8" />
              <text x={Math.min(sx(m.x) + 3, W - R - 2)} y={T + 10 + i * 10} fontSize="8.5" fill="#fff" textAnchor={sx(m.x) > W - 80 ? 'end' : 'start'}>{m.label}</text>
            </g>
          ) : (
            <g key={i}>
              <line x1={L} x2={W - R} y1={sy(m.y as number)} y2={sy(m.y as number)} stroke="#fff" strokeDasharray="2 3" opacity="0.8" />
              <text x={W - R - 2} y={sy(m.y as number) - 3} fontSize="8.5" fill="#fff" textAnchor="end">{m.label}</text>
            </g>
          ),
        )}
        {series.map((s) => (
          <polyline
            key={s.label}
            fill="none"
            stroke={s.color}
            strokeWidth="2.2"
            strokeDasharray={s.dashed ? '6 4' : undefined}
            points={s.points.map((p) => `${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ')}
          />
        ))}
        <text x={(L + W - R) / 2} y={H - 3} fontSize="9.5" fill="#f1eaff" textAnchor="middle">{xLabel}</text>
        <text x={8} y={12} fontSize="9.5" fill="#f1eaff">{yLabel}</text>
      </svg>
      <figcaption style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
        {series.map((s) => (
          <span key={s.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <svg width="22" height="8" aria-hidden="true">
              <line x1="0" x2="22" y1="4" y2="4" stroke={s.color} strokeWidth="2.5" strokeDasharray={s.dashed ? '5 3' : undefined} />
            </svg>
            {s.label}
          </span>
        ))}
      </figcaption>
    </figure>
  );
};

export interface ReadoutItem {
  label: string;
  value: string;
  note?: string;
}

/** A row of big numbers with small labels: the readouts of a lab. */
export const ReadoutGrid: React.FC<{ items: ReadoutItem[] }> = ({ items }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(items.length, 2)}, minmax(0, 1fr))`, gap: 8 }}>
    {items.map((it) => (
      <div key={it.label} style={{ ...panelStyle, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{it.label}</span>
        <span style={{ fontFamily: RETRO, fontSize: '1.6rem', lineHeight: 1.1 }}>{it.value}</span>
        {it.note && <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>{it.note}</span>}
      </div>
    ))}
  </div>
);

/** Plain explanatory box that sits under a lab's controls. */
export const InfoBox: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 6 }}>
    <span style={{ fontFamily: PIXEL, fontSize: '0.55rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{title}</span>
    <div style={{ fontSize: '0.88rem', lineHeight: 1.5, color: '#f1eaff' }}>{children}</div>
  </div>
);
