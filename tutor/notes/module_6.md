---
id: module_6
---

## Explain: Reading a circuit and what an oracle is
A quantum circuit is read from left to right. Each horizontal line is a qubit, each box is a gate, and a meter symbol at the end is a measurement. The qubits usually start in |0⟩.

An oracle is a black box: a gate that stands for a function whose inner workings you cannot see. You can only use the box and see what it does. Many quantum algorithms are described in terms of how many times they need to use the oracle, called queries, because that gives a clean way to compare quantum and classical methods.

## Explain: The Deutsch-Jozsa algorithm
The puzzle: a hidden function takes n bits and returns 0 or 1. You are promised it is either constant (the same answer for every input) or balanced (0 for exactly half the inputs, 1 for the other half). Which is it?

A classical computer that always gives the right answer may need up to 2^(n−1) + 1 queries in the worst case. The quantum circuit uses the oracle once: put the input qubits in an equal superposition with H gates, call the oracle, apply H again and measure. If every input qubit reads 0, the function is constant; otherwise it is balanced. Interference makes the "all zeros" outcome certain for constant functions and impossible for balanced ones.

This is a toy problem. A randomised classical algorithm can answer it with only a few queries and a tiny chance of error, so the speed-up is relative to a deterministic classical method. Its value is as the first clear example of a quantum advantage and as the inspiration for later algorithms.

## Explain: Grover's search
Grover's algorithm searches an unsorted list of N items for the one marked item. A classical search checks about N/2 items on average. Grover needs about (π/4)√N steps, which is a quadratic speed-up, much less dramatic than exponential.

Each step has two parts. First the oracle flips the sign of the marked item's amplitude. Then the diffusion step reflects every amplitude about their average, which makes the marked amplitude bigger and the others smaller. Repeating rotates the state steadily toward the answer. It is a rotation, so you must stop at the right time: doing too many steps rotates past the answer and the success chance falls again.

## Example: Grover on 4 items, by hand
With 2 qubits there are N = 4 items. After H gates, each has amplitude 1/2. The oracle flips the marked one to −1/2. The average of the four amplitudes is (3 × 1/2 − 1/2) / 4 = 1/4. Reflecting about the average maps each amplitude a to 2 × 1/4 − a. For the three unmarked items that gives 1/2 → 0, and for the marked item −1/2 → 1. After a single step, the marked item has probability 100%. For larger N you need more steps and the success chance gets close to, but not exactly, 100%.

## FAQ: Is Grover's algorithm exponentially faster?
No. It is quadratically faster: about √N steps instead of about N. That is useful for huge searches but not a miracle.

## FAQ: What is an oracle?
A black-box function you can run but not look inside. It is how algorithm analysts count the cost: by the number of times they call it.

## FAQ: Why does Grover need about the square root of N steps?
Each step rotates the state by a small, fixed angle toward the marked item, an angle of about 2/√N. You need about (π/4)√N such rotations to turn the state from "evenly spread" to "pointing at the answer".

## FAQ: What happens if I run too many Grover steps?
The state keeps rotating past the answer, so the success probability falls again. The Grover Explorer lets you see this.

## FAQ: Does the quantum computer check all the items at once?
No. The oracle is used on a superposition, but you cannot read out all the results. Interference over several steps is what concentrates the probability on the right answer.

## Glossary: Key words
Circuit: gates in time order. Oracle: a black-box function. Query: one use of the oracle. Constant and balanced: the two kinds of function in Deutsch-Jozsa. Amplitude amplification: boosting the right answer's amplitude. Diffusion: reflection about the average amplitude.

## Misconception: Quantum algorithms try every answer at once
They use an oracle on a superposition, but the key work is done by interference, which cancels wrong answers and strengthens the right one. Without that, measuring would just give a random item.

