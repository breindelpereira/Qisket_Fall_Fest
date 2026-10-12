import React, { useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useActivityReport } from '../../hooks/useActivityReport';
import { ArcadeFrame, ArcadeHeader, Banner, Eyebrow, GameTitle } from '../shared/Arcade';
import { RETRO, THEMES, groupChip, panelStyle } from '../shared/arcadeTheme';
import { HARDWARE, HARDWARE_BY_ID } from '../../content/hardwareData';
import { NOT_GIVEN, cardFor, sortRecords, toggleSelection } from '../../core/hardware/comparison';
import type { SortKey } from '../../core/hardware/comparison';
import { InfoBox } from './labKit';
import { useExplored } from './labUtils';

const THEME = THEMES.sky;

const SORTS: { key: SortKey; label: string; dir: 'asc' | 'desc' }[] = [
  { key: 'qubits', label: 'Most qubits', dir: 'desc' },
  { key: 'twoQubitError', label: 'Lowest error', dir: 'asc' },
  { key: 'asOf', label: 'Newest source', dir: 'desc' },
];

export const ComparisonDashboard: React.FC = () => {
  const markExplored = useExplored('comparison_dashboard', 'concept_hardware');
  const [selected, setSelected] = useState<string[]>(['google_willow', 'quantinuum_h2', 'harvard_rydberg']);
  const [sortKey, setSortKey] = useState<number>(0);

  const ordered = useMemo(() => sortRecords(HARDWARE, SORTS[sortKey].key, SORTS[sortKey].dir), [sortKey]);
  const cards = selected.map((id) => HARDWARE_BY_ID[id]).filter(Boolean).map(cardFor);

  useActivityReport({
    id: 'comparison_dashboard',
    status: 'playing',
    step: `Comparing ${cards.length} system${cards.length === 1 ? '' : 's'}`,
    state: cards.length
      ? `Showing: ${cards.map((c) => `${c.title} (${c.rows.slice(0, 2).map((r) => `${r.label.toLowerCase()} ${r.value}`).join(', ')}; source dated ${c.asOf})`).join('; ')}.`
      : 'Nothing is selected yet.',
  });

  return (
    <ArcadeFrame theme={THEME}>
      <ArcadeHeader theme={THEME} label="LAB · COMPARE MACHINES" tag="Simplified model" />
      <GameTitle
        title="Comparison Dashboard"
        story="Pick up to three real systems and put their published figures side by side. Every number comes with its source and the date of that source, and a figure the source does not give is left blank."
      />

      <Banner tone="warn" title="READ THIS FIRST">
        These are single devices and experiments from different years, measured in different ways. Qubit counts and error rates are not directly comparable between kinds of machine, and a lower number is not always a better machine. Figures change quickly.
      </Banner>

      <div>
        <Eyebrow>ORDER THE LIST BY</Eyebrow>
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          {SORTS.map((s, i) => (
            <button key={s.key} className="chip" aria-pressed={sortKey === i} onClick={() => { markExplored(); setSortKey(i); }} style={groupChip}>{s.label}</button>
          ))}
        </div>
      </div>

      <div>
        <Eyebrow>CHOOSE UP TO THREE</Eyebrow>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
          {ordered.map((r) => (
            <button key={r.id} className="chip" aria-pressed={selected.includes(r.id)}
              onClick={() => { markExplored(); setSelected((s) => toggleSelection(s, r.id)); }}
              style={{ ...groupChip, flex: '1 1 45%', minHeight: 48 }}>
              {selected.includes(r.id) ? '✓ ' : ''}{r.system}
            </button>
          ))}
        </div>
      </div>

      {cards.length === 0 && <div style={{ ...panelStyle, fontSize: '0.9rem' }}>Choose a system above to see its card.</div>}

      {cards.map((c) => (
        <div key={c.title} style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 8, borderColor: THEME.accent }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem' }}>{c.title}</div>
            <div style={{ fontSize: '0.78rem', color: THEME.accent, fontWeight: 700 }}>{c.modality}</div>
          </div>
          <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.4fr)', gap: '6px 10px' }}>
            {c.rows.map((row) => (
              <React.Fragment key={row.label}>
                <dt style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>{row.label}</dt>
                <dd style={{ margin: 0, fontFamily: row.value.length < 18 ? RETRO : undefined, fontSize: row.value.length < 18 ? '1.25rem' : '0.82rem', lineHeight: 1.25, opacity: row.value === NOT_GIVEN ? 0.6 : 1 }}>
                  {row.value}
                </dd>
              </React.Fragment>
            ))}
          </dl>
          <div style={{ fontSize: '0.84rem', lineHeight: 1.45 }}><b>What it does not show.</b> {c.caveat}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Source: {c.source}. Dated {c.asOf}.{' '}
            <a href={c.url} target="_blank" rel="noopener noreferrer" style={{ color: THEME.accent, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4, minHeight: 44 }}>
              Open the source <ExternalLink size={13} />
            </a>
          </div>
        </div>
      ))}

      <InfoBox title="HONEST NOTE">
        This list is short on purpose and is not a ranking. It contains the sources we could check and quote, one or two per kind of machine, so a missing system means it is not in this list, not that it is worse. See the file <code>src/content/hardwareData.ts</code> for how a figure is added or refreshed.
      </InfoBox>
    </ArcadeFrame>
  );
};
