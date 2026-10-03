import React, { useEffect, useMemo, useState } from 'react';
import { Play, Trash2 } from 'lucide-react';
import { ArcadeFrame, ArcadeHeader, Banner, Eyebrow, GameTitle } from '../shared/Arcade';
import { RETRO, THEMES, groupChip, panelStyle, stageStyle } from '../shared/arcadeTheme';
import {
  GATE_NAMES, MAX_QUBITS, PRESETS, basisLabel, clearCell, emptyCircuit, gateCount, itemAt, placeCnot, placeGate,
  resizeCircuit, runCircuit,
} from '../../core/labs/circuitBuilder';
import type { Circuit, GateName } from '../../core/labs/circuitBuilder';
import { BarChart, InfoBox, MathBox } from './labKit';
import { fmtAmp, useExplored } from './labUtils';

const THEME = THEMES.orange;

type Tool = GateName | 'CNOT' | 'ERASE';

const TOOL_HELP: Record<Tool, string> = {
  H: 'Hadamard: turns a definite 0 or 1 into an even superposition, and back again.',
  X: 'X: flips 0 and 1 (the quantum NOT).',
  Y: 'Y: flips 0 and 1 and adds a quarter-turn of phase.',
  Z: 'Z: leaves 0 alone and flips the sign of 1. You cannot see it directly, only through interference.',
  S: 'S: a quarter turn of phase on the 1 part (Z is two S gates).',
  T: 'T: an eighth turn of phase (S is two T gates). Needed for universal quantum computing.',
  CNOT: 'CNOT: flips the target qubit only when the control is 1. This is how qubits get entangled. Tap the control cell, then a target cell in the same column.',
  ERASE: 'Eraser: tap a cell to remove its gate.',
};

const CELL = 46;

