/**
 * Cool Down: a dilution refrigerator has several temperature stages, each able to carry away only so much heat. Every
 * qubit needs control and readout wiring that leaks heat into every stage it passes through. The player chooses how many
 * qubits to install, how they are wired and whether the readout is shared, and must keep every stage within its cooling
 * power.
 *
 * ALL NUMBERS ARE ILLUSTRATIVE. They are round numbers of the right order of magnitude (a few watts at 4 K, tens of
 * microwatts at the coldest stage), chosen so the trade-offs show; they are not measurements of any product. The point of
 * the game is the shape: the coldest stages have almost no cooling power, so wiring is the limit before the chip is.
 */
export type StageId = 'k50' | 'k4' | 'still' | 'cold' | 'mxc';

export interface Stage {
  id: StageId;
  name: string;
  temperature: string;
  /** Cooling power in milliwatts for the standard fridge (illustrative). */
  capacity: number;
}

export const STAGES: Stage[] = [
  { id: 'k50', name: '50 K plate', temperature: '50 K', capacity: 40000 },
  { id: 'k4', name: '4 K plate', temperature: '4 K', capacity: 1500 },
  { id: 'still', name: 'Still', temperature: '~0.8 K', capacity: 30 },
  { id: 'cold', name: 'Cold plate', temperature: '~0.1 K', capacity: 0.5 },
  { id: 'mxc', name: 'Mixing chamber', temperature: '~0.01 K', capacity: 0.02 },
];

export type Wiring = 'coax' | 'flex' | 'cmos';
export type Readout = 'dedicated' | 'shared';

export interface WiringOption {
  id: Wiring;
  name: string;
  about: string;
  /** Heat in milliwatts that ONE qubit adds to each stage (illustrative). */
  perQubit: Record<StageId, number>;
}

export const WIRINGS: WiringOption[] = [
  {
    id: 'coax', name: 'Coaxial cables', about: 'Two lines per qubit, the standard way. Simple, bulky, and each line leaks heat.',
    perQubit: { k50: 60, k4: 2.5, still: 0.1, cold: 0.004, mxc: 0.0002 },
  },
  {
    id: 'flex', name: 'Flexible cables', about: 'Thin printed cables with much less heat flowing down them, but a hotter 4 K plate.',
    perQubit: { k50: 90, k4: 3.5, still: 0.06, cold: 0.002, mxc: 0.00004 },
  },
  {
    id: 'cmos', name: 'Control chip at 4 K', about: 'A cryogenic control chip: very few cables go further down, but the chip itself warms the 4 K plate.',
    perQubit: { k50: 70, k4: 4, still: 0.01, cold: 0.0005, mxc: 0.00001 },
  },
];

export const READOUTS: { id: Readout; name: string; about: string; lowerStageFactor: number }[] = [
  { id: 'dedicated', name: 'One readout line per qubit', about: 'The simple way.', lowerStageFactor: 1 },
  { id: 'shared', name: 'Eight qubits share a line', about: 'Frequency multiplexing: fewer lines to the cold stages.', lowerStageFactor: 0.6 },
];

export interface Fridge {
  id: string;
  name: string;
  /** Multiplies every stage's cooling power. */
  scale: number;
}

export interface CoolLevel {
  id: string;
  title: string;
  story: string;
  fridge: Fridge;
  /** How many qubits the customer wants. */
  target: number;
  /** Wirings and readouts that are available on this level (the rest are greyed out). */
  wirings: Wiring[];
  readouts: Readout[];
}

