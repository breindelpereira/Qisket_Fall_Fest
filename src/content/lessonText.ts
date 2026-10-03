import type { ActivityLink, LessonBlock, LessonRecord, MathExpr, MathPart, ReferenceLink } from './types';

/** Plain-text rendering of a maths expression, for search, the AI Tutor and tests. */
export function mathToText(expr: MathExpr): string {
  const part = (p: MathPart): string => {
    if (typeof p === 'string') return p;
    if ('vec' in p) return `column (${p.vec.join(', ')})`;
    if ('mat' in p) return `matrix [${p.mat.map((r) => `[${r.join(', ')}]`).join(', ')}]`;
    return `${p.frac[0]}/${p.frac[1]}`;
  };
  return expr.map(part).join('');
}

export function blocksToText(blocks: LessonBlock[]): string {
  return blocks
    .map((b) => {
      if (b.type === 'bullets') {
        return b.items
          .map((i) => `- ${i.label ? `${i.label}: ` : ''}${i.text}${i.math ? ` ${mathToText(i.math)}` : ''}`)
          .join('\n');
      }
      return b.text;
    })
    .join('\n');
}

export const game = (id: string): ActivityLink => ({ kind: 'game', id });
export const sim = (id: string): ActivityLink => ({ kind: 'sim', id });

export const video = (
  title: string,
  source: string,
  youtubeId: string,
  startSeconds?: number,
  endSeconds?: number,
): ReferenceLink => ({
  kind: 'video',
  title,
  source,
  url: `https://www.youtube.com/watch?v=${youtubeId}`,
  youtubeId,
  startSeconds,
  endSeconds,
});

export const reading = (title: string, source: string, url: string): ReferenceLink => ({
  kind: 'reading',
  title,
  source,
  url,
});

type LessonInput = Omit<LessonRecord, 'textNotes' | 'videoUrl' | 'linkedGameId' | 'linkedSimId' | 'moduleLabel'> & {
  moduleLabel?: string;
};

/** Fills in the derived fields so each lesson is written once, as blocks. */
export function makeLesson(input: LessonInput): LessonRecord {
  return {
    ...input,
    moduleLabel: input.moduleLabel ?? String(input.moduleNumber),
    textNotes: blocksToText(input.blocks),
    videoUrl: input.references.find((r) => r.kind === 'video')?.url,
    linkedGameId: input.activities.find((a) => a.kind === 'game')?.id,
    linkedSimId: input.activities.find((a) => a.kind === 'sim')?.id,
  };
}
