---
id: math_lesson_3
tag: Accurate
---

## Explain: Combining qubits with the tensor product
To describe two qubits together, combine their vectors with the tensor product. Multiply every entry of the first vector by the whole of the second. For (a, b) and (c, d) the result is the column (ac, ad, bc, bd). Two qubits therefore have a vector of four amplitudes, one for each of |00⟩, |01⟩, |10⟩ and |11⟩.

## Example: Making |01⟩
|0⟩ is (1, 0) and |1⟩ is (0, 1). The tensor product |0⟩ ⊗ |1⟩ is (1·0, 1·1, 0·0, 0·1) = (0, 1, 0, 0). The 1 sits in the second place, which is the basis state |01⟩. In this app the left digit is qubit 1 and the right digit is qubit 0, like Qiskit.

## Explain: The vector doubles with every qubit
n qubits need 2ⁿ amplitudes: 2, 4, 8, 16 and so on. Adding one qubit doubles the length of the vector. That doubling is why simulating many qubits on an ordinary computer quickly becomes impossible, and why quantum computers are interesting.

## Explain: Two-qubit gates are 4 by 4 matrices
A gate on two qubits is a 4 by 4 matrix. With the left digit as the control, CNOT leaves |00⟩ and |01⟩ alone and swaps |10⟩ and |11⟩. Its rows are (1, 0, 0, 0), (0, 1, 0, 0), (0, 0, 0, 1) and (0, 0, 1, 0).

## Explain: Entangled states
A product state can be written as a tensor product of two single-qubit vectors. Some two-qubit states cannot. The Bell state (|00⟩ + |11⟩)/√2, the column (1/√2)(1, 0, 0, 1), is one of them. A product (ac, ad, bc, bd) would need ac and bd to be non-zero, but also ad and bc to be zero, which is impossible. A state that cannot be split like this is entangled.

## FAQ: What is the tensor product?
A way of combining the descriptions of separate systems into one description of the combined system, by multiplying every entry of one vector by the whole of the other.

## FAQ: Why does the order of the digits matter?
Because |01⟩ and |10⟩ are different states. A convention fixes which digit is which qubit. Qiskit and this app put the highest-numbered qubit on the left and qubit 0 on the right.

## FAQ: How do I know if a state is entangled?
Try to write it as a product of two single-qubit states. If no choice of the two vectors gives the same four amplitudes, the state is entangled.

## Misconception: Two qubits are described by two separate vectors
That is true only for product states. In general the pair needs its own vector of four amplitudes, and for an entangled pair neither qubit has a vector of its own.

## Glossary: Key words
Tensor product: the way vectors are combined for several qubits. Basis state: one of |00⟩, |01⟩, |10⟩, |11⟩. Product state: a state that factorises into one vector per qubit. Entangled: not a product state. CNOT: a gate that flips the target if the control is 1.
