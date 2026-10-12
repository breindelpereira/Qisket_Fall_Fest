---
id: module_1
---

## Explain: Bits, qubits and amplitudes
A classical bit is always 0 or 1. A qubit's state is described by two numbers called amplitudes, one for the outcome 0 and one for the outcome 1. We write the state as α|0⟩ + β|1⟩, where α and β are the amplitudes.

The amplitudes are not probabilities. The probability of measuring 0 is the square of the size of α, and the probability of measuring 1 is the square of the size of β. Because those two probabilities must add up to 100%, the amplitudes are linked: |α|² + |β|² = 1. That is called normalisation.

## Explain: What superposition really means
When a qubit is in a superposition, it is described by amplitudes for both outcomes. It is not "secretly one of them, we just don't know which", and it is not simply "0 and 1 at the same time". A fair description is: it has a definite state that is a blend of |0⟩ and |1⟩, and when you measure it you get 0 or 1 with the probabilities the amplitudes give.

The blend itself is real and can be steered: later modules show amplitudes from different paths adding or cancelling, which probabilities for hidden values could never do.

## Explain: The Bloch sphere
The Bloch sphere is a picture of one qubit's state as a point on a globe (this is a simplified model that works for a single qubit only). The North Pole is |0⟩ and the South Pole is |1⟩. The equator holds the equal blends, such as |+⟩ and |−⟩, where measuring gives 0 or 1 with 50% chance each.

How far north or south the point is tells you the probabilities of 0 and 1. How far around the globe it is (its longitude) is the relative phase between the two amplitudes, which does not change the 0/1 probabilities right away but matters later. For two or more qubits this simple globe no longer works, which is one reason entanglement is surprising.

## Example: An equal superposition
The state |+⟩ = (|0⟩ + |1⟩)/√2 has amplitude 1/√2 ≈ 0.71 for each outcome. Squaring gives 0.5, so measuring gives 0 half the time and 1 half the time. You make it by applying a Hadamard gate to |0⟩. On the Bloch sphere it sits on the equator.

A spinning coin is a common analogy: it is neither heads nor tails until it lands. This is only an analogy. A spinning coin really is heads or tails the whole time and we simply do not know which; a qubit in superposition is not hiding a pre-set answer.

## FAQ: Is a qubit really 0 and 1 at the same time?
Not exactly. A qubit in superposition has amplitudes for both outcomes, which is why it behaves differently from a bit that is just unknown. But "0 and 1 at once" makes it sound like it stores two answers you could read out together. When you measure, you always get a single 0 or 1. The accurate statement is that its state is a blend, described by amplitudes, and the measurement result is random with the probabilities those amplitudes give.

## FAQ: What is superposition?
Superposition means a quantum system's state is a combination of basis states, such as |0⟩ and |1⟩, each with an amplitude. Any state of a qubit that is not exactly |0⟩ or |1⟩ is a superposition of them.

## FAQ: What is the Bloch sphere?
It is a way to draw the state of a single qubit as a point on a sphere. The poles are |0⟩ and |1⟩, the equator holds the 50/50 blends, and the angle around the sphere is the phase. It is a handy picture for one qubit, but it cannot show entangled states of several qubits.

## FAQ: Why do we need amplitudes? Why not just probabilities?
Amplitudes can be negative or complex, so they can cancel each other, and probabilities cannot. That cancelling, called interference, is what makes quantum algorithms work. You will see it in Module 4.

## FAQ: What is a qubit made of?
Different machines use different physical things: tiny superconducting circuits, single trapped ions, single atoms held by lasers, particles of light, or spins in silicon. Each choice has trade-offs. Part 2 of the course compares them.

## Glossary: Key words
Qubit: the quantum version of a bit. Amplitude: a number (possibly negative or complex) attached to each outcome. Superposition: a state that is a combination of basis states. Basis states: the two reference states |0⟩ and |1⟩. Ket: the |...⟩ notation for a quantum state. Normalisation: the probabilities must add up to 1. Bloch sphere: a globe picture of one qubit.

## Misconception: A qubit is both 0 and 1, so it stores infinite information
A qubit's state does take continuous values, but you cannot read them out. Measuring gives one bit, 0 or 1. One qubit never lets you extract more than one bit of information, however clever the blend was.

## FAQ: What does the WIRED clip in this module show?
Video: OWJCfOvochA 2:18-6:15
It is the first level of WIRED's "Quantum Computing in 5 Levels": a quantum computing researcher explains the idea to a young person. It uses a spinning penny to show superposition, a pair of pennies to show entanglement, and a quick look at the very cold fridge that quantum chips sit in, ending with one hoped-for use: simulating chemistry. It is a friendly analogy-level introduction, so it matches the idea of a qubit in this module without any maths.

## Explain: Why a different kind of computer
Video: OWJCfOvochA 2:18-3:22
The researcher starts from an everyday experience, running out of space on a phone, and says some problems run out of room in the same way even on the biggest supercomputer. Her team is building computers that follow a different set of rules, those of quantum mechanics, the branch of physics for things that are very small, very well isolated and very cold. A quantum computer is a machine designed around those rules instead of ordinary on/off bits.

## Explain: Superposition shown with a spinning penny
Video: OWJCfOvochA 3:22-4:25
A penny lying on the table is clearly heads or tails. A spinning penny is neither one nor the other while it spins: it is a mix of both. The video uses this to say that superposition means a thing is in a state that combines two outcomes, and that real physical objects can be in such states. Remember this is an analogy: a real qubit is not a tiny spinning coin, and a measured qubit gives 0 or 1 with chances set by its state, which the next module's Bloch sphere makes precise.

## Explain: Entanglement shown with two pennies
Video: OWJCfOvochA 4:25-5:28
In everyday speech "entangled" means tied together but separable, like tangled hair. For quantum objects it means a much stronger link that is hard to undo. Two ordinary pennies spun and stopped separately give unrelated results. Two entangled "pennies" would always match when measured: one shows heads exactly when the other does, and tails exactly when the other does, even if you measure at the same moment. The video calls this correlated outcomes. As with the spinning penny, treat it as a picture; the Bell-test module later shows what entanglement really does and does not allow.

## Explain: Why the chips are kept so cold
Video: OWJCfOvochA 5:28-6:15
To see these quantum properties the chips have to be kept extremely cold, which is what the dilution refrigerator (a tall fridge that looks nothing like a kitchen one) is for. Cooling lets qubits stay in superposition and become entangled without their information leaking away into the surroundings. The clip ends with one proposed use: simulating chemical bonding, using one quantum system to model another.
