interface Props {
  size?: number;
  mood?: 'happy' | 'wow';
}

/** Dr Quantum, the app mascot: a friendly atom-headed scientist. Decorative, so hidden from screen readers. */
export function DrQuantum({ size = 96, mood = 'happy' }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" className="mascot-float">
      {/* orbits */}
      <ellipse cx="60" cy="52" rx="52" ry="18" fill="none" stroke="#38c8ff" strokeWidth="4" opacity="0.8" transform="rotate(-25 60 52)" />
      <ellipse cx="60" cy="52" rx="52" ry="18" fill="none" stroke="#ff5c8a" strokeWidth="4" opacity="0.8" transform="rotate(25 60 52)" />
      <circle cx="12" cy="30" r="6" fill="#38c8ff" />
      <circle cx="108" cy="30" r="6" fill="#ff5c8a" />
      {/* lab coat */}
      <path d="M22 118 Q24 82 60 80 Q96 82 98 118 Z" fill="#ffffff" />
      <path d="M60 80 L48 118 M60 80 L72 118" stroke="#d9cdf7" strokeWidth="3" fill="none" />
      <circle cx="60" cy="96" r="4" fill="#8b5cf6" />
      {/* head */}
      <circle cx="60" cy="52" r="30" fill="#ffd23f" stroke="#d99a00" strokeWidth="3" />
      {/* hair tufts */}
      <path d="M38 30 Q34 16 44 20 M60 22 Q60 8 68 14 M80 30 Q88 18 84 28" stroke="#2a0f5c" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* goggles */}
      <rect x="34" y="42" width="52" height="22" rx="11" fill="#2a0f5c" />
      <circle cx="48" cy="53" r="8" fill="#ffffff" />
      <circle cx="72" cy="53" r="8" fill="#ffffff" />
      <circle cx="50" cy="53" r="4" fill="#2a0f5c" />
      <circle cx="74" cy="53" r="4" fill="#2a0f5c" />
      {/* mouth */}
      {mood === 'wow'
        ? <ellipse cx="60" cy="74" rx="6" ry="7" fill="#2a0f5c" />
        : <path d="M48 72 Q60 84 72 72" stroke="#2a0f5c" strokeWidth="4" strokeLinecap="round" fill="none" />}
    </svg>
  );
}
