import React, { useState, useMemo, useEffect } from 'react';
import { QuantumStateVector, Complex } from '../../core/circuit';
import type { BlochCoordinates } from '../../core/circuit/bloch';
import { BlochSphereVisualizer } from './BlochSphereVisualizer';
import { HonestyTagBadge } from '../shared/HonestyTag';
import { useProgress } from '../../hooks/useProgress';
import { 
  RotateCcw, 
  Target, 
  CheckCircle2, 
  Binary, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';


export const SingleQubitLab: React.FC = () => {
  const { runSimulation } = useProgress();

  // 1-qubit quantum state vector initialized to |0>
  const [theta, setTheta] = useState(0); // 0 = |0>, pi = |1>
  const [phi, setPhi] = useState(0);     // 0 = |+>, pi = |->

  const [showMath, setShowMath] = useState(false);
  const [challengeMode, setChallengeMode] = useState(false);
  const [targetCoords, setTargetCoords] = useState<BlochCoordinates | undefined>(undefined);
  const [challengeSolved, setChallengeSolved] = useState(false);

  // Mark simulation as explored on mount
  useEffect(() => {
    runSimulation('single_qubit_lab', 'concept_qubits');
  }, [runSimulation]);

  // Compute state amplitudes from theta and phi:
  // |psi> = cos(theta/2)|0> + e^(i phi) sin(theta/2)|1>
  const stateVector = useMemo(() => {
    const alpha = Complex.create(Math.cos(theta / 2), 0);
    const beta = Complex.create(
      Math.sin(theta / 2) * Math.cos(phi),
      Math.sin(theta / 2) * Math.sin(phi)
    );
    return QuantumStateVector.fromAmplitudes([alpha, beta]);
  }, [theta, phi]);

  const blochCoords = useMemo(() => {
    return stateVector.getBlochCoordinates();
  }, [stateVector]);

  // Probabilities
  const prob0 = Complex.absSq(stateVector.amplitudes[0]);
  const prob1 = Complex.absSq(stateVector.amplitudes[1]);

  // Handle Preset States
  const setNamedState = (name: '0' | '1' | '+' | '-' | '+i' | '-i') => {
    switch (name) {
      case '0':
        setTheta(0);
        setPhi(0);
        break;
      case '1':
        setTheta(Math.PI);
        setPhi(0);
        break;
      case '+':
        setTheta(Math.PI / 2);
        setPhi(0);
        break;
      case '-':
        setTheta(Math.PI / 2);
        setPhi(Math.PI);
        break;
      case '+i':
        setTheta(Math.PI / 2);
        setPhi(Math.PI / 2);
        break;
      case '-i':
        setTheta(Math.PI / 2);
        setPhi(-Math.PI / 2);
        break;
    }
  };

  // Apply Gate directly to state
  const applyGate = (gateName: 'H' | 'X' | 'Z' | 'S') => {
    const nextState = stateVector.clone();
    if (gateName === 'H') nextState.applyH(0);
    if (gateName === 'X') nextState.applyX(0);
    if (gateName === 'Z') nextState.applyZ(0);
    if (gateName === 'S') nextState.applyS(0);

    const coords = nextState.getBlochCoordinates();
    setTheta(coords.theta);
    setPhi(coords.phi);
  };

  // Challenge Mode
  const startChallenge = () => {
    const targets: BlochCoordinates[] = [
      { x: 1, y: 0, z: 0, theta: Math.PI / 2, phi: 0 },             // |+>
      { x: -1, y: 0, z: 0, theta: Math.PI / 2, phi: Math.PI },       // |->
      { x: 0, y: 1, z: 0, theta: Math.PI / 2, phi: Math.PI / 2 },    // |+i>
      { x: 0, y: 0, z: -1, theta: Math.PI, phi: 0 },                 // |1>
    ];
    const chosen = targets[Math.floor(Math.random() * targets.length)];
    setTargetCoords(chosen);
    setChallengeMode(true);
    setChallengeSolved(false);
  };

  // Check if current state matches target within threshold
  useEffect(() => {
    if (challengeMode && targetCoords) {
      const dx = blochCoords.x - targetCoords.x;
      const dy = blochCoords.y - targetCoords.y;
      const dz = blochCoords.z - targetCoords.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < 0.25) {
        setChallengeSolved(true);
      }
    }
  }, [blochCoords, challengeMode, targetCoords]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Lab Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>Single-Qubit Lab</h2>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Superposition, Phase, and the Bloch Sphere
          </div>
        </div>
        <HonestyTagBadge tag="Accurate" />
      </div>

      {/* 3D Bloch Sphere Canvas */}
      <div style={{
        background: 'var(--bg-surface)',
        borderRadius: 20,
        padding: '16px 12px 10px',
        border: '1px solid var(--border-accent)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
      }}>
        <BlochSphereVisualizer
          coordinates={blochCoords}
          targetCoordinates={challengeMode ? targetCoords : undefined}
          size={250}
        />

        {/* Challenge Victory Alert */}
        {challengeMode && challengeSolved && (
          <div style={{
            position: 'absolute',
            top: 16,
            left: 16,
            right: 16,
            background: 'rgba(37, 162, 68, 0.95)',
            color: '#fff',
            padding: '10px 14px',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 20px rgba(37, 162, 68, 0.4)',
            zIndex: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={18} />
              <span style={{ fontSize: '0.82rem', fontWeight: 800 }}>Target Matched! State Verified!</span>
            </div>
            <button
              onClick={startChallenge}
              style={{
                background: '#fff',
                color: '#15803d',
                borderRadius: 8,
                padding: '4px 10px',
                fontSize: '0.72rem',
                fontWeight: 700
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Measurement Probability Bar */}
      <div style={{
        background: 'var(--bg-surface)',
        borderRadius: 16,
        padding: '12px 16px',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700 }}>
          <span style={{ color: 'var(--accent-cyan)' }}>P(|0⟩): {(prob0 * 100).toFixed(1)}%</span>
          <span style={{ color: 'var(--accent-pink)' }}>P(|1⟩): {(prob1 * 100).toFixed(1)}%</span>
        </div>

        {/* Split Probability Bar */}
        <div style={{
          height: 10,
          background: 'rgba(255, 64, 129, 0.25)',
          borderRadius: 6,
          overflow: 'hidden',
          display: 'flex'
        }}>
          <div style={{
            width: `${prob0 * 100}%`,
            height: '100%',
            background: 'var(--accent-cyan)',
            transition: 'width 0.15s ease'
          }} />
          <div style={{
            width: `${prob1 * 100}%`,
            height: '100%',
            background: 'var(--accent-pink)',
            transition: 'width 0.15s ease'
          }} />
        </div>
      </div>

      {/* Named Presets */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 6 }}>
          Preset Quantum States
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
          {(['0', '1', '+', '-', '+i', '-i'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setNamedState(s)}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                padding: '8px 0',
                borderRadius: 10,
                fontSize: '0.8rem',
                fontWeight: 700,
                transition: 'all 0.1s ease'
              }}
            >
              |{s}⟩
            </button>
          ))}
        </div>
      </div>

      {/* Quantum Unitary Gates */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 6 }}>
          Apply Unitary Gates
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[
            { name: 'H', label: 'Hadamard', desc: 'X ↔ Z' },
            { name: 'X', label: 'Pauli-X', desc: 'NOT / Bit flip' },
            { name: 'Z', label: 'Pauli-Z', desc: 'Phase flip' },
            { name: 'S', label: 'S-Gate', desc: 'π/2 Z-rot' },
          ].map((g) => (
            <button
              key={g.name}
              onClick={() => applyGate(g.name as any)}
              style={{
                background: 'linear-gradient(135deg, rgba(0, 210, 255, 0.12), rgba(138, 63, 252, 0.12))',
                border: '1px solid var(--border-subtle)',
                padding: '8px 4px',
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2
              }}
            >
              <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>
                {g.name}
              </span>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>
                {g.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Amplitude & Phase Sliders */}
      <div style={{
        background: 'var(--bg-surface)',
        borderRadius: 16,
        padding: '14px',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}>
        {/* Theta Polar Angle Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
            <span>Polar Angle (θ) — Superposition Weight</span>
            <span style={{ fontWeight: 700, color: '#fff' }}>{(theta * (180 / Math.PI)).toFixed(0)}°</span>
          </div>
          <input
            type="range"
            min="0"
            max={Math.PI}
            step="0.02"
            value={theta}
            onChange={(e) => setTheta(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
          />
        </div>

        {/* Phi Azimuthal Angle Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
            <span>Phase Angle (φ) — Relative Phase</span>
            <span style={{ fontWeight: 700, color: '#fff' }}>{(phi * (180 / Math.PI)).toFixed(0)}°</span>
          </div>
          <input
            type="range"
            min={-Math.PI}
            max={Math.PI}
            step="0.02"
            value={phi}
            onChange={(e) => setPhi(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-pink)' }}
          />
        </div>
      </div>

      {/* Target State Challenge Mode Trigger */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={challengeMode ? () => setChallengeMode(false) : startChallenge}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: 12,
            background: challengeMode ? 'rgba(251, 191, 36, 0.15)' : 'var(--bg-surface)',
            border: `1px solid ${challengeMode ? '#fbbf24' : 'var(--border-subtle)'}`,
            color: challengeMode ? '#fbbf24' : '#fff',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <Target size={16} />
          <span>{challengeMode ? 'Exit Challenge' : 'Match Target State Challenge'}</span>
        </button>

        <button
          onClick={() => { setTheta(0); setPhi(0); }}
          style={{
            padding: '12px',
            borderRadius: 12,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Reset to |0>"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Show the Math Toggle */}
      <div style={{
        background: 'var(--bg-surface)',
        borderRadius: 14,
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden'
      }}>
        <button
          onClick={() => setShowMath(!showMath)}
          style={{
            width: '100%',
            padding: '12px 14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'transparent',
            color: '#fff',
            fontSize: '0.8rem',
            fontWeight: 700
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Binary size={15} color="var(--accent-cyan)" />
            <span>Show the Math (Dirac & Matrix Representation)</span>
          </div>
          {showMath ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showMath && (
          <div style={{
            padding: '14px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(8, 11, 26, 0.6)',
            fontSize: '0.78rem',
            lineHeight: 1.6,
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}>
            <div>
              <div style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>Dirac State Vector:</div>
              <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                |ψ⟩ = ({stateVector.amplitudes[0].re.toFixed(3)})|0⟩ + ({stateVector.amplitudes[1].re.toFixed(3)} + {stateVector.amplitudes[1].im.toFixed(3)}i)|1⟩
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>Matrix Column Vector:</div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                display: 'inline-block',
                borderLeft: '2px solid #fff',
                borderRight: '2px solid #fff',
                padding: '2px 8px',
                borderRadius: 4
              }}>
                <div>[{stateVector.amplitudes[0].re.toFixed(3)}]</div>
                <div>[{stateVector.amplitudes[1].re.toFixed(3)} + {stateVector.amplitudes[1].im.toFixed(3)}i]</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
