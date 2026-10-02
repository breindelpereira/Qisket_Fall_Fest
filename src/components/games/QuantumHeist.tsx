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
  Activity
} from 'lucide-react';

export const QuantumHeist: React.FC = () => {
  const { completeGame } = useProgress();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [gameState, setGameState] = useState<'playing' | 'failed' | 'level_complete' | 'victory'>('playing');
  const [feedback, setFeedback] = useState<string>('');
  const [score, setScore] = useState(500);

  // Level 1 & 2 state
  const [alpha, setAlpha] = useState<Complex>(Complex.one());
  const [beta, setBeta] = useState<Complex>(Complex.zero());

  // Level 3 state (Bloch Aim)
  const [theta, setTheta] = useState(0);
  const [phi, setPhi] = useState(0);

  const target3: BlochCoordinates = {
    x: 1,
    y: 0,
    z: 0,
    theta: Math.PI / 2,
    phi: 0, // Target is |+>
  };

  const level3Coords: BlochCoordinates = {
    x: Number((Math.sin(theta) * Math.cos(phi)).toFixed(3)),
    y: Number((Math.sin(theta) * Math.sin(phi)).toFixed(3)),
    z: Number(Math.cos(theta).toFixed(3)),
    theta,
    phi,
  };

  const resetLevel = () => {
    if (soundEnabled) sound.playClick();
    setAlpha(Complex.one());
    setBeta(Complex.zero());
    setTheta(0);
    setPhi(0);
    setGameState('playing');
    setFeedback('');
  };

  // Tools
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

  // Level 1 Test
  const testLevel1 = () => {
    if (soundEnabled) sound.playLaser();
    const prob0 = Complex.absSq(alpha);
    const prob1 = Complex.absSq(beta);

    if (Math.abs(prob0 - 0.5) < 0.05 && Math.abs(prob1 - 0.5) < 0.05) {
      if (soundEnabled) sound.playSuccess();
      setScore((s) => s + 500);
      setFeedback('VAULT BYPASSED! Superposition created 50/50 dual-door presence!');
      setGameState('level_complete');
    } else {
      if (soundEnabled) sound.playAlarm();
      setFeedback('ALARM TRIGGERED! Scanner detected single classical state. Insert H-KEY!');
      setGameState('failed');
    }
  };

  // Level 2 Test
  const testLevel2 = () => {
    if (soundEnabled) sound.playLaser();
    const isSuperposition = Math.abs(Complex.absSq(alpha) - 0.5) < 0.05;
    const isNegativePhase = beta.re < -0.6;

    if (isSuperposition && isNegativePhase) {
      if (soundEnabled) sound.playSuccess();
      setScore((s) => s + 750);
      setFeedback('GRID CRACKED! Negative phase |−⟩ created destructive interference!');
      setGameState('level_complete');
    } else if (isSuperposition) {
      if (soundEnabled) sound.playAlarm();
      setFeedback('LOCK JAMMED! Superposition |+⟩ detected, but phase is positive. Apply Pauli-Z!');
      setGameState('failed');
    } else {
      if (soundEnabled) sound.playAlarm();
      setFeedback('ALARM TRIGGERED! State is classical. Create superposition first!');
      setGameState('failed');
    }
  };

  // Level 3 Test
  const testLevel3 = () => {
    if (soundEnabled) sound.playLaser();
    const dx = level3Coords.x - target3.x;
    const dy = level3Coords.y - target3.y;
    const dz = level3Coords.z - target3.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (dist < 0.25) {
      if (soundEnabled) sound.playSuccess();
      setScore((s) => s + 1000);
      setFeedback('CORE OVERRIDDEN! Crosshair aligned perfectly with |+⟩ lock coordinate!');
      setGameState('victory');
      completeGame('quantum_heist', 'concept_qubits');
    } else {
      if (soundEnabled) sound.playAlarm();
      setFeedback('TARGET MISSED! Reticle must align with equatorial target |+⟩ (+X axis)!');
      setGameState('failed');
    }
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
        background: '#050714',
        border: '3px solid #00d2ff',
        borderRadius: 16,
        padding: '14px',
        boxShadow: '0 0 25px rgba(0, 210, 255, 0.35), inset 0 0 30px rgba(0, 0, 0, 0.9)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* CRT Scanline Overlay Effect */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.3) 50%)',
          backgroundSize: '100% 4px',
          pointerEvents: 'none',
          zIndex: 5,
          opacity: 0.65
        }} />

        {/* Retro Top Status Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid rgba(0, 210, 255, 0.3)',
          paddingBottom: 8,
          marginBottom: 10,
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '0.62rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#00d2ff' }}>STAGE {level}/3</span>
            <span style={{ color: '#ff4081' }}>•</span>
            <span style={{ color: '#ff4081' }}>{score} PTS</span>
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
              title="Toggle 8-bit sound"
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
            <HonestyTagBadge tag="Simplified model" />
          </div>
        </div>

        {/* Arcade Stage Title */}
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <div style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '0.75rem',
            color: '#00d2ff',
            textShadow: '0 0 8px rgba(0, 210, 255, 0.8)',
            marginBottom: 4,
            letterSpacing: '0.05em'
          }}>
            ⚡ QUANTUM HEIST ⚡
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            {level === 1 && 'MISSION 1: The Superposition Vault Doors'}
            {level === 2 && 'MISSION 2: Anti-Phase Frequency Trap'}
            {level === 3 && 'MISSION 3: Bloch Aim Radar Lock'}
          </div>
        </div>

        {/* Mission Briefing Box (Retro Computer Display) */}
        <div style={{
          background: 'rgba(0, 210, 255, 0.05)',
          border: '1px solid rgba(0, 210, 255, 0.3)',
          borderRadius: 8,
          padding: '8px 12px',
          fontSize: '0.74rem',
          color: '#e2e8f0',
          lineHeight: 1.45,
          marginBottom: 12,
          fontFamily: "'VT323', monospace",
          letterSpacing: '0.05em'
        }}>
          {level === 1 && (
            <div>
              &gt; ALERT: Lasers scan both vault chambers.<br />
              &gt; If you pick only 0 or 1, ALARM SOUNDS.<br />
              &gt; Slot the [H] KEY to exist in both doors at once!
            </div>
          )}
          {level === 2 && (
            <div>
              &gt; GRID: Destructive interference shield active.<br />
              &gt; Requirement: State |−⟩ with negative relative phase.<br />
              &gt; Action: Create superposition [H], then flip phase with [Z]!
            </div>
          )}
          {level === 3 && (
            <div>
              &gt; RADAR LOCK: Core rotated to coordinate |+⟩ (+X axis).<br />
              &gt; Steer the quantum state arrow onto the equatorial target.<br />
              &gt; Align crosshairs to breach the central bank core!
            </div>
          )}
        </div>

        {/* Level 1 & 2 Interactive Vault Arena */}
        {level < 3 && (
          <div style={{
            background: 'radial-gradient(circle at center, #101538 0%, #060918 80%)',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 12,
            padding: '16px 12px',
            marginBottom: 12,
            position: 'relative'
          }}>
            {/* Animated Laser Grid Beam */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 12
            }}>
              <Activity size={16} color="#ff4081" />
              <div style={{
                height: 2,
                flex: 1,
                background: 'repeating-linear-gradient(90deg, #ff4081, #ff4081 6px, transparent 6px, transparent 12px)',
                animation: 'pulse 1s infinite'
              }} />
              <span style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '0.55rem',
                color: '#ff4081'
              }}>
                LASER DETECTOR
              </span>
              <div style={{
                height: 2,
                flex: 1,
                background: 'repeating-linear-gradient(90deg, #ff4081, #ff4081 6px, transparent 6px, transparent 12px)'
              }} />
            </div>

            {/* Two Physical Vault Doors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {/* Door 0 */}
              <div style={{
                background: Complex.absSq(alpha) > 0.4 ? 'rgba(0, 210, 255, 0.15)' : 'rgba(15, 23, 42, 0.9)',
                border: `2px dashed ${Complex.absSq(alpha) > 0.4 ? '#00d2ff' : '#475569'}`,
                borderRadius: 10,
                padding: '16px 10px',
                textAlign: 'center',
                boxShadow: Complex.absSq(alpha) > 0.4 ? '0 0 18px rgba(0, 210, 255, 0.4)' : 'none',
                transition: 'all 0.2s ease'
              }}>
                <div style={{
                  width: 32,
                  height: 32,
                  margin: '0 auto 8px',
                  borderRadius: 6,
                  background: Complex.absSq(alpha) > 0.4 ? '#00d2ff' : '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#050714',
                  fontWeight: 900
                }}>
                  0
                </div>
                <div style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '0.62rem',
                  color: '#fff',
                  marginBottom: 4
                }}>
                  DOOR |0⟩
                </div>
                <div style={{ fontSize: '0.72rem', color: '#00d2ff', fontWeight: 700 }}>
                  P(0): {(Complex.absSq(alpha) * 100).toFixed(0)}%
                </div>
                <div style={{ fontSize: '0.62rem', color: '#94a3b8', marginTop: 2 }}>
                  amp: {alpha.re.toFixed(2)}
                </div>
              </div>

              {/* Door 1 */}
              <div style={{
                background: Complex.absSq(beta) > 0.4 ? 'rgba(255, 64, 129, 0.15)' : 'rgba(15, 23, 42, 0.9)',
                border: `2px dashed ${Complex.absSq(beta) > 0.4 ? '#ff4081' : '#475569'}`,
                borderRadius: 10,
                padding: '16px 10px',
                textAlign: 'center',
                boxShadow: Complex.absSq(beta) > 0.4 ? '0 0 18px rgba(255, 64, 129, 0.4)' : 'none',
                transition: 'all 0.2s ease'
              }}>
                <div style={{
                  width: 32,
                  height: 32,
                  margin: '0 auto 8px',
                  borderRadius: 6,
                  background: Complex.absSq(beta) > 0.4 ? '#ff4081' : '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#050714',
                  fontWeight: 900
                }}>
                  1
                </div>
                <div style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '0.62rem',
                  color: '#fff',
                  marginBottom: 4
                }}>
                  DOOR |1⟩
                </div>
                <div style={{ fontSize: '0.72rem', color: '#ff4081', fontWeight: 700 }}>
                  P(1): {(Complex.absSq(beta) * 100).toFixed(0)}%
                </div>
                <div style={{ fontSize: '0.62rem', color: '#94a3b8', marginTop: 2 }}>
                  amp: {beta.re.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Level 3: Cyber Bloch Radar Lock Display */}
        {level === 3 && (
          <div style={{
            background: 'radial-gradient(circle at center, #101538 0%, #060918 80%)',
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
              fontSize: '0.58rem',
              color: '#00d2ff'
            }}>
              <Crosshair size={14} color="#00d2ff" />
              <span>RADAR AIM: LOCK ONTO |+⟩</span>
            </div>

            <BlochSphereVisualizer
              coordinates={level3Coords}
              targetCoordinates={target3}
              size={210}
            />

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
                  padding: '6px 18px',
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '0.65rem'
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
                    fontSize: '0.65rem'
                  }}
                >
                  ◀ LEFT
                </button>

                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #00d2ff, #0f172a)',
                  border: '2px solid #fff'
                }} />

                <button
                  onClick={() => steer(0, 0.2)}
                  style={{
                    background: '#1e293b',
                    border: '2px solid #00d2ff',
                    color: '#00d2ff',
                    borderRadius: 8,
                    padding: '8px 14px',
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '0.65rem'
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
                  padding: '6px 18px',
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '0.65rem'
                }}
              >
                ▼ DOWN
              </button>
            </div>
          </div>
        )}

        {/* Feedback Display */}
        {feedback && (
          <div style={{
            padding: '10px 12px',
            borderRadius: 8,
            fontSize: '0.75rem',
            fontFamily: "'Press Start 2P', monospace",
            lineHeight: 1.5,
            background: gameState === 'failed' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(34, 197, 94, 0.2)',
            border: `2px solid ${gameState === 'failed' ? '#f43f5e' : '#22c55e'}`,
            color: gameState === 'failed' ? '#fca5a5' : '#86efac',
            marginBottom: 12
          }}>
            {feedback}
          </div>
        )}

        {/* Retro Tool Cartridges for Level 1 & 2 */}
        {level < 3 && gameState === 'playing' && (
          <div style={{ marginBottom: 12 }}>
            <div style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '0.55rem',
              color: '#94a3b8',
              marginBottom: 6
            }}>
              CARTRIDGES:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <button
                onClick={applyHadamard}
                style={{
                  background: 'linear-gradient(180deg, #00d2ff 0%, #0284c7 100%)',
                  color: '#050714',
                  padding: '10px 4px',
                  borderRadius: 8,
                  border: '2px solid #fff',
                  boxShadow: '0 4px 10px rgba(0, 210, 255, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3
                }}
              >
                <Zap size={15} fill="#050714" />
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.58rem', fontWeight: 900 }}>
                  [H] KEY
                </span>
                <span style={{ fontSize: '0.55rem', opacity: 0.85 }}>Superpos.</span>
              </button>

              <button
                onClick={applyPauliX}
                style={{
                  background: 'linear-gradient(180deg, #ec4899 0%, #be185d 100%)',
                  color: '#fff',
                  padding: '10px 4px',
                  borderRadius: 8,
                  border: '2px solid #fff',
                  boxShadow: '0 4px 10px rgba(236, 72, 153, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3
                }}
              >
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.58rem', fontWeight: 900 }}>
                  [X] FLIP
                </span>
                <span style={{ fontSize: '0.55rem', opacity: 0.85 }}>NOT Gate</span>
              </button>

              <button
                onClick={applyPauliZ}
                style={{
                  background: 'linear-gradient(180deg, #8a3ffc 0%, #6929c4 100%)',
                  color: '#fff',
                  padding: '10px 4px',
                  borderRadius: 8,
                  border: '2px solid #fff',
                  boxShadow: '0 4px 10px rgba(138, 63, 252, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3
                }}
              >
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.58rem', fontWeight: 900 }}>
                  [Z] PHASE
                </span>
                <span style={{ fontSize: '0.55rem', opacity: 0.85 }}>Flip Phase</span>
              </button>
            </div>
          </div>
        )}

        {/* Primary Arcade Action Button */}
        <div>
          {gameState === 'playing' && (
            <button
              onClick={level === 1 ? testLevel1 : level === 2 ? testLevel2 : testLevel3}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 10,
                background: 'linear-gradient(180deg, #22c55e 0%, #15803d 100%)',
                color: '#fff',
                border: '2px solid #86efac',
                boxShadow: '0 0 15px rgba(34, 197, 94, 0.5)',
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '0.72rem',
                letterSpacing: '0.05em'
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
                borderRadius: 10,
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
                borderRadius: 10,
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
                BADGE UNLOCKED: <b>Familiar with Superposition</b>
              </div>
              <button
                onClick={() => {
                  setLevel(1);
                  setScore(500);
                  resetLevel();
                }}
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
    </div>
  );
};
