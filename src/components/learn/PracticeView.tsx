import React, { useRef, useState } from 'react';
import { Check, ChevronDown, ChevronUp, Lightbulb, RefreshCw } from 'lucide-react';
import type { PracticeProblem } from '../../content/practice';
import { hasVariants, nextSeed, variantOf } from '../../content/practiceVariants';
import { checkCells, sameAnswer } from '../../core/math/answer';
import type { Verdict } from '../../core/math/answer';
import { snippet } from '../../core/tutor/focus';
import type { TutorFocus } from '../../core/tutor/types';
import { useProgress } from '../../hooks/useProgress';
import { Banner, Eyebrow } from '../shared/Arcade';
import { AskButton } from './AskButton';
import { MathView } from './MathView';

/** Symbols a phone keyboard makes hard to reach. */
const SYMBOLS = ['√', 'π', 'i', '/', '−', '^', '(', ')'];

const cellCount = (p: PracticeProblem): number =>
  p.shape.kind === 'number' ? 1 : p.shape.kind === 'vector' ? p.shape.length : p.shape.rows * p.shape.cols;

type Outcome =
  | { kind: 'right' }
  | { kind: 'phase' }
  | { kind: 'unreadable'; cell: number }
  | { kind: 'known'; feedback: string }
  | { kind: 'wrong' };

function judge(p: PracticeProblem, given: string[]): Outcome {
  const verdict: Verdict = checkCells(given, p.answer, { tolerance: p.tolerance, upToGlobalPhase: p.upToGlobalPhase });
  if (verdict.kind !== 'wrong') return verdict;
  const known = p.commonWrong.find((w) => sameAnswer(given, w.answer, p.tolerance));
  return known ? { kind: 'known', feedback: known.feedback } : { kind: 'wrong' };
}

const inputStyle: React.CSSProperties = {
  minHeight: 48, minWidth: 0, flex: 1, background: 'rgba(0, 0, 0, 0.3)', border: '2px solid var(--border-subtle)',
  borderRadius: 12, padding: '8px 10px', color: '#fff', fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-family)',
};

