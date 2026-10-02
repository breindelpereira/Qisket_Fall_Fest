import { useState } from 'react';
import { 
  Home, 
  Gamepad2, 
  FlaskConical, 
  BookOpen, 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  Atom
} from 'lucide-react';


export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'games' | 'sims' | 'learn' | 'progress'>('home');
  const [tutorOpen, setTutorOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      {/* Top Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-card)',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Atom size={20} color="#080c14" />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
              Qisket
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Phase 0 • Setup
            </div>
          </div>
        </div>

        <button 
          onClick={() => setTutorOpen(!tutorOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 20,
            background: tutorOpen ? 'var(--accent-purple)' : 'rgba(192, 132, 252, 0.15)',
            border: '1px solid rgba(192, 132, 252, 0.4)',
            color: tutorOpen ? '#080c14' : 'var(--accent-purple)',
            fontSize: '0.8rem',
            fontWeight: 600,
            transition: 'all 0.2s ease'
          }}
        >
          <Sparkles size={14} />
          <span>Ask Tutor</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: '80px' }}>
        {activeTab === 'home' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Hero Card */}
            <div style={{
              background: 'linear-gradient(145deg, #131d36, #0f172a)',
              borderRadius: 16,
              padding: '20px',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: 10,
                  background: 'rgba(52, 211, 153, 0.15)',
                  color: 'var(--accent-green)',
                  fontWeight: 600
                }}>
                  SETUP VERIFIED
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>v0.1.0</span>
              </div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 6, lineHeight: 1.2 }}>
                Quantum Computing, Hands-On
              </h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 16 }}>
                Play it for intuition. Experiment with simulations. Study structured lessons with an in-course AI tutor.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
                padding: '10px',
                borderRadius: 12,
                background: 'rgba(8, 12, 20, 0.6)'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>19</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Games</div>
                </div>
                <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border-card)', borderRight: '1px solid var(--border-card)' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-green)' }}>21</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Simulations</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-purple)' }}>3</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Parts (Learn)</div>
                </div>
              </div>
            </div>

            {/* Phase 0 Checklist */}
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 14,
              padding: '16px',
              border: '1px solid var(--border-card)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <CheckCircle2 size={18} color="var(--accent-green)" />
                <h2 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Phase 0: Setup Checklist</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Vite + React 19 + TypeScript', ready: true },
                  { label: 'Capacitor Android Project (com.qisket.app)', ready: true },
                  { label: 'Vitest Unit Test Runner', ready: true },
                  { label: 'Antigravity Rules & Folder Scaffold', ready: true },
                  { label: 'Git Repo Connected & Synced with Remote', ready: true },
                  { label: 'Runs in Chrome Browser & Mobile Device', ready: true }
                ].map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: '0.8rem',
                    color: 'var(--text-main)',
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: 'var(--bg-card-subtle)'
                  }}>
                    <CheckCircle2 size={16} color="var(--accent-green)" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Preview */}
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 14,
              padding: '16px',
              border: '1px solid var(--border-card)'
            }}>
              <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Up Next: Phase 1 (Foundations)
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12 }}>
                Building State-Vector Engine (H, X, Z, S, T, CNOT), Born-rule measurement, Bloch coordinates, content schema, and localStorage progress.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'games' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>🎮 Games Catalog</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              19 games designed to build intuition through low-friction play.
            </p>
            {['Quantum Heist', "Schrödinger's Stealth", 'Bloch Runner', 'Photon Escape Room', 'Alice & Bob'].map((title, i) => (
              <div key={i} style={{
                background: 'var(--bg-card)',
                padding: '12px 14px',
                borderRadius: 10,
                border: '1px solid var(--border-card)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{title}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 8px', borderRadius: 6 }}>
                  Phase {i === 0 ? '2' : i + 2}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'sims' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>🔬 Simulation Labs</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              21 quantitative laboratories across 3 specialized engine archetypes.
            </p>
            {['Single-Qubit Lab', 'Measurement Shots & Histogram', 'Circuit Lab + Bloch Sphere', 'Mach–Zehnder Lab', 'Two-Qubit Lab'].map((title, i) => (
              <div key={i} style={{
                background: 'var(--bg-card)',
                padding: '12px 14px',
                borderRadius: 10,
                border: '1px solid var(--border-card)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{title}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-green)', background: 'rgba(52, 211, 153, 0.1)', padding: '2px 8px', borderRadius: 6 }}>
                  Lab {i + 1}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'learn' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>📚 Structured Curriculum</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: 10, border: '1px solid var(--border-card)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>Part 1: Concepts</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>8 modules (0–7) • Superposition, measurement, gates, entanglement</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: 10, border: '1px solid var(--border-card)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-purple)' }}>Part 2: Hardware Modalities</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>10 modules (0–9) • Superconducting, trapped ion, neutral atoms, photonics</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: 10, border: '1px solid var(--border-card)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-green)' }}>Part 3: Math Companion</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Week 0 primer + 5 lessons • State vectors, matrices, Grover geometry</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>🏆 Mastery Progress</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Concepts tracked through Familiar (Play), Explored (Simulate), and Mastered (Learn).
            </p>
            <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 10, border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Qubits & Superposition</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>Status: Ready for Phase 1 Foundations</div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Tutor Drawer Preview */}
      {tutorOpen && (
        <div style={{
          position: 'absolute',
          bottom: 60,
          left: 0,
          right: 0,
          maxHeight: '60%',
          background: 'rgba(15, 23, 42, 0.98)',
          borderTop: '1px solid var(--accent-purple)',
          padding: '16px',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.8)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          zIndex: 20
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} color="var(--accent-purple)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Unified AI Tutor (Preview)</span>
            </div>
            <button 
              onClick={() => setTutorOpen(false)}
              style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '4px 8px' }}
            >
              Close
            </button>
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            background: 'var(--bg-card-subtle)',
            padding: '10px',
            borderRadius: 8,
            lineHeight: 1.5
          }}>
            👋 Hello! I will answer your quantum questions using only verified course content and lessons. (Full serverless integration in Phase 3).
          </div>
        </div>
      )}

      {/* Bottom Five-Tab Navigation */}
      <nav style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid var(--border-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 8px',
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
                gap: 4,
                width: 60,
                height: 48,
                color: isActive ? 'var(--accent-cyan)' : 'var(--text-dim)',
                transition: 'color 0.15s ease'
              }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span style={{ fontSize: '0.65rem', fontWeight: isActive ? 700 : 500 }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
