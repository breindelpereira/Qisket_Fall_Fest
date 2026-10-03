import React from 'react';
import type { MathExpr, MathPart } from '../../content/types';
import { mathToText } from '../../content/lessonText';

const renderPart = (part: MathPart, key: number): React.ReactNode => {
  if (typeof part === 'string') return <span key={key}>{part}</span>;
  if ('vec' in part) {
    return (
      <span key={key} className="math-vec" style={{ gridTemplateColumns: '1fr' }}>
        {part.vec.map((v, i) => <span key={i}>{v}</span>)}
      </span>
    );
  }
  if ('mat' in part) {
    const cols = part.mat[0]?.length ?? 1;
    return (
      <span key={key} className="math-mat" style={{ gridTemplateColumns: `repeat(${cols}, auto)` }}>
        {part.mat.flatMap((row, r) => row.map((cell, c) => <span key={`${r}-${c}`}>{cell}</span>))}
      </span>
    );
  }
  return (
    <span key={key} className="math-frac">
      <span>{part.frac[0]}</span>
      <span>{part.frac[1]}</span>
    </span>
  );
};

/** One equation, drawn with plain HTML and CSS. The accessible name is the plain-text version. */
export const MathView: React.FC<{ expr: MathExpr }> = ({ expr }) => (
  <div className="math" role="img" aria-label={mathToText(expr)}>
    {expr.map(renderPart)}
  </div>
);
