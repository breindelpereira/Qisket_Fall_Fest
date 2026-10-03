import { describe, it, expect } from 'vitest';
import { LESSONS, LESSON_BY_ID, PARTS, QUIZZES, lessonsForPart, quizForLesson } from '../src/content/lessons';
import { CONCEPTS } from '../src/content/concepts';
import { ACTIVITIES } from '../src/content/activities';
import { validateLesson, validateQuiz } from '../src/content/validator';
import { gradeQuiz, neededToPass, passRule, passes } from '../src/core/learn/quiz';
import { adjacentLessons, conceptEvidence, courseProgressPercent, lessonStatus, nextUpLesson, partProgress } from '../src/core/learn/curriculum';
import { ProgressStore } from '../src/utils/progressStore';
import { Complex, Gates, QuantumStateVector } from '../src/core/circuit';
import { simulate } from '../src/core/optical/interferometer';
import type { MathExpr } from '../src/content/types';

const quizList = Object.values(QUIZZES);

describe('Learn content: structure', () => {
  it('has the three parts of the course with the expected module counts', () => {
    expect(PARTS.map((p) => p.part)).toEqual([1, 2, 3]);
    expect(lessonsForPart(1).map((l) => l.id)).toEqual([
      'module_0', 'module_1', 'module_2', 'module_3', 'module_4', 'module_5a', 'module_5b', 'module_6', 'module_7',
    ]);
    expect(lessonsForPart(2)).toHaveLength(9);
    expect(lessonsForPart(3)).toHaveLength(6);
  });

  it('every lesson and every quiz passes the content validator', () => {
    for (const lesson of LESSONS) {
      const res = validateLesson(lesson);
      expect(res.valid, `${lesson.id}: ${res.errors.join(', ')}`).toBe(true);
    }
    for (const quiz of quizList) {
      const res = validateQuiz(quiz);
      expect(res.valid, `${quiz.id}: ${res.errors.join(', ')}`).toBe(true);
    }
  });

  it('ids are unique and lessons and quizzes point at each other', () => {
    expect(new Set(LESSONS.map((l) => l.id)).size).toBe(LESSONS.length);
    for (const lesson of LESSONS) {
      if (lesson.quizId) {
        expect(QUIZZES[lesson.quizId], `${lesson.id} -> ${lesson.quizId}`).toBeDefined();
        expect(QUIZZES[lesson.quizId].lessonId).toBe(lesson.id);
      }
    }
    for (const quiz of quizList) {
      expect(LESSON_BY_ID[quiz.lessonId], `${quiz.id} -> ${quiz.lessonId}`).toBeDefined();
      expect(LESSON_BY_ID[quiz.lessonId].quizId).toBe(quiz.id);
      expect(quizForLesson(LESSON_BY_ID[quiz.lessonId])).toBe(quiz);
    }
  });

  it('keeps the question counts and answer keys from the source document', () => {
    const key = (id: string) => QUIZZES[id].questions.map((q) => q.correctIndex);
    expect(key('quiz_module_0')).toEqual([1, 2, 1]);
    expect(key('quiz_module_1')).toEqual([2, 0, 2, 1]);
    expect(key('quiz_module_2')).toEqual([1, 1, 1, 0, 1]);
    expect(key('quiz_module_3')).toEqual([2, 1, 2, 1]);
    expect(key('quiz_module_4')).toEqual([2, 1, 1]);
    expect(key('quiz_module_5a')).toEqual([1, 1, 1, 3]);
    expect(key('quiz_module_5b')).toEqual([1, 1, 1]);
    expect(key('quiz_module_6')).toEqual([1, 0, 1, 1]);
    expect(key('quiz_module_7')).toEqual([0, 0, 2]);
    expect(key('quiz_hardware')).toEqual([2, 1, 1, 2, 1, 1, 1, 1, 2]);
    expect(key('quiz_math')).toEqual([1, 0, 2, 0, 1, 1, 0, 1]);
    expect(quizList.reduce((n, q) => n + q.questions.length, 0)).toBe(50);
  });

  it('every question is well formed', () => {
    for (const quiz of quizList) {
      quiz.questions.forEach((q, i) => {
        const where = `${quiz.id} #${i + 1}`;
        expect(q.options.length, where).toBeGreaterThanOrEqual(2);
        expect(q.options.length, where).toBeLessThanOrEqual(4);
        expect(new Set(q.options).size, `${where} has duplicate options`).toBe(q.options.length);
        expect(q.options.every((o) => o.trim().length > 0), `${where} has an empty option`).toBe(true);
        expect(q.explanation.trim().length, where).toBeGreaterThan(20);
        // the "A)" style letters and the "Misconception Check!" prefix belong to the source layout, not the data
        expect(q.options.some((o) => /^[A-D]\)/.test(o)), where).toBe(false);
        expect(q.explanation.startsWith('Misconception Check'), where).toBe(false);
        if (q.misconceptionTag) expect(q.misconceptionTag, where).toMatch(/^[a-z]+(-[a-z]+)+$/);
      });
    }
  });

  it('tags the nine "Misconception Check" questions from the source', () => {
    const tagged = quizList.flatMap((q) => q.questions.filter((x) => x.misconceptionTag).map((x) => x.misconceptionTag));
    expect(tagged).toHaveLength(9);
    expect(new Set(tagged).size).toBe(9);
  });

  it('every lesson has notes, and the derived plain text matches the blocks', () => {
    for (const lesson of LESSONS) {
      expect(lesson.blocks.length, lesson.id).toBeGreaterThan(0);
      expect(lesson.textNotes.length, lesson.id).toBeGreaterThan(40);
    }
    expect(LESSON_BY_ID.module_5a.textNotes).toContain('85.4%');
    expect(LESSON_BY_ID.module_7.textNotes).toContain('3p² − 2p³');
    expect(LESSON_BY_ID.math_lesson_2.textNotes).toContain('matrix [[0, 1], [1, 0]]');
  });
});

