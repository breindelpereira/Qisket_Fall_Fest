import React, { useState } from 'react';
import { useProgress } from '../../hooks/useProgress';
import { useActivityReport } from '../../hooks/useActivityReport';
import { ArcadeHeader, ArcadeModal, Banner, Eyebrow, GameTitle } from '../shared/Arcade';
import { THEMES, RETRO, frameStyle, panelStyle, stageStyle } from '../shared/arcadeTheme';
import { sound } from '../../utils/audio';
import { Complex } from '../../core/circuit';
import { afterScan, matchProbability, MATCH_AT, slipsThrough } from '../../core/games/stealth';
import { 
  Sparkles, 
  ShieldAlert, 
  ChevronRight, 
  Lightbulb,
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

  // The chance the laser finds the agent in the slot's state: the Born rule, |<slot|agent>|^2
  const stealthProb = activeCheckpoint ? matchProbability(alpha, beta, activeCheckpoint.requiredState) : 1;
  const isAligned = stealthProb > MATCH_AT;

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

    // The laser measures the agent: they slip through with the Born-rule chance (certain when the stance matches), and
    // afterwards they are in the slot's state, or in the state that could never have passed
    const slipped = slipsThrough(stealthProb);
    const [afterA, afterB] = afterScan(activeCheckpoint.requiredState, slipped);
    setAlpha(afterA);
    setBeta(afterB);

    if (slipped) {
      if (soundEnabled) sound.playSuccess();
      setScore((s) => s + (isAligned ? 350 : 250));

      const nextStep = currentStep + 1;
      if (nextStep >= currentSectorCheckpoints.length) {
        if (sector === 3) {
          setGameState('victory');
          setFeedback('MISSION ACCOMPLISHED! Agent Schrödinger slipped past all laser bases and secured the Quantum Drive!');
          completeGame('schrodingers_stealth', 'concept_measurement');
        } else {
          setGameState('sector_cleared');
          setFeedback(`SECTOR ${sector} CLEARED! Perfect alignment—zero wave function collapse!`);
        }
      } else {
        setCurrentStep(nextStep);
        setGameState('checkpoint_passed');
        setFeedback(
          isAligned
            ? `CLEARED CHECKPOINT ${currentStep + 1}! You slipped through the slot undetected. Next laser ahead!`
            : `LUCKY! The laser measured you and found you in the slot's state, a ${Math.round(stealthProb * 100)}% chance. Next laser ahead!`,
        );
      }
    } else {
      // The measurement found the agent in the other state: the wave function collapsed and the alarm goes off
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

  // what the AI tutor is told if the learner asks about this game: the screen, never the solution
  useActivityReport({
    id: 'schrodingers_stealth',
    status: gameState === 'victory' ? 'finished' : 'playing',
    step: `Sector ${sector} of 3, checkpoint ${currentStep + 1} of ${currentSectorCheckpoints.length}: ${activeCheckpoint.name}`,
    mission: `Get through ${activeCheckpoint.name} by matching the slot.`,
    state:
      `The slot is ${activeCheckpoint.slotName}, watched by the ${activeCheckpoint.laserTitle}. The agent's stance is ${currentStance.name}, ` +
      `${isAligned ? 'a match (100% stealth)' : `a ${Math.round(stealthProb * 100)}% chance to match`}. Alarm ${alarmLevel}%.` +
      `${gameState === 'game_over' ? ' The alarm reached 100%, so the run is over.' : gameState === 'sector_cleared' ? ' Sector cleared.' : gameState === 'alarm_alert' ? ' The laser just collapsed the agent and raised the alarm.' : gameState === 'victory' ? ' Mission accomplished.' : ''}`,
    hint: activeCheckpoint.instruction,
  });

  const theme = THEMES.mint;
  const pulseH = !isAligned && ((activeCheckpoint.basis === 'X' && currentStance.shape === '|') || (activeCheckpoint.basis === 'Z' && currentStance.shape === '/'));
  const pulseX = !isAligned && activeCheckpoint.requiredState === '1' && currentStance.shape === '|';
  const pulseZ = !isAligned && activeCheckpoint.requiredState === '-' && currentStance.shape === '/';
  const alarmColor = alarmLevel > 60 ? '#ff5c8a' : alarmLevel > 30 ? '#ffd23f' : '#2ee6a6';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      fontFamily: "'Space Grotesk', -apple-system, sans-serif"
    }}>
      <div style={frameStyle(theme)}>
        <ArcadeHeader
          theme={theme}
          label={`SECTOR ${sector}/3`}
          tag="Accurate"
          middle={<span style={{ fontFamily: RETRO, fontSize: '1.4rem', color: '#ffd23f' }}>★ {score}</span>}
        />

        {/* Sound and rules */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            className="chip"
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? 'Mute sound' : 'Turn sound on'}
            style={{ padding: 0, width: 44, justifyContent: 'center' }}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button className="chip" onClick={() => setShowHandbook(!showHandbook)}>
            <Lightbulb size={16} />
            <span>Rules</span>
          </button>
        </div>

        <GameTitle
          title="🐾 Schrödinger's Stealth"
          story="Slip through the lasers without collapsing your quantum state."
        />

        {/* The simple keyhole analogy */}
        <div style={panelStyle}>
          <button
            onClick={() => setShowAnalogy(!showAnalogy)}
            aria-expanded={showAnalogy}
            style={{
              width: '100%',
              minHeight: 44,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'transparent',
              color: theme.accent,
              fontSize: '0.88rem',
              fontWeight: 800,
              padding: 0,
              textAlign: 'left',
              gap: 8
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lightbulb size={18} />
              <span>The simple rule: match the keyhole!</span>
            </div>
            {showAnalogy ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showAnalogy && (
            <div style={{ marginTop: 8, fontSize: '0.88rem', color: '#f1eaff', lineHeight: 1.45 }}>
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

        {/* The tactical corridor arena */}
        <div style={{
          ...stageStyle,
          padding: '16px 12px 14px',
          position: 'relative',
          overflow: 'hidden'
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

        {/* Alarm detection meter */}
        <div style={panelStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={18} color={alarmColor} />
              <Eyebrow color={alarmColor}>ALARM METER</Eyebrow>
            </div>
            <span style={{ fontFamily: RETRO, fontSize: '1.5rem', color: alarmLevel > 60 ? '#ff5c8a' : '#fff', lineHeight: 1 }}>
              {alarmLevel}%
            </span>
          </div>

          <div className="xp-track" role="progressbar" aria-label="Alarm level" aria-valuenow={alarmLevel} aria-valuemin={0} aria-valuemax={100}>
            <div style={{
              width: `${alarmLevel}%`,
              height: '100%',
              borderRadius: 999,
              background: alarmColor,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Narrative feedback */}
        {feedback && (
          <Banner tone={gameState === 'game_over' || gameState === 'alarm_alert' ? 'bad' : 'info'}>
            {feedback}
          </Banner>
        )}

        {/* Quantum utility belt */}
        {gameState !== 'game_over' && gameState !== 'victory' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Eyebrow>YOUR GADGETS</Eyebrow>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Tap to rotate your stance</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { name: '[H] TILT', sub: 'Vertical ↔ 45°', cls: 'btn-sky', on: applyHadamard, pulse: pulseH },
                { name: '[X] FLIP', sub: 'Vert ↔ Horiz', cls: 'btn-pink', on: applyPauliX, pulse: pulseX },
                { name: '[Z] PHASE', sub: 'Flip / ↔ \\', cls: 'btn-violet', on: applyPauliZ, pulse: pulseZ },
              ].map((g) => (
                <button
                  key={g.name}
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
          {(gameState === 'playing' || gameState === 'checkpoint_passed' || gameState === 'alarm_alert') && (
            <button className={`btn ${isAligned ? 'btn-mint' : ''}`} onClick={advanceThroughCheckpoint}>
              <Footprints size={18} />
              <span>{isAligned ? 'Slip through (100% stealth)' : 'Risk passage (collapse danger!)'}</span>
            </button>
          )}

          {gameState === 'sector_cleared' && (
            <button className="btn btn-sky" onClick={nextSector}>
              <span>Advance to sector {sector + 1}</span>
              <ChevronRight size={18} />
            </button>
          )}

          {gameState === 'game_over' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn btn-pink" onClick={restartSector}>Retry current sector</button>
              <button className="btn btn-slate" onClick={fullRestart}>Restart from sector 1</button>
            </div>
          )}

          {gameState === 'victory' && (
            <Banner tone="good" title="VAULT CONQUERED!" center>
              <div>Total score: <b>{score} pts</b></div>
              <div style={{ color: '#38c8ff', marginBottom: 10 }}>Badge unlocked: <b>Master of Measurement Bases</b></div>
              <button className="btn" onClick={fullRestart}>Play again</button>
            </Banner>
          )}
        </div>
      </div>

      {/* The quantum physics behind it */}
      <div style={{ ...panelStyle, padding: 0, overflow: 'hidden' }}>
        <button
          onClick={() => setShowPhysics(!showPhysics)}
          aria-expanded={showPhysics}
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
            fontWeight: 700,
            textAlign: 'left',
            gap: 8
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={18} color={theme.accent} />
            <span>The real physics: why observing collapses the wave</span>
          </div>
          {showPhysics ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showPhysics && (
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
              This idea sits at the heart of <b>Quantum Key Distribution (BB84)</b>: an eavesdropper who guesses the wrong basis disturbs the qubit, and the sender and receiver notice the extra errors when they compare a sample of their bits.
            </p>
          </div>
        )}
      </div>

      {showHandbook && (
        <ArcadeModal theme={theme} title="HQ Mission Rules" onClose={() => setShowHandbook(false)}>
          <div>
            <b style={{ color: '#38c8ff' }}>1. The rule</b>
            <p>
              Each laser scanner has a specific angle (slot). If your quantum stance matches the slot, you have <b>100% stealth</b> and slip right through.
            </p>
          </div>
          <div>
            <b style={{ color: '#ff5c8a' }}>2. The tools</b>
            <ul style={{ paddingLeft: 16, marginTop: 4 }}>
              <li><b>[H] TILT:</b> Rotates between Vertical (|) and 45° Diagonal (/).</li>
              <li><b>[X] FLIP:</b> Swaps between Vertical (|) and Horizontal (—).</li>
              <li><b>[Z] PHASE:</b> Flips between positive diagonal (/) and negative diagonal (\).</li>
            </ul>
          </div>
          <div>
            <b style={{ color: '#ffd23f' }}>3. How to win</b>
            <p>
              Look at the <b>Scanner Keyhole</b> box in the arena. Tap the pulsing gadget until <b>Your Stance</b> matches the keyhole. When it says <b>100% stealth</b>, hit the button to advance!
            </p>
          </div>
        </ArcadeModal>
      )}
    </div>
  );
};
