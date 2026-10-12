import React, { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useActivityReport } from '../../hooks/useActivityReport';
import { Banner, Eyebrow } from '../shared/Arcade';
import { RETRO, THEMES, panelStyle } from '../shared/arcadeTheme';
import { FinishPanel, LevelFrame, MeterBar, NextButton, starWords, useLevelRun } from '../shared/LevelKit';
import type { StarCount } from '../shared/LevelKit';
import { sound } from '../../utils/audio';
import { LEVELS, TIMES, bitsOf, draw, landscape, runCost, stars as starsFor } from '../../core/games/valleyRoll';
import type { Draw, ValleyLevel } from '../../core/games/valleyRoll';
import { groundEnergy } from '../../core/hardware/annealing';

const THEME = THEMES.violet;

/** The landscape of answers: energy as a line (valleys are low), and where a run of this length tends to end as bars. */
const Landscape: React.FC<{ level: ValleyLevel; T: number }> = ({ level, T }) => {
  const land = useMemo(() => landscape(level.problem, T), [level, T]);
  const W = 320;
  const H = 130;
  const e = land.map((l) => l.energy);
  const lo = Math.min(...e);
  const hi = Math.max(...e);
  const x = (i: number) => 10 + (i / (land.length - 1)) * (W - 20);
  // low energy sits low on the screen, so the valleys look like valleys
  const flipped = (v: number) => H - 22 - ((v - lo) / (hi - lo || 1)) * (H - 40);
  const best = land.findIndex((l) => Math.abs(l.energy - groundEnergy(level.problem)) < 1e-9);
  const maxP = Math.max(...land.map((l) => l.probability), 0.01);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img"
      aria-label={`Energy landscape of ${land.length} answers. The lowest valley is marked. A run of anneal time ${T} ends in the lowest valley with chance ${Math.round(land[best].probability * 100)} percent.`}>
      {land.map((l, i) => (
        <rect key={i} x={x(i) - 3.5} y={H - 22 - (l.probability / maxP) * 50} width="7" height={(l.probability / maxP) * 50} fill={i === best ? '#2ee6a6' : 'rgba(139,92,246,0.85)'} />
      ))}
      <polyline fill="none" stroke="#fff" strokeWidth="2" points={land.map((l, i) => `${x(i).toFixed(1)},${flipped(l.energy).toFixed(1)}`).join(' ')} />
      <circle cx={x(best)} cy={flipped(land[best].energy)} r="5" fill="#2ee6a6" stroke="#fff" strokeWidth="1.5" />
      <text x={Math.min(Math.max(x(best), 40), W - 40)} y={flipped(land[best].energy) - 8} fontSize="9" fill="#2ee6a6" textAnchor="middle" fontWeight="700">lowest valley</text>
      <text x="10" y={H - 6} fontSize="9" fill="#ddd0fa">answers, neighbours differ by one spin →</text>
      <text x={W - 10} y={12} fontSize="9" fill="#ddd0fa" textAnchor="end">white line: energy · bars: where a run ends</text>
    </svg>
  );
};

