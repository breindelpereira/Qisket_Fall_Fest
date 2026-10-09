---
id: module_7
---

## Explain: Why qubits make mistakes
Physical qubits are delicate. Heat, stray radiation, vibration and imperfect control pulses disturb them. Decoherence is the loss of the quantum state as the qubit gets tangled up with its surroundings. There are two main error types: a bit-flip (the effect of an X gate, swapping 0 and 1) and a phase-flip (the effect of a Z gate, changing the relative phase). Real errors can be any mixture.

Today's best machines make roughly one error in every hundred to few thousand two-qubit gates, far too many for long algorithms. That is why error correction matters.

## Explain: Encoding without copying
You cannot copy a qubit because of the no-cloning theorem, so error correction does not store three copies. Instead, it spreads the state across several qubits using entanglement. In the three-qubit bit-flip code, α|0⟩ + β|1⟩ becomes α|000⟩ + β|111⟩. That is not three copies of the state; it is a single entangled state.

## Explain: Parity checks and the syndrome
To find an error without looking at the data, add extra "ancilla" qubits and use them to compare pairs of data qubits: do qubits 1 and 2 agree? Do 2 and 3 agree? Measuring only the ancillas gives a pattern called the syndrome. If one data qubit flipped, the pattern tells you which one, and you flip it back. The ancilla measurements reveal only whether qubits agree, not whether they are 0 or 1, so the encoded information (α and β) is untouched.

## Explain: Logical qubits
A group of noisy physical qubits protected by a code acts as one more reliable logical qubit. In the three-qubit code, if each physical qubit flips with probability p, the logical error rate is 3p² − 2p³. For p = 0.1 that is 0.03 − 0.002 = 0.028, much better than 0.1. This only helps when p is below a threshold; with p above 50% it would make things worse. This simple code only handles bit-flips. Real codes, such as the surface code, handle both kinds and may need hundreds to thousands of physical qubits for each logical qubit.

## Example: The syndrome table
For the three-qubit code, the two checks give a pattern. Both checks fine means no error. Check 1 (qubits 1 and 2) fails but check 2 is fine means qubit 1 flipped. Both fail means qubit 2 flipped. Only check 2 (qubits 2 and 3) fails means qubit 3 flipped. Each case has its own fix. The rule looks at which pair disagrees, never at the values themselves.

## FAQ: Why can't we just make backup copies of a qubit?
Because the no-cloning theorem forbids copying an unknown state. Error correction uses entangled encoding and parity checks instead.

## FAQ: What is decoherence?
Decoherence is the loss of a qubit's quantum behaviour as it interacts with its environment. It sets how long a qubit stays useful, called its coherence time.

## FAQ: Why measure the ancillas but not the data?
Measuring the data qubits would collapse the superposition and destroy the information. Measuring the ancillas tells you only which qubits disagree, which reveals the error and not the data.

## FAQ: How many physical qubits make one logical qubit?
It depends on the code and the error rate. Estimates for useful machines range from a few hundred to many thousands per logical qubit.

## FAQ: What is the difference between error mitigation and error correction?
Error mitigation reduces the effect of noise by running extra experiments and processing the results afterwards. It does not protect the qubits. Error correction encodes the information so errors can be detected and fixed while the computation runs, and is needed for large algorithms.

## Glossary: Key words
Decoherence: loss of the quantum state to the environment. Bit-flip and phase-flip: the two basic error types. Ancilla: an extra helper qubit. Syndrome: the pattern of parity check results. Physical qubit and logical qubit: the real noisy qubit and the protected one built from many. Threshold: the error rate below which correction helps.

## Misconception: To check for errors you must measure the data
Measuring the data qubits ruins the superposition. Parity checks on ancillas find errors without learning the encoded state.
