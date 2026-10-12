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

## FAQ: What do the two superconducting-qubit videos cover?
Video: cb_f9KpYipk 0:00-6:03
The QuTech video explains what a transmon is as a circuit: a pair of superconducting islands joined by a Josephson junction, which works like an oscillator whose levels are not evenly spaced, so that two levels can serve as the qubit. The Google video starts from "information is physical", explains why a quantum bit cannot be stored the way a computer stores a classical bit in memory, and why cooling a circuit until it becomes superconducting gets rid of most quantum errors.

## Explain: Superconducting qubits are circuits we make ourselves
Video: cb_f9KpYipk 0:00-2:16
The QuTech presenter points out two differences from natural two-level systems such as an electron's spin. First, a superconducting qubit has many energy levels, like an atom, and is made into a qubit by keeping the dynamics in the lowest two. Second, it is a circuit that people fabricate, which allows freedom of design (the video calls these artificial atoms) but also means no two qubits come out identical, so each has an individual personality. The circuits consist of superconducting islands joined by Josephson junctions, in many varieties: charge, flux and phase qubits, fluxonium and others.

## Explain: Why the transmon uses a Josephson junction
Video: cb_f9KpYipk 2:16-5:39
Superconducting qubits typically work at about 4 to 8 GHz, and the same frequency is that of the microwave pulses used to drive them. A transmon in its simplest form looks like a capacitor in parallel with an inductor, an LC oscillator. The trouble is that an LC oscillator has evenly spaced levels, so it is hard to confine it to just two and the qubit "leaks" into higher levels. Replacing the coil by a Josephson junction, whose energy is a cosine of the flux and not quadratic, breaks the even spacing. At typical values, with a 6 GHz qubit, the next transition is lower by about 300 MHz, which is enough to keep the dynamics in two levels during 20-nanosecond pulses.

## Explain: Two junctions make the frequency tunable
Video: cb_f9KpYipk 5:39-6:03
In practice a transmon is built with two Josephson junctions in parallel. Threading magnetic flux through the loop between them tunes the inductance and therefore the qubit's frequency, independently for each qubit and on nanosecond timescales. The presenter calls this the workhorse that makes two-qubit gates possible, which a later video in the QuTech course covers.

## Explain: Why a bit stored in a normal circuit cannot just be put in superposition
Video: uPw9nkJAwDY 0:00-5:42
The Google presenter starts with states: a classical computer is in one memory state at a time, while a quantum algorithm builds complex superpositions of many. In an ordinary memory chip a bit is the presence or absence of about 300,000 electrons, which makes it robust, because a few leaking out does not matter and the chip keeps topping them up. But checking the level for errors forces the bit to be 0 or 1, and even a single stray photon interacting with one electron can carry away the information, which is what we call collapse. Classical information survives being peeked at, quantum information does not.

## Explain: Why more electrons do not help, and how superconductivity does
Video: uPw9nkJAwDY 5:42-8:35
In classical memory, redundancy fixes errors. In a quantum system the video says this backfires, because an error happens whenever nature observes any one of the physical parts, so a bigger system has more chances. Google's approach is a circuit with a huge number of electrons whose quantum errors are suppressed by superconductivity: when certain metals are cooled, their electrons join into one unit and stop scattering, so errors drop to nearly zero. The qubits are aluminium oscillators holding either no energy or a single quantum of energy, at about 6 GHz, in a fridge at 15 millikelvin or so, colder than deep space.

## Explain: The layout and the remaining challenge
Video: uPw9nkJAwDY 8:35-10:46
Unlike a conventional computer, where data moves between memory and processor, superconducting qubits sit still in a grid, each connected to its neighbours, and logic is done by sending control signals to single qubits or pairs, because moving data would add errors. Errors remain: the current of electrons in the oscillator couples to charged particles and defects nearby, for instance a charged ion inside the metal could absorb the energy and flip the qubit. Cleaning up these atomic imperfections through better fabrication is a main research aim, and the video says improvements over several years have lowered error rates a lot.
