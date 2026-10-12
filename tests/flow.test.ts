import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { LESSONS, LESSON_BY_ID } from '../src/content/lessons';
import { ACTIVITIES } from '../src/content/activities';
import { DEFAULT_FLOW, flowOrder, lessonFlow, roleOf } from '../src/core/learn/flow';
import type { ActivityLink } from '../src/content/types';

/** Everything built today (mirrors App.tsx), so these tests describe what a learner really sees. */
const GAMES = [
  'hype_check', 'quantum_heist', 'coin_flip', 'schrodingers_stealth', 'miltons_box', 'bloch_runner', 'photon_escape_room', 'alice_and_bob',
  'teleport_relay', 'gate_deck', 'oracle_detective', 'qubit_surgeon',
  'hold_bloch_sphere', 'shake_to_measure', 'entangled_pair',
  'coherence_race', 'cool_down', 'ion_chain_conductor', 'tweezer_shuffle', 'photon_factory',
  'dot_tuner', 'valley_roll', 'logical_qubit_builder', 'quantum_architect',
];
const SIMS = [
  'single_qubit_lab', 'shots_histogram_lab', 'circuit_lab', 'mach_zehnder_lab', 'two_qubit_lab', 'bell_chsh_explorer',
  'teleportation_lab', 'deutsch_jozsa_explorer', 'grover_explorer', 'noise_lab',
  'qubit_metrics_lab', 'transmon_lab', 'topology_compiler', 'rydberg_blockade_lab', 'loss_budget_lab',
  'exchange_coupling_lab', 'annealing_lab', 'overhead_calculator', 'comparison_dashboard',
  'maths_workbench',
];
/** The same lists from before Module 0 and Module 7 had their games and labs, to test a module whose activities are not built yet. */
const GAMES_BEFORE = GAMES.filter((g) => g !== 'hype_check' && g !== 'qubit_surgeon');
const SIMS_BEFORE = SIMS.filter((s) => s !== 'noise_lab');

const flow = (id: string, games = GAMES, sims = SIMS) => lessonFlow(LESSON_BY_ID[id], games, sims);
const steps = (id: string) => flow(id).stages.map((s) => s.step);
const ids = (id: string, step: string) => flow(id).stages.find((s) => s.step === step)?.activities.map((a) => a.id);

