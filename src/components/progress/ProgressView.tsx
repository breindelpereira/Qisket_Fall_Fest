import React, { useEffect, useState } from 'react';
import { BookOpen, Check, Circle } from 'lucide-react';
import { LESSONS, QUIZZES } from '../../content/lessons';
import { PRACTICE } from '../../content/practice';
import { courseProgressPercent, lessonStatus, partProgress } from '../../core/learn/curriculum';
import { GROUP_NAMES } from '../../core/learn/badges';
import type { BadgeGroup } from '../../core/learn/badges';
import { passRule, percent } from '../../core/learn/quiz';
import { useBadges } from '../../hooks/useBadges';
import { useProgress } from '../../hooks/useProgress';
import { Eyebrow } from '../shared/Arcade';
import { Milton } from '../shared/Milton';
import type { LearnView } from '../learn/learnView';

export interface Listed {
  id: string;
  title: string;
  emoji: string;
}

interface Props {
  games: Listed[];
  sims: Listed[];
  onOpenGame: (id: string) => void;
  onOpenSim: (id: string) => void;
  onOpenLearn: (view: LearnView) => void;
}

const GROUP_ORDER: BadgeGroup[] = ['play', 'learn', 'hardware', 'maths', 'cat'];
const PART_NAMES: Record<1 | 2 | 3, string> = { 1: 'Part 1: Concepts', 2: 'Part 2: Hardware', 3: 'Part 3: Math Companion (optional)' };

const bar = (value: number, max: number, color = 'var(--yellow)') => (
  <div style={{ height: 12, background: 'rgba(255,255,255,0.1)', borderRadius: 6, overflow: 'hidden' }} aria-hidden="true">
    <div style={{ width: `${max ? (value / max) * 100 : 0}%`, height: '100%', background: color, transition: 'width .3s' }} />
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    <h2 className="pixel" style={{ fontSize: '0.8rem', lineHeight: 1.6 }}>{title}</h2>
    {children}
  </section>
);

