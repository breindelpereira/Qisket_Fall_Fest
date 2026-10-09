---
id: module_3
---

## Explain: Gates as rotations
Classical gates (AND, OR, NOT) change bits. Quantum gates change a qubit's state, and on the Bloch sphere each one is a rotation of the state's point. Because a rotation never stretches or squashes anything, the probabilities always still add up to 1, and every gate can be undone by rotating back. Gates with this property are called unitary.

The main single-qubit gates are: X, a half-turn about the X axis that swaps North and South, so |0⟩ becomes |1⟩ and back (the quantum version of NOT); Z, a half-turn about the vertical axis that leaves |0⟩ and |1⟩ in place but swings |+⟩ round the equator to |−⟩; and H, the Hadamard gate, which moves a state between the poles and the equator.

## Explain: Phase
A qubit state has a "relative phase": the sign or angle between its two amplitudes. On the Bloch sphere it is how far around the globe the point is. Changing the phase does not change the chance of measuring 0 or 1 right now, which is why a Z gate seems to do nothing if you measure straight after it.

But phase decides what happens next. If you apply an H gate after a Z, the phase turns into a different 0/1 probability. Phase is the hidden ingredient that makes interference possible in Module 4.

## Explain: Reversibility
Every quantum gate has an inverse that undoes it. X undoes itself (applying X twice does nothing), and so do H and Z. Reversibility is why you cannot "erase" a qubit with a gate, and why information is not lost until you measure.

## Example: H, Z, H equals X
Start with |0⟩, North Pole. The first H moves it to |+⟩ on the equator. Z swings it around the equator to |−⟩. The second H moves |−⟩ down to the South Pole, |1⟩. Overall |0⟩ became |1⟩, which is exactly what an X gate does. This works for any starting state: H followed by Z followed by H always acts exactly like X.

## FAQ: Does the Z gate do nothing?
It does not do nothing, but you may not see it with a quick measurement. Z flips the sign of the |1⟩ amplitude. If you measure right away, the probabilities of 0 and 1 are the same as before. But the phase has changed, and a following H gate turns that into a visible difference.

## FAQ: What does the Hadamard (H) gate do?
It moves a qubit between the poles and the equator. Applied to |0⟩ it gives |+⟩, an equal blend of 0 and 1. Applied to |+⟩ it gives |0⟩ back. It is the most common gate for making a superposition.

## FAQ: How is the X gate different from a classical NOT?
On |0⟩ and |1⟩ they do the same thing. The difference is that X also works on superpositions: it swaps the two amplitudes, so α|0⟩ + β|1⟩ becomes β|0⟩ + α|1⟩. A classical NOT can only handle a definite 0 or 1.

## FAQ: Why must quantum gates be reversible?
Quantum mechanics keeps total probability equal to 1 and describes closed systems with reversible transformations. The only irreversible step is measurement. For this reason every gate is unitary and has an inverse.

## FAQ: Are there more gates than X, Z and H?
Yes. Any rotation of the Bloch sphere is a valid single-qubit gate. Real machines support a small basic set from which others are built, and in Module 5A you will meet the CNOT, a gate that acts on two qubits.

## Glossary: Key words
Gate: an operation on qubits. Unitary: a reversible, probability-preserving transformation. X, Y, Z: the Pauli gates, half-turns about each axis. H (Hadamard): moves between poles and equator. Phase: the relative angle between the two amplitudes. Inverse: the gate that undoes another.

## Misconception: Z does nothing because the probabilities don't change
Z changes the phase, and phase changes the outcome of later gates. It is invisible to an immediate measurement but not to the rest of the circuit. H, Z, H acting as X shows it clearly.