describe('Lesson flow: game, then video, then lab, then practice', () => {
  it('the lists of built games and labs above are what the app really offers (App.tsx)', () => {
    const app = readFileSync(fileURLToPath(new URL('../src/App.tsx', import.meta.url)), 'utf8');
    const inApp = [...app.matchAll(/^    id: '([a-z_]+)',\s*$/gm)].map((m) => m[1]);
    expect([...GAMES, ...SIMS].sort()).toEqual(inApp.sort());
  });

  it('games default to discover (before the video) and labs to explore (after it)', () => {
    expect(roleOf({ kind: 'game', id: 'x' })).toBe('discover');
    expect(roleOf({ kind: 'sim', id: 'x' })).toBe('explore');
    expect(roleOf({ kind: 'game', id: 'x', role: 'apply' })).toBe('apply');
    expect(DEFAULT_FLOW).toEqual(['discover', 'watch', 'explore', 'apply']);
  });

  it('a normal Part 1 module plays the game first, then the video, then the lab', () => {
    // module 1, 2 and 5A also end with a game that uses the phone's sensors (role: apply), which only the app shows
    const withSensorGame = ['module_1', 'module_2', 'module_5a'];
    for (const id of ['module_1', 'module_2', 'module_4', 'module_5a']) {
      expect(steps(id), id).toEqual(withSensorGame.includes(id) ? ['discover', 'watch', 'explore', 'apply'] : ['discover', 'watch', 'explore']);
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

  it('Orientation opens with Hype Check, and Noise & Error Correction with Qubit Surgeon, then the video, then the Noise Lab', () => {
    expect(steps('module_0')).toEqual(['discover', 'watch']);
    expect(ids('module_0', 'discover')).toEqual(['hype_check']);
    expect(flow('module_0').soon).toEqual([]);
    expect(steps('module_7')).toEqual(['discover', 'watch', 'explore']);
    expect(ids('module_7', 'discover')).toEqual(['qubit_surgeon']);
    expect(ids('module_7', 'explore')).toEqual(['noise_lab']);
    expect(flow('module_7').soon).toEqual([]);
  });

  it('a module whose game is not built yet starts with its video and lists the game as coming soon', () => {
    expect(flow('module_0', GAMES_BEFORE, SIMS_BEFORE).stages.map((s) => s.step)).toEqual(['watch']);
    expect(flow('module_0', GAMES_BEFORE, SIMS_BEFORE).soon.map((a) => a.id)).toEqual(['hype_check']);
    expect(flow('module_7', GAMES_BEFORE, SIMS_BEFORE).stages.map((s) => s.step)).toEqual(['watch']);
    expect(flow('module_7', GAMES_BEFORE, SIMS_BEFORE).soon.map((a) => a.id)).toEqual(['qubit_surgeon', 'noise_lab']);
  });

  it('Part 2 and Part 3 lessons open with their game when it is built, then the video, then any lab, and nothing waits under "coming soon" once everything is built', () => {
    for (const lesson of LESSONS.filter((l) => l.part !== 1)) {
      const f = flow(lesson.id);
      const built = (id: string) => GAMES.includes(id) || SIMS.includes(id);
      const openGames = lesson.activities.filter((a) => GAMES.includes(a.id));
      const openLabs = lesson.activities.filter((a) => SIMS.includes(a.id));
      const steps = [...(openGames.length ? ['discover'] : []), 'watch', ...(openLabs.length ? ['explore'] : [])];
      expect(f.stages.map((s) => s.step), lesson.id).toEqual(steps);
      expect(f.stages.find((s) => s.step === 'watch')!.videos.length).toBeGreaterThan(0);
      expect(f.stages.find((s) => s.step === 'discover')?.activities.map((a) => a.id) ?? [], lesson.id).toEqual(openGames.map((a) => a.id));
      expect(f.stages.find((s) => s.step === 'explore')?.activities.map((a) => a.id) ?? [], lesson.id).toEqual(openLabs.map((a) => a.id));
      expect(f.soon.map((a) => a.id), lesson.id).toEqual(lesson.activities.filter((a) => !built(a.id)).map((a) => a.id));
      expect(f.soon, lesson.id).toEqual([]);
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
        // a game that only exists in the installed app is either playable or simply absent: never "coming soon"
        const expected = lesson.activities
          .filter((a) => !ACTIVITIES[a.id].appOnly || (a.kind === 'game' ? games : sims).includes(a.id))
          .map((a) => `${a.kind}:${a.id}`)
          .sort();
        expect(placed, lesson.id).toEqual(expected);
        for (const a of f.soon) expect(ACTIVITIES[a.id].appOnly, `${lesson.id}: ${a.id} is not promised on the website`).toBeFalsy();
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

  it('only a few lessons override the default flow or use the apply role: the practice games, teleportation and the three sensor games', () => {
    const custom = LESSONS.filter((l) => l.flow).map((l) => l.id);
    expect(custom).toEqual(['module_5b']);
    const apply = LESSONS.flatMap((l) => l.activities.filter((a) => a.role === 'apply').map((a) => `${l.id}:${a.id}`));
    expect(apply.sort()).toEqual([
      'module_1:hold_bloch_sphere', 'module_2:shake_to_measure', 'module_3:gate_deck', 'module_5a:entangled_pair', 'module_5b:teleport_relay', 'module_6:gate_deck',
    ]);
    for (const a of LESSONS.flatMap((l) => l.activities)) expect(ACTIVITIES[a.id]).toBeDefined();
  });
});
