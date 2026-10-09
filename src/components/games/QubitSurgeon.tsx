import React, { useMemo, useState } from 'react';
import { Check, ChevronRight, Eye, Lightbulb, RotateCcw, Scissors, Star, Stethoscope, Zap } from 'lucide-react';
import { useProgress } from '../../hooks/useProgress';
import { ArcadeFrame, ArcadeHeader, Banner, Eyebrow, GameTitle } from '../shared/Arcade';
import { RETRO, THEMES, panelStyle, rowChip } from '../shared/arcadeTheme';
import { sound } from '../../utils/audio';
import { LEVELS, gradePatient, gradePeek, makePatients, readingsOf, summariseLevel } from '../../core/games/qubitSurgeon';
import type { PatientResult } from '../../core/games/qubitSurgeon';
import { PROBES, diagnose, logicalErrorRate, parityOf } from '../../core/labs/errorCorrection';
import type { Fix, ProbeId } from '../../core/labs/errorCorrection';
import { pct } from '../simulations/labUtils';

const THEME = THEMES.pink;
const qubitName = (q: number) => `Q${q + 1}`;
const times = (n: number) => `${n} time${n === 1 ? '' : 's'}`;
const probeLabel = (id: ProbeId) => `${qubitName(PROBES[id][0])} and ${qubitName(PROBES[id][1])}`;

type Step = 'probing' | 'done';

