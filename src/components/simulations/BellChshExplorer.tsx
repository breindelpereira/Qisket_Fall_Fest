import React, { useMemo, useState } from 'react';
import { Play, Sparkles } from 'lucide-react';
import { ArcadeFrame, ArcadeHeader, Banner, Eyebrow, GameTitle } from '../shared/Arcade';
import { RETRO, THEMES, panelStyle } from '../shared/arcadeTheme';
import { OPTIMAL_QUANTUM, playQuantumRound } from '../../core/games/chsh';
import type { QuantumStrategy } from '../../core/games/chsh';
import { CLASSICAL_S, QUANTUM_S, chshValue, correlation, correlationCurve, verdict, winFromS } from '../../core/labs/bell';
import { InfoBox, LabSlider, MathBox } from './labKit';
import { deg, pct, useExplored } from './labUtils';

const THEME = THEMES.violet;
const rad = (d: number) => (d * Math.PI) / 180;
/** Degrees with at most one decimal, so 22.5° is not shown as 23°. */
const exactDeg = (r: number): number => Math.round(((r * 180) / Math.PI) * 10) / 10;
const signed = (n: number) => (n >= 0 ? '+' : '−') + Math.abs(n).toFixed(2);

const ANGLES = {
  a0: { label: 'ALICE · question 0', who: 'alice', idx: 0 },
  a1: { label: 'ALICE · question 1', who: 'alice', idx: 1 },
  b0: { label: 'BOB · question 0', who: 'bob', idx: 0 },
  b1: { label: 'BOB · question 1', who: 'bob', idx: 1 },
} as const;

