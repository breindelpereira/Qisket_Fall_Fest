import { describe, it, expect } from 'vitest';
import { BINS, CARDS, PASS_MARK, ROUND_MIX, ROUND_SIZE, dealRound, judge, summariseRound } from '../src/core/games/hypeCheck';
import type { Bin } from '../src/core/games/hypeCheck';
import { LEVELS, gradePatient, gradePeek, makePatients, probesProve, summariseLevel } from '../src/core/games/qubitSurgeon';
import type { Patient, PatientResult, SurgeryLevel } from '../src/core/games/qubitSurgeon';
import { bestFix } from '../src/core/labs/errorCorrection';
import type { ProbeId } from '../src/core/labs/errorCorrection';

const flips = (p: Patient) => p.flips.filter(Boolean).length;
const play = (level: SurgeryLevel, probes: ProbeId[]) => {
  const patients = makePatients(level);
  const results: PatientResult[] = patients.map((p) => gradePatient(p, bestFix(p.flips), probes));
  return { patients, results, summary: summariseLevel(patients, results) };
};

describe('Hype Check', () => {
  it('has enough cards of each kind for a round, with unique ids and claims, and a reason for each', () => {
    expect(new Set(CARDS.map((c) => c.id)).size).toBe(CARDS.length);
    expect(new Set(CARDS.map((c) => c.claim)).size).toBe(CARDS.length);
    for (const bin of BINS) expect(CARDS.filter((c) => c.bin === bin.id).length, bin.id).toBeGreaterThan(ROUND_MIX[bin.id]);
    for (const c of CARDS) expect(c.why.length, c.id).toBeGreaterThan(40);
    expect(BINS.map((b) => b.id)).toEqual(['real', 'someday', 'hype']);
  });

  it('puts a claim in "maybe someday" only when it is worded as a maybe, and never hedges the other two', () => {
    const hedged = /\b(could|might|may|one day|someday)\b/i;
    for (const c of CARDS) {
      expect(hedged.test(c.claim), `${c.id}: ${c.claim}`).toBe(c.bin === 'someday');
    }
  });

  it('deals ten cards: three real, three maybe, four myths, never a repeat, never three of a kind in a row', () => {
    expect(ROUND_SIZE).toBe(10);
    for (let seed = 0; seed < 60; seed++) {
      const round = dealRound(seed);
      expect(round).toHaveLength(ROUND_SIZE);
      expect(new Set(round.map((c) => c.id)).size).toBe(ROUND_SIZE);
      for (const bin of Object.keys(ROUND_MIX) as Bin[]) expect(round.filter((c) => c.bin === bin).length, `seed ${seed} ${bin}`).toBe(ROUND_MIX[bin]);
      for (let i = 2; i < round.length; i++) expect(round[i].bin === round[i - 1].bin && round[i].bin === round[i - 2].bin, `seed ${seed} at ${i}`).toBe(false);
    }
  });

  it('deals the same round for the same seed, other rounds for other seeds, and uses every card eventually', () => {
    expect(dealRound(5).map((c) => c.id)).toEqual(dealRound(5).map((c) => c.id));
    const distinct = new Set(Array.from({ length: 20 }, (_, s) => dealRound(s).map((c) => c.id).join()));
    expect(distinct.size).toBeGreaterThan(10);
    const seen = new Set<string>();
    for (let seed = 0; seed < 100; seed++) for (const c of dealRound(seed)) seen.add(c.id);
    expect(seen.size).toBe(CARDS.length);
  });

  it('judges a choice against the card', () => {
    const card = CARDS.find((c) => c.id === 'every_answer')!;
    expect(judge(card, 'hype')).toEqual({ correct: true, right: 'hype' });
    expect(judge(card, 'real')).toEqual({ correct: false, right: 'hype' });
  });

  it('gives stars for how many were right, and clears the round at seven', () => {
    const answers = (right: number) => Array.from({ length: 10 }, (_, i) => i < right);
    expect(PASS_MARK).toBe(7);
    expect(summariseRound(answers(10))).toEqual({ correct: 10, total: 10, stars: 3, cleared: true });
    expect(summariseRound(answers(9)).stars).toBe(3);
    expect(summariseRound(answers(8))).toMatchObject({ stars: 2, cleared: true });
    expect(summariseRound(answers(7))).toMatchObject({ stars: 2, cleared: true });
    expect(summariseRound(answers(6))).toMatchObject({ stars: 1, cleared: false });
    expect(summariseRound(answers(5)).stars).toBe(1);
    expect(summariseRound(answers(4))).toMatchObject({ stars: 0, cleared: false });
    expect(summariseRound([])).toMatchObject({ correct: 0, total: 0, cleared: false });
  });
});

