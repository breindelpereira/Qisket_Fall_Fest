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

## FAQ: What does the Physics but Awesome video on quantum gates cover?
Video: HHV-P4_Xp1E 0:00-10:51
It explains how a quantum computer actually computes. It starts from classical computers, where everything is gates acting on bits, then shows that a quantum computer is the same idea with gates acting on qubits, with two special rules: gates must be reversible, and they can act on superpositions. It covers single-qubit gates such as the Hadamard, the CNOT that creates entanglement, which sets of gates are universal, and why measurement is the one irreversible step.

## Explain: Everything is gates, even adding two numbers
Video: HHV-P4_Xp1E 0:00-1:45
The video begins with ordinary arithmetic: adding 34 and 8 by writing the 2 and carrying the 1. Computers do the same with binary numbers, and the whole addition, carries included, can be built from nothing but NAND gates, a simple gate that takes two inputs and gives one output. The point is not the details but the principle: what a computer does, from adding to streaming video, comes down to gates acting on bits. A quantum computer follows the same principle with qubits, so every algorithm in the end is gates acting on qubits.

## Explain: A qubit and the arrow in the Bloch sphere
Video: HHV-P4_Xp1E 1:45-3:09
A bit is simply 0 or 1. A qubit is a quantum system with two basic states that we call 0 and 1, but it can also be in any combination of the two. The Bloch sphere shows this as an arrow inside a sphere. The arrow does not point in physical space: it shows which mixture of 0 and 1 the system is in, it is the state vector, and its position is given by two angles, like latitude and longitude. Those two angles are enough to work out the chance of measuring 0 or 1.

## Explain: Circuits, reversibility and rotations
Video: HHV-P4_Xp1E 3:09-5:36
In the circuit picture a line is a wire carrying a bit and a box is a gate. Quantum circuits look the same, except the wire may be a moving particle or just time passing, and the gates act on qubits; the quantum NOT is called the X gate. Two things are special. First, every gate must be reversible. The state vector must always keep a length of 1 because the chances must add to 100%, so a gate can only rotate the arrow, and a rotation can always be undone; such a gate is called unitary. Second, because a qubit may be a mix of 0 and 1, a gate acts on both parts at once, which the video says is useful but has limits that appear at measurement.

## Explain: Single-qubit gates, the Hadamard and the CNOT
Video: HHV-P4_Xp1E 5:36-7:23
The simplest gate takes one qubit and rotates it. The key example is the Hadamard gate, which turns a definite qubit into a 50/50 mix of 0 and 1 (with a different phase on the two parts). Two-qubit gates must also be reversible, so they cannot be NAND, which loses information: from an output of 1 you cannot recover the inputs. The usual solution is a controlled operation, where one qubit is the trigger and the other the target. The controlled-NOT flips the target only when the trigger is 1. If the trigger is in a superposition, the result is an entangled pair that cannot be split into separate states, which is why this gate is the standard way of making entanglement.

## Explain: Universal sets of gates
Video: HHV-P4_Xp1E 7:23-8:24
In classical computing, certain small sets of gates can reproduce any circuit: AND with NOT, or OR with NOT, and NAND alone or NOR alone. That is why computers can do anything with very few kinds of component. Quantum computing has the same notion. One universal set is the CNOT plus any single-qubit rotation. The video says results like this made people realise that building a quantum computer might really be possible, since a machine that can do arbitrary single-qubit gates and the CNOT can in theory perform any quantum computation.

## Explain: Measurement is the irreversible step
Video: HHV-P4_Xp1E 8:24-10:30
The only way to get an answer out is to measure, which the video treats as a gate that is not reversible. A measurement collapses the state to one outcome, so it destroys superposition and entanglement. On the Bloch sphere it projects the arrow to the 0 or 1 pole, and the chance depends on where the arrow was: northern hemisphere is more likely 0, southern hemisphere more likely 1. This is the catch behind quantum parallelism. The gates can act on every input at once, but a measurement returns only one result at random, so by itself it is useless. Quantum algorithms are the clever ways of combining the parallel results so the information you want comes out. The video also says a quantum computer can do anything a classical one can, and that these gates are logical ideas that must be realised in real hardware.