export const BellChshExplorer: React.FC = () => {
  const markExplored = useExplored('bell_chsh_explorer', 'concept_entanglement');
  const [angles, setAngles] = useState<QuantumStrategy>({ alice: [0, 0], bob: [0, 0] });
  const [rounds, setRounds] = useState<{ played: number; won: number } | null>(null);
  const [showMath, setShowMath] = useState(false);

  const s = useMemo(() => chshValue(angles), [angles]);
  const v = verdict(s);
  const curve = useMemo(() => correlationCurve(), []);
  const delta = angles.bob[0] - angles.alice[0];

  const set = (who: 'alice' | 'bob', idx: 0 | 1, deg_: number) => {
    markExplored();
    setAngles((a) => {
      const pair: [number, number] = [...a[who]];
      pair[idx] = rad(deg_);
      return { ...a, [who]: pair };
    });
    setRounds(null);
  };

  const useBest = () => { markExplored(); setAngles(OPTIMAL_QUANTUM); setRounds(null); };

  const play = (n: number) => {
    markExplored();
    let won = 0;
    for (let i = 0; i < n; i++) if (playQuantumRound(angles).won) won++;
    setRounds({ played: n, won });
  };

  // S gauge: -2.83 .. +2.83 across the bar
  const gx = (value: number) => ((value + QUANTUM_S) / (2 * QUANTUM_S)) * 100;

  // correlation curve plot
  const PW = 320;
  const PH = 120;
  const cx = (d: number) => 10 + ((d + Math.PI / 2) / Math.PI) * (PW - 20);
  const cy = (e: number) => PH / 2 - e * (PH / 2 - 14);
  const curvePath = curve.map((p, i) => `${i === 0 ? 'M' : 'L'}${cx(p.delta).toFixed(1)},${cy(p.e).toFixed(1)}`).join(' ');
  const clampDelta = ((delta + Math.PI / 2 + 2 * Math.PI) % Math.PI) - Math.PI / 2; // fold into the plotted half turn

  const sliders = (Object.keys(ANGLES) as (keyof typeof ANGLES)[]).map((k) => {
    const { label, who, idx } = ANGLES[k];
    const value = angles[who][idx];
    return (
      <LabSlider key={k} label={label} accent={THEME.accent} value={exactDeg(value)} min={-90} max={90} step={2.5}
        display={`${exactDeg(value)}°`} onChange={(d) => set(who, idx, d)} />
    );
  });

  return (
    <ArcadeFrame theme={THEME}>
      <ArcadeHeader theme={THEME} label="LAB · BELL TEST" tag="Accurate" />
      <GameTitle
        title="Bell & CHSH Explorer"
        story="Alice and Bob share an entangled pair and each pick a measurement angle. Tune the four angles and see whether their results are more correlated than any shared script could allow."
      />

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {sliders}
      </div>
      <button className="btn btn-violet" onClick={useBest}><Sparkles size={18} /> <span>Use the best angles</span></button>

      <div style={panelStyle}>
        <Eyebrow>CHSH VALUE S</Eyebrow>
        <div style={{ fontFamily: RETRO, fontSize: '2.2rem', color: v === 'beyond' ? '#2ee6a6' : '#ffd23f', lineHeight: 1.1 }}>
          S = {signed(s)}
        </div>
        <div style={{ position: 'relative', height: 26, background: 'rgba(255,255,255,0.08)', borderRadius: 8, margin: '10px 0 22px', overflow: 'visible' }}>
          {/* classical zone */}
          <div aria-hidden="true" style={{ position: 'absolute', left: `${gx(-CLASSICAL_S)}%`, width: `${gx(CLASSICAL_S) - gx(-CLASSICAL_S)}%`, top: 0, bottom: 0, background: 'rgba(255,210,63,0.22)', borderRadius: 8 }} />
          <div aria-hidden="true" style={{ position: 'absolute', left: `${gx(s)}%`, top: -4, bottom: -4, width: 6, marginLeft: -3, background: '#fff', borderRadius: 3, border: `2px solid ${THEME.edge}` }} />
          {[-QUANTUM_S, -CLASSICAL_S, 0, CLASSICAL_S, QUANTUM_S].map((t) => (
            <span key={t} style={{ position: 'absolute', left: `${gx(t)}%`, top: 28, transform: 'translateX(-50%)', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
              {t === 0 ? '0' : (t < 0 ? '−' : '') + (Math.abs(t) === 2 ? '2' : '2.83')}
            </span>
          ))}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          The shaded middle is everything a classical shared script can reach (|S| ≤ 2). The edges are the quantum maximum, 2√2 ≈ 2.83.
        </div>
      </div>

      {v === 'beyond' ? (
        <Banner tone="good" title="BEYOND ANY CLASSICAL STRATEGY">
          |S| is above 2, so no pre-agreed script (local hidden variables) could produce these correlations. In the CHSH game this wins {pct(winFromS(s), 1)} of rounds, against a classical ceiling of 75%.
        </Banner>
      ) : (
        <Banner tone="warn" title="STILL CLASSICAL-LOOKING">
          |S| is {Math.abs(s).toFixed(2)}, at or below 2, so a shared script could imitate this. Try the best angles, or spread Alice's two angles apart (45°) with Bob's between them.
        </Banner>
      )}

      <div style={panelStyle}>
        <Eyebrow>THE FOUR CORRELATIONS (+1 ALWAYS AGREE, −1 ALWAYS DIFFER)</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8 }}>
          {([['a0', 'b0', 0, 0, 1], ['a0', 'b1', 0, 1, 1], ['a1', 'b0', 1, 0, 1], ['a1', 'b1', 1, 1, -1]] as const).map(([an, bn, ai, bi, sign]) => {
            const e = correlation(angles.alice[ai], angles.bob[bi]);
            return (
              <div key={an + bn} style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 12, padding: '8px 10px' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {sign < 0 ? '−' : '+'} E({an}, {bn})
                </div>
                <div style={{ fontFamily: RETRO, fontSize: '1.5rem' }}>{signed(e)}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={panelStyle}>
        <Eyebrow>CORRELATION VS ANGLE GAP (ALICE q0, BOB q0)</Eyebrow>
        <svg viewBox={`0 0 ${PW} ${PH}`} width="100%" role="img" aria-label="Correlation E equals cosine of twice the angle difference" style={{ marginTop: 6 }}>
          <line x1="10" y1={cy(0)} x2={PW - 10} y2={cy(0)} stroke="rgba(255,255,255,0.25)" />
          <line x1={cx(0)} y1="8" x2={cx(0)} y2={PH - 8} stroke="rgba(255,255,255,0.12)" strokeDasharray="3 4" />
          <path d={curvePath} fill="none" stroke="#8b5cf6" strokeWidth="3" />
          <circle cx={cx(clampDelta)} cy={cy(correlation(angles.alice[0], angles.bob[0]))} r="6" fill="#ffd23f" stroke="#fff" strokeWidth="2" />
          <text x="10" y={PH - 1} fill="#ddd0fa" fontSize="9">−90°</text>
          <text x={PW / 2} y={PH - 1} fill="#ddd0fa" fontSize="9" textAnchor="middle">0°</text>
          <text x={PW - 10} y={PH - 1} fill="#ddd0fa" fontSize="9" textAnchor="end">+90°</text>
          <text x={PW - 12} y={cy(1) + 4} fill="#ddd0fa" fontSize="9" textAnchor="end">+1</text>
          <text x={PW - 12} y={cy(-1) - 2} fill="#ddd0fa" fontSize="9" textAnchor="end">−1</text>
        </svg>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          The curve is E = cos(2Δ). A shared script can only trace a zig-zag line between the same corner points, which is why it cannot reach the full wave.
        </div>
      </div>

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Eyebrow>PLAY THE CHSH GAME WITH THESE ANGLES</Eyebrow>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-sky" style={{ flex: 1 }} onClick={() => play(100)}><Play size={18} fill="currentColor" /> <span>100 rounds</span></button>
          <button className="btn" style={{ flex: 1 }} onClick={() => play(1000)}><span>1000 rounds</span></button>
        </div>
        {rounds && (
          <div style={{ fontFamily: RETRO, fontSize: '1.3rem' }}>
            won {rounds.won} / {rounds.played} = {pct(rounds.won / rounds.played, 1)} <span style={{ color: 'var(--text-secondary)' }}>(predicted {pct(winFromS(s), 1)})</span>
          </div>
        )}
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Fewer rounds wobble more, as in the Shots + Histogram Lab.</div>
      </div>

      <MathBox open={showMath} onToggle={() => setShowMath((x) => !x)}>
        <div>S = E(a₀,b₀) + E(a₀,b₁) + E(a₁,b₀) − E(a₁,b₁)</div>
        <div>E(a,b) = cos 2(θ_b − θ_a) for the pair (|00⟩ + |11⟩)/√2</div>
        <div>win probability = ½ + S/8</div>
        <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
          Best angles: Alice 0° and 45°, Bob 22.5° and −22.5°, giving S = 2√2 and a win rate of cos²(π/8) ≈ 85.4%. Current Δ(a₀,b₀) = {deg(delta)}°.
        </div>
      </MathBox>

      <InfoBox title="WHAT THIS DOES (AND DOES NOT) SHOW">
        The correlations are exact for an ideal Bell pair. Passing the classical bound rules out local hidden variables; it does not let Alice and Bob send messages, because each one's own results still look completely random.
      </InfoBox>
    </ArcadeFrame>
  );
};
