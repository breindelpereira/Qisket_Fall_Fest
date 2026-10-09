import { afterFix, bestFix, diagnose, outcomeOf, parityOf, surgerySucceeded } from '../labs/errorCorrection';
import type { Fix, Flips, Outcome, ProbeId, Readings } from '../labs/errorCorrection';
import { mulberry32 } from './oracleDetective';

/**
 * Qubit Surgeon: each patient is one qubit spread over three data qubits (the repetition code). Noise has flipped some of
 * them. The player compares qubits with probes (which never read the data), decides which qubit to flip back, and learns
 * what the code can and cannot do. The physics is in core/labs/errorCorrection.ts.
 */
export type Noise =
  /** Exactly one qubit was hit. */
  | { kind: 'exactly-one' }
  /** Nothing was hit, or exactly one qubit was. */
  | { kind: 'at-most-one'; pNone: number }
  /** Every qubit is hit independently with chance p, so two or three can be hit at once. */
  | { kind: 'independent'; p: number };

export interface SurgeryLevel {
  id: number;
  title: string;
  story: string;
  /** The one idea this level is about, shown when it is finished. */
  lesson: string;
  patients: number;
  noise: Noise;
  /** The probes on the tray. */
  probes: ProbeId[];
  seed: number;
}

export const LEVELS: SurgeryLevel[] = [
  {
    id: 1,
    title: 'Intern Day',
    story: 'Each patient is one qubit spread across three data qubits. Exactly one of them was hit by noise and flipped. Compare qubits with the probes to find it, then flip it back.',
    lesson: 'Two probes point at the one flipped qubit, and nobody had to look at what the qubit holds.',
    patients: 3,
    noise: { kind: 'exactly-one' },
    probes: ['A', 'B'],
    seed: 101,
  },
  {
    id: 2,
    title: 'The Quiet Ward',
    story: 'Some patients were not hit at all. A healthy qubit must be left alone: operating on it would damage it.',
    lesson: 'When both probes say "they agree", no single flip happened. Fixing a healthy qubit would create an error.',
    patients: 5,
    noise: { kind: 'at-most-one', pNone: 0.4 },
    probes: ['A', 'B'],
    seed: 202,
  },
  {
    id: 3,
    title: 'Spare Probes',
    story: 'A third probe is on the tray. Probes take time, so use only what you need.',
    lesson: 'Any two probes are enough, because the third reading is just the other two added together. Extra probes only cost time.',
    patients: 5,
    noise: { kind: 'at-most-one', pNone: 0.2 },
    probes: ['A', 'B', 'C'],
    seed: 303,
  },
  {
    id: 4,
    title: 'Double Trouble',
    story: 'A rough night: noise hits every qubit with a 20% chance, so sometimes two are hit. Use the same method and see what the code can and cannot do.',
    lesson: 'One flip is always repaired. Two flips fool the vote and cannot be fixed, so protection is not perfect: the chance of losing the qubit falls from p to about 3p² − 2p³.',
    patients: 8,
    noise: { kind: 'independent', p: 0.2 },
    probes: ['A', 'B', 'C'],
    seed: 404,
  },
];

export interface Patient {
  flips: Flips;
}

const flipCount = (flips: readonly boolean[]) => flips.filter(Boolean).length;

function draw(noise: Noise, rng: () => number): Flips {
  if (noise.kind === 'independent') return [rng() < noise.p, rng() < noise.p, rng() < noise.p];
  if (noise.kind === 'at-most-one' && rng() < noise.pNone) return [false, false, false];
  const hit = Math.floor(rng() * 3);
  return [hit === 0, hit === 1, hit === 2];
}

/** A ward needs a bit of everything to teach its lesson: some healthy patients, some single flips, and for rough nights a double. */
function mixIsGood(noise: Noise, patients: Patient[]): boolean {
  const counts = [0, 1, 2, 3].map((k) => patients.filter((p) => flipCount(p.flips) === k).length);
  if (noise.kind === 'exactly-one') return true;
  if (noise.kind === 'at-most-one') return counts[0] >= 1 && counts[1] >= 2;
  return counts[0] >= 1 && counts[1] >= 2 && counts[2] + counts[3] >= 1;
}

