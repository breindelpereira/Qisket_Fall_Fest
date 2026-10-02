import React, { useState } from 'react';
import { useProgress } from '../../hooks/useProgress';
import { HonestyTagBadge } from '../shared/HonestyTag';
import { BlochSphereVisualizer } from '../simulations/BlochSphereVisualizer';
import { Complex } from '../../core/circuit';
import type { BlochCoordinates } from '../../core/circuit/bloch';
import { sound } from '../../utils/audio';
import { 
  RotateCcw, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  Crosshair, 
  Zap, 
  HelpCircle, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  Heart,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';

export const QuantumHeist: React.FC = () => {
  const { completeGame } = useProgress();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [gameState, setGameState] = useState<'playing' | 'failed' | 'level_complete' | 'victory' | 'game_over'>('playing');
  const [feedback, setFeedback] = useState<string>('');
  const [score, setScore] = useState(500);
  const [shields, setShields] = useState(3);
  const [showHandbook, setShowHandbook] = useState(false);
  const [showPhysicsBreakdown, setShowPhysicsBreakdown] = useState(false);
  const [hintActive, setHintActive] = useState(false);
  const [laserFiring, setLaserFiring] = useState(false);

  // Level 1 & 2 state (Single Qubit amplitudes)
  const [alpha, setAlpha] = useState<Complex>(Complex.one());
  const [beta, setBeta] = useState<Complex>(Complex.zero());

  // Level 3 state (Bloch Coordinates)
  const [theta, setTheta] = useState(0); // 0 = |0> (North Pole)
  const [phi, setPhi] = useState(0);

  const target3: BlochCoordinates = {
    x: 1,
    y: 0,
    z: 0,
    theta: Math.PI / 2,
    phi: 0, // Target is |+> on the equator
  };

  const level3Coords: BlochCoordinates = {
    x: Number((Math.sin(theta) * Math.cos(phi)).toFixed(3)),
    y: Number((Math.sin(theta) * Math.sin(phi)).toFixed(3)),
    z: Number(Math.cos(theta).toFixed(3)),
    theta,
    phi,
  };

  const prob0 = Complex.absSq(alpha);
  const prob1 = Complex.absSq(beta);

  // Ready conditions
  // Level 1: 50% Door 0 and 50% Door 1
  const isLevel1Ready = Math.abs(prob0 - 0.5) < 0.05 && Math.abs(prob1 - 0.5) < 0.05;
  
  // Level 2: 50/50 superposition AND negative phase (beta.re < -0.5) -> |-> state
  const isLevel2Ready = isLevel1Ready && beta.re < -0.5;

  // Level 3: Distance from current Bloch point to target |+> < 0.25
  const level3Dist = Math.sqrt(
    Math.pow(level3Coords.x - target3.x, 2) +
    Math.pow(level3Coords.y - target3.y, 2) +
    Math.pow(level3Coords.z - target3.z, 2)
  );
  const isLevel3Ready = level3Dist < 0.28;

  const resetLevel = () => {
    if (soundEnabled) sound.playClick();
    setAlpha(Complex.one());
    setBeta(Complex.zero());
    setTheta(0);
    setPhi(0);
    setGameState('playing');
    setFeedback('');
    setHintActive(false);
    setLaserFiring(false);
  };

  const fullRestart = () => {
    setLevel(1);
    setScore(500);
    setShields(3);
    resetLevel();
  };

  // Quantum Gate Operations
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

  // Steer controls for Level 3
  const steer = (dTheta: number, dPhi: number) => {
    if (soundEnabled) sound.playClick();
    setTheta((t) => Math.max(0, Math.min(Math.PI, t + dTheta)));
    setPhi((p) => {
      let next = p + dPhi;
      if (next > Math.PI) next -= 2 * Math.PI;
      if (next < -Math.PI) next += 2 * Math.PI;
      return next;
    });
  };

  // Breach Test Handlers
  const handleBreach = () => {
    if (level === 1) {
      if (isLevel1Ready) {
        if (soundEnabled) sound.playSuccess();
        setScore((s) => s + 500);
        setFeedback('VAULT BYPASSED! Superposition allowed Agent Q to walk through both doors simultaneously. Security scanner reading was indeterminate!');
        setGameState('level_complete');
      } else {
        triggerAlarm('ALARM TRIPPED! Scanner detected 100% mass at a single door. Tap the cyan [H] KEY to split into 50/50 superposition!');
      }
    } else if (level === 2) {
      if (isLevel2Ready) {
        if (soundEnabled) sound.playSuccess();
        setScore((s) => s + 750);
        setFeedback('FREQUENCY CANCELLED! State |−⟩ produced destructive wave interference with the alarm field. 0% signal detected!');
        setGameState('level_complete');
      } else if (isLevel1Ready) {
        triggerAlarm('RESONANCE ALARM! You are in superposition, but with positive phase (+). Tap [Z] KEY to flip the phase to negative |−⟩ for destructive wave cancellation!');
      } else {
        triggerAlarm('ALARM TRIPPED! You need superposition first. Tap [H] KEY, then tap [Z] KEY!');
      }
    } else if (level === 3) {
      if (isLevel3Ready) {
        if (soundEnabled) sound.playSuccess();
        setScore((s) => s + 1000);
        setFeedback('VAULT MASTER KEY CRACKED! Bloch sphere reticle successfully aligned with state |+⟩ on the equator!');
        setGameState('victory');
        completeGame('quantum_heist', 'concept_qubits');
      } else {
        triggerAlarm('RADAR MISALIGNED! The target |+⟩ is on the Equator. Use [▼ DOWN] on the D-Pad to tilt from North Pole (Top) down to the Equator!');
      }
    }
  };

  const triggerAlarm = (msg: string) => {
    if (soundEnabled) sound.playAlarm();
    setLaserFiring(true);
    setTimeout(() => setLaserFiring(false), 900);
    setFeedback(msg);

    setShields((prev) => {
      const next = prev - 1;
      if (next <= 0) {
        setGameState('game_over');
        return 0;
      }
      setGameState('failed');
      return next;
    });
  };

  return (
    <div style={{
      fontFamily: "'Space Grotesk', -apple-system, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }}>
      {/* 8-Bit Arcade Cabinet Shell */}
      <div style={{
        background: '#040716',
        border: '3px solid #00d2ff',
        borderRadius: 20,
        padding: '16px',
        boxShadow: '0 0 35px rgba(0, 210, 255, 0.35), inset 0 0 50px rgba(0, 0, 0, 0.95)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Laser alarm flashing background overlay when breach fails */}
        {laserFiring && (
          <div style={{
            position: 'absolute',
            inset: 0,
            animation: 'alarmFlash 0.3s infinite',
            pointerEvents: 'none',
            zIndex: 15
          }} />
        )}

        {/* CRT Scanline Overlay Effect */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.32) 50%)',
          backgroundSize: '100% 4px',
          pointerEvents: 'none',
          zIndex: 6,
          opacity: 0.5
        }} />

        {/* Arcade HUD: Status, Stage, Lives, Sound */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid rgba(0, 210, 255, 0.3)',
          paddingBottom: 10,
          marginBottom: 12,
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '0.58rem'
        }}>
          {/* Stage & Score */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#00d2ff' }}>STAGE {level}/3</span>
            <span style={{ color: '#64748b' }}>|</span>
            <span style={{ color: '#fbbf24' }}>{score} PTS</span>
          </div>

          {/* Shields (Lives) & Sound */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} title="Security Shields">
              {[1, 2, 3].map((heart) => (
                <Heart
                  key={heart}
                  size={12}
                  fill={heart <= shields ? '#f43f5e' : 'transparent'}
                  color={heart <= shields ? '#f43f5e' : '#475569'}
                />
              ))}
            </div>

            {/* Sound Toggle */}
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
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>

            {/* Rules Handbook Button */}
            <button
              onClick={() => setShowHandbook(true)}
              style={{
                background: 'rgba(0, 210, 255, 0.15)',
                border: '1px solid #00d2ff',
                color: '#00d2ff',
                padding: '4px 7px',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '0.5rem'
              }}
            >
              <HelpCircle size={10} />
              <span>RULES</span>
            </button>
          </div>
        </div>

        {/* Mission Title Header */}
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <div style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '0.85rem',
            color: '#00d2ff',
            textShadow: '0 0 12px rgba(0, 210, 255, 0.8)',
            marginBottom: 4,
            letterSpacing: '0.04em'
          }}>
            ⚡ QUANTUM HEIST ⚡
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
            {level === 1 && 'LEVEL 1: The Dual-Door Motion Tracker'}
            {level === 2 && 'LEVEL 2: The Wave Phase Frequency Trap'}
            {level === 3 && 'LEVEL 3: The 3D Bloch Gyro Decryption'}
          </div>
        </div>

        {/* ============================================================== */}
        {/* HOW TO WIN THIS LEVEL: IN-GAME MISSION OBJECTIVE CARD           */}
        {/* ============================================================== */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(0, 210, 255, 0.35)',
          borderRadius: 12,
          padding: '10px 12px',
          marginBottom: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 6
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={14} color="#00d2ff" />
              <span style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '0.58rem',
                color: '#00d2ff'
              }}>
                MISSION OBJECTIVE:
              </span>
            </div>

            {/* Hint Trigger Button */}
            <button
              onClick={() => setHintActive(!hintActive)}
              style={{
                background: hintActive ? '#fbbf24' : 'rgba(251, 191, 36, 0.15)',
                border: '1px solid #fbbf24',
                color: hintActive ? '#050714' : '#fbbf24',
                borderRadius: 6,
                padding: '3px 8px',
                fontSize: '0.58rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <Lightbulb size={11} />
              <span>{hintActive ? 'HIDE HINT' : 'NEED HINT?'}</span>
            </button>
          </div>

          {/* Plain-English Goal & Action instruction */}
          <div style={{ fontSize: '0.78rem', color: '#e2e8f0', lineHeight: 1.45 }}>
            {level === 1 && (
              <div>
                The security camera fires if you are 100% in one door.{' '}
                <span style={{ color: '#00d2ff', fontWeight: 700 }}>
                  Goal: Split your agent into 50% Door 0 and 50% Door 1
                </span>{' '}
                to confuse the scanner, then hit <b>BREACH VAULT</b>!
              </div>
            )}
            {level === 2 && (
              <div>
                The trap emits a positive wave (+).{' '}
                <span style={{ color: '#ff4081', fontWeight: 700 }}>
                  Goal: Prepare state |−⟩ (Superposition + Negative Phase)
                </span>{' '}
                so destructive wave interference cancels the alarm completely!
              </div>
            )}
            {level === 3 && (
              <div>
                The master cipher is locked on the Equator.{' '}
                <span style={{ color: '#86efac', fontWeight: 700 }}>
                  Goal: Use the D-Pad to tilt from North Pole down to Target |+⟩
                </span>{' '}
                on the Equator, then hit <b>LOCK & DECRYPT</b>!
              </div>
            )}
          </div>

          {/* Interactive Guided Hint */}
          {hintActive && (
            <div style={{
              background: 'rgba(251, 191, 36, 0.12)',
              border: '1px dashed #fbbf24',
              borderRadius: 8,
              padding: '8px 10px',
              marginTop: 4,
              fontSize: '0.74rem',
              color: '#fef08a',
              lineHeight: 1.4
            }}>
              {level === 1 && (
                <span>
                  👉 <b>Direct Move:</b> Click the cyan <b>[H] KEY</b> in the Hack Cartridges below! Notice your presence become 50% in Door 0 and 50% in Door 1.
                </span>
              )}
              {level === 2 && (
                <span>
                  👉 <b>Direct Move:</b> First click <b>[H] KEY</b> (to get 50/50 superposition), then click <b>[Z] KEY</b> (to flip phase to -). Both waves will cancel to zero!
                </span>
              )}
              {level === 3 && (
                <span>
                  👉 <b>Direct Move:</b> Press the <b>▲/▼/◀/▶ D-Pad</b> to guide the crosshair onto the glowing target ring on the sphere equator!
                </span>
              )}
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* INTERACTIVE ARCADE STAGE: LEVELS 1 & 2 (DOORS + SPRITE + LASER) */}
        {/* ============================================================== */}
        {level < 3 && (
          <div style={{
            background: 'radial-gradient(circle at 50% 20%, #111a42 0%, #06091a 80%)',
            border: '2px solid rgba(0, 210, 255, 0.4)',
            borderRadius: 14,
            padding: '16px 12px 14px',
            marginBottom: 12,
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Top Security Surveillance Turret */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 12,
              position: 'relative'
            }}>
              {/* Turret Body */}
              <div style={{
                background: '#1e293b',
                border: '2px solid #64748b',
                borderRadius: '8px 8px 14px 14px',
                padding: '4px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                zIndex: 4,
                boxShadow: '0 4px 12px rgba(0,0,0,0.6)'
              }}>
                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: (level === 1 ? isLevel1Ready : isLevel2Ready) ? '#22c55e' : '#ef4444',
                  boxShadow: `0 0 10px ${(level === 1 ? isLevel1Ready : isLevel2Ready) ? '#22c55e' : '#ef4444'}`
                }} />
                <span style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '0.52rem',
                  color: (level === 1 ? isLevel1Ready : isLevel2Ready) ? '#86efac' : '#fca5a5'
                }}>
                  {(level === 1 ? isLevel1Ready : isLevel2Ready) ? 'SCANNER: CONFUSED' : 'SCANNER: ARMED'}
                </span>
              </div>

              {/* Dynamic Laser Tracking Beam */}
              {!(level === 1 ? isLevel1Ready : isLevel2Ready) ? (
                <div style={{
                  width: 3,
                  height: 38,
                  background: 'linear-gradient(180deg, #ef4444 0%, rgba(239, 68, 68, 0.1) 100%)',
                  boxShadow: '0 0 12px #ef4444',
                  transformOrigin: 'top center',
                  transform: prob0 > 0.8 ? 'rotate(-25deg)' : prob1 > 0.8 ? 'rotate(25deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }} />
              ) : (
                /* Confused scanning beams sweeping in superposition */
                <div style={{
                  display: 'flex',
                  gap: 80,
                  height: 38,
                  opacity: 0.5
                }}>
                  <div style={{ width: 2, height: 38, background: '#00d2ff', transform: 'rotate(-20deg)', boxShadow: '0 0 8px #00d2ff' }} />
                  <div style={{ width: 2, height: 38, background: '#ff4081', transform: 'rotate(20deg)', boxShadow: '0 0 8px #ff4081' }} />
                </div>
              )}
            </div>

            {/* Level 2 Wave Oscilloscope Interferometer Display */}
            {level === 2 && (
              <div style={{
                background: '#070b1e',
                border: '1px solid rgba(0, 210, 255, 0.3)',
                borderRadius: 10,
                padding: '8px 10px',
                marginBottom: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 4
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '0.48rem'
                }}>
                  <span style={{ color: '#00d2ff' }}>PHASE INTERFEROMETER:</span>
                  <span style={{ color: isLevel2Ready ? '#22c55e' : '#f43f5e' }}>
                    {isLevel2Ready ? 'ZERO RESIDUAL (CLOAKED!)' : 'PHASE MISMATCH (DETECTED!)'}
                  </span>
                </div>

                {/* Animated Wave SVG */}
                <div style={{ height: 32, position: 'relative', overflow: 'hidden' }}>
                  <svg width="100%" height="32" viewBox="0 0 280 32" preserveAspectRatio="none">
                    {/* Center baseline */}
                    <line x1="0" y1="16" x2="280" y2="16" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                    
                    {/* Security Trap Wave: Sinusoid (+1) */}
                    <path
                      d="M 0 16 Q 35 2, 70 16 T 140 16 T 210 16 T 280 16"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="2"
                      opacity="0.6"
                    />

                    {/* Agent Phase Wave */}
                    {isLevel2Ready ? (
                      /* Inverted Wave (-1): Destructive Interference -> Flat cancellation */
                      <path
                        d="M 0 16 Q 35 30, 70 16 T 140 16 T 210 16 T 280 16"
                        fill="none"
                        stroke="#00d2ff"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                      />
                    ) : (
                      /* Constructive positive wave -> spikes */
                      <path
                        d="M 0 16 Q 35 2, 70 16 T 140 16 T 210 16 T 280 16"
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth="2"
                      />
                    )}
                  </svg>
                </div>
              </div>
            )}

            {/* The Dual Physical Vault Doors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {/* DOOR 0 */}
              <div style={{
                background: prob0 > 0.4 ? 'rgba(0, 210, 255, 0.16)' : 'rgba(15, 23, 42, 0.9)',
                border: `2px ${prob0 > 0.4 ? 'solid' : 'dashed'} ${prob0 > 0.4 ? '#00d2ff' : '#334155'}`,
                borderRadius: 14,
                padding: '12px 8px 10px',
                textAlign: 'center',
                position: 'relative',
                boxShadow: prob0 > 0.4 ? '0 0 18px rgba(0, 210, 255, 0.35)' : 'none',
                transition: 'all 0.25s ease'
              }}>
                {/* Door Header Label */}
                <div style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '0.62rem',
                  color: prob0 > 0.4 ? '#00d2ff' : '#64748b',
                  marginBottom: 6
                }}>
                  DOOR |0⟩
                </div>

                {/* Agent Q Character Sprite / Hologram */}
                <div style={{
                  height: 54,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {prob0 > 0.1 ? (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      opacity: prob0 > 0.8 ? 1 : 0.85,
                      animation: prob0 < 0.8 ? 'holographicGlitch 2s infinite' : 'none',
                      transform: 'scale(1.15)'
                    }}>
                      {/* Pixel Hacker Face / Avatar */}
                      <div style={{
                        width: 24,
                        height: 24,
                        background: prob0 > 0.8 ? '#00d2ff' : 'rgba(0, 210, 255, 0.7)',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #fff',
                        boxShadow: '0 0 8px #00d2ff'
                      }}>
                        🕶️
                      </div>
                      <div style={{
                        fontSize: '0.55rem',
                        fontWeight: 800,
                        color: '#00d2ff',
                        marginTop: 2,
                        fontFamily: "'Press Start 2P', monospace"
                      }}>
                        {prob0 > 0.8 ? 'SOLID' : 'GHOST'}
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.65rem', color: '#475569' }}>EMPTY</span>
                  )}
                </div>

                {/* Percentage Presence Meter */}
                <div style={{
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  color: prob0 > 0.4 ? '#00d2ff' : '#94a3b8',
                  marginTop: 4
                }}>
                  {(prob0 * 100).toFixed(0)}% PRESENCE
                </div>

                <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 2 }}>
                  Amplitude: <b>{alpha.re.toFixed(2)}</b>
                </div>
              </div>

              {/* DOOR 1 */}
              <div style={{
                background: prob1 > 0.4 ? 'rgba(255, 64, 129, 0.16)' : 'rgba(15, 23, 42, 0.9)',
                border: `2px ${prob1 > 0.4 ? 'solid' : 'dashed'} ${prob1 > 0.4 ? '#ff4081' : '#334155'}`,
                borderRadius: 14,
                padding: '12px 8px 10px',
                textAlign: 'center',
                position: 'relative',
                boxShadow: prob1 > 0.4 ? '0 0 18px rgba(255, 64, 129, 0.35)' : 'none',
                transition: 'all 0.25s ease'
              }}>
                {/* Door Header Label */}
                <div style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '0.62rem',
                  color: prob1 > 0.4 ? '#ff4081' : '#64748b',
                  marginBottom: 6
                }}>
                  DOOR |1⟩
                </div>

                {/* Agent Q Character Sprite / Hologram */}
                <div style={{
                  height: 54,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {prob1 > 0.1 ? (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      opacity: prob1 > 0.8 ? 1 : 0.85,
                      animation: prob1 < 0.8 ? 'holographicGlitch 2s infinite' : 'none',
                      transform: 'scale(1.15)'
                    }}>
                      <div style={{
                        width: 24,
                        height: 24,
                        background: prob1 > 0.8 ? '#ff4081' : 'rgba(255, 64, 129, 0.7)',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #fff',
                        boxShadow: '0 0 8px #ff4081'
                      }}>
                        🕶️
                      </div>
                      <div style={{
                        fontSize: '0.55rem',
                        fontWeight: 800,
                        color: '#ff4081',
                        marginTop: 2,
                        fontFamily: "'Press Start 2P', monospace"
                      }}>
                        {prob1 > 0.8 ? 'SOLID' : 'GHOST'}
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.65rem', color: '#475569' }}>EMPTY</span>
                  )}
                </div>

                {/* Percentage Presence Meter */}
                <div style={{
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  color: prob1 > 0.4 ? '#ff4081' : '#94a3b8',
                  marginTop: 4
                }}>
                  {(prob1 * 100).toFixed(0)}% PRESENCE
                </div>

                <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 2 }}>
                  Amplitude: <b>{beta.re.toFixed(2)}</b>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* INTERACTIVE ARCADE STAGE: LEVEL 3 (3D BLOCH RADAR DECRYPTION)  */}
        {/* ============================================================== */}
        {level === 3 && (
          <div style={{
            background: 'radial-gradient(circle at center, #111a42 0%, #06091a 80%)',
            border: '2px solid #00d2ff',
            borderRadius: 14,
            padding: '14px',
            marginBottom: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 8,
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '0.55rem',
              color: '#00d2ff'
            }}>
              <Crosshair size={14} color="#00d2ff" />
              <span>RADAR AIM: LOCK ONTO |+⟩ (EQUATOR)</span>
            </div>

            {/* Bloch Sphere SVG */}
            <BlochSphereVisualizer
              coordinates={level3Coords}
              targetCoordinates={target3}
              size={210}
            />

            {/* Radar Coordinates Readout */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              padding: '6px 12px',
              background: 'rgba(0, 210, 255, 0.08)',
              borderRadius: 8,
              marginTop: 8,
              fontSize: '0.72rem'
            }}>
              <div>
                <span style={{ color: '#94a3b8' }}>Aim Dist: </span>
                <b style={{ color: isLevel3Ready ? '#22c55e' : '#fbbf24' }}>
                  {level3Dist.toFixed(2)} {isLevel3Ready ? '✅ (LOCKED!)' : '(Steer closer)'}
                </b>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Target: </span>
                <b style={{ color: '#00d2ff' }}>|+⟩ (Equator)</b>
              </div>
            </div>

            {/* Retro Arcade D-Pad Controls for Steering */}
            <div style={{
              marginTop: 12,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6
            }}>
              <button
                onClick={() => steer(-0.15, 0)}
                style={{
                  background: '#1e293b',
                  border: '2px solid #00d2ff',
                  color: '#00d2ff',
                  borderRadius: 8,
                  padding: '6px 20px',
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '0.62rem'
                }}
              >
                ▲ UP
              </button>

              <div style={{ display: 'flex', gap: 14 }}>
                <button
                  onClick={() => steer(0, -0.2)}
                  style={{
                    background: '#1e293b',
                    border: '2px solid #00d2ff',
                    color: '#00d2ff',
                    borderRadius: 8,
                    padding: '8px 14px',
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '0.62rem'
                  }}
                >
                  ◀ LEFT
                </button>

                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #00d2ff, #0f172a)',
                  border: '2px solid #fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem'
                }}>
                  🎯
                </div>

                <button
                  onClick={() => steer(0, 0.2)}
                  style={{
                    background: '#1e293b',
                    border: '2px solid #00d2ff',
                    color: '#00d2ff',
                    borderRadius: 8,
                    padding: '8px 14px',
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '0.62rem'
                  }}
                >
                  RIGHT ▶
                </button>
              </div>

              <button
                onClick={() => steer(0.15, 0)}
                style={{
                  background: '#1e293b',
                  border: '2px solid #00d2ff',
                  color: '#00d2ff',
                  borderRadius: 8,
                  padding: '6px 20px',
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '0.62rem'
                }}
              >
                ▼ DOWN
              </button>
            </div>
          </div>
        )}

        {/* Live Objective Status Banner */}
        <div style={{
          background: (level === 1 ? isLevel1Ready : level === 2 ? isLevel2Ready : isLevel3Ready)
            ? 'rgba(34, 197, 94, 0.18)'
            : 'rgba(251, 191, 36, 0.12)',
          border: `1.5px solid ${(level === 1 ? isLevel1Ready : level === 2 ? isLevel2Ready : isLevel3Ready) ? '#22c55e' : 'rgba(251, 191, 36, 0.5)'}`,
          borderRadius: 10,
          padding: '8px 12px',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.74rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {(level === 1 ? isLevel1Ready : level === 2 ? isLevel2Ready : isLevel3Ready) ? (
              <CheckCircle2 size={16} color="#22c55e" />
            ) : (
              <AlertTriangle size={16} color="#fbbf24" />
            )}
            <span style={{
              fontWeight: 700,
              color: (level === 1 ? isLevel1Ready : level === 2 ? isLevel2Ready : isLevel3Ready) ? '#86efac' : '#fde047'
            }}>
              {(level === 1 ? isLevel1Ready : level === 2 ? isLevel2Ready : isLevel3Ready)
                ? 'TARGET MATCHED — READY TO BREACH!'
                : level === 1
                ? 'CURRENT: 100% Door 0 (Alarm will fire!)'
                : level === 2
                ? 'CURRENT: Positive Phase (+). Need Negative Phase |−⟩!'
                : 'CURRENT: Reticle off target'}
            </span>
          </div>

          <span style={{
            fontSize: '0.58rem',
            color: '#94a3b8',
            fontFamily: "'Press Start 2P', monospace"
          }}>
            {(level === 1 ? isLevel1Ready : level === 2 ? isLevel2Ready : isLevel3Ready) ? 'SAFE ✅' : 'WAITING ⏳'}
          </span>
        </div>

        {/* Level Feedback & Story Banner */}
        {feedback && (
          <div style={{
            padding: '10px 12px',
            borderRadius: 8,
            fontSize: '0.74rem',
            lineHeight: 1.45,
            background: gameState === 'failed' || gameState === 'game_over' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(34, 197, 94, 0.2)',
            border: `2px solid ${gameState === 'failed' || gameState === 'game_over' ? '#f43f5e' : '#22c55e'}`,
            color: gameState === 'failed' || gameState === 'game_over' ? '#fca5a5' : '#86efac',
            marginBottom: 12
          }}>
            {feedback}
          </div>
        )}

        {/* ============================================================== */}
        {/* RETRO TOOL CARTRIDGES (GATES)                                 */}
        {/* ============================================================== */}
        {level < 3 && gameState === 'playing' && (
          <div style={{ marginBottom: 12 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8
            }}>
              <span style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '0.55rem',
                color: '#94a3b8'
              }}>
                HACK CARTRIDGES:
              </span>
              <span style={{ fontSize: '0.68rem', color: '#00d2ff' }}>
                Tap to apply quantum gate
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {/* Hadamard */}
              <button
                onClick={applyHadamard}
                style={{
                  background: 'linear-gradient(180deg, #00d2ff 0%, #0284c7 100%)',
                  color: '#050714',
                  padding: '10px 6px',
                  borderRadius: 10,
                  border: '2px solid #fff',
                  boxShadow: (level === 1 && !isLevel1Ready) ? '0 0 16px #00d2ff' : '0 4px 12px rgba(0, 210, 255, 0.3)',
                  animation: (level === 1 && !isLevel1Ready) ? 'pulseGlow 2s infinite' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  textAlign: 'center'
                }}
              >
                <Zap size={16} fill="#050714" />
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.6rem', fontWeight: 900 }}>
                  [H] KEY
                </span>
                <span style={{ fontSize: '0.62rem', fontWeight: 800 }}>
                  Split 50/50
                </span>
              </button>

              {/* Pauli-X */}
              <button
                onClick={applyPauliX}
                style={{
                  background: 'linear-gradient(180deg, #ec4899 0%, #be185d 100%)',
                  color: '#fff',
                  padding: '10px 6px',
                  borderRadius: 10,
                  border: '2px solid #fff',
                  boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  textAlign: 'center'
                }}
              >
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.6rem', fontWeight: 900 }}>
                  [X] FLIP
                </span>
                <span style={{ fontSize: '0.62rem', fontWeight: 800 }}>
                  Swap 0 ↔ 1
                </span>
              </button>

              {/* Pauli-Z */}
              <button
                onClick={applyPauliZ}
                style={{
                  background: 'linear-gradient(180deg, #8a3ffc 0%, #6929c4 100%)',
                  color: '#fff',
                  padding: '10px 6px',
                  borderRadius: 10,
                  border: '2px solid #fff',
                  boxShadow: (level === 2 && isLevel1Ready && !isLevel2Ready) ? '0 0 16px #8a3ffc' : '0 4px 12px rgba(138, 63, 252, 0.3)',
                  animation: (level === 2 && isLevel1Ready && !isLevel2Ready) ? 'pulseGlow 2s infinite' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  textAlign: 'center'
                }}
              >
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.6rem', fontWeight: 900 }}>
                  [Z] PHASE
                </span>
                <span style={{ fontSize: '0.62rem', fontWeight: 800 }}>
                  Flip (+ / -)
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Primary Action Button (Breach / Decrypt / Retry) */}
        <div>
          {gameState === 'playing' && (
            <button
              onClick={handleBreach}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 12,
                background: (level === 1 ? isLevel1Ready : level === 2 ? isLevel2Ready : isLevel3Ready)
                  ? 'linear-gradient(180deg, #22c55e 0%, #15803d 100%)'
                  : 'linear-gradient(180deg, #eab308 0%, #a16207 100%)',
                color: '#fff',
                border: '2px solid #fff',
                boxShadow: (level === 1 ? isLevel1Ready : level === 2 ? isLevel2Ready : isLevel3Ready)
                  ? '0 0 20px rgba(34, 197, 94, 0.6)'
                  : '0 0 15px rgba(234, 179, 8, 0.4)',
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '0.72rem',
                letterSpacing: '0.04em',
                transition: 'all 0.2s ease'
              }}
            >
              {level === 3 ? '🔴 LOCK & DECRYPT' : '🔴 ATTEMPT BREACH'}
            </button>
          )}

          {gameState === 'failed' && (
            <button
              onClick={resetLevel}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 12,
                background: '#334155',
                color: '#fff',
                border: '2px solid #94a3b8',
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '0.68rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <RotateCcw size={16} />
              <span>RETRY INFILTRATION</span>
            </button>
          )}

          {gameState === 'game_over' && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.2)',
              border: '2px solid #f43f5e',
              borderRadius: 12,
              padding: '14px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: 10
            }}>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.8rem', color: '#fca5a5' }}>
                ☠️ SECURITY SHIELDS DEPLETED!
              </div>
              <div style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>
                Agent Q was captured. Restart the heist with full shields!
              </div>
              <button
                onClick={fullRestart}
                style={{
                  background: '#f43f5e',
                  color: '#fff',
                  padding: '10px',
                  borderRadius: 8,
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '0.65rem'
                }}
              >
                RESTART FROM STAGE 1
              </button>
            </div>
          )}

          {gameState === 'level_complete' && (
            <button
              onClick={() => {
                if (soundEnabled) sound.playClick();
                setLevel((l) => (l + 1) as any);
                resetLevel();
              }}
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
              <span>ADVANCE TO STAGE {level + 1}</span>
              <ChevronRight size={16} />
            </button>
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
                color: '#fbbf24',
                textShadow: '0 0 10px rgba(251, 191, 36, 0.8)'
              }}>
                🏆 HEIST ACCOMPLISHED!
              </div>
              <div style={{ fontSize: '0.78rem', color: '#e2e8f0', marginTop: 4 }}>
                TOTAL SCORE: <b>{score} PTS</b>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8' }}>
                BADGE UNLOCKED: <b>Superposition Master</b>
              </div>
              <button
                onClick={fullRestart}
                style={{
                  background: '#1e293b',
                  color: '#fff',
                  border: '1px solid #475569',
                  borderRadius: 6,
                  padding: '6px 14px',
                  fontSize: '0.7rem',
                  marginTop: 6,
                  fontFamily: "'Press Start 2P', monospace"
                }}
              >
                REPLAY HEIST
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* "THE QUANTUM SECRET" (Why does this work in real physics?)      */}
      {/* ============================================================== */}
      <div style={{
        background: 'var(--bg-surface)',
        borderRadius: 14,
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden'
      }}>
        <button
          onClick={() => setShowPhysicsBreakdown(!showPhysicsBreakdown)}
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
            <span>The Quantum Physics Secret</span>
          </div>
          {showPhysicsBreakdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showPhysicsBreakdown && (
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
              In classical computing, a bit is strictly <b>0 OR 1</b> (like being stuck in Door 0).
              In quantum computing, the <b>Hadamard gate [H]</b> rotates the quantum state vector to an equal superposition:
            </p>
            <div style={{
              background: 'rgba(0, 210, 255, 0.08)',
              padding: '8px 12px',
              borderRadius: 8,
              fontFamily: 'monospace',
              color: '#00d2ff',
              fontSize: '0.78rem'
            }}>
              |ψ⟩ = (1/√2)|0⟩ + (1/√2)|1⟩
            </div>
            <p>
              By the Born rule, the probability is \(|\alpha|^2 = (1/\sqrt{2})^2 = 0.5\) (50%).
              In Stage 2, the <b>[Z] gate</b> inverts the phase to produce destructive interference, which is the foundational mechanism behind quantum speedups like Grover's and Shor's algorithms!
            </p>
            <HonestyTagBadge tag="Simplified model" />
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* "HACKER HANDBOOK" POPUP MODAL                                  */}
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
                  HACKER HANDBOOK
                </span>
              </div>
              <button
                onClick={() => setShowHandbook(false)}
                style={{ background: 'transparent', color: '#94a3b8', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              <div>
                <b style={{ color: '#00d2ff' }}>1. What is the Goal?</b>
                <p>
                  You are infiltrating a quantum vault. Classical security scanners can detect when you pick a single door (0 or 1). Your goal is to use quantum gates to manipulate your qubit so you can bypass the defenses!
                </p>
              </div>

              <div>
                <b style={{ color: '#ff4081' }}>2. How to Win Stage 1:</b>
                <p>
                  Click the <b>[H] KEY</b> to split into 50% Door 0 and 50% Door 1. The scanner cannot resolve a definite target. The Status Banner will turn green. Then hit <b>ATTEMPT BREACH</b>!
                </p>
              </div>

              <div>
                <b style={{ color: '#c084fc' }}>3. How to Win Stage 2:</b>
                <p>
                  Click <b>[H]</b>, then click <b>[Z]</b>. The [Z] gate inverts the phase, producing destructive interference that cancels the alarm frequency!
                </p>
              </div>

              <div>
                <b style={{ color: '#fde047' }}>4. How to Win Stage 3:</b>
                <p>
                  Use the D-Pad to tilt the reticle down from the North Pole (|0⟩) to the Equator target ring (|+⟩)!
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
              GOT IT, AGENT!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
