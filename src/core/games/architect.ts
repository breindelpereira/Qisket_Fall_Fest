import type { ModalityId } from '../../content/hardwareData';

/**
 * Quantum Architect (the capstone): a client brief says what a machine must do, and the player chooses the kind of
 * hardware and then defends the choice. There is no single best machine: each brief weighs some strengths and tolerates
 * some weaknesses, and more than one answer can be reasonable.
 *
 * The ratings are QUALITATIVE (0 to 3) and "typical": they summarise what the Part 2 lessons say about each approach, one
 * sentence each, and they are not measurements. A good argument for another rating is welcome; the numbers decide nothing
 * on their own. Real figures, with sources and dates, are in the Comparison Dashboard.
 */
export type CriterionId = 'speed' | 'fidelity' | 'connectivity' | 'scale' | 'cooling' | 'network';

export const CRITERIA: { id: CriterionId; name: string; about: string }[] = [
  { id: 'speed', name: 'Gate speed', about: 'How quickly gates run' },
  { id: 'fidelity', name: 'Accuracy', about: 'How accurate gates and memory are' },
  { id: 'connectivity', name: 'Connectivity', about: 'How freely qubits can interact' },
  { id: 'scale', name: 'Room to grow', about: 'Potential for many qubits (potential, not achieved)' },
  { id: 'cooling', name: 'Easy cooling', about: 'How little cold the machine needs (3 is easiest)' },
  { id: 'network', name: 'Networking', about: 'How naturally it links to other machines by light' },
];

export type Task = 'circuit' | 'optimisation';

export interface Rating {
  value: 0 | 1 | 2 | 3;
  why: string;
}

export interface Modality {
  id: ModalityId;
  name: string;
  /** True for machines that run general gate circuits. */
  gateModel: boolean;
  ratings: Record<CriterionId, Rating>;
}

const r = (value: 0 | 1 | 2 | 3, why: string): Rating => ({ value, why });

export const MODALITIES: Modality[] = [
  {
    id: 'superconducting', name: 'Superconducting circuits', gateModel: true,
    ratings: {
      speed: r(3, 'Gates typically take tens of nanoseconds, among the fastest of any approach.'),
      fidelity: r(2, 'Accuracy is good and improving, but the circuits are easily disturbed by stray fields and defects.'),
      connectivity: r(1, 'Qubits mostly interact with their neighbours on the chip.'),
      scale: r(2, 'Chips are made with chip-making methods, but wiring and cooling get hard as they grow.'),
      cooling: r(0, 'They work at millikelvin temperatures, which needs a dilution refrigerator.'),
      network: r(1, 'Microwave signals have to be converted to light to link machines, which is still research.'),
    },
  },
  {
    id: 'trapped_ion', name: 'Trapped ions', gateModel: true,
    ratings: {
      speed: r(1, 'Gates take microseconds to hundreds of microseconds, much slower than superconducting ones.'),
      fidelity: r(3, 'Gates are very accurate and the qubits stay coherent for a long time.'),
      connectivity: r(3, 'Inside one chain every ion can interact with every other.'),
      scale: r(1, 'A single chain gets harder to control as it grows, so machines have to link or move between traps.'),
      cooling: r(2, 'Ions sit in a vacuum chamber and are laser-cooled, with no dilution refrigerator in most designs.'),
      network: r(2, 'Ions emit single photons, which can be used to link separate traps.'),
    },
  },
  {
    id: 'neutral_atom', name: 'Neutral atoms', gateModel: true,
    ratings: {
      speed: r(1, 'Gates and readout are slower than superconducting ones, and doing them quickly is a challenge.'),
      fidelity: r(2, 'Entangling gates reach high accuracy in the best experiments, though controlling every atom is hard.'),
      connectivity: r(2, 'Tweezers can move atoms around, so who sits next to whom can be rearranged.'),
      scale: r(3, 'Arrays of hundreds to thousands of atoms fit in a small space.'),
      cooling: r(2, 'Atoms are laser-cooled in vacuum, with no dilution refrigerator.'),
      network: r(1, 'Linking arrays by light is possible but less developed.'),
    },
  },
  {
    id: 'photonic', name: 'Photonic qubits', gateModel: true,
    ratings: {
      speed: r(2, 'Light is fast, but the gates are probabilistic and need repeated attempts.'),
      fidelity: r(2, 'Photons keep their state well, but photon loss is the main enemy.'),
      connectivity: r(2, 'Light can be routed around a chip or between chips fairly freely.'),
      scale: r(3, 'Chips can be made in foundries and joined into modules.'),
      cooling: r(1, 'The light travels at room temperature, but the detectors usually need cooling.'),
      network: r(3, 'Photons are the natural carrier for sending quantum information through fibre.'),
    },
  },
  {
    id: 'silicon_spin', name: 'Silicon spin qubits', gateModel: true,
    ratings: {
      speed: r(2, 'Spin gates can be fast.'),
      fidelity: r(2, 'Small devices have reached the accuracy that error-correcting codes ask for.'),
      connectivity: r(1, 'Dots interact mostly with their neighbours.'),
      scale: r(3, 'The qubits are tiny and could in principle be made in the same factories as ordinary processors.'),
      cooling: r(1, 'They run around a kelvin or below: warmer than superconducting qubits, but still in a refrigerator.'),
      network: r(1, 'Linking spin qubits to light is an open research problem.'),
    },
  },
  {
    id: 'annealing', name: 'Quantum annealers', gateModel: false,
    ratings: {
      speed: r(0, 'It is not a gate machine, so there is no gate speed to compare.'),
      fidelity: r(0, 'It does not run gates, so gate accuracy does not apply.'),
      connectivity: r(1, 'Each qubit couples to a limited number of others on its chip.'),
      scale: r(3, 'Commercial machines already have thousands of qubits.'),
      cooling: r(0, 'They run at millikelvin temperatures in a dilution refrigerator.'),
      network: r(0, 'They are not designed to link to other machines.'),
    },
  },
];

