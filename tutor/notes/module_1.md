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