describe('Learn content: links to the rest of the app', () => {
  it('every lesson links to a concept that links back to it', () => {
    for (const lesson of LESSONS) {
      const concept = CONCEPTS[lesson.linkedConceptId];
      expect(concept, `${lesson.id} -> ${lesson.linkedConceptId}`).toBeDefined();
      expect(concept.relatedLessons, `${lesson.linkedConceptId} should list ${lesson.id}`).toContain(lesson.id);
    }
    for (const concept of Object.values(CONCEPTS)) {
      for (const id of concept.relatedLessons) {
        expect(LESSON_BY_ID[id], `${concept.id} lists unknown lesson ${id}`).toBeDefined();
      }
      for (const pre of concept.prerequisites) expect(CONCEPTS[pre], `${concept.id} needs ${pre}`).toBeDefined();
    }
  });

  it('every activity exists, and each is listed on the lesson\'s concept', () => {
    for (const lesson of LESSONS) {
      const concept = CONCEPTS[lesson.linkedConceptId];
      for (const a of lesson.activities) {
        const info = ACTIVITIES[a.id];
        expect(info, `${lesson.id} links unknown activity ${a.id}`).toBeDefined();
        expect(info.kind).toBe(a.kind);
        const list = a.kind === 'game' ? concept.relatedGames : concept.relatedSims;
        expect(list, `${a.id} should be in ${concept.id}`).toContain(a.id);
      }
      expect(lesson.linkedGameId).toBe(lesson.activities.find((a) => a.kind === 'game')?.id);
      expect(lesson.linkedSimId).toBe(lesson.activities.find((a) => a.kind === 'sim')?.id);
    }
  });

  it('video references are playable, with sensible segments', () => {
    const videos = LESSONS.flatMap((l) => l.references.filter((r) => r.kind === 'video'));
    expect(videos).toHaveLength(6);
    for (const v of videos) {
      expect(v.youtubeId).toMatch(/^[A-Za-z0-9_-]{11}$/);
      expect(v.url).toBe(`https://www.youtube.com/watch?v=${v.youtubeId}`);
      if (v.startSeconds !== undefined && v.endSeconds !== undefined) expect(v.endSeconds).toBeGreaterThan(v.startSeconds);
    }
    const wired = LESSON_BY_ID.module_1.references[0];
    expect([wired.startSeconds, wired.endSeconds]).toEqual([2 * 60 + 18, 6 * 60 + 15]);
    const grover = LESSON_BY_ID.module_6.references[0];
    expect([grover.startSeconds, grover.endSeconds]).toEqual([15 * 60 + 52, 29 * 60 + 30]);
  });

  it('reading references are https links', () => {
    for (const r of LESSONS.flatMap((l) => l.references.filter((x) => x.kind === 'reading'))) {
      expect(r.url.startsWith('https://')).toBe(true);
      expect(r.url).not.toContain(' ');
    }
  });

  it('only the Frontier Ideas module carries its own honesty tag', () => {
    const tagged = LESSONS.filter((l) => l.honestyTag);
    expect(tagged.map((l) => l.id)).toEqual(['hw_module_7']);
    expect(tagged[0].honestyTag).toBe('Experimental/Contested');
  });
});