export const modalityById = (id: ModalityId): Modality => MODALITIES.find((m) => m.id === id)!;

export interface Brief {
  id: string;
  title: string;
  client: string;
  text: string;
  task: Task;
  /** How much each strength matters to this client, 0 to 3. */
  weights: Record<CriterionId, 0 | 1 | 2 | 3>;
  /** Says what the best answers have in common, shown after the choice. */
  lesson: string;
}

export const BRIEFS: Brief[] = [
  {
    id: 'routes', title: 'Delivery routes', client: 'A delivery company',
    text: 'We need good (not perfect) answers to a huge scheduling problem, quickly and cheaply, with thousands of variables. We do not need to run general quantum programs.',
    task: 'optimisation',
    weights: { speed: 0, fidelity: 0, connectivity: 1, scale: 3, cooling: 1, network: 0 },
    lesson: 'This is an optimisation problem, which is what annealers are built for. Whether they beat the best classical solvers is still debated, so the honest advice is to try both and compare.',
  },
  {
    id: 'molecule', title: 'A molecule, accurately', client: 'A chemistry lab',
    text: 'We want to simulate a small molecule with a deep circuit. Accuracy and the freedom to apply gates between any pair of qubits matter more than speed.',
    task: 'circuit',
    weights: { speed: 1, fidelity: 3, connectivity: 3, scale: 1, cooling: 0, network: 0 },
    lesson: 'Deep circuits need accurate gates and good connectivity, and a few dozen qubits are enough. Slower gates are an acceptable price.',
  },
  {
    id: 'shor', title: 'Breaking a code, one day', client: 'A national research agency',
    text: 'We want a machine that could, in a decade, run a very long error-corrected computation. It needs many qubits and accurate gates. Nothing today comes close, so we are choosing a direction.',
    task: 'circuit',
    weights: { speed: 3, fidelity: 3, connectivity: 1, scale: 3, cooling: 0, network: 0 },
    lesson: 'Error correction needs many accurate qubits running fast cycles, so speed, accuracy and room to grow all count. Several approaches are serious contenders; none has shown the scale yet.',
  },
  {
    id: 'fast_qec', title: 'A fast test bench', client: 'A university group',
    text: 'We want to test error-correction cycles over and over, as quickly as possible, on a chip we can fabricate in a standard cleanroom.',
    task: 'circuit',
    weights: { speed: 3, fidelity: 2, connectivity: 1, scale: 1, cooling: 0, network: 0 },
    lesson: 'Short gates mean many correction cycles per second, which is where superconducting circuits stand out.',
  },
  {
    id: 'network', title: 'A quantum network', client: 'A telecom provider',
    text: 'We want quantum devices in different buildings linked by optical fibre, passing quantum information between them.',
    task: 'circuit',
    weights: { speed: 1, fidelity: 2, connectivity: 1, scale: 1, cooling: 1, network: 3 },
    lesson: 'Photons travel through fibre, so approaches that make and detect single photons fit naturally. Ions are the other candidate, using photons as the link between traps.',
  },
];

/** How well a machine suits the kind of task, 0 to 3. A gate machine can in principle try an optimisation problem. */
export function taskFit(m: Modality, task: Task): number {
  if (task === 'optimisation') return m.gateModel ? 1 : 3;
  return m.gateModel ? 3 : 0;
}

