import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Crosshair } from 'lucide-react';
import { useActivityReport } from '../../hooks/useActivityReport';
import { sensorMessage, useOrientation } from '../../hooks/useMotion';
import { Banner, Eyebrow } from '../shared/Arcade';
import { RETRO, THEMES, panelStyle } from '../shared/arcadeTheme';
import { FinishPanel, LevelFrame, MeterBar, NextButton } from '../shared/LevelKit';
import { starWords, useLevelRun } from '../shared/levelRun';
import type { StarCount } from '../shared/levelRun';
import { sound } from '../../utils/audio';
import {
  LEVELS, NOT_HELD, angleOnSphere, blochOf, calibrationFrom, fidelity, fidelityForRing, poseFrom, smooth, stateAfter, stateAt, updateHold,
} from '../../core/games/sensorControl';
import type { Calibration, Hold, Orientation, Pose, TiltLevel } from '../../core/games/sensorControl';
import { LabSlider } from '../simulations/labKit';

const THEME = THEMES.sky;
const DEG = Math.PI / 180;
const NO_CAL: Calibration = { alpha: 0, beta: 0, gamma: 0 };

/** The sphere seen side-on: z is up, x to the right, and y comes out of the page (a bigger, brighter dot is nearer). */
const Sphere: React.FC<{ vector: { x: number; y: number; z: number }; target: { x: number; y: number; z: number }; ringDegrees: number; inside: boolean }> = ({ vector, target, ringDegrees, inside }) => {
  const R = 78;
  const at = (v: { x: number; y: number; z: number }) => ({ cx: 100 + v.x * R, cy: 100 - v.z * R });
  const v = at(vector);
  const t = at(target);
  // the ring is drawn as a circle of this radius around the target, on the page: close to true near the middle of the sphere
  const ring = Math.max(8, Math.sin(ringDegrees * DEG) * R);
  return (
    <svg viewBox="0 0 200 200" width="100%" style={{ maxWidth: 300, alignSelf: 'center' }} role="img"
      aria-label={`The sphere seen from the side. The target is at x ${target.x.toFixed(2)}, y ${target.y.toFixed(2)}, z ${target.z.toFixed(2)}. Your qubit is at x ${vector.x.toFixed(2)}, y ${vector.y.toFixed(2)}, z ${vector.z.toFixed(2)}, ${inside ? 'inside' : 'outside'} the ring.`}>
      <circle cx="100" cy="100" r={R} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.45)" strokeWidth="2" />
      <ellipse cx="100" cy="100" rx={R} ry={R * 0.28} fill="none" stroke="rgba(255,255,255,0.22)" strokeDasharray="4 4" />
      <line x1="100" y1={100 - R} x2="100" y2={100 + R} stroke="rgba(255,255,255,0.22)" />
      <text x="100" y={100 - R - 6} fontSize="10" fill="#ddd0fa" textAnchor="middle">|0⟩</text>
      <text x="100" y={100 + R + 14} fontSize="10" fill="#ddd0fa" textAnchor="middle">|1⟩</text>
      <text x={100 + R + 4} y="104" fontSize="10" fill="#ddd0fa">x</text>
      <circle cx={t.cx} cy={t.cy} r={ring} fill={inside ? 'rgba(46,230,166,0.25)' : 'rgba(255,210,63,0.12)'} stroke={inside ? '#2ee6a6' : '#ffd23f'} strokeWidth="3" strokeDasharray="6 4" />
      <circle cx={t.cx} cy={t.cy} r="3" fill="#ffd23f" />
      <line x1="100" y1="100" x2={v.cx} y2={v.cy} stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <circle cx={v.cx} cy={v.cy} r={5 + (vector.y + 1) * 2.5} fill="#38c8ff" stroke="#fff" strokeWidth="2" opacity={0.6 + 0.2 * (vector.y + 1)} />
    </svg>
  );
};