describe('Learn content: maths blocks', () => {
  const exprs: MathExpr[] = LESSONS.flatMap((l) =>
    l.blocks.flatMap((b) => (b.type === 'bullets' ? b.items.flatMap((i) => (i.math ? [i.math] : [])) : [])),
  );

  it('has equations in Part 3 and nowhere else', () => {
    expect(exprs.length).toBeGreaterThanOrEqual(10);
    for (const l of LESSONS) {
      const has = l.blocks.some((b) => b.type === 'bullets' && b.items.some((i) => i.math));
      if (l.part !== 3) expect(has, l.id).toBe(false);
    }
  });

  it('vectors and matrices are well formed', () => {
    for (const expr of exprs) {
      for (const part of expr) {
        if (typeof part === 'string') continue;
        if ('vec' in part) expect(part.vec.length).toBeGreaterThanOrEqual(2);
        if ('mat' in part) {
          expect(part.mat.length).toBeGreaterThanOrEqual(2);
          expect(new Set(part.mat.map((r) => r.length)).size).toBe(1);
        }
      }
    }
  });

  it('the matrices and vectors in Lesson 2 do what the lesson says', () => {
    // X · |0> = |1>
    const x = new QuantumStateVector(1).applyX(0);
    expect(x.getProbabilities()[1]).toBeCloseTo(1, 9);
    // the H matrix in the lesson, (1/√2)[[1,1],[1,-1]], is the engine's Hadamard
    const h = Gates.H();
    expect(h[0][0].re).toBeCloseTo(1 / Math.SQRT2, 9);
    expect(h[1][1].re).toBeCloseTo(-1 / Math.SQRT2, 9);
  });
});

