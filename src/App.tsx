import { useState } from 'react';
import { 
  Home, 
  Gamepad2, 
  FlaskConical, 
  BookOpen, 
  Sparkles, 
  Play, 
  ArrowRight,
  X,
  Send,
  TrendingUp

} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'learn' | 'games' | 'sims'>('home');
  const [tutorOpen, setTutorOpen] = useState(false);
  const [tutorInput, setTutorInput] = useState('');

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
            {/* Primary Action Hero Card: Start Course */}
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
                Build intuition for quantum states beyond classical bits through interactive puzzles and simulations.
              </p>

              {/* Big Start / Continue Course Button */}
              <button
                onClick={() => setActiveTab('learn')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '13px 20px',
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
                <Play size={17} fill="#080b1a" />
                <span>Start Course</span>
              </button>
            </div>

            {/* In-Home Progress Section */}
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
                  0%
                </span>
              </div>

              {/* Sleek Progress Bar */}
              <div style={{
                height: 6,
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: 3,
                overflow: 'hidden'
              }}>
                <div style={{
                  width: '0%',
                  height: '100%',
                  background: 'var(--accent-gradient)',
                  borderRadius: 3
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
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>0</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Familiar</div>
                </div>

                <div style={{
                  background: 'rgba(255, 64, 129, 0.06)',
                  border: '1px solid rgba(255, 64, 129, 0.15)',
                  borderRadius: 10,
                  padding: '8px 6px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-pink)' }}>0</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Explored</div>
                </div>

                <div style={{
                  background: 'rgba(138, 63, 252, 0.06)',
                  border: '1px solid rgba(138, 63, 252, 0.15)',
                  borderRadius: 10,
                  padding: '8px 6px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#c084fc' }}>0</div>
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
                Or Explore Directly
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {/* Games Card */}
                <button
                  onClick={() => setActiveTab('games')}
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
                      19 intuition puzzles
                    </div>
                  </div>
                </button>

                {/* Simulations Card */}
                <button
                  onClick={() => setActiveTab('sims')}
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
                      21 quantitative labs
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

        {/* Learn Tab */}
        {activeTab === 'learn' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Curriculum</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { part: 'Part 1', title: 'Quantum Concepts', desc: '8 modules: Superposition to Error Correction', color: 'var(--accent-cyan)' },
                { part: 'Part 2', title: 'Hardware Modalities', desc: '10 modules: Superconducting, Ions, Atoms, Photonics', color: 'var(--accent-pink)' },
                { part: 'Part 3', title: 'Math Companion', desc: '5 lessons: Dirac vectors, matrices, Grover geometry', color: 'var(--accent-purple)' }
              ].map((c, i) => (
                <div key={i} style={{
                  background: 'var(--bg-surface)',
                  padding: '16px',
                  borderRadius: 16,
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: c.color, textTransform: 'uppercase' }}>
                      {c.part}
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', margin: '2px 0' }}>
                      {c.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {c.desc}
                    </div>
                  </div>
                  <ArrowRight size={18} color="var(--text-tertiary)" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Games Tab */}
        {activeTab === 'games' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Games</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { title: 'Quantum Heist', concept: 'Qubits & Superposition', tag: 'Analogy' },
                { title: "Schrödinger's Stealth", concept: 'Measurement & Probability', tag: 'Simplified' },
                { title: 'Bloch Runner', concept: 'Single-Qubit Gate Rotations', tag: 'Accurate' },
                { title: 'Photon Escape Room', concept: 'Interference & Phase Shifters', tag: 'Accurate' },
                { title: 'Alice & Bob: Escape Together', concept: 'Entanglement & Bell Tests', tag: 'Accurate' }
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
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{g.title}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{g.concept}</div>
                  </div>
                  <span style={{
                    fontSize: '0.65rem',
                    color: 'var(--accent-cyan)',
                    background: 'rgba(0, 210, 255, 0.1)',
                    padding: '3px 8px',
                    borderRadius: 6
                  }}>
                    {g.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Simulations Tab */}
        {activeTab === 'sims' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Simulations</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { title: 'Single-Qubit Lab', engine: 'State-Vector' },
                { title: 'Measurement Shots & Histogram', engine: 'State-Vector' },
                { title: 'Circuit Lab + Bloch Rotation', engine: 'State-Vector' },
                { title: 'Mach–Zehnder Optical Lab', engine: 'Interferometer' },
                { title: 'Bell & CHSH Explorer', engine: 'State-Vector' }
              ].map((s, i) => (
                <div key={i} style={{
                  background: 'var(--bg-surface)',
                  padding: '14px 16px',
                  borderRadius: 14,
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{s.title}</div>
                  <span style={{
                    fontSize: '0.65rem',
                    color: 'var(--accent-pink)',
                    background: 'rgba(255, 64, 129, 0.1)',
                    padding: '3px 8px',
                    borderRadius: 6
                  }}>
                    {s.engine}
                  </span>
                </div>
              ))}
            </div>
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

      {/* 4-Tab Bottom Navigation Bar (No separate Progress tab) */}
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
              onClick={() => setActiveTab(tab.id as any)}
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
