import React, { useState } from 'react';
import { useActivityReport } from '../../hooks/useActivityReport';
import { Banner, Eyebrow } from '../shared/Arcade';
import { THEMES, panelStyle } from '../shared/arcadeTheme';
import { FinishPanel, LevelFrame, MeterBar, NextButton } from '../shared/LevelKit';
import { starWords, useLevelRun } from '../shared/levelRun';
import type { StarCount } from '../shared/levelRun';
import { sound } from '../../utils/audio';
import { COPIES, LEVELS, evaluate, stars as starsFor } from '../../core/games/photonFactory';
import type { FactoryLevel } from '../../core/games/photonFactory';
import { pct } from '../simulations/labUtils';

const THEME = THEMES.sky;

const Level: React.FC<{
  level: FactoryLevel; index: number; isLast: boolean; onClear: (s: StarCount) => void; onNext: () => void;
}> = ({ level, index, isLast, onClear, onNext }) => {
  const [copies, setCopies] = useState<number[]>(() => level.stages.map(() => 1));
  const [done, setDone] = useState<StarCount | null>(null);
  const [tried, setTried] = useState(false);
  const result = evaluate(level, copies);

  const set = (i: number, m: number) => {
    if (done !== null) return;
    sound.playClick();
    setTried(false);
    setCopies((c) => c.map((v, k) => (k === i ? m : v)));
  };

  const fire = () => {
    setTried(true);
    if (!result.passed) {
      sound.playAlarm();
      return;
    }
    const s = starsFor(level, result) as StarCount;
    sound.playSuccess();
    setDone(s);
    onClear(s);
  };

  useActivityReport({
    id: 'photon_factory',
    status: 'playing',
    step: `Level ${index + 1} of ${LEVELS.length}: ${level.title}`,
    mission: `Make the whole chain succeed with a chance of at least ${pct(level.target, 0)} using at most ${level.budget} sources. Each doubling of copies adds a layer of switches that loses ${level.switchLossDb} dB.`,
    state:
      `Copies per step: ${level.stages.map((s, i) => `${s.name} ${copies[i]}`).join(', ')}. ` +
      `Sources used ${result.used} of ${level.budget}. Chance the chain works ${pct(result.success, 1)} (target ${pct(level.target, 0)}).`,
    hint: 'Weak steps gain the most from extra copies. But every doubling costs sources and, through the switches, some light.',
  });

  return (
    <>
      <div style={{ ...panelStyle, fontSize: '0.9rem', lineHeight: 1.5 }}>
        Reach <b>{pct(level.target, 0)}</b> with at most <b>{level.budget} sources</b>. Each doubling of copies adds a layer of switches that loses <b>{level.switchLossDb} dB</b>.
      </div>

      {level.stages.map((stage, i) => (
        <div key={i} style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontWeight: 800, fontSize: '0.9rem' }}>
            <span>Step {i + 1}: {stage.name}</span>
            <span>works {pct(stage.p, 0)} of the time</span>
          </div>
          <div role="group" aria-label={`Copies for step ${i + 1}`} style={{ display: 'grid', gridTemplateColumns: `repeat(${COPIES.length}, minmax(0, 1fr))`, gap: 6 }}>
            {COPIES.map((m) => (
              <button key={m} className="chip" aria-pressed={copies[i] === m} disabled={done !== null} onClick={() => set(i, m)}
                style={{ minHeight: 48, justifyContent: 'center', fontSize: '0.7rem', padding: '4px 2px' }}>×{m}</button>
            ))}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            With ×{copies[i]}, this step works {pct(result.perStage[i], 0)} of the time.
          </div>
        </div>
      ))}

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Eyebrow>THE WHOLE CHAIN</Eyebrow>
        <MeterBar label="Sources used" value={result.used} max={level.budget} ok={result.withinBudget} text={`${result.used} of ${level.budget}`} color={THEME.accent} />
        <MeterBar label="Chance the chain works" value={result.success} max={1} ok={result.success >= level.target}
          text={`${pct(result.success, 1)} (need ${pct(level.target, 0)})`} color="#2ee6a6" />
      </div>

      {done === null && (
        <>
          {tried && !result.passed && (
            <Banner tone="bad" title={result.withinBudget ? 'NOT RELIABLE ENOUGH' : 'OVER BUDGET'}>
              {result.withinBudget
                ? 'The chain works too rarely. Look at which step has the lowest chance and give it more copies, if the budget allows.'
                : 'That is more sources than the budget has. Take copies away from a step that is already reliable.'}
            </Banner>
          )}
          <button className="btn btn-mint" onClick={fire}><span>Fire the factory</span></button>
        </>
      )}

      {done !== null && (
        <>
          <Banner tone="good" title="THE CHAIN WORKS!">
            {starWords(done)} {result.used} source{result.used === 1 ? '' : 's'} for a {pct(result.success, 0)} chance.
            Multiplexing turns an unreliable step into a reliable one, at a price in sources and in light lost to the switches.
          </Banner>
          <NextButton isLast={isLast} onNext={onNext} />
        </>
      )}
    </>
  );
};

export const PhotonFactory: React.FC = () => {
  const r = useLevelRun('photon_factory', LEVELS.length);
  if (r.finished) {
    return (
      <FinishPanel theme={THEME} title="FACTORY RUNNING" total={r.total} levelCount={LEVELS.length}
        summary="You made unreliable photonic steps dependable by trying many copies, and met the point where the switches cost more than they give."
        honest="Real photonic machines multiplex in cleverer ways, add error-tolerant codes, and have loss everywhere, not only in the switches. The steps here are independent and identical, which no real chain is. The lesson that survives is the trade: reliability costs resources and light."
        onAgain={r.again} />
    );
  }
  const level = LEVELS[r.levelIdx];
  return (
    <LevelFrame theme={THEME} tag="Simplified model" label="LINE" levelIdx={r.levelIdx} levelCount={LEVELS.length} total={r.total} title={level.title} story={level.story}>
      <Level key={`${r.round}-${level.id}`} level={level} index={r.levelIdx} isLast={r.isLast} onClear={r.clear} onNext={r.next} />
    </LevelFrame>
  );
};
