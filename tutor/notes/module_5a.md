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

## FAQ: What does the MinutePhysics Bell's theorem video explain?
Video: zcqZHYo7ONs 0:00-17:34
It builds up Bell's theorem from a pair of polarised sunglasses. First comes a demo where adding a third filter lets more light through, which turns out to be impossibly more than a simple model predicts. Then it shows with a Venn diagram that photons cannot be carrying pre-set answers to every possible filter question. Finally it moves the argument to entangled photons far apart, so the answer cannot be "one filter changed the photon for the next", and concludes that nature cannot be both "real" and "local". It ends with the history: Bell's inequalities in 1964, loophole-free tests from 2015.

## Explain: The three-filter sunglasses demo
Video: zcqZHYo7ONs 0:00-1:49
A polarising filter lets a photon through or not, which works as a measurement of its polarisation. Cross two filters at 90 degrees and almost no light gets through. Now slide a third filter in between, at 45 degrees to the first. The lamp looks brighter, even though the filters only remove light. With perfect filters you can keep adding in-between filters and keep getting more light. The video says the exact amounts are not only surprising, they are too large to explain in a simple way, and following that thread leads to Bell's theorem.

## Explain: Polarisation, probability and the hidden-variable idea
Video: zcqZHYo7ONs 1:49-3:16
Light is a wave in the electromagnetic field and polarisation is the direction it wiggles in. A filter absorbs wiggling along one direction, but photons are quantum objects: each one passes completely or not at all, and which happens looks random. Anyone unhappy with real randomness might suspect a hidden variable, some extra property of each photon that already decides whether it will pass a given filter, too subtle for us to measure so far. The video then says that, surprisingly, a simple experiment can test whether such hidden variables are possible at all.

## Explain: The numbers: 100%, 0%, 50% and 85%
Video: zcqZHYo7ONs 3:16-5:07
Two filters in the same direction: the photon passes with certainty. At 90 degrees: it never passes. At 45 degrees: 50/50. And these chances depend only on the angle between the two filters, not on what the photon met earlier. The odd value is at 22.5 degrees: 85% pass, much more than the 75% you might guess from being halfway. Take filters A at 0 degrees, B at 22.5 and C at 45. Without B, half the photons that pass A are blocked at C. With B, only 15% are blocked at B and 15% of the rest at C. Two small blocks do not add up to 50%, which is why the lamp gets brighter when B is added.

## Explain: The Venn diagram argument
Video: zcqZHYo7ONs 5:07-8:31
Suppose each photon did carry definite answers to "would you pass A, B or C" in advance. Draw 100 photons that pass A. About 85 also pass B, 15 do not. Of the ones passing B, about 15% are then blocked at C. So the photons that pass A but are blocked at C would number fewer than 15 + 15, yet experiments say 50 of them are blocked at C. The video compares it to a counting rule about people with beards and glasses that cannot be broken. The numbers cannot all be right if the answers were fixed beforehand, which is the contradiction.

## Explain: The loophole: filters might change the photon
Video: zcqZHYo7ONs 8:31-9:17
The presenters then point out a hole in that argument. It assumed each answer is static. A photon passing through one filter could change how it meets the next one, and that would explain the numbers. So all the first argument rules out is a hidden-variable theory where one filter's effect on a photon is felt by later filters. The way to close the hole is to use measurements at different places at the same time, so no influence could cross between them without travelling faster than light. That needs entanglement.

## Explain: The entangled-photon version and what it rules out
Video: zcqZHYo7ONs 9:17-12:13
For this video, "entangled" just means two photons that always give matching results when both are measured along one direction (both pass or both are blocked), however far apart they are. Send entangled pairs to two distant places, and at each place pick one of the filters at random. The counts repeat the same numbers: 15% for A and B, 15% for B and C, and 50% for A and C. The same Venn diagram then cannot be drawn: regions limited to 15% each cannot make up a 50% region. The only escape would be an influence between the two photons faster than light.

## Explain: Local realism, Bell inequalities and the history
Video: zcqZHYo7ONs 12:13-17:34
Realism is the idea that a particle has definite properties even when nobody measures it. Locality is the idea that nothing influences anything faster than light. The experiment shows that at least one of them is false, and that nature cannot be locally real. The counting rule that definite-answer questions obey is called a Bell inequality; quantum states break it. John Bell published this in 1964, and experiments since then have confirmed it, though early ones had loopholes that left room for local realism. The first test with no loopholes was in 2015. The presenters add that the maths is only a counting argument and the demo can be done at home with cheap filters.
