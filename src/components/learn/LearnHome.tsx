import React from 'react';
import { Atom, ChevronRight, Cpu, Play, Sigma } from 'lucide-react';
import { useProgress } from '../../hooks/useProgress';
import { COURSE_INTRO, LESSONS, PARTS, QUIZZES } from '../../content/lessons';
import { courseProgressPercent, moduleEyebrow, nextUpLesson, partProgress } from '../../core/learn/curriculum';
import { Eyebrow } from '../shared/Arcade';
import { THEMES } from '../shared/arcadeTheme';
import { DrQuantum } from '../shared/DrQuantum';

const PART_STYLE = {
  1: { icon: Atom, color: 'var(--mint)', edge: 'var(--mint-edge)' },
  2: { icon: Cpu, color: 'var(--sky)', edge: 'var(--sky-edge)' },
  3: { icon: Sigma, color: 'var(--violet)', edge: 'var(--violet-edge)' },
} as const;

interface Props {
  onOpenPart: (part: 1 | 2 | 3) => void;
  onOpenLesson: (lessonId: string) => void;
}

export const LearnHome: React.FC<Props> = ({ onOpenPart, onOpenLesson }) => {
  const { progress } = useProgress();
  const next = nextUpLesson(LESSONS, QUIZZES, progress);
  const percent = courseProgressPercent(LESSONS, QUIZZES, progress);
  const core = LESSONS.filter((l) => l.part !== 3);
  const coreDone = partProgress(core, QUIZZES, progress).done;
  const started = coreDone > 0 || Object.keys(progress.quizScores).length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h2 className="pixel" style={{ fontSize: '1.05rem', lineHeight: 1.5 }}>Learn</h2>
        <p style={{ fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>{COURSE_INTRO}</p>
      </header>

      <section className="card" style={{ padding: 16, background: 'var(--bg-surface-elevated)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <DrQuantum size={72} mood={next ? 'happy' : 'wow'} />
          <div style={{ flex: 1, background: '#fff', color: 'var(--ink)', borderRadius: 16, padding: '10px 12px', fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.4 }}>
            {!next ? 'You finished every module. Amazing!' : started ? 'Nice work! Ready for the next one?' : "Let's start with the big picture."}
          </div>
        </div>
        {next && (
          <>
            <div>
              <Eyebrow color={THEMES.yellow.accent}>UP NEXT · {moduleEyebrow(next)}</Eyebrow>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', lineHeight: 1.3, marginTop: 4 }}>{next.title}</div>
              {next.ahaMoment && (
                <div style={{ fontSize: '0.88rem', lineHeight: 1.4, color: 'var(--text-secondary)', marginTop: 4 }}>{next.ahaMoment}</div>
              )}
            </div>
            <button className="btn" onClick={() => onOpenLesson(next.id)}>
              <Play size={18} fill="currentColor" />
              <span>{started ? 'Continue' : 'Start'}</span>
            </button>
          </>
        )}
      </section>

      <section className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }} aria-label="Course progress">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span className="pixel" style={{ fontSize: '0.72rem' }}>Course progress</span>
          <span className="retro-num" style={{ fontSize: '1.6rem', color: '#ffd23f' }}>{percent}%</span>
        </div>
        <div className="xp-track" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Course progress">
          <div className="xp-fill" style={{ width: `${Math.max(percent, 4)}%` }} />
        </div>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          {coreDone} of {core.length} modules done in Parts 1 and 2
        </span>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h3 className="pixel" style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>The course</h3>
        {PARTS.map((info) => {
          const { icon: Icon, color, edge } = PART_STYLE[info.part];
          const { done, total } = partProgress(LESSONS, QUIZZES, progress, info.part);
          return (
            <button
              key={info.part}
              className="card"
              onClick={() => onOpenPart(info.part)}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, textAlign: 'left', color: 'inherit', width: '100%', minHeight: 92 }}
            >
              <span style={{
                width: 52, height: 52, borderRadius: 16, background: color, boxShadow: `0 4px 0 ${edge}`, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={26} color="var(--ink)" strokeWidth={2.6} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="pixel" style={{ display: 'block', fontSize: '0.5rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                  PART {info.part}{info.optional ? ' · OPTIONAL' : ''}
                </span>
                <span className="pixel" style={{ display: 'block', fontSize: '0.78rem', marginBottom: 6 }}>{info.title}</span>
                <span style={{ display: 'block', fontSize: '0.85rem', lineHeight: 1.35, color: 'var(--text-secondary)' }}>{info.summary}</span>
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: done === total ? '#2ee6a6' : 'var(--text-tertiary)', marginTop: 6 }}>
                  {done} of {total} modules done
                </span>
              </span>
              <ChevronRight size={20} color="var(--text-secondary)" aria-hidden="true" />
            </button>
          );
        })}
      </section>
    </div>
  );
};
