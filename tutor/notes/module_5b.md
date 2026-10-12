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

## FAQ: What do the two teleportation videos in this module cover?
Video: dAaHHGHuy1c 0:00-2:01
The first, a two-minute MinutePhysics clip, relates science-fiction transporters to quantum teleportation and explains the no-cloning rule in plain words. The second, Qiskit's "How Quantum Teleportation Really Works", is a full walk-through: the setting with Alice and Bob, the steps (a CNOT, a Hadamard, two measurements, then Bob's corrections), and a real run on an IBM quantum computer. Together they say that teleportation moves a state, never matter, and that it needs entanglement plus ordinary communication.

## Explain: Transporters, copies and the no-cloning rule
Video: dAaHHGHuy1c 0:00-2:01
The clip starts with the worry about a Star-Trek style transporter: if it takes you apart and rebuilds you elsewhere, is the rebuilt person really you, and what if the original were not taken apart? Then it brings in the one real teleportation we have, discovered in the 1990s. You can transfer the exact quantum condition of one set of quantum objects onto others arbitrarily far away. The objects do not move, only their state does. An important rule comes with it: it is impossible to make an identical copy of an unknown quantum state without destroying the original, which is called the no-cloning theorem. The presenter's closing thought, about what this would mean for a transporter, is speculation, not established science.

## Explain: What quantum teleportation is, and where it came from
Video: jxqnzltpDdE 0:00-1:48
Qiskit's video says plainly that movie-style teleportation is impossible, since nothing can travel faster than light. Quantum teleportation is real, though, and it moves information, not matter. All it needs is an entangled pair with one half at each site, and a way to send ordinary classical information between the sites. It was worked out in 1993 by a team that included IBM's Charles Bennett. It is called teleportation because the quantum information disappears at one place and appears at another without crossing the space between. The video stresses that nothing about it is magic.

## Explain: The set-up: Alice, Bob, an unknown qubit and an e-bit
Video: jxqnzltpDdE 1:48-3:14
Alice holds a qubit in an unknown state and wants to give that state to Bob, who is far away. She cannot send the qubit itself, perhaps because she does not know where he is. But they already share an entangled pair of qubits, one each, which the video calls an e-bit and treats as a resource for sending quantum information. The video also notes that in Qiskit the usual order of qubits is right to left, so qubit 0 is written last.

## Explain: The steps: CNOT, Hadamard and measuring both qubits
Video: jxqnzltpDdE 3:14-5:23
Step one: Alice applies a CNOT with her unknown qubit as the control and her half of the e-bit as the target. Step two: she applies a Hadamard gate to her unknown qubit. Written out, the three-qubit state looks like a mess, but it can be regrouped into four terms. Step three: she measures both of her qubits. Whichever of the four results she gets, Bob's qubit is left in a state closely related to the original unknown one. For one of the four results it is exactly the original state already.

## Explain: Bob's corrections and why this is not faster-than-light
Video: jxqnzltpDdE 5:23-7:08
Bob has to know what Alice measured. With one of the other outcomes he must apply a Z gate, with another an X gate, and with the last both, to turn his qubit into the original state. So Alice phones him with her two classical bits. This is the reason teleportation does not break causality: Bob's qubit changes the instant Alice measures, but he cannot get any use out of it until her message arrives, and that message cannot go faster than light. The video also highlights that the original state at Alice's side is destroyed, and she does not need to know where Bob is.

## Explain: Running it in Qiskit and checking it worked
Video: jxqnzltpDdE 7:08-10:20
The circuit uses three qubits. A Hadamard and a CNOT make the e-bit. A random unitary, drawn as a box U, prepares Alice's qubit in an unknown state. Then the CNOT, the Hadamard and the two measurements, followed by Bob's conditional X and Z gates (applied only if the matching measurement was 1). To check it, the video adds the inverse of U on Bob's qubit at the end. If teleportation worked, Bob's qubit should now read 0. The video points out that this check is only a diagnostic, since it undoes the very state you teleported.

## Explain: The real-hardware result, and teleporting across the chip
Video: jxqnzltpDdE 10:20-14:38
On a real IBM processor, noise and imperfect gates mean Bob does not always read 0, but he does the large majority of the time, which counts as success. In that first run Alice and Bob were neighbours, so swap gates would have done the same job. To make it more impressive, the video moves them far apart on the chip with swap gates after creating the e-bit. It still works, but the success rate is lower, because the extra swaps cost accuracy and weaken the e-bit. The video ends by saying the 1993 protocol is a basis for gate teleportation and quantum networks, and that states have been teleported to a satellite 1,400 km up.
