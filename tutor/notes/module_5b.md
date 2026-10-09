---
id: module_5b
---

## Explain: Why you cannot copy a qubit
The no-cloning theorem says there is no way to make an exact copy of an unknown quantum state. A short reason: copying would have to work for every state, but quantum operations are linear, and a linear copier that works for |0⟩ and |1⟩ gives the wrong answer for blends of them. Measuring first to learn the state does not help either, because the measurement destroys the superposition and gives only 0 or 1.

You can copy classical bits, and you can build a copy of a state if you already know how it was prepared. What you cannot do is copy a state you do not know.

## Explain: How teleportation works
Teleportation moves a qubit's state from Alice to Bob without sending the qubit. They first share an entangled pair, one half each. Alice has the qubit to send. She makes a joint measurement of her qubit and her half of the pair (a CNOT, then an H, then measuring both). This gives two ordinary bits and destroys the original state. She sends those two bits to Bob by normal means.

Bob's half of the pair is now in one of four possible states related to the original. Depending on the two bits, he applies nothing, an X gate, a Z gate, or both. After that his qubit is exactly the state Alice started with.

## Explain: Why it is not faster than light, and why the state is not copied
Until the two classical bits arrive, Bob's qubit looks completely random; each of the four possible bit pairs is equally likely (25% each), so without the bits he has nothing useful. The bits travel at no more than the speed of light, so teleportation cannot beat it. The state is also not copied: Alice's measurement destroys her version, so there is only ever one copy. Teleportation moves the state, it does not move matter, and it uses up the shared entangled pair.

## Example: Alice sends a mystery qubit
Alice wants to send a qubit in a state neither she nor Bob knows. She measures, gets bits 1 and 0, and sends them. Bob sees "1, 0", so he applies the matching correction. His qubit now equals the original. If the bits had been 0 and 0, he would have done nothing. In the Teleportation Lab you can step through this and see Bob's fidelity (how close his qubit is to the original) jump to 100% only after the correction.

## FAQ: Why can't we just copy the qubit?
Because of the no-cloning theorem: no machine can copy an unknown quantum state exactly. This also keeps quantum cryptography secure, since an eavesdropper cannot make a perfect copy.

## FAQ: Why does teleportation need two classical bits?
Alice's joint measurement has four possible results, which take two bits to name. Bob needs to know which one happened to pick the right correction (nothing, X, Z, or both).

## FAQ: Does teleportation move the actual particle?
No. It moves the state, not the matter. Bob's qubit is a different physical qubit that ends up in the state Alice's qubit had.

## FAQ: Can teleportation send information faster than light?
No. The correction needs the two classical bits, and they travel at the normal speed of communication.

## FAQ: What is teleportation used for?
It is used in quantum networks and in some proposals for connecting quantum computers, and as a building block in fault-tolerant computing, where it moves states and performs certain gates safely.

## Glossary: Key words
No-cloning theorem: unknown quantum states cannot be copied. Teleportation: moving a quantum state using entanglement and two classical bits. Bell measurement: Alice's joint measurement of her two qubits. Correction: the X and/or Z gates Bob applies. Fidelity: how close two states are (100% means identical).

## Misconception: Teleportation is like in science fiction
Nothing physical is sent, nothing is instant, and the original is not left behind. It is a careful way to move a quantum state using entanglement and a normal message.
