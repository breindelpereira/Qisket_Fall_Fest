import React from 'react';
import { Check, ChevronLeft, ChevronRight, Circle, FlaskConical, Gamepad2, Lock } from 'lucide-react';
import { useProgress } from '../../hooks/useProgress';
import { ACTIVITIES } from '../../content/activities';
import { HARDWARE_SNAPSHOT_NOTE, LESSONS, PARTS, QUIZZES, quizForLesson } from '../../content/lessons';
import type { LessonBlock, LessonRecord } from '../../content/types';
import { adjacentLessons, conceptEvidence, lessonStatus, moduleEyebrow } from '../../core/learn/curriculum';
import { passRule, percent } from '../../core/learn/quiz';
import { Banner, Eyebrow } from '../shared/Arcade';
import { THEMES } from '../shared/arcadeTheme';
import { DrQuantum } from '../shared/DrQuantum';
import { HonestyTagBadge } from '../shared/HonestyTag';
import { MathView } from './MathView';
import { ReadingCard, VideoCard } from './VideoCard';

const sectionTitle: React.CSSProperties = { fontSize: '0.72rem', lineHeight: 1.5 };

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    <h3 className="pixel" style={sectionTitle}>{title}</h3>
    {children}
  </section>
);

const Blocks: React.FC<{ blocks: LessonBlock[] }> = ({ blocks }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
    {blocks.map((block, i) => {
      if (block.type === 'paragraph') {
        return <p key={i} style={{ fontSize: '1rem', lineHeight: 1.6, color: '#f1eaff' }}>{block.text}</p>;
      }
      if (block.type === 'note') {
        return <Banner key={i} tone="info">{block.text}</Banner>;
      }
      return (
        <ul key={i} style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {block.items.map((item, j) => (
            <li key={j} style={{ display: 'flex', gap: 12 }}>
              <span aria-hidden="true" style={{ flexShrink: 0, width: 10, height: 10, marginTop: 8, borderRadius: 3, background: THEMES.yellow.accent }} />
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {item.label && <b style={{ color: THEMES.yellow.accent, fontSize: '1rem' }}>{item.label}</b>}
                {item.text && <span style={{ fontSize: '1rem', lineHeight: 1.6, color: '#f1eaff' }}>{item.text}</span>}
                {item.math && <MathView expr={item.math} />}
              </div>
            </li>
          ))}
        </ul>
      );
    })}
  </div>
);

interface Props {
  lesson: LessonRecord;
  availableGameIds: string[];
  availableSimIds: string[];
  onBack: () => void;
  onOpenLesson: (lessonId: string) => void;
  onStartQuiz: () => void;
  onOpenGame: (id: string) => void;
  onOpenSim: (id: string) => void;
}

