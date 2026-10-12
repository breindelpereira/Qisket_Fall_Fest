import { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import type { ComponentType } from 'react';
import {
  Home,
  Gamepad2,
  FlaskConical,
  BookOpen,
  Sparkles,
  Play,
  ChevronLeft,
  Star,
  Compass,
  Trophy,
} from 'lucide-react';
import { useProgress } from './hooks/useProgress';
import { HonestyTagBadge } from './components/shared/HonestyTag';
import { Milton } from './components/shared/Milton';
import type { HonestyTag } from './content/types';
import { HypeCheck } from './components/games/HypeCheck';
import { QuantumHeist } from './components/games/QuantumHeist';
import { QuantumCoinFlip } from './components/games/QuantumCoinFlip';
import { SchrodingersStealth } from './components/games/SchrodingersStealth';
import { MiltonsBox } from './components/games/MiltonsBox';
import { BlochRunner } from './components/games/BlochRunner';
import { PhotonEscapeRoom } from './components/games/PhotonEscapeRoom';
import { AliceAndBob } from './components/games/AliceAndBob';
import { TeleportRelay } from './components/games/TeleportRelay';
import { GateDeck } from './components/games/GateDeck';
import { OracleDetective } from './components/games/OracleDetective';
import { QubitSurgeon } from './components/games/QubitSurgeon';
import { HoldBlochSphere } from './components/games/HoldBlochSphere';
import { ShakeToMeasure } from './components/games/ShakeToMeasure';
import { EntangledPair } from './components/games/EntangledPair';
import { CoherenceRace } from './components/games/CoherenceRace';
import { CoolDown } from './components/games/CoolDown';
import { IonChainConductor } from './components/games/IonChainConductor';
import { TweezerShuffle } from './components/games/TweezerShuffle';
import { PhotonFactory } from './components/games/PhotonFactory';
import { DotTuner } from './components/games/DotTuner';
import { ValleyRoll } from './components/games/ValleyRoll';
import { LogicalQubitBuilder } from './components/games/LogicalQubitBuilder';
import { QuantumArchitect } from './components/games/QuantumArchitect';
import { SingleQubitLab } from './components/simulations/SingleQubitLab';
import { ShotsHistogramLab } from './components/simulations/ShotsHistogramLab';
import { CircuitLab } from './components/simulations/CircuitLab';
import { MachZehnderLab } from './components/simulations/MachZehnderLab';
import { TwoQubitLab } from './components/simulations/TwoQubitLab';
import { BellChshExplorer } from './components/simulations/BellChshExplorer';
import { TeleportationLab } from './components/simulations/TeleportationLab';
import { DeutschJozsaExplorer } from './components/simulations/DeutschJozsaExplorer';
import { GroverExplorer } from './components/simulations/GroverExplorer';
import { NoiseLab } from './components/simulations/NoiseLab';
import { MathsWorkbench } from './components/simulations/MathsWorkbench';
import { QubitMetricsLab } from './components/simulations/QubitMetricsLab';
import { TransmonLab } from './components/simulations/TransmonLab';
import { TopologyCompiler } from './components/simulations/TopologyCompiler';
import { RydbergBlockadeLab } from './components/simulations/RydbergBlockadeLab';
import { LossBudgetLab } from './components/simulations/LossBudgetLab';
import { ExchangeCouplingLab } from './components/simulations/ExchangeCouplingLab';
import { AnnealingLab } from './components/simulations/AnnealingLab';
import { OverheadCalculator } from './components/simulations/OverheadCalculator';
import { ComparisonDashboard } from './components/simulations/ComparisonDashboard';
import { LearnTab } from './components/learn/LearnTab';
import type { LearnView } from './components/learn/learnView';
import { AfterGameSheet } from './components/learn/AfterGameSheet';
import { TutorDrawer } from './components/tutor/TutorDrawer';
import { ProgressView } from './components/progress/ProgressView';
import { useBadges } from './hooks/useBadges';
import { isAppBuild } from './utils/motion';
import { useBackNavigation } from './hooks/useBackNavigation';
import { tutorPosition } from './core/tutor/position';
import type { TutorFocus } from './core/tutor/types';
import { LESSONS, LESSON_BY_ID, QUIZZES } from './content/lessons';
import { ProgressStore } from './utils/progressStore';
import { startOffer } from './core/learn/start';
import { courseProgressPercent, moduleEyebrow, nextUpLesson, partProgress } from './core/learn/curriculum';
import { passes } from './core/learn/quiz';

type Tab = 'home' | 'learn' | 'games' | 'sims' | 'progress';

interface GameEntry {
  id: string;
  title: string;
  emoji: string;
  kicker: string;
  blurb: string;
  tag: HonestyTag;
  btn: string; // .btn variant class
  accent: string;
  Component: ComponentType;
  /** Needs the phone's sensors, so it is only listed in the installed app. */
  appOnly?: boolean;
}

const GAMES: GameEntry[] = [
  {
    id: 'hype_check',
    title: 'Hype Check',
    emoji: '🧐',
    kicker: 'Card sort · 10 claims',
    blurb: 'Quantum computing comes wrapped in big claims. Sort each one into real today, maybe someday, or hype, and find out why. No timer.',
    tag: 'Simplified model',
    btn: '',
    accent: 'var(--yellow)',
    Component: HypeCheck,
  },
  {
    id: 'quantum_heist',
    title: 'Quantum Heist',
    emoji: '⚡',
    kicker: '8-bit arcade · 3 stages',
    blurb: 'Infiltrate the Central Quantum Bank! Use the Hadamard gate to split into 50/50 superposition ghosts, defeat phase traps, and aim the 3D Bloch radar!',
    tag: 'Simplified model',
    btn: '',
    accent: 'var(--yellow)',
    Component: QuantumHeist,
  },
  {
    id: 'coin_flip',
    title: 'Quantum Penny Paradox',
    emoji: '🪙',
    kicker: 'Cyber casino · paradox',
    blurb: "Challenge Dr. Quantum in David Meyer's famous game. Discover why classical strategy always loses, and unlock quantum gates to fight back!",
    tag: 'Accurate',
    btn: 'btn-violet',
    accent: 'var(--violet)',
    Component: QuantumCoinFlip,
  },
  {
    id: 'schrodingers_stealth',
    title: "Schrödinger's Stealth",
    emoji: '🐾',
    kicker: 'Tactical stealth · 3 sectors',
    blurb: 'Observe without collapsing! Guide Agent Schrödinger through Z-basis and X-basis laser checkpoints using quantum basis lenses.',
    tag: 'Accurate',
    btn: 'btn-mint',
    accent: 'var(--mint)',
    Component: SchrodingersStealth,
  },
  {
    id: 'miltons_box',
    title: "Milton's Box",
    emoji: '😺',
    kicker: 'Born rule · 5 boxes',
    blurb: "Schrödinger's cat, as one qubit. Read the odds off the amplitudes, build a 50/50 box, steer it with a sign flip, and see why a second look never changes the answer. No timer.",
    tag: 'Analogy',
    btn: 'btn-orange',
    accent: '#ff9f1c',
    Component: MiltonsBox,
  },
  {
    id: 'bloch_runner',
    title: 'Bloch Runner',
    emoji: '🏃',
    kicker: 'Gate puzzles · 8 levels',
    blurb: 'Race around the Bloch sphere! Pick the right gate each move to steer your qubit onto the target, using as few moves as you can. No timer.',
    tag: 'Accurate',
    btn: 'btn-orange',
    accent: '#ff9f1c',
    Component: BlochRunner,
  },
  {
    id: 'photon_escape_room',
    title: 'Photon Escape Room',
    emoji: '🔦',
    kicker: 'Optics puzzles · 6 rooms',
    blurb: 'Lock a single photon in an interferometer and make it leave by the door you choose. Beam splitters, phase shifters and a sneaky saboteur.',
    tag: 'Accurate',
    btn: 'btn-sky',
    accent: '#38c8ff',
    Component: PhotonEscapeRoom,
  },
  {
    id: 'alice_and_bob',
    title: 'Alice & Bob: Escape Together',
    emoji: '🔗',
    kicker: 'Entanglement · CHSH game',
    blurb: 'Two prisoners, one rule, no talking. See why classical teams cap at 75%, then share an entangled pair to beat it.',
    tag: 'Simplified model',
    btn: 'btn-pink',
    accent: 'var(--pink)',
    Component: AliceAndBob,
  },
  {
    id: 'teleport_relay',
    title: 'Teleport Relay',
    emoji: '📡',
    kicker: 'Teleportation · repeater chain',
    blurb: "Pass a qubit along a chain of repeaters. At every hop read Alice's two bits and fix the qubit, or the message is lost.",
    tag: 'Accurate',
    btn: 'btn-sky',
    accent: '#38c8ff',
    Component: TeleportRelay,
  },
  {
    id: 'gate_deck',
    title: 'Gate Deck',
    emoji: '🃏',
    kicker: 'Card puzzles · 9 levels',
    blurb: 'Build the gate you need from the cards in your hand: Z from H and X, a reversed CNOT, even a SWAP. No timer.',
    tag: 'Accurate',
    btn: 'btn-violet',
    accent: 'var(--violet)',
    Component: GateDeck,
  },
  {
    id: 'oracle_detective',
    title: 'Oracle Detective',
    emoji: '🕵️',
    kicker: 'Algorithms · 6 case files',
    blurb: 'Constant or balanced? Open lockers one at a time, then call in the quantum informant who needs just one question.',
    tag: 'Accurate',
    btn: 'btn-mint',
    accent: 'var(--mint)',
    Component: OracleDetective,
  },
  {
    id: 'qubit_surgeon',
    title: 'Qubit Surgeon',
    emoji: '🩺',
    kicker: 'Error correction · 4 wards',
    blurb: 'Find the flipped qubit by comparing qubits, never by looking at them, then flip it back. And see why two flips at once fool the code.',
    tag: 'Simplified model',
    btn: 'btn-pink',
    accent: 'var(--pink)',
    Component: QubitSurgeon,
  },
  {
    id: 'coherence_race',
    title: 'Coherence Race',
    emoji: '🏁',
    kicker: 'Qubit quality · 5 laps',
    blurb: "Pick how fast to run the gates of a circuit: too slow and the qubit forgets, too fast and the gates are sloppy. Finish inside the coherence time with a clean run.",
    tag: 'Simplified model',
    btn: 'btn',
    accent: 'var(--yellow)',
    Component: CoherenceRace,
  },
  {
    id: 'cool_down',
    title: 'Cool Down',
    emoji: '🧊',
    kicker: 'Cryogenics · 5 fridges',
    blurb: "Fit more and more qubits into a dilution refrigerator without overloading any temperature stage. The coldest stage has almost no cooling power: choose your wiring wisely.",
    tag: 'Simplified model',
    btn: 'btn-sky',
    accent: '#38c8ff',
    Component: CoolDown,
  },
  {
    id: 'ion_chain_conductor',
    title: 'Ion Chain Conductor',
    emoji: '🔗',
    kicker: 'Trapped ions · 5 zones',
    blurb: "Ions can only interact in the same trap, and shuttling costs a move. Run a list of gates across several traps with as few moves as you can.",
    tag: 'Simplified model',
    btn: 'btn-mint',
    accent: 'var(--mint)',
    Component: IonChainConductor,
  },
  {
    id: 'tweezer_shuffle',
    title: 'Tweezer Shuffle',
    emoji: '🪤',
    kicker: 'Neutral atoms · 5 arrays',
    blurb: "Move atoms one site at a time with optical tweezers into a target pattern, around blocked sites and in as few moves as you can.",
    tag: 'Simplified model',
    btn: 'btn-orange',
    accent: '#ff9f1c',
    Component: TweezerShuffle,
  },
  {
    id: 'photon_factory',
    title: 'Photon Factory',
    emoji: '🏭',
    kicker: 'Photonic · 5 lines',
    blurb: "Photonic steps only work some of the time. Spend sources on copies to make the chain dependable, but every switch layer costs light.",
    tag: 'Simplified model',
    btn: 'btn-sky',
    accent: '#38c8ff',
    Component: PhotonFactory,
  },
  {
    id: 'dot_tuner',
    title: 'Dot Tuner',
    emoji: '🎛️',
    kicker: 'Silicon spins · 5 devices',
    blurb: "Set the gate voltages so each quantum dot holds one electron, then tune the barrier until a pulse makes a swap or half a swap. Every device is a little different.",
    tag: 'Simplified model',
    btn: 'btn-pink',
    accent: 'var(--pink)',
    Component: DotTuner,
  },
  {
    id: 'valley_roll',
    title: 'Valley Roll',
    emoji: '⛰️',
    kicker: 'Annealing · 5 landscapes',
    blurb: "Spend a time budget on annealing runs to find the lowest valley of a landscape. Quick runs are cheap and slow runs are sure: find the balance.",
    tag: 'Simplified model',
    btn: 'btn-violet',
    accent: 'var(--violet)',
    Component: ValleyRoll,
  },
  {
    id: 'logical_qubit_builder',
    title: 'Logical Qubit Builder',
    emoji: '🧱',
    kicker: 'Error correction · 5 builds',
    blurb: "Turn noisy physical qubits into one good logical qubit. Below the threshold a bigger code wins; above it, nothing helps until the hardware does.",
    tag: 'Simplified model',
    btn: 'btn-pink',
    accent: 'var(--pink)',
    Component: LogicalQubitBuilder,
  },
  {
    id: 'quantum_architect',
    title: 'Quantum Architect',
    emoji: '📐',
    kicker: 'Capstone · 5 briefs',
    blurb: "Read a client's brief, choose the kind of machine that fits, and defend the choice. Sometimes the honest answer is an annealer, sometimes several machines will do.",
    tag: 'Simplified model',
    btn: 'btn',
    accent: 'var(--yellow)',
    Component: QuantumArchitect,
  },
  {
    id: 'hold_bloch_sphere',
    title: 'Hold the Bloch Sphere',
    emoji: '🧭',
    kicker: 'Phone tilt · app only',
    blurb: "Tilt your phone to steer a qubit around the Bloch sphere and hold it on the glowing target. Your tilt is only a control: the quantum state is computed by the app's engine.",
    tag: 'Analogy',
    btn: 'btn-sky',
    accent: '#38c8ff',
    Component: HoldBlochSphere,
    appOnly: true,
  },
  {
    id: 'shake_to_measure',
    title: 'Shake to Measure',
    emoji: '📳',
    kicker: 'Phone shake · app only',
    blurb: "Shake the phone to measure a hidden qubit again and again, and find its odds from the histogram. Then see why measuring the same qubit twice gives the same answer.",
    tag: 'Analogy',
    btn: 'btn-mint',
    accent: 'var(--mint)',
    Component: ShakeToMeasure,
    appOnly: true,
  },
  {
    id: 'entangled_pair',
    title: 'Entangled Pair',
    emoji: '🤝',
    kicker: 'Pass the phone · app only',
    blurb: "Two players, one entangled pair, no talking. Tilt to choose your measurement angle, pass the phone and see if you can beat the 75% that fixed answers allow.",
    tag: 'Analogy',
    btn: 'btn-pink',
    accent: 'var(--pink)',
    Component: EntangledPair,
    appOnly: true,
  },
];

/** What this build shows: the sensor games only exist in the installed app (and the development server). */
const SHOWN_GAMES = GAMES.filter((g) => !g.appOnly || isAppBuild(Capacitor.isNativePlatform(), import.meta.env.DEV));

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'learn', label: 'Learn', icon: BookOpen },
  { id: 'games', label: 'Games', icon: Gamepad2 },
  { id: 'sims', label: 'Labs', icon: FlaskConical },
  { id: 'progress', label: 'Progress', icon: Trophy },
];

