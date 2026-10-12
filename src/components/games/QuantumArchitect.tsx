import React, { useState } from 'react';
import { useActivityReport } from '../../hooks/useActivityReport';
import { Banner, Eyebrow } from '../shared/Arcade';
import { THEMES, panelStyle } from '../shared/arcadeTheme';
import { FinishPanel, LevelFrame, NextButton, Stars } from '../shared/LevelKit';
import { starWords, useLevelRun } from '../shared/levelRun';
import type { StarCount } from '../shared/levelRun';
import { sound } from '../../utils/audio';
import { BRIEFS, CRITERIA, MODALITIES, assess, choose, modalityById, reasonsFor, stars as starsFor } from '../../core/games/architect';
import type { Brief } from '../../core/games/architect';
import type { ModalityId } from '../../content/hardwareData';

const THEME = THEMES.yellow;
const pips = (n: number) => '●'.repeat(n) + '○'.repeat(3 - n);

const Level: React.FC<{
  brief: Brief; index: number; isLast: boolean; onClear: (s: StarCount) => void; onNext: () => void;
}> = ({ brief, index, isLast, onClear, onNext }) => {
  const [picked, setPicked] = useState<ModalityId | null>(null);
  const [reason, setReason] = useState<number | null>(null);
  const [earned, setEarned] = useState<StarCount | null>(null);
  const [wrongs, setWrongs] = useState(0);

  const scored = picked ? choose(brief, picked) : null;
  const options = picked ? reasonsFor(brief, picked).options : [];
  const closest = assess(brief).filter((s) => s.reasonable).map((s) => s.modality.name);

  const choosePick = (id: ModalityId) => {
    if (earned !== null) return;
    sound.playClick();
    setPicked(id);
    setReason(null);
    setWrongs(0);
  };

  const defend = (i: number) => {
    if (!picked || earned !== null) return;
    setReason(i);
    if (!options[i].true) {
      // a false reason is not accepted: try again, and the third star is gone
      sound.playAlarm();
      setWrongs((n) => n + 1);
      return;
    }
    const s = starsFor(brief, picked, wrongs === 0) as StarCount;
    sound.playSuccess();
    setEarned(s);
    onClear(s);
  };

  useActivityReport({
    id: 'quantum_architect',
    status: 'playing',
    step: `Brief ${index + 1} of ${BRIEFS.length}: ${brief.title}`,
    mission: `${brief.client} says: "${brief.text}" Choose a kind of machine, then defend the choice with the right reason.`,
    state: picked
      ? `Chosen: ${modalityById(picked).name}. ${scored && !scored.eligible ? 'It cannot run general circuits, which this brief needs.' : reason === null ? 'Now picking a reason.' : options[reason].true ? 'The reason chosen was true.' : 'The reason chosen was not true of this machine.'}`
      : 'No machine chosen yet.',
    hint: 'Ask what the client cares about most, then which kind of machine is strong at exactly that. A true reason names a real strength of the machine you chose.',
  });

  return (
    <>
      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Eyebrow>{brief.client.toUpperCase()}</Eyebrow>
        <p style={{ fontSize: '0.98rem', lineHeight: 1.5 }}>“{brief.text}”</p>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          What matters most: {CRITERIA.filter((c) => brief.weights[c.id] >= 2).map((c) => c.name).join(', ') || 'not much, apart from the task itself'}.
        </div>
      </div>

      <div>
        <Eyebrow>CHOOSE A KIND OF MACHINE</Eyebrow>
        <div role="group" aria-label="Machines" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 6 }}>
          {MODALITIES.map((m) => (
            <button key={m.id} className="chip" aria-pressed={picked === m.id} disabled={earned !== null} onClick={() => choosePick(m.id)}
              style={{ minHeight: 52, justifyContent: 'center', whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.25, fontSize: '0.56rem' }}>
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {picked && scored && (
        <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Eyebrow>{modalityById(picked).name.toUpperCase()}: THE LESSONS' SUMMARY</Eyebrow>
          {CRITERIA.map((c) => {
            const rating = modalityById(picked).ratings[c.id];
            return (
              <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '112px 1fr', gap: 8, fontSize: '0.82rem', lineHeight: 1.35 }}>
                <span style={{ fontWeight: 800 }}>
                  {c.name}<br />
                  <span aria-label={`${rating.value} of 3`} style={{ letterSpacing: 2, color: THEME.accent }}>{pips(rating.value)}</span>
                  {brief.weights[c.id] >= 2 ? <span style={{ color: 'var(--text-secondary)' }}> ★ matters</span> : null}
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>{rating.why}</span>
              </div>
            );
          })}
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            These are qualitative, typical ratings from the lessons, not measurements. The Comparison Dashboard has real figures with sources.
          </div>
        </div>
      )}

      {picked && scored && !scored.eligible && (
        <Banner tone="bad" title="THAT MACHINE CANNOT DO THIS JOB">
          This brief needs a machine that runs general quantum circuits, and an annealer only solves optimisation problems. Choose another.
        </Banner>
      )}

      {picked && scored && scored.eligible && earned === null && (
        <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Eyebrow>NOW DEFEND IT: WHICH OF THESE IS TRUE?</Eyebrow>
          {options.map((o, i) => (
            <button key={i} className="chip" onClick={() => defend(i)} aria-pressed={reason === i}
              style={{ minHeight: 56, whiteSpace: 'normal', textAlign: 'left', justifyContent: 'flex-start', lineHeight: 1.35, fontSize: '0.78rem', fontFamily: 'var(--font-family)', fontWeight: 700, padding: '10px 12px' }}>
              {o.text}
            </button>
          ))}
          {reason !== null && !options[reason].true && (
            <Banner tone="bad" title="NOT QUITE">The lessons say the opposite of that for this kind of machine. Try another sentence.</Banner>
          )}
        </div>
      )}

      {earned !== null && picked && scored && (
        <>
          <Banner tone="good" title={scored.reasonable ? 'A SOUND CHOICE' : 'POSSIBLE, BUT NOT THE CLOSEST FIT'}>
            <div style={{ marginBottom: 6 }}><Stars n={earned} /> {starWords(earned)}</div>
            {brief.lesson}
            <div style={{ marginTop: 6 }}>
              On these ratings the closest fit{closest.length === 1 ? ' is' : 's are'}: {closest.join(', ')}. A different weighting could change that: there is no single best machine.
            </div>
          </Banner>
          <NextButton isLast={isLast} onNext={onNext} label="Next brief" />
        </>
      )}
    </>
  );
};

export const QuantumArchitect: React.FC = () => {
  const r = useLevelRun('quantum_architect', BRIEFS.length);
  if (r.finished) {
    return (
      <FinishPanel theme={THEME} title="ARCHITECT'S REPORT" total={r.total} levelCount={BRIEFS.length}
        summary="You matched five clients to kinds of quantum machine and defended each choice, and saw that the honest answer is sometimes an annealer and sometimes 'several'."
        honest="The ratings are qualitative summaries of the Part 2 lessons, not measurements, and real projects weigh cost, schedule and vendors too. The point is the habit: ask what the job needs, then which trade-offs a machine makes, and distrust anyone who says there is one best machine."
        onAgain={r.again} />
    );
  }
  const brief = BRIEFS[r.levelIdx];
  return (
    <LevelFrame theme={THEME} tag="Simplified model" label="BRIEF" levelIdx={r.levelIdx} levelCount={BRIEFS.length} total={r.total} title={brief.title} story={`A client has a problem. ${brief.client} needs a machine.`}>
      <Level key={`${r.round}-${brief.id}`} brief={brief} index={r.levelIdx} isLast={r.isLast} onClear={r.clear} onNext={r.next} />
    </LevelFrame>
  );
};
