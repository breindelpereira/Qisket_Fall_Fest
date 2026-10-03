import React from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProgress } from '../../hooks/useProgress';
import { LESSONS, PARTS, QUIZZES, lessonsForPart } from '../../content/lessons';
import { lessonStatus, partProgress } from '../../core/learn/curriculum';
import { percent } from '../../core/learn/quiz';
import { Banner, Eyebrow } from '../shared/Arcade';
import { THEMES } from '../shared/arcadeTheme';

interface Props {
  part: 1 | 2 | 3;
  onBack: () => void;
  onOpenLesson: (lessonId: string) => void;
}

export const PartView: React.FC<Props> = ({ part, onBack, onOpenLesson }) => {
  const { progress } = useProgress();
  const info = PARTS.find((p) => p.part === part)!;
  const lessons = lessonsForPart(part);
  const { done, total } = partProgress(LESSONS, QUIZZES, progress, part);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <button className="chip" onClick={onBack} style={{ alignSelf: 'flex-start' }}>
        <ChevronLeft size={18} />
        <span>Learn</span>
      </button>

      <header style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Eyebrow color={THEMES.mint.accent}>PART {part}{info.optional ? ' · OPTIONAL' : ''}</Eyebrow>
        <h2 className="pixel" style={{ fontSize: '1rem', lineHeight: 1.5 }}>{info.title}</h2>
        <p style={{ fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>{info.heading}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="xp-track" style={{ flex: 1 }} role="progressbar" aria-label={`Part ${part} progress`} aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
            <div className="xp-fill" style={{ width: `${total ? Math.max((done / total) * 100, done ? 6 : 0) : 0}%` }} />
          </div>
          <span className="retro-num" style={{ fontSize: '1.4rem', color: '#ffd23f' }}>{done}/{total}</span>
        </div>
      </header>

      {info.blurb && <Banner tone="info">{info.blurb}</Banner>}

      <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {lessons.map((lesson) => {
          const { status, bestScore } = lessonStatus(lesson, QUIZZES, progress);
          const hasQuiz = Boolean(lesson.quizId);
          const statusLabel =
            status === 'done' ? (hasQuiz && bestScore !== undefined ? `Passed ${percent(bestScore)}` : 'Done')
            : status === 'attempted' ? `Best ${percent(bestScore ?? 0)}`
            : hasQuiz ? 'Quiz' : 'New';
          const color = status === 'done' ? '#2ee6a6' : status === 'attempted' ? '#ffd23f' : 'rgba(255, 255, 255, 0.18)';
          return (
            <li key={lesson.id}>
              <button
                className="card"
                onClick={() => onOpenLesson(lesson.id)}
                style={{ width: '100%', padding: 12, display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', color: 'inherit', minHeight: 76 }}
              >
                <span aria-hidden="true" style={{
                  flexShrink: 0, minWidth: 44, height: 44, padding: '0 6px', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: status === 'done' ? '#2ee6a6' : 'rgba(0, 0, 0, 0.3)', color: status === 'done' ? 'var(--ink)' : '#fff',
                  border: `2px solid ${color}`, fontFamily: "'Press Start 2P', monospace", fontSize: '0.55rem', textAlign: 'center', lineHeight: 1.3,
                }}>
                  {status === 'done' ? <Check size={22} strokeWidth={3} /> : lesson.part === 3 ? lesson.moduleLabel.replace('Lesson ', 'L').replace('Week ', 'W') : lesson.moduleLabel}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontWeight: 800, fontSize: '0.98rem', lineHeight: 1.3 }}>{lesson.title}</span>
                  {lesson.ahaMoment && (
                    <span style={{
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      fontSize: '0.82rem', lineHeight: 1.35, color: 'var(--text-secondary)', marginTop: 2,
                    }}>
                      {lesson.ahaMoment}
                    </span>
                  )}
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: status === 'new' ? 'var(--text-tertiary)' : color, marginTop: 4 }}>
                    {statusLabel}
                  </span>
                </span>
                <ChevronRight size={20} color="var(--text-secondary)" aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