interface SimEntry {
  id: string;
  title: string;
  emoji: string;
  kicker: string;
  blurb: string;
  tag: HonestyTag;
  btn: string;
  accent: string;
  Component: ComponentType;
}

const SIMS: SimEntry[] = [
  {
    id: 'single_qubit_lab',
    title: 'Single-Qubit Lab',
    emoji: '🧭',
    kicker: 'Bloch sphere · qubits',
    blurb: 'Steer one qubit around the Bloch sphere with gates and phase, then sample it to see the odds.',
    tag: 'Accurate',
    btn: 'btn-pink',
    accent: 'var(--pink)',
    Component: SingleQubitLab,
  },
  {
    id: 'shots_histogram_lab',
    title: 'Shots + Histogram Lab',
    emoji: '📊',
    kicker: 'Measurement · statistics',
    blurb: 'Repeat a measurement 10, 100, 1000 or 10,000 times and watch the histogram settle onto the prediction.',
    tag: 'Accurate',
    btn: 'btn-mint',
    accent: 'var(--mint)',
    Component: ShotsHistogramLab,
  },
  {
    id: 'circuit_lab',
    title: 'Circuit Lab',
    emoji: '🧩',
    kicker: 'Gates · up to 3 qubits',
    blurb: 'Drop H, X, Y, Z, S, T and CNOT gates onto wires and see every probability and amplitude. Famous circuits are one tap away.',
    tag: 'Accurate',
    btn: 'btn-orange',
    accent: '#ff9f1c',
    Component: CircuitLab,
  },
  {
    id: 'mach_zehnder_lab',
    title: 'Mach–Zehnder Lab',
    emoji: '🔦',
    kicker: 'Interference · one photon',
    blurb: 'Turn the phase, block an arm, fire photons. See the fringes appear and vanish, and try the Elitzur–Vaidman bomb test.',
    tag: 'Accurate',
    btn: 'btn-sky',
    accent: '#38c8ff',
    Component: MachZehnderLab,
  },
  {
    id: 'two_qubit_lab',
    title: 'Two-Qubit Lab',
    emoji: '🔗',
    kicker: 'Entanglement · Bell pair',
    blurb: 'Apply gates to Alice and Bob, build a Bell pair, and see why each qubit alone has no state of its own.',
    tag: 'Accurate',
    btn: 'btn-pink',
    accent: 'var(--pink)',
    Component: TwoQubitLab,
  },
  {
    id: 'bell_chsh_explorer',
    title: 'Bell & CHSH Explorer',
    emoji: '🎯',
    kicker: 'Nonlocality · CHSH',
    blurb: 'Choose four measurement angles and watch S climb past the classical limit of 2 toward 2√2.',
    tag: 'Accurate',
    btn: 'btn-violet',
    accent: 'var(--violet)',
    Component: BellChshExplorer,
  },
  {
    id: 'teleportation_lab',
    title: 'Teleportation Lab',
    emoji: '📡',
    kicker: 'Teleportation · 3 qubits',
    blurb: 'Send an unknown qubit with a Bell pair and two classical bits. Step through it, then break it by withholding the bits.',
    tag: 'Accurate',
    btn: 'btn-sky',
    accent: '#38c8ff',
    Component: TeleportationLab,
  },
  {
    id: 'deutsch_jozsa_explorer',
    title: 'Deutsch–Jozsa Explorer',
    emoji: '🕵️',
    kicker: 'Algorithms · one query',
    blurb: 'Build a black-box function and decide constant or balanced with a single quantum query.',
    tag: 'Accurate',
    btn: 'btn-mint',
    accent: 'var(--mint)',
    Component: DeutschJozsaExplorer,
  },
  {
    id: 'grover_explorer',
    title: 'Grover Explorer',
    emoji: '🔍',
    kicker: 'Algorithms · search',
    blurb: 'Hide a prize in a list and watch amplitude pile up on it, round by round. Then overshoot and watch it drain away.',
    tag: 'Accurate',
    btn: 'btn-orange',
    accent: '#ff9f1c',
    Component: GroverExplorer,
  },
  {
    id: 'noise_lab',
    title: 'Noise Lab',
    emoji: '📉',
    kicker: 'Noise · repetition code',
    blurb: 'Turn up the noise and watch a group of qubits beat a single one, until the noise gets too high. Then find an error without reading the data.',
    tag: 'Simplified model',
    btn: 'btn-violet',
    accent: 'var(--violet)',
    Component: NoiseLab,
  },
  {
    id: 'qubit_metrics_lab',
    title: 'Qubit Metrics Lab',
    emoji: '📏',
    kicker: 'Coherence · gate budget',
    blurb: 'Set T1, T2, gate time and error, and see how many gates fit before the answer is spoiled. Two limits compete: the smaller one is your budget.',
    tag: 'Simplified model',
    btn: 'btn',
    accent: 'var(--yellow)',
    Component: QubitMetricsLab,
  },
  {
    id: 'transmon_lab',
    title: 'Transmon Lab',
    emoji: '〰️',
    kicker: 'Superconducting · Rabi',
    blurb: 'Drive a superconducting qubit with a microwave pulse. Watch it swing between 0 and 1, then fade as T1 and T2 wash the oscillation out.',
    tag: 'Simplified model',
    btn: 'btn-violet',
    accent: 'var(--violet)',
    Component: TransmonLab,
  },
  {
    id: 'topology_compiler',
    title: 'Topology Compiler',
    emoji: '🕸️',
    kicker: 'Trapped ions · connectivity',
    blurb: 'Route a circuit on a line, a grid or an all-to-all chain and count the SWAPs. Connectivity has a price in extra, noisy gates.',
    tag: 'Simplified model',
    btn: 'btn-mint',
    accent: 'var(--mint)',
    Component: TopologyCompiler,
  },
  {
    id: 'rydberg_blockade_lab',
    title: 'Rydberg Blockade Lab',
    emoji: '⚛️',
    kicker: 'Neutral atoms · blockade',
    blurb: 'Move two atoms together and watch the second one get blocked from exciting. That push is how neutral-atom entangling gates work.',
    tag: 'Simplified model',
    btn: 'btn-orange',
    accent: '#ff9f1c',
    Component: RydbergBlockadeLab,
  },
  {
    id: 'loss_budget_lab',
    title: 'Loss Budget Lab',
    emoji: '💡',
    kicker: 'Photonic · loss',
    blurb: "Add components to a photon's path and watch the chance that every photon arrives collapse. Loss, not noise, is the photonic problem.",
    tag: 'Simplified model',
    btn: 'btn-sky',
    accent: '#38c8ff',
    Component: LossBudgetLab,
  },
  {
    id: 'exchange_coupling_lab',
    title: 'Exchange-Coupling Lab',
    emoji: '🔁',
    kicker: 'Silicon spins · √SWAP',
    blurb: 'Lower the wall between two quantum dots and pulse it for exactly the right time to swap two spins, or half of it, to entangle them.',
    tag: 'Simplified model',
    btn: 'btn-mint',
    accent: 'var(--mint)',
    Component: ExchangeCouplingLab,
  },
  {
    id: 'annealing_lab',
    title: 'Annealing Lab',
    emoji: '🌡️',
    kicker: 'Annealing · energy gap',
    blurb: 'Anneal a few spins from an equal mix into a problem. Go slowly and they find the best answer; rush and they get stuck behind a gap.',
    tag: 'Simplified model',
    btn: 'btn-violet',
    accent: 'var(--violet)',
    Component: AnnealingLab,
  },
  {
    id: 'overhead_calculator',
    title: 'Overhead Calculator',
    emoji: '🧮',
    kicker: 'Error correction · cost',
    blurb: 'How many noisy qubits make one good one? Slide the physical error and the target and find the threshold where bigger codes stop helping.',
    tag: 'Simplified model',
    btn: 'btn-pink',
    accent: 'var(--pink)',
    Component: OverheadCalculator,
  },
  {
    id: 'comparison_dashboard',
    title: 'Comparison Dashboard',
    emoji: '📊',
    kicker: 'Capstone · side by side',
    blurb: 'Put up to three real systems next to each other, each figure with its source and date, and see what a number does not tell you.',
    tag: 'Simplified model',
    btn: 'btn-sky',
    accent: '#38c8ff',
    Component: ComparisonDashboard,
  },
  {
    id: 'maths_workbench',
    title: 'Maths Workbench',
    emoji: '🧮',
    kicker: 'Math Companion · type and see',
    blurb: "Type a qubit state or a 2 × 2 matrix as you would on paper and see its chances, its place on the Bloch sphere, whether it is a legal gate, and what it does.",
    tag: 'Accurate',
    btn: 'btn-violet',
    accent: 'var(--violet)',
    Component: MathsWorkbench,
  },
];

