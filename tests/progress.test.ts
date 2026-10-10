import { describe, it, expect, beforeEach } from 'vitest';
import { ProgressStore, deriveConceptMastery } from '../src/utils/progressStore';

describe('Phase 1 Progress & Persistence Test Gate', () => {
  beforeEach(() => {
    ProgressStore.reset();
  });

  it('initializes with default empty progress state', () => {
    const state = ProgressStore.get();
    expect(state.completedGames).toEqual([]);
    expect(state.exploredSims).toEqual([]);
    expect(state.quizScores).toEqual({});
    expect(state.conceptMastery).toEqual({});
  });

  it('correctly transitions concept through Familiar, Explored, and Mastered tiers', () => {
    const concept = 'concept_qubits';

    // 1. Initial state is locked
    let state = ProgressStore.get();
    expect(deriveConceptMastery(concept, state)).toBe('locked');

    // 2. Play game -> Familiar
    state = ProgressStore.recordGameCompletion('quantum_heist', concept);
    expect(state.conceptMastery[concept]).toBe('familiar');

    // 3. Run simulation -> Explored
    state = ProgressStore.recordSimulationRun('single_qubit_lab', concept);
    expect(state.conceptMastery[concept]).toBe('explored');

    // 4. Quiz score below the 70% pass mark -> remains Explored
    state = ProgressStore.recordQuizScore('quiz_module_1', concept, 0.6);
    expect(state.conceptMastery[concept]).toBe('explored');

    // 5. Quiz score at or above the pass mark (0.75) -> Mastered!
    state = ProgressStore.recordQuizScore('quiz_module_1', concept, 0.75);
    expect(state.conceptMastery[concept]).toBe('mastered');
  });

  it('survives an app restart / re-instantiation cycle', () => {
    const concept = 'concept_gates';
    ProgressStore.recordGameCompletion('bloch_runner', concept);
    ProgressStore.recordSimulationRun('circuit_lab', concept);

    // Simulate app restart by reading from persistent store
    const restartedState = ProgressStore.get();
    expect(restartedState.completedGames).toContain('bloch_runner');
    expect(restartedState.exploredSims).toContain('circuit_lab');
    expect(restartedState.conceptMastery[concept]).toBe('explored');
  });
});

describe('Progress store subscriptions', () => {
  it('notifies subscribers and refreshes the snapshot when progress changes', () => {
    ProgressStore.reset();
    let calls = 0;
    const unsubscribe = ProgressStore.subscribe(() => { calls++; });
    const before = ProgressStore.getSnapshot();
    expect(ProgressStore.getSnapshot()).toBe(before); // stable between changes

    ProgressStore.recordGameCompletion('schrodinger_stealth', 'concept_measurement');
    expect(calls).toBe(1);
    expect(ProgressStore.getSnapshot()).not.toBe(before);
    expect(ProgressStore.getSnapshot().conceptMastery['concept_measurement']).toBe('familiar');

    unsubscribe();
    ProgressStore.recordGameCompletion('quantum_heist', 'concept_qubits');
    expect(calls).toBe(1);
  });
});

describe('Game completion announcements', () => {
  it('tells listeners which game was completed, every time, until they unsubscribe', () => {
    const seen: string[] = [];
    const off = ProgressStore.subscribeCompletions((id) => seen.push(id));
    ProgressStore.recordGameCompletion('bloch_runner', 'concept_gates');
    ProgressStore.recordGameCompletion('bloch_runner', 'concept_gates'); // a replay still announces
    ProgressStore.recordGameCompletion('gate_deck', 'concept_gates');
    off();
    ProgressStore.recordGameCompletion('oracle_detective', 'concept_algorithms');
    expect(seen).toEqual(['bloch_runner', 'bloch_runner', 'gate_deck']);
  });
});
