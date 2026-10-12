import type { LessonRecord, QuizRecord } from '../../content/types';
import type { ProgressState } from '../../utils/progressStore';
import { PRACTICE } from '../../content/practice';
import { partProgress } from './curriculum';
import { passes } from './quiz';

/**
 * Badges: milestones worked out from the progress the app already keeps. Nothing is stored for them, so a badge can never
 * be "lost" or get out of step: it is earned exactly when its rule holds for the saved progress, and progress only grows.
 *
 * The rules are about things a learner did (finished a game, passed a quiz, solved problems), never about speed or about
 * how often they open the app. Each badge says what it needs in words, and shows how far along it is.
 */
export type BadgeGroup = 'play' | 'learn' | 'maths' | 'hardware' | 'cat';

export interface Badge {
  id: string;
  name: string;
  /** What it takes, in plain words. */
  how: string;
  /** One emoji, always accompanied by the name and the status in words. */
  icon: string;
  group: BadgeGroup;
  /** How far along: `have` of `need`. */
  have: number;
  need: number;
  earned: boolean;
}

type Quizzes = Record<string, QuizRecord>;

export interface BadgeContext {
  progress: ProgressState;
  lessons: LessonRecord[];
  quizzes: Quizzes;
  /** The games and labs the app has built (the others are "coming soon" and cannot be required). */
  games: string[];
  sims: string[];
}

export const GROUP_NAMES: Record<BadgeGroup, string> = {
  play: 'Play and explore',
  learn: 'Learn and check',
  maths: 'Math Companion',
  hardware: 'Hardware',
  cat: 'Milton',
};

const make = (id: string, name: string, how: string, icon: string, group: BadgeGroup, have: number, need: number): Badge => ({
  id, name, how, icon, group, have: Math.min(have, need), need, earned: need > 0 && have >= need,
});

/** The ids of the games that belong to the lessons of a part. */
function gamesOfPart(lessons: LessonRecord[], part: 1 | 2 | 3): string[] {
  return [...new Set(lessons.filter((l) => l.part === part).flatMap((l) => l.activities.filter((a) => a.kind === 'game').map((a) => a.id)))];
}

export function computeBadges(ctx: BadgeContext): Badge[] {
  const { progress, lessons, quizzes } = ctx;
  const gamesDone = ctx.games.filter((g) => progress.completedGames.includes(g)).length;
  const simsDone = ctx.sims.filter((s) => progress.exploredSims.includes(s)).length;
  const quizList = Object.values(quizzes);
  const passed = quizList.filter((q) => progress.quizScores[q.id] !== undefined && passes(q, progress.quizScores[q.id])).length;
  const perfect = quizList.filter((q) => progress.quizScores[q.id] !== undefined && progress.quizScores[q.id] >= 1).length;
  const part = (n: 1 | 2 | 3) => partProgress(lessons, quizzes, progress, n);
  const p1 = part(1);
  const p2 = part(2);
  const p3 = part(3);
  const hardwareGames = gamesOfPart(lessons, 2).filter((g) => ctx.games.includes(g));
  const hardwareDone = hardwareGames.filter((g) => progress.completedGames.includes(g)).length;
  const practiceTotal = PRACTICE.length;
  const solved = progress.solvedProblems.length;

  const base: Badge[] = [
    make('first_game', 'First play', 'Finish any game.', '🎮', 'play', gamesDone, 1),
    make('games_5', 'Game collector', 'Finish five different games.', '🕹️', 'play', gamesDone, 5),
    make('games_all', 'Every game', `Finish all ${ctx.games.length} games.`, '🏆', 'play', gamesDone, ctx.games.length),
    make('first_lab', 'In the lab', 'Run an experiment in any lab.', '🔬', 'play', simsDone, 1),
    make('labs_5', 'Lab regular', 'Explore five different labs.', '🧪', 'play', simsDone, 5),
    make('labs_all', 'Every lab', `Explore all ${ctx.sims.length} labs.`, '🥼', 'play', simsDone, ctx.sims.length),

    make('first_quiz', 'First check', 'Pass any quiz.', '✅', 'learn', passed, 1),
    make('quizzes_5', 'Five checks', 'Pass five quizzes.', '📝', 'learn', passed, 5),
    make('quizzes_all', 'Every check', `Pass all ${quizList.length} quizzes.`, '🎓', 'learn', passed, quizList.length),
    make('perfect', 'Spot on', 'Get every answer right in a quiz.', '💯', 'learn', perfect, 1),
    make('part1', 'Foundations', 'Finish every module of Part 1.', '⚛️', 'learn', p1.done, p1.total),
    make('part2', 'Hardware tour', 'Finish every module of Part 2.', '🖥️', 'hardware', p2.done, p2.total),

    make('practice_5', 'Pencil and paper', 'Solve five practice problems.', '✏️', 'maths', solved, 5),
    make('practice_all', 'Every problem', `Solve all ${practiceTotal} practice problems.`, '🧮', 'maths', solved, practiceTotal),
    make('math_done', 'Maths companion', 'Finish every Math Companion lesson.', '📐', 'maths', p3.done, p3.total),

    make('hardware_games', 'Hardware hand', 'Finish all the Part 2 games.', '🛠️', 'hardware', hardwareDone, hardwareGames.length),
    make('architect', 'Chief architect', 'Finish Quantum Architect.', '📐', 'hardware', progress.completedGames.includes('quantum_architect') ? 1 : 0, 1),

    make('milton', 'Opened the box', "Finish Milton's Box.", '😺', 'cat', progress.completedGames.includes('miltons_box') ? 1 : 0, 1),
  ];

  // the last badge needs all the others
  const earnedCount = base.filter((b) => b.earned).length;
  return [...base, make('completionist', 'Dr. Schrody\'s colleague', 'Earn every other badge.', '🌟', 'cat', earnedCount, base.length)];
}

export const RANKS: { min: number; name: string }[] = [
  { min: 0, name: 'Curious kitten' },
  { min: 3, name: 'Lab assistant' },
  { min: 7, name: 'Research cat' },
  { min: 11, name: 'Senior physicist' },
  { min: 15, name: "Dr. Milton's colleague" },
];

/** The title for a number of badges: only ever goes up with more badges. */
export function rankFor(earned: number): { name: string; next: { name: string; need: number } | null } {
  let current = RANKS[0];
  for (const r of RANKS) if (earned >= r.min) current = r;
  const next = RANKS.find((r) => r.min > earned);
  return { name: current.name, next: next ? { name: next.name, need: next.min - earned } : null };
}

/** The badges earned now that were not in `seen`, for the "new" marker. */
export const newBadges = (badges: Badge[], seen: string[]): Badge[] => badges.filter((b) => b.earned && !seen.includes(b.id));
