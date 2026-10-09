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
