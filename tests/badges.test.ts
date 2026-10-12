import { describe, it, expect } from 'vitest';
import { LESSONS, QUIZZES } from '../src/content/lessons';
import { PRACTICE } from '../src/content/practice';
import { computeBadges, newBadges, rankFor, RANKS } from '../src/core/learn/badges';
import type { Badge } from '../src/core/learn/badges';
import { readSeenBadges, writeSeenBadges } from '../src/utils/badgeStore';
import type { ProgressState } from '../src/utils/progressStore';

const GAMES = ['hype_check', 'quantum_heist', 'coin_flip', 'miltons_box', 'coherence_race', 'cool_down', 'ion_chain_conductor', 'quantum_architect'];
const SIMS = ['single_qubit_lab', 'shots_histogram_lab', 'circuit_lab', 'qubit_metrics_lab', 'transmon_lab', 'maths_workbench'];

const empty = (): ProgressState => ({
  completedGames: [], exploredSims: [], conceptGames: {}, conceptSims: {}, quizScores: {}, conceptQuizzes: {}, readLessons: [],
  solvedProblems: [], conceptMastery: {}, lastUpdated: '2026-01-01T00:00:00.000Z',
});
const badges = (p: ProgressState, games = GAMES, sims = SIMS): Badge[] => computeBadges({ progress: p, lessons: LESSONS, quizzes: QUIZZES, games, sims });
const get = (list: Badge[], id: string) => list.find((b) => b.id === id)!;

