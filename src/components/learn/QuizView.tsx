import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronRight, RotateCcw, X as XIcon } from 'lucide-react';
import { useProgress } from '../../hooks/useProgress';
import type { LessonRecord, QuizRecord } from '../../content/types';
import { gradeQuiz, passRule, percent } from '../../core/learn/quiz';
import type { QuizResult } from '../../core/learn/quiz';
import { Banner, Eyebrow } from '../shared/Arcade';
import { PIXEL, RETRO, THEMES, frameStyle } from '../shared/arcadeTheme';
import { DrQuantum } from '../shared/DrQuantum';
import type { TutorFocus } from '../../core/tutor/types';
import { snippet } from '../../core/tutor/focus';
import { AskButton } from './AskButton';

const theme = THEMES.mint;
const LETTERS = ['A', 'B', 'C', 'D'];

interface Props {
  quiz: QuizRecord;
  lesson: LessonRecord;
  nextLesson?: LessonRecord;
  onBackToLesson: () => void;
  onOpenLesson: (lessonId: string) => void;
  /** "Ask about this": open the tutor with this question's text (never its options or its answer). */
  onAsk?: (focus: TutorFocus) => void;
}

type OptionState = 'idle' | 'selected' | 'correct' | 'wrong' | 'dim';

const optionColors: Record<OptionState, { bg: string; border: string }> = {
  idle: { bg: 'rgba(255, 255, 255, 0.06)', border: 'rgba(255, 255, 255, 0.18)' },
  selected: { bg: 'rgba(255, 210, 63, 0.14)', border: '#ffd23f' },
  correct: { bg: 'rgba(46, 230, 166, 0.18)', border: '#2ee6a6' },
  wrong: { bg: 'rgba(255, 92, 138, 0.18)', border: '#ff5c8a' },
  dim: { bg: 'rgba(255, 255, 255, 0.03)', border: 'rgba(255, 255, 255, 0.1)' },
};

