import { useState } from 'react';
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
  TrendingUp

} from 'lucide-react';
import { useProgress } from './hooks/useProgress';
import { HonestyTagBadge } from './components/shared/HonestyTag';
import type { HonestyTag } from './content/types';
import { QuantumHeist } from './components/games/QuantumHeist';
import { QuantumCoinFlip } from './components/games/QuantumCoinFlip';
import { SchrodingersStealth } from './components/games/SchrodingersStealth';
import { SingleQubitLab } from './components/simulations/SingleQubitLab';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'learn' | 'games' | 'sims'>('home');
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [selectedSim, setSelectedSim] = useState<string>('single_qubit_lab');
  const [tutorOpen, setTutorOpen] = useState(false);
  const [tutorInput, setTutorInput] = useState('');

  const { progress } = useProgress();

  const masteryValues = Object.values(progress.conceptMastery);
  const familiarCount = masteryValues.filter(m => m === 'familiar').length;
  const exploredCount = masteryValues.filter(m => m === 'explored').length;
  const masteredCount = masteryValues.filter(m => m === 'mastered').length;

  const totalCoreConcepts = 8;
  const progressPercent = Math.min(100, Math.round((masteredCount / totalCoreConcepts) * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      {/* Sleek Minimal Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px 12px',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px var(--accent-cyan-glow)'
          }}>
            <span style={{ fontSize: '1rem', fontWeight: 900, color: '#080b1a' }}>Q</span>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
                Qiskit
              </span>
              <span style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                color: 'var(--accent-pink)',
                background: 'rgba(255, 64, 129, 0.12)',
                padding: '2px 7px',
                borderRadius: 20,
                letterSpacing: '0.04em'
              }}>
                FALL FEST '26
              </span>
            </div>
          </div>
        </div>

        {/* Minimal Tutor Trigger Button */}
        <button 
          onClick={() => setTutorOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            borderRadius: 20,
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            fontSize: '0.78rem',
            fontWeight: 600,
            transition: 'background 0.2s ease'
          }}
        >
          <Sparkles size={14} color="var(--accent-cyan)" />
          <span>Ask Tutor</span>
        </button>
      </header>

      {/* Main Content View */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 80px' }}>
        {activeTab === 'home' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Primary Action Hero Card: Start Course / Play Game */}
            <div style={{
              background: 'linear-gradient(165deg, rgba(22, 29, 66, 0.9) 0%, rgba(13, 17, 40, 0.95) 100%)',
              borderRadius: 22,
              padding: '22px 20px',
              border: '1px solid var(--border-accent)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Subtle ambient glow in card */}
              <div style={{
                position: 'absolute',
                top: -40,
                right: -40,
                width: 140,
                height: 140,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0, 210, 255, 0.25) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />

              <div style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: 'var(--accent-cyan)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 6
              }}>
                Curriculum • Module 1
              </div>

              <h1 style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.25,
                marginBottom: 8,
                color: '#ffffff'
              }}>
                Qubits & Superposition
              </h1>

              <p style={{
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.45,
                marginBottom: 20
              }}>
                Master quantum superposition through interactive arcade puzzles and quantitative simulation labs.
              </p>

              {/* Big Continue / Start Course Button */}
              <button
                onClick={() => {
                  setSelectedGame('quantum_heist');
                  setActiveTab('games');
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '14px 20px',
                  borderRadius: 14,
                  background: 'var(--accent-btn)',
                  color: '#080b1a',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  letterSpacing: '-0.01em',
                  boxShadow: '0 6px 20px var(--accent-cyan-glow)',
                  transition: 'transform 0.15s ease'
                }}
              >
                <Play size={18} fill="#080b1a" />
                <span>{familiarCount > 0 ? 'Continue Course' : 'Start Course'}</span>
              </button>
            </div>


            {/* In-Home Progress Section with Real LocalStorage State */}
            <div style={{
              background: 'var(--bg-surface)',
              borderRadius: 18,
              padding: '16px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TrendingUp size={15} color="var(--accent-cyan)" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#fff' }}>
                    Course Progress
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {progressPercent}%
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{
                height: 6,
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: 3,
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: 'var(--accent-gradient)',
                  borderRadius: 3,
                  transition: 'width 0.4s ease'
                }} />
              </div>

              {/* Three Mastery Stat Badges */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
                paddingTop: 4
              }}>
                <div style={{
                  background: 'rgba(0, 210, 255, 0.06)',
                  border: '1px solid rgba(0, 210, 255, 0.15)',
                  borderRadius: 10,
                  padding: '8px 6px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{familiarCount}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Familiar</div>
                </div>

                <div style={{
                  background: 'rgba(255, 64, 129, 0.06)',
                  border: '1px solid rgba(255, 64, 129, 0.15)',
                  borderRadius: 10,
                  padding: '8px 6px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-pink)' }}>{exploredCount}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Explored</div>
                </div>

                <div style={{
                  background: 'rgba(138, 63, 252, 0.06)',
                  border: '1px solid rgba(138, 63, 252, 0.15)',
                  borderRadius: 10,
                  padding: '8px 6px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#c084fc' }}>{masteredCount}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Mastered</div>
                </div>
              </div>
            </div>

            {/* Quick Explore Section */}
            <div>
              <div style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 10,
                paddingLeft: 4
              }}>
                Interactive Modes
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {/* Games Card */}
                <button
                  onClick={() => {
                    setSelectedGame(null);
                    setActiveTab('games');
                  }}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 18,
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 12,
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(0, 210, 255, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Gamepad2 size={18} color="var(--accent-cyan)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff', marginBottom: 2 }}>
                      Games
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                      Quantum Heist ready!
                    </div>
                  </div>
                </button>

                {/* Simulations Card */}
                <button
                  onClick={() => {
                    setSelectedSim('single_qubit_lab');
                    setActiveTab('sims');
                  }}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 18,
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 12,
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(255, 64, 129, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FlaskConical size={18} color="var(--accent-pink)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff', marginBottom: 2 }}>
                      Simulations
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                      Bloch Lab active!
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Event Footer Note */}
            <div style={{
              textAlign: 'center',
              marginTop: 6,
              fontSize: '0.72rem',
              color: 'var(--text-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}>
              <span>NMIMS MPSTME × IBM Quantum</span>
              <span>•</span>
              <span>Qiskit Fall Fest '26</span>
            </div>
          </div>
        )}

        {/* Learn Tab (Placeholder until decisions made) */}
        {activeTab === 'learn' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Curriculum</h2>
            <div style={{
              background: 'var(--bg-surface)',
              borderRadius: 16,
              padding: '16px',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5
            }}>
              📖 Curriculum structure is awaiting your decision inputs. Meanwhile, explore the interactive <b>Quantum Heist</b> game and the <b>Single-Qubit Simulation Lab</b>!
            </div>
          </div>
        )}

        {/* Games Tab */}
        {activeTab === 'games' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {selectedGame === 'quantum_heist' ? (
              <div>
                <button
                  onClick={() => setSelectedGame(null)}
                  style={{
                    background: 'transparent',
                    color: 'var(--accent-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    marginBottom: 12,
                    padding: 0
                  }}
                >
                  <ChevronLeft size={18} />
                  <span>All Games</span>
                </button>
                <QuantumHeist />
              </div>
            ) : selectedGame === 'coin_flip' ? (
              <div>
                <button
                  onClick={() => setSelectedGame(null)}
                  style={{
                    background: 'transparent',
                    color: 'var(--accent-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    marginBottom: 12,
                    padding: 0
                  }}
                >
                  <ChevronLeft size={18} />
                  <span>All Games</span>
                </button>
                <QuantumCoinFlip />
              </div>
            ) : selectedGame === 'schrodingers_stealth' ? (
              <div>
                <button
                  onClick={() => setSelectedGame(null)}
                  style={{
                    background: 'transparent',
                    color: 'var(--accent-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    marginBottom: 12,
                    padding: 0
                  }}
                >
                  <ChevronLeft size={18} />
                  <span>All Games</span>
                </button>
                <SchrodingersStealth />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 2 }}>Quantum Arcade</h2>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    Learn quantum principles by playing real retro & arcade games.
                  </p>
                </div>
                
                {/* Game 1: Quantum Heist */}
                <div style={{
                  background: 'linear-gradient(145deg, rgba(22, 29, 66, 0.95), rgba(13, 17, 40, 0.95))',
                  borderRadius: 18,
                  padding: '18px',
                  border: '1px solid #00d2ff',
                  boxShadow: '0 8px 30px rgba(0, 210, 255, 0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: '0.58rem',
                      color: 'var(--accent-cyan)'
                    }}>
                      🕹️ 8-BIT ARCADE • 3 STAGES
                    </div>
                    <HonestyTagBadge tag="Simplified model" />
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                      ⚡ Quantum Heist
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      Infiltrate the Central Quantum Bank! Use the Hadamard gate to split into 50/50 superposition ghosts, defeat phase traps, and aim the 3D Bloch radar!
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedGame('quantum_heist')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '12px',
                      borderRadius: 12,
                      background: 'var(--accent-btn)',
                      color: '#080b1a',
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      boxShadow: '0 4px 16px var(--accent-cyan-glow)'
                    }}
                  >
                    <Play size={16} fill="#080b1a" />
                    <span>Play Quantum Heist</span>
                  </button>
                </div>

                {/* Game 2: Quantum Coin Flip (David Meyer Penny Flip) */}
                <div style={{
                  background: 'linear-gradient(145deg, rgba(30, 20, 60, 0.95), rgba(15, 10, 35, 0.95))',
                  borderRadius: 18,
                  padding: '18px',
                  border: '1px solid #8a3ffc',
                  boxShadow: '0 8px 30px rgba(138, 63, 252, 0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: '0.58rem',
                      color: '#c084fc'
                    }}>
                      🎰 CYBER CASINO • PARADOX
                    </div>
                    <HonestyTagBadge tag="Accurate" />
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                      🪙 The Quantum Penny Paradox
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      Challenge Dr. Quantum in David Meyer's famous game. Discover why classical strategy always loses, and unlock quantum gates to fight back!
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedGame('coin_flip')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '12px',
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #8a3ffc 0%, #6929c4 100%)',
                      color: '#fff',
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      boxShadow: '0 4px 16px rgba(138, 63, 252, 0.4)'
                    }}
                  >
                    <Play size={16} fill="#fff" />
                    <span>Play Quantum Penny</span>
                  </button>
                </div>

                {/* Game 3: Schrödinger's Stealth */}
                <div style={{
                  background: 'linear-gradient(145deg, rgba(7, 13, 30, 0.95), rgba(3, 6, 17, 0.95))',
                  borderRadius: 18,
                  padding: '18px',
                  border: '1px solid #22c55e',
                  boxShadow: '0 8px 30px rgba(34, 197, 94, 0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: '0.58rem',
                      color: '#22c55e'
                    }}>
                      🐾 TACTICAL STEALTH • 3 SECTORS
                    </div>
                    <HonestyTagBadge tag="Accurate" />
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                      🐾 Schrödinger's Stealth
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      Observe without collapsing! Guide Agent Schrödinger through Z-basis and X-basis laser checkpoints using quantum basis lenses.
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedGame('schrodingers_stealth')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '12px',
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
                      color: '#fff',
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      boxShadow: '0 4px 16px rgba(34, 197, 94, 0.4)'
                    }}
                  >
                    <Play size={16} fill="#fff" />
                    <span>Play Schrödinger's Stealth</span>
                  </button>
                </div>

                {/* Other Upcoming Games */}
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginTop: 4 }}>
                  Upcoming Games
                </div>

                {[
                  { title: 'Bloch Runner', concept: 'Single-Qubit Rotations', tag: 'Accurate' as HonestyTag, phase: 'Phase 5' },
                  { title: 'Photon Escape Room', concept: 'Interference & Phase', tag: 'Accurate' as HonestyTag, phase: 'Phase 8' },
                  { title: 'Alice & Bob: Escape Together', concept: 'Entanglement & Bell', tag: 'Accurate' as HonestyTag, phase: 'Phase 6' },
                ].map((g, i) => (
                  <div key={i} style={{
                    background: 'var(--bg-surface)',
                    padding: '14px 16px',
                    borderRadius: 14,
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>{g.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{g.concept}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <HonestyTagBadge tag={g.tag} />
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)' }}>{g.phase}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Simulations Tab */}
        {activeTab === 'sims' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {selectedSim === 'single_qubit_lab' ? (
              <div>
                <SingleQubitLab />
              </div>
            ) : null}
          </div>
        )}
      </main>

      {/* Modern Slide-Up Tutor Drawer */}
      {tutorOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          zIndex: 50
        }}>
          <div style={{
            width: '100%',
            maxWidth: 440,
            background: 'var(--bg-surface-elevated)',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: '20px',
            borderTop: '1px solid var(--border-accent)',
            boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            maxHeight: '75vh'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} color="var(--accent-cyan)" />
                <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>AI Quantum Tutor</span>
              </div>
              <button 
                onClick={() => setTutorOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '50%',
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)'
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{
              background: 'rgba(8, 11, 26, 0.7)',
              borderRadius: 12,
              padding: '12px 14px',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5
            }}>
              👋 Hello! I am your in-course tutor for <b>Qiskit Fall Fest 2026</b>. Ask me anything about qubits, superposition, or quantum algorithms!
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="Ask a question..."
                value={tutorInput}
                onChange={(e) => setTutorInput(e.target.value)}
                style={{
                  flex: 1,
                  background: 'rgba(8, 11, 26, 0.9)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 12,
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              />
              <button style={{
                background: 'var(--accent-btn)',
                borderRadius: 12,
                padding: '0 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#080b1a'
              }}>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4-Tab Bottom Navigation Bar */}
      <nav style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 62,
        background: 'rgba(12, 16, 40, 0.94)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 12px',
        zIndex: 10
      }}>
        {[
          { id: 'home', label: 'Home', icon: Home },
          { id: 'learn', label: 'Learn', icon: BookOpen },
          { id: 'games', label: 'Games', icon: Gamepad2 },
          { id: 'sims', label: 'Labs', icon: FlaskConical }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'games') setSelectedGame(null);
                setActiveTab(tab.id as any);
              }}
              style={{
                background: 'transparent',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                width: 66,
                height: 50,
                color: isActive ? 'var(--accent-cyan)' : 'var(--text-tertiary)',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={21} strokeWidth={isActive ? 2.6 : 1.8} color={isActive ? 'var(--accent-cyan)' : 'currentColor'} />
              <span style={{ fontSize: '0.68rem', fontWeight: isActive ? 700 : 500 }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
