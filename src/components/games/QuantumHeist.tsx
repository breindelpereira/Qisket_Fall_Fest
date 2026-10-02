import React, { useState } from 'react';
import { useProgress } from '../../hooks/useProgress';
import { HonestyTagBadge } from '../shared/HonestyTag';
import { BlochSphereVisualizer } from '../simulations/BlochSphereVisualizer';
import { Complex } from '../../core/circuit';
import type { BlochCoordinates } from '../../core/circuit/bloch';
import { 
  Key, 
  ShieldAlert, 
  RotateCcw, 
  ChevronRight, 
  Lock, 
  Unlock, 
  ArrowRight,
  ShieldCheck,
  Trophy
} from 'lucide-react';



export const QuantumHeist: React.FC = () => {
  const { completeGame } = useProgress();

  // Levels: 1 (Superposition Doors), 2 (Phase Lock), 3 (Bloch Aim)
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [gameState, setGameState] = useState<'playing' | 'failed' | 'level_complete' | 'victory'>('playing');
  const [feedback, setFeedback] = useState<string>('');

  // Level 1 & 2 state: alpha and beta amplitudes
  // Initial state |0> = alpha=1, beta=0
  const [alpha, setAlpha] = useState<Complex>(Complex.one());
  const [beta, setBeta] = useState<Complex>(Complex.zero());

  // Level 3 state: theta and phi
  const [theta, setTheta] = useState(0);
  const [phi, setPhi] = useState(0);

  // Target for Level 3
  const target3: BlochCoordinates = {
    x: 1,
    y: 0,
    z: 0,
    theta: Math.PI / 2,
    phi: 0, // Target is |+>
  };



  // Level 3 coords
  const level3Coords: BlochCoordinates = {
    x: Number((Math.sin(theta) * Math.cos(phi)).toFixed(3)),
    y: Number((Math.sin(theta) * Math.sin(phi)).toFixed(3)),
    z: Number(Math.cos(theta).toFixed(3)),
    theta,
    phi,
  };

  // Reset current level
  const resetLevel = () => {
    setAlpha(Complex.one());
    setBeta(Complex.zero());
    setTheta(0);
    setPhi(0);
    setGameState('playing');
    setFeedback('');
  };

  // Apply Gate in Level 1 & 2
  const applyHadamard = () => {
    const inv = 1 / Math.SQRT2;
    const newA = Complex.create(inv * (alpha.re + beta.re), inv * (alpha.im + beta.im));
    const newB = Complex.create(inv * (alpha.re - beta.re), inv * (alpha.im - beta.im));
    setAlpha(newA);
    setBeta(newB);
  };

  const applyPauliX = () => {
    const temp = alpha;
    setAlpha(beta);
    setBeta(temp);
  };

  const applyPauliZ = () => {
    setBeta(Complex.scale(beta, -1));
  };

  // Level 1: Attempt to breach vault doors
  const testLevel1 = () => {
    const prob0 = Complex.absSq(alpha);
    const prob1 = Complex.absSq(beta);

    // Goal: Superposition where both doors have 50% probability
    if (Math.abs(prob0 - 0.5) < 0.05 && Math.abs(prob1 - 0.5) < 0.05) {
      setFeedback('Success! The laser scanners detected both doors simultaneously in superposition!');
      setGameState('level_complete');
    } else {
      setFeedback('Alarm Triggered! The scanner caught a definite classical state (0 or 1). Put the key into superposition!');
      setGameState('failed');
    }
  };

  // Level 2: Target is |- > (negative relative phase)
  const testLevel2 = () => {
    // |- > has alpha = 1/sqrt(2), beta = -1/sqrt(2)
    const isSuperposition = Math.abs(Complex.absSq(alpha) - 0.5) < 0.05;
    const isNegativePhase = beta.re < -0.6;

    if (isSuperposition && isNegativePhase) {
      setFeedback('Success! Negative relative phase |−⟩ bypassed the anti-phase defense grid!');
      setGameState('level_complete');
    } else if (isSuperposition) {
      setFeedback('Close! You have superposition |+⟩, but this lock needs the negative relative phase |−⟩! Apply Pauli-Z.');
      setGameState('failed');
    } else {
      setFeedback('Alarm! The system detected classical state. Create a superposition first!');
      setGameState('failed');
    }
  };

  // Level 3: Bloch Aim
  const testLevel3 = () => {
    const dx = level3Coords.x - target3.x;
    const dy = level3Coords.y - target3.y;
    const dz = level3Coords.z - target3.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (dist < 0.25) {
      setFeedback('Vault Core Decrypted! You successfully steered the quantum state arrow directly into the lock target!');
      setGameState('victory');
      completeGame('quantum_heist', 'concept_qubits');
    } else {
      setFeedback('Lock Jammed! State vector did not align with the target lock. Rotate theta and phi closer to |+⟩!');
      setGameState('failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Game Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>Quantum Heist</h2>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Level {level} of 3 • {level === 1 ? 'Superposition Doors' : level === 2 ? 'Phase Frequency Lock' : 'Bloch Aim Sphere Lock'}
          </div>
        </div>
        <HonestyTagBadge tag="Simplified model" />
      </div>

      {/* Main Game Stage Card */}
      <div style={{
        background: 'var(--bg-surface)',
        borderRadius: 20,
        padding: '18px 16px',
        border: '1px solid var(--border-accent)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }}>
        {/* Mission Briefing */}
        <div style={{
          background: 'rgba(8, 11, 26, 0.7)',
          borderRadius: 12,
          padding: '10px 14px',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.78rem',
          lineHeight: 1.45,
          color: 'var(--text-secondary)'
        }}>
          {level === 1 && (
            <span>
              🎯 <b>Objective:</b> The vault scanner tests Door 0 and Door 1. If you are in only one state, the alarm triggers. Use the <b>Hadamard (H) Key</b> to place your state into equal superposition!
            </span>
          )}
          {level === 2 && (
            <span>
              🎯 <b>Objective:</b> The secondary vault is shielded with an inverse phase barrier. Prepare state <b>|−⟩</b> by creating superposition with <b>H</b> and flipping the relative phase with <b>Z</b>.
            </span>
          )}
          {level === 3 && (
            <span>
              🎯 <b>Objective (Bloch Aim):</b> The master vault core is a 3D Bloch sphere. Adjust the rotation dials to steer the state vector directly onto target state <b>|+⟩</b> at the equator!
            </span>
          )}
        </div>

        {/* Level 1 & 2 Interactive Doors Display */}
        {level < 3 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            padding: '12px 0'
          }}>
            {/* Door 0 */}
            <div style={{
              background: 'rgba(19, 25, 67, 0.8)',
              border: `2px solid ${Complex.absSq(alpha) > 0.1 ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
              borderRadius: 14,
              padding: '16px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              boxShadow: Complex.absSq(alpha) > 0.1 ? '0 0 15px rgba(0, 210, 255, 0.2)' : 'none'
            }}>
              {Complex.absSq(alpha) > 0.4 ? <Unlock size={24} color="var(--accent-cyan)" /> : <Lock size={24} color="#64748b" />}
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>Door |0⟩</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                Amplitude: {alpha.re.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                P(0): {(Complex.absSq(alpha) * 100).toFixed(0)}%
              </div>
            </div>

            {/* Door 1 */}
            <div style={{
              background: 'rgba(19, 25, 67, 0.8)',
              border: `2px solid ${Complex.absSq(beta) > 0.1 ? 'var(--accent-pink)' : 'var(--border-subtle)'}`,
              borderRadius: 14,
              padding: '16px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              boxShadow: Complex.absSq(beta) > 0.1 ? '0 0 15px rgba(255, 64, 129, 0.2)' : 'none'
            }}>
              {Complex.absSq(beta) > 0.4 ? <Unlock size={24} color="var(--accent-pink)" /> : <Lock size={24} color="#64748b" />}
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>Door |1⟩</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-pink)', fontWeight: 700 }}>
                Amplitude: {beta.re.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                P(1): {(Complex.absSq(beta) * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        )}

        {/* Level 3: Bloch Aim 3D Visualizer */}
        {level === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <BlochSphereVisualizer
              coordinates={level3Coords}
              targetCoordinates={target3}
              size={220}
            />

            {/* Steering Dials */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 2 }}>
                  <span>Steer Polar Angle (θ)</span>
                  <span style={{ color: '#fff', fontWeight: 700 }}>{(theta * (180 / Math.PI)).toFixed(0)}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.PI}
                  step="0.05"
                  value={theta}
                  onChange={(e) => setTheta(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 2 }}>
                  <span>Steer Phase Angle (φ)</span>
                  <span style={{ color: '#fff', fontWeight: 700 }}>{(phi * (180 / Math.PI)).toFixed(0)}°</span>
                </div>
                <input
                  type="range"
                  min={-Math.PI}
                  max={Math.PI}
                  step="0.05"
                  value={phi}
                  onChange={(e) => setPhi(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-pink)' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Feedback Message */}
        {feedback && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 10,
            fontSize: '0.76rem',
            lineHeight: 1.45,
            background: gameState === 'failed' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(37, 162, 68, 0.15)',
            border: `1px solid ${gameState === 'failed' ? '#f43f5e' : '#22c55e'}`,
            color: gameState === 'failed' ? '#fca5a5' : '#86efac',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            {gameState === 'failed' ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
            <span>{feedback}</span>
          </div>
        )}

        {/* Quantum Tool Buttons for Level 1 & 2 */}
        {level < 3 && gameState === 'playing' && (
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 6 }}>
              Infiltration Tools
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <button
                onClick={applyHadamard}
                style={{
                  background: 'var(--accent-btn)',
                  color: '#080b1a',
                  padding: '10px 6px',
                  borderRadius: 12,
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4
                }}
              >
                <Key size={14} />
                <span>Hadamard (H)</span>
              </button>

              <button
                onClick={applyPauliX}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#fff',
                  border: '1px solid var(--border-subtle)',
                  padding: '10px 6px',
                  borderRadius: 12,
                  fontSize: '0.82rem',
                  fontWeight: 700
                }}
              >
                Pauli-X (Flip)
              </button>

              <button
                onClick={applyPauliZ}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#fff',
                  border: '1px solid var(--border-subtle)',
                  padding: '10px 6px',
                  borderRadius: 12,
                  fontSize: '0.82rem',
                  fontWeight: 700
                }}
              >
                Pauli-Z (Phase)
              </button>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          {gameState === 'playing' && (
            <button
              onClick={level === 1 ? testLevel1 : level === 2 ? testLevel2 : testLevel3}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 12,
                background: 'var(--accent-btn)',
                color: '#080b1a',
                fontSize: '0.9rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <span>{level === 3 ? 'Lock & Decrypt' : 'Attempt Breach'}</span>
              <ArrowRight size={16} />
            </button>
          )}

          {gameState === 'failed' && (
            <button
              onClick={resetLevel}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <RotateCcw size={16} />
              <span>Retry Infiltration</span>
            </button>
          )}

          {gameState === 'level_complete' && (
            <button
              onClick={() => {
                setLevel((l) => (l + 1) as any);
                resetLevel();
              }}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <span>Next Security Layer</span>
              <ChevronRight size={18} />
            </button>
          )}

          {gameState === 'victory' && (
            <div style={{
              width: '100%',
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(0, 210, 255, 0.2))',
              border: '1px solid #22c55e',
              borderRadius: 14,
              padding: '14px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8
            }}>
              <Trophy size={32} color="#fbbf24" />
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
                Heist Complete! Vault Unlocked!
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                You have earned the <b>Familiar with Superposition</b> badge.
              </div>
              <button
                onClick={() => {
                  setLevel(1);
                  resetLevel();
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  marginTop: 4
                }}
              >
                Replay Game
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
