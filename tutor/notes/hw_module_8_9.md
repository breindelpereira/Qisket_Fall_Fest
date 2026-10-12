---
id: hw_module_8_9
---

## Explain: Physical and logical qubits
A physical qubit is a real device, such as a superconducting circuit or an ion, and it makes errors. A logical qubit is information spread across many physical qubits in a pattern that lets errors be found and fixed without reading the information. A logical qubit fails far less often than any single physical qubit. It is made of real hardware and is much more reliable, but never perfectly error-free.

## Explain: The surface code idea
In the surface code, qubits are laid out on a grid. Some hold the data, and others are measured again and again to check whether neighbouring qubits agree, like the parity checks in Module 7 but arranged in two dimensions so that both bit flips and phase flips are caught. The pattern of check results points to where something went wrong, and a decoder decides how to correct it, all without measuring the data itself.

## Explain: The threshold
Error correction only works if the physical qubits are good enough. Below a threshold error rate, often quoted as about one percent per operation for the surface code, making the grid larger makes the logical qubit better and better. Above the threshold, a bigger grid makes things worse, because there are more places for errors to occur than the code can fix. That is why improving the physical qubits still matters.

## Explain: The overhead
The better a logical qubit must be, the larger the grid has to be, and so the more physical qubits are used for each logical one. Useful algorithms are expected to need very many physical qubits for each logical qubit, often quoted in the hundreds to thousands. This overhead is one of the main reasons large useful machines are hard.

## Explain: Choosing hardware for a task
There is no single best modality. Ask what the task needs: a deep circuit needs long coherence and fast, accurate gates; many two-qubit interactions need good connectivity; large problems need many qubits and a way to scale and cool them; an optimisation problem may suit an annealer. Architecture is about balancing cooling, speed, noise and connectivity.

## FAQ: What is a logical qubit?
A qubit made from many physical qubits working together through error correction, so that it behaves like one much more reliable qubit.

## FAQ: Why can't we just make better physical qubits?
We keep improving them, and that matters, but no physical qubit will be perfect. Error correction lets a machine reach the reliability that long algorithms need, using physical qubits that are good but imperfect.

## FAQ: How many physical qubits make one logical qubit?
It depends on the code, on the physical error rate and on how reliable the logical qubit must be. Estimates for useful algorithms are often in the hundreds to thousands, and numbers change as codes and hardware improve.

## Misconception: A logical qubit is a software trick
It is not simulated in software. It is real information stored across real physical qubits, and it needs a lot of them.

## Glossary: Key words
Physical qubit: a real device that makes errors. Logical qubit: a protected qubit made from many physical ones. Surface code: an error-correcting code on a grid. Threshold: the error rate below which a bigger code helps. Decoder: the software that works out the correction from the check results. Overhead: the extra qubits needed for protection. Architecture: the combination of choices that makes up a machine.

## FAQ: What do the two error-correction videos in this module show?
Video: 4hWUIGZh6WE 0:00-5:20
The QuTech lecture explains the theory: why error correction is necessary, how a logical qubit is built from many physical qubits using helper qubits, which errors can be corrected, and how a bigger code gives a smaller failure rate, with the surface code as a candidate. The Google Quantum AI video tells the story of an experiment that, for the first time according to the video, showed that making the error-correcting system bigger made the errors go down slightly instead of up.

## Explain: Why error correction is needed in the first place
Video: 4hWUIGZh6WE 0:09-1:45
A big computation breaks into many gates and a final measurement. If each gate fails with some probability, the failures accumulate, and the more gates there are, the more likely the answer is garbage. Qubits that sit idle also drift and relax to a thermal state. Useful calculations would need a failure probability per gate as low as about one in 10^15. The video says no qubit technology has that: at best a gate fails less than about 1% of the time, and getting to 10^-15 by better hardware alone seems implausible, even after 20 years of progress.

## Explain: How a logical qubit watches for errors without measuring the data
Video: 4hWUIGZh6WE 1:45-3:39
The idea is to represent one logical qubit redundantly, for example with 7 physical qubits. You cannot just measure them to look for errors, because that would destroy the state. Instead, helper (ancilla) qubits are coupled to the data qubits and only the helpers are read, and from that information you infer what error happened and undo it. A single qubit can suffer a bit flip or a phase flip, and every other error is a combination of these. A code corrects only errors on small sets of qubits: with the seven-qubit code any single-qubit error is fixed but not errors on two or more qubits. So it helps when single errors are much more likely than pairs.

## Explain: More redundancy, the surface code and how codes are described
Video: 4hWUIGZh6WE 3:39-5:20
Adding redundancy lets you correct bigger sets of errors, so the logical failure rate, set by the errors that are not corrected, can become very small. For example, 49 qubits per logical qubit instead of 7. The video says that roughly 10,000 qubits might bring the failure rate down to 10^-15 using a code called the surface code, which has the practical advantage that its qubits lie on a flat 2D chip with only local connections. There is no single best code. A code encodes k logical qubits into n physical ones and has a distance d, correcting up to about d/2 errors; the seven-qubit Steane code has distance 3 and corrects one error. In practice, how you gather the error information fault-tolerantly matters even more.

## Explain: Why it is hard: making a bigger system better, not worse
Video: _ugJLuJ1_gM 0:01-2:05
Google's team says its latest chip is its most powerful but would need to be thousands of times larger for the applications people are excited about, and that bigger machines mean more errors. Error correction promises to let you build bigger, less error-prone systems, but nobody had made the real system good enough that scaling it up reduces the errors. The experiment needs the chip, the fridge, the electronics and the cables all working together. The first attempt performed terribly, and the team had to develop new ways of making the chip do what they wanted. Part of the difficulty is that qubits must be shielded from the environment yet still listen to control signals and report back.

## Explain: The break-even result, as told by the team
Video: _ugJLuJ1_gM 2:05-3:59
After months of work on better operations and better decoders, which work out what errors happened from the readout, the team says it passed the break-even point: even though a larger array of data qubits was used, the error rate came slightly down. They present this as evidence that quantum error correction works in practice and not only on paper, opening the door to very large machines. The closing statements about the roadmap and a large useful quantum computer being close are the team's confidence, and a prediction, not a result.
