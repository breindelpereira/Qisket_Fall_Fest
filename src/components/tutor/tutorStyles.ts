/** Longer chip text reads better in the body font than the pixel font. */
export const textChip = {
  whiteSpace: 'normal', textAlign: 'left', fontFamily: 'var(--font-family)', fontSize: '0.82rem', fontWeight: 700, lineHeight: 1.35, maxWidth: '100%',
} as const;

export const bubble = {
  borderRadius: 18, padding: '10px 14px', fontSize: '0.92rem', lineHeight: 1.45, fontWeight: 600, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere',
} as const;

/** Small pixel-font chip used for the tutor's tool buttons. */
export const toolChip = { fontSize: '0.54rem' } as const;