describe('Learn content: quiz answers agree with the physics engines', () => {
  it('Module 3: H twice is the identity, and H, Z, H on |0> ends in |1>', () => {
    const hh = new QuantumStateVector(1).applyH(0).applyH(0);
    expect(hh.getProbabilities()[0]).toBeCloseTo(1, 9);
    const hzh = new QuantumStateVector(1).applyH(0).applyZ(0).applyH(0);
    expect(hzh.getProbabilities()[1]).toBeCloseTo(1, 9);
    const q = QUIZZES.quiz_module_3.questions;
    expect(q[2].options[q[2].correctIndex]).toBe('|0⟩');
    expect(q[3].options[q[3].correctIndex]).toBe('|1⟩');
  });

  it('Module 2: amplitudes 0.6 and 0.8 give about 640 ones in 1,000 shots', () => {
    expect(0.6 ** 2 + 0.8 ** 2).toBeCloseTo(1, 12);
    expect(0.8 ** 2 * 1000).toBeCloseTo(640, 9);
    const q = QUIZZES.quiz_module_2.questions[2];
    expect(q.options[q.correctIndex]).toBe('About 640');
  });

  it('Module 4: amplitudes add before squaring', () => {
    expect((0.5 + 0.5) ** 2).toBe(1);
    expect((0.5 - 0.5) ** 2).toBe(0);
    const q = QUIZZES.quiz_module_4.questions[2];
    expect(q.options[q.correctIndex]).toMatch(/^Case 1: 1 \(100%\); Case 2: 0$/);
  });

  it('Module 4: blocking one arm makes the dark port click and leaves 50/50 for the photons that get through', () => {
    const clear = simulate([{ type: 'bs' }, { type: 'phase', phi: 0 }, { type: 'bs' }]);
    const blocked = simulate([{ type: 'bs' }, { type: 'phase', phi: 0 }, { type: 'block', path: 1 }, { type: 'bs' }]);
    expect(clear.out[0]).toBeCloseTo(0, 9);
    expect(blocked.out[0]).toBeGreaterThan(0.2);
    const through = blocked.out[0] + blocked.out[1];
    expect(blocked.out[0] / through).toBeCloseTo(0.5, 9);
    expect(blocked.out[1] / through).toBeCloseTo(0.5, 9);
  });

  it('Module 5A: H then CNOT gives 00 or 11 about half the time each', () => {
    const bell = new QuantumStateVector(2).applyH(0).applyCNOT(0, 1);
    expect(bell.getProbabilityMap()).toEqual({ '00': 0.5, '11': 0.5 });
  });

  it('Module 5A: 10 qubits need 1,024 amplitudes and the CHSH figures are 75% vs about 85%', () => {
    expect(new QuantumStateVector(10).dim).toBe(1024);
    expect(Math.cos(Math.PI / 8) ** 2).toBeCloseTo(0.8536, 4);
    expect(LESSON_BY_ID.module_5a.textNotes).toContain('75%');
  });

  it('Module 6: Grover needs about (π/4)√N iterations: 3 for N = 16 (about 96%), 8 for N = 100', () => {
    const iterations = (n: number) => Math.round((Math.PI / 4) * Math.sqrt(n));
    const success = (n: number, k: number) => Math.sin((2 * k + 1) * Math.asin(1 / Math.sqrt(n))) ** 2;
    expect(iterations(16)).toBe(3);
    expect(success(16, 3)).toBeGreaterThan(0.95);
    expect(success(16, 3)).toBeLessThan(0.97);
    // overshoot: more iterations than optimal lowers the success rate again
    expect(success(16, 6)).toBeLessThan(success(16, 3));
    expect(iterations(100)).toBe(8);
    expect(QUIZZES.quiz_module_6.questions[2].options[1]).toBe('3');
    expect(QUIZZES.quiz_math.questions[7].options[1]).toBe('8');
  });

  it('Module 7: the 3-qubit code gives 3p² − 2p³, about 0.0003 at p = 0.01, and helps only below 50%', () => {
    const logical = (p: number) => 3 * p ** 2 - 2 * p ** 3;
    expect(logical(0.01)).toBeCloseTo(0.0003, 4);
    expect(0.01 / logical(0.01)).toBeGreaterThan(33);
    expect(logical(0.4)).toBeLessThan(0.4);
    expect(logical(0.6)).toBeGreaterThan(0.6);
    expect(logical(0.5)).toBeCloseTo(0.5, 12);
  });

  it('Part 2: a 100 µs coherence time with 50 ns gates is a budget of about 2,000 gates', () => {
    expect((100e-6 / 50e-9)).toBeCloseTo(2000, 6);
    const q = QUIZZES.quiz_hardware.questions[3];
    expect(q.options[q.correctIndex]).toBe('2,000');
  });

  it('Part 3: probability is the squared magnitude, so (i/√2)|1> gives 1/2', () => {
    const amp = Complex.create(0, 1 / Math.SQRT2);
    expect(Complex.absSq(amp)).toBeCloseTo(0.5, 12);
  });

  it('Part 3: the Mach-Zehnder model H · Phase · H sends |0> to port 0 at φ = 0 and to port 1 at φ = π', () => {
    const run = (phi: number) =>
      new QuantumStateVector(1).applyH(0).applyGate(Gates.Rz(phi), 0).applyH(0).getProbabilities();
    expect(run(0)[0]).toBeCloseTo(1, 9);
    // Rz(π) is Z up to a global phase, and H Z H = X
    expect(run(Math.PI)[1]).toBeCloseTo(1, 9);
    const q = QUIZZES.quiz_math.questions[6];
    expect(q.options[q.correctIndex]).toBe('Port |0⟩, with certainty');
  });

  it('Part 3: H applied to |0> is (1/√2)(1, 1), the |+> state', () => {
    const s = new QuantumStateVector(1).applyH(0);
    expect(s.amplitudes[0].re).toBeCloseTo(1 / Math.SQRT2, 9);
    expect(s.amplitudes[1].re).toBeCloseTo(1 / Math.SQRT2, 9);
  });

  it('Part 3: |0> ⊗ |1> is the vector (0, 1, 0, 0) in the order |00>, |01>, |10>, |11>', () => {
    // qubit 0 is the rightmost bit in the engine's bitstrings, so |01> has qubit 0 = 1
    const s = new QuantumStateVector(2).applyX(0);
    expect(s.getProbabilityMap()).toEqual({ '01': 1 });
  });
});

