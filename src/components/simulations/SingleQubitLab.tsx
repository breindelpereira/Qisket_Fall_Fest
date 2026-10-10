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
  ChevronUp,
  Compass,
  Lightbulb,
  Dices,
  HelpCircle,
  FlaskConical
} from 'lucide-react';

export const SingleQubitLab: React.FC = () => {
  const { runSimulation } = useProgress();

  // 1-qubit quantum state vector parameters:
  // theta: Polar angle (0 = North Pole |0>, pi = South Pole |1>)
  // phi: Azimuthal phase angle (0 = |+>, pi = |->, pi/2 = |+i>)
  const [theta, setTheta] = useState(0);
  const [phi, setPhi] = useState(0);

  // UI state
  const [showMath, setShowMath] = useState(false);
  const [showFieldGuide, setShowFieldGuide] = useState(false);
  const [activeExperiment, setActiveExperiment] = useState<'none' | 'superposition' | 'phase' | 'bitflip'>('none');
  const [challengeMode, setChallengeMode] = useState(false);
  const [targetCoords, setTargetCoords] = useState<BlochCoordinates | undefined>(undefined);
  const [challengeSolved, setChallengeSolved] = useState(false);

  // Measurement sampling simulation state (100 shots)
  const [shotsResult, setShotsResult] = useState<{ count0: number; count1: number; shots: number } | null>(null);
  const [isSampling, setIsSampling] = useState(false);

  // Count the lab as explored only once the learner does something: solves the challenge or samples shots
  useEffect(() => {
    if (challengeSolved || shotsResult) {
      runSimulation('single_qubit_lab', 'concept_qubits');
    }
  }, [challengeSolved, shotsResult, runSimulation]);

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

  // Probabilities from Born rule: P(0) = |alpha|^2, P(1) = |beta|^2
  const prob0 = Complex.absSq(stateVector.amplitudes[0]);
  const prob1 = Complex.absSq(stateVector.amplitudes[1]);

  // Helper to identify standard named state
  const namedState = useMemo(() => {
    const degTheta = Math.round(theta * (180 / Math.PI));
    const degPhi = Math.round(phi * (180 / Math.PI));

    if (degTheta === 0) return { symbol: '|0⟩', name: 'Ground State (North Pole)', category: 'classical' };
    if (degTheta === 180) return { symbol: '|1⟩', name: 'Excited State (South Pole)', category: 'classical' };
    if (degTheta === 90 && degPhi === 0) return { symbol: '|+⟩', name: 'Symmetric Superposition (+X)', category: 'equator' };
    if (degTheta === 90 && (degPhi === 180 || degPhi === -180)) return { symbol: '|−⟩', name: 'Anti-Phase Superposition (-X)', category: 'equator' };
    if (degTheta === 90 && degPhi === 90) return { symbol: '|+i⟩', name: 'Circular Phase Superposition (+Y)', category: 'equator' };
    if (degTheta === 90 && degPhi === -90) return { symbol: '|−i⟩', name: 'Circular Phase Superposition (-Y)', category: 'equator' };
    
    if (degTheta === 90) return { symbol: '|ψ⟩', name: 'Equator Superposition (50/50)', category: 'equator' };
    return { symbol: '|ψ⟩', name: 'Arbitrary Superposition', category: 'arbitrary' };
  }, [theta, phi]);

  // Handle Preset States
  const setNamedState = (name: '0' | '1' | '+' | '-' | '+i' | '-i') => {
    setShotsResult(null);
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
    setShotsResult(null);
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
      if (dist < 0.28) {
        setChallengeSolved(true);
      }
    }
  }, [blochCoords, challengeMode, targetCoords]);

  // Simulate 100 quantum measurements using the Born rule
  const run100Measurements = () => {
    setIsSampling(true);
    setTimeout(() => {
      let count0 = 0;
      for (let i = 0; i < 100; i++) {
        if (Math.random() < prob0) {
          count0++;
        }
      }
      setShotsResult({
        count0,
        count1: 100 - count0,
        shots: 100
      });
      setIsSampling(false);
    }, 250);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Lab Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="pixel" style={{ fontSize: '0.9rem', color: '#fff' }}>Single-Qubit Lab</h2>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            Interactive 3D Bloch Sphere & Quantum Measurement Simulation
          </div>
        </div>
        <HonestyTagBadge tag="Accurate" />
      </div>

      {/* ============================================================== */}
      {/* 1. BEGINNER'S QUICK GUIDE: WHAT ARE YOU LOOKING AT?            */}
      {/* ============================================================== */}
      <div style={{
        background: 'linear-gradient(145deg, rgba(0, 210, 255, 0.1) 0%, rgba(138, 63, 252, 0.08) 100%)',
        border: '1px solid rgba(0, 210, 255, 0.3)',
        borderRadius: 16,
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Compass size={16} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              How to Read the Bloch Sphere
            </span>
          </div>

          <button
            onClick={() => setShowFieldGuide(!showFieldGuide)}
            style={{
              minHeight: 44,
              padding: '0 4px',
              background: 'transparent',
              color: 'var(--accent-cyan)',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <HelpCircle size={13} />
            <span>{showFieldGuide ? 'Hide Guide' : 'Full Field Guide'}</span>
          </button>
        </div>

        <p style={{ fontSize: '0.76rem', color: '#f1eaff', lineHeight: 1.45 }}>
          The <b>Bloch Sphere</b> is the 3D compass of a single qubit. The red arrow represents the qubit's quantum state:
        </p>

        {/* Visual Pill Landmarks */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, fontSize: '0.7rem' }}>
          <div style={{
            background: 'rgba(0, 210, 255, 0.12)',
            padding: '6px 8px',
            borderRadius: 8,
            border: '1px solid rgba(0, 210, 255, 0.25)'
          }}>
            <div style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>North Pole |0⟩</div>
            <div style={{ color: '#ddd0fa', fontSize: '0.65rem' }}>100% chance of 0</div>
          </div>

          <div style={{
            background: 'rgba(138, 63, 252, 0.12)',
            padding: '6px 8px',
            borderRadius: 8,
            border: '1px solid rgba(138, 63, 252, 0.25)'
          }}>
            <div style={{ color: '#c084fc', fontWeight: 800 }}>Equator |+⟩</div>
            <div style={{ color: '#ddd0fa', fontSize: '0.65rem' }}>50% 0 + 50% 1</div>
          </div>

          <div style={{
            background: 'rgba(255, 64, 129, 0.12)',
            padding: '6px 8px',
            borderRadius: 8,
            border: '1px solid rgba(255, 64, 129, 0.25)'
          }}>
            <div style={{ color: 'var(--accent-pink)', fontWeight: 800 }}>South Pole |1⟩</div>
            <div style={{ color: '#ddd0fa', fontSize: '0.65rem' }}>100% chance of 1</div>
          </div>
        </div>

        {/* Expandable Field Guide */}
        {showFieldGuide && (
          <div style={{
            marginTop: 6,
            paddingTop: 8,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '0.74rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 6
          }}>
            <div>
              <b style={{ color: '#fff' }}>1. Why is it a sphere instead of a circle?</b>
              <p>Quantum states have two angles: <b>Latitude (θ)</b> which controls the probability split between 0 and 1, and <b>Longitude (φ)</b> which controls the relative phase (the timing of the quantum wave).</p>
            </div>
            <div>
              <b style={{ color: '#fff' }}>2. What do quantum gates do?</b>
              <p>Quantum gates are rigid 3D rotations of the sphere! <b>[X]</b> flips the arrow upside down (North ↔ South), <b>[Z]</b> spins around the vertical axis, and <b>[H]</b> reflects diagonally between pole and equator!</p>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 2. 3D BLOCH SPHERE CANVAS                                      */}
      {/* ============================================================== */}
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
        {/* Dynamic State Identity Header */}
        <div style={{
          position: 'absolute',
          top: 12,
          left: 14,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 5
        }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
            CURRENT STATE
          </span>
          <span style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>
            {namedState.symbol} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fff' }}>({namedState.name})</span>
          </span>
        </div>

        {/* 3D Visualizer */}
        <BlochSphereVisualizer
          coordinates={blochCoords}
          targetCoordinates={challengeMode ? targetCoords : undefined}
          size={250}
        />

        {/* Coordinates Readout */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          padding: '6px 12px',
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: 8,
          fontSize: '0.68rem',
          color: '#ddd0fa',
          fontFamily: 'monospace'
        }}>
          <span>X: {blochCoords.x.toFixed(2)}</span>
          <span>Y: {blochCoords.y.toFixed(2)}</span>
          <span>Z: {blochCoords.z.toFixed(2)}</span>
          <span>θ: {(theta * (180 / Math.PI)).toFixed(0)}°</span>
          <span>φ: {(phi * (180 / Math.PI)).toFixed(0)}°</span>
        </div>

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
                padding: '4px 12px',
                minHeight: 44,
                fontSize: '0.72rem',
                fontWeight: 700
              }}
            >
              Next Target
            </button>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 3. REAL-TIME PHYSICAL MEANING CARD (Dynamic Explainer)         */}
      {/* ============================================================== */}
      <div style={{
        background: 'var(--bg-surface)',
        borderRadius: 14,
        padding: '12px 14px',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Lightbulb size={15} color="#fbbf24" />
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase' }}>
            What This State Means in Real Life
          </span>
        </div>

        <div style={{ fontSize: '0.76rem', color: '#f6f1ff', lineHeight: 1.45 }}>
          {blochCoords.z > 0.9 ? (
            <span>
              The state is at the <b>North Pole</b>. The qubit behaves like a classical bit locked on <b>0</b>. If measured, it will yield <b>0 with 100% certainty</b>.
            </span>
          ) : blochCoords.z < -0.9 ? (
            <span>
              The state is at the <b>South Pole</b>. The qubit behaves like a classical bit locked on <b>1</b>. If measured, it will yield <b>1 with 100% certainty</b>.
            </span>
          ) : Math.abs(blochCoords.z) < 0.15 ? (
            <span>
              The state is on the <b>Equator (Z ≈ 0)</b>. This is an <b>equal superposition</b>. The qubit has no preference for 0 or 1—a measurement has an exact <b>50/50 chance</b> of collapsing to either outcome! The phase angle φ = {(phi * (180 / Math.PI)).toFixed(0)}° controls how it interferes with other qubits.
            </span>
          ) : blochCoords.z > 0 ? (
            <span>
              The state is in the <b>Northern Hemisphere</b>. It is in a weighted superposition that is <b>biased toward |0⟩ ({(prob0 * 100).toFixed(0)}%)</b> over |1⟩ ({(prob1 * 100).toFixed(0)}%).
            </span>
          ) : (
            <span>
              The state is in the <b>Southern Hemisphere</b>. It is in a weighted superposition that is <b>biased toward |1⟩ ({(prob1 * 100).toFixed(0)}%)</b> over |0⟩ ({(prob0 * 100).toFixed(0)}%).
            </span>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. MEASUREMENT PROBABILITY BAR & 100-SHOT SAMPLER             */}
      {/* ============================================================== */}
      <div style={{
        background: 'var(--bg-surface)',
        borderRadius: 16,
        padding: '14px',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>
            Theoretical Measurement Odds (Born Rule)
          </span>
          <div style={{ display: 'flex', gap: 10, fontSize: '0.74rem', fontWeight: 700 }}>
            <span style={{ color: 'var(--accent-cyan)' }}>P(|0⟩): {(prob0 * 100).toFixed(1)}%</span>
            <span style={{ color: 'var(--accent-pink)' }}>P(|1⟩): {(prob1 * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* Split Probability Bar */}
        <div style={{
          height: 12,
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

        {/* Live 100-Shot Quantum Measurement Simulator */}
        <div style={{
          marginTop: 4,
          paddingTop: 10,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#ddd0fa' }}>
              Want to see real quantum collapse in action?
            </span>
            <button
              onClick={run100Measurements}
              disabled={isSampling}
              style={{
                background: 'linear-gradient(135deg, #00d2ff 0%, #8a3ffc 100%)',
                color: '#2a0f5c',
                padding: '6px 12px',
                minHeight: 44,
                borderRadius: 8,
                fontSize: '0.72rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                boxShadow: '0 2px 10px rgba(0, 210, 255, 0.3)'
              }}
            >
              <Dices size={14} />
              <span>{isSampling ? 'Sampling...' : 'Sample 100 Shots'}</span>
            </button>
          </div>

          {/* Shot Results Histogram */}
          {shotsResult && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: 10,
              padding: '8px 12px',
              fontSize: '0.72rem',
              color: '#f1eaff',
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span style={{ color: 'var(--accent-cyan)' }}>Measured |0⟩: {shotsResult.count0} times</span>
                <span style={{ color: 'var(--accent-pink)' }}>Measured |1⟩: {shotsResult.count1} times</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#ddd0fa' }}>
                💡 <i>Notice: A quantum measurement NEVER yields 'half a bit'—the superposition collapses probabilistically to either 0 or 1!</i>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. GUIDED INTERACTIVE EXPERIMENTS (Walkthrough Tours)          */}
      {/* ============================================================== */}
      <div style={{
        background: 'var(--bg-surface)',
        borderRadius: 16,
        padding: '14px',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FlaskConical size={16} color="var(--accent-cyan)" />
          <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>
            Try Guided Experiments
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          <button
            onClick={() => {
              setActiveExperiment('superposition');
              setNamedState('0');
            }}
            style={{
              padding: '8px 6px',
              minHeight: 44,
              borderRadius: 10,
              background: activeExperiment === 'superposition' ? 'rgba(0, 210, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${activeExperiment === 'superposition' ? 'var(--accent-cyan)' : 'transparent'}`,
              color: activeExperiment === 'superposition' ? 'var(--accent-cyan)' : '#f1eaff',
              fontSize: '0.7rem',
              fontWeight: 700
            }}
          >
            1. Superposition
          </button>

          <button
            onClick={() => {
              setActiveExperiment('phase');
              setNamedState('+');
            }}
            style={{
              padding: '8px 6px',
              minHeight: 44,
              borderRadius: 10,
              background: activeExperiment === 'phase' ? 'rgba(138, 63, 252, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${activeExperiment === 'phase' ? '#c084fc' : 'transparent'}`,
              color: activeExperiment === 'phase' ? '#c084fc' : '#f1eaff',
              fontSize: '0.7rem',
              fontWeight: 700
            }}
          >
            2. Quantum Phase
          </button>

          <button
            onClick={() => {
              setActiveExperiment('bitflip');
              setNamedState('0');
            }}
            style={{
              padding: '8px 6px',
              minHeight: 44,
              borderRadius: 10,
              background: activeExperiment === 'bitflip' ? 'rgba(255, 64, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${activeExperiment === 'bitflip' ? 'var(--accent-pink)' : 'transparent'}`,
              color: activeExperiment === 'bitflip' ? 'var(--accent-pink)' : '#f1eaff',
              fontSize: '0.7rem',
              fontWeight: 700
            }}
          >
            3. Bit Flip (NOT)
          </button>
        </div>

        {/* Experiment Instruction Box */}
        {activeExperiment === 'superposition' && (
          <div style={{
            background: 'rgba(0, 210, 255, 0.08)',
            border: '1px solid rgba(0, 210, 255, 0.25)',
            borderRadius: 10,
            padding: '10px 12px',
            fontSize: '0.74rem',
            lineHeight: 1.45,
            color: '#f6f1ff'
          }}>
            <b>🧪 Experiment 1: How Hadamard creates Superposition</b>
            <p style={{ marginTop: 4 }}>
              The qubit starts at <b>|0⟩</b> (North Pole, 100% chance of 0).
              Now, tap the <b>[H]</b> gate below!
            </p>
            <p style={{ marginTop: 4, color: 'var(--accent-cyan)' }}>
              👉 <b>Observe:</b> The arrow swings down to the Equator (|+⟩), and the probability bar splits exactly <b>50% / 50%</b>!
            </p>
          </div>
        )}

        {activeExperiment === 'phase' && (
          <div style={{
            background: 'rgba(138, 63, 252, 0.08)',
            border: '1px solid rgba(138, 63, 252, 0.25)',
            borderRadius: 10,
            padding: '10px 12px',
            fontSize: '0.74rem',
            lineHeight: 1.45,
            color: '#f6f1ff'
          }}>
            <b>🧪 Experiment 2: The Mystery of Quantum Phase</b>
            <p style={{ marginTop: 4 }}>
              The qubit starts at <b>|+⟩</b> (on the equator, 50% / 50%).
              Now, tap the <b>[Z]</b> gate or drag the <b>Phase Angle (φ) slider</b>!
            </p>
            <p style={{ marginTop: 4, color: '#c084fc' }}>
              👉 <b>Observe:</b> The arrow rotates around the equator to <b>|−⟩</b>. Notice that probabilities remain <b>50% / 50%</b>! Phase doesn't change measurement odds directly—it controls wave interference!
            </p>
          </div>
        )}

        {activeExperiment === 'bitflip' && (
          <div style={{
            background: 'rgba(255, 64, 129, 0.08)',
            border: '1px solid rgba(255, 64, 129, 0.25)',
            borderRadius: 10,
            padding: '10px 12px',
            fontSize: '0.74rem',
            lineHeight: 1.45,
            color: '#f6f1ff'
          }}>
            <b>🧪 Experiment 3: Quantum NOT (Pauli-X)</b>
            <p style={{ marginTop: 4 }}>
              The qubit starts at <b>|0⟩</b> (North Pole). Now tap the <b>[X]</b> gate!
            </p>
            <p style={{ marginTop: 4, color: 'var(--accent-pink)' }}>
              👉 <b>Observe:</b> The arrow flips 180° upside down to the South Pole <b>|1⟩</b> (100% chance of 1). This is the quantum equivalent of a classical bit inverter!
            </p>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 6. NAMED PRESET STATES                                         */}
      {/* ============================================================== */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Preset Quantum States
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)' }}>Tap to snap to coordinate</span>
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
                minHeight: 44,
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

      {/* ============================================================== */}
      {/* 7. UNITARY GATES (With Clear Physical Rotation Explanations)  */}
      {/* ============================================================== */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Apply Unitary Gates (3D Rotations)
          </span>
          <span style={{ fontSize: '0.68rem', color: '#ddd0fa' }}>Tap to rotate sphere</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[
            { name: 'H', label: 'Hadamard', desc: 'Poles ↔ Equator' },
            { name: 'X', label: 'Pauli-X', desc: 'North ↔ South (NOT)' },
            { name: 'Z', label: 'Pauli-Z', desc: '180° Phase Flip' },
            { name: 'S', label: 'S-Gate', desc: '90° Phase Turn' },
          ].map((g) => (
            <button
              key={g.name}
              onClick={() => applyGate(g.name as any)}
              style={{
                background: 'linear-gradient(135deg, rgba(0, 210, 255, 0.12), rgba(138, 63, 252, 0.12))',
                border: '1px solid var(--border-subtle)',
                padding: '8px 4px',
                minHeight: 44,
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
              <span style={{ fontSize: '0.58rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.15 }}>
                {g.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 8. AMPLITUDE & PHASE SLIDERS                                   */}
      {/* ============================================================== */}
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
            <span><b>Latitude (θ)</b> — Controls 0 vs 1 Probability</span>
            <span style={{ fontWeight: 700, color: '#fff' }}>{(theta * (180 / Math.PI)).toFixed(0)}°</span>
          </div>
          <input
            type="range"
            min="0"
            max={Math.PI}
            step="0.02"
            value={theta}
            onChange={(e) => {
              setShotsResult(null);
              setTheta(parseFloat(e.target.value));
            }}
            aria-label="Latitude, theta, in radians"
            style={{ width: '100%', height: 44, accentColor: 'var(--accent-cyan)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#b9a6e8', marginTop: 2 }}>
            <span>0° = North |0⟩</span>
            <span>90° = Equator (50/50)</span>
            <span>180° = South |1⟩</span>
          </div>
        </div>

        {/* Phi Azimuthal Angle Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
            <span><b>Longitude (φ)</b> — Controls Relative Phase</span>
            <span style={{ fontWeight: 700, color: '#fff' }}>{(phi * (180 / Math.PI)).toFixed(0)}°</span>
          </div>
          <input
            type="range"
            min={-Math.PI}
            max={Math.PI}
            step="0.02"
            value={phi}
            onChange={(e) => {
              setShotsResult(null);
              setPhi(parseFloat(e.target.value));
            }}
            aria-label="Longitude, phi, in radians"
            style={{ width: '100%', height: 44, accentColor: 'var(--accent-pink)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#b9a6e8', marginTop: 2 }}>
            <span>-180° = |−⟩</span>
            <span>0° = |+⟩</span>
            <span>+90° = |+i⟩</span>
            <span>+180° = |−⟩</span>
          </div>
        </div>
      </div>

      {/* Target State Challenge Mode Trigger */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={challengeMode ? () => setChallengeMode(false) : startChallenge}
          style={{
            flex: 1,
            padding: '12px',
            minHeight: 44,
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
          onClick={() => { setTheta(0); setPhi(0); setShotsResult(null); }}
          style={{
            padding: '12px',
            minWidth: 48,
            minHeight: 44,
            borderRadius: 12,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Reset to |0>"
          aria-label="Reset to |0>"
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
            <span>Show the Math (Dirac & Matrix State Vector)</span>
          </div>
          {showMath ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showMath && (
          <div style={{
            padding: '14px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(42, 15, 92, 0.6)',
            fontSize: '0.78rem',
            lineHeight: 1.6,
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}>
            <div>
              <div style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>Dirac State Vector:</div>
              <div style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                |ψ⟩ = ({stateVector.amplitudes[0].re.toFixed(3)})|0⟩ + ({stateVector.amplitudes[1].re.toFixed(3)} + {stateVector.amplitudes[1].im.toFixed(3)}i)|1⟩
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>Matrix Column Vector:</div>
              <div style={{
                fontFamily: 'monospace',
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

            <div>
              <div style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>Born Rule Probabilities:</div>
              <div style={{ color: '#f1eaff' }}>
                P(0) = |α|² = {(prob0).toFixed(4)} ({(prob0 * 100).toFixed(1)}%)<br />
                P(1) = |β|² = {(prob1).toFixed(4)} ({(prob1 * 100).toFixed(1)}%)
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
