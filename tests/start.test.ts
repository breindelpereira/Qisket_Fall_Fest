import { describe, it, expect } from 'vitest';
import { LESSONS, LESSON_BY_ID } from '../src/content/lessons';
import { lessonFlow } from '../src/core/learn/flow';
import {
  START_KEY, flowFor, hasStarted, nextAfterActivity, readStartChoices, startOffer, writeStartChoice,
} from '../src/core/learn/start';

const GAMES = [
  'quantum_heist', 'coin_flip', 'schrodingers_stealth', 'bloch_runner', 'photon_escape_room', 'alice_and_bob',
  'teleport_relay', 'gate_deck', 'oracle_detective',
];
const SIMS = [
  'single_qubit_lab', 'shots_histogram_lab', 'circuit_lab', 'mach_zehnder_lab', 'two_qubit_lab', 'bell_chsh_explorer',
  'teleportation_lab', 'deutsch_jozsa_explorer', 'grover_explorer',
];
const offer = (id: string, games = GAMES, sims = SIMS) => startOffer(LESSON_BY_ID[id], games, sims);

describe('Starting a module: play first, or choose the video', () => {
  it('modules that open with a game offer that game', () => {
    expect(offer('module_1')?.activity).toEqual({ kind: 'game', id: 'quantum_heist' });
    expect(offer('module_2')?.activity.id).toBe('schrodingers_stealth');
    expect(offer('module_3')?.activity.id).toBe('bloch_runner');
    expect(offer('module_4')?.activity.id).toBe('photon_escape_room');
    expect(offer('module_5a')?.activity.id).toBe('alice_and_bob');
    expect(offer('module_6')?.activity.id).toBe('oracle_detective');
    expect(offer('module_1')?.canWatch).toBe(true);
  });

  it('teleportation opens with its lab, because that is where the idea is explained', () => {
    expect(offer('module_5b')?.activity).toEqual({ kind: 'sim', id: 'teleportation_lab' });
  });

  it('modules that already start with their video have nothing to choose', () => {
    expect(offer('module_0')).toBeNull();
    expect(offer('module_7')).toBeNull();
    for (const l of LESSONS.filter((x) => x.part !== 1)) expect(startOffer(l, GAMES, SIMS), l.id).toBeNull();
    expect(offer('module_1', [], [])).toBeNull(); // nothing built, so the video is the start
  });

  it('the offered activity is always the first thing the page would show', () => {
    for (const lesson of LESSONS) {
      const o = startOffer(lesson, GAMES, SIMS);
      const first = lessonFlow(lesson, GAMES, SIMS).stages[0];
      if (o) expect(first.activities[0]).toEqual(o.activity);
      else expect(!first || first.step === 'watch').toBe(true);
    }
  });

  it('choosing "watch" moves the video to the front and keeps every other stage in its order', () => {
    expect(flowFor(LESSON_BY_ID.module_3, 'watch')).toEqual(['watch', 'discover', 'explore', 'apply']);
    expect(flowFor(LESSON_BY_ID.module_5b, 'watch')).toEqual(['watch', 'explore', 'apply', 'discover']);
    expect(flowFor(LESSON_BY_ID.module_3, 'play')).toEqual(['discover', 'watch', 'explore', 'apply']);
    expect(flowFor(LESSON_BY_ID.module_3, 'all')).toEqual(['discover', 'watch', 'explore', 'apply']);
    expect(flowFor(LESSON_BY_ID.module_3, undefined)).toEqual(['discover', 'watch', 'explore', 'apply']);
    const reordered = lessonFlow({ ...LESSON_BY_ID.module_3, flow: flowFor(LESSON_BY_ID.module_3, 'watch') }, GAMES, SIMS);
    expect(reordered.stages.map((s) => s.step)).toEqual(['watch', 'discover', 'explore', 'apply']);
  });

  it('a module counts as started after a choice or any progress on it', () => {
    const fresh = { status: 'new', played: false, explored: false };
    expect(hasStarted(undefined, fresh)).toBe(false);
    expect(hasStarted('play', fresh)).toBe(true);
    expect(hasStarted(undefined, { ...fresh, played: true })).toBe(true);
    expect(hasStarted(undefined, { ...fresh, explored: true })).toBe(true);
    expect(hasStarted(undefined, { ...fresh, status: 'attempted' })).toBe(true);
    expect(hasStarted(undefined, { ...fresh, status: 'done' })).toBe(true);
  });

  it('remembers choices per module and ignores anything unexpected in storage', () => {
    const data: Record<string, string> = {};
    const store = { getItem: (k: string) => data[k] ?? null, setItem: (k: string, v: string) => { data[k] = v; } };
    expect(readStartChoices(store)).toEqual({});
    let choices = writeStartChoice(store, {}, 'module_1', 'play');
    choices = writeStartChoice(store, choices, 'module_3', 'watch');
    expect(readStartChoices(store)).toEqual({ module_1: 'play', module_3: 'watch' });
    data[START_KEY] = JSON.stringify({ module_1: 'play', module_2: 'sideways', module_3: 7 });
    expect(readStartChoices(store)).toEqual({ module_1: 'play' });
    data[START_KEY] = '[1,2]';
    expect(readStartChoices(store)).toEqual({});
    data[START_KEY] = '{oops';
    expect(readStartChoices(store)).toEqual({});
    expect(readStartChoices(null)).toEqual({});
    const blocked = { getItem: () => { throw new Error('no'); }, setItem: () => { throw new Error('no'); } };
    expect(readStartChoices(blocked)).toEqual({});
    expect(writeStartChoice(blocked, {}, 'module_1', 'all')).toEqual({ module_1: 'all' });
  });
});