describe('Qubit Surgeon', () => {
  it('has four levels in order, each with a story, a lesson and at least the two probes that are always enough', () => {
    expect(LEVELS.map((l) => l.id)).toEqual([1, 2, 3, 4]);
    for (const l of LEVELS) {
      expect(l.story.length, `${l.id}`).toBeGreaterThan(40);
      expect(l.lesson.length, `${l.id}`).toBeGreaterThan(40);
      expect(l.probes.includes('A') && l.probes.includes('B'), `${l.id}`).toBe(true);
      expect(l.patients).toBeGreaterThanOrEqual(3);
    }
    expect(LEVELS[2].probes).toEqual(['A', 'B', 'C']);
  });

  it('makes the same patients every time, and a different ward when a level is replayed', () => {
    for (const level of LEVELS) {
      const first = makePatients(level);
      expect(first).toHaveLength(level.patients);
      expect(makePatients(level)).toEqual(first);
      const replays = [1, 2, 3].map((r) => JSON.stringify(makePatients(level, r)));
      expect(replays.some((r) => r !== JSON.stringify(first)), `level ${level.id}`).toBe(true);
    }
  });

  it('follows each level\'s noise: one hit, none or one, or any number', () => {
    for (let replay = 0; replay < 20; replay++) {
      expect(makePatients(LEVELS[0], replay).every((p) => flips(p) === 1)).toBe(true);
      for (const level of [LEVELS[1], LEVELS[2]]) {
        const ward = makePatients(level, replay);
        expect(ward.every((p) => flips(p) <= 1)).toBe(true);
        expect(ward.some((p) => flips(p) === 0), `level ${level.id}`).toBe(true);
        expect(ward.filter((p) => flips(p) === 1).length, `level ${level.id}`).toBeGreaterThanOrEqual(2);
      }
      const rough = makePatients(LEVELS[3], replay);
      expect(rough.some((p) => flips(p) >= 2), 'a rough night has a double fault').toBe(true);
      expect(rough.some((p) => flips(p) === 0)).toBe(true);
    }
  });

  it('two different probes prove the answer; one probe, or the same one twice, does not', () => {
    expect(probesProve([])).toBe(false);
    expect(probesProve(['A'])).toBe(false);
    expect(probesProve(['A', 'A'])).toBe(false);
    expect(probesProve(['A', 'B'])).toBe(true);
    expect(probesProve(['B', 'C'])).toBe(true);
    expect(probesProve(['A', 'C'])).toBe(true);
  });

  it('grades the right fix with proof as proven, without proof as lucky, and anything else as wrong', () => {
    const hit: Patient = { flips: [false, true, false] };
    const right = gradePatient(hit, 1, ['A', 'B']);
    expect(right).toMatchObject({ grade: 'proven', saved: true, unavoidable: false, outcome: 'clean', best: 1, probes: 2 });
    expect(gradePatient(hit, 1, ['A'])).toMatchObject({ grade: 'lucky', saved: true });
    expect(gradePatient(hit, 1, [])).toMatchObject({ grade: 'lucky' });
    expect(gradePatient(hit, 0, ['A', 'B'])).toMatchObject({ grade: 'wrong', saved: false, outcome: 'corrupted' });
    expect(gradePatient(hit, null, ['A', 'B'])).toMatchObject({ grade: 'wrong', saved: false });
    expect(gradePatient({ flips: [false, false, false] }, null, ['A', 'B'])).toMatchObject({ grade: 'proven', saved: true });
    expect(gradePatient({ flips: [false, false, false] }, 2, ['A', 'B'])).toMatchObject({ grade: 'wrong', saved: false });
  });

  it('a double fault cannot be saved by anyone, and doing everything right still earns full credit', () => {
    const double: Patient = { flips: [true, true, false] };
    expect(gradePatient(double, 2, ['A', 'B'])).toMatchObject({ grade: 'proven', saved: false, unavoidable: true, outcome: 'logical-flip' });
    const triple: Patient = { flips: [true, true, true] };
    expect(gradePatient(triple, null, ['A', 'B'])).toMatchObject({ grade: 'proven', saved: false, unavoidable: true });
  });

  it('perfect play earns three stars on every level, even where some patients cannot be saved', () => {
    for (const level of LEVELS) {
      const { patients, results, summary } = play(level, ['A', 'B']);
      expect(summary, `level ${level.id}`).toMatchObject({ wrong: 0, lucky: 0, extraProbes: 0, stars: 3, cleared: true });
      // the only patients lost are the ones with two or three flips
      expect(summary.lost).toBe(patients.filter((p) => flips(p) >= 2).length);
      expect(summary.unavoidable).toBe(summary.lost);
      expect(results.every((r) => r.grade === 'proven')).toBe(true);
    }
    expect(play(LEVELS[0], ['A', 'B']).summary.lost).toBe(0);
  });

  it('spare probes cost a star, guessing costs a star, and two wrong fixes fail the level', () => {
    expect(play(LEVELS[2], ['A', 'B', 'C']).summary).toMatchObject({ extraProbes: 5, stars: 2, cleared: true });
    const level = LEVELS[0];
    const patients = makePatients(level);
    const guessed = patients.map((p) => gradePatient(p, bestFix(p.flips), []));
    expect(summariseLevel(patients, guessed)).toMatchObject({ lucky: 3, stars: 2 });
    const oneWrong = patients.map((p, i) => gradePatient(p, i === 0 ? null : bestFix(p.flips), ['A', 'B']));
    expect(summariseLevel(patients, oneWrong)).toMatchObject({ wrong: 1, stars: 1, cleared: true });
    const twoWrong = patients.map((p, i) => gradePatient(p, i < 2 ? null : bestFix(p.flips), ['A', 'B']));
    expect(summariseLevel(patients, twoWrong)).toMatchObject({ wrong: 2, stars: 0, cleared: false });
  });

  it('measuring a data qubit directly always loses the patient, and counts as a wrong move', () => {
    const patients = makePatients(LEVELS[0]);
    for (const p of patients) expect(gradePeek(p, ['A'])).toMatchObject({ grade: 'wrong', saved: false, unavoidable: false, probes: 1 });
    expect(summariseLevel(patients, patients.map((p) => gradePeek(p, [])))).toMatchObject({ wrong: 3, stars: 0, cleared: false });
  });

  it('counts what an unprotected qubit would have lost under the same noise, for the comparison at the end', () => {
    const patients: Patient[] = [{ flips: [true, false, false] }, { flips: [false, true, false] }, { flips: [true, true, false] }, { flips: [false, false, false] }];
    const results = patients.map((p) => gradePatient(p, bestFix(p.flips), ['A', 'B']));
    expect(summariseLevel(patients, results)).toMatchObject({ bareLost: 2, lost: 1 });
  });
});
