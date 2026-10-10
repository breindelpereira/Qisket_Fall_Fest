---
id: hw_module_0
---

## Explain: The coherence budget
A quantum program is a race against forgetting. A qubit slowly loses its information because of its surroundings, and the program has to finish its operations before that happens. The number of operations that fit is roughly the coherence time divided by the time one operation takes.

For example, a phase coherence time (T2) of 100 microseconds with gates of 50 nanoseconds gives 100,000 ns divided by 50 ns, which is about 2,000 operations. That is the most you could hope for, and the real number is lower, because every gate also adds a little error.

## Explain: T1 and T2
T1 is the energy relaxation time: how long a qubit stays in |1⟩ before it falls to |0⟩. T2 is the dephasing time: how long the phase of a superposition stays stable. A qubit in superposition can lose its phase information without losing any energy, so T2 is usually the shorter one, and it can never be longer than twice T1.

Because most algorithms depend on phase and interference, T2 is the number that usually limits how long a program can run.

## Explain: Gate speed and fidelity
Gate speed is how long one operation takes. Fidelity measures how close the operation came to the ideal one. A fidelity of 99.9% means roughly one gate in a thousand goes wrong. Both matter: a very fast but sloppy gate is no use, and a very accurate but slow gate wastes the coherence time.

## Example: Two budgets
Suppose a qubit has a coherence budget of 2,000 gates, but each gate has an error of 1 in 1,000. After 1,000 gates a mistake is quite likely, so the error limit (about 1,000) bites before the time limit (2,000). The usable depth is whichever limit comes first. The Qubit Metrics Lab lets you move the numbers and see which limit wins.

## FAQ: What is the difference between T1 and T2?
T1 is about energy: when the qubit falls from |1⟩ to |0⟩. T2 is about phase: when the superposition stops being reliable. T2 is typically shorter, since phase can fade without any energy loss.

## FAQ: Is a machine with more qubits always better?
No. Qubit count is only one number. A smaller machine with long coherence times, fast accurate gates and good connectivity can run deeper programs than a larger noisy one. What matters is how many accurate operations you can do.

## FAQ: What does 99.9% fidelity mean in practice?
About one operation in a thousand is wrong. That sounds small, but a program with thousands of gates will probably contain several errors, which is why error correction is needed for long programs.

## Misconception: Longer coherence is all that matters
A long coherence time is useless if the gates are slow or inaccurate, since the budget is the coherence time divided by the gate time, and errors add up. Good qubits need long coherence, fast gates and high fidelity together.

## Glossary: Key words
T1: how long a qubit keeps its energy. T2: how long it keeps its phase. Coherence time: how long quantum information lasts. Gate time: how long one operation takes. Fidelity: how close an operation is to the ideal one. Depth budget: roughly how many gates fit before errors or forgetting take over. Connectivity: which qubits can interact directly.
