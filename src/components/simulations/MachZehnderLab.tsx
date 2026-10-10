import React, { useMemo, useState } from 'react';
import { useActivityReport } from '../../hooks/useActivityReport';
import { Zap, RotateCcw } from 'lucide-react';
import { ArcadeFrame, ArcadeHeader, Banner, Eyebrow, GameTitle } from '../shared/Arcade';
import { RETRO, THEMES, groupChip, panelStyle, stageStyle } from '../shared/arcadeTheme';
import { fireOnePhoton } from '../../core/optical/interferometer';
import { bombTest, fringeCurve, mzResult } from '../../core/labs/interference';
import type { Blocker } from '../../core/labs/interference';
import { BarChart, InfoBox, LabSlider, MathBox } from './labKit';
import { deg, fmtAmp, pct, useExplored } from './labUtils';

const THEME = THEMES.sky;
const W = 340;
const H = 170;
const Y_TOP = 50;
const Y_BOT = 120;
const X = { src: 36, bs1: 70, ph: 140, bl: 200, bs2: 250, det: 310 };

type Tally = { top: number; bottom: number; lost: number };
const NO_TALLY: Tally = { top: 0, bottom: 0, lost: 0 };

const BLOCKERS: { id: string; value: Blocker; label: string }[] = [
  { id: 'none', value: null, label: 'None' },
  { id: 'top', value: 0, label: 'Top arm' },
  { id: 'bottom', value: 1, label: 'Bottom arm' },
];