export const CircuitLab: React.FC = () => {
  const markExplored = useExplored('circuit_lab', 'concept_gates');
  const [circuit, setCircuit] = useState<Circuit>(() => emptyCircuit(2));
  const [tool, setTool] = useState<Tool>('H');
  const [control, setControl] = useState<{ col: number; qubit: number } | null>(null);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [showMath, setShowMath] = useState(false);
  const [presetNote, setPresetNote] = useState<string | null>(null);

  const state = useMemo(() => runCircuit(circuit), [circuit]);
  const probs = state.getProbabilities();
  const n = circuit.numQubits;
  const gates = gateCount(circuit);

  useEffect(() => {
    if (gates >= 2) markExplored();
  }, [gates, markExplored]);

  const edit = (next: Circuit) => {
    setCircuit(next);
    setCounts(null);
    setPresetNote(null);
  };

  const tap = (col: number, qubit: number) => {
    if (tool === 'ERASE') { setControl(null); edit(clearCell(circuit, col, qubit)); return; }
    if (tool === 'CNOT') {
      if (!control || control.col !== col) { setControl({ col, qubit }); return; }
      if (control.qubit === qubit) { setControl(null); return; }
      edit(placeCnot(circuit, col, control.qubit, qubit));
      setControl(null);
      return;
    }
    setControl(null);
    edit(placeGate(circuit, col, qubit, tool));
  };

  const chooseTool = (t: Tool) => { setTool(t); setControl(null); };

  const sample = () => {
    markExplored();
    setCounts(state.sampleCounts(1000));
  };

  const total = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0;
  const bars = probs.map((p, i) => {
    const key = i.toString(2).padStart(n, '0');
    return { label: key, expected: p, observed: counts ? (counts[key] ?? 0) / total : undefined, note: counts ? `${counts[key] ?? 0} shots` : undefined };
  });

  const cellContent = (col: number, qubit: number): { text: string; label: string } => {
    const item = itemAt(circuit, col, qubit);
    if (!item) {
      const spans = circuit.columns[col].find((p) => p.kind === 'cnot' && qubit > Math.min(p.control, p.target) && qubit < Math.max(p.control, p.target));
      return spans ? { text: '│', label: 'wire crossed by a CNOT' } : { text: '', label: 'empty' };
    }
    if (item.kind === 'gate') return { text: item.gate, label: `${item.gate} gate` };
    return item.control === qubit ? { text: '●', label: 'CNOT control' } : { text: '⊕', label: 'CNOT target' };
  };

  return (
    <ArcadeFrame theme={THEME}>
      <ArcadeHeader theme={THEME} label="LAB · GATES" tag="Accurate" />
      <GameTitle
        title="Circuit Lab"
        story="Build a quantum circuit gate by gate and see the exact result at the end. Time runs left to right, one wire per qubit, every wire starts as 0."
      />

      <div>
        <Eyebrow>QUBITS</Eyebrow>
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          {Array.from({ length: MAX_QUBITS }, (_, i) => i + 1).map((q) => (
            <button key={q} className="chip" aria-pressed={n === q} onClick={() => { setControl(null); if (tool === 'CNOT' && q === 1) setTool('H'); edit(resizeCircuit(circuit, q)); }}
              style={groupChip}>{q}</button>
          ))}
        </div>
      </div>

      <div>
        <Eyebrow>PICK A GATE, THEN TAP THE GRID</Eyebrow>
        <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
          {GATE_NAMES.map((g) => (
            <button key={g} className="chip" aria-pressed={tool === g} onClick={() => chooseTool(g)}
              style={{ ...groupChip, flex: '1 1 14%', minWidth: 44, fontFamily: RETRO, fontSize: '1.3rem' }}>{g}</button>
          ))}
          <button className="chip" aria-pressed={tool === 'CNOT'} disabled={n < 2} onClick={() => chooseTool('CNOT')}
            style={{ ...groupChip, opacity: n < 2 ? 0.45 : 1 }}>CNOT</button>
          <button className="chip" aria-pressed={tool === 'ERASE'} onClick={() => chooseTool('ERASE')}
            style={groupChip}>Erase</button>
        </div>
        <p style={{ fontSize: '0.84rem', lineHeight: 1.45, color: 'var(--text-secondary)', marginTop: 8 }}>
          {tool === 'CNOT' && control ? `Control set on q${control.qubit}. Now tap the target in the same column.` : TOOL_HELP[tool]}
        </p>
      </div>

      <div style={{ ...stageStyle, padding: 10, overflowX: 'auto' }}>
        <div role="grid" aria-label="Quantum circuit" style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 'max-content' }}>
          {Array.from({ length: n }, (_, q) => (
            <div key={q} role="row" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: RETRO, fontSize: '1.3rem', width: 34, color: 'var(--text-secondary)' }}>q{q}</span>
              {circuit.columns.map((_, col) => {
                const { text, label } = cellContent(col, q);
                const pending = control?.col === col && control.qubit === q;
                const filled = text !== '' && text !== '│';
                return (
                  <button key={col} role="gridcell" aria-label={`Wire ${q}, step ${col + 1}: ${label}`} onClick={() => tap(col, q)}
                    style={{
                      width: CELL, height: CELL, flex: '0 0 auto', borderRadius: 12, fontFamily: RETRO, fontSize: '1.5rem',
                      color: filled ? '#2a0f5c' : '#fff',
                      background: filled ? THEME.accent : 'rgba(255,255,255,0.06)',
                      border: pending ? '3px solid #fff' : `2px ${filled ? 'solid' : 'dashed'} ${filled ? THEME.edge : 'rgba(255,255,255,0.25)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                    {text}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: -6 }}>Time runs left to right. Swipe the grid sideways for more steps.</div>

      <div style={{ display: 'flex', gap: 6 }}>
        <button className="btn btn-orange" style={{ flex: 1 }} onClick={sample}>
          <Play size={18} fill="currentColor" /> <span>Run 1000 shots</span>
        </button>
        <button className="chip" aria-label="Clear the circuit" onClick={() => edit(emptyCircuit(n))} style={{ minWidth: 44, justifyContent: 'center' }}>
          <Trash2 size={16} />
        </button>
      </div>

      <div>
        <Eyebrow>OR START FROM A FAMOUS CIRCUIT</Eyebrow>
        <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
          {PRESETS.map((p) => (
            <button key={p.id} className="chip" onClick={() => { setControl(null); setCircuit(p.circuit); setCounts(null); setPresetNote(p.blurb); }}
              style={{ ...groupChip, flex: '1 1 40%' }}>{p.label}</button>
          ))}
        </div>
        {presetNote && <p style={{ fontSize: '0.84rem', lineHeight: 1.45, color: '#f1eaff', marginTop: 8 }}>{presetNote}</p>}
      </div>

      <div style={panelStyle}>
        <Eyebrow>RESULT: {counts ? 'MEASURED BARS, DASHED LINE = PREDICTION' : 'EXACT PROBABILITIES'}</Eyebrow>
        <div style={{ marginTop: 10 }}>
          <BarChart theme={THEME} bars={bars} />
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 8 }}>
          {n > 1 ? `Bitstrings read q${n - 1} … q0, the same order as Qiskit.` : 'One qubit: the bar for 0 and the bar for 1.'}
        </div>
      </div>

      {gates === 0 && <Banner tone="info">An empty circuit leaves every qubit at 0. Try an H gate on q0.</Banner>}

      <MathBox open={showMath} onToggle={() => setShowMath((v) => !v)}>
        {state.amplitudes.map((a, i) => (
          Math.abs(a.re) + Math.abs(a.im) > 0.0005 ? <div key={i}>amp {basisLabel(i, n)} = {fmtAmp(a)}</div> : null
        ))}
        <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
          The probability of each outcome is the squared size of its amplitude. Amplitudes can be negative or complex, which is why gates that look like they "do nothing" (Z, S, T) still change what later gates do.
        </div>
      </MathBox>

      <InfoBox title="WHAT THIS IS">
        An exact simulator for up to 3 qubits: it tracks every amplitude, so it shows what an ideal quantum computer would do. Real hardware adds noise and gives only samples.
      </InfoBox>
    </ArcadeFrame>
  );
};
