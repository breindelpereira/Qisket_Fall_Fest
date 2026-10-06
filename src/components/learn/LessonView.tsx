import React, { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Circle, FlaskConical, Gamepad2, Lock, Video } from 'lucide-react';
import { useProgress } from '../../hooks/useProgress';
import { ACTIVITIES } from '../../content/activities';
import { HARDWARE_SNAPSHOT_NOTE, LESSONS, PARTS, QUIZZES, quizForLesson } from '../../content/lessons';
import type { ActivityLink, LessonBlock, LessonRecord } from '../../content/types';
import { adjacentLessons, conceptEvidence, lessonStatus, moduleEyebrow } from '../../core/learn/curriculum';
import { STEP_HINTS, STEP_TITLES, lessonFlow } from '../../core/learn/flow';
import { flowFor, hasStarted, readStartChoices, startOffer, writeStartChoice } from '../../core/learn/start';
import type { StartChoice } from '../../core/learn/start';
import { safeStorage } from '../../utils/safeStorage';
import { passRule, percent } from '../../core/learn/quiz';
import { Banner, Eyebrow } from '../shared/Arcade';
import { THEMES } from '../shared/arcadeTheme';
import { DrQuantum } from '../shared/DrQuantum';
import { HonestyTagBadge } from '../shared/HonestyTag';
import { MathView } from './MathView';
import { ReadingCard, VideoCard } from './VideoCard';

const sectionTitle: React.CSSProperties = { fontSize: '0.72rem', lineHeight: 1.5 };

const Section: React.FC<{ title: string; hint?: string; children: React.ReactNode }> = ({ title, hint, children }) => (
  <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    <div>
      <h3 className="pixel" style={sectionTitle}>{title}</h3>
      {hint && <p style={{ fontSize: '0.85rem', lineHeight: 1.45, color: 'var(--text-secondary)', marginTop: 6 }}>{hint}</p>}
    </div>
    {children}
  </section>
);

interface ActivityCardProps {
  activity: ActivityLink;
  ready: boolean;
  onOpenGame: (id: string) => void;
  onOpenSim: (id: string) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity: a, ready, onOpenGame, onOpenSim }) => {
  const info = ACTIVITIES[a.id];
  const Icon = a.kind === 'game' ? Gamepad2 : FlaskConical;
  return (
    <div className="card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12, minHeight: 72, opacity: ready ? 1 : 0.8 }}>
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
};

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

  // The first time a module that opens with a game or lab is visited, ask how to begin
  const [choices, setChoices] = useState(() => readStartChoices(safeStorage()));
  const choice = choices[lesson.id];
  const offer = startOffer(lesson, availableGameIds, availableSimIds);
  const started = hasStarted(choice, { status, played: evidence.played, explored: evidence.explored });
  const choose = (c: StartChoice) => setChoices(writeStartChoice(safeStorage(), choices, lesson.id, c));
  const { stages, soon } = lessonFlow({ ...lesson, flow: flowFor(lesson, choice) }, availableGameIds, availableSimIds);

  // Only ask for steps the learner can actually take today
  const canPlay = lesson.activities.some((a) => a.kind === 'game' && availableGameIds.includes(a.id));
  const canExplore = lesson.activities.some((a) => a.kind === 'sim' && availableSimIds.includes(a.id));
  const path = [
    ...(canPlay ? [{ label: 'Play a game', done: evidence.played }] : []),
    ...(canExplore ? [{ label: 'Try a lab', done: evidence.explored }] : []),
    { label: 'Pass the quiz', done: evidence.quizPassed },
  ];

  const top = (
    <>
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
    </>
  );

  if (offer && !started) {
    const info = ACTIVITIES[offer.activity.id];
    const isGame = offer.activity.kind === 'game';
    const open = () => {
      choose('play');
      if (isGame) onOpenGame(offer.activity.id);
      else onOpenSim(offer.activity.id);
    };
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {top}
        <section className="card" aria-label="How do you want to start?" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14, background: 'var(--bg-surface-elevated)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <DrQuantum size={72} />
            <div style={{ flex: 1, background: '#fff', color: 'var(--ink)', borderRadius: 16, padding: '10px 12px', fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.4 }}>
              {isGame ? "Let's start with a game!" : "Let's start in the lab!"}
            </div>
          </div>
          <p style={{ fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
            {isGame
              ? 'You will feel the idea first, and the video makes more sense after you have tried it. No timer, and hints are there if you get stuck.'
              : 'Here the lab is where the idea is explained step by step. After it, the video and the practice game will make more sense.'}
          </p>
          <button className="btn" onClick={open}>
            {isGame ? <Gamepad2 size={20} /> : <FlaskConical size={20} />}
            <span>{isGame ? 'Play' : 'Open'} {info.title}</span>
          </button>
          {offer.canWatch && (
            <button className="btn btn-sky" onClick={() => choose('watch')}>
              <Video size={20} />
              <span>Watch the video first</span>
            </button>
          )}
          <button className="chip" onClick={() => choose('all')} style={{ alignSelf: 'center' }}>
            Show me the whole lesson
          </button>
        </section>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {top}

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

      {stages.map((stage, i) => (
        <Section key={stage.step} title={`STEP ${i + 1} \u00b7 ${STEP_TITLES[stage.step].toUpperCase()}`} hint={STEP_HINTS[stage.step]}>
          {stage.step === 'watch'
            ? (
              <>
                {stage.videos.map((v) => <VideoCard key={v.url} reference={v} />)}
                {stage.readings.map((r) => <ReadingCard key={r.url} reference={r} />)}
              </>
            )
            : stage.activities.map((act) => (
              <ActivityCard key={act.id} activity={act} ready onOpenGame={onOpenGame} onOpenSim={onOpenSim} />
            ))}
        </Section>
      ))}

      {soon.length > 0 && (
        <Section title="Coming soon">
          {soon.map((act) => (
            <ActivityCard key={act.id} activity={act} ready={false} onOpenGame={onOpenGame} onOpenSim={onOpenSim} />
          ))}
        </Section>
      )}

      {/* The punchline and the common mix-up come after the learner has met the idea, so they do not spoil the game */}
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

      <Section title="Lecture notes" hint={stages.length > 0 ? 'A recap to keep. Come back to it any time.' : undefined}>
        <div className="card" style={{ padding: 16 }}>
          <Blocks blocks={lesson.blocks} />
        </div>
      </Section>

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