export const QuizView: React.FC<Props> = ({ quiz, lesson, nextLesson, onBackToLesson, onOpenLesson, onAsk }) => {
  const { progress, saveQuiz } = useProgress();
  const total = quiz.questions.length;

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(() => quiz.questions.map(() => null));
  const [result, setResult] = useState<QuizResult | null>(null);

  const question = quiz.questions[index];
  const best = progress.quizScores[quiz.id];

  const topRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // A new question or the results start at the top; a checked answer scrolls its feedback and Next button into view
  useEffect(() => {
    topRef.current?.scrollIntoView({ block: 'start' });
  }, [index, result]);
  useEffect(() => {
    if (checked) nextRef.current?.scrollIntoView({ block: 'nearest' });
  }, [checked]);

  const check = () => {
    if (selected === null) return;
    setChecked(true);
    setAnswers((prev) => prev.map((a, i) => (i === index ? selected : a)));
  };

  const next = () => {
    if (index + 1 < total) {
      setIndex(index + 1);
      setSelected(null);
      setChecked(false);
      return;
    }
    const graded = gradeQuiz(quiz, answers);
    setResult(graded);
    saveQuiz(quiz.id, lesson.linkedConceptId, graded.score);
  };

  const retry = () => {
    setIndex(0);
    setSelected(null);
    setChecked(false);
    setAnswers(quiz.questions.map(() => null));
    setResult(null);
  };

  if (result) {
    return (
      <div ref={topRef} style={frameStyle(theme)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <DrQuantum size={72} mood={result.passed ? 'happy' : 'wow'} />
          <div>
            <Eyebrow color={theme.accent}>QUIZ RESULTS</Eyebrow>
            <div style={{ fontFamily: RETRO, fontSize: '3rem', lineHeight: 1, marginTop: 4 }}>
              {result.correct} / {result.total}
            </div>
            <div style={{ fontWeight: 800, color: 'var(--text-secondary)' }}>{percent(result.score)}</div>
          </div>
        </div>

        {result.passed ? (
          <Banner tone="good" title="QUIZ PASSED!">
            Great work. This module is now marked as done.
          </Banner>
        ) : (
          <Banner tone="warn" title="NOT QUITE YET">
            Pass mark {percent(quiz.passingScore)}: get {passRule(quiz)} right. Check the answers below, review the lesson and try again. You can retry as often as you like.
          </Banner>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Eyebrow>YOUR ANSWERS</Eyebrow>
          {quiz.questions.map((q, i) => {
            const right = result.perQuestion[i];
            return (
              <div key={i} style={{
                display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 14,
                background: right ? 'rgba(46, 230, 166, 0.1)' : 'rgba(255, 92, 138, 0.1)',
                border: `2px solid ${right ? '#2ee6a6' : '#ff5c8a'}`,
              }}>
                <span aria-label={right ? 'Correct' : 'Wrong'} style={{ flexShrink: 0, marginTop: 2 }}>
                  {right ? <Check size={20} color="#2ee6a6" /> : <XIcon size={20} color="#ff5c8a" />}
                </span>
                <div style={{ fontSize: '0.88rem', lineHeight: 1.4 }}>
                  <div style={{ fontWeight: 700 }}>{i + 1}. {q.prompt}</div>
                  {!right && (
                    <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
                      Answer: <b style={{ color: '#fff' }}>{q.options[q.correctIndex]}</b>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {result.passed && nextLesson && (
            <button className="btn btn-mint" onClick={() => onOpenLesson(nextLesson.id)}>
              <span>Next module</span>
              <ChevronRight size={18} />
            </button>
          )}
          <button className={`btn ${result.passed ? 'btn-slate' : 'btn-violet'}`} onClick={retry}>
            <RotateCcw size={18} />
            <span>Try again</span>
          </button>
          <button className="btn btn-slate" onClick={onBackToLesson}>Back to lesson</button>
        </div>
      </div>
    );
  }

  const optionState = (i: number): OptionState => {
    if (!checked) return selected === i ? 'selected' : 'idle';
    if (i === question.correctIndex) return 'correct';
    if (i === selected) return 'wrong';
    return 'dim';
  };

  const gotIt = checked && selected === question.correctIndex;

  return (
    <div ref={topRef} style={frameStyle(theme)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: PIXEL, fontSize: '0.58rem', color: theme.accent }}>
          QUESTION {index + 1}/{total}
        </span>
        {best !== undefined && (
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Best {percent(best)}</span>
        )}
      </div>

      <div
        className="xp-track"
        role="progressbar"
        aria-label="Quiz progress"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={index + (checked ? 1 : 0)}
      >
        <div className="xp-fill" style={{ width: `${((index + (checked ? 1 : 0)) / total) * 100}%`, background: theme.accent }} />
      </div>

      {question.misconceptionTag && (
        <span className="chip" style={{ alignSelf: 'flex-start', minHeight: 32, padding: '4px 12px', borderColor: '#ff5c8a', color: '#ffb3c8' }}>
          Misconception check
        </span>
      )}

      <h2 id="quiz-prompt" style={{ fontSize: '1.08rem', fontWeight: 800, lineHeight: 1.4 }}>{question.prompt}</h2>

      {onAsk && (
        <AskButton
          label={`Quiz question ${index + 1}: "${snippet(question.prompt)}"`}
          text={`${question.prompt}${checked ? ' (The learner has already checked their answer to this question.)' : ''}`}
          onAsk={onAsk}
        />
      )}

      <div role="radiogroup" aria-labelledby="quiz-prompt" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {question.options.map((option, i) => {
          const state = optionState(i);
          const colors = optionColors[state];
          return (
            <button
              key={i}
              role="radio"
              aria-checked={selected === i}
              disabled={checked}
              onClick={() => setSelected(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', width: '100%', minHeight: 56,
                padding: '10px 12px', borderRadius: 16, color: '#fff', background: colors.bg,
                border: `2px solid ${colors.border}`, opacity: state === 'dim' ? 0.6 : 1,
                boxShadow: state === 'selected' ? '0 4px 0 #d99a00' : '0 4px 0 rgba(0, 0, 0, 0.25)',
              }}
            >
              <span style={{
                flexShrink: 0, width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontFamily: PIXEL, fontSize: '0.6rem', background: 'rgba(0, 0, 0, 0.3)',
              }}>
                {state === 'correct' ? <Check size={18} color="#2ee6a6" /> : state === 'wrong' ? <XIcon size={18} color="#ff5c8a" /> : LETTERS[i]}
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4 }}>{option}</span>
            </button>
          );
        })}
      </div>

      {checked && (
        <Banner tone={gotIt ? 'good' : 'bad'} title={gotIt ? 'CORRECT!' : 'NOT QUITE'}>
          {!gotIt && (
            <div style={{ marginBottom: 6 }}>
              Right answer: <b>{question.options[question.correctIndex]}</b>
            </div>
          )}
          {question.explanation}
        </Banner>
      )}

      {checked ? (
        <button ref={nextRef} className="btn btn-mint" onClick={next}>
          <span>{index + 1 < total ? 'Next question' : 'See results'}</span>
          <ChevronRight size={18} />
        </button>
      ) : (
        <button className="btn" onClick={check} disabled={selected === null} style={{ opacity: selected === null ? 0.5 : 1 }}>
          Check answer
        </button>
      )}

      <button className="chip" onClick={onBackToLesson} style={{ alignSelf: 'flex-start' }}>
        Quit quiz
      </button>
    </div>
  );
};