describe('After a game: what to offer next', () => {
  const next = (id: string, activity: string, choice?: 'play' | 'watch' | 'all', games = GAMES, sims = SIMS) =>
    nextAfterActivity(LESSON_BY_ID[id], activity, games, sims, choice);

  it('after the opening game the video comes next', () => {
    expect(next('module_1', 'quantum_heist')).toEqual({ kind: 'watch' });
    expect(next('module_2', 'schrodingers_stealth')).toEqual({ kind: 'watch' });
    expect(next('module_3', 'bloch_runner')).toEqual({ kind: 'watch' });
    expect(next('module_4', 'photon_escape_room')).toEqual({ kind: 'watch' });
    expect(next('module_5a', 'alice_and_bob')).toEqual({ kind: 'watch' });
    expect(next('module_6', 'oracle_detective')).toEqual({ kind: 'watch' });
  });

  it('after the practice game the quiz comes next', () => {
    expect(next('module_3', 'gate_deck')).toEqual({ kind: 'quiz' });
    expect(next('module_5b', 'teleport_relay')).toEqual({ kind: 'quiz' });
    expect(next('module_6', 'gate_deck')).toEqual({ kind: 'quiz' });
  });

  it('a module that starts with the lab goes lab, then video, then game', () => {
    expect(next('module_5b', 'teleportation_lab')).toEqual({ kind: 'watch' });
  });

  it('a learner who chose to watch first is then sent to the next stage after the video, not back to it', () => {
    // module 3 with the video first: video, game, lab, practice
    expect(next('module_3', 'bloch_runner', 'watch')).toEqual({ kind: 'activity', activity: { kind: 'sim', id: 'circuit_lab' } });
    expect(next('module_3', 'circuit_lab', 'watch')).toEqual({ kind: 'activity', activity: { kind: 'game', id: 'gate_deck', role: 'apply' } });
  });

  it('a lesson that has no quiz, or a game that is not in the lesson, goes back to the lesson page', () => {
    expect(nextAfterActivity({ ...LESSON_BY_ID.module_1, quizId: undefined }, 'single_qubit_lab', GAMES, SIMS)).toEqual({ kind: 'lesson' });
    expect(next('module_1', 'gate_deck')).toEqual({ kind: 'lesson' });
  });

  it('a video that does not exist is never offered: with no videos the next step skips ahead', () => {
    const noVideo = { ...LESSON_BY_ID.module_1, references: [] };
    expect(nextAfterActivity(noVideo, 'quantum_heist', GAMES, SIMS)).toEqual({ kind: 'activity', activity: { kind: 'sim', id: 'single_qubit_lab' } });
  });

  it('every game that opens a Part 1 module leads to a real next step', () => {
    for (const lesson of LESSONS) {
      for (const a of lesson.activities.filter((x) => x.kind === 'game' && GAMES.includes(x.id))) {
        const step = nextAfterActivity(lesson, a.id, GAMES, SIMS);
        expect(['watch', 'activity', 'quiz', 'lesson']).toContain(step.kind);
        if (step.kind === 'watch') expect(lesson.references.some((r) => r.kind === 'video')).toBe(true);
      }
    }
  });
});