export const ProgressView: React.FC<Props> = ({ games, sims, onOpenGame, onOpenSim, onOpenLearn }) => {
  const { progress } = useProgress();
  const { badges, earned, fresh, rank, markSeen } = useBadges(games.map((g) => g.id), sims.map((s) => s.id));
  const percentDone = courseProgressPercent(LESSONS, QUIZZES, progress);

  // the badges that were new when the screen opened keep their marker for this visit; looking at it makes them old
  const [freshIds] = useState(() => new Set(fresh.map((b) => b.id)));
  useEffect(() => {
    markSeen();
  }, [markSeen]);

  const gamesDone = games.filter((g) => progress.completedGames.includes(g.id)).length;
  const simsDone = sims.filter((s) => progress.exploredSims.includes(s.id)).length;
  const quizLessons = LESSONS.filter((l) => l.quizId && QUIZZES[l.quizId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <section className="card" style={{ padding: 16, background: 'var(--bg-surface-elevated)', display: 'flex', gap: 14, alignItems: 'center' }}>
        <Milton size={84} mood={earned.length >= 8 ? 'wow' : 'happy'} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Eyebrow>YOUR RANK</Eyebrow>
          <div className="pixel" style={{ fontSize: '0.95rem', lineHeight: 1.5, margin: '4px 0' }}>{rank.name}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {earned.length} of {badges.length} badges.{' '}
            {rank.next ? `${rank.next.need} more for ${rank.next.name}.` : 'Top rank reached.'}
          </div>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
        {[
          { label: 'Course', value: `${percentDone}%` },
          { label: 'Games played', value: `${gamesDone}/${games.length}` },
          { label: 'Labs tried', value: `${simsDone}/${sims.length}` },
          { label: 'Quizzes passed', value: `${quizLessons.filter((l) => lessonStatus(l, QUIZZES, progress).status === 'done').length}/${quizLessons.length}` },
          { label: 'Problems solved', value: `${progress.solvedProblems.length}/${PRACTICE.length}` },
          { label: 'Badges', value: `${earned.length}/${badges.length}` },
        ].map((t) => (
          <div key={t.label} className="card" style={{ padding: '10px 6px', textAlign: 'center' }}>
            <div className="pixel" style={{ fontSize: '0.8rem' }}>{t.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, marginTop: 4 }}>{t.label}</div>
          </div>
        ))}
      </section>

      <Section title="Badges">
        {GROUP_ORDER.map((group) => {
          const inGroup = badges.filter((b) => b.group === group);
          if (!inGroup.length) return null;
          return (
            <div key={group} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Eyebrow>{GROUP_NAMES[group].toUpperCase()}</Eyebrow>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
                {inGroup.map((b) => (
                  <div
                    key={b.id}
                    className="card"
                    aria-label={`${b.name}: ${b.earned ? 'earned' : `${b.have} of ${b.need}`}. ${b.how}`}
                    style={{
                      padding: 10, display: 'flex', flexDirection: 'column', gap: 6, minHeight: 120,
                      borderColor: b.earned ? 'var(--yellow)' : undefined, opacity: b.earned ? 1 : 0.85,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span aria-hidden="true" style={{ fontSize: '1.5rem', filter: b.earned ? 'none' : 'grayscale(1)' }}>{b.icon}</span>
                      <span style={{ fontWeight: 800, fontSize: '0.88rem', lineHeight: 1.2 }}>{b.name}</span>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.35, flex: 1 }}>{b.how}</div>
                    {bar(b.have, b.need, b.earned ? 'var(--mint)' : 'var(--yellow)')}
                    <div style={{ fontSize: '0.74rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {b.earned ? <><Check size={14} /> Earned{freshIds.has(b.id) ? ' (new!)' : ''}</> : <><Circle size={12} /> {b.have} of {b.need}</>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </Section>

      <Section title="The course">
        {([1, 2, 3] as const).map((n) => {
          const p = partProgress(LESSONS, QUIZZES, progress, n);
          return (
            <div key={n} className="card" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontWeight: 800, fontSize: '0.9rem' }}>
                <span>{PART_NAMES[n]}</span>
                <span>{p.done}/{p.total}</span>
              </div>
              {bar(p.done, p.total, n === 3 ? 'var(--violet)' : 'var(--yellow)')}
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{p.done} of {p.total} modules done</div>
            </div>
          );
        })}
      </Section>

      <Section title="Quizzes">
        <div className="card" style={{ padding: 4 }}>
          {quizLessons.map((l) => {
            const s = lessonStatus(l, QUIZZES, progress);
            const quiz = QUIZZES[l.quizId as string];
            return (
              <button
                key={l.id}
                onClick={() => onOpenLearn({ kind: 'lesson', lessonId: l.id })}
                style={{ width: '100%', minHeight: 52, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', color: 'inherit', background: 'transparent' }}
              >
                <BookOpen size={16} aria-hidden="true" />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontWeight: 700, fontSize: '0.86rem' }}>{l.title}</span>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Pass mark: {passRule(quiz)}</span>
                </span>
                <span style={{ fontWeight: 800, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                  {s.status === 'done' ? `✓ ${percent(s.bestScore ?? 1)}` : s.status === 'attempted' ? `Best ${percent(s.bestScore ?? 0)}` : 'Not taken'}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Games">
        <ChecklistGrid items={games} done={progress.completedGames} onOpen={onOpenGame} />
      </Section>

      <Section title="Labs">
        <ChecklistGrid items={sims} done={progress.exploredSims} onOpen={onOpenSim} />
      </Section>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        Progress and badges are kept on this device only. Badges are worked out from what you have done, so nothing can be lost, and they never depend on speed or on how often you open the app.
      </p>
    </div>
  );
};

const ChecklistGrid: React.FC<{ items: Listed[]; done: string[]; onOpen: (id: string) => void }> = ({ items, done, onOpen }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
    {items.map((it) => {
      const isDone = done.includes(it.id);
      return (
        <button
          key={it.id}
          className="card"
          onClick={() => onOpen(it.id)}
          aria-label={`${it.title}: ${isDone ? 'done' : 'not yet'}. Open it.`}
          style={{
            minHeight: 52, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', color: 'inherit',
            borderColor: isDone ? 'var(--mint)' : undefined,
          }}
        >
          <span aria-hidden="true" style={{ fontSize: '1.1rem' }}>{it.emoji}</span>
          <span style={{ flex: 1, fontSize: '0.78rem', fontWeight: 700, lineHeight: 1.25 }}>{it.title}</span>
          <span style={{ fontWeight: 800, fontSize: '0.9rem' }} aria-hidden="true">{isDone ? '✓' : '○'}</span>
        </button>
      );
    })}
  </div>
);
