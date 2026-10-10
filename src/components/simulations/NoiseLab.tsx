import React, { useMemo, useState } from 'react';
import { useActivityReport } from '../../hooks/useActivityReport';
import { Eye, Play } from 'lucide-react';
import { ArcadeFrame, ArcadeHeader, Banner, Eyebrow, GameTitle } from '../shared/Arcade';
import { RETRO, THEMES, groupChip, panelStyle } from '../shared/arcadeTheme';
import {
  CODE_SIZES, applyFix, checkParity, encodeLogical, errorCurve, fixForSyndrome, injectFlips, logicalErrorRate, measureDataDirectly, overlap,
  simulateRepetition,
} from '../../core/labs/errorCorrection';
import type { Bit, Flips, TrialSummary } from '../../core/labs/errorCorrection';
import { BarChart, InfoBox, LabSlider, MathBox } from './labKit';
import { pct, useExplored } from './labUtils';

const THEME = THEMES.violet;
const TRIAL_COUNTS = [100, 1000, 10000] as const;
/** The message's phase. Chosen so that a logical flip always changes the state completely, whatever the angle. */
const PHI = Math.PI / 2;

const CASES: { id: string; label: string; flips: Flips }[] = [
  { id: 'none', label: 'No error', flips: [false, false, false] },
  { id: 'q1', label: 'Q1 flipped', flips: [true, false, false] },
  { id: 'q2', label: 'Q2 flipped', flips: [false, true, false] },
  { id: 'q3', label: 'Q3 flipped', flips: [false, false, true] },
  { id: 'q12', label: 'Q1 and Q2 flipped', flips: [true, true, false] },
];

const fmtRate = (x: number): string => (x === 0 ? '0%' : x < 0.001 ? pct(x, 3) : x < 0.1 ? pct(x, 2) : pct(x, 1));
const amp = (state: { amplitudes: { re: number; im: number }[] }, index: number): number => Math.hypot(state.amplitudes[index].re, state.amplitudes[index].im);

interface Run {
  p: number;
  n: number;
  bare: TrialSummary;
  code: TrialSummary;
}

