import React, { useMemo, useState } from 'react';
import { useActivityReport } from '../../hooks/useActivityReport';
import { ChevronRight, RotateCcw, Play } from 'lucide-react';
import { ArcadeFrame, ArcadeHeader, Banner, Eyebrow, GameTitle } from '../shared/Arcade';
import { RETRO, THEMES, groupChip, panelStyle } from '../shared/arcadeTheme';
import { BlochSphereVisualizer } from './BlochSphereVisualizer';
import { reducedQubit } from '../../core/labs/twoQubit';
import {
  NAMED_MESSAGES, STEP_COUNT, STEP_LABELS, bobFidelity, bobWithoutMessageLength, correctionFor, messageVector, teleportUpTo,
} from '../../core/labs/teleport';
import type { Bit, Message } from '../../core/labs/teleport';
import { InfoBox, LabSlider, MathBox } from './labKit';
import { deg, pct, useExplored } from './labUtils';

const THEME = THEMES.sky;

const STEP_TEXT = [
  'Alice holds the message qubit. Her spare qubit and Bob\'s qubit are blank. Alice does not know the message, and reading it out would wreck it, so she cannot just tell Bob what it is.',
  'Alice and Bob now share an entangled pair, one half each: perfectly correlated, but each half alone looks random. (In real life they would make it earlier and then travel apart.)',
  'Alice entangles her message with her half of the pair. Bob has not been touched, but his qubit is now linked to everything.',
  'A Hadamard on the message qubit. Written out, the three qubits are now an even mix of four cases, one for each pair of bits Alice could read.',
  'Alice measures. She gets two ordinary bits, and her message qubit is destroyed in the process. Bob\'s qubit now holds the message, scrambled by one of four possible flips.',
  'Alice sends the two bits by phone, text, anything classical. Bob applies the matching flip (X if the second bit is 1, then Z if the first is 1) and holds the message.',
];

const vec = (x: number, y: number, z: number) => `(${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`;

const toCoords = (x: number, y: number, z: number) => {
  const len = Math.sqrt(x * x + y * y + z * z);
  return { x, y, z, theta: len > 1e-9 ? Math.acos(Math.max(-1, Math.min(1, z / len))) : 0, phi: Math.atan2(y, x) };
};

