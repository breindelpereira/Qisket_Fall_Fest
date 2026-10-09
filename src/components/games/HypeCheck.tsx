import React, { useState } from 'react';
import { Ban, CheckCircle2, ChevronRight, Hourglass, RotateCcw, Star, XCircle } from 'lucide-react';
import { useProgress } from '../../hooks/useProgress';
import { ArcadeFrame, ArcadeHeader, Banner, Eyebrow, GameTitle } from '../shared/Arcade';
import { PIXEL, RETRO, THEMES, panelStyle } from '../shared/arcadeTheme';
import { sound } from '../../utils/audio';
import { BINS, PASS_MARK, ROUND_SIZE, dealRound, judge, summariseRound } from '../../core/games/hypeCheck';
import type { Bin } from '../../core/games/hypeCheck';

const THEME = THEMES.yellow;

/** An icon and a word for each bin, so the choice never depends on colour alone. */
const BIN_LOOK: Record<Bin, { icon: React.ReactNode; btn: string }> = {
  real: { icon: <CheckCircle2 size={20} />, btn: 'btn-mint' },
  someday: { icon: <Hourglass size={20} />, btn: 'btn-orange' },
  hype: { icon: <Ban size={20} />, btn: 'btn-pink' },
};

const labelOf = (bin: Bin) => BINS.find((b) => b.id === bin)!.label;

export const HypeCheck: React.FC = () => {
  const { completeGame } = useProgress();
  const [round, setRound] = useState(0);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [choice, setChoice] = useState<Bin | null>(null);
  const [finished, setFinished] = useState(false);

  const cards = dealRound(round + 1);
  const card = cards[index];
  const verdict = choice ? judge(card, choice) : null;
  const score = answers.filter(Boolean).length;

  const pick = (bin: Bin) => {
    if (choice) return;
    const result = judge(card, bin);
    setChoice(bin);
    setAnswers((a) => [...a, result.correct]);
    if (result.correct) sound.playSuccess();
    else sound.playAlarm();
  };

  const next = () => {
    sound.playClick();
    if (index + 1 >= ROUND_SIZE) {
      setFinished(true);
      if (summariseRound(answers).cleared) completeGame('hype_check', 'concept_why_quantum');
      return;
    }
    setIndex(index + 1);
    setChoice(null);
  };

  const again = () => {
    setRound((r) => r + 1);
    setIndex(0);
    setAnswers([]);
    setChoice(null);
    setFinished(false);
  };

  if (finished) {
    const summary = summariseRound(answers);
    return (
      <ArcadeFrame theme={THEME}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          <div style={{ fontSize: '2.6rem' }}>🧐</div>
          <h2 style={{ fontFamily: PIXEL, fontSize: '0.9rem', color: THEME.accent, lineHeight: 1.6 }}>
            {summary.cleared ? 'HYPE CHECK PASSED!' : 'NOT QUITE YET'}
          </h2>
          <div style={{ fontFamily: RETRO, fontSize: '2rem', color: '#ffd23f' }}>{summary.correct} / {summary.total}</div>
          <div aria-label={`${summary.stars} of 3 stars`} style={{ display: 'flex', gap: 6 }}>
            {[1, 2, 3].map((s) => <Star key={s} size={28} color="#ffd23f" fill={s <= summary.stars ? '#ffd23f' : 'none'} />)}
          </div>
          <p style={{ fontSize: '0.92rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
            {summary.cleared
              ? 'Quantum computers are real and promising, but they are specialist tools, not magic and not faster laptops. Now you can spot the myths.'
              : `You need ${PASS_MARK} right to pass. Each card told you why, so try a new set.`}
          </p>
          <button className="btn" onClick={again}><RotateCcw size={18} /> <span>New cards</span></button>
        </div>
      </ArcadeFrame>
    );
  }

  return (
    <ArcadeFrame theme={THEME}>
      <ArcadeHeader theme={THEME} label={`CARD ${index + 1}/${ROUND_SIZE}`} tag="Simplified model"
        middle={<span style={{ fontFamily: RETRO, fontSize: '1.4rem', color: '#ffd23f' }}>✓ {score}</span>} />

      <GameTitle title="Hype Check" story="Quantum computing comes wrapped in big claims. Sort each one: is it real today, maybe someday, or hype?" />

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Eyebrow>THE THREE BINS</Eyebrow>
        {BINS.map((b) => (
          <div key={b.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '0.84rem', lineHeight: 1.4 }}>
            <span style={{ flexShrink: 0, marginTop: 1 }}>{BIN_LOOK[b.id].icon}</span>
            <span><b>{b.label}.</b> {b.hint}</span>
          </div>
        ))}
      </div>

      <div style={{ ...panelStyle, background: 'rgba(255,255,255,0.08)', borderColor: THEME.accent, padding: 16 }}>
        <Eyebrow>THE CLAIM</Eyebrow>
        <p style={{ fontSize: '1.12rem', lineHeight: 1.45, fontWeight: 700, marginTop: 8 }}>{card.claim}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} role="group" aria-label="Sort the claim">
        {BINS.map((b) => {
          const chosen = choice === b.id;
          const isRight = verdict?.right === b.id;
          return (
            <button
              key={b.id}
              className={`btn ${BIN_LOOK[b.id].btn}`}
              onClick={() => pick(b.id)}
              disabled={choice !== null}
              aria-pressed={chosen}
              style={{ opacity: choice && !chosen && !isRight ? 0.45 : 1, outline: choice && isRight ? '3px solid #fff' : undefined }}
            >
              {BIN_LOOK[b.id].icon}
              <span>{b.label}</span>
              {choice && isRight && <span aria-label="the right bin">✔</span>}
              {choice && chosen && !isRight && <span aria-label="your choice, which was wrong">✘</span>}
            </button>
          );
        })}
      </div>

      {verdict && (
        <Banner tone={verdict.correct ? 'good' : 'bad'} title={verdict.correct ? 'RIGHT!' : 'NOT QUITE'}
          icon={verdict.correct ? <CheckCircle2 size={18} /> : <XCircle size={18} />}>
          <div style={{ marginBottom: 6 }}><b>{labelOf(card.bin)}.</b> {card.why}</div>
          <button className="btn" onClick={next}>
            <span>{index + 1 >= ROUND_SIZE ? 'See my score' : 'Next card'}</span>
            <ChevronRight size={18} />
          </button>
        </Banner>
      )}
    </ArcadeFrame>
  );
};
