import React, { useState } from 'react';
import { useProgress } from '../../hooks/useProgress';
import { HonestyTagBadge } from '../shared/HonestyTag';
import { sound } from '../../utils/audio';
import { 
  RotateCcw, 
  Sparkles, 
  Coins, 
  Bot, 
  User, 
  Lock, 
  Unlock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const QuantumCoinFlip: React.FC = () => {
  const { completeGame } = useProgress();

  const [playerMode, setPlayerMode] = useState<'classical' | 'quantum'>('classical');
  const [round, setRound] = useState(1);
  const [aiScore, setAiScore] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);

  // Turn tracking: 'ready' -> 'ai_step1' -> 'player_turn' -> 'ai_step2' -> 'measured'
  const [turnState, setTurnState] = useState<'ready' | 'player_turn' | 'flipping' | 'measured'>('ready');
  const [coinState, setCoinState] = useState<'HEADS' | 'TAILS' | 'SUPERPOSITION'>('HEADS');
  const [playerMove, setPlayerMove] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('Coin starts on HEADS (|0⟩). Click START ROUND to face Dr. Quantum!');
  const [showSecret, setShowSecret] = useState(false);

  const startRound = () => {
    sound.playClick();
    setCoinState('HEADS');
    setPlayerMove(null);
    setMessage('Dr. Quantum makes secret Move 1...');
    setTurnState('flipping');

    // AI Move 1 (Hadamard gate in quantum)
    setTimeout(() => {
      sound.playGate();
      setCoinState('SUPERPOSITION');
      setMessage('Dr. Quantum played! Coin is now in a mysterious state. YOUR TURN: Choose your move!');
      setTurnState('player_turn');
    }, 800);
  };

  const handlePlayerMove = (move: 'FLIP' | 'KEEP' | 'HADAMARD') => {
    sound.playLaser();
    setPlayerMove(move);
    setTurnState('flipping');
    setMessage(`You chose: ${move}! Now Dr. Quantum makes the final move...`);

    setTimeout(() => {
      // AI Move 2
      sound.playGate();
      setMessage('Dr. Quantum plays Move 3! Measuring the quantum coin...');

      setTimeout(() => {
        // Measurement outcome
        if (playerMode === 'classical') {
          // In classical mode, Dr. Quantum ALWAYS wins (H * X * H = I -> Heads)
          sound.playAlarm();
          setCoinState('HEADS');
          setAiScore((s) => s + 1);
          setMessage('OUTCOME: HEADS! Dr. Quantum WINS AGAIN! How does he keep winning 100% of the time?');
          setTurnState('measured');
          setRound((r) => r + 1);
        } else {
          // Quantum mode: Player used Hadamard or custom gate
          if (move === 'HADAMARD') {
            sound.playSuccess();
            setCoinState('TAILS');
            setPlayerScore((s) => s + 1);
            setMessage('OUTCOME: TAILS! YOU OUTSMARTED DR. QUANTUM WITH A QUANTUM MOVE! 🏆');
            completeGame('coin_flip', 'concept_qubits');
          } else {
            sound.playAlarm();
            setCoinState('HEADS');
            setAiScore((s) => s + 1);
            setMessage('OUTCOME: HEADS! Dr. Quantum wins! Try using a quantum gate next round!');
          }
          setTurnState('measured');
          setRound((r) => r + 1);
        }
      }, 900);
    }, 1000);
  };

  const resetGame = () => {
    sound.playClick();
    setRound(1);
    setAiScore(0);
    setPlayerScore(0);
    setCoinState('HEADS');
    setPlayerMove(null);
    setTurnState('ready');
    setMessage('Coin starts on HEADS (|0⟩). Click START ROUND to challenge Dr. Quantum!');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      fontFamily: "'Space Grotesk', -apple-system, sans-serif"
    }}>
      {/* Neon Cyber Arcade Shell */}
      <div style={{
        background: 'linear-gradient(165deg, #090e24 0%, #040612 100%)',
        border: '3px solid #8a3ffc',
        borderRadius: 20,
        padding: '16px',
        boxShadow: '0 0 35px rgba(138, 63, 252, 0.35), inset 0 0 40px rgba(0, 0, 0, 0.95)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Header HUD */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid rgba(138, 63, 252, 0.3)',
          paddingBottom: 10,
          marginBottom: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Coins size={18} color="#8a3ffc" />
            <span style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '0.62rem',
              color: '#c084fc'
            }}>
              ROUND {round}
            </span>
          </div>

          <HonestyTagBadge tag="Accurate" />
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <h2 style={{
            fontSize: '1.1rem',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.01em',
            marginBottom: 2
          }}>
            🪙 The Quantum Penny Paradox
          </h2>
          <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            David Meyer's famous 1999 quantum game: Can a classical player ever beat a quantum computer?
          </p>
        </div>

        {/* Scoreboard Arena */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: 8,
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 12,
          padding: '10px 14px',
          marginBottom: 12
        }}>
          {/* AI Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(244, 63, 94, 0.2)',
              border: '1px solid #f43f5e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={18} color="#f43f5e" />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>DR. QUANTUM (AI)</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f43f5e' }}>
                {aiScore} WINS (Heads)
              </div>
            </div>
          </div>

          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.7rem', color: '#64748b' }}>
            VS
          </span>

          {/* Player Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>YOU (PLAYER)</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#38bdf8' }}>
                {playerScore} WINS (Tails)
              </div>
            </div>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(56, 189, 248, 0.2)',
              border: '1px solid #38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={18} color="#38bdf8" />
            </div>
          </div>
        </div>

        {/* 3D Coin Table Stage */}
        <div style={{
          background: 'radial-gradient(circle at 50% 50%, #171d47 0%, #070919 80%)',
          border: '2px solid rgba(138, 63, 252, 0.4)',
          borderRadius: 16,
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
          position: 'relative'
        }}>
          {/* Animated Coin */}
          <div style={{
            width: 86,
            height: 86,
            borderRadius: '50%',
            background: coinState === 'SUPERPOSITION'
              ? 'conic-gradient(from 0deg, #00d2ff, #8a3ffc, #ff4081, #00d2ff)'
              : 'radial-gradient(circle, #fde047 30%, #eab308 70%, #a16207 100%)',
            border: '4px solid #fff',
            boxShadow: coinState === 'SUPERPOSITION'
              ? '0 0 25px rgba(0, 210, 255, 0.8)'
              : '0 0 20px rgba(250, 204, 21, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: coinState === 'SUPERPOSITION' ? '#fff' : '#713f12',
            fontWeight: 900,
            fontSize: coinState === 'SUPERPOSITION' ? '0.72rem' : '1.4rem',
            letterSpacing: '0.04em',
            animation: turnState === 'flipping' ? 'coinSpin3D 1s infinite linear' : 'none',
            transition: 'all 0.3s ease'
          }}>
            {coinState === 'HEADS' && 'HEADS'}
            {coinState === 'TAILS' && 'TAILS'}
            {coinState === 'SUPERPOSITION' && '(|0⟩+|1⟩)/√2'}
          </div>

          {/* Current Coin State Readout */}
          <div style={{
            marginTop: 12,
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '0.55rem',
            color: coinState === 'SUPERPOSITION' ? '#00d2ff' : '#fbbf24'
          }}>
            {coinState === 'SUPERPOSITION'
              ? 'STATE: SUPERPOSITION (50% H + 50% T)'
              : `STATE: |${coinState === 'HEADS' ? '0' : '1'}⟩ (${coinState})`}
          </div>
        </div>

        {/* Narrative Banner */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 10,
          padding: '10px 12px',
          fontSize: '0.76rem',
          lineHeight: 1.45,
          color: '#e2e8f0',
          marginBottom: 12,
          textAlign: 'center'
        }}>
          {message}
        </div>

        {/* Interactive Player Controls */}
        <div>
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
                boxShadow: '0 0 16px rgba(138, 63, 252, 0.5)'
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
                textAlign: 'center',
                marginBottom: 2
              }}>
                SELECT YOUR MOVE:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: playerMode === 'quantum' ? '1fr 1fr 1fr' : '1fr 1fr', gap: 8 }}>
                {/* Classical Flip (Pauli-X) */}
                <button
                  onClick={() => handlePlayerMove('FLIP')}
                  style={{
                    padding: '12px 8px',
                    borderRadius: 10,
                    background: 'linear-gradient(180deg, #ec4899 0%, #be185d 100%)',
                    color: '#fff',
                    border: '2px solid #fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3
                  }}
                >
                  <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.62rem' }}>
                    FLIP (X)
                  </span>
                  <span style={{ fontSize: '0.62rem', opacity: 0.9 }}>Invert Coin</span>
                </button>

                {/* Classical Keep (Identity) */}
                <button
                  onClick={() => handlePlayerMove('KEEP')}
                  style={{
                    padding: '12px 8px',
                    borderRadius: 10,
                    background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: '#fff',
                    border: '2px solid #fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3
                  }}
                >
                  <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.62rem' }}>
                    KEEP (I)
                  </span>
                  <span style={{ fontSize: '0.62rem', opacity: 0.9 }}>Leave Untouched</span>
                </button>

                {/* Quantum Hadamard Unlock */}
                {playerMode === 'quantum' && (
                  <button
                    onClick={() => handlePlayerMove('HADAMARD')}
                    style={{
                      padding: '12px 8px',
                      borderRadius: 10,
                      background: 'linear-gradient(180deg, #00d2ff 0%, #0284c7 100%)',
                      color: '#050714',
                      border: '2px solid #fff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 3,
                      boxShadow: '0 0 14px rgba(0, 210, 255, 0.6)'
                    }}
                  >
                    <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.62rem', fontWeight: 900 }}>
                      HADAMARD [H]
                    </span>
                    <span style={{ fontSize: '0.62rem', fontWeight: 700 }}>Quantum Move!</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {turnState === 'measured' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {playerMove && (
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center' }}>
                  Your Move: <b style={{ color: '#00d2ff' }}>{playerMove}</b> | AI Result: <b style={{ color: '#fbbf24' }}>{coinState}</b>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
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
                    fontSize: '0.62rem'
                  }}
                >
                  PLAY AGAIN
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

        {/* Mode Switcher: Unlock Quantum Powers */}
        <div style={{
          marginTop: 14,
          paddingTop: 12,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Mode:{' '}
            <b style={{ color: playerMode === 'quantum' ? '#00d2ff' : '#cbd5e1' }}>
              {playerMode === 'quantum' ? '⚡ Quantum Enabled' : '🔒 Classical Player'}
            </b>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setPlayerMode((m) => (m === 'classical' ? 'quantum' : 'classical'));
            }}
            style={{
              background: playerMode === 'quantum' ? 'rgba(0, 210, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)',
              border: `1px solid ${playerMode === 'quantum' ? '#00d2ff' : '#64748b'}`,
              color: playerMode === 'quantum' ? '#00d2ff' : '#94a3b8',
              borderRadius: 8,
              padding: '6px 10px',
              fontSize: '0.68rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            {playerMode === 'quantum' ? <Unlock size={12} /> : <Lock size={12} />}
            <span>{playerMode === 'quantum' ? 'Disable Quantum' : 'Unlock Quantum Gate!'}</span>
          </button>
        </div>
      </div>

      {/* Explanatory Quantum Secret Card */}
      <div style={{
        background: 'var(--bg-surface)',
        borderRadius: 14,
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden'
      }}>
        <button
          onClick={() => setShowSecret(!showSecret)}
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
            <span>Why Does Dr. Quantum Always Win?</span>
          </div>
          {showSecret ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showSecret && (
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
              In classical probability, a coin flip gives you a 50/50 shot. But Dr. Quantum uses the <b>David Meyer Quantum Penny Flip algorithm</b>:
            </p>
            <ol style={{ paddingLeft: 18 }}>
              <li>
                <b>Move 1 (AI):</b> Dr. Quantum applies Hadamard [H] to |0⟩, creating |+⟩ = (|0⟩ + |1⟩)/√2.
              </li>
              <li>
                <b>Move 2 (You):</b> If you choose Flip (X), X(|0⟩ + |1⟩)/√2 = (|1⟩ + |0⟩)/√2 = |+⟩. <b>Your flip does nothing to the superposition!</b>
              </li>
              <li>
                <b>Move 3 (AI):</b> Dr. Quantum applies Hadamard [H] again. Since H × H = I, the state becomes |0⟩ (Heads) with <b>100% certainty</b>!
              </li>
            </ol>
            <p>
              This is the quintessential demonstration of why <b>Quantum Game Theory</b> breaks classical limits!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
