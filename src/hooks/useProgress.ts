import { useSyncExternalStore, useCallback } from 'react';
import { ProgressStore } from '../utils/progressStore';
import type { MasteryTier } from '../utils/progressStore';

export function useProgress() {
  const progress = useSyncExternalStore(ProgressStore.subscribe, ProgressStore.getSnapshot);

  const completeGame = useCallback((gameId: string, conceptId: string) => {
    ProgressStore.recordGameCompletion(gameId, conceptId);
  }, []);

  const runSimulation = useCallback((simId: string, conceptId: string) => {
    ProgressStore.recordSimulationRun(simId, conceptId);
  }, []);

  const saveQuiz = useCallback((quizId: string, conceptId: string, score: number) => {
    ProgressStore.recordQuizScore(quizId, conceptId, score);
  }, []);

  const setLessonRead = useCallback((lessonId: string, read: boolean) => {
    ProgressStore.setLessonRead(lessonId, read);
  }, []);

  const getMastery = useCallback((conceptId: string): MasteryTier => {
    return progress.conceptMastery[conceptId] || 'locked';
  }, [progress]);

  return {
    progress,
    completeGame,
    runSimulation,
    saveQuiz,
    setLessonRead,
    getMastery,
  };
}