export const MachZehnderLab: React.FC = () => {
  const markExplored = useExplored('mach_zehnder_lab', 'concept_interference');
  const [phi, setPhi] = useState(0);
  const [blocker, setBlocker] = useState<Blocker>(null);
  const [tally, setTally] = useState<Tally>(NO_TALLY);
  const [showMath, setShowMath] = useState(false);
  const [bombLog, setBombLog] = useState<{ last: 'boom' | 'found' | 'silent' | null; boom: number; found: number; silent: number }>({
    last: null, boom: 0, found: 0, silent: 0,
  });

  const result = useMemo(() => mzResult(phi, blocker), [phi, blocker]);
  const curve = useMemo(() => fringeCurve(blocker), [blocker]);
  const total = tally.top + tally.bottom + tally.lost;

  const change = (fn: () => void) => {
    fn();
    setTally(NO_TALLY);
  };

  const fire = (n: number) => {
    markExplored();
    setTally((t) => {
      const next = { ...t };
      for (let i = 0; i < n; i++) {
        const hit = fireOnePhoton(result);
        if (hit === 0) next.top++;
        else if (hit === 1) next.bottom++;
        else next.lost++;
      }
      return next;
    });
  };

  const testObject = () => {
    markExplored();
    const hasBomb = Math.random() < 0.5;
    const hit = fireOnePhoton(mzResult(0, hasBomb ? 1 : null));
    const outcome = hit === 'absorbed' ? 'boom' : hit === 0 ? 'found' : 'silent';
    setBombLog((b) => ({ ...b, last: outcome, [outcome]: b[outcome] + 1 }));
  };

  // beam brightness per segment, mapped from the engine's per-element stages
  const stages = result.stages;
  const last = stages.length - 1;
  const segments: [number, number, [number, number]][] = [
    [X.src, X.bs1, stages[0]],
    [X.bs1, X.ph, stages[1]],
    [X.ph, X.bl, stages[2]],
    [X.bl, X.bs2, blocker === null ? stages[2] : stages[3]],
    [X.bs2, X.det, stages[last]],
  ];
  const beam = (p: number) => (p < 0.005 ? 0.06 : 0.15 + 0.85 * Math.min(1, p));

  // fringe plot geometry
  const PW = 320;
  const PH = 110;
  const px = (angle: number) => 10 + (angle / (2 * Math.PI)) * (PW - 20);
  const py = (p: number) => PH - 12 - p * (PH - 28);
  const path = (key: 'top' | 'bottom') => curve.map((c, i) => `${i === 0 ? 'M' : 'L'}${px(c.phi).toFixed(1)},${py(c[key]).toFixed(1)}`).join(' ');


  // what the AI tutor is told if the learner asks about this lab: the settings and readouts, nothing hidden
  useActivityReport({
    id: 'mach_zehnder_lab',
    status: 'playing',
    step: blocker === null ? 'Both arms open' : `The ${blocker === 0 ? 'top' : 'bottom'} arm is blocked`,
    state:
      `Phase ${deg(phi)}°. Chances: top detector ${pct(result.out[0])}, bottom detector ${pct(result.out[1])}${result.absorbed > 0 ? `, absorbed ${pct(result.absorbed)}` : ''}. ` +
      `${total ? `Photons fired: ${total} (top ${tally.top}, bottom ${tally.bottom}${tally.lost ? `, lost ${tally.lost}` : ''}).` : 'No photons fired yet.'}` +
      `${bombLog.last ? ` Bomb test so far: found safely ${bombLog.found}, exploded ${bombLog.boom}, inconclusive ${bombLog.silent}.` : ''}`,
  });

  return (
    <ArcadeFrame theme={THEME}>
      <ArcadeHeader theme={THEME} label="LAB · INTERFERENCE" tag="Accurate" />
      <GameTitle
        title="Mach–Zehnder Lab"
        story="One photon, two paths, two beam splitters. Turn the phase and watch the photon choose a detector. Then block an arm and see the interference vanish."
      />

      <div style={{ ...stageStyle, padding: 6 }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img"
          aria-label={`Mach-Zehnder interferometer. Top detector ${pct(result.out[0])}, bottom detector ${pct(result.out[1])}${result.absorbed > 0 ? `, absorbed ${pct(result.absorbed)}` : ''}.`}>
          {segments.map(([x0, x1, [p0, p1]], k) => (
            <g key={k}>
              <line x1={x0} y1={Y_TOP} x2={x1} y2={Y_TOP} stroke="#ffd23f" strokeWidth="5" strokeLinecap="round" opacity={beam(p0)} />
              <line x1={x0} y1={Y_BOT} x2={x1} y2={Y_BOT} stroke="#ffd23f" strokeWidth="5" strokeLinecap="round" opacity={beam(p1)} />
            </g>
          ))}
          <circle cx={X.src - 8} cy={Y_TOP} r="9" fill="#ff5c8a" stroke="#fff" strokeWidth="2" />
          <text x={X.src - 8} y={Y_TOP - 16} fill="#ddd0fa" fontSize="10" fontWeight="700" textAnchor="middle">Source</text>

          {/* beam splitters */}
          {[X.bs1, X.bs2].map((x, i) => (
            <g key={x}>
              <rect x={x - 16} y={Y_TOP - 20} width="32" height={Y_BOT - Y_TOP + 40} rx="10" fill="rgba(56,200,255,0.12)" stroke={THEME.accent} strokeWidth="2" />
              <line x1={x - 12} y1={Y_TOP - 12} x2={x + 12} y2={Y_BOT + 12} stroke="#fff" strokeWidth="4" strokeLinecap="round" />
              <text x={x} y={Y_BOT + 36} fill="#ddd0fa" fontSize="10" fontWeight="700" textAnchor="middle">Splitter {i + 1}</text>
            </g>
          ))}

          {/* phase shifter on the bottom arm */}
          <rect x={X.ph - 22} y={Y_BOT - 11} width="44" height="22" rx="6" fill="#8b5cf6" stroke="#fff" strokeWidth="2" />
          <text x={X.ph} y={Y_BOT + 4} fill="#fff" fontSize="11" fontWeight="800" textAnchor="middle">{deg(phi)}°</text>
          <text x={X.ph} y={Y_BOT + 36} fill="#ddd0fa" fontSize="10" fontWeight="700" textAnchor="middle">Phase</text>

          {/* blocker */}
          {blocker !== null && (
            <g>
              <rect x={X.bl - 7} y={(blocker === 0 ? Y_TOP : Y_BOT) - 16} width="14" height="32" rx="4" fill="#ff5c8a" stroke="#fff" strokeWidth="2" />
              <text x={X.bl} y={(blocker === 0 ? Y_TOP : Y_BOT) + 30} fill="#ff9ab5" fontSize="10" fontWeight="800" textAnchor="middle">BLOCK</text>
            </g>
          )}

          {/* detectors */}
          {([0, 1] as const).map((port) => {
            const y = port === 0 ? Y_TOP : Y_BOT;
            const p = result.out[port];
            return (
              <g key={port}>
                <circle cx={X.det + 6} cy={y} r="17" fill={`rgba(255,210,63,${0.1 + 0.85 * p})`} stroke="#ffd23f" strokeWidth="2" />
                <text x={X.det + 6} y={y + 4} fill={p > 0.5 ? '#2a0f5c' : '#fff'} fontSize="11" fontWeight="800" textAnchor="middle">{pct(p)}</text>
                <text x={X.det + 6} y={y + (port === 0 ? -22 : 34)} fill="#ddd0fa" fontSize="9" fontWeight="700" textAnchor="middle">{port === 0 ? 'TOP' : 'BOTTOM'}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <LabSlider label="PHASE SHIFT φ" accent={THEME.accent} value={deg(phi)} min={0} max={360} step={5}
        display={`${deg(phi)}°`} onChange={(v) => change(() => setPhi((v * Math.PI) / 180))} />
      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 90, 180, 270].map((a) => (
          <button key={a} className="chip" aria-pressed={deg(phi) === a} onClick={() => change(() => setPhi((a * Math.PI) / 180))}
            style={groupChip}>{a}°</button>
        ))}
      </div>

      <div>
        <Eyebrow>ARM BLOCKER</Eyebrow>
        <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
          {BLOCKERS.map((b) => (
            <button key={b.id} className="chip" aria-pressed={blocker === b.value} onClick={() => change(() => setBlocker(b.value))}
              style={groupChip}>{b.label}</button>
          ))}
        </div>
      </div>

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Eyebrow>FIRE PHOTONS, ONE AT A TIME</Eyebrow>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-sky" style={{ flex: 1 }} onClick={() => fire(1)}><Zap size={18} fill="currentColor" /> <span>Fire 1</span></button>
          <button className="btn" style={{ flex: 1 }} onClick={() => fire(100)}><span>Fire 100</span></button>
          <button className="chip" aria-label="Clear the tally" onClick={() => setTally(NO_TALLY)} style={{ minWidth: 44, justifyContent: 'center' }}><RotateCcw size={16} /></button>
        </div>
        <BarChart theme={THEME} bars={[
          { label: 'TOP', expected: result.out[0], observed: total ? tally.top / total : undefined },
          { label: 'BOT', expected: result.out[1], observed: total ? tally.bottom / total : undefined },
          ...(blocker !== null ? [{ label: 'LOST', expected: result.absorbed, observed: total ? tally.lost / total : undefined }] : []),
        ]} />
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {total === 0 ? 'No photons fired yet. The dashed line marks what the maths predicts.' : `${total} photon${total === 1 ? '' : 's'} fired. Each one lands in exactly one place.`}
        </div>
      </div>

      <div style={panelStyle}>
        <Eyebrow>INTERFERENCE FRINGES: ODDS VS PHASE</Eyebrow>
        <svg viewBox={`0 0 ${PW} ${PH}`} width="100%" role="img" aria-label="Detector probability against phase" style={{ marginTop: 6 }}>
          <line x1="10" y1={py(0)} x2={PW - 10} y2={py(0)} stroke="rgba(255,255,255,0.25)" />
          <line x1="10" y1={py(1)} x2={PW - 10} y2={py(1)} stroke="rgba(255,255,255,0.12)" strokeDasharray="3 4" />
          <path d={path('top')} fill="none" stroke="#ffd23f" strokeWidth="3" />
          <path d={path('bottom')} fill="none" stroke="#38c8ff" strokeWidth="3" strokeDasharray="7 4" />
          <line x1={px(phi)} y1="6" x2={px(phi)} y2={py(0)} stroke="#fff" strokeWidth="2" />
          <circle cx={px(phi)} cy={py(result.out[0])} r="5" fill="#ffd23f" stroke="#fff" strokeWidth="2" />
          <circle cx={px(phi)} cy={py(result.out[1])} r="5" fill="#38c8ff" stroke="#fff" strokeWidth="2" />
          <text x="10" y={PH - 1} fill="#ddd0fa" fontSize="9">0°</text>
          <text x={PW / 2} y={PH - 1} fill="#ddd0fa" fontSize="9" textAnchor="middle">180°</text>
          <text x={PW - 10} y={PH - 1} fill="#ddd0fa" fontSize="9" textAnchor="end">360°</text>
        </svg>
        <div style={{ display: 'flex', gap: 14, fontSize: '0.78rem', fontWeight: 700, flexWrap: 'wrap' }}>
          <span style={{ color: '#ffd23f' }}>━ top detector</span>
          <span style={{ color: '#38c8ff' }}>╌ bottom detector</span>
        </div>
      </div>

      {blocker === null ? (
        <Banner tone="info" title="BOTH PATHS AT ONCE">
          With nothing blocked the two paths recombine. At 0° they cancel at the top detector and add at the bottom one; at 180° it flips. The photon never splits in two, its <b>probability amplitude</b> does.
        </Banner>
      ) : (
        <Banner tone="warn" title="WHICH PATH? NO MORE FRINGES">
          Blocking an arm means the photon is now known to be in the other one. There is nothing left to interfere, so each detector gets 25% at every phase and 50% is absorbed.
        </Banner>
      )}

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Eyebrow color="#ffd23f">BONUS: THE BOMB TEST</Eyebrow>
        <p style={{ fontSize: '0.88rem', lineHeight: 1.5, color: '#f1eaff' }}>
          A hidden object may sit in the bottom arm. The phase is fixed at 0°, so the <b>top detector is dark</b> when the arm is empty. If it ever clicks, something is in the way, and we know it without the photon touching it (1 time in 4 when there is one).
        </p>
        <button className="btn btn-violet" onClick={testObject}><span>Test a fresh hidden object</span></button>
        {bombLog.last && (
          <Banner tone={bombLog.last === 'found' ? 'good' : bombLog.last === 'boom' ? 'bad' : 'info'}
            title={bombLog.last === 'found' ? 'FOUND IT, NO BANG' : bombLog.last === 'boom' ? 'BOOM' : 'NO INFORMATION'}>
            {bombLog.last === 'found' && 'The dark top detector clicked. The arm must have been blocked, yet the photon was never absorbed.'}
            {bombLog.last === 'boom' && 'The photon went down the blocked arm and was absorbed. There was an object, and it caught the photon.'}
            {bombLog.last === 'silent' && 'The bright detector clicked, which happens whether or not there is an object. Try again.'}
          </Banner>
        )}
        {(bombLog.boom + bombLog.found + bombLog.silent) > 0 && (
          <div style={{ fontFamily: RETRO, fontSize: '1.2rem' }}>
            found safely {bombLog.found} · exploded {bombLog.boom} · inconclusive {bombLog.silent}
          </div>
        )}
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          With an object present the maths says: {pct(bombTest(true).boom)} absorbed, {pct(bombTest(true).found)} found safely, {pct(bombTest(true).silent)} inconclusive.
        </div>
      </div>

      <MathBox open={showMath} onToggle={() => setShowMath((v) => !v)}>
        {result.amplitudes.map((a, k) => (
          <div key={k}>{k === 0 ? 'start' : `step ${k}`}: ({fmtAmp(a[0])}, {fmtAmp(a[1])})</div>
        ))}
        <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
          Without a blocker: P(top) = sin²(φ/2), P(bottom) = cos²(φ/2). The amplitudes of the two routes add, so they can cancel.
        </div>
      </MathBox>

      <InfoBox title="HOW TO READ THIS">
        Brighter beam = higher chance of finding the photon on that path. Idealised model: perfect 50/50 splitters, no losses, one photon at a time.
      </InfoBox>
    </ArcadeFrame>
  );
};
