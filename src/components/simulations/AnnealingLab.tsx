import React, { useMemo, useState } from 'react';
import { useActivityReport } from '../../hooks/useActivityReport';
import { ArcadeFrame, ArcadeHeader, Banner, Eyebrow, GameTitle } from '../shared/Arcade';
import { RETRO, THEMES, groupChip, panelStyle } from '../shared/arcadeTheme';
import {
  PROBLEMS, anneal, energies, gapCurve, groundStates, minimumGap, problemById, roughSlowTime, runnerUp,
} from '../../core/hardware/annealing';
import { InfoBox, LabSlider, LineChart, MathBox, ReadoutGrid } from './labKit';
import { pct, useExplored } from './labUtils';

const THEME = THEMES.violet;
const TIMES = [0.5, 1, 2, 4, 8, 16, 32, 64];

const bits = (x: number, n: number) => x.toString(2).padStart(n, '0').split('').reverse().join('');

export const AnnealingLab: React.FC = () => {
  const markExplored = useExplored('annealing_lab', 'concept_hardware');
  const [problemId, setProblemId] = useState('hard');
  const [logT, setLogT] = useState(0.5); // log10 of the anneal time
  const [showMath, setShowMath] = useState(false);

  const problem = problemById(problemId);
  const T = Math.pow(10, logT);
  const result = useMemo(() => anneal(problem, T), [problem, T]);
  const sweep = useMemo(() => TIMES.map((t) => ({ x: t, y: anneal(problem, t).success })), [problem]);
  const gaps = useMemo(() => gapCurve(problem, 20), [problem]);
  const smallest = minimumGap(gaps);
  const best = groundStates(problem)[0];
  const e = energies(problem);
  const second = runnerUp(problem);

  const ranked = result.probabilities.map((p, x) => ({ x, p })).sort((a, b) => b.p - a.p).slice(0, 5);

  useActivityReport({
    id: 'annealing_lab',
    status: 'playing',
    step: `${problem.name}, anneal time ${T.toFixed(1)}`,
    state:
      `${problem.spins} spins. Anneal time ${T.toFixed(1)} (units of 1 over the transverse field). The chance of ending in the lowest-energy answer is ${pct(result.success, 0)}. ` +
      `The smallest energy gap on the way is ${smallest.gap.toFixed(2)}, at s = ${smallest.s.toFixed(2)}.`,
  });

  return (
    <ArcadeFrame theme={THEME}>
      <ArcadeHeader theme={THEME} label="LAB · ANNEALING" tag="Simplified model" />
      <GameTitle
        title="Annealing Lab"
        story="Start with every spin in an equal mix of up and down. Slowly turn off that mixing and turn on the problem. Go slowly enough and the spins settle in the lowest-energy answer. Rush, and they get stuck."
      />

      <div>
        <Eyebrow>THE PROBLEM</Eyebrow>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
          {PROBLEMS.map((p) => (
            <button key={p.id} className="chip" aria-pressed={problemId === p.id}
              onClick={() => { markExplored(); setProblemId(p.id); }} style={{ ...groupChip, flex: '1 1 30%' }}>{p.name}</button>
          ))}
        </div>
        <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.4 }}>{problem.about}</div>
      </div>

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <LabSlider label="ANNEAL TIME (SLOW ON THE RIGHT)" value={logT} min={-0.3} max={2} step={0.05} accent={THEME.accent}
          display={T.toFixed(T < 10 ? 1 : 0)} onChange={(v) => { markExplored(); setLogT(v); }} />
      </div>

      <ReadoutGrid items={[
        { label: 'Chance of the best answer', value: pct(result.success, 0), note: result.success > 0.9 ? 'the spins followed the ground state' : result.success < 0.3 ? 'stuck in a worse valley' : 'a gamble' },
        { label: 'Smallest energy gap', value: smallest.gap.toFixed(2), note: `at s = ${smallest.s.toFixed(2)}; a rough time needed is ${Math.round(roughSlowTime(smallest.gap))}` },
      ]} />

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Eyebrow>WHERE THE SPINS ENDED UP (TOP 5 ANSWERS; SPIN 1 IS ON THE LEFT)</Eyebrow>
        {ranked.map(({ x, p }) => (
          <div key={x} style={{ display: 'grid', gridTemplateColumns: '66px 1fr 44px', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: RETRO, fontSize: '1.15rem' }}>{bits(x, problem.spins)}{x === best ? ' ★' : ''}</span>
            <div style={{ height: 16, background: 'rgba(255,255,255,0.08)', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ width: `${p * 100}%`, height: '100%', background: x === best ? '#2ee6a6' : THEME.accent }} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textAlign: 'right' }}>{pct(p, 0)}</span>
          </div>
        ))}
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          ★ is the lowest-energy answer (energy {e[best].toFixed(1)}). The runner-up has energy {second.energy.toFixed(1)} and differs in {second.flips} spin{second.flips === 1 ? '' : 's'}.
        </div>
      </div>

      {result.success < 0.3 && (
        <Banner tone="warn" title="TOO FAST">
          The anneal went through the narrowest part of the gap faster than the spins could follow. Part of the state jumped to a higher-energy level. Slow the anneal down.
        </Banner>
      )}

      <div style={panelStyle}>
        <LineChart
          series={[{ label: 'chance of the best answer', points: sweep, color: THEME.accent }]}
          xLabel="anneal time" yLabel="success" xMax={64} yMax={1}
          markers={T <= 64 ? [{ x: T, label: 'now' }] : []}
          formatY={(y) => pct(y, 0)} formatX={(x) => String(Math.round(x))}
          summary={`Success rises with anneal time. At the chosen time it is ${pct(result.success, 0)}.`}
        />
      </div>

      <div style={panelStyle}>
        <LineChart
          series={[{ label: 'gap between lowest two energies', points: gaps.map((g) => ({ x: g.s, y: g.gap })), color: '#ffffff' }]}
          xLabel="s (0 = start, 1 = problem)" yLabel="gap" xMax={1}
          markers={[{ x: smallest.s, label: `smallest ${smallest.gap.toFixed(2)}` }]}
          formatY={(y) => y.toFixed(1)}
          summary={`The gap is smallest, ${smallest.gap.toFixed(2)}, near s = ${smallest.s.toFixed(2)}.`}
        />
      </div>

      <MathBox open={showMath} onToggle={() => setShowMath((v) => !v)}>
        <div>H(s) = −(1−s) Σ Xᵢ + s · [Σ hᵢZᵢ + Σ JᵢⱼZᵢZⱼ]</div>
        <div>s runs from 0 to 1 over the anneal time T = {T.toFixed(1)}</div>
        <div>found by time-stepping iħ dψ/dt = H(s)ψ (fourth-order Runge–Kutta)</div>
        <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
          Adiabatic theorem: stay in the ground state if T is much larger than 1/gap². Here 1/gap² ≈ {Math.round(roughSlowTime(smallest.gap))}.
        </div>
      </MathBox>

      <InfoBox title="HONEST NOTE">
        This is a perfect, closed quantum system of {problem.spins} spins, simulated exactly. Real annealers have thousands of qubits, lose energy and information to their surroundings, and are measured against very good classical solvers. Whether they are faster than classical methods is still debated, and this lab does not decide it.
      </InfoBox>
    </ArcadeFrame>
  );
};
