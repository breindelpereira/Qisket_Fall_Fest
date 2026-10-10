interface Props {
  size?: number;
  mood?: 'happy' | 'wow' | 'asleep';
  /** Gentle bobbing. Off where the cat is part of a game board. */
  float?: boolean;
}

const FUR = '#ffa940';
const FUR_EDGE = '#c26a00';
const INK = '#2a0f5c';

/** Dr. Milton Schrody, the app mascot and tutor: a ginger cat in a lab coat and round glasses. Decorative, so hidden from screen readers. */
export function Milton({ size = 96, mood = 'happy', float = true }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" className={float ? 'mascot-float' : undefined}>
      {/* two orbits: the "quantum" in the name */}
      <ellipse cx="60" cy="58" rx="54" ry="17" fill="none" stroke="#38c8ff" strokeWidth="3" opacity="0.75" transform="rotate(-22 60 58)" />
      <ellipse cx="60" cy="58" rx="54" ry="17" fill="none" stroke="#ff5c8a" strokeWidth="3" opacity="0.75" transform="rotate(22 60 58)" />
      <circle cx="11" cy="32" r="5" fill="#38c8ff" />
      <circle cx="109" cy="32" r="5" fill="#ff5c8a" />

      {/* lab coat and bow tie */}
      <path d="M24 119 Q26 86 60 84 Q94 86 96 119 Z" fill="#ffffff" />
      <path d="M60 88 L47 119 M60 88 L73 119" stroke="#d9cdf7" strokeWidth="3" fill="none" />
      <path d="M60 91 L50 85 L50 97 Z M60 91 L70 85 L70 97 Z" fill="#ff5c8a" />
      <circle cx="60" cy="91" r="3.2" fill="#c42e5c" />

      {/* ears */}
      <path d="M30 46 L30 14 L57 30 Z" fill={FUR} stroke={FUR_EDGE} strokeWidth="3" strokeLinejoin="round" />
      <path d="M90 46 L90 14 L63 30 Z" fill={FUR} stroke={FUR_EDGE} strokeWidth="3" strokeLinejoin="round" />
      <path d="M36 38 L36 23 L48 31 Z M84 38 L84 23 L72 31 Z" fill="#ff8fb1" />

      {/* head */}
      <ellipse cx="60" cy="58" rx="33" ry="29" fill={FUR} stroke={FUR_EDGE} strokeWidth="3" />
      <path d="M60 31 L60 41 M50 33 L52 41 M70 33 L68 41" stroke={FUR_EDGE} strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="60" cy="71" rx="14" ry="10" fill="#ffe3b8" />

      {/* round glasses and eyes */}
      <circle cx="45" cy="56" r="11" fill="rgba(255,255,255,0.9)" stroke={INK} strokeWidth="3" />
      <circle cx="75" cy="56" r="11" fill="rgba(255,255,255,0.9)" stroke={INK} strokeWidth="3" />
      <path d="M56 56 L64 56" stroke={INK} strokeWidth="3" />
      {mood === 'asleep' ? (
        <path d="M38 57 Q45 63 52 57 M68 57 Q75 63 82 57" stroke={INK} strokeWidth="3.5" strokeLinecap="round" fill="none" />
      ) : (
        <>
          <circle cx="46" cy="57" r={mood === 'wow' ? 6.5 : 4.5} fill={INK} />
          <circle cx="76" cy="57" r={mood === 'wow' ? 6.5 : 4.5} fill={INK} />
          <circle cx="48" cy="55" r="1.8" fill="#ffffff" />
          <circle cx="78" cy="55" r="1.8" fill="#ffffff" />
        </>
      )}

      {/* nose and mouth */}
      <path d="M55.5 66 L64.5 66 L60 71.5 Z" fill="#ff5c8a" />
      {mood === 'wow'
        ? <ellipse cx="60" cy="79" rx="4" ry="5" fill={INK} />
        : <path d="M60 71.5 Q60 78 54 78 M60 71.5 Q60 78 66 78" stroke={INK} strokeWidth="2.6" strokeLinecap="round" fill="none" />}

      {/* whiskers */}
      <path d="M29 68 L13 64 M29 73 L13 75 M91 68 L107 64 M91 73 L107 75" stroke="#f1eaff" strokeWidth="2" strokeLinecap="round" />

      {mood === 'asleep' && <text x="92" y="24" fontSize="15" fontWeight="800" fill="#f1eaff">z</text>}
    </svg>
  );
}