/** Labs that can be opened today. Games come from GAMES above; everything else in a lesson shows as "coming soon". */
const AVAILABLE_SIM_IDS = SIMS.map((s) => s.id);

const sectionTitle = { fontSize: '0.82rem', lineHeight: 1.5 } as const;

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [selectedSim, setSelectedSim] = useState<string | null>(null);
  // Owned here (not inside the Learn tab) so a lesson is still open after a trip to a game or lab
  const [learnView, setLearnView] = useState<LearnView>({ kind: 'home' });
  const mainRef = useRef<HTMLElement>(null);
  const [tutorOpen, setTutorOpen] = useState(false);
  // The part of a lesson or quiz the learner tapped "Ask about this" on; forgotten when the tutor is closed
  const [tutorFocus, setTutorFocus] = useState<TutorFocus | null>(null);
  const askAbout = (focus: TutorFocus) => {
    setTutorFocus(focus);
    setTutorOpen(true);
  };
  // The lesson a game was opened from (so finishing it can offer that lesson's next step) and the sheet that does so
  const [originLesson, setOriginLesson] = useState<string | null>(null);
  const promptedRef = useRef<Set<string>>(new Set());
  const [afterGame, setAfterGame] = useState<{ gameId: string; lessonId: string } | null>(null);

  // The phone's back button walks back through the screens instead of closing the app (see hooks/useBackNavigation.ts).
  // The snapshot is everything that makes one screen different from another, including a sheet that is open.
  useBackNavigation(
    { tab: activeTab, game: selectedGame, sim: selectedSim, learn: learnView, tutor: tutorOpen, after: afterGame?.gameId ?? null },
    (screen) => {
      setActiveTab(screen.tab);
      setSelectedGame(screen.game);
      setSelectedSim(screen.sim);
      setLearnView(screen.learn);
      setTutorOpen(screen.tutor);
      if (!screen.tutor) setTutorFocus(null);
      if (!screen.after) setAfterGame(null);
    },
  );

  const { progress } = useProgress();

  // Progress counts quizzes: a module is done when its quiz is passed
  const quizzesPassed = Object.entries(QUIZZES).filter(([id, quiz]) => progress.quizScores[id] !== undefined && passes(quiz, progress.quizScores[id])).length;
  const modulesDone = partProgress(LESSONS, QUIZZES, progress).done;
  const activitiesTried = new Set([...progress.completedGames, ...progress.exploredSims]).size;

  const { earned: earnedBadges, fresh: freshBadges, badges: allBadges, rank } = useBadges(SHOWN_GAMES.map((g) => g.id), AVAILABLE_SIM_IDS);

  const progressPercent = courseProgressPercent(LESSONS, QUIZZES, progress);
  const nextLesson = nextUpLesson(LESSONS, QUIZZES, progress);
  const started = progressPercent > 0 || activitiesTried > 0 || Object.keys(progress.quizScores).length > 0;

  // The lesson the tutor should treat as current: the lesson or quiz that is open, or the one a game was opened from
  const openLessonId =
    activeTab === 'learn' && (learnView.kind === 'lesson' || learnView.kind === 'quiz')
      ? learnView.lessonId
      : activeTab === 'games' && selectedGame
        ? (originLesson ?? undefined)
        : undefined;
  const tutorAt = tutorPosition(LESSONS, QUIZZES, progress, openLessonId);

  const openGames = (id: string | null, lessonId?: string) => {
    setOriginLesson(lessonId ?? null);
    setSelectedGame(id);
    setActiveTab('games');
  };

  const openSims = (id: string | null) => {
    setSelectedSim(id);
    setActiveTab('sims');
  };

  const openLearn = (view: LearnView) => {
    setLearnView(view);
    setActiveTab('learn');
  };

  // Every new screen starts at the top
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [activeTab, learnView, selectedGame, selectedSim]);

  // When a game is finished, offer the next step of its lesson (once per game per visit, so replays do not nag)
  useEffect(
    () =>
      ProgressStore.subscribeCompletions((gameId) => {
        if (promptedRef.current.has(gameId)) return;
        const origin = originLesson ? LESSON_BY_ID[originLesson] : undefined;
        const lesson = origin?.activities.some((x) => x.id === gameId) ? origin : LESSONS.find((l) => l.activities.some((x) => x.id === gameId));
        if (!lesson) return;
        promptedRef.current.add(gameId);
        setAfterGame({ gameId, lessonId: lesson.id });
      }),
    [originLesson],
  );

  const activeGame = SHOWN_GAMES.find(g => g.id === selectedGame);
  const activeSim = SIMS.find(x => x.id === selectedSim);

  const stats = [
    { label: 'Quizzes passed', value: quizzesPassed, icon: Star, color: 'var(--yellow)' },
    { label: 'Modules done', value: modulesDone, icon: Trophy, color: 'var(--mint)' },
    { label: 'Games & labs', value: activitiesTried, icon: Compass, color: 'var(--sky)' },
  ];

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-brand">
          <img
            src={`${import.meta.env.BASE_URL}favicon.svg`}
            alt=""
            width={40}
            height={40}
            style={{ display: 'block', borderRadius: 14, boxShadow: '0 4px 0 var(--yellow-edge)' }}
          />
          <div>
            <div className="pixel" style={{ fontSize: '0.9rem' }}>Qisket</div>
            <div className="brand-sub" style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.5rem', color: 'var(--pink)', marginTop: 4, whiteSpace: 'nowrap' }}>
              FALL FEST '26
            </div>
          </div>
        </div>

        <button className="chip app-ask" onClick={() => setTutorOpen(true)}>
          <Sparkles size={16} color="var(--yellow)" />
          <span>Ask Tutor</span>
        </button>
      </header>

      <main ref={mainRef} className="app-main">
        {activeTab === 'home' && (
          <div className="page page-wide home-grid">
            {/* Mascot + primary action */}
            <section className="card home-hero" style={{ padding: '18px 18px 22px', background: 'var(--bg-surface-elevated)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <Milton size={92} />
                <div style={{
                  position: 'relative', flex: 1, background: '#fff', color: 'var(--ink)',
                  borderRadius: 18, padding: '12px 14px', fontWeight: 800, fontSize: '0.92rem', lineHeight: 1.35,
                }}>
                  <span style={{
                    position: 'absolute', left: -8, top: 28, width: 16, height: 16,
                    background: '#fff', transform: 'rotate(45deg)', borderRadius: 3,
                  }} />
                  {activitiesTried > 0
                    ? "Nice work, agent! Let's keep bending reality."
                    : "Hi, I'm Dr. Milton Schrody! Ready to bend reality?"}
                </div>
              </div>

              <div className="eyebrow">{nextLesson ? moduleEyebrow(nextLesson) : 'All done'}</div>
              <h1 className="pixel" style={{ ...sectionTitle, fontSize: '1.05rem', margin: '4px 0 10px' }}>
                {nextLesson ? nextLesson.title : 'Course complete!'}
              </h1>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: 18 }}>
                {nextLesson
                  ? (startOffer(nextLesson, SHOWN_GAMES.map((g) => g.id), AVAILABLE_SIM_IDS) ? 'Play first, then watch, then try the lab, then check yourself.' : 'Watch the video, read the notes, then check yourself.')
                  : 'You finished every module. Revisit any lesson from the Learn tab.'}
              </p>

              <button
                className="btn"
                onClick={() => openLearn(nextLesson ? { kind: 'lesson', lessonId: nextLesson.id } : { kind: 'home' })}
              >
                <Play size={20} fill="currentColor" />
                <span>{nextLesson ? (started ? 'Continue' : 'Start') : 'Review'}</span>
              </button>
            </section>

            {/* XP / progress */}
            <section className="card home-progress" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span className="pixel" style={{ fontSize: '0.75rem' }}>Your progress</span>
                <span className="retro-num" style={{ fontSize: '1.6rem', color: 'var(--yellow)' }}>{progressPercent}%</span>
              </div>
              <div className="xp-track" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label="Course progress">
                <div className="xp-fill" style={{ width: `${Math.max(progressPercent, 4)}%` }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {stats.map(({ label, value, icon: Icon, color }) => (
                  <div key={label} style={{
                    background: 'rgba(0, 0, 0, 0.22)', borderRadius: 16, padding: '10px 6px', textAlign: 'center',
                  }}>
                    <Icon size={22} color={color} fill={label === 'Quizzes passed' ? color : 'none'} />
                    <div className="retro-num" style={{ fontSize: '2rem' }}>{value}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{label}</div>
                  </div>
                ))}
              </div>
              <button
                className="chip"
                onClick={() => setActiveTab('progress')}
                style={{ marginTop: 12, minHeight: 48, width: '100%', justifyContent: 'center', whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.5 }}
              >
                <Trophy size={16} color="var(--yellow)" />
                <span>
                  {earnedBadges.length} of {allBadges.length} badges · {rank.name}
                  {freshBadges.length > 0 ? ` · ${freshBadges.length} new!` : ''}
                </span>
              </button>
            </section>

            {/* Play / Experiment / Study */}
            <section className="home-adventure">
              <h2 className="pixel" style={sectionTitle}>Choose your adventure</h2>
              <div className="adventure-list">
              {[
                { title: 'Play', sub: 'Arcade games that teach quantum', icon: Gamepad2, color: 'var(--yellow)', edge: 'var(--yellow-edge)', go: () => openGames(null) },
                { title: 'Experiment', sub: 'Interactive labs: gates, light, entanglement', icon: FlaskConical, color: 'var(--pink)', edge: 'var(--pink-edge)', go: () => openSims(null) },
                { title: 'Study', sub: 'Lessons and quizzes', icon: BookOpen, color: 'var(--mint)', edge: 'var(--mint-edge)', go: () => openLearn({ kind: 'home' }) },
              ].map(({ title, sub, icon: Icon, color, edge, go }) => (
                <button key={title} className="card" onClick={go} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: 14, textAlign: 'left',
                  color: 'inherit', width: '100%', minHeight: 76,
                }}>
                  <span style={{
                    width: 52, height: 52, borderRadius: 16, background: color, boxShadow: `0 4px 0 ${edge}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon size={26} color="var(--ink)" strokeWidth={2.6} />
                  </span>
                  <span>
                    <span className="pixel" style={{ display: 'block', fontSize: '0.78rem', marginBottom: 6 }}>{title}</span>
                    <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{sub}</span>
                  </span>
                </button>
              ))}
              </div>
            </section>

            <div className="home-footer" style={{ textAlign: 'center', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>
              NMIMS MPSTME × IBM Quantum · Qiskit Fall Fest '26
            </div>
          </div>
        )}

        {activeTab === 'learn' && (
          <div className="page page-reading">
          <LearnTab
            view={learnView}
            onNavigate={setLearnView}
            availableGameIds={SHOWN_GAMES.map((g) => g.id)}
            availableSimIds={AVAILABLE_SIM_IDS}
            onOpenGame={openGames}
            onOpenSim={openSims}
            onAsk={askAbout}
          />
          </div>
        )}

        {activeTab === 'games' && (
          <div className={`page ${activeGame ? 'page-narrow' : 'page-wide'}`} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {activeGame ? (
              <div>
                <button
                  onClick={() => setSelectedGame(null)}
                  className="chip"
                  style={{ marginBottom: 12 }}
                >
                  <ChevronLeft size={18} />
                  <span>All Games</span>
                </button>
                <activeGame.Component />
              </div>
            ) : (
              <>
                <div>
                  <h2 className="pixel" style={sectionTitle}>Quantum Arcade</h2>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Learn quantum ideas by playing.
                  </p>
                </div>

                <div className="hub-grid">
                {SHOWN_GAMES.map(g => (
                  <article key={g.id} className="card" style={{
                    padding: 18, display: 'flex', flexDirection: 'column', gap: 12, borderColor: g.accent,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <span className="eyebrow" style={{ color: g.accent }}>{g.kicker}</span>
                      <HonestyTagBadge tag={g.tag} />
                    </div>
                    <div>
                      <h3 className="pixel" style={{ fontSize: '0.85rem', marginBottom: 8 }}>{g.emoji} {g.title}</h3>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.45 }}>{g.blurb}</p>
                    </div>
                    <button className={`btn ${g.btn}`} onClick={() => setSelectedGame(g.id)}>
                      <Play size={18} fill="currentColor" />
                      <span>Play</span>
                    </button>
                  </article>
                ))}
                </div>

              </>
            )}
          </div>
        )}

        {activeTab === 'sims' && (
          <div className={`page ${activeSim ? 'page-narrow' : 'page-wide'}`} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {activeSim ? (
              <div>
                <button onClick={() => setSelectedSim(null)} className="chip" style={{ marginBottom: 12 }}>
                  <ChevronLeft size={18} />
                  <span>All Labs</span>
                </button>
                <activeSim.Component />
              </div>
            ) : (
              <>
                <div>
                  <h2 className="pixel" style={sectionTitle}>Quantum Labs</h2>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Poke the physics and see what happens.
                  </p>
                </div>

                <div className="hub-grid">
                {SIMS.map(x => (
                  <article key={x.id} className="card" style={{
                    padding: 18, display: 'flex', flexDirection: 'column', gap: 12, borderColor: x.accent,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <span className="eyebrow" style={{ color: x.accent }}>{x.kicker}</span>
                      <HonestyTagBadge tag={x.tag} />
                    </div>
                    <div>
                      <h3 className="pixel" style={{ fontSize: '0.85rem', marginBottom: 8 }}>{x.emoji} {x.title}</h3>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.45 }}>{x.blurb}</p>
                    </div>
                    <button className={`btn ${x.btn}`} onClick={() => setSelectedSim(x.id)}>
                      <FlaskConical size={18} />
                      <span>Open lab</span>
                    </button>
                  </article>
                ))}
                </div>

              </>
            )}
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="page page-wide">
          <ProgressView
            games={SHOWN_GAMES.map((g) => ({ id: g.id, title: g.title, emoji: g.emoji }))}
            sims={SIMS.map((x) => ({ id: x.id, title: x.title, emoji: x.emoji }))}
            onOpenGame={(id) => openGames(id)}
            onOpenSim={(id) => openSims(id)}
            onOpenLearn={(view) => openLearn(view)}
          />
          </div>
        )}
      </main>

      {afterGame && LESSON_BY_ID[afterGame.lessonId] && (
        <AfterGameSheet
          lesson={LESSON_BY_ID[afterGame.lessonId]}
          gameId={afterGame.gameId}
          availableGameIds={SHOWN_GAMES.map((g) => g.id)}
          availableSimIds={AVAILABLE_SIM_IDS}
          onClose={() => setAfterGame(null)}
          onWatch={() => { setAfterGame(null); openLearn({ kind: 'lesson', lessonId: afterGame.lessonId, focus: 'watch' }); }}
          onOpenGame={(id) => { setAfterGame(null); openGames(id, afterGame.lessonId); }}
          onOpenSim={(id) => { setAfterGame(null); openSims(id); }}
          onQuiz={() => { setAfterGame(null); openLearn({ kind: 'quiz', lessonId: afterGame.lessonId }); }}
          onLesson={() => { setAfterGame(null); openLearn({ kind: 'lesson', lessonId: afterGame.lessonId }); }}
        />
      )}

      <TutorDrawer
        open={tutorOpen}
        onClose={() => { setTutorOpen(false); setTutorFocus(null); }}
        focus={tutorFocus}
        onClearFocus={() => setTutorFocus(null)}
        position={tutorAt}
        inQuiz={activeTab === 'learn' && learnView.kind === 'quiz'}
        onOpenLesson={(lessonId) => { setTutorOpen(false); openLearn({ kind: 'lesson', lessonId }); }}
      />

      <nav className="app-nav" aria-label="Main">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className="nav-tab"
              aria-label={tab.label}
              title={tab.label}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => {
                if (tab.id === 'games') setSelectedGame(null);
                // tapping the tab you are already on goes back to its start
                if (tab.id === 'learn' && activeTab === 'learn') setLearnView({ kind: 'home' });
                setActiveTab(tab.id);
              }}
            >
              <span className="nav-icon">
                <Icon size={22} strokeWidth={isActive ? 2.8 : 2} />
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