## FAQ: What does the second part of the 3Blue1Brown video cover?
Video: RQWpF2Gb-gU 15:52-29:30
This part of 3Blue1Brown's "But what is quantum computing?" turns the state-vector idea into an algorithm. It introduces quantum gates as flips and rotations of the vector, explains why a quick-to-check problem can be turned into a "flip the sign of the right answer" gate, and then shows Grover's search as a geometric picture: two reflections in a plane that together rotate the vector towards the answer. It ends by working out how many rotations are needed, about pi/4 times the square root of the number of options.

## Explain: Quantum gates are flips and rotations of the state vector
Video: RQWpF2Gb-gU 15:52-17:42
As classical computing has AND, OR and NOT, quantum computing has quantum gates, basic operations on one qubit or several. They always flip or rotate the state vector. The Hadamard gate is the standard example: it sends the "0" direction to a diagonal and the "1" direction to the opposite diagonal, so a definite 0 or 1 becomes a 50/50 balance, and back. Writing an algorithm means composing many gates so the vector gradually ends up pointing almost entirely along one direction, the one that holds the answer. With k qubits there are 2^k directions, one for every bit string, so more interesting answers fit.

## Explain: A huge vector you cannot look at
Video: RQWpF2Gb-gU 17:42-19:33
The video says the size of the state vector growing exponentially is a real source of quantum computing's potential, even though the power has often been exaggerated: just 100 qubits already means an enormous vector. The catch is that you cannot look at its values directly. It is useful only if you can steer all, or most, of the probability onto one single component that happens to be the answer you care about. Grover's algorithm is the clearest example of doing exactly this. In outline: start with equal probability on every outcome, flip the sign of the key's component, then alternate that with another operation, until almost all of the probability sits on the secret key.

## Explain: Why "flip the sign of the answer" is an available operation
Video: RQWpF2Gb-gU 19:33-21:27
Grover's algorithm applies to any problem where a solution can be checked quickly even if finding it is hard: solving a sudoku, colouring a map so neighbours differ, and many tasks in cryptography. Such a check is built from classical logic gates. Grover knew that any set of logic gates can be translated into quantum gates that act on the state vector so that the entry for each input the check accepts gets its sign flipped and the entries it rejects are left alone. So, for any quick-to-verify problem, you can build an operation that flips the sign at the position of the solution. At first that seems useless, because flipping a sign does not change the probabilities.

## Explain: The geometric picture: a 2D slice and a small angle
Video: RQWpF2Gb-gU 21:27-24:43
The video shows the algorithm with a three-direction example and notes it works the same way for any size. The vector stays inside a flat plane spanned by two directions: the secret key direction (drawn upwards) and the equal mix of all non-key states (drawn along the horizontal). The starting vector, the equal balance of everything, is not quite perpendicular to the key direction because it contains a little of the key. Taking the dot product, the balance state's overlap with the key is 1 over the square root of n, so the angle theta between the balance state and the horizontal is about 1 over the square root of n radians. That small angle is where the square root in Grover's runtime comes from.

## Explain: Two reflections push the vector towards the key
Video: RQWpF2Gb-gU 24:43-27:13
The procedure is simple. First, flip the sign of the key component: in the diagram that is a reflection across the horizontal axis. Second, reflect the vector across the equal-balance direction. After one round the vector points slightly more towards the key, so a measurement would have a slightly larger chance of showing it. The video shows the numbers for n equal to 100, where the key's component grows a little with every round. The video asks you to take it on trust that such a reflection about a known state is possible; the intuition comes from the geometry.

## Explain: How many rounds, and what you do at the end
Video: RQWpF2Gb-gU 27:13-29:30
Two reflections in a row are the same as one rotation by twice the angle between the two mirror lines, so each round turns the vector by 2 theta. To get from the start to the key direction takes a turn of about a quarter of a full circle, which means about pi/4 times the square root of n rounds. For a million options (2 to the 20th) that is around 804 rounds, and it needs at least 20 qubits. The result is not guaranteed: there is a small chance of seeing a wrong value, but because answers are quick to check you just check on a classical computer and rerun if needed. The video then says it will own up to a simplification it made and reflect on where the speed-up comes from.
