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
