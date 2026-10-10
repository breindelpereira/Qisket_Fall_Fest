/**
 * Every game and lab in the plan, including ones that are not built yet.
 * Lessons link to these by id; the app decides which are playable (see availability in App.tsx),
 * and anything else is shown as "coming soon".
 */
export interface ActivityInfo {
  id: string;
  kind: 'game' | 'sim';
  title: string;
}

const game = (id: string, title: string): ActivityInfo => ({ id, kind: 'game', title });
const sim = (id: string, title: string): ActivityInfo => ({ id, kind: 'sim', title });

const LIST: ActivityInfo[] = [
  // Part 1 games
  game('hype_check', 'Hype Check'),
  game('quantum_heist', 'Quantum Heist'),
  game('coin_flip', 'Quantum Penny Paradox'),
  game('schrodingers_stealth', "Schrödinger's Stealth"),
  game('miltons_box', "Milton's Box"),
  game('bloch_runner', 'Bloch Runner'),
  game('photon_escape_room', 'Photon Escape Room'),
  game('alice_and_bob', 'Alice & Bob: Escape Together'),
  game('teleport_relay', 'Teleport Relay'),
  game('gate_deck', 'Gate Deck'),
  game('oracle_detective', 'Oracle Detective'),
  game('qubit_surgeon', 'Qubit Surgeon'),
  // Part 1 labs
  sim('single_qubit_lab', 'Single-Qubit Lab'),
  sim('shots_histogram_lab', 'Shots + Histogram Lab'),
  sim('circuit_lab', 'Circuit Lab'),
  sim('mach_zehnder_lab', 'Mach–Zehnder Lab'),
  sim('two_qubit_lab', 'Two-Qubit Lab'),
  sim('bell_chsh_explorer', 'Bell & CHSH Explorer'),
  sim('teleportation_lab', 'Teleportation Lab'),
  sim('deutsch_jozsa_explorer', 'Deutsch–Jozsa Explorer'),
  sim('grover_explorer', 'Grover Explorer'),
  sim('noise_lab', 'Noise Lab'),
  // Part 2 games
  game('coherence_race', 'Coherence Race'),
  game('cool_down', 'Cool Down'),
  game('ion_chain_conductor', 'Ion Chain Conductor'),
  game('tweezer_shuffle', 'Tweezer Shuffle'),
  game('photon_factory', 'Photon Factory'),
  game('dot_tuner', 'Dot Tuner'),
  game('valley_roll', 'Valley Roll'),
  game('logical_qubit_builder', 'Logical Qubit Builder'),
  game('quantum_architect', 'Quantum Architect'),
  // Part 2 labs
  sim('qubit_metrics_lab', 'Qubit Metrics Lab'),
  sim('transmon_lab', 'Transmon Lab'),
  sim('topology_compiler', 'Topology Compiler'),
  sim('rydberg_blockade_lab', 'Rydberg Blockade Lab'),
  sim('loss_budget_lab', 'Loss Budget Lab'),
  sim('exchange_coupling_lab', 'Exchange-Coupling Lab'),
  sim('annealing_lab', 'Annealing Lab'),
  sim('overhead_calculator', 'Overhead Calculator'),
  sim('comparison_dashboard', 'Comparison Dashboard'),
];

export const ACTIVITIES: Record<string, ActivityInfo> = Object.fromEntries(LIST.map((a) => [a.id, a]));
