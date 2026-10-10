---
id: math_lesson_1
tag: Accurate
---

## Explain: Kets and state vectors
A ket such as |ψ⟩ is just a name for a column vector. The two basis states are |0⟩, the column (1, 0), and |1⟩, the column (0, 1). A general qubit state is |ψ⟩ = α|0⟩ + β|1⟩, which is the column (α, β). The numbers α and β are the amplitudes, and they can be complex.

## Explain: The normalisation rule
The chance of measuring 0 is the squared size of α, and the chance of measuring 1 is the squared size of β. The two chances must add up to 1, so |α|² + |β|² = 1. A vector that obeys this rule is called normalised, and only normalised vectors are valid states.

## Example: Checking a state
Is (3/5)|0⟩ + (4/5)|1⟩ a valid state? Compute (3/5)² + (4/5)² = 9/25 + 16/25 = 25/25 = 1. Yes. The chance of 0 is 9/25 = 36%, and the chance of 1 is 16/25 = 64%.

## Example: Finding a missing amplitude
If α = 1/√2, then |α|² = 1/2, so |β|² must be 1/2, and |β| = 1/√2. The rule fixes the size of β but not its phase: β could be 1/√2, −1/√2 or i/√2. These give different states with the same probabilities of 0 and 1.

## Explain: The plus and minus states
The state |+⟩ is (1/√2) times the column (1, 1), and |−⟩ is (1/√2) times the column (1, −1). Both give 50% for 0 and 50% for 1, but they are different states, and a Hadamard gate turns them into |0⟩ and |1⟩.

## FAQ: Why is it the squared size and not the size itself?
That is the Born rule, which matches what is observed. It also makes the rule consistent with how amplitudes combine: amplitudes carry phase and can cancel, and their squared sizes give probabilities that are never negative.

## FAQ: What does the symbol |ψ⟩ mean?
It is notation for a vector, called a ket. The symbol inside, here the Greek letter psi, is just the name of the state.

## FAQ: Does a minus sign or an i change the probabilities?
Not by itself for a single measurement in the 0 and 1 basis, because the squared size ignores the sign and the phase. It does change how the state responds to later gates.

## Misconception: The amplitudes add up to 1
It is the squared sizes of the amplitudes that add up to 1. For |+⟩ the amplitudes are each about 0.707, and they add up to about 1.41, not 1.

## Glossary: Key words
Ket: the symbol |ψ⟩, a column vector. Basis state: |0⟩ or |1⟩. Amplitude: a number that goes with a basis state. Normalisation: the squared sizes add to 1. Born rule: probability equals squared size. Superposition: a state with more than one non-zero amplitude.