describe('Quiz grading', () => {
  it('needs every answer for 3- and 4-question quizzes at the 80% pass mark, and 4 of 5 for 5', () => {
    expect(neededToPass(QUIZZES.quiz_module_0)).toBe(3);
    expect(neededToPass(QUIZZES.quiz_module_1)).toBe(4);
    expect(neededToPass(QUIZZES.quiz_module_2)).toBe(4);
    expect(neededToPass(QUIZZES.quiz_hardware)).toBe(8);
    expect(neededToPass(QUIZZES.quiz_math)).toBe(7);
  });

  it('grades a perfect attempt, a partial attempt and unanswered questions', () => {
    const quiz = QUIZZES.quiz_module_2;
    const perfect = quiz.questions.map((q) => q.correctIndex);
    expect(gradeQuiz(quiz, perfect)).toMatchObject({ correct: 5, total: 5, score: 1, passed: true });

    const oneWrong = [...perfect];
    oneWrong[0] = (perfect[0] + 1) % 4;
    const r = gradeQuiz(quiz, oneWrong);
    expect(r.correct).toBe(4);
    expect(r.score).toBeCloseTo(0.8, 12);
    expect(r.passed).toBe(true);
    expect(r.perQuestion).toEqual([false, true, true, true, true]);

    const twoWrong = [...oneWrong];
    twoWrong[1] = 0;
    expect(gradeQuiz(quiz, twoWrong).passed).toBe(false);

    const blank = gradeQuiz(quiz, []);
    expect(blank).toMatchObject({ correct: 0, score: 0, passed: false });
  });

  it('one miss fails a 4-question quiz at 80%', () => {
    const quiz = QUIZZES.quiz_module_1;
    const answers = quiz.questions.map((q) => q.correctIndex);
    answers[3] = 3;
    expect(gradeQuiz(quiz, answers).passed).toBe(false);
  });

  it('passes() treats exactly 80% as a pass, despite floating point', () => {
    expect(passes(QUIZZES.quiz_module_2, 4 / 5)).toBe(true);
    expect(passes(QUIZZES.quiz_module_2, 3 / 5)).toBe(false);
  });
});

