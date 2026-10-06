import { describe, it, expect } from 'vitest';
import { LESSONS, LESSON_BY_ID } from '../src/content/lessons';
import { ACTIVITIES } from '../src/content/activities';
import { DEFAULT_FLOW, flowOrder, lessonFlow, roleOf } from '../src/core/learn/flow';
import type { ActivityLink } from '../src/content/types';

/** Everything built today (mirrors App.tsx), so these tests describe what a learner really sees. */
const GAMES = [
  'quantum_heist', 'coin_flip', 'schrodingers_stealth', 'bloch_runner', 'photon_escape_room', 'alice_and_bob',
  'teleport_relay', 'gate_deck', 'oracle_detective',
];
const SIMS = [
  'single_qubit_lab', 'shots_histogram_lab', 'circuit_lab', 'mach_zehnder_lab', 'two_qubit_lab', 'bell_chsh_explorer',
  'teleportation_lab', 'deutsch_jozsa_explorer', 'grover_explorer',
];

const flow = (id: string, games = GAMES, sims = SIMS) => lessonFlow(LESSON_BY_ID[id], games, sims);
const steps = (id: string) => flow(id).stages.map((s) => s.step);
const ids = (id: string, step: string) => flow(id).stages.find((s) => s.step === step)?.activities.map((a) => a.id);

describe('Lesson flow: game, then video, then lab, then practice', () => {
  it('games default to discover (before the video) and labs to explore (after it)', () => {
    expect(roleOf({ kind: 'game', id: 'x' })).toBe('discover');
    expect(roleOf({ kind: 'sim', id: 'x' })).toBe('explore');
    expect(roleOf({ kind: 'game', id: 'x', role: 'apply' })).toBe('apply');
    expect(DEFAULT_FLOW).toEqual(['discover', 'watch', 'explore', 'apply']);
  });

  it('a normal Part 1 module plays the game first, then the video, then the lab', () => {
    for (const id of ['module_1', 'module_2', 'module_4', 'module_5a']) {
      expect(steps(id), id).toEqual(['discover', 'watch', 'explore']);
    }
    expect(ids('module_1', 'discover')).toEqual(['quantum_heist', 'coin_flip']);
    expect(ids('module_1', 'explore')).toEqual(['single_qubit_lab']);
  });

  it('Gates and circuits: Bloch Runner first, Gate Deck only after the Circuit Lab', () => {
    expect(steps('module_3')).toEqual(['discover', 'watch', 'explore', 'apply']);
    expect(ids('module_3', 'discover')).toEqual(['bloch_runner']);
    expect(ids('module_3', 'explore')).toEqual(['circuit_lab']);
    expect(ids('module_3', 'apply')).toEqual(['gate_deck']);
  });

  it('Teleportation: lab first, then the video, then the Relay game', () => {
    expect(steps('module_5b')).toEqual(['explore', 'watch', 'apply']);
    expect(ids('module_5b', 'explore')).toEqual(['teleportation_lab']);
    expect(ids('module_5b', 'apply')).toEqual(['teleport_relay']);
  });

  it('Algorithms: Oracle Detective first, Gate Deck last', () => {
    expect(steps('module_6')).toEqual(['discover', 'watch', 'explore', 'apply']);
    expect(ids('module_6', 'discover')).toEqual(['oracle_detective']);
    expect(ids('module_6', 'explore')).toEqual(['deutsch_jozsa_explorer', 'grover_explorer']);
    expect(ids('module_6', 'apply')).toEqual(['gate_deck']);
  });

  it('a module whose game is not built yet starts with its video and lists the game as coming soon', () => {
    expect(steps('module_0')).toEqual(['watch']);
    expect(flow('module_0').soon.map((a) => a.id)).toEqual(['hype_check']);
    expect(steps('module_7')).toEqual(['watch']);
    expect(flow('module_7').soon.map((a) => a.id)).toEqual(['qubit_surgeon', 'noise_lab']);
  });

  it('Part 2 and Part 3 lessons start with their video, and the unbuilt games and labs wait under "coming soon"', () => {
    for (const lesson of LESSONS.filter((l) => l.part !== 1)) {
      const f = flow(lesson.id);
      expect(f.stages.map((s) => s.step), lesson.id).toEqual(['watch']);
      expect(f.stages[0].videos.length).toBeGreaterThan(0);
      expect(f.soon.map((a) => a.id)).toEqual(lesson.activities.map((a) => a.id));
    }
  });

  it('the video stage carries the videos before the readings of a lesson', () => {
    const watch = flow('module_3').stages.find((s) => s.step === 'watch')!;
    expect(watch.videos.length).toBeGreaterThan(0);
    expect(watch.readings.length).toBeGreaterThan(0);
  });

  it('nothing is ever lost: every activity lands in exactly one stage or in "coming soon", whatever is built', () => {
    const availability: [string[], string[]][] = [[GAMES, SIMS], [[], []], [GAMES, []], [[], SIMS], [GAMES.slice(0, 3), SIMS.slice(0, 2)]];
    for (const [games, sims] of availability) {
      for (const lesson of LESSONS) {
        const f = lessonFlow(lesson, games, sims);
        const placed = [...f.stages.flatMap((s) => s.activities), ...f.soon].map((a: ActivityLink) => `${a.kind}:${a.id}`).sort();
        expect(placed, lesson.id).toEqual(lesson.activities.map((a) => `${a.kind}:${a.id}`).sort());
      }
    }
  });

  it('a stage never holds an activity of a different role, and never an unavailable one', () => {
    for (const lesson of LESSONS) {
      for (const stage of flow(lesson.id).stages) {
        for (const a of stage.activities) {
          expect(roleOf(a)).toBe(stage.step);
          expect((a.kind === 'game' ? GAMES : SIMS).includes(a.id)).toBe(true);
        }
      }
    }
  });

  it('a custom order that forgets a step does not drop it', () => {
    expect(flowOrder({ flow: ['explore', 'watch'] })).toEqual(['explore', 'watch', 'discover', 'apply']);
    expect(flowOrder({})).toEqual(DEFAULT_FLOW);
  });

  it('only the three lessons that need it override the default flow or use the apply role', () => {
    const custom = LESSONS.filter((l) => l.flow).map((l) => l.id);
    expect(custom).toEqual(['module_5b']);
    const apply = LESSONS.flatMap((l) => l.activities.filter((a) => a.role === 'apply').map((a) => `${l.id}:${a.id}`));
    expect(apply.sort()).toEqual(['module_3:gate_deck', 'module_5b:teleport_relay', 'module_6:gate_deck']);
    for (const a of LESSONS.flatMap((l) => l.activities)) expect(ACTIVITIES[a.id]).toBeDefined();
  });
});
