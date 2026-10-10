---
id: math_lesson_2
tag: Accurate
---

## Explain: Gates are matrices
A gate on one qubit is a 2 by 2 matrix, and applying it means multiplying the matrix by the state's column vector. The X gate is the matrix with rows (0, 1) and (1, 0). Applied to |0⟩, which is the column (1, 0), it gives the column (0, 1), which is |1⟩. The H gate is 1/√2 times the matrix with rows (1, 1) and (1, −1).

## Explain: Z and S
The Z gate has rows (1, 0) and (0, −1). It leaves |0⟩ alone and flips the sign of |1⟩. The S gate has rows (1, 0) and (0, i): it multiplies the |1⟩ amplitude by i, a quarter turn of phase. Applying S twice gives Z, because i times i is −1.

## Explain: What unitary means
A valid gate must keep the total probability at 1 and must be reversible. A matrix U with these properties is unitary: U† times U equals the identity, where U† is the conjugate transpose, found by flipping the matrix along its diagonal and conjugating every entry. The inverse of a gate is its U†. For X, which is its own inverse, applying it twice gives the identity.

## Example: H on |1⟩
H times the column (0, 1) picks out the second column of H, so the result is (1/√2) times the column (1, −1). That is the state |−⟩. Applying H to |0⟩ gives |+⟩ in the same way, using the first column.

## Explain: The order of gates
The first gate acts first, so in a written product it is the rightmost matrix, next to the state. U₂U₁|ψ⟩ means apply U₁, then U₂. A famous result is HXH = Z: surrounding an X gate with Hadamards turns a bit flip into a phase flip. Because matrices generally do not commute, HX and XH are different gates.

## FAQ: Why must quantum gates be unitary?
Because probabilities must always add to 1 and because the laws of quantum mechanics for an isolated system are reversible. A non-unitary matrix would change the total probability or destroy information, which a gate must not do.

## FAQ: Can a gate have complex numbers in it?
Yes. The S gate contains i. Entries only need to make the whole matrix unitary.

## FAQ: Why does a Hadamard applied twice do nothing?
H times H is the identity matrix, which leaves every state alone. The first H takes |0⟩ to |+⟩ and the second takes |+⟩ back to |0⟩.

## Misconception: The order of gates doesn't matter
In general it does. The same gates in a different order give a different matrix. Only some pairs of gates commute.

## Glossary: Key words
Gate: a matrix acting on a state vector. Unitary: a matrix with U†U = I. Conjugate transpose: flip a matrix along its diagonal and conjugate its entries. Identity: the matrix that does nothing. Pauli gates: X, Y and Z. Hadamard: the gate H that makes equal superpositions.
