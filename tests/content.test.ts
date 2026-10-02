import { describe, it, expect } from 'vitest';
import { 
  validateConcept, 
  validateQuiz, 
  validateLesson, 
  validateSimulation, 
  validateGame 
} from '../src/content/validator';
import { CONCEPTS } from '../src/content/concepts';

describe('Phase 1 Content Model & Validator Test Gate', () => {
  it('validates that all canonical concept records pass validation', () => {
    Object.values(CONCEPTS).forEach((concept) => {
      const res = validateConcept(concept);
      expect(res.valid, `Concept ${concept.id} failed validation: ${res.errors.join(', ')}`).toBe(true);
      expect(res.errors.length).toBe(0);
    });
  });

  it('rejects a bad concept record with invalid honesty tag or missing fields', () => {
    const badConcept = {
      id: '',
      name: 'Bad Concept',
      summary: 'Missing id and invalid honesty tag',
      honestyTag: 'CompletelyFakeTag' as any,
      prerequisites: 'not-an-array' as any,
    };

    const res = validateConcept(badConcept);
    expect(res.valid).toBe(false);
    expect(res.errors.length).toBeGreaterThan(0);
    expect(res.errors.some((e) => e.includes('id'))).toBe(true);
    expect(res.errors.some((e) => e.includes('honestyTag'))).toBe(true);
    expect(res.errors.some((e) => e.includes('prerequisites'))).toBe(true);
  });

  it('validates a correct quiz and rejects a malformed quiz', () => {
    const validQuiz = {
      id: 'quiz_module_1',
      lessonId: 'module_1',
      passingScore: 0.8,
      questions: [
        {
          prompt: 'What does a single measurement of a qubit yield?',
          options: ['0 and 1 simultaneously', 'Either 0 or 1 with probabilistic weight'],
          correctIndex: 1,
          explanation: 'Measurement collapses the superposition to a definite classical state.',
        },
      ],
    };

    const validRes = validateQuiz(validQuiz);
    expect(validRes.valid).toBe(true);

    const badQuiz = {
      id: 'quiz_bad',
      lessonId: 'module_1',
      passingScore: 1.5, // Invalid: > 1.0
      questions: [
        {
          prompt: 'Faulty question with out-of-bounds correctIndex',
          options: ['Option A', 'Option B'],
          correctIndex: 5, // Out of bounds!
          explanation: '', // Missing explanation!
        },
      ],
    };

    const badRes = validateQuiz(badQuiz);
    expect(badRes.valid).toBe(false);
    expect(badRes.errors.some((e) => e.includes('passingScore'))).toBe(true);
    expect(badRes.errors.some((e) => e.includes('out of bounds'))).toBe(true);
  });

  it('validates and rejects games and simulations properly', () => {
    const badGame = {
      id: 'game_1',
      title: 'Bad Game',
      conceptId: '',
      honestyTag: 'InvalidTag' as any,
    };
    expect(validateGame(badGame as any).valid).toBe(false);

    const badSim = {
      id: 'sim_1',
      title: 'Bad Sim',
      engineType: 'quantum-magic-engine' as any,
      conceptId: '',
    };
    expect(validateSimulation(badSim as any).valid).toBe(false);
  });
});
