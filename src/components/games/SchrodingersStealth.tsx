import React, { useState } from 'react';
import { useProgress } from '../../hooks/useProgress';
import { HonestyTagBadge } from '../shared/HonestyTag';
import { sound } from '../../utils/audio';
import { Complex } from '../../core/circuit';
import { 
  Sparkles, 
  ShieldAlert, 
  Zap, 
  ChevronRight, 
  Lightbulb,
  Radio,
  ChevronUp,
  ChevronDown,
  Volume2,
  VolumeX
} from 'lucide-react';

interface Checkpoint {
  id: number;
  name: string;
  basis: 'Z' | 'X';
  requiredState: '0' | '1' | '+' | '-';
  beamColor: string;
  basisLabel: string;
  description: string;
}

export const SchrodingersStealth: React.FC = () => {
  const { completeGame } = useProgress();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sector, setSector] = useState<1 | 2 | 3>(1);
  const [currentStep, setCurrentStep] = useState<number>(0); // 0 = start of corridor, 1 = checkpoint 1 passed, 2 = checkpoint 2 passed
  const [alarmLevel, setAlarmLevel] = useState<number>(0); // 0% to 100%
  const [score, setScore] = useState<number>(600);
  const [gameState, setGameState] = useState<'playing' | 'checkpoint_passed' | 'alarm_alert' | 'sector_cleared' | 'game_over' | 'victory'>('playing');
  const [feedback, setFeedback] = useState<string>('Welcome, Agent Schrödinger! Security lasers ahead measure quantum states. Match your state to the scanner basis before advancing!');
  const [showHandbook, setShowHandbook] = useState<boolean>(false);
  const [showPhysics, setShowPhysics] = useState<boolean>(false);

  // Quantum State of Agent Schrödinger (Single Qubit)
  // Initialized to |0>
  const [alpha, setAlpha] = useState<Complex>(Complex.one());
  const [beta, setBeta] = useState<Complex>(Complex.zero());

  // Sector Checkpoints definition
  const sectorCheckpoints: Record<1 | 2 | 3, Checkpoint[]> = {
    1: [
      {
        id: 1,
        name: 'Checkpoint Alpha',
        basis: 'Z',
        requiredState: '0',
        beamColor: '#00d2ff',
        basisLabel: 'Z-BASIS (Computational)',
        description: 'Detects along {|0⟩, |1⟩}. Pass condition: State |0⟩'
      },
      {
        id: 2,
        name: 'Checkpoint Beta',
        basis: 'Z',
        requiredState: '1',
        beamColor: '#00d2ff',
        basisLabel: 'Z-BASIS (Computational)',
        description: 'Detects along {|0⟩, |1⟩}. Inverted sensor: Pass condition: State |1⟩'
      }
    ],
    2: [
      {
        id: 1,
        name: 'Checkpoint Gamma',
        basis: 'Z',
        requiredState: '0',
        beamColor: '#00d2ff',
        basisLabel: 'Z-BASIS (Computational)',
        description: 'Measures {|0⟩, |1⟩}. Pass condition: State |0⟩'
      },
      {
        id: 2,
        name: 'Checkpoint Delta',
        basis: 'X',
        requiredState: '+',
        beamColor: '#ff4081',
        basisLabel: 'X-BASIS (Hadamard / Diagonal)',
        description: 'Measures {|+⟩, |−⟩}. Pass condition: State |+⟩ (Use [H] Lens!)'
      }
    ],
    3: [
      {
        id: 1,
        name: 'Vault Gate 1',
        basis: 'X',
        requiredState: '+',
        beamColor: '#ff4081',
        basisLabel: 'X-BASIS (Diagonal)',
        description: 'Pass condition: State |+⟩'
      },
      {
        id: 2,
        name: 'Vault Gate 2',
        basis: 'Z',
        requiredState: '0',
        beamColor: '#00d2ff',
        basisLabel: 'Z-BASIS (Computational)',
        description: 'Pass condition: State |0⟩ (Use [H] to return to Z-basis!)'
      },
      {
        id: 3,
        name: 'Master Vault Core',
        basis: 'X',
        requiredState: '-',
        beamColor: '#c084fc',
        basisLabel: 'X-BASIS (Anti-Phase)',
        description: 'Pass condition: State |−⟩ (Superposition + Negative Phase)'
      }
    ]
  };

  const currentSectorCheckpoints = sectorCheckpoints[sector];
  const activeCheckpoint = currentSectorCheckpoints[currentStep] || currentSectorCheckpoints[currentSectorCheckpoints.length - 1];

  // Helper to compute overlap / probability of passing the current active checkpoint
  const getStealthProbability = (): number => {
    if (!activeCheckpoint) return 1.0;
    const { requiredState } = activeCheckpoint;

    // Target state amplitude definition
    let targetAlpha = Complex.zero();
    let targetBeta = Complex.zero();

    const inv = 1 / Math.SQRT2;
    if (requiredState === '0') {
      targetAlpha = Complex.one();
      targetBeta = Complex.zero();
    } else if (requiredState === '1') {
      targetAlpha = Complex.zero();
      targetBeta = Complex.one();
    } else if (requiredState === '+') {
      targetAlpha = Complex.create(inv, 0);
      targetBeta = Complex.create(inv, 0);
    } else if (requiredState === '-') {
      targetAlpha = Complex.create(inv, 0);
      targetBeta = Complex.create(-inv, 0);
    }

    // Inner product: <target | psi> = targetAlpha* . alpha + targetBeta* . beta
    const innerRe = targetAlpha.re * alpha.re + targetAlpha.im * alpha.im + targetBeta.re * beta.re + targetBeta.im * beta.im;
    const innerIm = targetAlpha.re * alpha.im - targetAlpha.im * alpha.re + targetBeta.re * beta.im - targetBeta.im * beta.re;
    const prob = innerRe * innerRe + innerIm * innerIm;
    return Math.max(0, Math.min(1, prob));
  };

  const stealthProb = getStealthProbability();

  // Quantum Gadgets
  const applyHadamard = () => {
    if (soundEnabled) sound.playGate();
    const inv = 1 / Math.SQRT2;
    const newA = Complex.create(inv * (alpha.re + beta.re), inv * (alpha.im + beta.im));
    const newB = Complex.create(inv * (alpha.re - beta.re), inv * (alpha.im - beta.im));
    setAlpha(newA);
    setBeta(newB);
  };

  const applyPauliX = () => {
    if (soundEnabled) sound.playGate();
    const temp = alpha;
    setAlpha(beta);
    setBeta(temp);
  };

  const applyPauliZ = () => {
    if (soundEnabled) sound.playGate();
    setBeta(Complex.scale(beta, -1));
  };

  // Advance Agent Schrödinger through current checkpoint
  const advanceThroughCheckpoint = () => {
    if (soundEnabled) sound.playFootstep();

    // Measurement simulation according to the Born rule
    const isSuccess = Math.random() < stealthProb;

    if (isSuccess && stealthProb > 0.95) {
      // 100% Deterministic Eigenstate Match!
      if (soundEnabled) sound.playSuccess();
      setScore((s) => s + 350);

      const nextStep = currentStep + 1;
      if (nextStep >= currentSectorCheckpoints.length) {
        // Sector completed!
        if (sector === 3) {
          setGameState('victory');
          setFeedback('MISSION ACCOMPLISHED! Agent Schrödinger infiltrated the core quantum vault undetected!');
          completeGame('schrodinger_stealth', 'concept_qubits');
        } else {
          setGameState('sector_cleared');
          setFeedback(`SECTOR ${sector} CLEARED! Perfect basis match—zero wave collapse detected!`);
        }
      } else {
        setCurrentStep(nextStep);
        setGameState('checkpoint_passed');
        setFeedback(`CLEARED CHECKPOINT ${currentStep + 1}! State matched detector basis perfectly. Advance to next checkpoint!`);
      }
    } else {
      // Stochastic Wave Collapse or Direct Mismatch!
      if (soundEnabled) sound.playAlert();
      const penalty = stealthProb === 0 ? 40 : 25;
      const nextAlarm = alarmLevel + penalty;

      if (nextAlarm >= 100) {
        setAlarmLevel(100);
        setGameState('game_over');
        setFeedback('ALARM 100%! Security guards converged on Agent Schrödinger! Wave function collapse triggered maximum alert!');
      } else {
        setAlarmLevel(nextAlarm);
        setGameState('alarm_alert');
        setFeedback(`WAVE COLLAPSE DETECTED! Scanner basis was mismatched. State collapsed randomly and tripped the alarm (+${penalty}%)!`);
      }
    }
  };

  const nextSector = () => {
    setSector((s) => (s + 1) as any);
    setCurrentStep(0);
    setAlpha(Complex.one());
    setBeta(Complex.zero());
    setGameState('playing');
    setFeedback(`Entered Sector ${sector + 1}. Check the scanner basis before each move!`);
  };

  const restartSector = () => {
    sound.playClick();
    setCurrentStep(0);
    setAlarmLevel(0);
    setAlpha(Complex.one());
    setBeta(Complex.zero());
    setGameState('playing');
    setFeedback('Corridor reset! Prepare the correct eigenstate before stepping through!');
  };

  const fullRestart = () => {
    setSector(1);
    setScore(600);
    restartSector();
  };

  // State Name Helper
  const getStateName = (): string => {
    if (Complex.absSq(alpha) > 0.98) return '|0⟩ (Ground)';
    if (Complex.absSq(beta) > 0.98) return '|1⟩ (Excited)';
    if (Math.abs(alpha.re - beta.re) < 0.05 && alpha.re > 0.6) return '|+⟩ (Diagonal)';
    if (Math.abs(alpha.re + beta.re) < 0.05 && alpha.re > 0.6) return '|−⟩ (Anti-Phase)';
    return 'Custom |ψ⟩';
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      fontFamily: "'Space Grotesk', -apple-system, sans-serif"
    }}>
      {/* Tactical Espionage HUD Cabinet */}
      <div style={{
        background: 'linear-gradient(165deg, #070d1e 0%, #030611 100%)',
        border: '3px solid #00d2ff',
        borderRadius: 20,
        padding: '16px',
        boxShadow: '0 0 35px rgba(0, 210, 255, 0.3), inset 0 0 45px rgba(0, 0, 0, 0.95)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Tactical Scanline & Cyber Grid */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(0, 210, 255, 0.04) 0%, transparent 80%)',
          pointerEvents: 'none',
          zIndex: 4
        }} />

        {/* Top Espionage Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid rgba(0, 210, 255, 0.25)',
          paddingBottom: 10,
          marginBottom: 12,
          position: 'relative',
          zIndex: 6
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Radio size={16} color="#00d2ff" />
            <span style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '0.58rem',
              color: '#00d2ff'
            }}>
              SECTOR {sector}/3
            </span>
            <span style={{ color: '#64748b' }}>•</span>
            <span style={{ color: '#fbbf24', fontSize: '0.62rem', fontWeight: 800 }}>
              {score} PTS
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              style={{
                background: 'transparent',
                color: soundEnabled ? '#00d2ff' : '#64748b',
                padding: 2,
                display: 'flex'
              }}
              title="Toggle sound"
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              onClick={() => setShowHandbook(!showHandbook)}
              style={{
                background: 'rgba(0, 210, 255, 0.15)',
                border: '1px solid #00d2ff',
                color: '#00d2ff',
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: '0.52rem',
                fontFamily: "'Press Start 2P', monospace"
              }}
            >
              BRIEFING
            </button>
            <HonestyTagBadge tag="Accurate" />
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 12, position: 'relative', zIndex: 6 }}>
          <h2 style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.01em',
            marginBottom: 2
          }}>
            🐾 Schrödinger's Stealth
          </h2>
          <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Quantum Measurement & Basis Infiltration • Observe without Collapsing
          </p>
        </div>

        {/* Alert Level Progress Bar */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 12,
          padding: '10px 14px',
          marginBottom: 12,
          position: 'relative',
          zIndex: 6
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldAlert size={14} color={alarmLevel > 60 ? '#f43f5e' : alarmLevel > 30 ? '#fbbf24' : '#22c55e'} />
              <span style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '0.52rem',
                color: alarmLevel > 60 ? '#f43f5e' : alarmLevel > 30 ? '#fbbf24' : '#22c55e'
              }}>
                ALARM DETECTION METER:
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: alarmLevel > 60 ? '#f43f5e' : '#fff' }}>
              {alarmLevel}%
            </span>
          </div>

          <div style={{
            height: 8,
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 4,
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${alarmLevel}%`,
              height: '100%',
              background: alarmLevel > 60 ? '#f43f5e' : alarmLevel > 30 ? '#fbbf24' : '#22c55e',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* ============================================================== */}
        {/* 1. TACTICAL TOP-DOWN SECURITY CORRIDOR ARENA                   */}
        {/* ============================================================== */}
        <div style={{
          background: 'radial-gradient(circle at 50% 30%, #0d163d 0%, #050818 85%)',
          border: '2px solid rgba(0, 210, 255, 0.4)',
          borderRadius: 16,
          padding: '16px 12px',
          marginBottom: 12,
          position: 'relative',
          overflow: 'hidden',
          zIndex: 6
        }}>
          {/* Corridor Track Progress */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
            position: 'relative'
          }}>
            {/* Start Pod */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 5
            }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: currentStep === 0 ? 'var(--accent-cyan)' : '#1e293b',
                color: currentStep === 0 ? '#050714' : '#94a3b8',
                border: '2px solid #fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                boxShadow: currentStep === 0 ? '0 0 16px var(--accent-cyan)' : 'none'
              }}>
                🐱
              </div>
              <span style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: 4, fontWeight: 700 }}>
                AGENT
              </span>
            </div>

            {/* Laser Checkpoint 1 */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 5
            }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: currentStep > 0
                  ? 'rgba(34, 197, 94, 0.2)'
                  : currentStep === 0
                  ? 'rgba(0, 210, 255, 0.2)'
                  : 'rgba(15, 23, 42, 0.9)',
                border: `2px solid ${currentSectorCheckpoints[0]?.beamColor || '#00d2ff'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: 900,
                boxShadow: currentStep === 0 ? `0 0 16px ${currentSectorCheckpoints[0]?.beamColor}` : 'none'
              }}>
                {currentStep > 0 ? '✅' : '⚡ 1'}
              </div>
              <span style={{ fontSize: '0.58rem', color: currentSectorCheckpoints[0]?.beamColor, marginTop: 4, fontWeight: 700 }}>
                {currentSectorCheckpoints[0]?.basis} BASIS
              </span>
            </div>

            {/* Laser Checkpoint 2 */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 5
            }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: currentStep > 1
                  ? 'rgba(34, 197, 94, 0.2)'
                  : currentStep === 1
                  ? 'rgba(255, 64, 129, 0.2)'
                  : 'rgba(15, 23, 42, 0.9)',
                border: `2px solid ${currentSectorCheckpoints[1]?.beamColor || '#ff4081'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: 900,
                boxShadow: currentStep === 1 ? `0 0 16px ${currentSectorCheckpoints[1]?.beamColor}` : 'none'
              }}>
                {currentStep > 1 ? '✅' : '⚡ 2'}
              </div>
              <span style={{ fontSize: '0.58rem', color: currentSectorCheckpoints[1]?.beamColor, marginTop: 4, fontWeight: 700 }}>
                {currentSectorCheckpoints[1]?.basis} BASIS
              </span>
            </div>

            {/* Core Terminal Goal */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 5
            }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: currentStep >= currentSectorCheckpoints.length ? '#22c55e' : '#1e293b',
                color: '#fff',
                border: '2px solid #fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem'
              }}>
                💾
              </div>
              <span style={{ fontSize: '0.6rem', color: '#fbbf24', marginTop: 4, fontWeight: 700 }}>
                CORE
              </span>
            </div>
          </div>

          {/* Current Laser Scanner Readout */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.55)',
            border: `1.5px solid ${activeCheckpoint.beamColor}`,
            borderRadius: 10,
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '0.55rem',
                color: activeCheckpoint.beamColor
              }}>
                SCANNER: {activeCheckpoint.basisLabel}
              </span>
              <span style={{
                fontSize: '0.62rem',
                fontWeight: 800,
                color: '#fff',
                background: 'rgba(255,255,255,0.1)',
                padding: '2px 6px',
                borderRadius: 4
              }}>
                TARGET: |{activeCheckpoint.requiredState}⟩
              </span>
            </div>

            <div style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>
              {activeCheckpoint.description}
            </div>

            {/* Stealth Odds Meter */}
            <div style={{
              marginTop: 4,
              paddingTop: 6,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                Your Stealth Rating:
              </span>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 900,
                color: stealthProb > 0.95 ? '#86efac' : stealthProb > 0.4 ? '#fde047' : '#fca5a5'
              }}>
                {(stealthProb * 100).toFixed(0)}% {stealthProb > 0.95 ? '🛡️ (ZERO COLLAPSE RISK)' : '⚠️ (COLLAPSE RISK!)'}
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. AGENT QUANTUM STATUS CARD                                   */}
        {/* ============================================================== */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(0, 210, 255, 0.25)',
          borderRadius: 12,
          padding: '10px 14px',
          marginBottom: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 6
        }}>
          <div>
            <div style={{ fontSize: '0.62rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Agent Schrödinger's State:
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>
              {getStateName()}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.62rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Amplitudes (α, β):
            </div>
            <div style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace' }}>
              [{alpha.re.toFixed(2)}, {beta.re.toFixed(2)}]
            </div>
          </div>
        </div>

        {/* Feedback Alert Bar */}
        {feedback && (
          <div style={{
            background: gameState === 'game_over' || gameState === 'alarm_alert' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(0, 210, 255, 0.15)',
            border: `1.5px solid ${gameState === 'game_over' || gameState === 'alarm_alert' ? '#f43f5e' : '#00d2ff'}`,
            borderRadius: 10,
            padding: '10px 12px',
            fontSize: '0.74rem',
            color: gameState === 'game_over' || gameState === 'alarm_alert' ? '#fca5a5' : '#e2e8f0',
            lineHeight: 1.45,
            marginBottom: 12,
            position: 'relative',
            zIndex: 6
          }}>
            {feedback}
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. QUANTUM UTILITY BELT (GATES / LENSES)                       */}
        {/* ============================================================== */}
        {gameState !== 'game_over' && gameState !== 'victory' && (
          <div style={{ marginBottom: 12, position: 'relative', zIndex: 6 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8
            }}>
              <span style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '0.52rem',
                color: '#94a3b8'
              }}>
                UTILITY GADGETS:
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)' }}>
                Tap to rotate quantum state
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {/* Hadamard Basis Lens */}
              <button
                onClick={applyHadamard}
                style={{
                  background: 'linear-gradient(180deg, #00d2ff 0%, #0284c7 100%)',
                  color: '#050714',
                  padding: '10px 6px',
                  borderRadius: 10,
                  border: '2px solid #fff',
                  boxShadow: (activeCheckpoint.basis === 'X' && Complex.absSq(alpha) > 0.8) ? '0 0 16px #00d2ff' : '0 4px 12px rgba(0, 210, 255, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3
                }}
              >
                <Zap size={16} fill="#050714" />
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.6rem', fontWeight: 900 }}>
                  [H] LENS
                </span>
                <span style={{ fontSize: '0.6rem', fontWeight: 800 }}>
                  Z ↔ X Basis
                </span>
              </button>

              {/* Bit Inverter (Pauli-X) */}
              <button
                onClick={applyPauliX}
                style={{
                  background: 'linear-gradient(180deg, #ec4899 0%, #be185d 100%)',
                  color: '#fff',
                  padding: '10px 6px',
                  borderRadius: 10,
                  border: '2px solid #fff',
                  boxShadow: (activeCheckpoint.requiredState === '1' && Complex.absSq(alpha) > 0.8) ? '0 0 16px #ec4899' : '0 4px 12px rgba(236, 72, 153, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3
                }}
              >
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.6rem', fontWeight: 900 }}>
                  [X] INVERT
                </span>
                <span style={{ fontSize: '0.6rem', fontWeight: 800 }}>
                  Swap 0 ↔ 1
                </span>
              </button>

              {/* Phase Inverter (Pauli-Z) */}
              <button
                onClick={applyPauliZ}
                style={{
                  background: 'linear-gradient(180deg, #8a3ffc 0%, #6929c4 100%)',
                  color: '#fff',
                  padding: '10px 6px',
                  borderRadius: 10,
                  border: '2px solid #fff',
                  boxShadow: '0 4px 12px rgba(138, 63, 252, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3
                }}
              >
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.6rem', fontWeight: 900 }}>
                  [Z] PHASE
                </span>
                <span style={{ fontSize: '0.6rem', fontWeight: 800 }}>
                  Flip (+ / -)
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Primary Action Button */}
        <div style={{ position: 'relative', zIndex: 6 }}>
          {(gameState === 'playing' || gameState === 'checkpoint_passed' || gameState === 'alarm_alert') && (
            <button
              onClick={advanceThroughCheckpoint}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 12,
                background: stealthProb > 0.95
                  ? 'linear-gradient(180deg, #22c55e 0%, #15803d 100%)'
                  : 'linear-gradient(180deg, #eab308 0%, #a16207 100%)',
                color: '#fff',
                border: '2px solid #fff',
                boxShadow: stealthProb > 0.95 ? '0 0 20px rgba(34, 197, 94, 0.6)' : '0 0 15px rgba(234, 179, 8, 0.4)',
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '0.72rem',
                letterSpacing: '0.04em'
              }}
            >
              🐾 ADVANCE THROUGH SCANNER
            </button>
          )}

          {gameState === 'sector_cleared' && (
            <button
              onClick={nextSector}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 12,
                background: 'linear-gradient(180deg, #00d2ff 0%, #0284c7 100%)',
                color: '#050714',
                border: '2px solid #fff',
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '0.7rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <span>INFILTRATE SECTOR {sector + 1}</span>
              <ChevronRight size={16} />
            </button>
          )}

          {gameState === 'game_over' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={restartSector}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 10,
                  background: '#f43f5e',
                  color: '#fff',
                  border: '2px solid #fff',
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '0.68rem'
                }}
              >
                RETRY CURRENT SECTOR
              </button>
              <button
                onClick={fullRestart}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 10,
                  background: '#1e293b',
                  color: '#94a3b8',
                  border: '1px solid #475569',
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '0.6rem'
                }}
              >
                RESTART FROM SECTOR 1
              </button>
            </div>
          )}

          {gameState === 'victory' && (
            <div style={{
              background: 'rgba(34, 197, 94, 0.15)',
              border: '2px solid #22c55e',
              borderRadius: 12,
              padding: '16px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8
            }}>
              <div style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '0.85rem',
                color: '#fbbf24'
              }}>
                🏆 VAULT CONQUERED!
              </div>
              <div style={{ fontSize: '0.78rem', color: '#e2e8f0' }}>
                TOTAL SCORE: <b>{score} PTS</b>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8' }}>
                BADGE UNLOCKED: <b>Master of Measurement & Bases</b>
              </div>
              <button
                onClick={fullRestart}
                style={{
                  background: '#1e293b',
                  color: '#fff',
                  border: '1px solid #475569',
                  borderRadius: 6,
                  padding: '8px 14px',
                  fontSize: '0.68rem',
                  fontFamily: "'Press Start 2P', monospace",
                  marginTop: 6
                }}
              >
                PLAY AGAIN
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. "THE QUANTUM PHYSICS OF MEASUREMENT" ACCORDION              */}
      {/* ============================================================== */}
      <div style={{
        background: 'var(--bg-surface)',
        borderRadius: 14,
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden'
      }}>
        <button
          onClick={() => setShowPhysics(!showPhysics)}
          style={{
            width: '100%',
            padding: '12px 14px',
            background: 'transparent',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'var(--text-primary)',
            fontSize: '0.8rem',
            fontWeight: 700
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} color="var(--accent-cyan)" />
            <span>Why Does Measurement Basis Matter?</span>
          </div>
          {showPhysics ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showPhysics && (
          <div style={{
            padding: '0 14px 14px',
            fontSize: '0.76rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }}>
            <p>
              In classical physics, measuring a car's speed or location doesn't alter its speed.
              In quantum mechanics, <b>measurement fundamentally perturbs the system</b>:
            </p>
            <ul style={{ paddingLeft: 18 }}>
              <li>
                <b>Eigenstate Measurement (Zero Collapse):</b> If a detector measures along the <b>Z-basis</b> and the qubit is already in <b>|0⟩</b>, the measurement yields 0 with <b>100% certainty</b> and does NOT disturb the state!
              </li>
              <li>
                <b>Basis Mismatch (Stochastic Collapse):</b> If the same <b>Z-basis</b> detector observes a qubit in superposition <b>|+⟩ = (|0⟩ + |1⟩)/√2</b>, it forces the qubit to randomly collapse to either |0⟩ or |1⟩ with 50/50 odds!
              </li>
            </ul>
            <p>
              By equipping the <b>[H] Lens</b>, Agent Schrödinger rotates the measurement basis from Z to X, turning superposition into an eigenstate so lasers cannot detect any disturbance!
            </p>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 5. BRIEFING MODAL                                              */}
      {/* ============================================================== */}
      {showHandbook && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          zIndex: 100
        }}>
          <div style={{
            background: '#090d24',
            border: '2px solid #00d2ff',
            borderRadius: 18,
            padding: '20px',
            maxWidth: 380,
            width: '100%',
            boxShadow: '0 10px 40px rgba(0, 210, 255, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            maxHeight: '85vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lightbulb size={18} color="#00d2ff" />
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.72rem', color: '#00d2ff' }}>
                  HQ MISSION BRIEFING
                </span>
              </div>
              <button
                onClick={() => setShowHandbook(false)}
                style={{ background: 'transparent', color: '#94a3b8', padding: 4 }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              <div>
                <b style={{ color: '#00d2ff' }}>1. The Mission:</b>
                <p>
                  Infiltrate each sector by advancing through quantum laser checkpoints. If your state matches the scanner's required eigenstate, you pass with 100% stealth!
                </p>
              </div>

              <div>
                <b style={{ color: '#ff4081' }}>2. Z-Basis vs X-Basis:</b>
                <p>
                  <b>Z-Basis (Cyan beams):</b> Checks for |0⟩ or |1⟩.<br />
                  <b>X-Basis (Pink beams):</b> Checks for |+⟩ or |−⟩.<br />
                  Use the cyan <b>[H] LENS</b> to swap between Z and X basis!
                </p>
              </div>

              <div>
                <b style={{ color: '#fbbf24' }}>3. Avoid Stochastic Collapse:</b>
                <p>
                  If you step into a scanner with the wrong basis, your wave function collapses probabilistically and raises the Alarm Detection Meter!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowHandbook(false)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 10,
                background: 'var(--accent-btn)',
                color: '#050714',
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '0.65rem'
              }}
            >
              MISSION ACCEPTED
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
