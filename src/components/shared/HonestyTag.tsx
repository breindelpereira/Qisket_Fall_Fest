import React, { useState } from 'react';
import type { HonestyTag } from '../../content/types';
import { Info, X } from 'lucide-react';


interface Props {
  tag: HonestyTag;
  showInfoButton?: boolean;
}

const TAG_CONFIG: Record<HonestyTag, { color: string; bg: string; border: string; explanation: string }> = {
  Analogy: {
    color: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.12)',
    border: 'rgba(251, 191, 36, 0.3)',
    explanation: 'An intuitive metaphor. While it builds helpful mental models, real quantum particles do not physically behave like this macro-analogy.',
  },
  'Simplified model': {
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.12)',
    border: 'rgba(56, 189, 248, 0.3)',
    explanation: 'Mathematically sound within toy constraints, but simplifies noise, decoherence, or higher-order physical interactions.',
  },
  Accurate: {
    color: '#34d399',
    bg: 'rgba(52, 211, 153, 0.12)',
    border: 'rgba(52, 211, 153, 0.3)',
    explanation: 'A physically and mathematically rigorous representation adhering directly to quantum mechanical unitaries and measurement rules.',
  },
  'Experimental/Contested': {
    color: '#f43f5e',
    bg: 'rgba(244, 63, 94, 0.12)',
    border: 'rgba(244, 63, 94, 0.3)',
    explanation: 'Represents active, non-standardized frontier research where hardware realization is unverified or subject to ongoing scientific debate.',
  },
};

export const HonestyTagBadge: React.FC<Props> = ({ tag, showInfoButton = true }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const cfg = TAG_CONFIG[tag] || TAG_CONFIG['Simplified model'];

  return (
    <>
      <span
        onClick={() => showInfoButton && setModalOpen(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '2px 8px',
          borderRadius: 6,
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          color: cfg.color,
          fontSize: '0.68rem',
          fontWeight: 700,
          cursor: showInfoButton ? 'pointer' : 'default',
          userSelect: 'none',
        }}
      >
        <span>{tag}</span>
        {showInfoButton && <Info size={11} />}
      </span>

      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            zIndex: 100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#131943',
              border: `1px solid ${cfg.border}`,
              borderRadius: 16,
              padding: 18,
              maxWidth: 320,
              boxShadow: '0 12px 30px rgba(0,0,0,0.8)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: cfg.color }}>
                Honesty Tag: {tag}
              </span>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'transparent', color: '#94a3b8', padding: 4 }}
              >
                <X size={16} />
              </button>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#e2e8f0', lineHeight: 1.5 }}>
              {cfg.explanation}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
