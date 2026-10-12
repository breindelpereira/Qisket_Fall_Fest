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

## FAQ: What do the two videos in the noise and error-correction module cover?
Video: vja_KmolxAU 0:00-6:39
The first one, from Qiskit, explains why quantum circuits go wrong and sorts the fixes into three families: error suppression, error mitigation and error correction. It ends with where IBM aims to take fault tolerance. The second, from IBM Technology, describes one big experiment (127 qubits, about 60 layers of two-qubit gates) in which zero-noise extrapolation, a mitigation method, gave results that could be checked against classical calculations.

## Explain: What fault tolerance means and why errors build up
Video: vja_KmolxAU 0:00-1:47
Fault tolerance means a computer keeps giving accurate results despite errors. Classical computers are so reliable that we take it for granted, but even the best quantum computers have much higher error rates. In a circuit diagram each block is a gate, and circuit depth is how many gates run one after another. Errors come from imperfect gates, imprecise readout, unwanted coupling between qubits and interaction with the environment. Every gate adds a small chance of error, so deeper circuits collect more and the final state gets worse. Algorithms that need long circuits, such as factoring and quantum phase estimation for chemistry, therefore need a large fault-tolerant machine.

## Explain: Suppression and mitigation
Video: vja_KmolxAU 1:47-3:33
The video names three approaches. Error suppression avoids the processes that cause errors. For instance, a qubit sitting idle while others work picks up errors, so you can insert a gate and then its inverse, which the algorithm does not need, and splitting the idle time like this reverses one kind of error. That technique is called dynamical decoupling. Error mitigation analyses how errors affect the result and adjusts the answer. Zero-noise extrapolation runs the circuit normally and then with deliberately increased noise, and uses how the result degrades to estimate the error-free value. It needs a known noise factor and several runs, but it can improve accuracy.

## Explain: Error correction, the gross code and the roadmap
Video: vja_KmolxAU 3:33-6:39
Error correction stores one robust logical qubit redundantly across several physical qubits so errors on single physical qubits can be detected and fixed. It needs many physical qubits per logical one and a demanding layout for checks. It can be done today only on one or a few qubits. The video describes an IBM code, the gross code, which it says puts 12 logical qubits into 144 physical qubits, around ten times more efficient than earlier codes. It expects the first fault-tolerant machines to mix all three methods. Last, it points to IBM's published roadmap, with a machine called Starling for 100 million operations on 200 logical qubits and a later one for a billion operations on 1000 logical qubits. These are plans stated in the video and may change.

## Explain: The experiment: a 127-qubit simulation with mitigation
Video: JCrvxWZEtSY 0:00-1:39
An IBM Quantum researcher describes a paper with UC Berkeley. A 127-qubit processor simulated 127 interacting spins, one qubit per spin, with circuits of up to 60 layers of two-qubit CNOT gates, roughly double the previous record, and still gave results that can be trusted at the end. Noise was not removed. Instead a family of methods called error mitigation was used so that useful results could be extracted before the era of fault tolerance.

## Explain: How zero-noise extrapolation works in this experiment
Video: JCrvxWZEtSY 1:39-4:15
Run the circuit and estimate the quantity of interest, such as the average of some property. Noise makes that estimate inaccurate. To correct it, first learn what the noise is doing by splitting the circuit into layers, each made of an ideal part and a noise part, and measuring the noise parts. It is hard to turn the hardware noise down, but with that knowledge you can turn it up by known amounts and repeat the experiment. Then you extrapolate the results back to what you would get with no noise.

## Explain: How the results were checked, and what could not be
Video: JCrvxWZEtSY 4:15-10:49
The model was a spin lattice (the transverse-field Ising model) mapped on to the chip's own connection pattern. For some settings the circuit is a special kind that classical computers can simulate efficiently, so the answer was known exactly and matched. For shallower circuits, the Berkeley collaborators computed exact answers by brute force and then with an approximation method called tensor networks, and again there was reasonable agreement. Pushing to deeper circuits and more qubits, exact classical answers were no longer possible, so those results are unverifiable for now. The researchers hope classical methods will catch up, which would be welcome either way, and say better hardware will allow even deeper circuits on the way to useful problems.
