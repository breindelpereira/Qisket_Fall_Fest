import React, { useRef, useState } from 'react';
import { useActivityReport } from '../../hooks/useActivityReport';
import { ArcadeFrame, ArcadeHeader, Banner, Eyebrow, GameTitle } from '../shared/Arcade';
import { RETRO, THEMES, groupChip, panelStyle } from '../shared/arcadeTheme';
import { Complex } from '../../core/circuit';
import {
  GATE_TABLE, apply, blochOf, chances, determinant, identify, isUnitary, normalise, readMatrix, readState, show, showExact,
} from '../../core/math/workbench';
import type { Matrix, Pair } from '../../core/math/workbench';
import { InfoBox, MathBox } from './labKit';
import { pct, useExplored } from './labUtils';

const THEME = THEMES.violet;
const S = '1/√2';

/** Symbols a phone keyboard makes hard to reach, as in the practice screen. */
const SYMBOLS = ['√', 'π', 'i', '/', '-', '(', ')'];

const inputStyle: React.CSSProperties = {
  minHeight: 48, minWidth: 0, width: '100%', background: 'rgba(0,0,0,0.3)', border: '2px solid var(--border-subtle)', borderRadius: 12,
  padding: '8px 10px', color: '#fff', fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-family)',
};

const STATES: { label: string; a: string; b: string }[] = [
  { label: '|0⟩', a: '1', b: '0' },
  { label: '|1⟩', a: '0', b: '1' },
  { label: '|+⟩', a: S, b: S },
  { label: '|−⟩', a: S, b: `-${S}` },
  { label: '|+i⟩', a: S, b: `i/√2` },
];

const MATRICES: { label: string; cells: string[] }[] = [
  { label: 'X', cells: ['0', '1', '1', '0'] },
  { label: 'H', cells: [S, S, S, `-${S}`] },
  { label: 'S', cells: ['1', '0', '0', 'i'] },
  { label: 'Not a gate', cells: ['1', '1', '1', '1'] },
];

const ket = ([a, b]: Pair) => `(${show(a)})|0⟩ + (${show(b)})|1⟩`;

