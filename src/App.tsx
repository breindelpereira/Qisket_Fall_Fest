import { useState } from 'react';
import type { ComponentType } from 'react';
import {
  Home,
  Gamepad2,
  FlaskConical,
  BookOpen,
  Sparkles,
  Play,
  ChevronLeft,
  X,
  Send,
  Star,
  Compass,
  Trophy,
} from 'lucide-react';
import { useProgress } from './hooks/useProgress';
import { HonestyTagBadge } from './components/shared/HonestyTag';
import { DrQuantum } from './components/shared/DrQuantum';
import type { HonestyTag } from './content/types';
import { QuantumHeist } from './components/games/QuantumHeist';
import { QuantumCoinFlip } from './components/games/QuantumCoinFlip';
import { SchrodingersStealth } from './components/games/SchrodingersStealth';
import { BlochRunner } from './components/games/BlochRunner';
import { PhotonEscapeRoom } from './components/games/PhotonEscapeRoom';
import { AliceAndBob } from './components/games/AliceAndBob';
import { SingleQubitLab } from './components/simulations/SingleQubitLab';

type Tab = 'home' | 'learn' | 'games' | 'sims';

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
}

const GAMES: GameEntry[] = [
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
    id: 'bloch_runner',
    title: 'Bloch Runner',
    emoji: '🏃',
    kicker: 'Gate puzzles · 8 levels',
    blurb: 'Race around the Bloch sphere! Pick the right gate each move to steer your qubit onto the target, using as few moves as you can. No timer.',
    tag: 'Accurate',
    btn: 'btn-sky',
    accent: 'var(--sky)',
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
];

const UPCOMING: { title: string; concept: string; tag: HonestyTag; phase: string }[] = [
  { title: 'Teleport Relay', concept: 'Teleportation & No-Cloning', tag: 'Accurate', phase: 'Next up' },
  { title: 'Qubit Surgeon', concept: 'Noise & Error Correction', tag: 'Simplified model', phase: 'Phase 7' },
  { title: 'Oracle Detective', concept: 'Oracles & Deutsch-Jozsa', tag: 'Accurate', phase: 'Phase 8' },
];

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'learn', label: 'Learn', icon: BookOpen },
  { id: 'games', label: 'Games', icon: Gamepad2 },
  { id: 'sims', label: 'Labs', icon: FlaskConical },
];

