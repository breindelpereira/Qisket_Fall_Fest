---
id: hw_module_1
---

## Explain: A circuit that acts like an atom
A superconducting qubit is a small electrical circuit made of superconducting metal, such as niobium or aluminium. One special component, called a Josephson junction, makes the circuit behave like an atom whose energy levels are unevenly spaced. The lowest two levels are used as |0⟩ and |1⟩. The most common design is the transmon.

Because it is a chip, these qubits can be made with the tools used for ordinary microchips, and their size and layout can be designed.

## Explain: Why so cold
The metal superconducts only when cold, and heat would also knock the qubit between its levels. The chips sit in a dilution refrigerator at about 10 to 20 millikelvin, far colder than outer space. At that temperature the thermal energy is much smaller than the energy gap between |0⟩ and |1⟩, so the qubit stays where it is put.

## Explain: Control and readout
Qubits are controlled with short microwave pulses sent down cables. A pulse of the right length and strength rotates the qubit, which is a single-qubit gate. Two-qubit gates use a coupling between neighbouring qubits. To read a qubit, a small resonator coupled to it shifts its frequency depending on whether the qubit is in |0⟩ or |1⟩, and a microwave probe detects the shift.

## Explain: Speed and noise
Gates typically take tens of nanoseconds, among the fastest of any approach. Coherence times are typically tens to a few hundred microseconds in recent devices, and they vary by chip and by year. Fast gates are a strength. Noise is a weakness: these circuits are easily disturbed by stray electric and magnetic fields and by materials defects.

## FAQ: What is a transmon qubit?
A transmon is the most widely used kind of superconducting qubit: a superconducting circuit with a Josephson junction, designed so that it is less sensitive to electrical noise than earlier designs. Its two lowest energy levels are used as |0⟩ and |1⟩.

## FAQ: Why do the machines need such big refrigerators?
Cooling the chip is only part of it. Every control and readout cable carries a little heat into the fridge, and the cooling power at the coldest stage is tiny. More qubits need more lines, more electronics and more cooling, so wiring and cooling are as hard to scale as the qubits themselves.

## FAQ: What does absolute zero mean here?
It is the lowest possible temperature, about minus 273 degrees Celsius. The fridges do not reach it exactly but get within a small fraction of a degree, typically around 10 to 20 millikelvin.

## Misconception: The qubit is the big part
The qubit chip is a few millimetres across. What makes a superconducting quantum computer large is the dilution refrigerator, the wiring and the control electronics around it.

## Glossary: Key words
Superconductor: a material that conducts with no resistance when cold. Josephson junction: the component that gives the circuit its atom-like levels. Transmon: the common qubit design. Dilution refrigerator: a fridge that reaches millikelvin temperatures. Microwave pulse: the signal that controls the qubit. Resonator: a circuit used to read the qubit out.