export const QubitSurgeon: React.FC = () => {
  const { completeGame } = useProgress();
  const [levelIdx, setLevelIdx] = useState(0);
  const [replay, setReplay] = useState(0);
  const [patientIdx, setPatientIdx] = useState(0);
  const [used, setUsed] = useState<ProbeId[]>([]);
  const [step, setStep] = useState<Step>('probing');
  const [result, setResult] = useState<PatientResult | null>(null);
  const [peeked, setPeeked] = useState(false);
  const [fixed, setFixed] = useState<Fix | undefined>(undefined);
  const [results, setResults] = useState<PatientResult[]>([]);
  const [levelStars, setLevelStars] = useState<Record<number, number>>({});
  const [showHint, setShowHint] = useState(false);
  const [levelDone, setLevelDone] = useState(false);
  const [finished, setFinished] = useState(false);

  const level = LEVELS[levelIdx];
  const patients = useMemo(() => makePatients(level, replay), [level, replay]);
  const patient = patients[patientIdx];
  const readings = readingsOf(patient.flips, used);
  const diagnosis = diagnose(readings);
  const totalStars = Object.values(levelStars).reduce((a, b) => a + b, 0);
  const closed = step === 'done';

  const probe = (id: ProbeId) => {
    if (closed || used.includes(id)) return;
    sound.playClick();
    setUsed((u) => [...u, id]);
  };

  const decide = (fix: Fix) => {
    if (closed) return;
    const r = gradePatient(patient, fix, used);
    setFixed(fix);
    setResult(r);
    setStep('done');
    if (r.saved) sound.playSuccess();
    else sound.playAlarm();
  };

  const peek = () => {
    if (closed) return;
    setPeeked(true);
    setResult(gradePeek(patient, used));
    setFixed(undefined);
    setStep('done');
    sound.playAlarm();
  };

  const resetPatient = () => {
    setUsed([]);
    setStep('probing');
    setResult(null);
    setPeeked(false);
    setFixed(undefined);
    setShowHint(false);
  };

  const nextPatient = () => {
    sound.playClick();
    const all = result ? [...results, result] : results;
    setResults(all);
    resetPatient();
    if (patientIdx + 1 >= patients.length) {
      const summary = summariseLevel(patients, all);
      if (summary.cleared) setLevelStars((s) => ({ ...s, [level.id]: Math.max(s[level.id] ?? 0, summary.stars) }));
      setLevelDone(true);
    } else {
      setPatientIdx(patientIdx + 1);
    }
  };

  const startLevel = (idx: number, again: boolean) => {
    resetPatient();
    setResults([]);
    setPatientIdx(0);
    setLevelDone(false);
    setReplay(again ? replay + 1 : 0);
    setLevelIdx(idx);
  };

  const nextLevel = () => {
    sound.playClick();
    if (levelIdx + 1 >= LEVELS.length) {
      setFinished(true);
      completeGame('qubit_surgeon', 'concept_error_correction');
    } else {
      startLevel(levelIdx + 1, false);
    }
  };

  const restartAll = () => {
    setLevelStars({});
    setFinished(false);
    startLevel(0, false);
  };

  if (finished) {
    return (
      <ArcadeFrame theme={THEME}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          <div style={{ fontSize: '2.6rem' }}>🩺</div>
          <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.9rem', color: THEME.accent, lineHeight: 1.6 }}>SURGERY COMPLETE!</h2>
          <div style={{ fontFamily: RETRO, fontSize: '2rem', color: '#ffd23f' }}>★ {totalStars} / {LEVELS.length * 3}</div>
          <p style={{ fontSize: '0.92rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
            You found errors without ever reading the data: you only compared qubits. That is the heart of error correction. Real machines use bigger codes that also catch phase flips, and they need many physical qubits for one reliable logical qubit. Open the <b style={{ color: '#fff' }}>Noise Lab</b> to see how fast the failure rate falls.
          </p>
          <button className="btn btn-pink" onClick={restartAll}><RotateCcw size={18} /> <span>Operate again</span></button>
        </div>
      </ArcadeFrame>
    );
  }

  if (levelDone) {
    const summary = summariseLevel(patients, results);
    const noise = level.noise;
    const p = noise.kind === 'independent' ? noise.p : null;
    return (
      <ArcadeFrame theme={THEME}>
        <ArcadeHeader theme={THEME} label={`LEVEL ${level.id}/${LEVELS.length}`} tag="Simplified model"
          middle={<span style={{ fontFamily: RETRO, fontSize: '1.4rem', color: '#ffd23f' }}>★ {totalStars}</span>} />
        <Banner tone={summary.cleared ? 'good' : 'bad'} title={summary.cleared ? 'WARD CLEARED!' : 'TOO MANY WRONG FIXES'} center>
          <div aria-label={`${summary.stars} of 3 stars`} style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 8 }}>
            {[1, 2, 3].map((s) => <Star key={s} size={28} color="#ffd23f" fill={s <= summary.stars ? '#ffd23f' : 'none'} />)}
          </div>
          <div style={{ marginBottom: 8 }}>
            Patients saved: <b>{patients.length - summary.lost} of {patients.length}</b>.
            {summary.unavoidable > 0 && ` ${summary.unavoidable} could not be saved by anyone: two qubits flipped at once.`}
            {summary.wrong > 0 && ` Wrong fixes: ${summary.wrong}.`}
            {summary.lucky > 0 && ` Lucky guesses: ${summary.lucky} (two probes prove it).`}
            {summary.extraProbes > 0 && ` Spare probes used: ${summary.extraProbes}.`}
          </div>
          <div style={{ marginBottom: 10 }}><b>The lesson:</b> {level.lesson}</div>
          {p !== null && (
            <div style={{ marginBottom: 10, fontSize: '0.84rem' }}>
              In this ward a bare, unprotected qubit would have been lost {times(summary.bareLost)}, and your protected ones {times(summary.lost)}.
              With {pct(p)} noise per qubit the long-run chances are {pct(p)} against {pct(logicalErrorRate(p, 3), 1)}. A ward this small is mostly luck, which is why the Noise Lab runs thousands.
            </div>
          )}
          {summary.cleared ? (
            <button className="btn btn-pink" onClick={nextLevel}>
              <span>{levelIdx + 1 >= LEVELS.length ? 'Finish' : 'Next level'}</span>
              <ChevronRight size={18} />
            </button>
          ) : (
            <button className="btn btn-pink" onClick={() => startLevel(levelIdx, true)}><RotateCcw size={18} /> <span>Try a new ward</span></button>
          )}
          {summary.cleared && summary.stars < 3 && (
            <button className="chip" onClick={() => startLevel(levelIdx, true)} style={{ marginTop: 8 }}><RotateCcw size={16} /> Replay for more stars</button>
          )}
        </Banner>
      </ArcadeFrame>
    );
  }

  const flippedNow = (q: number) => closed && patient.flips[q];
  const hits = patient.flips.filter(Boolean).length;
  // bad luck only if the player did everything right; a wrong fix on a double fault is still a wrong fix
  const badLuck = result !== null && !result.saved && result.unavoidable && result.grade !== 'wrong';
  let title = '';
  let message = '';
  if (result) {
    if (peeked) {
      title = 'YOU LOOKED AT THE DATA';
      message = 'Measuring a data qubit forces it to be a plain 0 or 1, and the superposition it carried is gone. That is why the probes only compare qubits. The patient is lost.';
    } else if (result.saved) {
      title = 'PATIENT SAVED';
      message = hits === 0
        ? 'Nothing had flipped, and you correctly left the patient alone.'
        : `${qubitName(patient.flips.indexOf(true))} had flipped and you flipped it back. The qubit is as good as new, and you never looked at what it held.`;
    } else if (badLuck) {
      title = 'BAD LUCK: DOUBLE FAULT';
      message = 'Two or more qubits flipped. The probes point at one qubit, so the "repair" flips the wrong one and the whole qubit ends up flipped. The code can only undo one flip at a time. You did everything right.';
    } else if (hits === 0) {
      title = 'NO NEED TO OPERATE';
      message = `${qubitName(fixed as number)} was healthy. Flipping it created an error.`;
    } else if (hits === 1) {
      title = fixed === null ? 'MISSED AN ERROR' : 'WRONG QUBIT';
      message = fixed === null
        ? `${qubitName(patient.flips.indexOf(true))} had flipped and was left damaged.`
        : `The flipped qubit was ${qubitName(patient.flips.indexOf(true))}, not ${qubitName(fixed as number)}.`;
    } else {
      title = 'TOO MANY FLIPS';
      message = 'Two or more qubits had flipped, and no single fix can undo that. The code only protects against one flip at a time.';
    }
    if (!peeked && result.grade === 'lucky') message += ' (Right fix, but with so few probes it was a guess: two different probes prove it.)';
  }
  const hint = level.probes.length > 2
    ? 'Two different probes always tell you the answer. The third just repeats what they say. If every pair agrees, leave the patient alone.'
    : 'Probe A compares Q1 with Q2 and probe B compares Q2 with Q3. If A says "differ" and B says "agree", Q1 flipped. Both "differ": Q2. Only B: Q3. Neither: nothing flipped.';

  return (
    <ArcadeFrame theme={THEME}>
      <ArcadeHeader theme={THEME} label={`PATIENT ${patientIdx + 1}/${patients.length}`} tag="Simplified model"
        middle={<span style={{ fontFamily: RETRO, fontSize: '1.4rem', color: '#ffd23f' }}>★ {totalStars}</span>} />
      <GameTitle title={`Level ${level.id}: ${level.title}`} story={level.story} />

      <Banner tone="info" title="THE RULE">
        One qubit is spread over three data qubits. Noise may have <b>flipped</b> some of them (0 becomes 1 and back). You may <b>compare</b> two qubits with a probe, which never reads their values, then flip one back. Reading a qubit directly would ruin it.
      </Banner>

      <div style={panelStyle}>
        <Eyebrow>THE PATIENT: THREE DATA QUBITS</Eyebrow>
        <div style={{ display: 'flex', justifyContent: 'space-around', gap: 8, marginTop: 10 }}>
          {[0, 1, 2].map((q) => (
            <div key={q} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 84 }}>
              <div aria-hidden="true" style={{
                width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: RETRO, fontSize: '1.7rem',
                background: flippedNow(q) ? 'rgba(255,92,138,0.9)' : 'rgba(255,255,255,0.1)',
                border: `3px ${closed ? 'solid' : 'dashed'} ${flippedNow(q) ? '#fff' : 'rgba(255,255,255,0.45)'}`,
                color: flippedNow(q) ? '#2a0f5c' : '#fff',
              }}>{closed ? (flippedNow(q) ? '⚡' : '✓') : '?'}</div>
              <span style={{ fontFamily: RETRO, fontSize: '1.2rem' }}>{qubitName(q)}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, textAlign: 'center' }}>
                {closed ? (flippedNow(q) ? 'was flipped' : 'was fine') : 'hidden'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Eyebrow>PROBES (THEY COMPARE, THEY NEVER READ)</Eyebrow>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {level.probes.map((id) => {
            const done = used.includes(id);
            const differ = parityOf(patient.flips, id) === 1;
            return (
              <button key={id} className="chip" onClick={() => probe(id)} disabled={done || closed}
                aria-label={`Probe ${id}: compare ${probeLabel(id)}${done ? (differ ? '. Result: they differ' : '. Result: they agree') : ''}`}
                style={{ justifyContent: 'space-between', minHeight: 48, fontSize: '0.6rem', opacity: closed && !done ? 0.5 : 1 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Stethoscope size={16} /> Probe {id}: {probeLabel(id)}</span>
                {done && (
                  <span style={{ fontFamily: RETRO, fontSize: '1.2rem', color: differ ? '#ff5c8a' : '#2ee6a6' }}>
                    {differ ? '✘ differ' : '✔ agree'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div style={{ fontFamily: RETRO, fontSize: '1.15rem' }}>probes used: {used.length}{level.probes.length > 2 ? ' · two are always enough' : ''}</div>
      </div>

      <div style={panelStyle}>
        <Eyebrow>WHAT YOU CAN PROVE SO FAR</Eyebrow>
        <p style={{ fontSize: '0.9rem', lineHeight: 1.5, marginTop: 6, fontWeight: 700, color: diagnosis === 'unknown' ? '#f1eaff' : '#2ee6a6' }}>
          {diagnosis === 'unknown' && (used.length === 0 ? 'Nothing yet. Try a probe.' : 'Not yet. One probe cannot say which qubit it was: try a second, different one.')}
          {diagnosis === null && 'Every comparison agrees, so no single qubit flipped. Leave this patient alone.'}
          {typeof diagnosis === 'number' && `${qubitName(diagnosis)} is the odd one out. Flip ${qubitName(diagnosis)} back.`}
        </p>
      </div>

      {!closed && (
        <>
          <Eyebrow>YOUR OPERATION</Eyebrow>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[0, 1, 2].map((q) => (
              <button key={q} className="btn btn-pink" onClick={() => decide(q as Fix)} style={{ minHeight: 52 }}><Zap size={16} /> <span>Flip {qubitName(q)}</span></button>
            ))}
            <button className="btn btn-mint" onClick={() => decide(null)} style={{ minHeight: 52 }}><Check size={16} /> <span>Leave alone</span></button>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="chip" onClick={() => setShowHint((v) => !v)} aria-expanded={showHint} style={rowChip}><Lightbulb size={16} /> Hint</button>
            <button className="chip" onClick={peek} style={rowChip} aria-label="Measure a data qubit directly to see its value (a bad idea)"><Eye size={16} /> Look directly</button>
          </div>
          {showHint && <Banner tone="warn">💡 {hint}</Banner>}
        </>
      )}

      {closed && result && (
        <Banner
          tone={result.saved ? 'good' : badLuck ? 'warn' : 'bad'}
          title={title}
          icon={peeked ? <Scissors size={18} /> : undefined}
          center
        >
          <div style={{ marginBottom: 8 }}>{message}</div>
          <button className="btn btn-pink" onClick={nextPatient}>
            <span>{patientIdx + 1 >= patients.length ? 'Finish the ward' : 'Next patient'}</span>
            <ChevronRight size={18} />
          </button>
        </Banner>
      )}

    </ArcadeFrame>
  );
};