const sectionTitle = { fontSize: '0.82rem', lineHeight: 1.5 } as const;

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [tutorInput, setTutorInput] = useState('');

  const { progress } = useProgress();

  const masteryValues = Object.values(progress.conceptMastery);
  const familiarCount = masteryValues.filter(m => m === 'familiar').length;
  const exploredCount = masteryValues.filter(m => m === 'explored').length;
  const masteredCount = masteryValues.filter(m => m === 'mastered').length;

  const totalCoreConcepts = 8;
  const progressPercent = Math.min(100, Math.round((masteredCount / totalCoreConcepts) * 100));

  const openGames = (id: string | null) => {
    setSelectedGame(id);
    setActiveTab('games');
  };

  const activeGame = GAMES.find(g => g.id === selectedGame);

  const stats = [
    { label: 'Familiar', value: familiarCount, icon: Star, color: 'var(--yellow)' },
    { label: 'Explored', value: exploredCount, icon: Compass, color: 'var(--sky)' },
    { label: 'Mastered', value: masteredCount, icon: Trophy, color: 'var(--mint)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 8px', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 14, background: 'var(--yellow)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 0 var(--yellow-edge)',
          }}>
            <span className="pixel" style={{ fontSize: '1.1rem', color: 'var(--ink)' }}>Q</span>
          </div>
          <div>
            <div className="pixel" style={{ fontSize: '0.9rem' }}>Qisket</div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.5rem', color: 'var(--pink)', marginTop: 4 }}>
              FALL FEST '26
            </div>
          </div>
        </div>

        <button className="chip" onClick={() => setTutorOpen(true)}>
          <Sparkles size={16} color="var(--yellow)" />
          <span>Ask Tutor</span>
        </button>
      </header>

      <main style={{ flex: 1, overflowY: 'auto', padding: '10px 20px 96px' }}>
        {activeTab === 'home' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Mascot + primary action */}
            <section className="card" style={{ padding: '18px 18px 22px', background: 'var(--bg-surface-elevated)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <DrQuantum size={92} />
                <div style={{
                  position: 'relative', flex: 1, background: '#fff', color: 'var(--ink)',
                  borderRadius: 18, padding: '12px 14px', fontWeight: 800, fontSize: '0.92rem', lineHeight: 1.35,
                }}>
                  <span style={{
                    position: 'absolute', left: -8, top: 28, width: 16, height: 16,
                    background: '#fff', transform: 'rotate(45deg)', borderRadius: 3,
                  }} />
                  {familiarCount > 0
                    ? "Nice work, agent! Let's keep bending reality."
                    : "Hi, I'm Dr Quantum! Ready to bend reality?"}
                </div>
              </div>

              <div className="eyebrow">Module 1</div>
              <h1 className="pixel" style={{ ...sectionTitle, fontSize: '1.05rem', margin: '4px 0 10px' }}>Qubits & Superposition</h1>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: 18 }}>
                Play puzzles and run experiments to master your first qubit.
              </p>

              <button className="btn" onClick={() => openGames('quantum_heist')}>
                <Play size={20} fill="currentColor" />
                <span>{familiarCount > 0 ? 'Continue' : 'Start'}</span>
              </button>
            </section>

            {/* XP / progress */}
            <section className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
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
                    <Icon size={22} color={color} fill={label === 'Familiar' ? color : 'none'} />
                    <div className="retro-num" style={{ fontSize: '2rem' }}>{value}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{label}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Play / Experiment / Study */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h2 className="pixel" style={sectionTitle}>Choose your adventure</h2>
              {[
                { title: 'Play', sub: 'Arcade games that teach quantum', icon: Gamepad2, color: 'var(--yellow)', edge: 'var(--yellow-edge)', go: () => openGames(null) },
                { title: 'Experiment', sub: 'Interactive Bloch sphere lab', icon: FlaskConical, color: 'var(--pink)', edge: 'var(--pink-edge)', go: () => setActiveTab('sims') },
                { title: 'Study', sub: 'Lessons and quizzes', icon: BookOpen, color: 'var(--mint)', edge: 'var(--mint-edge)', go: () => setActiveTab('learn') },
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
            </section>

            <div style={{ textAlign: 'center', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>
              NMIMS MPSTME × IBM Quantum · Qiskit Fall Fest '26
            </div>
          </div>
        )}

        {activeTab === 'learn' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 className="pixel" style={sectionTitle}>Curriculum</h2>
            <div className="card" style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
              <DrQuantum size={72} mood="wow" />
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, fontWeight: 600 }}>
                Lessons are coming soon! Meanwhile, try the <b style={{ color: '#fff' }}>Quantum Heist</b> game and the <b style={{ color: '#fff' }}>Single-Qubit Lab</b>.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'games' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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

                {GAMES.map(g => (
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

                <div className="eyebrow" style={{ color: 'var(--text-tertiary)', marginTop: 6 }}>Coming soon</div>
                {UPCOMING.map(g => (
                  <div key={g.title} className="card" style={{
                    padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.85,
                  }}>
                    <div>
                      <div className="pixel" style={{ fontSize: '0.68rem', marginBottom: 6 }}>🔒 {g.title}</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{g.concept}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <HonestyTagBadge tag={g.tag} />
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>{g.phase}</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {activeTab === 'sims' && <SingleQubitLab />}
      </main>

      {tutorOpen && (
        <div
          onClick={() => setTutorOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(23, 6, 54, 0.7)', backdropFilter: 'blur(6px)',
            display: 'flex', justifyContent: 'center', alignItems: 'flex-end', zIndex: 50,
          }}
        >
          <div
            role="dialog"
            aria-label="AI Quantum Tutor"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 440, background: 'var(--bg-surface-elevated)',
              borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20,
              borderTop: '3px solid var(--yellow)', display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '75vh',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="pixel" style={{ fontSize: '0.8rem' }}>Ask Dr Quantum</span>
              <button
                aria-label="Close tutor"
                onClick={() => setTutorOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.14)', borderRadius: '50%', width: 44, height: 44,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <DrQuantum size={64} />
              <div style={{
                background: '#fff', color: 'var(--ink)', borderRadius: 18, padding: '12px 14px',
                fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.45,
              }}>
                Ask me anything about qubits, superposition, or quantum algorithms!
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="Ask a question..."
                aria-label="Your question"
                value={tutorInput}
                onChange={(e) => setTutorInput(e.target.value)}
                style={{
                  flex: 1, minHeight: 48, background: 'rgba(0, 0, 0, 0.3)', border: '2px solid var(--border-subtle)',
                  borderRadius: 16, padding: '10px 14px', color: '#fff', fontSize: '1rem', fontWeight: 600,
                }}
              />
              <button className="btn" aria-label="Send" style={{ width: 56, padding: 0 }}>
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      <nav style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 68, background: 'var(--bg-nav)',
        borderTop: '3px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center',
        justifyContent: 'space-around', padding: '0 8px', zIndex: 10,
      }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className="nav-tab"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => {
                if (tab.id === 'games') setSelectedGame(null);
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
