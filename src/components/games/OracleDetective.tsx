import React, { useMemo, useState } from 'react';
import { RotateCcw, Lightbulb, Star, ChevronRight, Lock, Sun, Moon, Sparkles } from 'lucide-react';
import { useProgress } from '../../hooks/useProgress';
import { ArcadeFrame, ArcadeHeader, Banner, Eyebrow, GameTitle } from '../shared/Arcade';
import { PIXEL, RETRO, THEMES, panelStyle, rowChip } from '../shared/arcadeTheme';
import { sound } from '../../utils/audio';
import { CASES, askInformant, classicalCertainty, makeOracle, scoreCase } from '../../core/games/oracleDetective';
import type { InformantReport, Outcome, Truth } from '../../core/games/oracleDetective';
import { classicalWorstCase } from '../../core/labs/deutschJozsa';
import type { Bit } from '../../core/labs/deutschJozsa';

const THEME = THEMES.mint;
const bitsOf = (x: number, n: number) => x.toString(2).padStart(n, '0');

export const OracleDetective: React.FC = () => {
  const { completeGame } = useProgress();
  const [caseIdx, setCaseIdx] = useState(0);
  const [replay, setReplay] = useState(0);
  const [seen, setSeen] = useState<Record<number, Bit>>({});
  const [reports, setReports] = useState<InformantReport[]>([]);
  const [accused, setAccused] = useState<Truth | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [stars, setStars] = useState<Record<number, number>>({});
  const [showHow, setShowHow] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [finished, setFinished] = useState(false);

  const file = CASES[caseIdx];
  const n = file.n;
  // A reopened file is a new function, and it flips between constant and balanced so the answer cannot be memorised
  const truth: Truth = replay % 2 === 0 ? file.truth : file.truth === 'constant' ? 'balanced' : 'constant';
  const oracle = useMemo(() => makeOracle(n, truth, file.seed + replay * 1000), [n, truth, file.seed, replay]);
  const opened = Object.keys(seen).length;
  const queries = opened + reports.length;
  const certain = classicalCertainty(n, seen);
  const informantVerdict = reports.length ? reports[reports.length - 1].verdict : null;
  const known: Truth | null = informantVerdict ?? certain;
  const totalStars = Object.values(stars).reduce((a, b) => a + b, 0);
  const closed = accused !== null;

  const open = (x: number) => {
    if (closed || x in seen) return;
    sound.playClick();
    setSeen((s) => ({ ...s, [x]: oracle[x] }));
  };

  const ask = () => {
    if (closed) return;
    sound.playLaser();
    setReports((r) => [...r, askInformant(oracle, n)]);
  };

  const accuse = (verdict: Truth) => {
    if (closed) return;
    const result = scoreCase(verdict, truth, known === verdict, queries);
    setAccused(verdict);
    setOutcome(result);
    if (result.correct) {
      sound.playSuccess();
      setStars((s) => ({ ...s, [file.id]: Math.max(s[file.id] ?? 0, result.stars) }));
    } else {
      sound.playAlarm();
    }
  };

  const clearCase = () => {
    setSeen({});
    setReports([]);
    setAccused(null);
    setOutcome(null);
    setShowHint(false);
    setShowHow(false);
  };

  const retry = () => { clearCase(); setReplay((r) => r + 1); };

  const next = () => {
    sound.playClick();
    clearCase();
    setReplay(0);
    if (caseIdx + 1 >= CASES.length) {
      setFinished(true);
      completeGame('oracle_detective', 'concept_algorithms');
    } else {
      setCaseIdx(caseIdx + 1);
    }
  };

  const restartAll = () => { clearCase(); setReplay(0); setStars({}); setCaseIdx(0); setFinished(false); };

  if (finished) {
    return (
      <ArcadeFrame theme={THEME}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          <div style={{ fontSize: '2.6rem' }}>🕵️</div>
          <h2 style={{ fontFamily: PIXEL, fontSize: '0.9rem', color: THEME.accent, lineHeight: 1.6 }}>ALL CASES CLOSED!</h2>
          <div style={{ fontFamily: RETRO, fontSize: '2rem', color: '#ffd23f' }}>★ {totalStars} / {CASES.length * 3}</div>
          <p style={{ fontSize: '0.92rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
            Classically you had to open more than half the lockers to be certain. The quantum informant asked <b style={{ color: '#fff' }}>once</b>: she put every locker in superposition, let the answers interfere, and read the result. Constant functions add up to all zeros, balanced ones cancel it. It is a small, honest example of interference beating brute force, though no one needs this exact problem solved.
          </p>
          <button className="btn btn-mint" onClick={restartAll}><RotateCcw size={18} /> <span>Reopen the files</span></button>
        </div>
      </ArcadeFrame>
    );
  }

  return (
    <ArcadeFrame theme={THEME}>
      <ArcadeHeader theme={THEME} label={`CASE ${file.id}/${CASES.length}`} tag="Accurate"
        middle={<span style={{ fontFamily: RETRO, fontSize: '1.4rem', color: '#ffd23f' }}>★ {totalStars}</span>} />

      <GameTitle title={file.title} story={file.story} />

      <Banner tone="info" title="THE RULE">
        The hidden function is either <b>constant</b> (every locker the same) or <b>balanced</b> (exactly half on, half off). Decide which.
      </Banner>

      <div style={panelStyle}>
        <Eyebrow>{1 << n} LOCKERS, INDEXED BY {n} BITS: TAP TO OPEN</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(4, 1fr)`, gap: 8, marginTop: 8 }}>
          {Array.from({ length: 1 << n }, (_, x) => {
            const isOpen = x in seen;
            const value = seen[x];
            return (
              <button key={x} onClick={() => open(x)} disabled={closed && !isOpen} aria-label={`Locker ${bitsOf(x, n)}${isOpen ? `: light ${value ? 'on' : 'off'}` : ': closed'}`}
                style={{
                  minHeight: 64, borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                  background: isOpen ? (value ? 'rgba(255,210,63,0.9)' : 'rgba(0,0,0,0.4)') : 'rgba(255,255,255,0.08)',
                  color: isOpen && value ? '#2a0f5c' : '#fff',
                  border: `2px ${isOpen ? 'solid' : 'dashed'} ${isOpen ? (value ? '#ffd23f' : '#6a4ec2') : 'rgba(255,255,255,0.3)'}`,
                }}>
                <span style={{ fontFamily: RETRO, fontSize: '1rem', opacity: 0.85 }}>{bitsOf(x, n)}</span>
                {isOpen
                  ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: RETRO, fontSize: '1.5rem', lineHeight: 1 }}>{value ? <Sun size={18} /> : <Moon size={18} />} {value}</span>
                  : <Lock size={18} />}
              </button>
            );
          })}
        </div>
        <div style={{ fontFamily: RETRO, fontSize: '1.2rem', marginTop: 8 }}>
          lockers opened: {opened} · quantum questions: {reports.length}
        </div>
      </div>

      <div style={panelStyle}>
        <Eyebrow>WHAT YOU CAN PROVE SO FAR</Eyebrow>
        <p style={{ fontSize: '0.9rem', lineHeight: 1.5, marginTop: 6, color: known ? '#2ee6a6' : '#f1eaff', fontWeight: 700 }}>
          {known === 'balanced' && (reports.length ? 'Proven by the informant: BALANCED.' : 'Proven: two lockers disagree, so it is BALANCED.')}
          {known === 'constant' && (reports.length ? 'Proven by the informant: CONSTANT.' : `Proven: more than half the lockers (${opened} of ${1 << n}) agree, so it is CONSTANT.`)}
          {known === null && (opened === 0 ? 'Nothing yet.' : `Not yet. All ${opened} opened agree, but a balanced file could still look like that until more than half (${1 << (n - 1)}) are open.`)}
        </p>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          Classically you may need {classicalWorstCase(n)} lockers to be certain.
        </div>
      </div>

      {file.informant ? (
        <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Eyebrow color="#ffd23f">THE QUANTUM INFORMANT</Eyebrow>
          <button className="btn btn-mint" onClick={ask} disabled={closed}><Sparkles size={18} /> <span>Ask once (counts as 1 question)</span></button>
          {reports.length > 0 && (
            <div style={{ fontFamily: RETRO, fontSize: '1.3rem' }}>
              readout {bitsOf(reports[reports.length - 1].readout, n)} → {reports[reports.length - 1].readout === 0 ? 'all zeros: constant' : 'not all zeros: balanced'}
            </div>
          )}
          <button className="chip" aria-expanded={showHow} onClick={() => setShowHow((v) => !v)} style={{ alignSelf: 'flex-start' }}>
            {showHow ? 'Hide how she does it' : 'How does she do it?'}
          </button>
          {showHow && (
            <div style={{ fontSize: '0.86rem', lineHeight: 1.5, color: '#f1eaff' }}>
              She puts the {n} input qubits into superposition of every locker number at once, asks the oracle a single time, and applies Hadamards again. Each locker's answer becomes a + or − sign. If every locker is the same, the signs agree and everything lands on 0…0. If half are on, the signs cancel exactly and 0…0 never comes up. (Try the Deutsch–Jozsa Explorer lab to see the signs.)
            </div>
          )}
        </div>
      ) : (
        <div style={{ ...panelStyle, fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
          🛰️ The quantum informant is out of town. This one has to be solved locker by locker.
        </div>
      )}

      {!closed && (
        <>
          <Eyebrow>YOUR VERDICT</Eyebrow>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" style={{ flex: 1 }} onClick={() => accuse('constant')}><span>CONSTANT</span></button>
            <button className="btn btn-violet" style={{ flex: 1 }} onClick={() => accuse('balanced')}><span>BALANCED</span></button>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="chip" onClick={() => setShowHint((v) => !v)} aria-expanded={showHint} style={rowChip}><Lightbulb size={16} /> Hint</button>
            <button className="chip" onClick={retry} style={rowChip}><RotateCcw size={16} /> New file</button>
          </div>
          {showHint && (
            <Banner tone="warn">
              💡 {file.informant
                ? 'Open lockers cost one question each, and so does the informant. Guessing without proof earns only one star.'
                : `Two lockers that disagree prove "balanced". To prove "constant" you must open more than half (${(1 << (n - 1)) + 1}).`}
            </Banner>
          )}
        </>
      )}

      {outcome && outcome.correct && (
        <Banner tone="good" title={outcome.proven ? 'CASE CLOSED!' : 'LUCKY GUESS'} center>
          <div aria-label={`${outcome.stars} of 3 stars`} style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 8 }}>
            {[1, 2, 3].map((s) => <Star key={s} size={28} color="#ffd23f" fill={s <= outcome.stars ? '#ffd23f' : 'none'} />)}
          </div>
          <div style={{ marginBottom: 10 }}>
            {outcome.proven
              ? `Proven with ${queries} question${queries === 1 ? '' : 's'}. A classical detective could need ${classicalWorstCase(n)}.`
              : 'You were right, but the evidence did not prove it. A real detective needs proof.'}
          </div>
          <button className="btn btn-mint" onClick={next}>
            <span>{caseIdx + 1 >= CASES.length ? 'Finish' : 'Next case'}</span>
            <ChevronRight size={18} />
          </button>
        </Banner>
      )}
      {outcome && !outcome.correct && (
        <Banner tone="bad" title="WRONG ACCUSATION" center>
          <div style={{ marginBottom: 10 }}>
            The file was {truth.toUpperCase()}. {known ? '' : 'You had no proof either way. '}Open more evidence next time, or ask the informant.
          </div>
          <button className="btn btn-pink" onClick={retry}><RotateCcw size={18} /> <span>Reopen with a new file</span></button>
        </Banner>
      )}
    </ArcadeFrame>
  );
};
