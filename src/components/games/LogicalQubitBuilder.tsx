import React, { useState } from 'react';
import { Minus, Plus, Wrench } from 'lucide-react';
import { useActivityReport } from '../../hooks/useActivityReport';
import { Banner } from '../shared/Arcade';
import { RETRO, THEMES, panelStyle } from '../shared/arcadeTheme';
import { FinishPanel, LevelFrame, MeterBar, NextButton, starWords, useLevelRun } from '../shared/LevelKit';
import type { StarCount } from '../shared/LevelKit';
import { sound } from '../../utils/audio';
import { IMPROVE_FACTOR, LEVELS, MAX_DISTANCE, MAX_STEPS, evaluate, stars as starsFor } from '../../core/games/logicalBuilder';
import type { BuilderLevel } from '../../core/games/logicalBuilder';
import { THRESHOLD } from '../../core/hardware/overhead';

const THEME = THEMES.pink;
const pctText = (p: number) => `${(p * 100).toFixed(p < 0.001 ? 3 : 2)}%`;
const exp = (x: number) => (x >= 0.1 ? `${(x * 100).toFixed(0)}%` : x.toExponential(1).replace('e-', '×10^−'));

const Level: React.FC<{
  level: BuilderLevel; index: number; isLast: boolean; onClear: (s: StarCount) => void; onNext: () => void;
}> = ({ level, index, isLast, onClear, onNext }) => {
  const [distance, setDistance] = useState(1);
  const [improvements, setImprovements] = useState(0);
  const [done, setDone] = useState<StarCount | null>(null);
  const [tried, setTried] = useState(false);
  const build = { distance, improvements };
  const o = evaluate(level, build);

  const change = (d: number, k: number) => {
    if (done !== null) return;
    sound.playClick();
    setTried(false);
    setDistance(Math.min(MAX_DISTANCE, Math.max(1, d)));
    setImprovements(Math.min(MAX_STEPS, Math.max(0, k)));
  };

  const finish = () => {
    setTried(true);
    if (!o.passed) {
      sound.playAlarm();
      return;
    }
    const s = starsFor(level, build, o) as StarCount;
    sound.playSuccess();
    setDone(s);
    onClear(s);
  };

  useActivityReport({
    id: 'logical_qubit_builder',
    status: 'playing',
    step: `Level ${index + 1} of ${LEVELS.length}: ${level.title}`,
    mission: `Reach a logical error of ${exp(level.target)} using at most ${level.budget} physical qubits.`,
    state:
      `Code distance ${distance}, hardware improved ${improvements} time${improvements === 1 ? '' : 's'}. Physical error ${pctText(o.physical)} ` +
      `(${o.below ? 'below' : 'at or above'} the ${pctText(THRESHOLD)} threshold). Logical error ${exp(o.logical)}. Qubits used ${o.qubits} of ${level.budget}.`,
    hint: 'Check which side of the threshold the physical error is on. Above it a bigger code makes things worse, so the hardware has to improve first.',
  });

  return (
    <>
      <div style={{ ...panelStyle, fontSize: '0.9rem', lineHeight: 1.5 }}>
        Goal: logical error <b>{exp(level.target)}</b> or lower with at most <b>{level.budget}</b> physical qubits. The threshold is <b>{pctText(THRESHOLD)}</b>. Improving the hardware multiplies the physical error by {IMPROVE_FACTOR} each time, and is scored.
      </div>

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ flex: 1, fontWeight: 800 }}>Code distance</span>
          <button className="chip" aria-label="Smaller code" onClick={() => change(distance - 2, improvements)} disabled={distance <= 1 || done !== null} style={{ minWidth: 48, minHeight: 48, justifyContent: 'center' }}><Minus size={18} /></button>
          <span style={{ fontFamily: RETRO, fontSize: '1.8rem', minWidth: 56, textAlign: 'center' }}>{distance}</span>
          <button className="chip" aria-label="Bigger code" onClick={() => change(distance + 2, improvements)} disabled={distance >= MAX_DISTANCE || done !== null} style={{ minWidth: 48, minHeight: 48, justifyContent: 'center' }}><Plus size={18} /></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ flex: 1, fontWeight: 800 }}>Hardware improvements</span>
          <button className="chip" aria-label="Undo one improvement" onClick={() => change(distance, improvements - 1)} disabled={improvements <= 0 || done !== null} style={{ minWidth: 48, minHeight: 48, justifyContent: 'center' }}><Minus size={18} /></button>
          <span style={{ fontFamily: RETRO, fontSize: '1.8rem', minWidth: 56, textAlign: 'center' }}>{improvements}</span>
          <button className="chip" aria-label="Improve the hardware once more" onClick={() => change(distance, improvements + 1)} disabled={improvements >= MAX_STEPS || done !== null} style={{ minWidth: 48, minHeight: 48, justifyContent: 'center' }}><Wrench size={18} /></button>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Distance 1 means no code at all: just one physical qubit.</div>
      </div>

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
          Physical error: <b>{pctText(o.physical)}</b> — {o.below ? '✓ below the threshold, so a bigger code helps' : '✗ at or above the threshold, so a bigger code makes things worse'}.
        </div>
        <MeterBar label="Logical error (shorter bar is better; full bar is 100%)" value={Math.min(1, o.logical)} max={1} ok={o.logical <= level.target}
          text={`${exp(o.logical)} (need ${exp(level.target)})`} color="#2ee6a6" />
        <MeterBar label="Physical qubits" value={o.qubits} max={level.budget} ok={o.withinBudget} text={`${o.qubits.toLocaleString('en-US')} of ${level.budget.toLocaleString('en-US')}`} color={THEME.accent} />
      </div>

      {done === null && (
        <>
          {tried && !o.passed && (
            <Banner tone="bad" title={!o.withinBudget ? 'OVER THE QUBIT BUDGET' : 'NOT GOOD ENOUGH YET'}>
              {!o.withinBudget
                ? 'That code needs more physical qubits than you have. A smaller code on better hardware can reach the same error with fewer qubits.'
                : !o.below
                  ? 'The physical qubits are above the threshold, so no code can help. Improve the hardware first.'
                  : 'The logical error is still above the target. A larger distance (or better hardware) will bring it down.'}
            </Banner>
          )}
          <button className="btn btn-mint" onClick={finish}><span>Build it</span></button>
        </>
      )}

      {done !== null && (
        <>
          <Banner tone="good" title="LOGICAL QUBIT BUILT!">
            {starWords(done)} {o.qubits.toLocaleString('en-US')} physical qubit{o.qubits === 1 ? '' : 's'} for one logical qubit at {exp(o.logical)}, after {improvements} hardware improvement{improvements === 1 ? '' : 's'}.
          </Banner>
          <NextButton isLast={isLast} onNext={onNext} />
        </>
      )}
    </>
  );
};

export const LogicalQubitBuilder: React.FC = () => {
  const r = useLevelRun('logical_qubit_builder', LEVELS.length);
  if (r.finished) {
    return (
      <FinishPanel theme={THEME} title="LOGICAL QUBITS BUILT" total={r.total} levelCount={LEVELS.length}
        summary="You turned noisy physical qubits into good logical ones, and met the threshold: below it a bigger code pays off exponentially, above it nothing helps until the hardware does."
        honest="The formula is an empirical fit from one study (threshold 0.57%, a prefactor of 0.03). Other codes, layouts and noise give other numbers, and newer layouts need roughly half the qubits. Real teams measure this on hardware: Google reported errors falling with each larger surface code on its Willow chip."
        onAgain={r.again} />
    );
  }
  const level = LEVELS[r.levelIdx];
  return (
    <LevelFrame theme={THEME} tag="Simplified model" label="BUILD" levelIdx={r.levelIdx} levelCount={LEVELS.length} total={r.total} title={level.title} story={level.story}>
      <Level key={`${r.round}-${level.id}`} level={level} index={r.levelIdx} isLast={r.isLast} onClear={r.clear} onNext={r.next} />
    </LevelFrame>
  );
};