/** The patients of a level. The same every time (a replay gets a different ward), so a level can be discussed and tested. */
export function makePatients(level: SurgeryLevel, replay = 0): Patient[] {
  let patients: Patient[] = [];
  for (let attempt = 0; attempt < 500; attempt++) {
    const rng = mulberry32(level.seed + replay * 977 + attempt * 31337);
    patients = Array.from({ length: level.patients }, () => ({ flips: draw(level.noise, rng) }));
    if (mixIsGood(level.noise, patients)) break;
  }
  return patients;
}

/** `proven`: the right fix, backed by probes that prove it. `lucky`: the right fix without proof. `wrong`: anything else. */
export type Grade = 'proven' | 'lucky' | 'wrong';

export interface PatientResult {
  grade: Grade;
  /** The qubit really is back to normal. */
  saved: boolean;
  /** Even the best possible surgeon loses this patient (two or three flips). */
  unavoidable: boolean;
  outcome: Outcome;
  best: Fix;
  probes: number;
}

export const readingsOf = (flips: Flips, used: readonly ProbeId[]): Readings => {
  const r: Readings = {};
  for (const id of used) r[id] = parityOf(flips, id);
  return r;
};

/** Do these probes, taken together, prove which qubit (if any) flipped? Two different probes do. */
export const probesProve = (used: readonly ProbeId[]): boolean => new Set(used).size >= 2;

export function gradePatient(patient: Patient, fix: Fix, used: readonly ProbeId[]): PatientResult {
  const best = bestFix(patient.flips);
  const proven = diagnose(readingsOf(patient.flips, used)) !== 'unknown';
  return {
    grade: fix !== best ? 'wrong' : proven ? 'proven' : 'lucky',
    saved: surgerySucceeded(patient.flips, fix),
    unavoidable: !surgerySucceeded(patient.flips, best),
    outcome: outcomeOf(afterFix(patient.flips, fix)),
    best,
    probes: new Set(used).size,
  };
}

/** The tempting mistake: reading a data qubit directly collapses the encoded state, so the patient is lost (and it was avoidable). */
export function gradePeek(patient: Patient, used: readonly ProbeId[]): PatientResult {
  return { grade: 'wrong', saved: false, unavoidable: false, outcome: 'corrupted', best: bestFix(patient.flips), probes: new Set(used).size };
}

export interface LevelSummary {
  wrong: number;
  lucky: number;
  /** Patients whose qubit was not saved, for any reason. */
  lost: number;
  /** Of those, patients nobody could have saved. */
  unavoidable: number;
  /** Probes used beyond the two that are always enough. */
  extraProbes: number;
  /** How many patients an unprotected single qubit would have lost under the same noise (its flip is the first qubit's). */
  bareLost: number;
  stars: 0 | 1 | 2 | 3;
  cleared: boolean;
}

/**
 * Stars reward the method, not luck: patients nobody could save do not count against you. Three stars: every fix proven with
 * no spare probes. Two: no wrong fixes. One: a single wrong fix. None: more than one.
 */
export function summariseLevel(patients: Patient[], results: PatientResult[]): LevelSummary {
  const wrong = results.filter((r) => r.grade === 'wrong').length;
  const lucky = results.filter((r) => r.grade === 'lucky').length;
  const extraProbes = Math.max(0, results.reduce((n, r) => n + r.probes, 0) - 2 * results.length);
  const stars = wrong >= 2 ? 0 : wrong === 1 ? 1 : lucky > 0 || extraProbes > 0 ? 2 : 3;
  return {
    wrong,
    lucky,
    lost: results.filter((r) => !r.saved).length,
    unavoidable: results.filter((r) => r.unavoidable).length,
    extraProbes,
    bareLost: patients.filter((p) => p.flips[0]).length,
    stars,
    cleared: stars >= 1,
  };
}