export const MathsWorkbench: React.FC = () => {
  const markExplored = useExplored('maths_workbench', 'concept_math');
  const [mode, setMode] = useState<'state' | 'gate'>('state');
  const [cells, setCells] = useState<[string, string]>(['1', '0']);
  const [grid, setGrid] = useState<string[]>(['0', '1', '1', '0']);
  const [lastGate, setLastGate] = useState<string | null>(null);
  const [showMath, setShowMath] = useState(false);
  const focused = useRef<{ kind: 'state' | 'grid'; index: number }>({ kind: 'state', index: 0 });
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  const state = readState(cells[0], cells[1]);
  const matrix = readMatrix(grid);

  const setCell = (i: number, v: string) => {
    markExplored();
    setLastGate(null);
    setCells((c) => (i === 0 ? [v, c[1]] : [c[0], v]));
  };
  const setGridCell = (i: number, v: string) => {
    markExplored();
    setGrid((g) => g.map((x, k) => (k === i ? v : x)));
  };

  const insert = (symbol: string) => {
    const { kind, index } = focused.current;
    const el = inputs.current[`${kind}${index}`];
    const current = kind === 'state' ? cells[index] : grid[index];
    const start = el?.selectionStart ?? current.length;
    const end = el?.selectionEnd ?? start;
    const value = current.slice(0, start) + symbol + current.slice(end);
    if (kind === 'state') setCell(index, value);
    else setGridCell(index, value);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + symbol.length, start + symbol.length);
    });
  };

  const setState = (a: string, b: string) => {
    markExplored();
    setLastGate(null);
    setCells([a, b]);
  };

  const applyGate = (name: string, m: Matrix) => {
    if (!state.ok) return;
    markExplored();
    const out = apply(m, normalise(state.amplitudes));
    setCells([showExact(out[0]), showExact(out[1])]);
    setLastGate(name);
  };

  const c = state.ok ? chances(state.amplitudes) : null;
  const bloch = state.ok ? blochOf(state.amplitudes) : null;
  const id = matrix.ok ? identify(matrix.matrix) : null;
  const unitary = matrix.ok ? isUnitary(matrix.matrix) : null;

  useActivityReport({
    id: 'maths_workbench',
    status: 'playing',
    step: mode === 'state' ? 'Looking at a state' : 'Checking a matrix',
    state:
      mode === 'state'
        ? state.ok
          ? `Typed state: ${cells[0]} and ${cells[1]}. Squared sizes add to ${state.normSquared.toFixed(3)} (${state.normalised ? 'a valid state' : 'not normalised yet'}). ` +
            `Chances: 0 is ${pct(c!.p0, 1)}, 1 is ${pct(c!.p1, 1)}.${lastGate ? ` The last gate applied was ${lastGate}.` : ''}`
          : `The entry ${state.cell === 0 ? 'for |0⟩' : 'for |1⟩'} cannot be read.`
        : matrix.ok
          ? `Typed matrix entries: ${grid.join(', ')}. It is ${unitary ? 'unitary, so a legal gate' : 'not unitary, so not a gate'}${id ? ` and it is the ${id.gate.name} gate${id.exact ? '' : ' up to a global phase'}` : ''}.`
          : `Entry number ${matrix.cell + 1} of the matrix cannot be read.`,
  });

  const field = (kind: 'state' | 'grid', i: number, value: string, label: string, bad: boolean, onChange: (v: string) => void) => (
    <input
      key={`${kind}${i}`}
      ref={(el) => { inputs.current[`${kind}${i}`] = el; }}
      value={value}
      aria-label={label}
      aria-invalid={bad}
      inputMode="text"
      autoCapitalize="off"
      autoCorrect="off"
      spellCheck={false}
      onFocus={() => { focused.current = { kind, index: i }; }}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...inputStyle, ...(bad ? { borderColor: '#ff5c8a' } : {}) }}
    />
  );

  return (
    <ArcadeFrame theme={THEME}>
      <ArcadeHeader theme={THEME} label="LAB · MATHS" tag="Accurate" />
      <GameTitle
        title="Maths Workbench"
        story="Type a qubit state or a matrix the way you would write it on paper, and see what it means: the chances, the point on the Bloch sphere, whether it is a legal gate, and what it does."
      />

      <div style={{ display: 'flex', gap: 6 }}>
        <button className="chip" aria-pressed={mode === 'state'} onClick={() => setMode('state')} style={groupChip}>A state</button>
        <button className="chip" aria-pressed={mode === 'gate'} onClick={() => setMode('gate')} style={groupChip}>A matrix</button>
      </div>

      <div aria-label="Symbols" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {SYMBOLS.map((s) => (
          <button key={s} className="chip" onMouseDown={(e) => e.preventDefault()} onClick={() => insert(s)}
            aria-label={`Insert ${s === 'i' ? 'i, the imaginary unit' : s === '-' ? 'minus' : s}`}
            style={{ minWidth: 44, minHeight: 44, justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800 }}>{s}</button>
        ))}
      </div>

      {mode === 'state' && (
        <>
          <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Eyebrow>A STATE: α|0⟩ + β|1⟩</Eyebrow>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.8rem', fontWeight: 700 }}>
                α, the amplitude of |0⟩
                {field('state', 0, cells[0], 'Amplitude of 0', !state.ok && state.cell === 0, (v) => setCell(0, v))}
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.8rem', fontWeight: 700 }}>
                β, the amplitude of |1⟩
                {field('state', 1, cells[1], 'Amplitude of 1', !state.ok && state.cell === 1, (v) => setCell(1, v))}
              </label>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {STATES.map((s) => (
                <button key={s.label} className="chip" onClick={() => setState(s.a, s.b)} style={{ minHeight: 44 }}>{s.label}</button>
              ))}
            </div>
          </div>

          {!state.ok && (
            <Banner tone="warn" title="I CANNOT READ THAT">
              The entry for {state.cell === 0 ? '|0⟩' : '|1⟩'} is not a number I understand. Try 1/√2, 0.7071, i/√2 or (1+i)/2.
            </Banner>
          )}

          {state.ok && (
            <>
              <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontFamily: RETRO, fontSize: '1.3rem', lineHeight: 1.3 }}>|ψ⟩ = {ket(state.amplitudes)}</div>
                <div style={{ fontSize: '0.88rem' }}>
                  |α|² + |β|² = <b>{state.normSquared.toFixed(3)}</b> {state.normalised ? '✓ a valid state' : '✗ the squared sizes must add up to 1'}
                </div>
                {!state.normalised && state.normSquared > 1e-9 && (
                  <button className="btn btn-mint" onClick={() => { const n = normalise(state.amplitudes); setState(showExact(n[0]), showExact(n[1])); }}>
                    <span>Normalise it</span>
                  </button>
                )}
              </div>

              {c && (
                <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Eyebrow>THE CHANCES (SQUARED SIZES)</Eyebrow>
                  {[{ l: '0', v: c.p0 }, { l: '1', v: c.p1 }].map((row) => (
                    <div key={row.l} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 56px', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: RETRO, fontSize: '1.3rem' }}>P({row.l})</span>
                      <div style={{ height: 18, background: 'rgba(255,255,255,0.08)', borderRadius: 8, overflow: 'hidden' }}>
                        <div style={{ width: `${row.v * 100}%`, height: '100%', background: THEME.accent }} />
                      </div>
                      <span style={{ fontFamily: RETRO, fontSize: '1.2rem', textAlign: 'right' }}>{pct(row.v, 1)}</span>
                    </div>
                  ))}
                </div>
              )}

              {bloch && (
                <div style={{ ...panelStyle, display: 'flex', gap: 12, alignItems: 'center' }}>
                  <svg viewBox="-60 -60 120 120" width="110" height="110" role="img"
                    aria-label={`Bloch sphere point: x ${bloch.x.toFixed(2)}, y ${bloch.y.toFixed(2)}, z ${bloch.z.toFixed(2)}`}>
                    <circle r="50" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                    <ellipse rx="50" ry="14" fill="none" stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
                    <line x1="0" y1="-50" x2="0" y2="50" stroke="rgba(255,255,255,0.2)" />
                    <text y="-52" fontSize="9" fill="#ddd0fa" textAnchor="middle">|0⟩</text>
                    <text y="60" fontSize="9" fill="#ddd0fa" textAnchor="middle">|1⟩</text>
                    <line x1="0" y1="0" x2={bloch.x * 50} y2={-bloch.z * 50} stroke={THEME.accent} strokeWidth="2.5" />
                    <circle cx={bloch.x * 50} cy={-bloch.z * 50} r="5" fill="#fff" stroke={THEME.accent} strokeWidth="2" />
                  </svg>
                  <div style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>
                    <b>Point on the Bloch sphere</b>
                    <div style={{ fontFamily: RETRO, fontSize: '1.15rem' }}>x = {bloch.x.toFixed(2)}</div>
                    <div style={{ fontFamily: RETRO, fontSize: '1.15rem' }}>y = {bloch.y.toFixed(2)}</div>
                    <div style={{ fontFamily: RETRO, fontSize: '1.15rem' }}>z = {bloch.z.toFixed(2)}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>seen side-on: z up, x right</div>
                  </div>
                </div>
              )}

              <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Eyebrow>APPLY A GATE (THE STATE IS NORMALISED FIRST)</Eyebrow>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {GATE_TABLE.filter((g) => g.name !== 'I').map((g) => (
                    <button key={g.name} className="btn btn-violet" onClick={() => applyGate(g.name, g.matrix)} style={{ minWidth: 56, minHeight: 48, flex: '1 1 56px' }}>
                      <span>{g.name}</span>
                    </button>
                  ))}
                </div>
                {lastGate && (
                  <div style={{ fontSize: '0.88rem', lineHeight: 1.45 }}>
                    <b>{lastGate}</b> {GATE_TABLE.find((g) => g.name === lastGate)?.does}. The boxes above now hold the new state.
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {mode === 'gate' && (
        <>
          <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Eyebrow>A 2 × 2 MATRIX, ROW BY ROW</Eyebrow>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {grid.map((v, i) => field('grid', i, v, `Row ${Math.floor(i / 2) + 1}, column ${(i % 2) + 1}`, !matrix.ok && matrix.cell === i, (nv) => setGridCell(i, nv)))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {MATRICES.map((m) => (
                <button key={m.label} className="chip" onClick={() => { markExplored(); setGrid(m.cells); }} style={{ minHeight: 44 }}>{m.label}</button>
              ))}
            </div>
          </div>

          {!matrix.ok && (
            <Banner tone="warn" title="I CANNOT READ THAT">
              Entry {matrix.cell + 1} (row {Math.floor(matrix.cell / 2) + 1}, column {(matrix.cell % 2) + 1}) is not a number I understand.
            </Banner>
          )}

          {matrix.ok && unitary !== null && (
            <>
              <Banner tone={unitary ? 'good' : 'bad'} title={unitary ? 'UNITARY: A LEGAL GATE' : 'NOT UNITARY'}>
                {unitary
                  ? 'U†U = I, so this matrix keeps the total chance at 1 for every state. It can be a quantum gate.'
                  : 'U†U is not the identity, so some states would come out with a total chance different from 1. A gate must be unitary.'}
              </Banner>

              <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.9rem', lineHeight: 1.5 }}>
                <div>
                  <b>Determinant:</b> {show(determinant(matrix.matrix))}
                  {unitary && ' (a unitary matrix always has one of size 1)'}
                </div>
                <div>
                  <b>Which gate?</b>{' '}
                  {id
                    ? id.exact
                      ? `This is the ${id.gate.name} gate: it ${id.gate.does}.`
                      : `This is the ${id.gate.name} gate times an overall phase, which no measurement can tell apart from ${id.gate.name}.`
                    : 'It is not one of the gates in this course.'}
                </div>
              </div>

              <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Eyebrow>WHAT IT DOES TO |0⟩, |1⟩ AND |+⟩</Eyebrow>
                {([['|0⟩', [Complex.one(), Complex.zero()]], ['|1⟩', [Complex.zero(), Complex.one()]], ['|+⟩', [Complex.create(Math.SQRT1_2), Complex.create(Math.SQRT1_2)]]] as [string, Pair][]).map(([name, v]) => {
                  const out = apply(matrix.matrix, v);
                  const ch = chances(out);
                  return (
                    <div key={name} style={{ fontSize: '0.9rem', lineHeight: 1.45 }}>
                      <span style={{ fontFamily: RETRO, fontSize: '1.15rem' }}>{name} → {ket(out)}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>  (P(0) {pct(ch.p0, 0)}, P(1) {pct(ch.p1, 0)})</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      <MathBox open={showMath} onToggle={() => setShowMath((v) => !v)}>
        <div>P(0) = |α|²,  P(1) = |β|²,  and |α|² + |β|² = 1</div>
        <div>Bloch: x = 2 Re(α*β),  y = 2 Im(α*β),  z = |α|² − |β|²</div>
        <div>unitary: U†U = I (U† is the transpose with every entry conjugated)</div>
        <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
          Matrix times column: the top entry is (row 1) · (α, β), the bottom entry is (row 2) · (α, β).
        </div>
      </MathBox>

      <InfoBox title="HONEST NOTE">
        This is exact arithmetic on a single qubit and on 2 × 2 matrices. It does not show more than one qubit, and it shows a state's overall phase only through the amplitudes you type: two states that differ by an overall factor are the same physical state.
      </InfoBox>
    </ArcadeFrame>
  );
};