export interface Scored {
  modality: Modality;
  score: number;
  /** The most the brief could give: used to show a percentage. */
  max: number;
  /** Does it have what the brief cannot do without (here: it must run circuits for a circuit task)? */
  eligible: boolean;
  /** Within 80% of the best score, and eligible: a reasonable answer. */
  reasonable: boolean;
  best: boolean;
}

const TASK_WEIGHT = 4;

export function score(brief: Brief, m: Modality): { score: number; max: number } {
  let s = taskFit(m, brief.task) * TASK_WEIGHT;
  let max = 3 * TASK_WEIGHT;
  for (const c of CRITERIA) {
    s += m.ratings[c.id].value * brief.weights[c.id];
    max += 3 * brief.weights[c.id];
  }
  return { score: s, max };
}

export function assess(brief: Brief): Scored[] {
  const all = MODALITIES.map((modality) => {
    const { score: s, max } = score(brief, modality);
    return { modality, score: s, max, eligible: !(brief.task === 'circuit' && !modality.gateModel) };
  });
  const eligible = all.filter((a) => a.eligible).map((a) => a.score);
  const top = Math.max(...eligible);
  const bottom = Math.min(...eligible);
  // reasonable: close to the top, where "close" is a share of how far apart the eligible machines are
  const cutoff = top - Math.max(1, 0.4 * (top - bottom));
  return all.map((a) => ({ ...a, best: a.eligible && a.score === top, reasonable: a.eligible && a.score >= cutoff }));
}

export const choose = (brief: Brief, id: ModalityId): Scored => assess(brief).find((a) => a.modality.id === id)!;

/** The criteria that matter to the brief, most important first. */
export function importantCriteria(brief: Brief): CriterionId[] {
  return CRITERIA.map((c) => c.id).filter((c) => brief.weights[c] >= 2).sort((a, b) => brief.weights[b] - brief.weights[a]);
}

export interface ReasonSet {
  options: { text: string; true: boolean }[];
}

/** Plausible claims that the Part 2 lessons contradict, two for each machine: the wrong answers when a choice is defended. */
const MYTHS: Record<ModalityId, [string, string]> = {
  superconducting: ['They run at room temperature, so no refrigerator is needed.', 'Every qubit can interact directly with every other qubit on the chip.'],
  trapped_ion: ['Their gates are the fastest of any approach, taking tens of nanoseconds.', 'They need a dilution refrigerator running at millikelvin temperatures.'],
  neutral_atom: ['Their gates are the fastest of any approach, taking tens of nanoseconds.', 'The atoms are fixed in place, so which qubits can interact never changes.'],
  photonic: ['Photons are almost never lost, so loss is not a problem for them.', 'They need no cooling at all, not even for the detectors.'],
  silicon_spin: ['They need no cooling at all, because silicon is an ordinary material.', 'Every dot behaves identically, so no individual tuning is needed.'],
  annealing: ["They can run any quantum circuit, such as Shor's algorithm.", 'They have been proven faster than the best classical methods on practical problems.'],
};

/**
 * Three reasons to choose from, one true and two false. The true one is the machine's best strength among what the brief
 * cares about. The false ones are common misconceptions about that machine, which the lessons contradict.
 */
export function reasonsFor(brief: Brief, id: ModalityId): ReasonSet {
  const m = modalityById(id);
  const wanted = importantCriteria(brief).length ? importantCriteria(brief) : CRITERIA.map((c) => c.id);
  const strengths = [...wanted].sort((a, b) => m.ratings[b].value - m.ratings[a].value);
  const best = m.ratings[strengths[0]].value >= 2 ? strengths[0] : CRITERIA.map((c) => c.id).sort((a, b) => m.ratings[b].value - m.ratings[a].value)[0];
  const options = [{ text: m.ratings[best].why, true: true }, ...MYTHS[id].map((text) => ({ text, true: false }))];
  // a stable shuffle that depends on the brief and the machine, so the true sentence is not always first
  const shift = (brief.id.length + id.length) % options.length;
  return { options: [...options.slice(shift), ...options.slice(0, shift)] };
}

/**
 * Stars: 3 for a close-fitting machine defended with a true reason, 2 for a close-fitting machine with a false reason, 1 for
 * a machine that can do the job but is not a close fit, 0 for a machine that cannot do the job at all.
 */
export function stars(brief: Brief, id: ModalityId, reasonWasTrue: boolean): 0 | 1 | 2 | 3 {
  const s = choose(brief, id);
  if (!s.eligible) return 0;
  if (!s.reasonable) return 1;
  return reasonWasTrue ? 3 : 2;
}