export const LEVELS: CoolLevel[] = [
  {
    id: 'first_chip', title: 'A first chip', story: 'A small lab with a standard fridge wants a 50-qubit chip. Plain coaxial wiring is all the lab has.',
    fridge: { id: 'std', name: 'Standard fridge', scale: 1 }, target: 50, wirings: ['coax'], readouts: ['dedicated'],
  },
  {
    id: 'bigger', title: 'Doubling up', story: 'Same fridge, 150 qubits. Coax cannot carry the heat of that many lines to the coldest stage.',
    fridge: { id: 'std', name: 'Standard fridge', scale: 1 }, target: 150, wirings: ['coax', 'flex'], readouts: ['dedicated', 'shared'],
  },
  {
    id: 'hundreds', title: 'A few hundred', story: 'A big-lab fridge and 450 qubits. Cheap fixes run out: look at which stage fills up first.',
    fridge: { id: 'big', name: 'Large fridge', scale: 2 }, target: 450, wirings: ['coax', 'flex', 'cmos'], readouts: ['dedicated', 'shared'],
  },
  {
    id: 'old_fridge', title: 'An old fridge', story: 'A weaker, older fridge and 100 qubits. The cold stages have much less to give.',
    fridge: { id: 'old', name: 'Older fridge', scale: 0.4 }, target: 100, wirings: ['coax', 'flex', 'cmos'], readouts: ['dedicated', 'shared'],
  },
  {
    id: 'thousand', title: 'A thousand', story: 'A large fridge and a thousand qubits. This is where wiring, not the chip, sets the limit.',
    fridge: { id: 'huge', name: 'Very large fridge', scale: 3 }, target: 1000, wirings: ['coax', 'flex', 'cmos'], readouts: ['dedicated', 'shared'],
  },
];

export interface StageLoad {
  stage: Stage;
  /** Heat arriving at the stage, in milliwatts. */
  heat: number;
  /** Cooling power available at the stage, in milliwatts, for this fridge. */
  capacity: number;
  /** heat / capacity: 1 means exactly full. */
  fill: number;
  ok: boolean;
}

export interface Plan {
  qubits: number;
  wiring: Wiring;
  readout: Readout;
}

const LOWER: StageId[] = ['still', 'cold', 'mxc'];

/** Heat in each stage for a plan. Shared readout trims only the stages below 4 K. */
export function loads(plan: Plan, fridge: Fridge): StageLoad[] {
  const wiring = WIRINGS.find((w) => w.id === plan.wiring)!;
  const readout = READOUTS.find((r) => r.id === plan.readout)!;
  return STAGES.map((stage) => {
    const factor = LOWER.includes(stage.id) ? readout.lowerStageFactor : 1;
    const heat = plan.qubits * wiring.perQubit[stage.id] * factor;
    const capacity = stage.capacity * fridge.scale;
    return { stage, heat, capacity, fill: heat / capacity, ok: heat <= capacity + 1e-12 };
  });
}

/** True when every stage is within its cooling power. */
export const works = (plan: Plan, fridge: Fridge): boolean => loads(plan, fridge).every((l) => l.ok);

/** The stage that is fullest, which is the one that sets the limit. */
export const limitingStage = (plan: Plan, fridge: Fridge): StageLoad =>
  loads(plan, fridge).reduce((a, b) => (b.fill > a.fill ? b : a));

/** The most qubits a wiring and readout can support in a fridge: the stage that fills first sets it. */
export function maxQubits(wiring: Wiring, readout: Readout, fridge: Fridge): number {
  const one = loads({ qubits: 1, wiring, readout }, fridge);
  return Math.floor(Math.min(...one.map((l) => l.capacity / l.heat)));
}

export const wiringName = (id: Wiring): string => WIRINGS.find((w) => w.id === id)!.name;

/** Combinations that reach the level's target, as the game defines the choices. */
export function solutions(level: CoolLevel): Plan[] {
  const out: Plan[] = [];
  for (const wiring of level.wirings) {
    for (const readout of level.readouts) {
      if (maxQubits(wiring, readout, level.fridge) >= level.target) out.push({ qubits: level.target, wiring, readout });
    }
  }
  return out;
}

/** Stars: 3 if the plan leaves the fullest stage under 70% (a real margin), 2 under 90%, 1 otherwise; 0 if it does not work. */
export function stars(level: CoolLevel, plan: Plan): 0 | 1 | 2 | 3 {
  if (plan.qubits < level.target || !works(plan, level.fridge)) return 0;
  const fill = limitingStage(plan, level.fridge).fill;
  return fill <= 0.7 ? 3 : fill <= 0.9 ? 2 : 1;
}