describe('Badges', () => {
  it('has unique ids, a name, a way to earn it and a goal above zero for every badge', () => {
    const list = badges(empty());
    expect(new Set(list.map((b) => b.id)).size).toBe(list.length);
    expect(list.length).toBeGreaterThanOrEqual(15);
    for (const b of list) {
      expect(b.name.length, b.id).toBeGreaterThan(2);
      expect(b.how.length, b.id).toBeGreaterThan(8);
      expect(b.need, b.id).toBeGreaterThanOrEqual(1);
      expect(b.have, b.id).toBe(0);
      expect(b.earned, b.id).toBe(false);
    }
  });

  it('nothing is earned on a fresh start, and one game earns exactly the first-play badge', () => {
    const one = badges({ ...empty(), completedGames: ['hype_check'] });
    expect(one.filter((b) => b.earned).map((b) => b.id)).toEqual(['first_game']);
    expect(get(one, 'games_5')).toMatchObject({ have: 1, need: 5, earned: false });
    expect(get(one, 'games_all')).toMatchObject({ have: 1, need: GAMES.length });
  });

  it('counts only the games and labs the app has built, so a "coming soon" one can never be required', () => {
    const p = { ...empty(), completedGames: [...GAMES, 'a_game_that_is_not_built'] };
    const list = badges(p);
    expect(get(list, 'games_all')).toMatchObject({ have: GAMES.length, need: GAMES.length, earned: true });
    expect(get(list, 'games_5').earned).toBe(true);
  });

  it('a quiz needs its pass mark, and a perfect score earns the extra badge', () => {
    const quizId = Object.keys(QUIZZES)[0];
    const quiz = QUIZZES[quizId];
    const failed = badges({ ...empty(), quizScores: { [quizId]: 0.2 } });
    expect(get(failed, 'first_quiz').earned).toBe(false);
    const passedOnly = badges({ ...empty(), quizScores: { [quizId]: (quiz.questions.length - 1) / quiz.questions.length } });
    const perfect = badges({ ...empty(), quizScores: { [quizId]: 1 } });
    expect(get(perfect, 'first_quiz').earned).toBe(true);
    expect(get(perfect, 'perfect').earned).toBe(true);
    expect(get(passedOnly, 'perfect').earned).toBe(false);
  });

  it('finishing a part needs every module of that part done', () => {
    const part1 = LESSONS.filter((l) => l.part === 1);
    const scores: Record<string, number> = {};
    for (const l of part1) if (l.quizId) scores[l.quizId] = 1;
    const read = part1.filter((l) => !l.quizId).map((l) => l.id);
    const done = badges({ ...empty(), quizScores: scores, readLessons: read });
    expect(get(done, 'part1').earned).toBe(true);
    expect(get(done, 'part2').earned).toBe(false);
    const missing = badges({ ...empty(), quizScores: { ...scores, [part1[0].quizId as string]: 0 }, readLessons: read });
    expect(get(missing, 'part1').earned).toBe(false);
  });

  it('practice problems and the cat badge', () => {
    const five = badges({ ...empty(), solvedProblems: PRACTICE.slice(0, 5).map((p) => p.id) });
    expect(get(five, 'practice_5').earned).toBe(true);
    expect(get(five, 'practice_all')).toMatchObject({ have: 5, need: PRACTICE.length, earned: false });
    expect(get(badges({ ...empty(), completedGames: ['miltons_box'] }), 'milton').earned).toBe(true);
    expect(get(badges(empty()), 'milton').earned).toBe(false);
  });

  it('the hardware badge needs every Part 2 game that is built', () => {
    const part2Games = ['coherence_race', 'cool_down', 'ion_chain_conductor', 'quantum_architect'];
    const partial = badges({ ...empty(), completedGames: part2Games.slice(0, 2) });
    expect(get(partial, 'hardware_games').earned).toBe(false);
    const all = badges({ ...empty(), completedGames: part2Games });
    expect(get(all, 'hardware_games').earned).toBe(true);
    expect(get(all, 'architect').earned).toBe(true);
  });

  it('progress only ever adds badges: earning more never takes one away', () => {
    const steps: ProgressState[] = [];
    let p = empty();
    steps.push(p);
    p = { ...p, completedGames: ['hype_check'] };
    steps.push(p);
    p = { ...p, exploredSims: ['single_qubit_lab', 'circuit_lab'], completedGames: [...p.completedGames, 'miltons_box', 'coin_flip'] };
    steps.push(p);
    p = { ...p, completedGames: GAMES, exploredSims: SIMS, solvedProblems: PRACTICE.map((x) => x.id) };
    steps.push(p);
    let earned = new Set<string>();
    for (const step of steps) {
      const now = new Set(badges(step).filter((b) => b.earned).map((b) => b.id));
      for (const id of earned) expect(now.has(id), id).toBe(true);
      earned = now;
    }
  });

  it('the last badge needs all the others', () => {
    const list = badges(empty());
    const others = list.filter((b) => b.id !== 'completionist');
    expect(get(list, 'completionist').need).toBe(others.length);
    const quizzes: Record<string, number> = {};
    for (const q of Object.values(QUIZZES)) quizzes[q.id] = 1;
    const read = LESSONS.filter((l) => !l.quizId).map((l) => l.id);
    const everything = badges({
      ...empty(), completedGames: GAMES, exploredSims: SIMS, quizScores: quizzes, readLessons: read, solvedProblems: PRACTICE.map((x) => x.id),
    });
    expect(get(everything, 'completionist').earned).toBe(true);
    expect(everything.every((b) => b.earned)).toBe(true);
  });
});

describe('Ranks and new badges', () => {
  it('a rank only goes up with badges and says how many more the next one needs', () => {
    expect(rankFor(0).name).toBe('Curious kitten');
    expect(rankFor(0).next).toEqual({ name: 'Lab assistant', need: 3 });
    expect(rankFor(3).name).toBe('Lab assistant');
    let last = -1;
    for (let n = 0; n <= 20; n++) {
      const idx = RANKS.findIndex((r) => r.name === rankFor(n).name);
      expect(idx).toBeGreaterThanOrEqual(last);
      last = idx;
    }
    expect(rankFor(99).next).toBeNull();
  });

  it('marks as new only the earned badges that have not been seen', () => {
    const list = badges({ ...empty(), completedGames: ['hype_check'], exploredSims: ['circuit_lab'] });
    expect(newBadges(list, []).map((b) => b.id).sort()).toEqual(['first_game', 'first_lab']);
    expect(newBadges(list, ['first_game']).map((b) => b.id)).toEqual(['first_lab']);
    expect(newBadges(list, ['first_game', 'first_lab'])).toEqual([]);
  });

  it('remembers what was seen, and survives garbage in storage', () => {
    writeSeenBadges(['a', 'b', 'a']);
    expect(readSeenBadges()).toEqual(['a', 'b']);
    writeSeenBadges([]);
    expect(readSeenBadges()).toEqual([]);
  });
});