const ProblemCard: React.FC<{
  problem: PracticeProblem;
  index: number;
  solved: boolean;
  startOpen: boolean;
  onSolved: (id: string) => void;
  onAsk?: (focus: TutorFocus) => void;
  /** Asks the same kind of problem again with different numbers (only for problems that have variants). */
  onNewNumbers?: () => void;
}> = ({ problem: p, index, solved, startOpen, onSolved, onAsk, onNewNumbers }) => {
  const n = cellCount(p);
  const [cells, setCells] = useState<string[]>(() => Array.from({ length: n }, () => ''));
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [hints, setHints] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [open, setOpen] = useState(startOpen);
  const focusedCell = useRef(0);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const check = () => {
    const result = judge(p, cells);
    setOutcome(result);
    setAttempts((a) => a + 1);
    if (result.kind === 'right') onSolved(p.id);
  };

  const insert = (symbol: string) => {
    const k = focusedCell.current;
    const el = inputs.current[k];
    const start = el?.selectionStart ?? cells[k].length;
    const end = el?.selectionEnd ?? start;
    const value = cells[k].slice(0, start) + symbol + cells[k].slice(end);
    setCells((c) => c.map((v, j) => (j === k ? value : v)));
    setOutcome(null);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + symbol.length, start + symbol.length);
    });
  };

  const done = outcome?.kind === 'right' || solved;
  const columns = p.shape.kind === 'matrix' ? p.shape.cols : 1;

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', borderColor: done ? '#2ee6a6' : undefined }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{ width: '100%', minHeight: 56, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', color: 'inherit', background: 'transparent' }}
      >
        <span aria-hidden="true" style={{
          width: 30, height: 30, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: done ? '#2ee6a6' : 'rgba(255,255,255,0.12)', color: done ? '#0b2a20' : '#fff', fontWeight: 800,
        }}>
          {done ? <Check size={18} /> : index + 1}
        </span>
        <span style={{ flex: 1, fontWeight: 800, fontSize: '0.95rem' }}>
          {p.title}
          {done && <span className="sr-only"> (solved)</span>}
        </span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {open && (
        <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: '0.98rem', lineHeight: 1.5 }}>{p.statement}</p>
          {p.math && <MathView expr={p.math} />}

          <div
            role="group"
            aria-label="Your answer"
            style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: 8, alignItems: 'center' }}
          >
            {cells.map((value, k) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                <input
                  ref={(el) => { inputs.current[k] = el; }}
                  value={value}
                  inputMode="text"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  aria-label={n === 1 ? 'Answer' : p.shape.kind === 'matrix' ? `Row ${Math.floor(k / columns) + 1}, column ${(k % columns) + 1}` : `Entry ${k + 1} of ${n}`}
                  placeholder={n === 1 ? 'type your answer' : ''}
                  onFocus={() => { focusedCell.current = k; }}
                  onChange={(e) => {
                    setCells((c) => c.map((v, j) => (j === k ? e.target.value : v)));
                    setOutcome(null);
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') check(); }}
                  style={{
                    ...inputStyle,
                    ...(outcome?.kind === 'unreadable' && outcome.cell === k ? { borderColor: '#ff5c8a' } : {}),
                  }}
                />
                {p.unit && k === n - 1 && <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{p.unit}</span>}
              </div>
            ))}
          </div>

          <div aria-label="Symbols" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {SYMBOLS.map((s) => (
              <button
                key={s}
                className="chip"
                // keep the cursor in the field: a button must not steal focus when it is pressed
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insert(s)}
                aria-label={`Insert ${s === 'i' ? 'i, the imaginary unit' : s === '−' ? 'minus' : s}`}
                style={{ minWidth: 44, minHeight: 44, justifyContent: 'center', fontSize: '1.1rem', fontFamily: 'var(--font-family)', fontWeight: 800 }}
              >
                {s}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-mint" onClick={check} disabled={cells.every((c) => c.trim() === '')} style={{ flex: '1 1 140px' }}>
              <span>Check</span>
            </button>
            <button
              className="chip"
              onClick={() => setHints((h) => Math.min(2, h + 1))}
              disabled={hints >= 2}
              style={{ minHeight: 48 }}
            >
              <Lightbulb size={16} /> {hints === 0 ? 'Hint' : hints === 1 ? 'Another hint' : 'No more hints'}
            </button>
            {onNewNumbers && (done || attempts > 0) && (
              <button className="chip" onClick={onNewNumbers} style={{ minHeight: 48 }}>
                <RefreshCw size={16} /> New numbers
              </button>
            )}
          </div>

          {outcome?.kind === 'right' && (
            <Banner tone="good" title="CORRECT!">
              {attempts === 1 && hints === 0 ? 'First try, no hints.' : 'You worked it out.'} Any equivalent form works: 0.707 and 1/√2 are the same number.
            </Banner>
          )}
          {outcome?.kind === 'phase' && (
            <Banner tone="warn" title="SO CLOSE">
              This is the right answer multiplied by an overall sign or phase. For this problem the exact signs matter: check where the minus signs go.
            </Banner>
          )}
          {outcome?.kind === 'unreadable' && (
            <Banner tone="warn" title="I CANNOT READ THAT">
              {n > 1 ? `Entry ${outcome.cell + 1}` : 'Your answer'} is not a number I understand. Try forms like 3/5, 0.6, 1/√2, i/√2 or (1+i)/2.
            </Banner>
          )}
          {outcome?.kind === 'known' && <Banner tone="bad" title="NOT QUITE">{outcome.feedback}</Banner>}
          {outcome?.kind === 'wrong' && (
            <Banner tone="bad" title="NOT QUITE">
              That is not it. {hints === 0 ? 'Try the hint if you are stuck.' : 'Check the working again, or look at the next hint.'}
            </Banner>
          )}

          {hints > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {p.hints.slice(0, hints).map((h, i) => (
                <Banner key={i} tone="info">{`Hint ${i + 1}: ${h}`}</Banner>
              ))}
            </div>
          )}

          {(attempts >= 2 || hints >= 2 || done) && (
            <div>
              <button className="chip" aria-expanded={showSolution} onClick={() => setShowSolution((v) => !v)} style={{ minHeight: 44 }}>
                {showSolution ? 'Hide the working' : 'Show the working'}
              </button>
              {showSolution && <div style={{ marginTop: 8 }}><Banner tone="info">{p.solution}</Banner></div>}
            </div>
          )}

          {onAsk && (
            <AskButton
              label={`Practice: "${snippet(p.statement)}"`}
              text={p.statement}
              noAnswer
              onAsk={onAsk}
            />
          )}
        </div>
      )}
    </div>
  );
};

/** The practice section at the bottom of a Math Companion lesson. */
export const PracticeView: React.FC<{ problems: PracticeProblem[]; onAsk?: (focus: TutorFocus) => void }> = ({ problems, onAsk }) => {
  const { progress, solveProblem } = useProgress();
  // which set of numbers each problem is showing: 0 is the original, anything else a variant (see content/practiceVariants.ts)
  const [seeds, setSeeds] = useState<Record<string, number>>({});
  const solved = problems.filter((p) => progress.solvedProblems.includes(p.id)).length;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <Eyebrow>PRACTICE · NO TIMER</Eyebrow>
        <span style={{ fontWeight: 800, fontSize: '0.85rem', color: solved === problems.length ? '#2ee6a6' : 'var(--text-secondary)' }}>
          {solved} of {problems.length} solved
        </span>
      </div>
      <p style={{ fontSize: '0.88rem', lineHeight: 1.45, color: 'var(--text-secondary)' }}>
        Type your answer in any form: 1/√2, 0.707 and √2/2 all count. Use the symbol buttons on a phone. Vectors are columns, entered top to bottom; matrices are entered row by row.
      </p>
      {problems.map((p, i) => {
        const seed = seeds[p.id] ?? 0;
        const solved = progress.solvedProblems.includes(p.id);
        return (
          <ProblemCard
            key={`${p.id}:${seed}`}
            problem={seed > 0 ? variantOf(p.id, seed) : p}
            index={i}
            solved={seed > 0 ? false : solved}
            startOpen={seed > 0 || (!solved && i === 0)}
            onSolved={solveProblem}
            onAsk={onAsk}
            onNewNumbers={hasVariants(p.id) ? () => setSeeds((s) => ({ ...s, [p.id]: nextSeed(p.id, s[p.id] ?? 0) })) : undefined}
          />
        );
      })}
    </div>
  );
};
