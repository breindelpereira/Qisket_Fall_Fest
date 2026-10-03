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
  VolumeX,
  Footprints
} from 'lucide-react';

interface Checkpoint {
  id: number;
  name: string;
  basis: 'Z' | 'X';
  requiredState: '0' | '1' | '+' | '-';
  shape: '|' | '—' | '/' | '\\';
  beamColor: string;
  laserTitle: string;
  slotName: string;
  instruction: string;
}

export const SchrodingersStealth: React.FC = () => {
  const { completeGame } = useProgress();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sector, setSector] = useState<1 | 2 | 3>(1);
  const [currentStep, setCurrentStep] = useState<number>(0); // 0 = checkpoint 1, 1 = checkpoint 2, etc.
  const [alarmLevel, setAlarmLevel] = useState<number>(0); // 0% to 100%
  const [score, setScore] = useState<number>(600);
  const [gameState, setGameState] = useState<'playing' | 'checkpoint_passed' | 'alarm_alert' | 'sector_cleared' | 'game_over' | 'victory'>('playing');
  const [feedback, setFeedback] = useState<string>('Welcome, Agent Schrödinger! Laser scanners detect your quantum angle. Align your stance to match the slot before walking through!');
  const [showHandbook, setShowHandbook] = useState<boolean>(false);
  const [showAnalogy, setShowAnalogy] = useState<boolean>(true);
  const [showPhysics, setShowPhysics] = useState<boolean>(false);

  // Quantum State of Agent Schrödinger (Single Qubit)
  // Initialized to |0> (Vertical)
  const [alpha, setAlpha] = useState<Complex>(Complex.one());
  const [beta, setBeta] = useState<Complex>(Complex.zero());

  // 3 Infiltration Sectors with intuitive shape & basis models
  const sectorCheckpoints: Record<1 | 2 | 3, Checkpoint[]> = {
    1: [
      {
        id: 1,
        name: 'Checkpoint 1: Ground Floor',
        basis: 'Z',
        requiredState: '0',
        shape: '|',
        beamColor: '#00d2ff',
        laserTitle: 'BLUE SENSOR (Z-Basis)',
        slotName: 'Vertical Slot (|0⟩)',
        instruction: 'Stand Vertical (|0⟩). Slip straight through!'
      },
      {
        id: 2,
        name: 'Checkpoint 2: Inverted Gate',
        basis: 'Z',
        requiredState: '1',
        shape: '—',
        beamColor: '#00d2ff',
        laserTitle: 'BLUE SENSOR (Z-Basis)',
        slotName: 'Horizontal Slot (|1⟩)',
        instruction: 'Use [X] INVERT to switch to Horizontal (|1⟩)!'
      }
    ],
    2: [
      {
        id: 1,
        name: 'Checkpoint 1: High Security Corridor',
        basis: 'Z',
        requiredState: '0',
        shape: '|',
        beamColor: '#00d2ff',
        laserTitle: 'BLUE SENSOR (Z-Basis)',
        slotName: 'Vertical Slot (|0⟩)',
        instruction: 'Stand Vertical (|0⟩) to match the blue vertical beams.'
      },
      {
        id: 2,
        name: 'Checkpoint 2: The Diagonal Laser Grid',
        basis: 'X',
        requiredState: '+',
        shape: '/',
        beamColor: '#ff4081',
        laserTitle: 'PINK SENSOR (X-Basis)',
        slotName: '45° Diagonal Slot (|+⟩)',
        instruction: 'Use [H] LENS to tilt yourself 45° diagonal (|+⟩)!'
      }
    ],
    3: [
      {
        id: 1,
        name: 'Core Perimeter: Diagonal Barrier',
        basis: 'X',
        requiredState: '+',
        shape: '/',
        beamColor: '#ff4081',
        laserTitle: 'PINK SENSOR (X-Basis)',
        slotName: '45° Diagonal Slot (|+⟩)',
        instruction: 'Use [H] LENS to tilt diagonal (|+⟩)!'
      },
      {
        id: 2,
        name: 'Internal Air Lock: Vertical Barrier',
        basis: 'Z',
        requiredState: '0',
        shape: '|',
        beamColor: '#00d2ff',
        laserTitle: 'BLUE SENSOR (Z-Basis)',
        slotName: 'Vertical Slot (|0⟩)',
        instruction: 'Use [H] LENS again to return to Vertical (|0⟩)!'
      },
      {
        id: 3,
        name: 'Master Vault Core: Anti-Phase Terminal',
        basis: 'X',
        requiredState: '-',
        shape: '\\',
        beamColor: '#c084fc',
        laserTitle: 'PURPLE SENSOR (Anti-Phase X)',
        slotName: 'Negative Diagonal Slot (|−⟩)',
        instruction: 'Use [H] then [Z] to invert your quantum phase (|−⟩)!'
      }
    ]
  };

  const currentSectorCheckpoints = sectorCheckpoints[sector];
  const activeCheckpoint = currentSectorCheckpoints[currentStep] || currentSectorCheckpoints[currentSectorCheckpoints.length - 1];

  // Helper to compute stealth probability (quantum inner product overlap)
  const getStealthProbability = (): number => {
    if (!activeCheckpoint) return 1.0;
    const { requiredState } = activeCheckpoint;

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

    const innerRe = targetAlpha.re * alpha.re + targetAlpha.im * alpha.im + targetBeta.re * beta.re + targetBeta.im * beta.im;
    const innerIm = targetAlpha.re * alpha.im - targetAlpha.im * alpha.re + targetBeta.re * beta.im - targetBeta.im * beta.re;
    const prob = innerRe * innerRe + innerIm * innerIm;
    return Math.max(0, Math.min(1, prob));
  };

  const stealthProb = getStealthProbability();
  const isAligned = stealthProb > 0.95;

  // Quantum Gadget operations
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

  // Advance Agent through the laser scanner
  const advanceThroughCheckpoint = () => {
    if (soundEnabled) sound.playFootstep();

    // If aligned, 100% deterministic stealth pass
    if (isAligned) {
      if (soundEnabled) sound.playSuccess();
      setScore((s) => s + 350);

      const nextStep = currentStep + 1;
      if (nextStep >= currentSectorCheckpoints.length) {
        if (sector === 3) {
          setGameState('victory');
          setFeedback('MISSION ACCOMPLISHED! Agent Schrödinger slipped past all laser bases and secured the Quantum Drive!');
          completeGame('schrodinger_stealth', 'concept_measurement');
        } else {
          setGameState('sector_cleared');
          setFeedback(`SECTOR ${sector} CLEARED! Perfect alignment—zero wave function collapse!`);
        }
      } else {
        setCurrentStep(nextStep);
        setGameState('checkpoint_passed');
        setFeedback(`CLEARED CHECKPOINT ${currentStep + 1}! You slipped through the slot undetected. Next laser ahead!`);
      }
    } else {
      // Mismatch! Random Born-rule collapse
      if (soundEnabled) sound.playAlert();
      const penalty = stealthProb === 0 ? 40 : 25;
      const nextAlarm = alarmLevel + penalty;

      if (nextAlarm >= 100) {
        setAlarmLevel(100);
        setGameState('game_over');
        setFeedback('ALARM 100%! You hit the laser bars! The wave function collapsed with a loud alarm sound and guards caught you!');
      } else {
        setAlarmLevel(nextAlarm);
        setGameState('alarm_alert');
        setFeedback(`COLLAPSE ALARM! Your quantum stance did not match the slot. The laser forced your wave function to collapse (+${penalty}% Alarm)!`);
      }
    }
  };

  const nextSector = () => {
    setSector((s) => (s + 1) as any);
    setCurrentStep(0);
    setAlpha(Complex.one());
    setBeta(Complex.zero());
    setGameState('playing');
    setFeedback(`Entered Sector ${sector + 1}. Check the laser color and angle before advancing!`);
  };

  const restartSector = () => {
    if (soundEnabled) sound.playClick();
    setCurrentStep(0);
    setAlarmLevel(0);
    setAlpha(Complex.one());
    setBeta(Complex.zero());
    setGameState('playing');
    setFeedback('Corridor reset! Align your stance with the slot before stepping through.');
  };

  const fullRestart = () => {
    setSector(1);
    setScore(600);
    restartSector();
  };

  // Helper for agent stance name and visual shape
  const getAgentStance = (): { name: string; shape: string; badgeColor: string } => {
    if (Complex.absSq(alpha) > 0.98) return { name: 'Vertical |0⟩', shape: '|', badgeColor: '#00d2ff' };
    if (Complex.absSq(beta) > 0.98) return { name: 'Horizontal |1⟩', shape: '—', badgeColor: '#00d2ff' };
    if (Math.abs(alpha.re - beta.re) < 0.05 && alpha.re > 0.6) return { name: '45° Diagonal |+⟩', shape: '/', badgeColor: '#ff4081' };
    if (Math.abs(alpha.re + beta.re) < 0.05 && alpha.re > 0.6) return { name: 'Negative Diagonal |−⟩', shape: '\\', badgeColor: '#c084fc' };
    return { name: 'Tilted Superposition', shape: '∿', badgeColor: '#fbbf24' };
  };

  const currentStance = getAgentStance();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      fontFamily: "'Space Grotesk', -apple-system, sans-serif"
    }}>
      {/* Tactical Espionage HUD Shell */}
      <div style={{
        background: 'linear-gradient(165deg, #070d1e 0%, #030611 100%)',
        border: '3px solid #00d2ff',
        borderRadius: 20,
        padding: '16px',
        boxShadow: '0 0 35px rgba(0, 210, 255, 0.3), inset 0 0 45px rgba(0, 0, 0, 0.95)',
        position: 'relative',
        overflow: 'hidden'
      }}>
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
            <span style={{ color: '#b9a6e8' }}>•</span>
            <span style={{ color: '#fbbf24', fontSize: '0.62rem', fontWeight: 800 }}>
              {score} PTS
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              style={{
                background: 'transparent',
                color: soundEnabled ? '#00d2ff' : '#b9a6e8',
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
              RULES
            </button>
            <HonestyTagBadge tag="Accurate" />
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 10, position: 'relative', zIndex: 6 }}>
          <h2 style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.01em',
            marginBottom: 2
          }}>
            🐾 Schrödinger's Stealth
          </h2>
          <p style={{ fontSize: '0.72rem', color: '#ddd0fa' }}>
            Quantum Measurement & Basis Infiltration • Slip through without collapsing
          </p>
        </div>

        {/* ============================================================== */}
        {/* 1. THE SIMPLE KEYHOLE ANALOGY: HOW THIS GAME WORKS             */}
        {/* ============================================================== */}
        <div style={{
          background: 'rgba(0, 210, 255, 0.08)',
          border: '1px solid rgba(0, 210, 255, 0.3)',
          borderRadius: 14,
          padding: '10px 12px',
          marginBottom: 12,
          position: 'relative',
          zIndex: 6
        }}>
          <button
            onClick={() => setShowAnalogy(!showAnalogy)}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'transparent',
              color: '#00d2ff',
              fontSize: '0.74rem',
              fontWeight: 800,
              padding: 0
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Lightbulb size={14} color="#00d2ff" />
              <span>THE SIMPLE RULE: MATCH THE KEYHOLE!</span>
            </div>
            {showAnalogy ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {showAnalogy && (
            <div style={{ marginTop: 8, fontSize: '0.74rem', color: '#f1eaff', lineHeight: 1.45 }}>
              <p>
                Think of each security scanner like a <b>shaped slit or keyhole</b>:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
                <div style={{
                  background: 'rgba(0, 210, 255, 0.12)',
                  border: '1px solid rgba(0, 210, 255, 0.3)',
                  borderRadius: 8,
                  padding: '6px 8px'
                }}>
                  <b style={{ color: '#00d2ff' }}>🟦 Blue Laser (Z-Basis):</b>
                  <div style={{ fontSize: '0.68rem', marginTop: 2 }}>
                    Has a <b>Vertical Slot (|)</b>. Agent must stand <b>Vertical (|0⟩)</b> to slip through!
                  </div>
                </div>

                <div style={{
                  background: 'rgba(255, 64, 129, 0.12)',
                  border: '1px solid rgba(255, 64, 129, 0.3)',
                  borderRadius: 8,
                  padding: '6px 8px'
                }}>
                  <b style={{ color: '#ff4081' }}>🟪 Pink Laser (X-Basis):</b>
                  <div style={{ fontSize: '0.68rem', marginTop: 2 }}>
                    Has a <b>Diagonal Slot (/)</b>. Tap <b>[H] LENS</b> to tilt <b>Diagonal (|+⟩)</b>!
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* 2. THE INTERACTIVE TACTICAL CORRIDOR ARENA                     */}
        {/* ============================================================== */}
        <div style={{
          background: 'radial-gradient(circle at 50% 30%, #0d163d 0%, #050818 85%)',
          border: '2px solid rgba(0, 210, 255, 0.4)',
          borderRadius: 16,
          padding: '16px 12px 14px',
          marginBottom: 12,
          position: 'relative',
          overflow: 'hidden',
          zIndex: 6
        }}>
          {/* Corridor Steps Map */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
            position: 'relative'
          }}>
            {/* Start Pod */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 5 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: currentStep === 0 ? 'var(--accent-cyan)' : '#4a2ea8',
                color: currentStep === 0 ? '#1d0848' : '#ddd0fa',
                border: '2px solid #fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                boxShadow: currentStep === 0 ? '0 0 16px var(--accent-cyan)' : 'none'
              }}>
                🐱
              </div>
              <span style={{ fontSize: '0.58rem', color: '#ddd0fa', marginTop: 4, fontWeight: 700 }}>
                AGENT
              </span>
            </div>

            {/* Checkpoints */}
            {currentSectorCheckpoints.map((cp, idx) => (
              <div key={cp.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 5 }}>
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: currentStep > idx
                    ? 'rgba(34, 197, 94, 0.25)'
                    : currentStep === idx
                    ? `${cp.beamColor}33`
                    : 'rgba(42, 15, 92, 0.9)',
                  border: `2px solid ${currentStep > idx ? '#22c55e' : cp.beamColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: 900,
                  boxShadow: currentStep === idx ? `0 0 18px ${cp.beamColor}` : 'none',
                  transition: 'all 0.25s ease'
                }}>
                  {currentStep > idx ? '✅' : cp.shape}
                </div>
                <span style={{ fontSize: '0.58rem', color: cp.beamColor, marginTop: 4, fontWeight: 700 }}>
                  GATE {idx + 1}
                </span>
              </div>
            ))}

            {/* Core Terminal Goal */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 5 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: currentStep >= currentSectorCheckpoints.length ? '#22c55e' : '#4a2ea8',
                color: '#fff',
                border: '2px solid #fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem'
              }}>
                💾
              </div>
              <span style={{ fontSize: '0.58rem', color: '#fbbf24', marginTop: 4, fontWeight: 700 }}>
                CORE
              </span>
            </div>
          </div>

          {/* ACTIVE CHECKPOINT VISUAL COMPARISON BOX */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.65)',
            border: `2px solid ${isAligned ? '#22c55e' : activeCheckpoint.beamColor}`,
            borderRadius: 12,
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            boxShadow: isAligned ? '0 0 15px rgba(34, 197, 94, 0.3)' : 'none'
          }}>
            {/* Split Comparison: Door Slot vs Agent Stance */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center' }}>
              {/* Door Slot */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: `1px solid ${activeCheckpoint.beamColor}`,
                borderRadius: 10,
                padding: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.58rem', color: activeCheckpoint.beamColor, fontWeight: 800 }}>
                  SCANNER KEYHOLE
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', margin: '2px 0' }}>
                  {activeCheckpoint.shape}
                </div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#f6f1ff' }}>
                  {activeCheckpoint.slotName}
                </div>
              </div>

              {/* Match indicator */}
              <div style={{
                fontSize: '1.2rem',
                fontWeight: 900,
                color: isAligned ? '#22c55e' : '#ef4444'
              }}>
                {isAligned ? '==' : '≠'}
              </div>

              {/* Agent Stance */}
              <div style={{
                background: isAligned ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                border: `1px solid ${isAligned ? '#22c55e' : '#ef4444'}`,
                borderRadius: 10,
                padding: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.58rem', color: isAligned ? '#86efac' : '#fca5a5', fontWeight: 800 }}>
                  YOUR STANCE
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', margin: '2px 0' }}>
                  {currentStance.shape}
                </div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#f6f1ff' }}>
                  {currentStance.name}
                </div>
              </div>
            </div>

            {/* Plain English Action Instruction */}
            <div style={{
              background: isAligned ? 'rgba(34, 197, 94, 0.15)' : 'rgba(251, 191, 36, 0.15)',
              border: `1px solid ${isAligned ? '#22c55e' : '#fbbf24'}`,
              borderRadius: 8,
              padding: '6px 10px',
              fontSize: '0.72rem',
              color: isAligned ? '#86efac' : '#fef08a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>
                {isAligned
                  ? '🟢 PERFECT MATCH! Safe to slip through undetected.'
                  : `⚠️ ${activeCheckpoint.instruction}`}
              </span>
              <span style={{ fontWeight: 800 }}>
                {isAligned ? '100% STEALTH' : `${(stealthProb * 100).toFixed(0)}% CHANCE`}
              </span>
            </div>
          </div>
        </div>

        {/* Alarm Detection Meter */}
        <div style={{
          background: 'rgba(42, 15, 92, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 12,
          padding: '8px 12px',
          marginBottom: 12,
          position: 'relative',
          zIndex: 6
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldAlert size={14} color={alarmLevel > 60 ? '#f43f5e' : alarmLevel > 30 ? '#fbbf24' : '#22c55e'} />
              <span style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '0.5rem',
                color: alarmLevel > 60 ? '#f43f5e' : alarmLevel > 30 ? '#fbbf24' : '#22c55e'
              }}>
                ALARM DETECTION METER:
              </span>
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: alarmLevel > 60 ? '#f43f5e' : '#fff' }}>
              {alarmLevel}%
            </span>
          </div>

          <div style={{
            height: 6,
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 3,
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

        {/* Narrative Feedback Banner */}
        {feedback && (
          <div style={{
            background: gameState === 'game_over' || gameState === 'alarm_alert' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(0, 210, 255, 0.12)',
            border: `1.5px solid ${gameState === 'game_over' || gameState === 'alarm_alert' ? '#f43f5e' : '#00d2ff'}`,
            borderRadius: 10,
            padding: '8px 12px',
            fontSize: '0.73rem',
            color: gameState === 'game_over' || gameState === 'alarm_alert' ? '#fca5a5' : '#f6f1ff',
            lineHeight: 1.4,
            marginBottom: 12,
            position: 'relative',
            zIndex: 6
          }}>
            {feedback}
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. QUANTUM UTILITY BELT (GADGETS TO CHANGE YOUR STANCE)        */}
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
                color: '#ddd0fa'
              }}>
                YOUR UTILITY GADGETS:
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)' }}>
                Tap to rotate your stance
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {/* Hadamard Tilt Lens */}
              <button
                onClick={applyHadamard}
                style={{
                  background: 'linear-gradient(180deg, #00d2ff 0%, #0284c7 100%)',
                  color: '#1d0848',
                  padding: '10px 4px',
                  borderRadius: 10,
                  border: '2px solid #fff',
                  boxShadow: (!isAligned && activeCheckpoint.basis === 'X' && currentStance.shape === '|') || (!isAligned && activeCheckpoint.basis === 'Z' && currentStance.shape === '/')
                    ? '0 0 16px #00d2ff'
                    : '0 4px 12px rgba(0, 210, 255, 0.3)',
                  animation: (!isAligned && ((activeCheckpoint.basis === 'X' && currentStance.shape === '|') || (activeCheckpoint.basis === 'Z' && currentStance.shape === '/')))
                    ? 'pulseGlow 2s infinite'
                    : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Zap size={15} fill="#1d0848" />
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.58rem', fontWeight: 900 }}>
                  [H] TILT
                </span>
                <span style={{ fontSize: '0.58rem', fontWeight: 800 }}>
                  Vertical ↔ 45°
                </span>
              </button>

              {/* Bit Inverter (Pauli-X) */}
              <button
                onClick={applyPauliX}
                style={{
                  background: 'linear-gradient(180deg, #ec4899 0%, #be185d 100%)',
                  color: '#fff',
                  padding: '10px 4px',
                  borderRadius: 10,
                  border: '2px solid #fff',
                  boxShadow: (!isAligned && activeCheckpoint.requiredState === '1' && currentStance.shape === '|')
                    ? '0 0 16px #ec4899'
                    : '0 4px 12px rgba(236, 72, 153, 0.3)',
                  animation: (!isAligned && activeCheckpoint.requiredState === '1' && currentStance.shape === '|')
                    ? 'pulseGlow 2s infinite'
                    : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.58rem', fontWeight: 900 }}>
                  [X] FLIP
                </span>
                <span style={{ fontSize: '0.58rem', fontWeight: 800 }}>
                  Vert ↔ Horiz
                </span>
              </button>

              {/* Phase Inverter (Pauli-Z) */}
              <button
                onClick={applyPauliZ}
                style={{
                  background: 'linear-gradient(180deg, #8a3ffc 0%, #6929c4 100%)',
                  color: '#fff',
                  padding: '10px 4px',
                  borderRadius: 10,
                  border: '2px solid #fff',
                  boxShadow: (!isAligned && activeCheckpoint.requiredState === '-' && currentStance.shape === '/')
                    ? '0 0 16px #8a3ffc'
                    : '0 4px 12px rgba(138, 63, 252, 0.3)',
                  animation: (!isAligned && activeCheckpoint.requiredState === '-' && currentStance.shape === '/')
                    ? 'pulseGlow 2s infinite'
                    : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.58rem', fontWeight: 900 }}>
                  [Z] PHASE
                </span>
                <span style={{ fontSize: '0.58rem', fontWeight: 800 }}>
                  Flip / ↔ \
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
                background: isAligned
                  ? 'linear-gradient(180deg, #22c55e 0%, #15803d 100%)'
                  : 'linear-gradient(180deg, #eab308 0%, #a16207 100%)',
                color: '#fff',
                border: '2px solid #fff',
                boxShadow: isAligned ? '0 0 20px rgba(34, 197, 94, 0.6)' : '0 0 15px rgba(234, 179, 8, 0.4)',
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '0.7rem',
                letterSpacing: '0.04em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <Footprints size={16} />
              <span>{isAligned ? 'SLIP THROUGH SENSOR (100% STEALTH)' : 'RISK PASSAGE (COLLAPSE DANGER!)'}</span>
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
                color: '#1d0848',
                border: '2px solid #fff',
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '0.68rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <span>ADVANCE TO SECTOR {sector + 1}</span>
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
                  fontSize: '0.65rem'
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
                  background: '#4a2ea8',
                  color: '#ddd0fa',
                  border: '1px solid #8f7bc9',
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '0.58rem'
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
                fontSize: '0.82rem',
                color: '#fbbf24'
              }}>
                🏆 VAULT CONQUERED!
              </div>
              <div style={{ fontSize: '0.78rem', color: '#f6f1ff' }}>
                TOTAL SCORE: <b>{score} PTS</b>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8' }}>
                BADGE UNLOCKED: <b>Master of Measurement Bases</b>
              </div>
              <button
                onClick={fullRestart}
                style={{
                  background: '#4a2ea8',
                  color: '#fff',
                  border: '1px solid #8f7bc9',
                  borderRadius: 6,
                  padding: '8px 14px',
                  fontSize: '0.65rem',
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
      {/* 4. "THE QUANTUM PHYSICS BEHIND IT" ACCORDION                   */}
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
            fontSize: '0.78rem',
            fontWeight: 700
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={15} color="var(--accent-cyan)" />
            <span>The Real Physics: Why Observing Causes Wave Collapse</span>
          </div>
          {showPhysics ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {showPhysics && (
          <div style={{
            padding: '0 14px 14px',
            fontSize: '0.74rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }}>
            <p>
              In quantum mechanics, <b>measurement is not a passive photo</b>. A detector projects the quantum wave onto its own measurement basis:
            </p>
            <ul style={{ paddingLeft: 18 }}>
              <li>
                <b>Measuring an Eigenstate:</b> If a detector measures along the Z-axis ({'|0⟩, |1⟩'}) and your qubit is already |0⟩, the probability of measuring 0 is 100%. The state is completely undisturbed!
              </li>
              <li>
                <b>Basis Mismatch (Collapse):</b> If you send a diagonal state |+⟩ into a Z-detector, it must choose: 50% chance of collapsing to 0, and 50% chance of collapsing to 1! That random jump causes the security alarm.
              </li>
            </ul>
            <p>
              This is the cornerstone of <b>Quantum Key Distribution (BB84)</b>: If an eavesdropper listens in using the wrong basis, they inevitably cause collapse, alerting the sender and receiver immediately!
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
            background: '#2a0f5c',
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
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.7rem', color: '#00d2ff' }}>
                  HQ MISSION RULES
                </span>
              </div>
              <button
                onClick={() => setShowHandbook(false)}
                style={{ background: 'transparent', color: '#ddd0fa', padding: 4 }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.76rem', color: '#f1eaff', lineHeight: 1.5 }}>
              <div>
                <b style={{ color: '#00d2ff' }}>1. The Rule:</b>
                <p>
                  Each laser scanner has a specific angle (slot). If your quantum stance matches the slot, you have <b>100% Stealth</b> and slip right through.
                </p>
              </div>

              <div>
                <b style={{ color: '#ff4081' }}>2. The Tools:</b>
                <ul style={{ paddingLeft: 16, marginTop: 4 }}>
                  <li><b>[H] TILT:</b> Rotates between Vertical (|) and 45° Diagonal (/).</li>
                  <li><b>[X] FLIP:</b> Swaps between Vertical (|) and Horizontal (—).</li>
                  <li><b>[Z] PHASE:</b> Flips between positive diagonal (/) and negative diagonal (\).</li>
                </ul>
              </div>

              <div>
                <b style={{ color: '#fbbf24' }}>3. How to Win:</b>
                <p>
                  Look at the <b>Scanner Keyhole</b> box in the center. Tap the pulsating button on your utility belt until <b>YOUR STANCE</b> matches the keyhole. When it says <b>100% STEALTH</b>, hit the button to advance!
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
                color: '#1d0848',
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '0.62rem'
              }}
            >
              GOT IT!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
