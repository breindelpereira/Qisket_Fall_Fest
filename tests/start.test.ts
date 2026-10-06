import { describe, it, expect } from 'vitest';
import { LESSONS, LESSON_BY_ID } from '../src/content/lessons';
import { lessonFlow } from '../src/core/learn/flow';
import {
  START_KEY, flowFor, hasStarted, readStartChoices, startOffer, writeStartChoice,
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
