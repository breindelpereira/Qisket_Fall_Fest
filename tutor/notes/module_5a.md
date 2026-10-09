---
id: module_5a
---

## Explain: Making an entangled pair
Entanglement is a link between qubits that cannot be described one at a time. A standard way to make it: start two qubits in |00⟩, apply an H gate to the first one to make it a superposition, then apply a CNOT gate, which flips the second qubit only if the first one is 1. The result is the Bell state (|00⟩ + |11⟩)/√2.

In that state there is no separate state for each qubit. Measuring either one gives 0 or 1 at random, 50% each. But the two results always agree: both 0 or both 1. The pair as a whole is well defined, while the individual qubits are not.

## Explain: Why you cannot send a message with entanglement
Each person's result, taken alone, is a fair coin flip. What entanglement gives is a link between the two results, and you can only see that link when the two people compare their results, which needs a normal message sent at ordinary speed. Whatever Alice does to her qubit, Bob's results alone still look random. This is why entanglement cannot be used to send information faster than light. It does not violate relativity.

## Explain: Bell's inequality and the CHSH game
Einstein suspected the correlations came from hidden instructions set when the pair was created, like two sealed boxes with matching tickets. John Bell showed how to test this. In the CHSH game, Alice and Bob each get a random bit and each answer with one bit, without talking. They win if the XOR of their two answers equals the AND of their two input bits. Any strategy built on pre-agreed hidden instructions wins at most 75% of the time. Players sharing an entangled pair and measuring in cleverly chosen directions win about 85.4% of the time (cos²(π/8)). Real experiments, including loophole-free ones, find results above 75%, ruling out local hidden variables. The 2022 Nobel Prize in Physics honoured this work.

## Explain: Exponential space
One qubit needs 2 amplitudes. Two qubits need 4, three need 8, and 10 qubits need 1,024. The description doubles with every qubit added. This is why simulating many qubits on a classical computer gets hard fast. But it does not by itself make quantum computers faster: a measurement of n qubits still returns just n bits.

## Example: Two gloves in sealed boxes
Put a left and a right glove in two sealed boxes and send them to opposite sides of the world. Opening one box instantly tells you what the other holds. That is a classical correlation, and nothing travels between the boxes. This is an analogy that captures part of it, but Bell's theorem shows entanglement is stronger than this: no pre-set contents can reproduce all the quantum results.

## FAQ: Can entanglement send messages faster than light?
No. Each side's results look random on their own. The pattern only shows up when the results are compared by ordinary communication, so no information travels faster than light.

## FAQ: What is a Bell state?
A Bell state is one of four maximally entangled two-qubit states. The most common is (|00⟩ + |11⟩)/√2, made with an H gate and a CNOT. Measuring both qubits always gives matching results.

## FAQ: What did Einstein mean by "spooky action at a distance"?
He was uneasy that measuring one half of an entangled pair seems to settle the result of the other half instantly. He thought hidden properties must explain it. Bell's theorem and experiments show that no local hidden-variable theory can match the quantum predictions.

## FAQ: Is entanglement just correlation?
Ordinary correlation, like the gloves, can be explained by pre-set values. Entanglement gives correlations that no pre-set values can reproduce, which the CHSH game shows (more than 75% wins).

## FAQ: How do you entangle two qubits?
Use a two-qubit gate such as CNOT after putting one qubit into a superposition. In the Two-Qubit Lab you can build the Bell state and see the correlations.

## Glossary: Key words
Entanglement: a link between qubits that cannot be described separately. CNOT: a two-qubit gate that flips the second qubit if the first is 1. Bell state: a maximally entangled two-qubit state. Local hidden variables: the idea that results are set in advance. CHSH: a game that tests Bell's inequality. Correlation: how often results agree.

## Misconception: Entanglement lets you send an instant text message
Measuring one qubit does not let you control the other's result, and on its own Bob's result is random. Nothing usable is sent until Alice tells Bob her result by normal means.