describe('Curriculum progress', () => {
  const fresh = () => {
    ProgressStore.reset();
    return ProgressStore.get();
  };

  it('starts with every module new and the first lesson up next', () => {
    const p = fresh();
    expect(lessonStatus(LESSON_BY_ID.module_1, QUIZZES, p)).toEqual({ status: 'new' });
    expect(nextUpLesson(LESSONS, QUIZZES, p)?.id).toBe('module_0');
    expect(courseProgressPercent(LESSONS, QUIZZES, p)).toBe(0);
    expect(partProgress(LESSONS, QUIZZES, p, 1)).toEqual({ done: 0, total: 9 });
  });

  it('a failed quiz is "attempted", a passed quiz is "done", and the best score is kept', () => {
    fresh();
    ProgressStore.recordQuizScore('quiz_module_1', 'concept_qubits', 0.5);
    let p = ProgressStore.get();
    expect(lessonStatus(LESSON_BY_ID.module_1, QUIZZES, p)).toEqual({ status: 'attempted', bestScore: 0.5 });
    expect(nextUpLesson(LESSONS, QUIZZES, p)?.id).toBe('module_0');

    ProgressStore.recordQuizScore('quiz_module_1', 'concept_qubits', 1);
    ProgressStore.recordQuizScore('quiz_module_1', 'concept_qubits', 0.25); // a worse retry never lowers it
    p = ProgressStore.get();
    expect(lessonStatus(LESSON_BY_ID.module_1, QUIZZES, p)).toEqual({ status: 'done', bestScore: 1 });
  });

  it('a lesson without a quiz is done once marked as read, and can be un-marked', () => {
    fresh();
    ProgressStore.setLessonRead('hw_module_1', true);
    expect(lessonStatus(LESSON_BY_ID.hw_module_1, QUIZZES, ProgressStore.get()).status).toBe('done');
    ProgressStore.setLessonRead('hw_module_1', false);
    expect(lessonStatus(LESSON_BY_ID.hw_module_1, QUIZZES, ProgressStore.get()).status).toBe('new');
  });

  it('up next walks the core course in order and only then the optional Math Companion', () => {
    fresh();
    for (const l of LESSONS.filter((x) => x.part !== 3)) {
      expect(nextUpLesson(LESSONS, QUIZZES, ProgressStore.get())?.id).toBe(l.id);
      if (l.quizId) ProgressStore.recordQuizScore(l.quizId, l.linkedConceptId, 1);
      else ProgressStore.setLessonRead(l.id, true);
    }
    const p = ProgressStore.get();
    expect(courseProgressPercent(LESSONS, QUIZZES, p)).toBe(100);
    expect(nextUpLesson(LESSONS, QUIZZES, p)?.id).toBe('math_week_0');
  });

  it('finds the previous and next module inside the same part only', () => {
    expect(adjacentLessons(LESSONS, 'module_3')).toMatchObject({ prev: { id: 'module_2' }, next: { id: 'module_4' } });
    expect(adjacentLessons(LESSONS, 'module_0').prev).toBeUndefined();
    expect(adjacentLessons(LESSONS, 'module_7').next).toBeUndefined();
    expect(adjacentLessons(LESSONS, 'hw_module_0').prev).toBeUndefined();
    expect(adjacentLessons(LESSONS, 'math_lesson_5').next).toBeUndefined();
  });

  it('reports the play / experiment / quiz evidence for a concept', () => {
    fresh();
    const lesson = LESSON_BY_ID.module_1;
    expect(conceptEvidence('concept_qubits', ProgressStore.get(), QUIZZES, lesson)).toEqual({ played: false, explored: false, quizPassed: false });
    ProgressStore.recordGameCompletion('quantum_heist', 'concept_qubits');
    ProgressStore.recordSimulationRun('single_qubit_lab', 'concept_qubits');
    ProgressStore.recordQuizScore('quiz_module_1', 'concept_qubits', 1);
    expect(conceptEvidence('concept_qubits', ProgressStore.get(), QUIZZES, lesson)).toEqual({ played: true, explored: true, quizPassed: true });
    expect(ProgressStore.get().conceptMastery.concept_qubits).toBe('mastered');
  });

  it('two quizzes for one concept are kept apart, and the best one counts towards mastery', () => {
    fresh();
    ProgressStore.recordSimulationRun('two_qubit_lab', 'concept_entanglement');
    ProgressStore.recordQuizScore('quiz_a', 'concept_entanglement', 0.5);
    ProgressStore.recordQuizScore('quiz_b', 'concept_entanglement', 1);
    const p = ProgressStore.get();
    expect(p.quizScores).toMatchObject({ quiz_a: 0.5, quiz_b: 1 });
    expect(p.conceptQuizzes.concept_entanglement).toEqual(['quiz_a', 'quiz_b']);
    expect(p.conceptMastery.concept_entanglement).toBe('mastered');
  });

  it('loads a save made before lessons and per-quiz scores existed', () => {
    ProgressStore.reset();
    // an old save simply has no readLessons / conceptQuizzes (undefined fields are dropped when saved)
    const legacy = { ...ProgressStore.get(), completedGames: ['quantum_heist'], quizScores: { concept_qubits: 0.9 } } as Record<string, unknown>;
    delete legacy.readLessons;
    delete legacy.conceptQuizzes;
    ProgressStore.save(legacy as never);
    const p = ProgressStore.get();
    expect(p.readLessons).toEqual([]);
    expect(p.conceptQuizzes).toEqual({});
    expect(p.quizScores.concept_qubits).toBe(0.9);
    ProgressStore.reset();
  });
});

describe('Quiz pass rule wording', () => {
  it('says "all N" when every answer is needed and "X of N" otherwise', () => {
    expect(passRule(QUIZZES.quiz_module_0)).toBe('all 3');
    expect(passRule(QUIZZES.quiz_module_1)).toBe('all 4');
    expect(passRule(QUIZZES.quiz_module_2)).toBe('4 of 5');
    expect(passRule(QUIZZES.quiz_hardware)).toBe('8 of 9');
    expect(passRule(QUIZZES.quiz_math)).toBe('7 of 8');
  });
});
