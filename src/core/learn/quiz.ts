import type { QuizQuestion, QuizRecord } from '../../content/types';

export interface QuizResult {
  correct: number;
  total: number;
  /** correct / total, between 0 and 1. */
  score: number;
  passed: boolean;
  perQuestion: boolean[];
}

const EPSILON = 1e-9;

export function isCorrect(question: QuizQuestion, choice: number | null | undefined): boolean {
  return choice !== null && choice !== undefined && choice === question.correctIndex;
}

/** How many questions must be right to pass (integer maths, so 0.8 * 5 is exactly 4). */
export function neededToPass(quiz: QuizRecord): number {
  return Math.ceil(quiz.passingScore * quiz.questions.length - EPSILON);
}

/** "all 3" or "4 of 5": how many answers must be right, in words. */
export function passRule(quiz: QuizRecord): string {
  const needed = neededToPass(quiz);
  const total = quiz.questions.length;
  return needed >= total ? `all ${total}` : `${needed} of ${total}`;
}

export function passes(quiz: QuizRecord, score: number): boolean {
  return score + EPSILON >= quiz.passingScore;
}

/** Unanswered questions count as wrong. */
export function gradeQuiz(quiz: QuizRecord, answers: (number | null | undefined)[]): QuizResult {
  const perQuestion = quiz.questions.map((q, i) => isCorrect(q, answers[i]));
  const correct = perQuestion.filter(Boolean).length;
  const total = quiz.questions.length;
  return {
    correct,
    total,
    score: total === 0 ? 0 : correct / total,
    passed: total > 0 && correct >= neededToPass(quiz),
    perQuestion,
  };
}

export const percent = (score: number): string => `${Math.round(score * 100)}%`;
