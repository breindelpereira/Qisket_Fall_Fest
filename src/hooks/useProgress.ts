import { useState, useEffect, useCallback } from 'react';
import { ProgressStore } from '../utils/progressStore';
import type { ProgressState, MasteryTier } from '../utils/progressStore';


export function useProgress() {
  const [progress, setProgress] = useState<ProgressState>(ProgressStore.get());

  useEffect(() => {
    setProgress(ProgressStore.get());
  }, []);

  const completeGame = useCallback((gameId: string, conceptId: string) => {
    const updated = ProgressStore.recordGameCompletion(gameId, conceptId);
    setProgress({ ...updated });
  }, []);

  const runSimulation = useCallback((simId: string, conceptId: string) => {
    const updated = ProgressStore.recordSimulationRun(simId, conceptId);
    setProgress({ ...updated });
  }, []);

  const saveQuiz = useCallback((quizId: string, conceptId: string, score: number) => {
    const updated = ProgressStore.recordQuizScore(quizId, conceptId, score);
    setProgress({ ...updated });
  }, []);

  const getMastery = useCallback((conceptId: string): MasteryTier => {
    return progress.conceptMastery[conceptId] || 'locked';
  }, [progress]);

  return {
    progress,
    completeGame,
    runSimulation,
    saveQuiz,
    getMastery,
  };
}
