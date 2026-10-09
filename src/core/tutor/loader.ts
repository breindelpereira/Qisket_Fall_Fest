import type { PreparedAnswer } from './offline.ts';
import { createSearcher } from './search.ts';
import type { Searcher } from './search.ts';
import type { TutorIndex } from './types.ts';

/** Everything the app needs to answer without a network. Loaded the first time the tutor is opened, so it costs nothing before that. */
export interface TutorKnowledge {
  index: TutorIndex;
  searcher: Searcher;
  prepared: PreparedAnswer[];
}

let cached: Promise<TutorKnowledge> | null = null;

export function loadTutorKnowledge(): Promise<TutorKnowledge> {
  if (!cached) {
    cached = (async () => {
      const [index, demo] = await Promise.all([import('../../../tutor/index.json?raw'), import('../../../tutor/demo-answers.json?raw')]);
      const parsed = JSON.parse(index.default) as TutorIndex;
      return { index: parsed, searcher: createSearcher(parsed.chunks), prepared: JSON.parse(demo.default) as PreparedAnswer[] };
    })();
    // a failed load (for example a flaky dev server) should be tried again next time, not remembered
    cached.catch(() => {
      cached = null;
    });
  }
  return cached;
}