export const LessonView: React.FC<Props> = ({
  lesson, availableGameIds, availableSimIds, onBack, onOpenLesson, onStartQuiz, onOpenGame, onOpenSim,
}) => {
  const { progress, setLessonRead } = useProgress();
  const part = PARTS.find((p) => p.part === lesson.part)!;
  const quiz = quizForLesson(lesson);
  const { status, bestScore } = lessonStatus(lesson, QUIZZES, progress);
  const { prev, next } = adjacentLessons(LESSONS, lesson.id);
  const evidence = conceptEvidence(lesson.linkedConceptId, progress, QUIZZES, lesson);
  const tier = progress.conceptMastery[lesson.linkedConceptId];

  const videos = lesson.references.filter((r) => r.kind === 'video');
  const readings = lesson.references.filter((r) => r.kind === 'reading');

  // Only ask for steps the learner can actually take today
  const canPlay = lesson.activities.some((a) => a.kind === 'game' && availableGameIds.includes(a.id));
  const canExplore = lesson.activities.some((a) => a.kind === 'sim' && availableSimIds.includes(a.id));
  const path = [
    ...(canPlay ? [{ label: 'Play a game', done: evidence.played }] : []),
    ...(canExplore ? [{ label: 'Try a lab', done: evidence.explored }] : []),
    { label: 'Pass the quiz', done: evidence.quizPassed },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <button className="chip" onClick={onBack} style={{ alignSelf: 'flex-start' }}>
        <ChevronLeft size={18} />
        <span>{part.title}</span>
      </button>

      <header style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Eyebrow color={THEMES.mint.accent}>{moduleEyebrow(lesson)}</Eyebrow>
        <h2 className="pixel" style={{ fontSize: '1rem', lineHeight: 1.5 }}>{lesson.title}</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {status === 'done' && (
            <span className="chip" style={{ minHeight: 32, padding: '4px 12px', borderColor: '#2ee6a6', color: '#2ee6a6' }}>
              <Check size={14} /> Done
            </span>
          )}
          {lesson.honestyTag && <HonestyTagBadge tag={lesson.honestyTag} />}
        </div>
      </header>

      {lesson.ahaMoment && (
        <div className="card" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center', background: 'var(--bg-surface-elevated)' }}>
          <DrQuantum size={64} />
          <div style={{ flex: 1, background: '#fff', color: 'var(--ink)', borderRadius: 16, padding: '10px 12px' }}>
            <div className="pixel" style={{ fontSize: '0.5rem', color: '#8b5cf6', marginBottom: 6 }}>THE "AHA!" MOMENT</div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.4 }}>{lesson.ahaMoment}</div>
          </div>
        </div>
      )}

      {lesson.misconceptionToFix && (
        <Banner tone="warn" title="COMMON MIX-UP">{lesson.misconceptionToFix}</Banner>
      )}

      <Section title="Lecture notes">
        <div className="card" style={{ padding: 16 }}>
          <Blocks blocks={lesson.blocks} />
        </div>
      </Section>

      {lesson.references.length > 0 && (
        <Section title={videos.length ? 'Watch and read' : 'Read more'}>
          {videos.map((v) => <VideoCard key={v.url} reference={v} />)}
          {readings.map((r) => <ReadingCard key={r.url} reference={r} />)}
        </Section>
      )}

      {lesson.activities.length > 0 && (
        <Section title="Try it">
          {lesson.activities.map((a) => {
            const info = ACTIVITIES[a.id];
            const ready = a.kind === 'game' ? availableGameIds.includes(a.id) : availableSimIds.includes(a.id);
            const Icon = a.kind === 'game' ? Gamepad2 : FlaskConical;
            return (
              <div key={a.id} className="card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12, minHeight: 72, opacity: ready ? 1 : 0.8 }}>
                <span style={{
                  width: 44, height: 44, borderRadius: 14, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: a.kind === 'game' ? 'var(--yellow)' : 'var(--pink)',
                  boxShadow: `0 4px 0 ${a.kind === 'game' ? 'var(--yellow-edge)' : 'var(--pink-edge)'}`,
                }}>
                  <Icon size={22} color="var(--ink)" strokeWidth={2.6} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.3 }}>{info.title}</span>
                  <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {a.kind === 'game' ? 'Game' : 'Lab'}
                  </span>
                </span>
                {ready ? (
                  <button
                    className="btn"
                    onClick={() => (a.kind === 'game' ? onOpenGame(a.id) : onOpenSim(a.id))}
                    style={{ width: 'auto', minWidth: 88, minHeight: 44, padding: '8px 14px', fontSize: '0.6rem' }}
                  >
                    {a.kind === 'game' ? 'Play' : 'Open'}
                  </button>
                ) : (
                  <span className="chip" style={{ minHeight: 36, padding: '4px 12px' }}>
                    <Lock size={14} /> Soon
                  </span>
                )}
              </div>
            );
          })}
        </Section>
      )}

      {lesson.part === 1 && quiz && (canPlay || canExplore) && (
        <section className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }} aria-label="Your path">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Eyebrow>YOUR PATH</Eyebrow>
            {tier && tier !== 'locked' && (
              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#ffd23f', textTransform: 'capitalize' }}>{tier}</span>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${path.length}, 1fr)`, gap: 8 }}>
            {path.map((step) => (
              <div key={step.label} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center', padding: '10px 4px',
                borderRadius: 14, background: 'rgba(0, 0, 0, 0.22)', border: `2px solid ${step.done ? '#2ee6a6' : 'rgba(255,255,255,0.12)'}`,
              }}>
                {step.done ? <Check size={20} color="#2ee6a6" /> : <Circle size={20} color="#b9a6e8" />}
                <span style={{ fontSize: '0.75rem', fontWeight: 700, lineHeight: 1.25 }}>{step.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {quiz ? (
        <Section title="Check yourself">
          <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
              {quiz.questions.length} questions. Pass mark {percent(quiz.passingScore)}: get {passRule(quiz)} right. Retry as often as you like.
            </p>
            {bestScore !== undefined && (
              <Banner tone={status === 'done' ? 'good' : 'warn'}>
                {status === 'done' ? 'Passed' : 'Best so far'}: <b>{percent(bestScore)}</b>
              </Banner>
            )}
            <button className="btn btn-mint" onClick={onStartQuiz}>
              {bestScore === undefined ? 'Start quiz' : status === 'done' ? 'Retake quiz' : 'Try again'}
            </button>
          </div>
        </Section>
      ) : (
        <button
          className={`btn ${status === 'done' ? 'btn-slate' : 'btn-mint'}`}
          onClick={() => setLessonRead(lesson.id, status !== 'done')}
          aria-pressed={status === 'done'}
        >
          {status === 'done' ? <><Check size={18} /><span>Done (tap to undo)</span></> : <span>Mark as done</span>}
        </button>
      )}

      {(prev || next) && (
        <nav aria-label="Module navigation" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {prev ? (
            <button className="card" onClick={() => onOpenLesson(prev.id)} style={{ padding: 12, textAlign: 'left', color: 'inherit', minHeight: 64 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                <ChevronLeft size={14} /> Previous
              </span>
              <span style={{ display: 'block', fontWeight: 800, fontSize: '0.88rem', lineHeight: 1.3, marginTop: 2 }}>{prev.title}</span>
            </button>
          ) : <span />}
          {next ? (
            <button className="card" onClick={() => onOpenLesson(next.id)} style={{ padding: 12, textAlign: 'right', color: 'inherit', minHeight: 64 }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Next <ChevronRight size={14} />
              </span>
              <span style={{ display: 'block', fontWeight: 800, fontSize: '0.88rem', lineHeight: 1.3, marginTop: 2 }}>{next.title}</span>
            </button>
          ) : <span />}
        </nav>
      )}

      {lesson.part === 2 && (
        <p style={{ fontSize: '0.8rem', lineHeight: 1.5, color: 'var(--text-tertiary)' }}>{HARDWARE_SNAPSHOT_NOTE}</p>
      )}
    </div>
  );
};