export const NoiseLab: React.FC = () => {
  const markExplored = useExplored('noise_lab', 'concept_error_correction');
  const [n, setN] = useState<number>(3);
  const [pPct, setPPct] = useState(10);
  const [trials, setTrials] = useState<number>(1000);
  const [run, setRun] = useState<Run | null>(null);
  const [theta, setTheta] = useState(90);
  const [caseId, setCaseId] = useState('q2');
  const [direct, setDirect] = useState<{ theta: number; bit: Bit; zero: number; one: number; match: number } | null>(null);
  const [showMath, setShowMath] = useState(false);

  const p = pPct / 100;
  const logical = logicalErrorRate(p, n);
  const observed = run && run.p === p && run.n === n ? run : null;
  const curve = useMemo(() => errorCurve(n), [n]);

  const runTrials = () => {
    markExplored();
    setRun({ p, n, bare: simulateRepetition(p, 1, trials), code: simulateRepetition(p, n, trials) });
  };

  // The three-qubit demonstration, on real amplitudes. Checking parity is exact (the state is already in a parity eigenstate), so it needs no dice.
  const flips = CASES.find((c) => c.id === caseId)!.flips;
  const demo = useMemo(() => {
    const t = (theta * Math.PI) / 180;
    const ideal = encodeLogical(t, PHI);
    const state = injectFlips(encodeLogical(t, PHI), flips);
    const base = flips.reduce((m, f, q) => (f ? m | (1 << q) : m), 0);
    const pair = () => [amp(state, base), amp(state, base ^ 0b111)] as const;
    const before = pair();
    const a = checkParity(state, 'A', () => 0.5);
    const b = checkParity(state, 'B', () => 0.5);
    const after = pair();
    const fix = fixForSyndrome([a, b]);
    applyFix(state, fix);
    return { a, b, fix, before, after, match: overlap(ideal, state) };
  }, [theta, flips]);

  const lookDirectly = () => {
    markExplored();
    const t = (theta * Math.PI) / 180;
    const ideal = encodeLogical(t, PHI);
    const state = encodeLogical(t, PHI);
    const bit = measureDataDirectly(state);
    setDirect({ theta, bit, zero: amp(state, 0b000), one: amp(state, 0b111), match: overlap(ideal, state) });
  };
  const directShown = direct && direct.theta === theta ? direct : null;

  // ---- the curve ----
  const W = 320;
  const H = 210;
  const L = 34;
  const R = 10;
  const T = 12;
  const B = 28;
  const MAX = 0.6;
  const x = (v: number) => L + (v / MAX) * (W - L - R);
  const y = (v: number) => H - B - (v / MAX) * (H - T - B);
  const path = curve.map((pt, i) => `${i === 0 ? 'M' : 'L'}${x(pt.p).toFixed(1)} ${y(pt.logical).toFixed(1)}`).join(' ');

  const better = p > 0 && logical > 0 ? p / logical : null;


  // what the AI tutor is told if the learner asks about this lab: the settings and readouts, nothing hidden
  useActivityReport({
    id: 'noise_lab',
    status: 'playing',
    step: n === 1 ? 'No code, one bare qubit' : `${n} qubits hold one`,
    state:
      `Each qubit flips with a ${pPct}% chance. Predicted chance the information is lost: ${fmtRate(logical)} (a bare qubit: ${fmtRate(p)}). ` +
      `${observed ? `After ${observed.code.trials.toLocaleString()} trials the code failed ${observed.code.failures.toLocaleString()} times and a bare qubit ${observed.bare.failures.toLocaleString()} times. ` : ''}` +
      `Find-the-error demo: ${CASES.find((c) => c.id === caseId)!.label}; probe A says ${demo.a ? 'differ' : 'agree'} and probe B says ${demo.b ? 'differ' : 'agree'}; ` +
      `${flips.filter(Boolean).length <= 1 ? 'repaired' : 'fooled, because two qubits flipped'}.` +
      `${directShown ? ' The learner measured the data directly and destroyed the superposition.' : ''}`,
  });

  return (
    <ArcadeFrame theme={THEME}>
      <ArcadeHeader theme={THEME} label="LAB · NOISE" tag="Simplified model" />
      <GameTitle
        title="Noise Lab"
        story="Qubits get flipped by noise. Spread one qubit over several, find a flipped one by comparing them, and the whole group is more reliable than a single qubit, as long as noise is rare enough."
      />

      <div>
        <Eyebrow>HOW MANY QUBITS HOLD ONE</Eyebrow>
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }} role="group" aria-label="Number of qubits in the code">
          {CODE_SIZES.map((q) => (
            <button key={q} className="chip" aria-pressed={n === q} onClick={() => { markExplored(); setN(q); }} style={{
              ...groupChip, ...(n === q ? { background: THEME.accent, color: '#fff', borderColor: THEME.edge } : {}),
            }}>{n === q ? '✓ ' : ''}{q === 1 ? '1 (no code)' : `${q} qubits`}</button>
          ))}
        </div>
      </div>

      <div style={panelStyle}>
        <LabSlider label="CHANCE EACH QUBIT FLIPS" value={pPct} min={0} max={60} step={1} accent={THEME.accent}
          display={`${pPct}%`} onChange={(v) => { markExplored(); setPPct(v); }} />
      </div>

      <div style={panelStyle}>
        <Eyebrow>HOW OFTEN THE QUBIT IS LOST</Eyebrow>
        <div style={{ marginTop: 8 }}>
          <BarChart theme={THEME} bars={[
            { label: 'BARE', expected: p, observed: observed ? observed.bare.rate : undefined },
            { label: 'CODE', expected: logical, observed: observed ? observed.code.rate : undefined },
          ]} />
        </div>
        <div style={{ fontFamily: RETRO, fontSize: '1.25rem', marginTop: 10, lineHeight: 1.2 }}>
          {n === 1
            ? 'One qubit, no protection: it is lost whenever it flips.'
            : p === 0
              ? 'No noise, nothing to fix.'
              : p >= 0.5
                ? `With this much noise the ${n}-qubit code is not better: ${fmtRate(logical)} lost, against ${fmtRate(p)} for one bare qubit.`
                : `The ${n}-qubit code loses it ${fmtRate(logical)} of the time against ${fmtRate(p)} for one bare qubit${better ? `: about ${better.toFixed(better < 10 ? 1 : 0)} times better.` : '.'}`}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 6 }}>
          Dashed marker = what the maths predicts; the bar fills in as you run trials. BARE is one qubit with no code, CODE is the group.
        </div>
      </div>

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Eyebrow>RUN THE NOISE MANY TIMES</Eyebrow>
        <div style={{ display: 'flex', gap: 6 }} role="group" aria-label="Number of trials">
          {TRIAL_COUNTS.map((c) => (
            <button key={c} className="chip" aria-pressed={trials === c} onClick={() => setTrials(c)} style={{
              ...groupChip, ...(trials === c ? { background: THEME.accent, color: '#fff', borderColor: THEME.edge } : {}),
            }}>{trials === c ? '✓ ' : ''}{c.toLocaleString()}</button>
          ))}
        </div>
        <button className="btn btn-violet" onClick={runTrials}><Play size={18} fill="currentColor" /> <span>Run {trials.toLocaleString()} trials</span></button>
        {observed && n > 1 && (
          <div>
            <Eyebrow>HOW MANY QUBITS FLIPPED PER TRIAL (THE CODE FAILS WHEN MORE THAN HALF FLIP)</Eyebrow>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 110, marginTop: 8 }} role="img"
              aria-label={`Trials by number of flipped qubits: ${observed.code.flipCounts.map((c, k) => `${k} flipped: ${c}`).join(', ')}. The code fails when more than ${Math.floor(n / 2)} flip.`}>
              {observed.code.flipCounts.map((c, k) => {
                const fails = k > n / 2;
                const peak = Math.max(...observed.code.flipCounts, 1);
                return (
                  <div key={k} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', alignItems: 'center', gap: 2 }}>
                    <span style={{ fontFamily: RETRO, fontSize: '1rem' }}>{c}</span>
                    <div style={{
                      width: '100%', height: `${Math.max(2, (c / peak) * 70)}%`, borderRadius: 4,
                      background: fails ? 'repeating-linear-gradient(45deg, #ff5c8a, #ff5c8a 4px, #2a0f5c 4px, #2a0f5c 8px)' : THEME.accent,
                      outline: fails ? '2px solid #ff5c8a' : 'none',
                    }} />
                    <span style={{ fontFamily: RETRO, fontSize: '1.1rem' }}>{k}{fails ? ' ✘' : ''}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 6 }}>
              Striped bars with ✘ are the trials where the majority was wrong: {observed.code.failures.toLocaleString()} of {observed.code.trials.toLocaleString()}.
            </div>
          </div>
        )}
      </div>

      <div style={panelStyle}>
        <Eyebrow>LOGICAL VS PHYSICAL ERROR RATE</Eyebrow>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" style={{ marginTop: 6 }}
          aria-label={`Curve of the ${n}-qubit code's failure rate against the chance a single qubit flips. Below 50% the code is better than a bare qubit, above 50% it is worse. At ${pPct}% a bare qubit fails ${fmtRate(p)} of the time and the code ${fmtRate(logical)}.`}>
          {[0, 0.2, 0.4, 0.6].map((v) => (
            <g key={v}>
              <line x1={x(v)} y1={T} x2={x(v)} y2={H - B} stroke="rgba(255,255,255,0.1)" />
              <line x1={L} y1={y(v)} x2={W - R} y2={y(v)} stroke="rgba(255,255,255,0.1)" />
              <text x={x(v)} y={H - B + 14} fill="#ddd0fa" fontSize="10" textAnchor="middle">{Math.round(v * 100)}%</text>
              <text x={L - 4} y={y(v) + 3} fill="#ddd0fa" fontSize="10" textAnchor="end">{Math.round(v * 100)}%</text>
            </g>
          ))}
          <line x1={x(0.5)} y1={T} x2={x(0.5)} y2={H - B} stroke="#ffd23f" strokeDasharray="2 4" />
          <text x={x(0.5) - 3} y={T + 9} fill="#ffd23f" fontSize="10" textAnchor="end">50%</text>
          <line x1={x(0)} y1={y(0)} x2={x(MAX)} y2={y(MAX)} stroke="#ddd0fa" strokeWidth="2" strokeDasharray="6 4" />
          <path d={path} fill="none" stroke={THEME.accent} strokeWidth="3" />
          <circle cx={x(p)} cy={y(p)} r="5" fill="none" stroke="#fff" strokeWidth="2" />
          <circle cx={x(p)} cy={y(logical)} r="5" fill="#fff" stroke={THEME.accent} strokeWidth="2" />
          <text x={W - R} y={H - 4} fill="#ddd0fa" fontSize="10" textAnchor="end">chance one qubit flips →</text>
          <text x={L + 4} y={T + 9} fill="#ddd0fa" fontSize="10">chance the qubit is lost ↑</text>
        </svg>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Dashed line: one bare qubit (lost whenever it flips). Solid line: the {n}-qubit code. Open circle: a bare qubit at your noise level, filled circle: the code. Below the 50% line the solid curve is under the dashed one, so the code helps; above it, it hurts.
        </div>
      </div>

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Eyebrow color="#ffd23f">FIND THE ERROR WITHOUT LOOKING AT THE DATA</Eyebrow>
        <p style={{ fontSize: '0.86rem', lineHeight: 1.5 }}>
          Three data qubits hold one qubit as α|000⟩ + β|111⟩. Pick a state and where noise struck. A helper qubit compares Q1 with Q2 (probe A) and Q2 with Q3 (probe B), and only the helper is measured.
        </p>
        <LabSlider label="YOUR QUBIT (ANGLE FROM |0⟩)" value={theta} min={0} max={180} step={5} accent={THEME.accent}
          display={`${theta}°`} onChange={(v) => { markExplored(); setTheta(v); }} />
        <div role="group" aria-label="Where the noise struck" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {CASES.map((c) => (
            <button key={c.id} className="chip" aria-pressed={caseId === c.id} onClick={() => { markExplored(); setCaseId(c.id); }} style={{
              minHeight: 44, fontSize: '0.54rem', ...(caseId === c.id ? { background: THEME.accent, color: '#fff', borderColor: THEME.edge } : {}),
            }}>{caseId === c.id ? '✓ ' : ''}{c.label}</button>
          ))}
        </div>

        <div style={{ fontFamily: RETRO, fontSize: '1.25rem', lineHeight: 1.3 }}>
          <div>probe A (Q1 vs Q2): {demo.a ? '✘ differ' : '✔ agree'}</div>
          <div>probe B (Q2 vs Q3): {demo.b ? '✘ differ' : '✔ agree'}</div>
          <div style={{ color: '#2ee6a6' }}>{demo.fix === null ? 'verdict: nothing to fix' : `verdict: flip Q${demo.fix + 1} back`}</div>
        </div>
        <div style={{ fontSize: '0.86rem', lineHeight: 1.5 }}>
          Amplitudes of the two states the data is in (|α|, |β|): before the probes <b>{demo.before[0].toFixed(2)}, {demo.before[1].toFixed(2)}</b>; after the probes <b>{demo.after[0].toFixed(2)}, {demo.after[1].toFixed(2)}</b>. The probes changed nothing about the data.
        </div>
        {flips.filter(Boolean).length <= 1 ? (
          <Banner tone="good" title="REPAIRED">
            After the fix the qubit matches your original {pct(demo.match, 0)}. You never read it.
          </Banner>
        ) : (
          <Banner tone="bad" title="TWO FLIPS FOOL THE CODE">
            The probes point at Q3, so the repair flips the wrong qubit and the whole qubit ends up flipped: it matches your original {pct(demo.match, 0)}. The code can only undo one flip at a time.
          </Banner>
        )}

        <button className="chip" onClick={lookDirectly} style={{ alignSelf: 'flex-start' }}><Eye size={16} /> What if I just measure the data?</button>
        {directShown && (
          <Banner tone="warn" title="THE BLEND IS GONE">
            Measuring gave a plain {directShown.bit}. The data collapsed to {directShown.bit === 0 ? '|000⟩' : '|111⟩'} (amplitudes {directShown.zero.toFixed(2)} and {directShown.one.toFixed(2)}), and it matches your original only {pct(directShown.match, 0)}. Reading the data destroys what you are trying to protect, so error correction compares qubits instead.
          </Banner>
        )}
      </div>

      <MathBox open={showMath} onToggle={() => setShowMath((v) => !v)}>
        {n === 1 ? (
          <div>no code: lost with probability p = {fmtRate(p)}</div>
        ) : (
          <>
            <div>lost when more than {Math.floor(n / 2)} of {n} qubits flip</div>
            {n === 3 && <div>= 3p² − 2p³ = 3·({p.toFixed(2)})² − 2·({p.toFixed(2)})³ = {(3 * p * p).toFixed(4)} − {(2 * p ** 3).toFixed(4)}</div>}
            <div>= {logical.toFixed(5)} ({fmtRate(logical)})</div>
            <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
              At p = 50% the code and a bare qubit are exactly as bad as each other. Below it, more qubits help more; above it, more qubits make it worse.
            </div>
          </>
        )}
      </MathBox>

      <InfoBox title="HONEST NOTE">
        A simplified model. It only has bit-flips (0 and 1 swapping), every qubit flips independently, and the probes and gates are perfect. Real machines also suffer phase flips and mistakes in the probes themselves, so real codes are bigger and cleverer. Here the break-even point is 50%; for real codes it is far lower, around 1% per operation, which is why today's qubits are not good enough yet and many physical qubits are needed for each reliable one.
      </InfoBox>
    </ArcadeFrame>
  );
};
