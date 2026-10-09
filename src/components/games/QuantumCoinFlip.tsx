import React, { useState } from 'react';
import { useProgress } from '../../hooks/useProgress';
import { useActivityReport } from '../../hooks/useActivityReport';
import { ArcadeHeader, Eyebrow, GameTitle } from '../shared/Arcade';
import { THEMES, PIXEL, RETRO, frameStyle, panelStyle, stageStyle } from '../shared/arcadeTheme';
import { sound } from '../../utils/audio';
import { 
  RotateCcw, 
  Sparkles, 
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

  // Turn state:
  // 'ready' -> 'ai_step1' (H) -> 'player_turn' (X / I / Z) -> 'ai_step2' (H) -> 'measured'
  // Z is the winning quantum move: it turns |+> into |->, and the final H turns |-> into |1>. (H as the player's move would
  // take |+> to |0>, and the final H would bring it back to |+>, a 50/50 coin.)
  const [turnState, setTurnState] = useState<'ready' | 'ai_step1' | 'player_turn' | 'ai_step2' | 'measured'>('ready');
  const [coinState, setCoinState] = useState<'HEADS' | 'TAILS' | 'SUPERPOSITION'>('HEADS');
  const [playerChoice, setPlayerChoice] = useState<'FLIP' | 'KEEP' | 'PHASE' | null>(null);
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

  const handlePlayerMove = (move: 'FLIP' | 'KEEP' | 'PHASE') => {
    sound.playLaser();
    setPlayerChoice(move);
    setTurnState('ai_step2');

    if (move === 'FLIP') {
      setAiDialogue("Step 2 (You): You chose to FLIP (Pauli-X). You think you swapped Heads and Tails! Now watch my final Move 3...");
    } else if (move === 'KEEP') {
      setAiDialogue("Step 2 (You): You chose to KEEP (Identity). You left the coin untouched. Now watch my final Move 3...");
    } else {
      setAiDialogue("Step 2 (You): A QUANTUM MOVE?! You applied a phase flip [Z] yourself! It changes the sign between the two halves, something no flip can do. Let's see what happens...");
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
          if (move === 'PHASE') {
            sound.playSuccess();
            setCoinState('TAILS');
            setPlayerScore((s) => s + 1);
            setTurnState('measured');
            setRound((r) => r + 1);
            setAiDialogue("MEASUREMENT: TAILS (|1⟩)! INCREDIBLE! Your phase flip turned |+⟩ into |−⟩, so my last Hadamard sent the coin to Tails instead of back to Heads. YOU WIN! 🏆");
            completeGame('coin_flip', 'concept_qubits');
          } else {
            sound.playAlarm();
            setCoinState('HEADS');
            setAiScore((s) => s + 1);
            setTurnState('measured');
            setRound((r) => r + 1);
            setAiDialogue("MEASUREMENT: HEADS (|0⟩)! You are in Quantum Mode, but you played a classical move! Try the new [Z] PHASE FLIP button next time!");
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

  // what the AI tutor is told if the learner asks about this game: the screen, never the winning move
  useActivityReport({
    id: 'coin_flip',
    status: playerScore > 0 ? 'finished' : 'playing',
    step: `Round ${round}: ${turnState === 'ready' ? 'not started' : turnState === 'player_turn' ? "the learner's move" : turnState === 'measured' ? 'round over' : "Dr. Quantum's move"}`,
    mission: 'Dr. Quantum wins if the coin lands on Heads and the learner wins on Tails.',
    state:
      `Mode: ${playerMode === 'quantum' ? 'quantum moves unlocked' : 'classical, only flip and keep'}. Score: Dr. Quantum ${aiScore}, the learner ${playerScore}. ` +
      `The coin is ${coinState === 'SUPERPOSITION' ? 'in an equal superposition' : coinState.toLowerCase()}.${playerChoice ? ` The learner played ${playerChoice.toLowerCase()}.` : ''} ` +
      `Dr. Quantum just said: "${aiDialogue}"`,
    hint:
      playerMode === 'classical'
        ? 'No classical move can beat Dr. Quantum. Look at the Unlock button: quantum mode adds a move that classical mode lacks.'
        : 'The extra quantum move does something to the superposition that a flip cannot do.',
  });

  const theme = THEMES.violet;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      fontFamily: "'Space Grotesk', -apple-system, sans-serif"
    }}>
      <div style={frameStyle(theme)}>
        <ArcadeHeader theme={theme} label={`ROUND ${round}`} tag="Accurate" />

        <GameTitle
          title="🪙 Quantum Penny Paradox"
          story="David Meyer's 1999 game: can a classical player ever beat a quantum computer at a coin toss?"
        />

        {/* Scoreboard: Dr. Quantum vs player */}
        <div style={{ ...panelStyle, display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>🤖 Dr. Quantum</div>
            <div style={{ fontFamily: RETRO, fontSize: '1.7rem', color: '#ff5c8a', lineHeight: 1.1 }}>{aiScore} <span style={{ fontSize: '1rem' }}>Heads</span></div>
          </div>
          <span style={{ fontFamily: PIXEL, fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>VS</span>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>You 🧑‍💻</div>
            <div style={{ fontFamily: RETRO, fontSize: '1.7rem', color: '#38c8ff', lineHeight: 1.1 }}>{playerScore} <span style={{ fontSize: '1rem' }}>Tails</span></div>
          </div>
        </div>

        {/* The quantum coin arena */}
        <div style={{
          ...stageStyle,
          padding: '24px 16px 18px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Orbit ring while in superposition */}
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

        {/* Round sequence */}
        <div style={panelStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Eyebrow>ROUND SEQUENCE</Eyebrow>
            <span style={{ fontSize: '0.78rem', color: '#c4b0ff', fontWeight: 700 }}>
              {turnState === 'ready' && 'Waiting to start'}
              {turnState === 'ai_step1' && 'AI playing step 1...'}
              {turnState === 'player_turn' && 'Your turn (step 2)'}
              {turnState === 'ai_step2' && 'AI playing step 3...'}
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
              <div style={{ fontSize: '0.55rem', color: '#ddd0fa' }}>START</div>
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
              <div style={{ fontSize: '0.55rem', color: '#ddd0fa' }}>1. AI MOVE</div>
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
              <div style={{ fontSize: '0.55rem', color: '#ddd0fa' }}>2. YOU</div>
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
              <div style={{ fontSize: '0.55rem', color: '#ddd0fa' }}>3. AI + MEASURE</div>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#f43f5e' }}>
                {turnState === 'measured' ? coinState : 'Hadamard [H]'}
              </div>
            </div>
          </div>
        </div>

        {/* Dr. Quantum speech */}
        <div style={{ ...panelStyle, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #ff5c8a, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            flexShrink: 0
          }}>
            🤖
          </div>
          <div style={{ flex: 1 }}>
            <Eyebrow color="#ff5c8a">DR. QUANTUM SAYS</Eyebrow>
            <div style={{ fontSize: '0.9rem', color: '#f6f1ff', lineHeight: 1.45, marginTop: 6 }} aria-live="polite">
              {aiDialogue}
            </div>
          </div>
        </div>

        {/* Player controls */}
        <div>
          {turnState === 'ready' && (
            <button className="btn btn-violet" onClick={startRound}>
              <span>🪙 Start round {round}</span>
            </button>
          )}

          {turnState === 'player_turn' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ textAlign: 'center' }}><Eyebrow color="#38c8ff">SELECT YOUR MOVE FOR STEP 2</Eyebrow></div>

              <div style={{ display: 'grid', gridTemplateColumns: playerMode === 'quantum' ? '1fr 1fr 1fr' : '1fr 1fr', gap: 8 }}>
                <button className="btn btn-pink" onClick={() => handlePlayerMove('FLIP')} style={{ flexDirection: 'column', gap: 4, minHeight: 68, padding: '8px 2px' }}>
                  <span style={{ fontSize: '0.58rem' }}>FLIP (X)</span>
                  <span style={{ fontFamily: 'var(--font-family)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'none', letterSpacing: 0 }}>Swap Heads ↔ Tails</span>
                </button>

                <button className="btn btn-sky" onClick={() => handlePlayerMove('KEEP')} style={{ flexDirection: 'column', gap: 4, minHeight: 68, padding: '8px 2px' }}>
                  <span style={{ fontSize: '0.58rem' }}>KEEP (I)</span>
                  <span style={{ fontFamily: 'var(--font-family)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'none', letterSpacing: 0 }}>Do nothing</span>
                </button>

                {playerMode === 'quantum' && (
                  <button className="btn" onClick={() => handlePlayerMove('PHASE')} style={{ flexDirection: 'column', gap: 4, minHeight: 68, padding: '8px 2px', animation: 'pulseGlow 2s infinite' }}>
                    <span style={{ fontSize: '0.58rem' }}>PHASE FLIP (Z)</span>
                    <span style={{ fontFamily: 'var(--font-family)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'none', letterSpacing: 0 }}>⚡ Quantum move!</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {turnState === 'measured' && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-violet" onClick={startRound} style={{ flex: 1 }}>
                <span>Play round {round}</span>
              </button>
              <button className="chip" onClick={resetGame} aria-label="Reset match" style={{ width: 56, padding: 0, justifyContent: 'center' }}>
                <RotateCcw size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Mode toggle: unlock quantum powers */}
        <div style={{ ...panelStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Your ruleset</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: playerMode === 'quantum' ? '#38c8ff' : '#f1eaff' }}>
              {playerMode === 'quantum' ? '⚡ Quantum moves on' : '🔒 Classical (flips only)'}
            </div>
          </div>

          <button
            className="chip"
            onClick={() => {
              sound.playClick();
              setPlayerMode((m) => (m === 'classical' ? 'quantum' : 'classical'));
            }}
          >
            {playerMode === 'quantum' ? <Unlock size={16} /> : <Lock size={16} />}
            <span>{playerMode === 'quantum' ? 'Classical' : 'Unlock'}</span>
          </button>
        </div>
      </div>

      {/* Why it works */}
      <div style={{ ...panelStyle, padding: 0, overflow: 'hidden' }}>
        <button
          onClick={() => setShowSecretGuide(!showSecretGuide)}
          aria-expanded={showSecretGuide}
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
            <span>Why does Dr. Quantum always win?</span>
          </div>
          {showSecretGuide ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showSecretGuide && (
          <div style={{
            padding: '0 14px 14px',
            fontSize: '0.88rem',
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

            <p style={{ color: '#f1eaff' }}>
              💡 <b>How to Beat Dr. Quantum:</b> Click <b>'Unlock'</b> above to switch on quantum moves. When you play the <b>[Z] phase flip</b> on Move 2, the coin goes from |+⟩ to |−⟩, a state that no flip can make. His last Hadamard then turns |−⟩ into Tails (|1⟩)!
            </p>
            <div style={{ fontFamily: 'monospace', color: '#86efac', fontSize: '0.8rem' }}>
              Z · (|0⟩ + |1⟩)/√2 = (|0⟩ − |1⟩)/√2 = |−⟩, then H · |−⟩ = |1⟩
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