const Level: React.FC<{
  level: TiltLevel; index: number; isLast: boolean; onClear: (s: StarCount) => void; onNext: () => void;
}> = ({ level, index, isLast, onClear, onNext }) => {
  const [pose, setPose] = useState<Pose>({ x: 0, y: 0, z: 0 });
  const [manual, setManual] = useState<Pose>({ x: 0, y: 0, z: 0 });
  const [hold, setHold] = useState<Hold>(NOT_HELD);
  const [done, setDone] = useState<StarCount | null>(null);
  const calibration = useRef<Calibration>(NO_CAL);
  const lastReading = useRef<Orientation | null>(null);
  const smoothed = useRef<Pose | null>(null);
  const wasInside = useRef(false);
  const frame = useRef<number | null>(null);

  const { status, enable } = useOrientation((r) => {
    lastReading.current = r;
    smoothed.current = smooth(smoothed.current, poseFrom(r, calibration.current));
    if (frame.current === null) {
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        if (smoothed.current) setPose(smoothed.current);
      });
    }
  });
  const sensing = status === 'on';

  useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
  }, []);

  const start = useMemo(() => stateAt(level.start), [level]);
  const target = useMemo(() => stateAt(level.target), [level]);
  const used = sensing ? pose : manual;
  const state = stateAfter(start, used);
  const f = fidelity(state, target);
  const inside = f >= fidelityForRing(level.ringDegrees);
  const away = angleOnSphere(f);

  // hold the state in the ring for a while: leaving the ring starts the count again. The same tick counts each time the
  // dot comes into the ring from outside (that count is what the stars are for) and decides when the hold is long enough.
  const insideNow = useRef(inside);
  useEffect(() => {
    insideNow.current = inside;
  }, [inside]);
  useEffect(() => {
    if (done !== null) return undefined;
    let held: Hold = NOT_HELD;
    let enteredCount = 0;
    const tick = setInterval(() => {
      const isInside = insideNow.current;
      held = updateHold(held, isInside, Date.now());
      if (isInside && !wasInside.current) enteredCount += 1;
      wasInside.current = isInside;
      setHold(held);
      if (held.heldMs >= level.holdMs) {
        clearInterval(tick);
        const s: StarCount = enteredCount <= 1 ? 3 : enteredCount <= 4 ? 2 : 1;
        sound.playSuccess();
        setDone(s);
        onClear(s);
      }
    }, 80);
    return () => clearInterval(tick);
  }, [done, level.holdMs, onClear]);

  const recalibrate = () => {
    if (lastReading.current) {
      calibration.current = calibrationFrom(lastReading.current);
      smoothed.current = null;
      setPose({ x: 0, y: 0, z: 0 });
    }
    setManual({ x: 0, y: 0, z: 0 });
  };

  const b = blochOf(state);
  const tb = blochOf(target);

  useActivityReport({
    id: 'hold_bloch_sphere',
    status: 'playing',
    step: `Level ${index + 1} of ${LEVELS.length}: ${level.title}`,
    mission: `Bring the qubit into the glowing ring (${level.ringDegrees} degrees across) and hold it there for ${(level.holdMs / 1000).toFixed(1)} seconds.`,
    state:
      `${sensing ? 'Steering with the phone tilt' : 'Steering with the sliders'}. The qubit is ${away.toFixed(0)} degrees from the target, ${inside ? 'inside' : 'outside'} the ring. ` +
      `Rotations applied: about X ${(used.x / DEG).toFixed(0)}, about Y ${(used.y / DEG).toFixed(0)}, about Z ${(used.z / DEG).toFixed(0)} degrees.`,
    hint: 'Tilt forward or back turns the qubit about the X axis, tilting sideways about Y, and twisting about Z. Move one at a time and watch which way the dot goes.',
  });

  return (
    <>
      <div style={{ ...panelStyle, fontSize: '0.86rem', lineHeight: 1.5 }}>
        Your phone's tilt is a <b>classical sensor</b>. It steers the qubit; it is not quantum. The qubit's state is computed by the app's own quantum engine.
      </div>

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Sphere vector={{ x: b.x, y: b.y, z: b.z }} target={{ x: tb.x, y: tb.y, z: tb.z }} ringDegrees={level.ringDegrees} inside={inside} />
        <MeterBar label="Distance from the target" value={Math.max(0, 180 - away)} max={180} ok={inside} text={`${away.toFixed(0)}° (ring ${level.ringDegrees}°)`} color="#2ee6a6" />
        <MeterBar label={`Hold it there (${(level.holdMs / 1000).toFixed(1)} s)`} value={Math.min(hold.heldMs, level.holdMs)} max={level.holdMs} ok={done !== null || hold.heldMs > 0}
          text={`${(Math.min(hold.heldMs, level.holdMs) / 1000).toFixed(1)} s`} color={THEME.accent} />
        <div style={{ fontFamily: RETRO, fontSize: '1.1rem', textAlign: 'center' }}>
          x {b.x.toFixed(2)} · y {b.y.toFixed(2)} · z {b.z.toFixed(2)}
        </div>
      </div>

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div role="status" style={{ fontSize: '0.84rem', lineHeight: 1.4 }}>{sensorMessage(status, 'tilt the phone to steer')}</div>
        {status === 'needs-tap' && <button className="btn btn-mint" onClick={() => void enable()}><span>Allow the motion sensor</span></button>}
        {sensing ? (
          <button className="chip" onClick={recalibrate} style={{ minHeight: 48, justifyContent: 'center' }}>
            <Crosshair size={16} /> This is my zero
          </button>
        ) : (
          <>
            <Eyebrow>TOUCH CONTROLS (ROTATIONS IN DEGREES)</Eyebrow>
            {(['x', 'y', 'z'] as const).map((axis) => (
              <LabSlider key={axis} label={`TURN ABOUT ${axis.toUpperCase()}`} value={Math.round(manual[axis] / DEG)} min={-180} max={180} step={1} accent={THEME.accent}
                display={`${Math.round(manual[axis] / DEG)}°`} onChange={(v) => done === null && setManual((m) => ({ ...m, [axis]: v * DEG }))} />
            ))}
            <button className="chip" onClick={recalibrate} style={{ minHeight: 48, justifyContent: 'center' }}>Set all to zero</button>
          </>
        )}
      </div>

      {done !== null && (
        <>
          <Banner tone="good" title="HELD!">
            {starWords(done)} Each tilt is a rotation about an axis, and any point on the sphere can be reached by combining three of them. That is what the single-qubit gates do.
          </Banner>
          <NextButton isLast={isLast} onNext={onNext} />
        </>
      )}
    </>
  );
};

export const HoldBlochSphere: React.FC = () => {
  const r = useLevelRun('hold_bloch_sphere', LEVELS.length, 'concept_qubits');
  if (r.finished) {
    return (
      <FinishPanel theme={THEME} title="STEADY HANDS" total={r.total} levelCount={LEVELS.length}
        summary="You steered a qubit around the Bloch sphere with three rotations, and held it on target."
        honest="Analogy: the phone's tilt is an ordinary sensor that steers the picture. A real qubit is turned by pulses of microwaves or laser light, not by moving the device. The state and the rotations are computed by the app's quantum engine."
        onAgain={r.again} />
    );
  }
  const level = LEVELS[r.levelIdx];
  return (
    <LevelFrame theme={THEME} tag="Analogy" label="TILT" levelIdx={r.levelIdx} levelCount={LEVELS.length} total={r.total} title={level.title} story={level.story}>
      <Level key={`${r.round}-${level.id}`} level={level} index={r.levelIdx} isLast={r.isLast} onClear={r.clear} onNext={r.next} />
    </LevelFrame>
  );
};
