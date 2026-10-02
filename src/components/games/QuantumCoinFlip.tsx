import React, { useState } from 'react';
import { useProgress } from '../../hooks/useProgress';
import { HonestyTagBadge } from '../shared/HonestyTag';
import { sound } from '../../utils/audio';
import { 
  RotateCcw, 
  Sparkles, 
  Coins, 
  Lock, 
  Unlock,
  ChevronDown,
  ChevronUp,
  HelpCircle
} from 'lucide-react';

export const QuantumCoinFlip: React.FC = () => {
  const { completeGame } = useProgress();

  const [playerMode, setPlayerMode] = useState<'classical' | 'quantum'>('classical');
  const [round, setRound] = useState(1);
  const [aiScore, setAiScore] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);

  // Turn state:
  // 'ready' -> 'ai_step1' (H) -> 'player_turn' (X / I / H) -> 'ai_step2' (H) -> 'measured'
  const [turnState, setTurnState] = useState<'ready' | 'ai_step1' | 'player_turn' | 'ai_step2' | 'measured'>('ready');
  const [coinState, setCoinState] = useState<'HEADS' | 'TAILS' | 'SUPERPOSITION'>('HEADS');
  const [playerChoice, setPlayerChoice] = useState<'FLIP' | 'KEEP' | 'HADAMARD' | null>(null);
  const [aiDialogue, setAiDialogue] = useState<string>("Welcome, human! The penny starts on HEADS (|0⟩). We take turns manipulating it. Click 'START ROUND' to test your luck!");
  const [showSecretGuide, setShowSecretGuide] = useState(false);

  // Step-by-step round flow
  const startRound = () => {
    sound.playClick();
    setCoinState('HEADS');
    setPlayerChoice(null);
    setTurnState('ai_step1');
    setAiDialogue("Step 1 (Dr. Quantum): I am applying my secret move to the penny...");

    // AI plays Move 1: Hadamard [H]
    setTimeout(() => {
      sound.playGate();
      setCoinState('SUPERPOSITION');
      setTurnState('player_turn');
      setAiDialogue("Move 1 Complete! I applied the Hadamard [H] gate. The coin is now spinning in equal Superposition (50% Heads + 50% Tails). Your turn: Will you FLIP (X) or KEEP (I)?");
    }, 1100);
  };

  const handlePlayerMove = (move: 'FLIP' | 'KEEP' | 'HADAMARD') => {
    sound.playLaser();
    setPlayerChoice(move);
    setTurnState('ai_step2');

    if (move === 'FLIP') {
      setAiDialogue("Step 2 (You): You chose to FLIP (Pauli-X). You think you swapped Heads and Tails! Now watch my final Move 3...");
    } else if (move === 'KEEP') {
      setAiDialogue("Step 2 (You): You chose to KEEP (Identity). You left the coin untouched. Now watch my final Move 3...");
    } else {
      setAiDialogue("Step 2 (You): A QUANTUM MOVE?! You applied Hadamard [H] yourself! Let's see what happens...");
    }

    // AI plays Move 3: Hadamard [H]
    setTimeout(() => {
      sound.playGate();
      setAiDialogue("Step 3 (Dr. Quantum): I applied my final Hadamard [H] gate. Now collapsing the quantum state to measurement...");

      setTimeout(() => {
        // Measurement outcome
        if (playerMode === 'classical') {
          // Classical mode: H * X * H = I -> 100% HEADS (Dr. Quantum ALWAYS wins)
          sound.playAlarm();
          setCoinState('HEADS');
          setAiScore((s) => s + 1);
          setTurnState('measured');
          setRound((r) => r + 1);
          setAiDialogue("MEASUREMENT: HEADS (|0⟩)! I WIN AGAIN! Notice that whether you flipped or kept, the outcome was guaranteed to be Heads. Want to know why your flip did nothing?");
        } else {
          // Quantum mode
          if (move === 'HADAMARD') {
            sound.playSuccess();
            setCoinState('TAILS');
            setPlayerScore((s) => s + 1);
            setTurnState('measured');
            setRound((r) => r + 1);
            setAiDialogue("MEASUREMENT: TAILS (|1⟩)! INCREDIBLE! You used a quantum Hadamard gate to cancel out my superposition and forced Tails. YOU WIN! 🏆");
            completeGame('coin_flip', 'concept_qubits');
          } else {
            sound.playAlarm();
            setCoinState('HEADS');
            setAiScore((s) => s + 1);
            setTurnState('measured');
            setRound((r) => r + 1);
            setAiDialogue("MEASUREMENT: HEADS (|0⟩)! You are in Quantum Mode, but you played a classical move! Try using the cyan [H] HADAMARD button next time!");
          }
        }
      }, 1000);
    }, 1200);
  };

  const resetGame = () => {
    sound.playClick();
    setRound(1);
    setAiScore(0);
    setPlayerScore(0);
    setCoinState('HEADS');
    setPlayerChoice(null);
    setTurnState('ready');
    setAiDialogue("Game reset! The penny starts on HEADS (|0⟩). Can you discover the quantum strategy?");
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      fontFamily: "'Space Grotesk', -apple-system, sans-serif"
    }}>
      {/* Neon Cyber Arcade Cabinet Shell */}
      <div style={{
        background: 'linear-gradient(165deg, #0b0f2e 0%, #050716 100%)',
        border: '3px solid #8a3ffc',
        borderRadius: 20,
        padding: '16px',
        boxShadow: '0 0 35px rgba(138, 63, 252, 0.35), inset 0 0 45px rgba(0, 0, 0, 0.95)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* CRT Scanline Effect */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.28) 50%)',
          backgroundSize: '100% 4px',
          pointerEvents: 'none',
          zIndex: 4,
          opacity: 0.5
        }} />

        {/* Arcade Header HUD */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid rgba(138, 63, 252, 0.3)',
          paddingBottom: 10,
          marginBottom: 12,
          position: 'relative',
          zIndex: 6
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Coins size={16} color="#c084fc" />
            <span style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '0.6rem',
              color: '#c084fc'
            }}>
              ROUND {round}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setShowSecretGuide(!showSecretGuide)}
              style={{
                background: 'rgba(138, 63, 252, 0.18)',
                border: '1px solid #8a3ffc',
                color: '#c084fc',
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: '0.58rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <HelpCircle size={12} />
              <span>THE SECRET</span>
            </button>
            <HonestyTagBadge tag="Accurate" />
          </div>
        </div>

        {/* Title Header */}
        <div style={{ textAlign: 'center', marginBottom: 12, position: 'relative', zIndex: 6 }}>
          <h2 style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.01em',
            marginBottom: 3
          }}>
            🪙 The Quantum Penny Paradox
          </h2>
          <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            David Meyer's 1999 Game: Can a classical player ever beat a quantum computer at a coin toss?
          </p>
        </div>

        {/* ============================================================== */}
        {/* 1. SCOREBOARD: DR. QUANTUM VS PLAYER                           */}
        {/* ============================================================== */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: 10,
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(138, 63, 252, 0.25)',
          borderRadius: 14,
          padding: '10px 14px',
          marginBottom: 12,
          position: 'relative',
          zIndex: 6
        }}>
          {/* AI Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(244, 63, 94, 0.2)',
              border: '2px solid #f43f5e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem'
            }}>
              🤖
            </div>
            <div>
              <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 700 }}>
                DR. QUANTUM (AI)
              </div>
              <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#f43f5e' }}>
                {aiScore} WINS (Heads)
              </div>
            </div>
          </div>

          <span style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '0.68rem',
            color: '#64748b'
          }}>
            VS
          </span>

          {/* Player Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 700 }}>
                YOU (PLAYER)
              </div>
              <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#38bdf8' }}>
                {playerScore} WINS (Tails)
              </div>
            </div>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(56, 189, 248, 0.2)',
              border: '2px solid #38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem'
            }}>
              🧑‍💻
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. THE 3D QUANTUM COIN ARENA                                   */}
        {/* ============================================================== */}
        <div style={{
          background: 'radial-gradient(circle at 50% 50%, #1a1e50 0%, #07091c 85%)',
          border: '2px solid rgba(138, 63, 252, 0.45)',
          borderRadius: 18,
          padding: '24px 16px 18px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
          position: 'relative',
          overflow: 'hidden',
          zIndex: 6
        }}>
          {/* Subtle Rotating Orbit Ring when in Superposition */}
          {coinState === 'SUPERPOSITION' && (
            <div style={{
              position: 'absolute',
              width: 130,
              height: 130,
              borderRadius: '50%',
              border: '2px dashed rgba(0, 210, 255, 0.6)',
              animation: 'spin 6s linear infinite',
              pointerEvents: 'none'
            }} />
          )}

          {/* The Physical 3D Gold Quantum Coin */}
          <div style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: coinState === 'SUPERPOSITION'
              ? 'conic-gradient(from 180deg at 50% 50%, #00d2ff 0deg, #8a3ffc 120deg, #ff4081 240deg, #00d2ff 360deg)'
              : coinState === 'HEADS'
              ? 'radial-gradient(circle at 35% 35%, #fef08a 0%, #eab308 55%, #854d0e 100%)'
              : 'radial-gradient(circle at 35% 35%, #93c5fd 0%, #3b82f6 55%, #1e3a8a 100%)',
            border: '4px solid #fff',
            boxShadow: coinState === 'SUPERPOSITION'
              ? '0 0 35px rgba(0, 210, 255, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.5)'
              : coinState === 'HEADS'
              ? '0 0 25px rgba(250, 204, 21, 0.7), inset 0 0 15px rgba(255, 255, 255, 0.6)'
              : '0 0 25px rgba(59, 130, 246, 0.7), inset 0 0 15px rgba(255, 255, 255, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            animation: (turnState === 'ai_step1' || turnState === 'ai_step2') ? 'coinSpin3D 1s infinite linear' : 'none',
            transition: 'all 0.35s ease',
            position: 'relative'
          }}>
            {/* Embossed Dirac Quantum Notation */}
            <div style={{
              fontSize: coinState === 'SUPERPOSITION' ? '1.4rem' : '1.7rem',
              fontWeight: 900,
              color: coinState === 'SUPERPOSITION' ? '#fff' : coinState === 'HEADS' ? '#713f12' : '#1e3a8a',
              textShadow: '0 1px 2px rgba(255,255,255,0.6)',
              lineHeight: 1
            }}>
              {coinState === 'HEADS' && '|0⟩'}
              {coinState === 'TAILS' && '|1⟩'}
              {coinState === 'SUPERPOSITION' && '|+⟩'}
            </div>

            <div style={{
              fontSize: '0.62rem',
              fontWeight: 900,
              letterSpacing: '0.06em',
              color: coinState === 'SUPERPOSITION' ? '#fff' : coinState === 'HEADS' ? '#854d0e' : '#172554',
              marginTop: 2
            }}>
              {coinState === 'HEADS' && 'HEADS'}
              {coinState === 'TAILS' && 'TAILS'}
              {coinState === 'SUPERPOSITION' && '50/50'}
            </div>
          </div>

          {/* Current State Status Banner */}
          <div style={{
            marginTop: 14,
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '0.55rem',
            color: coinState === 'SUPERPOSITION' ? '#00d2ff' : coinState === 'HEADS' ? '#fbbf24' : '#60a5fa',
            textAlign: 'center',
            lineHeight: 1.4
          }}>
            {coinState === 'SUPERPOSITION'
              ? 'STATE: SUPERPOSITION (|0⟩ + |1⟩)/√2'
              : coinState === 'HEADS'
              ? 'STATE: |0⟩ (100% HEADS — AI TARGET)'
              : 'STATE: |1⟩ (100% TAILS — PLAYER TARGET)'}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. THE 4-STEP MATCH TIMELINE PIPELINE                          */}
        {/* ============================================================== */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 12,
          padding: '10px 8px',
          marginBottom: 12,
          position: 'relative',
          zIndex: 6
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
            padding: '0 6px'
          }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              Round Sequence:
            </span>
            <span style={{ fontSize: '0.65rem', color: '#c084fc', fontWeight: 600 }}>
              {turnState === 'ready' && 'Waiting to start'}
              {turnState === 'ai_step1' && 'AI playing Step 1...'}
              {turnState === 'player_turn' && 'YOUR TURN (Step 2)'}
              {turnState === 'ai_step2' && 'AI playing Step 3...'}
              {turnState === 'measured' && 'Round complete'}
            </span>
          </div>

          {/* 4 Interactive Nodes Track */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 4,
            position: 'relative'
          }}>
            {/* Step 1: Start */}
            <div style={{
              background: turnState === 'ready' ? 'rgba(0, 210, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${turnState === 'ready' ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: 8,
              padding: '6px 4px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.55rem', color: '#94a3b8' }}>START</div>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#fff' }}>|0⟩ Heads</div>
            </div>

            {/* Step 2: AI Hadamard 1 */}
            <div style={{
              background: turnState === 'ai_step1' || turnState === 'player_turn' ? 'rgba(138, 63, 252, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${turnState === 'ai_step1' || turnState === 'player_turn' ? '#8a3ffc' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: 8,
              padding: '6px 4px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.55rem', color: '#94a3b8' }}>1. AI MOVE</div>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#c084fc' }}>Hadamard [H]</div>
            </div>

            {/* Step 3: Player Move */}
            <div style={{
              background: turnState === 'player_turn' ? 'rgba(56, 189, 248, 0.25)' : playerChoice ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${turnState === 'player_turn' ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: 8,
              padding: '6px 4px',
              textAlign: 'center',
              animation: turnState === 'player_turn' ? 'pulseGlow 2s infinite' : 'none'
            }}>
              <div style={{ fontSize: '0.55rem', color: '#94a3b8' }}>2. YOU</div>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#38bdf8' }}>
                {playerChoice || 'Your Move'}
              </div>
            </div>

            {/* Step 4: AI Final & Measure */}
            <div style={{
              background: turnState === 'measured' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${turnState === 'measured' ? '#f43f5e' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: 8,
              padding: '6px 4px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.55rem', color: '#94a3b8' }}>3. AI + MEASURE</div>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#f43f5e' }}>
                {turnState === 'measured' ? coinState : 'Hadamard [H]'}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 4. DR. QUANTUM INTERACTIVE INTEL & DIALOGUE                   */}
        {/* ============================================================== */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.55)',
          border: '1px solid rgba(138, 63, 252, 0.35)',
          borderRadius: 12,
          padding: '10px 12px',
          marginBottom: 12,
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
          position: 'relative',
          zIndex: 6
        }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: 'linear-gradient(135deg, #f43f5e, #8a3ffc)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            flexShrink: 0
          }}>
            🤖
          </div>

          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '0.52rem',
              color: '#f43f5e',
              marginBottom: 4
            }}>
              DR. QUANTUM SAYS:
            </div>
            <div style={{ fontSize: '0.76rem', color: '#e2e8f0', lineHeight: 1.45 }}>
              {aiDialogue}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 5. PLAYER CONTROLS                                             */}
        {/* ============================================================== */}
        <div style={{ position: 'relative', zIndex: 6 }}>
          {turnState === 'ready' && (
            <button
              onClick={startRound}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #8a3ffc 0%, #6929c4 100%)',
                color: '#fff',
                border: '2px solid #fff',
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '0.72rem',
                boxShadow: '0 0 18px rgba(138, 63, 252, 0.6)'
              }}
            >
              🪙 START ROUND {round}
            </button>
          )}

          {turnState === 'player_turn' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '0.55rem',
                color: '#38bdf8',
                textAlign: 'center'
              }}>
                SELECT YOUR MOVE FOR STEP 2:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: playerMode === 'quantum' ? '1fr 1fr 1fr' : '1fr 1fr', gap: 8 }}>
                {/* Classical Flip (NOT / Pauli-X) */}
                <button
                  onClick={() => handlePlayerMove('FLIP')}
                  style={{
                    padding: '12px 6px',
                    borderRadius: 10,
                    background: 'linear-gradient(180deg, #ec4899 0%, #be185d 100%)',
                    color: '#fff',
                    border: '2px solid #fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    boxShadow: '0 4px 12px rgba(236, 72, 153, 0.4)'
                  }}
                >
                  <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.62rem' }}>
                    FLIP (X)
                  </span>
                  <span style={{ fontSize: '0.62rem', opacity: 0.9 }}>Swap Heads ↔ Tails</span>
                </button>

                {/* Classical Keep (Identity) */}
                <button
                  onClick={() => handlePlayerMove('KEEP')}
                  style={{
                    padding: '12px 6px',
                    borderRadius: 10,
                    background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: '#fff',
                    border: '2px solid #fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                  }}
                >
                  <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.62rem' }}>
                    KEEP (I)
                  </span>
                  <span style={{ fontSize: '0.62rem', opacity: 0.9 }}>Do Nothing</span>
                </button>

                {/* Quantum Hadamard Unlock */}
                {playerMode === 'quantum' && (
                  <button
                    onClick={() => handlePlayerMove('HADAMARD')}
                    style={{
                      padding: '12px 6px',
                      borderRadius: 10,
                      background: 'linear-gradient(180deg, #00d2ff 0%, #0284c7 100%)',
                      color: '#050714',
                      border: '2px solid #fff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 3,
                      boxShadow: '0 0 16px rgba(0, 210, 255, 0.7)'
                    }}
                  >
                    <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.62rem', fontWeight: 900 }}>
                      HADAMARD [H]
                    </span>
                    <span style={{ fontSize: '0.62rem', fontWeight: 800 }}>⚡ Quantum Move!</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {turnState === 'measured' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{
                display: 'flex',
                gap: 8
              }}>
                <button
                  onClick={startRound}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #8a3ffc 0%, #6929c4 100%)',
                    color: '#fff',
                    border: '2px solid #fff',
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '0.65rem'
                  }}
                >
                  PLAY ROUND {round}
                </button>

                <button
                  onClick={resetGame}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: '#1e293b',
                    color: '#94a3b8',
                    border: '1px solid #475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Reset Match"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* 6. MODE TOGGLE: UNLOCK QUANTUM POWERS                          */}
        {/* ============================================================== */}
        <div style={{
          marginTop: 14,
          paddingTop: 12,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 6
        }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
              Your Ruleset:
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: playerMode === 'quantum' ? '#00d2ff' : '#cbd5e1' }}>
              {playerMode === 'quantum' ? '⚡ Quantum Moves Enabled' : '🔒 Classical Player (Flips Only)'}
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setPlayerMode((m) => (m === 'classical' ? 'quantum' : 'classical'));
            }}
            style={{
              background: playerMode === 'quantum' ? 'rgba(0, 210, 255, 0.18)' : 'rgba(255, 255, 255, 0.08)',
              border: `1px solid ${playerMode === 'quantum' ? '#00d2ff' : '#64748b'}`,
              color: playerMode === 'quantum' ? '#00d2ff' : '#cbd5e1',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: '0.7rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            {playerMode === 'quantum' ? <Unlock size={14} /> : <Lock size={14} />}
            <span>{playerMode === 'quantum' ? 'Switch to Classical' : 'Unlock Quantum Mode!'}</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 7. WHY IT WORKS: STEP-BY-STEP CONCEPT DECODER                  */}
      {/* ============================================================== */}
      <div style={{
        background: 'var(--bg-surface)',
        borderRadius: 14,
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden'
      }}>
        <button
          onClick={() => setShowSecretGuide(!showSecretGuide)}
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
            <Sparkles size={16} color="var(--accent-purple)" />
            <span>Why Does Dr. Quantum ALWAYS Win Classically?</span>
          </div>
          {showSecretGuide ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showSecretGuide && (
          <div style={{
            padding: '0 14px 14px',
            fontSize: '0.76rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}>
            <p>
              In a normal classical coin toss, whoever flips last would have an advantage or a 50/50 shot.
              Here is why quantum mechanics completely shatters that logic:
            </p>

            <div style={{
              background: 'rgba(138, 63, 252, 0.08)',
              border: '1px solid rgba(138, 63, 252, 0.25)',
              borderRadius: 10,
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6
            }}>
              <div>
                <b style={{ color: '#c084fc' }}>1. Move 1 (Dr. Quantum plays Hadamard [H]):</b>
                <p>The coin starts at |0⟩ (Heads). Dr. Quantum applies H, rotating it into equal superposition:</p>
                <div style={{ fontFamily: 'monospace', color: '#00d2ff', marginTop: 2 }}>
                  |+⟩ = (|0⟩ + |1⟩) / √2
                </div>
              </div>

              <div>
                <b style={{ color: '#38bdf8' }}>2. Move 2 (Your Classical Move):</b>
                <p>
                  You think you are making a choice: Flip (X) or Keep (I).
                  <br />
                  <b>THE MIND-BENDING SECRET:</b> If you choose Flip (X), you swap |0⟩ and |1⟩. But look at the math:
                </p>
                <div style={{ fontFamily: 'monospace', color: '#fde047', marginTop: 2 }}>
                  X · (|0⟩ + |1⟩)/√2 = (|1⟩ + |0⟩)/√2 = ( |0⟩ + |1⟩)/√2
                </div>
                <p style={{ marginTop: 2 }}>
                  <b>Your flip did literally nothing to the quantum state!</b> Swapping two equal halves leaves the state completely unchanged.
                </p>
              </div>

              <div>
                <b style={{ color: '#f43f5e' }}>3. Move 3 (Dr. Quantum plays Hadamard [H] again):</b>
                <p>
                  Because Hadamard applied twice is the Identity (H × H = I):
                </p>
                <div style={{ fontFamily: 'monospace', color: '#86efac', marginTop: 2 }}>
                  H · |+⟩ = |0⟩ (100% HEADS!)
                </div>
                <p style={{ marginTop: 2 }}>
                  The coin collapses back to Heads with <b>100% mathematical certainty</b>!
                </p>
              </div>
            </div>

            {/* Circuit Diagram Visual */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: 8,
              padding: '10px',
              fontFamily: 'monospace',
              fontSize: '0.72rem',
              color: '#38bdf8',
              textAlign: 'center'
            }}>
              |0⟩ ───[ H ]───[ X or I ]───[ H ]───[ MEASURE ] ───→ |0⟩ (HEADS!)
            </div>

            <p style={{ color: '#cbd5e1' }}>
              💡 <b>How to Beat Dr. Quantum:</b> Click <b>'Unlock Quantum Mode'</b> above. When you play the <b>[H] Hadamard</b> gate on Move 2, you break his circuit and force the outcome to Tails (|1⟩)!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