export const TeleportationLab: React.FC = () => {
  const markExplored = useExplored('teleportation_lab', 'concept_teleportation');
  const [message, setMessage] = useState<Message>(NAMED_MESSAGES[3].message);
  const [step, setStep] = useState(0);
  const [bits, setBits] = useState<[Bit, Bit]>([0, 0]);
  const [bitsArrive, setBitsArrive] = useState(true);
  const [batch, setBatch] = useState<null | { runs: number; counts: number[]; withFix: number; withoutFix: number }>(null);
  const [showMath, setShowMath] = useState(false);

  const run = useMemo(
    () => teleportUpTo(message, step, { forceBits: bits, correct: bitsArrive }),
    [message, step, bits, bitsArrive],
  );
  const bob = reducedQubit(run.state, 2);
  const alice = reducedQubit(run.state, 0);
  const fidelity = bobFidelity(message, run.state);
  const mv = messageVector(message);
  const done = step >= 5;

  const advance = () => {
    if (step === 3) setBits([Math.random() < 0.5 ? 0 : 1, Math.random() < 0.5 ? 0 : 1]);
    const next = Math.min(step + 1, 5);
    setStep(next);
    if (next === 5) markExplored();
  };

  const changeMessage = (m: Message) => { setMessage(m); setStep(0); setBatch(null); };
  const restart = () => { setStep(0); };

  const runMany = () => {
    markExplored();
    const counts = [0, 0, 0, 0];
    let withFix = 0;
    let withoutFix = 0;
    const runs = 200;
    for (let i = 0; i < runs; i++) {
      const rng = () => Math.random();
      const a = teleportUpTo(message, 5, { rng });
      counts[(a.m0 as number) * 2 + (a.m1 as number)]++;
      withFix += bobFidelity(message, a.state);
      withoutFix += bobFidelity(message, teleportUpTo(message, 5, { forceBits: [a.m0 as Bit, a.m1 as Bit], correct: false }).state);
    }
    setBatch({ runs, counts, withFix: withFix / runs, withoutFix: withoutFix / runs });
  };


  // what the AI tutor is told if the learner asks about this lab: the step and readouts, nothing hidden
  useActivityReport({
    id: 'teleportation_lab',
    status: 'playing',
    step: `Step ${step} of ${STEP_COUNT}${step > 0 ? `: ${STEP_LABELS[step - 1]}` : ''}`,
    state:
      `Message: tilt ${deg(message.theta)}°, turn ${deg(message.phi)}°. Bob's qubit matches the message ${pct(fidelity, 0)}.` +
      `${step >= 4 ? ` Alice's bits are ${bits[0]}${bits[1]}${bitsArrive ? '' : ' and they have NOT reached Bob'}.` : ''}` +
      `${batch ? ` 200 runs: Bob matched ${pct(batch.withFix, 0)} with the fix and ${pct(batch.withoutFix, 0)} without it.` : ''}`,
  });

  return (
    <ArcadeFrame theme={THEME}>
      <ArcadeHeader theme={THEME} label="LAB · TELEPORTATION" tag="Accurate" />
      <GameTitle
        title="Teleportation Lab"
        story="Send an unknown qubit from Alice to Bob without sending the qubit. You need one shared Bell pair and two ordinary bits."
      />

      <div>
        <Eyebrow>THE MESSAGE ALICE WANTS TO SEND</Eyebrow>
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          {NAMED_MESSAGES.map((n) => (
            <button key={n.label} className="chip" aria-pressed={message === n.message} onClick={() => changeMessage(n.message)}
              style={{ ...groupChip, fontFamily: RETRO, fontSize: '1.2rem' }}>{n.label}</button>
          ))}
        </div>
        <div style={{ marginTop: 6 }}>
          <LabSlider label="TILT θ" accent={THEME.accent} value={deg(message.theta)} min={0} max={180} step={5}
            display={`${deg(message.theta)}°`} onChange={(v) => changeMessage({ ...message, theta: (v * Math.PI) / 180 })} />
          <LabSlider label="TURN φ" accent={THEME.accent} value={deg(message.phi)} min={-180} max={180} step={5}
            display={`${deg(message.phi)}°`} onChange={(v) => changeMessage({ ...message, phi: (v * Math.PI) / 180 })} />
        </div>
      </div>

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Eyebrow>STEP {step} OF {STEP_COUNT}{step > 0 ? `: ${STEP_LABELS[step - 1].toUpperCase()}` : ''}</Eyebrow>
        <div style={{ display: 'flex', gap: 3 }} aria-hidden="true">
          {Array.from({ length: STEP_COUNT }, (_, i) => (
            <div key={i} style={{ flex: 1, height: 8, borderRadius: 4, background: i < step ? THEME.accent : 'rgba(255,255,255,0.12)' }} />
          ))}
        </div>
        <p style={{ fontSize: '0.88rem', lineHeight: 1.5, color: '#f1eaff' }}>{STEP_TEXT[step]}</p>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-sky" style={{ flex: 1 }} disabled={done} onClick={advance}>
            <span>{step === 0 ? 'Make the Bell pair' : done ? 'Done' : `Next: ${['', 'Entangle', 'Hadamard', 'Measure', 'Correct'][step] ?? ''}`}</span>
            {!done && <ChevronRight size={18} />}
          </button>
          <button className="chip" aria-label="Start over" onClick={restart} style={{ minWidth: 44, justifyContent: 'center' }}><RotateCcw size={16} /></button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ ...panelStyle, flex: '1 1 200px', padding: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Eyebrow>MESSAGE</Eyebrow>
          <BlochSphereVisualizer coordinates={toCoords(mv[0], mv[1], mv[2])} size={190} showReadout={false} />
          <span style={{ fontFamily: RETRO, fontSize: '1rem', color: 'var(--text-secondary)' }}>{vec(mv[0], mv[1], mv[2])}</span>
        </div>
        <div style={{ ...panelStyle, flex: '1 1 200px', padding: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Eyebrow>BOB'S QUBIT</Eyebrow>
          <BlochSphereVisualizer coordinates={toCoords(bob.x, bob.y, bob.z)} size={190} showReadout={false} />
          <span style={{ fontFamily: RETRO, fontSize: '1rem', color: 'var(--text-secondary)' }}>{vec(bob.x, bob.y, bob.z)}</span>
        </div>
      </div>

      <div style={panelStyle}>
        <Eyebrow>BOB'S QUBIT VS THE MESSAGE</Eyebrow>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
          <div style={{ flex: 1, height: 22, background: 'rgba(255,255,255,0.08)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ width: `${fidelity * 100}%`, height: '100%', background: fidelity > 0.999 ? '#2ee6a6' : THEME.accent, transition: 'width .25s' }} />
          </div>
          <span style={{ fontFamily: RETRO, fontSize: '1.5rem', minWidth: 60, textAlign: 'right' }}>{pct(fidelity, 0)}</span>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 6 }}>
          50% is what a random guess scores. Bloch arrow length: {bob.length.toFixed(2)} (a short arrow means Bob's qubit is still tangled up with Alice's).
        </p>
      </div>

      {step >= 4 && (
        <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Eyebrow color="#ffd23f">ALICE'S TWO BITS</Eyebrow>
          <div style={{ fontFamily: RETRO, fontSize: '2rem', color: '#ffd23f' }}>{bits[0]}{bits[1]}</div>
          <div style={{ fontSize: '0.84rem', color: '#f1eaff' }}>
            Needed fix: {correctionFor(bits[0], bits[1]).length ? correctionFor(bits[0], bits[1]).join(' then ') : 'nothing'}.
            Alice's message qubit now reads {alice.p1 > 0.5 ? 1 : 0}: it is just a bit, the message is gone from her side (no cloning).
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 44, fontSize: '0.9rem', fontWeight: 700 }}>
            <input type="checkbox" checked={bitsArrive} onChange={(e) => setBitsArrive(e.target.checked)} style={{ width: 22, height: 22, accentColor: THEME.accent }} />
            Alice's two bits reach Bob
          </label>
          {!bitsArrive && step >= 5 && fidelity > 0.999 && (
            <Banner tone="warn" title="LUCKY THIS TIME">
              Alice's bits happened to be 00, which needs no fix, so Bob is right even without them. That is 1 chance in 4. Start over to draw new bits.
            </Banner>
          )}
          {!bitsArrive && step >= 5 && fidelity <= 0.999 && (
            <Banner tone="bad" title="NO MESSAGE, NO TELEPORT">
              Without the bits Bob does not know which of the four flips to undo, so his qubit is wrong. Averaged over Alice's outcomes it is pure noise (arrow length {bobWithoutMessageLength(message).toFixed(2)}). That is why teleportation cannot beat the speed of light.
            </Banner>
          )}
        </div>
      )}

      {done && bitsArrive && (
        <Banner tone="good" title="TELEPORTED">
          Bob's qubit matches the message exactly ({pct(fidelity, 0)}). Nothing travelled between them except two plain bits. The original is gone, so nothing was copied.
        </Banner>
      )}

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Eyebrow>RUN IT 200 TIMES</Eyebrow>
        <button className="btn" onClick={runMany}><Play size={18} fill="currentColor" /> <span>Teleport 200 times</span></button>
        {batch && (
          <div style={{ fontFamily: RETRO, fontSize: '1.15rem', lineHeight: 1.45 }}>
            bits 00: {batch.counts[0]} · 01: {batch.counts[1]} · 10: {batch.counts[2]} · 11: {batch.counts[3]}
            <br />Bob with the fix: {pct(batch.withFix, 0)} match
            <br />Bob without the fix: {pct(batch.withoutFix, 0)} match
          </div>
        )}
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Each pair of bits comes up about a quarter of the time, whatever the message is.</div>
      </div>

      <MathBox open={showMath} onToggle={() => setShowMath((v) => !v)}>
        <div>message |ψ⟩ = α|0⟩ + β|1⟩, Bell pair (|00⟩ + |11⟩)/√2</div>
        <div>|ψ⟩|Φ⁺⟩ = ½ Σ |m₀m₁⟩ · (X^m₁ Z^m₀ |ψ⟩)</div>
        <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
          Bob's qubit is the message flipped by X^m₁ Z^m₀ in each of the four branches. Alice's measurement picks a branch at random and tells her which, so she can tell Bob how to undo it.
        </div>
      </MathBox>

      <InfoBox title="WHAT THIS IS (AND IS NOT)">
        Exact simulation of the textbook protocol on three qubits. The measurement outcomes are drawn at random in step 4 (each of the four is equally likely). It moves the state, not matter or energy, and it needs the classical bits, so it cannot send anything faster than light.
      </InfoBox>
    </ArcadeFrame>
  );
};