const Level: React.FC<{
  level: ValleyLevel; index: number; isLast: boolean; onClear: (s: StarCount) => void; onNext: () => void;
}> = ({ level, index, isLast, onClear, onNext }) => {
  const [T, setT] = useState(TIMES[1]);
  const [runs, setRuns] = useState<{ T: number; d: Draw }[]>([]);
  const [outcome, setOutcome] = useState<'playing' | 'won' | 'out'>('playing');
  const [earned, setEarned] = useState<StarCount>(0);
  const spent = runs.reduce((s, r) => s + runCost(r.T), 0);
  const left = level.budget - spent;
  const affordable = TIMES.filter((t) => runCost(t) <= left);
  const bestSeen = runs.length ? Math.min(...runs.map((r) => r.d.energy)) : null;

  const roll = () => {
    if (outcome !== 'playing' || runCost(T) > left) return;
    const d = draw(level.problem, T);
    const next = [...runs, { T, d }];
    setRuns(next);
    if (d.isBest) {
      const s = starsFor(level, spent + runCost(T), true) as StarCount;
      sound.playSuccess();
      setOutcome('won');
      setEarned(s);
      onClear(s);
    } else {
      sound.playClick();
      const remaining = level.budget - (spent + runCost(T));
      if (!TIMES.some((t) => runCost(t) <= remaining)) {
        sound.playAlarm();
        setOutcome('out');
      }
    }
  };

  const retry = () => {
    setRuns([]);
    setOutcome('playing');
    setEarned(0);
    setT(TIMES[1]);
  };

  useActivityReport({
    id: 'valley_roll',
    status: 'playing',
    step: `Level ${index + 1} of ${LEVELS.length}: ${level.title}`,
    mission: `Find the lowest-energy answer of ${level.problem.spins} spins within a time budget of ${level.budget}. A run costs its anneal time plus ${runCost(0)} for readout.`,
    state:
      `Anneal time chosen ${T}. ${runs.length} run${runs.length === 1 ? '' : 's'} so far, ${spent} of ${level.budget} time spent. ` +
      `${bestSeen === null ? 'Nothing found yet.' : outcome === 'won' ? 'The lowest valley was found.' : `Best energy seen ${bestSeen.toFixed(1)}; the lowest is not found yet.`}`,
    hint: 'A quick run is cheap but usually lands in a worse valley; a slow run costs more but is far more likely to land in the lowest. Count how many runs of each you can afford.',
  });

  return (
    <>
      <div style={{ ...panelStyle, fontSize: '0.9rem', lineHeight: 1.5 }}>
        {level.problem.about} Find the lowest valley within a time budget of <b>{level.budget}</b>. Every run also pays <b>{runCost(0)}</b> for reset and readout.
      </div>

      <div style={panelStyle}><Landscape level={level} T={T} /></div>

      <div>
        <Eyebrow>HOW LONG TO ANNEAL FOR EACH RUN</Eyebrow>
        <div role="group" aria-label="Anneal time" style={{ display: 'grid', gridTemplateColumns: `repeat(${TIMES.length}, minmax(0, 1fr))`, gap: 6, marginTop: 6 }}>
          {TIMES.map((t) => (
            <button key={t} className="chip" aria-pressed={T === t} disabled={outcome !== 'playing' || runCost(t) > left} onClick={() => setT(t)}
              style={{ minHeight: 52, justifyContent: 'center', fontSize: '0.7rem', padding: '4px 2px' }}>
              {t}<br />(cost {runCost(t)})
            </button>
          ))}
        </div>
      </div>

      <MeterBar label="Time spent" value={spent} max={level.budget} ok={spent <= level.budget && outcome !== 'out'} text={`${spent} of ${level.budget}`} color={THEME.accent} />

      {outcome === 'playing' && (
        <button className="btn btn-mint" onClick={roll} disabled={runCost(T) > left || affordable.length === 0}>
          <span>Roll a run of {T} (cost {runCost(T)})</span>
        </button>
      )}

      {runs.length > 0 && (
        <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Eyebrow>YOUR RUNS (NEWEST FIRST)</Eyebrow>
          {[...runs].reverse().slice(0, 6).map((r, k) => (
            <div key={k} style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontFamily: RETRO, fontSize: '1.1rem' }}>{bitsOf(r.d.state, level.problem.spins)}</span>
              <span>T={r.T}, energy {r.d.energy.toFixed(1)}</span>
              <span style={{ fontWeight: 800 }}>{r.d.isBest ? '★ lowest' : 'not the lowest'}</span>
            </div>
          ))}
        </div>
      )}

      {outcome === 'won' && (
        <>
          <Banner tone="good" title="FOUND THE LOWEST VALLEY!">
            {starWords(earned)} After {runs.length} run{runs.length === 1 ? '' : 's'} and {spent} time. Luck plays a part: the same plan can need more or fewer runs another time.
          </Banner>
          <NextButton isLast={isLast} onNext={onNext} />
        </>
      )}
      {outcome === 'out' && (
        <>
          <Banner tone="bad" title="OUT OF TIME">
            The budget is spent and the lowest valley was not found. Try a different mix: many quick runs, a few slow ones, or something between.
          </Banner>
          <button className="btn" onClick={retry}><RotateCcw size={18} /> <span>Try this level again</span></button>
        </>
      )}
    </>
  );
};

export const ValleyRoll: React.FC = () => {
  const r = useLevelRun('valley_roll', LEVELS.length);
  if (r.finished) {
    return (
      <FinishPanel theme={THEME} title="ALL VALLEYS ROLLED" total={r.total} levelCount={LEVELS.length}
        summary="You spent a time budget on annealing runs, and found that neither the quickest nor the slowest run is the cheapest way to the lowest valley."
        honest="This is a perfect, closed simulation of five or six spins. Real annealers have thousands of qubits, are noisy, and are compared with very good classical solvers: whether they are faster is still an open question, and this game does not say either way."
        onAgain={r.again} />
    );
  }
  const level = LEVELS[r.levelIdx];
  return (
    <LevelFrame theme={THEME} tag="Simplified model" label="VALLEY" levelIdx={r.levelIdx} levelCount={LEVELS.length} total={r.total} title={level.title} story={level.story}>
      <Level key={`${r.round}-${level.id}`} level={level} index={r.levelIdx} isLast={r.isLast} onClear={r.clear} onNext={r.next} />
    </LevelFrame>
  );
};
