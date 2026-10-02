import type { ConceptRecord, GameRecord, LessonRecord, QuizRecord, SimulationRecord } from './types';


const VALID_HONESTY_TAGS = ['Analogy', 'Simplified model', 'Accurate', 'Experimental/Contested'];
const VALID_ENGINE_TYPES = ['state-vector', 'optical', 'stabilizer'];

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateConcept(concept: Partial<ConceptRecord>): ValidationResult {
  const errors: string[] = [];

  if (!concept.id || typeof concept.id !== 'string' || concept.id.trim() === '') {
    errors.push('Concept must have a non-empty string id');
  }
  if (!concept.name || typeof concept.name !== 'string') {
    errors.push('Concept must have a valid name');
  }
  if (!concept.summary || typeof concept.summary !== 'string') {
    errors.push('Concept must have a valid summary');
  }
  if (!concept.honestyTag || !VALID_HONESTY_TAGS.includes(concept.honestyTag)) {
    errors.push(`Concept honestyTag must be one of: ${VALID_HONESTY_TAGS.join(', ')}`);
  }
  if (!Array.isArray(concept.prerequisites)) {
    errors.push('Concept prerequisites must be an array');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateQuiz(quiz: Partial<QuizRecord>): ValidationResult {
  const errors: string[] = [];

  if (!quiz.id || typeof quiz.id !== 'string') {
    errors.push('Quiz must have a valid id');
  }
  if (!quiz.lessonId || typeof quiz.lessonId !== 'string') {
    errors.push('Quiz must reference a valid lessonId');
  }
  if (typeof quiz.passingScore !== 'number' || quiz.passingScore <= 0 || quiz.passingScore > 1) {
    errors.push('Quiz passingScore must be a number between 0 and 1 (e.g. 0.8)');
  }
  if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    errors.push('Quiz must have at least one question');
  } else {
    quiz.questions.forEach((q, idx) => {
      if (!q.prompt || typeof q.prompt !== 'string') {
        errors.push(`Question #${idx + 1} is missing a prompt`);
      }
      if (!Array.isArray(q.options) || q.options.length < 2) {
        errors.push(`Question #${idx + 1} must have at least 2 options`);
      } else if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex >= q.options.length) {
        errors.push(`Question #${idx + 1} correctIndex (${q.correctIndex}) is out of bounds for ${q.options.length} options`);
      }
      if (!q.explanation || typeof q.explanation !== 'string') {
        errors.push(`Question #${idx + 1} must have an explanation`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateLesson(lesson: Partial<LessonRecord>): ValidationResult {
  const errors: string[] = [];

  if (!lesson.id || typeof lesson.id !== 'string') {
    errors.push('Lesson must have a valid string id');
  }
  if (![1, 2, 3].includes(lesson.part as number)) {
    errors.push('Lesson part must be 1, 2, or 3');
  }
  if (typeof lesson.moduleNumber !== 'number') {
    errors.push('Lesson moduleNumber must be a number');
  }
  if (!lesson.title || typeof lesson.title !== 'string') {
    errors.push('Lesson title is required');
  }
  if (!lesson.textNotes || typeof lesson.textNotes !== 'string') {
    errors.push('Lesson must have textNotes');
  }
  if (!lesson.linkedConceptId || typeof lesson.linkedConceptId !== 'string') {
    errors.push('Lesson must link to a conceptId');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateSimulation(sim: Partial<SimulationRecord>): ValidationResult {
  const errors: string[] = [];

  if (!sim.id || typeof sim.id !== 'string') {
    errors.push('Simulation must have a valid id');
  }
  if (!sim.title || typeof sim.title !== 'string') {
    errors.push('Simulation title is required');
  }
  if (!sim.engineType || !VALID_ENGINE_TYPES.includes(sim.engineType)) {
    errors.push(`Simulation engineType must be one of: ${VALID_ENGINE_TYPES.join(', ')}`);
  }
  if (!sim.conceptId || typeof sim.conceptId !== 'string') {
    errors.push('Simulation must link to a conceptId');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateGame(game: Partial<GameRecord>): ValidationResult {
  const errors: string[] = [];

  if (!game.id || typeof game.id !== 'string') {
    errors.push('Game must have a valid id');
  }
  if (!game.title || typeof game.title !== 'string') {
    errors.push('Game title is required');
  }
  if (!game.conceptId || typeof game.conceptId !== 'string') {
    errors.push('Game must link to a conceptId');
  }
  if (!game.honestyTag || !VALID_HONESTY_TAGS.includes(game.honestyTag)) {
    errors.push(`Game honestyTag must be one of: ${VALID_HONESTY_TAGS.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
