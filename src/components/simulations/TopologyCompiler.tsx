import React, { useMemo, useState } from 'react';
import { useActivityReport } from '../../hooks/useActivityReport';
import { ArcadeFrame, ArcadeHeader, Eyebrow, GameTitle } from '../shared/Arcade';
import { THEMES, groupChip, panelStyle } from '../shared/arcadeTheme';
import { CIRCUITS, TOPOLOGIES, circuitById, route, topologyById } from '../../core/hardware/routing';
import type { TopologyId } from '../../core/hardware/routing';
import { InfoBox, MathBox, ReadoutGrid } from './labKit';
import { useExplored } from './labUtils';

const THEME = THEMES.mint;

/** Positions of n qubits for drawing: a row, a small grid, or a ring. */
function layout(kind: TopologyId, n: number): { x: number; y: number }[] {
  if (kind === 'line') return Array.from({ length: n }, (_, i) => ({ x: 30 + (i * 260) / Math.max(1, n - 1), y: 50 }));
  if (kind === 'grid') {
    const cols = n <= 4 ? 2 : 3;
    const rows = Math.ceil(n / cols);
    return Array.from({ length: n }, (_, i) => ({
      x: 60 + ((i % cols) * 200) / Math.max(1, cols - 1),
      y: 25 + (Math.floor(i / cols) * 60) / Math.max(1, rows - 1) * (rows > 1 ? 1 : 0) + (rows === 1 ? 25 : 0),
    }));
  }
  return Array.from({ length: n }, (_, i) => ({ x: 160 + 90 * Math.cos((2 * Math.PI * i) / n - Math.PI / 2), y: 52 + 40 * Math.sin((2 * Math.PI * i) / n - Math.PI / 2) }));
}

export const TopologyCompiler: React.FC = () => {
  const markExplored = useExplored('topology_compiler', 'concept_hardware');
  const [circuitId, setCircuitId] = useState('all_pairs');
  const [topologyId, setTopologyId] = useState<TopologyId>('line');
  const [showMath, setShowMath] = useState(false);

  const circuit = circuitById(circuitId);
  const topology = topologyById(topologyId);
  const result = useMemo(() => route(circuit, topologyId), [circuit, topologyId]);
  const all = useMemo(() => TOPOLOGIES.map((t) => ({ t, r: route(circuit, t.id) })), [circuit]);
  const adj = topology.neighbours(circuit.qubits);
  const pos = layout(topologyId, circuit.qubits);
  const worst = Math.max(...all.map((a) => a.r.cnots), 1);

  useActivityReport({
    id: 'topology_compiler',
    status: 'playing',
    step: `${circuit.name} on ${topology.name.toLowerCase()}`,
    state:
      `The circuit has ${result.gates} two-qubit gates on ${circuit.qubits} qubits (${circuit.about}). On this layout the compiler adds ${result.swaps} SWAPs, ` +
      `so ${result.cnots} CNOTs instead of ${result.gates}. Everyone-to-everyone would need 0 SWAPs.`,
  });

  return (
    <ArcadeFrame theme={THEME}>
      <ArcadeHeader theme={THEME} label="LAB · CONNECTIVITY" tag="Simplified model" />
      <GameTitle
        title="Topology Compiler"
        story="Two qubits can only interact if they touch. When they do not, the compiler has to carry one across with SWAP gates, and every SWAP is three more gates that can fail. See what a layout costs."
      />

      <div>
        <Eyebrow>THE CIRCUIT</Eyebrow>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
          {CIRCUITS.map((c) => (
            <button key={c.id} className="chip" aria-pressed={circuitId === c.id}
              onClick={() => { markExplored(); setCircuitId(c.id); }} style={{ ...groupChip, flex: '1 1 30%' }}>{c.name}</button>
          ))}
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.4 }}>
          {circuit.qubits} qubits, {circuit.gates.length} gates: {circuit.about}.
        </div>
      </div>

      <div>
        <Eyebrow>THE HARDWARE LAYOUT</Eyebrow>
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          {TOPOLOGIES.map((t) => (
            <button key={t.id} className="chip" aria-pressed={topologyId === t.id}
              onClick={() => { markExplored(); setTopologyId(t.id); }} style={groupChip}>{t.name}</button>
          ))}
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 6 }}>Like {topology.example}.</div>
      </div>

      <div style={panelStyle}>
        <svg viewBox="0 0 320 110" width="100%" role="img" aria-label={`${topology.name}: ${circuit.qubits} qubits`}>
          {adj.flatMap((ns, a) => ns.filter((b) => b > a).map((b) => (
            <line key={`${a}-${b}`} x1={pos[a].x} y1={pos[a].y} x2={pos[b].x} y2={pos[b].y} stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
          )))}
          {pos.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="12" fill={THEME.accent} stroke="#fff" strokeWidth="1.5" />
              <text x={p.x} y={p.y + 4} fontSize="11" fontWeight="800" fill="#1d0848" textAnchor="middle">{i}</text>
            </g>
          ))}
        </svg>
      </div>

      <ReadoutGrid items={[
        { label: 'SWAPs added', value: String(result.swaps), note: result.swaps === 0 ? 'every gate was already between neighbours' : 'each is three CNOTs' },
        { label: 'CNOTs in total', value: `${result.cnots}`, note: `${result.gates} in the circuit as written` },
      ]} />

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Eyebrow>THE SAME CIRCUIT ON EACH LAYOUT (CNOTs)</Eyebrow>
        {all.map(({ t, r }) => (
          <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '112px 1fr 38px', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{t.name}{t.id === topologyId ? ' ◀' : ''}</span>
            <div style={{ height: 16, background: 'rgba(255,255,255,0.08)', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ width: `${(r.cnots / worst) * 100}%`, height: '100%', background: THEME.accent }} />
            </div>
            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.6rem', textAlign: 'right' }}>{r.cnots}</span>
          </div>
        ))}
      </div>

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Eyebrow>WHAT THE COMPILER DID</Eyebrow>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: '0.88rem', lineHeight: 1.6 }}>
          {result.steps.map((s, i) => (
            <li key={i}>
              Gate on {s.gate[0]} and {s.gate[1]}:{' '}
              {s.swaps.length === 0 ? 'already neighbours, no SWAP.' : `SWAP ${s.swaps.map(([a, b]) => `${a}↔${b}`).join(', ')}, then the gate.`}
            </li>
          ))}
        </ol>
      </div>

      <MathBox open={showMath} onToggle={() => setShowMath((v) => !v)}>
        <div>gates = {result.gates}, SWAPs = {result.swaps}</div>
        <div>CNOTs = gates + 3 × SWAPs = {result.gates} + {3 * result.swaps} = {result.cnots}</div>
        <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
          A SWAP of two qubits is three CNOTs: CNOT(a,b), CNOT(b,a), CNOT(a,b).
        </div>
      </MathBox>

      <InfoBox title="HONEST NOTE">
        This is a simple shortest-path router: it carries one qubit towards the other and remembers the new arrangement. Real compilers choose better starting positions and smarter orders, so they do at least as well. Note that no layout wins every time: the chain circuit is perfect for a line and awkward for a 2 × 2 grid.
      </InfoBox>
    </ArcadeFrame>
  );
};
