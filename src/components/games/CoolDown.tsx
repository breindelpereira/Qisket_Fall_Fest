import React, { useState } from 'react';
import { useActivityReport } from '../../hooks/useActivityReport';
import { Banner, Eyebrow } from '../shared/Arcade';
import { THEMES, groupChip, panelStyle } from '../shared/arcadeTheme';
import { FinishPanel, LevelFrame, MeterBar, NextButton, starWords, useLevelRun } from '../shared/LevelKit';
import type { StarCount } from '../shared/LevelKit';
import { sound } from '../../utils/audio';
import { LEVELS, READOUTS, WIRINGS, limitingStage, loads, stars as starsFor, works } from '../../core/games/coolDown';
import type { CoolLevel, Readout, Wiring } from '../../core/games/coolDown';
import { LabSlider } from '../simulations/labKit';

const THEME = THEMES.sky;

const fmtPower = (mw: number): string => (mw >= 1000 ? `${(mw / 1000).toFixed(mw >= 10000 ? 0 : 1)} W` : mw >= 1 ? `${mw.toFixed(mw >= 10 ? 0 : 1)} mW` : `${(mw * 1000).toFixed(mw >= 0.01 ? 0 : 1)} µW`);

const Level: React.FC<{
  level: CoolLevel; index: number; isLast: boolean; onClear: (s: StarCount) => void; onNext: () => void;
}> = ({ level, index, isLast, onClear, onNext }) => {
  const [qubits, setQubits] = useState(20);
  const [wiring, setWiring] = useState<Wiring>(level.wirings[0]);
  const [readout, setReadout] = useState<Readout>(level.readouts[0]);
  const [done, setDone] = useState<StarCount | null>(null);

  const plan = { qubits, wiring, readout };
  const stages = loads(plan, level.fridge);
  const ok = works(plan, level.fridge);
  const limit = limitingStage(plan, level.fridge);
  const reached = qubits >= level.target;

  const lockIn = () => {
    const s = starsFor(level, plan);
    if (s === 0) {
      sound.playAlarm();
      return;
    }
    sound.playSuccess();
    setDone(s);
    onClear(s);
  };

  useActivityReport({
    id: 'cool_down',
    status: 'playing',
    step: `Level ${index + 1} of ${LEVELS.length}: ${level.title}`,
    mission: `Fit ${level.target} qubits in the ${level.fridge.name.toLowerCase()} without any stage getting more heat than it can remove.`,
    state:
      `${qubits} qubits, ${WIRINGS.find((w) => w.id === wiring)!.name.toLowerCase()}, ${READOUTS.find((x) => x.id === readout)!.name.toLowerCase()}. ` +
      `${ok ? 'Every stage is within its cooling power.' : `The ${limit.stage.name} is over its cooling power (${Math.round(limit.fill * 100)}% full).`} ` +
      `The fullest stage is the ${limit.stage.name} at ${Math.round(limit.fill * 100)}%.`,
    hint: 'Look at which stage is fullest: that is the one to relieve. Different wiring and shared readout move the heat to different stages.',
  });

  return (
    <>
      <div style={{ ...panelStyle, fontSize: '0.9rem', lineHeight: 1.5 }}>
        Target: <b>{level.target} qubits</b> in the <b>{level.fridge.name.toLowerCase()}</b>. Numbers are round and illustrative, but the pattern is real: the coldest stage can carry away only microwatts.
      </div>

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <LabSlider label="NUMBER OF QUBITS" value={qubits} min={10} max={1200} step={10} accent={THEME.accent}
          display={String(qubits)} onChange={(v) => { if (done === null) setQubits(v); }} />
        <div>
          <Eyebrow>HOW THE QUBITS ARE WIRED</Eyebrow>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
            {WIRINGS.map((w) => {
              const allowed = level.wirings.includes(w.id);
              return (
                <button key={w.id} className="chip" aria-pressed={wiring === w.id} disabled={!allowed || done !== null}
                  onClick={() => setWiring(w.id)} style={{ ...groupChip, flex: '1 1 30%', minHeight: 52, opacity: allowed ? 1 : 0.45 }}>
                  {w.name}{!allowed ? ' (not available)' : ''}
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.4 }}>{WIRINGS.find((w) => w.id === wiring)!.about}</div>
        </div>
        <div>
          <Eyebrow>READOUT</Eyebrow>
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            {READOUTS.map((x) => {
              const allowed = level.readouts.includes(x.id);
              return (
                <button key={x.id} className="chip" aria-pressed={readout === x.id} disabled={!allowed || done !== null}
                  onClick={() => setReadout(x.id)} style={{ ...groupChip, minHeight: 52, opacity: allowed ? 1 : 0.45 }}>{x.name}</button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Eyebrow>HEAT AT EACH STAGE (BARS SHOW HOW FULL EACH ONE IS)</Eyebrow>
        {stages.map((l) => (
          <MeterBar key={l.stage.id} label={`${l.stage.name} (${l.stage.temperature})`} value={l.heat} max={l.capacity} ok={l.ok}
            text={`${fmtPower(l.heat)} of ${fmtPower(l.capacity)}`} color={THEME.accent} />
        ))}
      </div>

      {done === null && (
        <>
          {!ok && <Banner tone="bad" title="TOO HOT">The {limit.stage.name} is getting {Math.round(limit.fill * 100)}% of the heat it can remove. Change the wiring, share the readout, or install fewer qubits.</Banner>}
          {ok && !reached && <Banner tone="info" title="NOT YET AT THE TARGET">It works, but the customer wants {level.target} qubits, and you have {qubits}.</Banner>}
          <button className="btn btn-mint" disabled={!ok || !reached} onClick={lockIn}><span>Install this design</span></button>
        </>
      )}

      {done !== null && (
        <>
          <Banner tone="good" title="COLD ENOUGH!">
            {starWords(done)} The {limit.stage.name} is the fullest stage, at {Math.round(limit.fill * 100)}%. Wiring, not the chip, is what the cold stages run out of first.
          </Banner>
          <NextButton isLast={isLast} onNext={onNext} />
        </>
      )}
    </>
  );
};

export const CoolDown: React.FC = () => {
  const r = useLevelRun('cool_down', LEVELS.length);
  if (r.finished) {
    return (
      <FinishPanel theme={THEME} title="FRIDGE FULL" total={r.total} levelCount={LEVELS.length}
        summary="You found which stage ran out of cooling first and chose wiring to relieve it, from a small lab fridge up to a thousand qubits."
        honest="All of the cooling powers and heat loads here are round, illustrative numbers of the right order of magnitude, not figures for any product. Cooling and wiring are one of the scaling challenges, not the only one: control electronics, calibration and error correction matter just as much."
        onAgain={r.again} />
    );
  }
  const level = LEVELS[r.levelIdx];
  return (
    <LevelFrame theme={THEME} tag="Simplified model" label="FRIDGE" levelIdx={r.levelIdx} levelCount={LEVELS.length} total={r.total} title={level.title} story={level.story}>
      <Level key={`${r.round}-${level.id}`} level={level} index={r.levelIdx} isLast={r.isLast} onClear={r.clear} onNext={r.next} />
    </LevelFrame>
  );
};
