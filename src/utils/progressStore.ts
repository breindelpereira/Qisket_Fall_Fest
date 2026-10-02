export type MasteryTier = 'locked' | 'familiar' | 'explored' | 'mastered';

export interface ProgressState {
  completedGames: string[];
  exploredSims: string[];
  conceptGames: Record<string, string[]>;
  conceptSims: Record<string, string[]>;
  quizScores: Record<string, number>; // quizId/conceptId -> best score [0.0 - 1.0]
  conceptMastery: Record<string, MasteryTier>;
  lastUpdated: string;
}

const STORAGE_KEY = 'qisket_progress_v1';

// In-memory fallback for environments without native localStorage (e.g. Node tests)
let memoryStorage: Record<string, string> = {};

function getStorageItem(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {
    // ignore
  }
  return memoryStorage[key] ?? null;
}

function setStorageItem(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      return;
    }
  } catch {
    // ignore
  }
  memoryStorage[key] = value;
}

function removeStorageItem(key: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
      return;
    }
  } catch {
    // ignore
  }
  delete memoryStorage[key];
}

const createDefaultState = (): ProgressState => ({
  completedGames: [],
  exploredSims: [],
  conceptGames: {},
  conceptSims: {},
  quizScores: {},
  conceptMastery: {},
  lastUpdated: new Date().toISOString(),
});

/**
 * Evaluates mastery tier for a concept based on user evidence:
 * - Familiar: completed relevant game
 * - Explored: completed simulation task
 * - Mastered: quiz score >= 80% AND simulation task run
 */
export function deriveConceptMastery(
  conceptId: string,
  state: ProgressState,
  quizThreshold = 0.8
): MasteryTier {
  const hasGame = (state.conceptGames[conceptId]?.length ?? 0) > 0;
  const hasSim = (state.conceptSims[conceptId]?.length ?? 0) > 0;
  const quizScore = state.quizScores[conceptId] ?? 0;
  const hasPassedQuiz = quizScore >= quizThreshold;

  if (hasPassedQuiz && hasSim) {
    return 'mastered';
  }
  if (hasSim) {
    return 'explored';
  }
  if (hasGame) {
    return 'familiar';
  }
  return 'locked';
}

export const ProgressStore = {
  get: (): ProgressState => {
    try {
      const raw = getStorageItem(STORAGE_KEY);
      if (!raw) return createDefaultState();
      const parsed = JSON.parse(raw) as Partial<ProgressState>;
      return {
        ...createDefaultState(),
        ...parsed,
        conceptGames: parsed.conceptGames || {},
        conceptSims: parsed.conceptSims || {},
        conceptMastery: parsed.conceptMastery || {},
        quizScores: parsed.quizScores || {},
      };
    } catch {
      return createDefaultState();
    }
  },

  save: (state: ProgressState): void => {
    try {
      state.lastUpdated = new Date().toISOString();
      setStorageItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Could not save progress', e);
    }
  },

  recordGameCompletion: (gameId: string, conceptId: string): ProgressState => {
    const state = ProgressStore.get();
    if (!state.completedGames.includes(gameId)) {
      state.completedGames.push(gameId);
    }
    if (!state.conceptGames[conceptId]) {
      state.conceptGames[conceptId] = [];
    }
    if (!state.conceptGames[conceptId].includes(gameId)) {
      state.conceptGames[conceptId].push(gameId);
    }
    state.conceptMastery[conceptId] = deriveConceptMastery(conceptId, state);
    ProgressStore.save(state);
    return state;
  },

  recordSimulationRun: (simId: string, conceptId: string): ProgressState => {
    const state = ProgressStore.get();
    if (!state.exploredSims.includes(simId)) {
      state.exploredSims.push(simId);
    }
    if (!state.conceptSims[conceptId]) {
      state.conceptSims[conceptId] = [];
    }
    if (!state.conceptSims[conceptId].includes(simId)) {
      state.conceptSims[conceptId].push(simId);
    }
    state.conceptMastery[conceptId] = deriveConceptMastery(conceptId, state);
    ProgressStore.save(state);
    return state;
  },

  recordQuizScore: (_quizId: string, conceptId: string, score: number): ProgressState => {

    const state = ProgressStore.get();
    const currentBest = state.quizScores[conceptId] ?? 0;
    if (score > currentBest) {
      state.quizScores[conceptId] = score;
    }
    state.conceptMastery[conceptId] = deriveConceptMastery(conceptId, state);
    ProgressStore.save(state);
    return state;
  },

  reset: (): ProgressState => {
    removeStorageItem(STORAGE_KEY);
    memoryStorage = {};
    return createDefaultState();
  },
};
