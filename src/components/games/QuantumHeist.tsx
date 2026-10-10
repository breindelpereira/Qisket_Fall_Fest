import React, { useState } from 'react';
import { useProgress } from '../../hooks/useProgress';
import { useActivityReport } from '../../hooks/useActivityReport';
import { HonestyTagBadge } from '../shared/HonestyTag';
import { ArcadeHeader, ArcadeModal, Banner, Eyebrow, GameTitle } from '../shared/Arcade';
import { THEMES, RETRO, frameStyle, panelStyle } from '../shared/arcadeTheme';
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
  HelpCircle, 
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
        setFeedback('VAULT BYPASSED! A 50/50 superposition has no single door, so the scanner had nothing definite to read.');
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

  const ready = level === 1 ? isLevel1Ready : level === 2 ? isLevel2Ready : isLevel3Ready;
  const theme = THEMES.yellow;

  // what the AI tutor is told if the learner asks about this game: the screen, never the solution
  const deg = (rad: number) => Math.round((rad * 180) / Math.PI);
  const percent = (p: number) => Math.round(p * 100);
  useActivityReport({
    id: 'quantum_heist',
    status: gameState === 'victory' ? 'finished' : 'playing',
    step: `Stage ${level} of 3`,
    mission:
      level === 1
        ? 'Split the agent 50/50 between Door 0 and Door 1 so the scanner has nothing to aim at, then breach the vault.'
        : level === 2
          ? 'Prepare the state |−> (a 50/50 split with a negative sign) so the trap wave cancels, then breach the vault.'
          : 'Steer the crosshair on the Bloch sphere onto |+> on the equator, then lock and decrypt.',
    state:
      (level < 3
        ? `Chance at Door 0: ${percent(prob0)}%, Door 1: ${percent(prob1)}%.${prob1 > 0.01 && prob0 > 0.01 ? ` The sign of the Door 1 part is ${beta.re < 0 ? 'negative' : 'positive'}.` : ''}`
        : `The crosshair is tilted ${deg(theta)}° from the north pole and turned ${deg(phi)}° around; its distance from the target is ${level3Dist.toFixed(2)}.`) +
      ` Shields left: ${shields} of 3. Score ${score}.` +
      `${ready ? ' The state is ready for the breach.' : ''}` +
      `${gameState === 'failed' ? ' The alarm just tripped.' : gameState === 'game_over' ? ' All shields are gone, the run is over.' : gameState === 'level_complete' ? ' Stage cleared.' : gameState === 'victory' ? ' The heist is complete.' : ''}`,
    hint:
      level === 1
        ? 'Look at what the H key does to the door percentages.'
        : level === 2
          ? 'First get the 50/50 split, then change the sign of one part.'
          : 'Tilt the crosshair down from the north pole towards the equator, then turn it until it sits on the ring.',
  });

  return (
    <div style={{
      fontFamily: "'Space Grotesk', -apple-system, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }}>
      <div style={frameStyle(theme)}>
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

        <ArcadeHeader
          theme={theme}
          label={`STAGE ${level}/3`}
          tag="Simplified model"
          middle={<span style={{ fontFamily: RETRO, fontSize: '1.4rem', color: '#ffd23f' }}>★ {score}</span>}
        />

        {/* Shields, sound and rules */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <div role="img" aria-label={`${shields} of 3 shields left`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {[1, 2, 3].map((heart) => (
              <Heart
                key={heart}
                size={22}
                fill={heart <= shields ? '#ff5c8a' : 'transparent'}
                color={heart <= shields ? '#ff5c8a' : '#8f7bc9'}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="chip"
              onClick={() => setSoundEnabled(!soundEnabled)}
              aria-pressed={soundEnabled}
              aria-label={soundEnabled ? 'Mute sound' : 'Turn sound on'}
              style={{ padding: 0, width: 44, justifyContent: 'center' }}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button className="chip" onClick={() => setShowHandbook(true)}>
              <HelpCircle size={16} />
              <span>Rules</span>
            </button>
          </div>
        </div>

        <GameTitle
          title="⚡ Quantum Heist"
          story={
            (level === 1 && 'Level 1: The Dual-Door Motion Tracker') ||
            (level === 2 && 'Level 2: The Wave Phase Frequency Trap') ||
            'Level 3: The 3D Bloch Gyro Decryption'
          }
        />

        {/* Mission objective */}
        <div style={panelStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Eyebrow color={theme.accent}>MISSION OBJECTIVE</Eyebrow>
            <button className="chip" aria-expanded={hintActive} onClick={() => setHintActive(!hintActive)}>
              <Lightbulb size={16} />
              <span>{hintActive ? 'Hide' : 'Hint'}</span>
            </button>
          </div>

          <div style={{ fontSize: '0.88rem', color: '#f6f1ff', lineHeight: 1.45 }}>
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

          {hintActive && (
            <div style={{ marginTop: 10 }}>
              <Banner tone="warn">
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
              </Banner>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* INTERACTIVE ARCADE STAGE: LEVELS 1 & 2 (DOORS + SPRITE + LASER) */}
        {/* ============================================================== */}
        {level < 3 && (
          <div style={{
            background: 'radial-gradient(circle at 50% 20%, #4a26a0 0%, #1d0848 80%)',
            border: '2px solid rgba(255, 255, 255, 0.14)',
            borderRadius: 18,
            padding: '16px 12px 14px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Top Security Surveillance Turret */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative'
            }}>
              {/* Turret Body */}
              <div style={{
                background: '#4a2ea8',
                border: '2px solid #b9a6e8',
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
                background: '#24095a',
                border: '1px solid rgba(0, 210, 255, 0.3)',
                borderRadius: 10,
                padding: '8px 10px',
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
                    <line x1="0" y1="16" x2="280" y2="16" stroke="#4a2ea8" strokeWidth="1" strokeDasharray="3 3" />
                    
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
                background: prob0 > 0.4 ? 'rgba(0, 210, 255, 0.16)' : 'rgba(42, 15, 92, 0.9)',
                border: `2px ${prob0 > 0.4 ? 'solid' : 'dashed'} ${prob0 > 0.4 ? '#00d2ff' : '#6a4ec2'}`,
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
                  color: prob0 > 0.4 ? '#00d2ff' : '#b9a6e8',
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
                    <span style={{ fontSize: '0.65rem', color: '#8f7bc9' }}>EMPTY</span>
                  )}
                </div>

                {/* Percentage Presence Meter */}
                <div style={{
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  color: prob0 > 0.4 ? '#00d2ff' : '#ddd0fa',
                  marginTop: 4
                }}>
                  {(prob0 * 100).toFixed(0)}% PRESENCE
                </div>

                <div style={{ fontSize: '0.65rem', color: '#ddd0fa', marginTop: 2 }}>
                  Amplitude: <b>{alpha.re.toFixed(2)}</b>
                </div>
              </div>

              {/* DOOR 1 */}
              <div style={{
                background: prob1 > 0.4 ? 'rgba(255, 64, 129, 0.16)' : 'rgba(42, 15, 92, 0.9)',
                border: `2px ${prob1 > 0.4 ? 'solid' : 'dashed'} ${prob1 > 0.4 ? '#ff4081' : '#6a4ec2'}`,
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
                  color: prob1 > 0.4 ? '#ff4081' : '#b9a6e8',
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
                    <span style={{ fontSize: '0.65rem', color: '#8f7bc9' }}>EMPTY</span>
                  )}
                </div>

                {/* Percentage Presence Meter */}
                <div style={{
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  color: prob1 > 0.4 ? '#ff4081' : '#ddd0fa',
                  marginTop: 4
                }}>
                  {(prob1 * 100).toFixed(0)}% PRESENCE
                </div>

                <div style={{ fontSize: '0.65rem', color: '#ddd0fa', marginTop: 2 }}>
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
            background: 'radial-gradient(circle at center, #4a26a0 0%, #1d0848 80%)',
            border: '2px solid rgba(255, 255, 255, 0.14)',
            borderRadius: 18,
            padding: '14px',
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
                <span style={{ color: '#ddd0fa' }}>Aim Dist: </span>
                <b style={{ color: isLevel3Ready ? '#22c55e' : '#fbbf24' }}>
                  {level3Dist.toFixed(2)} {isLevel3Ready ? '✅ (LOCKED!)' : '(Steer closer)'}
                </b>
              </div>
              <div>
                <span style={{ color: '#ddd0fa' }}>Target: </span>
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
                  background: '#4a2ea8',
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
                    background: '#4a2ea8',
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
                  background: 'radial-gradient(circle, #00d2ff, #2a0f5c)',
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
                    background: '#4a2ea8',
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
                  background: '#4a2ea8',
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

        {/* Live objective status */}
        <Banner tone={ready ? 'good' : 'warn'} icon={ready ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          title={ready ? 'READY TO BREACH!' : 'NOT READY YET'}>
          {ready
            ? 'Target matched. Hit the breach button!'
            : level === 1
            ? 'Right now you are 100% in Door 0, so the alarm will fire.'
            : level === 2
            ? 'The phase is still positive (+). You need the negative phase |−⟩.'
            : 'The reticle is off target.'}
        </Banner>

        {/* Level feedback and story */}
        {feedback && (
          <Banner tone={gameState === 'failed' || gameState === 'game_over' ? 'bad' : 'good'}>
            {feedback}
          </Banner>
        )}

        {/* Gate cartridges */}
        {level < 3 && gameState === 'playing' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Eyebrow>HACK CARTRIDGES</Eyebrow>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Tap to apply a gate</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { key: 'H', name: '[H] KEY', sub: 'Split 50/50', cls: 'btn-sky', on: applyHadamard, pulse: level === 1 && !isLevel1Ready },
                { key: 'X', name: '[X] FLIP', sub: 'Swap 0 ↔ 1', cls: 'btn-pink', on: applyPauliX, pulse: false },
                { key: 'Z', name: '[Z] PHASE', sub: 'Flip (+ / -)', cls: 'btn-violet', on: applyPauliZ, pulse: level === 2 && isLevel1Ready && !isLevel2Ready },
              ].map((g) => (
                <button
                  key={g.key}
                  className={`btn ${g.cls}`}
                  onClick={g.on}
                  aria-label={`${g.name}: ${g.sub}`}
                  style={{
                    flexDirection: 'column', gap: 4, minHeight: 68, padding: '8px 2px',
                    animation: g.pulse ? 'pulseGlow 2s infinite' : 'none',
                  }}
                >
                  <span style={{ fontSize: '0.55rem' }}>{g.name}</span>
                  <span style={{ fontFamily: 'var(--font-family)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'none', letterSpacing: 0 }}>{g.sub}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Primary action */}
        <div>
          {gameState === 'playing' && (
            <button className={`btn ${ready ? 'btn-mint' : ''}`} onClick={handleBreach}>
              <span>{level === 3 ? 'Lock & decrypt' : 'Attempt breach'}</span>
            </button>
          )}

          {gameState === 'failed' && (
            <button className="btn btn-slate" onClick={resetLevel}>
              <RotateCcw size={18} />
              <span>Retry infiltration</span>
            </button>
          )}

          {gameState === 'game_over' && (
            <Banner tone="bad" title="SHIELDS DEPLETED!" center>
              <div style={{ marginBottom: 10 }}>Agent Q was captured. Restart the heist with full shields!</div>
              <button className="btn btn-pink" onClick={fullRestart}>Restart from stage 1</button>
            </Banner>
          )}

          {gameState === 'level_complete' && (
            <button
              className="btn btn-sky"
              onClick={() => {
                if (soundEnabled) sound.playClick();
                setLevel((l) => (l + 1) as any);
                resetLevel();
              }}
            >
              <span>Advance to stage {level + 1}</span>
              <ChevronRight size={18} />
            </button>
          )}

          {gameState === 'victory' && (
            <Banner tone="good" title="HEIST ACCOMPLISHED!" center>
              <div>Total score: <b>{score} pts</b></div>
              <div style={{ color: '#38c8ff', marginBottom: 10 }}>Badge unlocked: <b>Superposition Master</b></div>
              <button className="btn" onClick={fullRestart}>Replay heist</button>
            </Banner>
          )}
        </div>
      </div>

      {/* The Quantum Secret: why this works in real physics */}
      <div style={{ ...panelStyle, padding: 0, overflow: 'hidden' }}>
        <button
          onClick={() => setShowPhysicsBreakdown(!showPhysicsBreakdown)}
          aria-expanded={showPhysicsBreakdown}
          style={{
            width: '100%',
            minHeight: 48,
            padding: '12px 14px',
            background: 'transparent',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'var(--text-primary)',
            fontSize: '0.95rem',
            fontWeight: 700
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={18} color={theme.accent} />
            <span>The Quantum Physics Secret</span>
          </div>
          {showPhysicsBreakdown ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {showPhysicsBreakdown && (
          <div style={{
            padding: '0 14px 14px',
            fontSize: '0.88rem',
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
              fontSize: '0.88rem'
            }}>
              |ψ⟩ = (1/√2)|0⟩ + (1/√2)|1⟩
            </div>
            <p>
              By the Born rule, the chance of each door is the amplitude squared: |α|² = (1/√2)² = 0.5, or 50%.
              In Stage 2, the <b>[Z] gate</b> flips the sign (the phase) of the |1⟩ part. Waves with opposite signs cancel, and arranging that cancellation is the mechanism behind speed-ups in algorithms like Grover's and Shor's.
            </p>
            <HonestyTagBadge tag="Simplified model" />
          </div>
        )}
      </div>

      {showHandbook && (
        <ArcadeModal theme={theme} title="Hacker Handbook" onClose={() => setShowHandbook(false)} closeLabel="Got it, agent!">
          <div>
            <b style={{ color: '#38c8ff' }}>1. What is the goal?</b>
            <p>
              You are infiltrating a quantum vault. Classical security scanners can detect when you pick a single door (0 or 1). Use quantum gates to manipulate your qubit and bypass the defenses!
            </p>
          </div>
          <div>
            <b style={{ color: '#ff5c8a' }}>2. How to win Stage 1</b>
            <p>
              Click the <b>[H] KEY</b> to split into 50% Door 0 and 50% Door 1. The scanner cannot resolve a definite target. The banner turns green. Then hit <b>Attempt breach</b>!
            </p>
          </div>
          <div>
            <b style={{ color: '#c4b0ff' }}>3. How to win Stage 2</b>
            <p>
              Click <b>[H]</b>, then click <b>[Z]</b>. The [Z] gate inverts the phase, producing destructive interference that cancels the alarm frequency!
            </p>
          </div>
          <div>
            <b style={{ color: '#ffd23f' }}>4. How to win Stage 3</b>
            <p>
              Use the D-Pad to tilt the reticle down from the North Pole (|0⟩) to the Equator target ring (|+⟩)!
            </p>
          </div>
        </ArcadeModal>
      )}
    </div>
  );
};
