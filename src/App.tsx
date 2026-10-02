import { useState } from 'react';
import { 
  Home, 
  Gamepad2, 
  FlaskConical, 
  BookOpen, 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  Award,
  Calendar,
  Layers

} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'games' | 'sims' | 'learn' | 'progress'>('home');
  const [tutorOpen, setTutorOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      {/* Top Event Branding Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        borderBottom: '1px solid var(--qff-border)',
        background: 'rgba(10, 14, 40, 0.92)',
        backdropFilter: 'blur(12px)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Origami Quantum Logo */}
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #00d2ff, #ff4081 50%, #8a3ffc)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0, 210, 255, 0.4)'
          }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#090d24' }}>Q</span>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.04em', color: '#ffffff' }}>
                QISKIT
              </span>
              <span style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                color: 'var(--qff-pink)',
                background: 'rgba(255, 64, 129, 0.15)',
                padding: '1px 6px',
                borderRadius: 4,
                border: '1px solid rgba(255, 64, 129, 0.3)'
              }}>
                FALL FEST '26
              </span>
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-dim)', fontWeight: 500 }}>
              NMIMS MPSTME × IBM Quantum
            </div>
          </div>
        </div>

        {/* AI Tutor Button */}
        <button 
          onClick={() => setTutorOpen(!tutorOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 20,
            background: tutorOpen 
              ? 'linear-gradient(135deg, var(--qff-pink), var(--qff-purple))' 
              : 'rgba(138, 63, 252, 0.18)',
            border: '1px solid rgba(138, 63, 252, 0.45)',
            color: tutorOpen ? '#ffffff' : 'var(--qff-cyan)',
            fontSize: '0.75rem',
            fontWeight: 700,
            boxShadow: tutorOpen ? '0 0 15px rgba(255, 64, 129, 0.5)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <Sparkles size={13} color={tutorOpen ? '#ffffff' : 'var(--qff-cyan)'} />
          <span>Ask Tutor</span>
        </button>
      </header>

      {/* Main Scrollable Content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '14px', paddingBottom: '76px' }}>
        {activeTab === 'home' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Hackathon Event Banner Card */}
            <div style={{
              background: 'linear-gradient(145deg, rgba(26, 34, 88, 0.9), rgba(15, 21, 56, 0.95))',
              borderRadius: 16,
              padding: '18px',
              border: '1px solid var(--qff-border)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background Glow Ring */}
              <div style={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,210,255,0.2) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Award size={14} color="var(--qff-gold)" />
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--qff-gold)', letterSpacing: '0.05em' }}>
                    OFFICIAL HACKATHON ENTRY
                  </span>
                </div>
                <span style={{
                  fontSize: '0.62rem',
                  color: 'var(--qff-cyan)',
                  background: 'rgba(0, 210, 255, 0.12)',
                  padding: '2px 8px',
                  borderRadius: 10,
                  border: '1px solid rgba(0, 210, 255, 0.25)'
                }}>
                  Round 1 Active
                </span>
              </div>

              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 6, lineHeight: 1.25, letterSpacing: '-0.01em' }}>
                Qiskit Learning Environment
              </h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: 14 }}>
                Three interconnected pathways to quantum intuition: <b style={{ color: 'var(--qff-cyan)' }}>Play</b>, <b style={{ color: 'var(--qff-pink)' }}>Experiment</b>, and <b style={{ color: '#c084fc' }}>Study</b>.
              </p>

              {/* Event Meta Ribbon */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 8,
                background: 'rgba(9, 13, 36, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '0.72rem',
                color: 'var(--text-muted)'
              }}>
                <Calendar size={13} color="var(--qff-pink)" />
                <span>12th Sept – 25th Oct 2026 • CSI @ MPSTME</span>
              </div>
            </div>

            {/* Mode Selector Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { 
                  title: 'Play', 
                  count: '19 Games', 
                  color: 'var(--qff-cyan)', 
                  bg: 'rgba(0, 210, 255, 0.1)',
                  tab: 'games',
                  desc: 'Intuition'
                },
                { 
                  title: 'Experiment', 
                  count: '21 Labs', 
                  color: 'var(--qff-pink)', 
                  bg: 'rgba(255, 64, 129, 0.1)',
                  tab: 'sims',
                  desc: 'Simulation'
                },
                { 
                  title: 'Study', 
                  count: '3 Parts', 
                  color: '#c084fc', 
                  bg: 'rgba(138, 63, 252, 0.15)',
                  tab: 'learn',
                  desc: 'Curriculum'
                }
              ].map((m, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(m.tab as any)}
                  style={{
                    background: 'var(--qff-card)',
                    border: '1px solid var(--qff-border)',
                    borderRadius: 12,
                    padding: '12px 8px',
                    textAlign: 'center',
                    transition: 'transform 0.15s ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: m.color, marginBottom: 2 }}>
                    {m.title}
                  </div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#ffffff' }}>
                    {m.count}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', marginTop: 2 }}>
                    {m.desc}
                  </div>
                </button>
              ))}
            </div>

            {/* Architecture / Verification Card */}
            <div style={{
              background: 'var(--qff-card)',
              borderRadius: 14,
              padding: '16px',
              border: '1px solid var(--qff-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={17} color="var(--qff-green)" />
                  <h2 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Phase 0: Setup Verified</h2>
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--qff-green)', fontWeight: 600 }}>Pass (100%)</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  'React 19 + TypeScript + Vite Scaffolding',
                  'Capacitor 7 Android Native Build (com.qisket.app)',
                  'Vitest Simulation Test Runner Configured',
                  'Antigravity Physics Rules (RULES.md)',
                  'Qiskit Fall Fest 2026 Theme Applied'
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    padding: '6px 10px',
                    borderRadius: 6,
                    background: 'var(--qff-card-subtle)'
                  }}>
                    <CheckCircle2 size={14} color="var(--qff-green)" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Step Preview */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(15, 98, 254, 0.15), rgba(138, 63, 252, 0.15))',
              borderRadius: 14,
              padding: '14px 16px',
              border: '1px solid rgba(15, 98, 254, 0.35)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Layers size={14} color="var(--qff-cyan)" />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--qff-cyan)', textTransform: 'uppercase' }}>
                  Next: Phase 1 Foundations
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                Ready to build the State-Vector Circuit Engine (H, X, Z, S, T, CNOT), Bloch coordinates calculator, and curriculum content schema.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'games' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800 }}>🎮 Quantum Games</h2>
              <span style={{ fontSize: '0.7rem', color: 'var(--qff-cyan)', fontWeight: 600 }}>19 Planned</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Hands-on intuitive puzzles. Each game features visible Honesty Tags distinguishing analogies from literal physics.
            </p>

            {[
              { name: 'Quantum Heist', tag: 'Analogy', focus: 'Qubits & Superposition', phase: 'Phase 2' },
              { name: "Schrödinger's Stealth", tag: 'Simplified', focus: 'Measurement & Probability', phase: 'Phase 5' },
              { name: 'Bloch Runner', tag: 'Accurate', focus: 'Single-Qubit Gate Rotations', phase: 'Phase 5' },
              { name: 'Photon Escape Room', tag: 'Accurate', focus: 'Interference & Phase Shifters', phase: 'Phase 8' },
              { name: 'Alice & Bob: Escape Together', tag: 'Accurate', focus: 'Entanglement & CHSH Game', phase: 'Phase 6' },
              { name: 'Qubit Surgeon', tag: 'Simplified', focus: 'Syndromes & Error Correction', phase: 'Phase 7' }
            ].map((g, i) => (
              <div key={i} style={{
                background: 'var(--qff-card)',
                padding: '12px 14px',
                borderRadius: 12,
                border: '1px solid var(--qff-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#ffffff' }}>{g.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{g.focus}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span style={{
                    fontSize: '0.62rem',
                    color: 'var(--qff-cyan)',
                    background: 'rgba(0, 210, 255, 0.12)',
                    padding: '2px 6px',
                    borderRadius: 4
                  }}>
                    {g.tag}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{g.phase}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'sims' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800 }}>🔬 Simulation Labs</h2>
              <span style={{ fontSize: '0.7rem', color: 'var(--qff-pink)', fontWeight: 600 }}>21 Labs</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Quantitative physics laboratories powered by three specialized simulation engines.
            </p>

            {[
              { name: 'Single-Qubit Lab', engine: 'State-Vector', feature: 'Amplitudes & Bloch Sphere' },
              { name: 'Measurement Shots & Histogram', engine: 'State-Vector', feature: 'Born Rule Sampling' },
              { name: 'Circuit Lab + Bloch Rotation', engine: 'State-Vector', feature: 'Unitary Matrices' },
              { name: 'Mach–Zehnder Optical Lab', engine: 'Interferometer', feature: 'Phase Interference' },
              { name: 'Bell & CHSH Explorer', engine: 'State-Vector', feature: 'Non-classical Correlation' },
              { name: 'Repetition Code Noise Lab', engine: 'Stabilizer', feature: 'Syndrome Parity Checks' }
            ].map((s, i) => (
              <div key={i} style={{
                background: 'var(--qff-card)',
                padding: '12px 14px',
                borderRadius: 12,
                border: '1px solid var(--qff-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#ffffff' }}>{s.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{s.feature}</div>
                </div>
                <span style={{
                  fontSize: '0.65rem',
                  color: 'var(--qff-pink)',
                  background: 'rgba(255, 64, 129, 0.12)',
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontWeight: 600
                }}>
                  {s.engine}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'learn' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800 }}>📚 Structured Curriculum</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Rigorous, misconception-targeted lessons with embedded video notes and quizzes.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ background: 'var(--qff-card)', padding: '14px', borderRadius: 12, border: '1px solid var(--qff-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--qff-cyan)' }}>Part 1: Concepts</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Modules 0–7</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  Qubits, measurement, gates, phase & interference, entanglement, circuits, and error correction.
                </div>
              </div>

              <div style={{ background: 'var(--qff-card)', padding: '14px', borderRadius: 12, border: '1px solid var(--qff-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--qff-pink)' }}>Part 2: Hardware Modalities</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Modules 0–9</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  Superconducting (IBM/Google), Trapped Ion, Neutral Atoms, Photonics, Silicon Spin, and Annealing.
                </div>
              </div>

              <div style={{ background: 'var(--qff-card)', padding: '14px', borderRadius: 12, border: '1px solid var(--qff-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#c084fc' }}>Part 3: Math Companion</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>5 Lessons</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  Dirac notation, unitary matrices, tensor products, Born rule projectors, and Grover 2D geometry.
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800 }}>🏆 Mastery Progress</h2>
              <span style={{ fontSize: '0.7rem', color: 'var(--qff-gold)', fontWeight: 600 }}>Local-First Sync</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Concepts transition through three mastery tiers based on your interactive actions.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, margin: '4px 0' }}>
              <div style={{ background: 'var(--qff-card)', padding: '10px', borderRadius: 10, textAlign: 'center', border: '1px solid var(--qff-border)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--qff-cyan)' }}>Familiar</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Completed Game</div>
              </div>
              <div style={{ background: 'var(--qff-card)', padding: '10px', borderRadius: 10, textAlign: 'center', border: '1px solid var(--qff-border)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--qff-pink)' }}>Explored</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Ran Simulation</div>
              </div>
              <div style={{ background: 'var(--qff-card)', padding: '10px', borderRadius: 10, textAlign: 'center', border: '1px solid var(--qff-border)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--qff-green)' }}>Mastered</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Quiz ≥ 80%</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating AI Tutor Drawer */}
      {tutorOpen && (
        <div style={{
          position: 'absolute',
          bottom: 58,
          left: 0,
          right: 0,
          maxHeight: '65%',
          background: 'rgba(10, 14, 40, 0.98)',
          borderTop: '2px solid var(--qff-purple)',
          padding: '16px',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.85)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          zIndex: 20
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} color="var(--qff-cyan)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Unified AI Tutor</span>
              <span style={{ fontSize: '0.62rem', color: 'var(--qff-pink)', background: 'rgba(255, 64, 129, 0.15)', padding: '1px 6px', borderRadius: 4 }}>
                Course-Grounded
              </span>
            </div>
            <button 
              onClick={() => setTutorOpen(false)}
              style={{ background: 'transparent', color: 'var(--text-dim)', fontSize: '0.75rem', padding: '4px 8px' }}
            >
              Close
            </button>
          </div>

          <div style={{
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            background: 'var(--qff-card-solid)',
            padding: '12px',
            borderRadius: 10,
            lineHeight: 1.5,
            border: '1px solid var(--qff-border)'
          }}>
            👋 Welcome to <b>Qiskit Fall Fest 2026</b>! I answer quantum questions using verified lesson text and video notes.
            <div style={{ marginTop: 8, fontSize: '0.7rem', color: 'var(--qff-cyan)' }}>
              • Common misconception detection enabled<br />
              • Beginner, Intermediate, and Math-ready levels<br />
              • Grounded citations for every response
            </div>
          </div>
        </div>
      )}

      {/* Bottom Five-Tab Navigation */}
      <nav style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 58,
        background: 'rgba(10, 14, 40, 0.96)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--qff-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 4px',
        zIndex: 10
      }}>
        {[
          { id: 'home', label: 'Home', icon: Home },
          { id: 'games', label: 'Games', icon: Gamepad2 },
          { id: 'sims', label: 'Sims', icon: FlaskConical },
          { id: 'learn', label: 'Learn', icon: BookOpen },
          { id: 'progress', label: 'Progress', icon: Trophy }
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
                gap: 3,
                width: 62,
                height: 46,
                color: isActive ? 'var(--qff-cyan)' : 'var(--text-dim)',
                transition: 'color 0.15s ease'
              }}
            >
              <Icon size={19} strokeWidth={isActive ? 2.6 : 1.8} color={isActive ? 'var(--qff-cyan)' : 'currentColor'} />
              <span style={{ fontSize: '0.64rem', fontWeight: isActive ? 800 : 500 }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
