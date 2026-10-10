import React from 'react';
import { Sparkles } from 'lucide-react';
import type { TutorFocus } from '../../core/tutor/types';

interface Props {
  /** Where this part is, in a few words. It steers the tutor's search, so use words from the part itself. */
  label: string;
  /** The plain text of the part, exactly as the learner sees it. */
  text: string;
  /** A practice problem: the tutor must not give the final answer. */
  noAnswer?: boolean;
  onAsk: (focus: TutorFocus) => void;
}

/** "Ask about this": opens the tutor with the text of one part of the page, so the learner does not have to retype it. */
export const AskButton: React.FC<Props> = ({ label, text, noAnswer, onAsk }) => (
  <button
    className="chip"
    onClick={() => onAsk({ label, text, ...(noAnswer ? { noAnswer: true } : {}) })}
    aria-label={`Ask Dr Quantum about this: ${label}`}
    style={{ alignSelf: 'flex-start', minHeight: 44, fontSize: '0.56rem' }}
  >
    <Sparkles size={14} color="var(--yellow)" />
    <span>Ask about this</span>
  </button>
);
