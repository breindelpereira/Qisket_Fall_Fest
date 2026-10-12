---
id: hw_module_5
---

## Explain: A single electron's spin
An electron has a spin, a tiny magnetic direction that can point up or down. In a silicon spin qubit, spin up and spin down are |0⟩ and |1⟩. The electron is trapped in a quantum dot, a very small region on a chip, only tens of nanometres across, defined by voltages on tiny electrodes.

## Explain: Why silicon
Natural silicon contains an isotope whose nucleus has a spin that disturbs the electron. Silicon purified to remove that isotope gives the electron a very quiet environment, so its spin keeps its information for a long time. Silicon is also the material of ordinary chips, which is the main attraction.

## Explain: Two-qubit gates
Voltages on gate electrodes decide where each electron sits. Lowering the barrier between two neighbouring dots lets the electrons overlap, which creates an exchange coupling that swaps their spins. If the barrier is lowered for exactly the right time, the result is an entangling gate. The coupling gets weaker very quickly as the barrier is raised, so the barrier acts as a knob.

## Explain: Scaling and tuning
These qubits are small and could in principle be made in the same factories as ordinary processors, which gives the approach a large scaling potential. The difficulty is that every dot is slightly different, so each one needs its own voltages and calibration. Tuning millions of dots to behave is as much a control problem as a physics one.

## Explain: Temperature
Silicon spin qubits typically run at around a kelvin or below. That is much warmer than superconducting qubits, which makes cooling somewhat easier, but they still need a refrigerator.

## FAQ: What is a quantum dot?
A tiny region on a chip that can hold a single electron, like a very small cage for charge, made by applying voltages to nearby electrodes.

## FAQ: Why could silicon qubits be easier to manufacture?
Because they use the same materials and processes as the global semiconductor industry. That could allow very large numbers of qubits on one chip, though making them all behave is the hard part.

## FAQ: How is a spin read out?
A common method converts the spin into charge: only an electron with one spin direction is allowed to move, and a sensitive charge detector nearby registers whether it moved.

## Misconception: Silicon spin qubits need no cooling
They run warmer than some other kinds but still need cooling to around a kelvin or below.

## Glossary: Key words
Spin: the tiny magnetic direction of an electron. Quantum dot: a small region that traps electrons. Exchange coupling: the interaction between neighbouring electron spins when their orbits overlap. Gate electrode: a small metal contact whose voltage shapes the dots. Isotope: a version of an element with a different number of neutrons.

## FAQ: What do the two QuTech videos on spin qubits explain?
Video: y9dt5uTvsEM 0:00-10:31
The first ("Spin qubits") starts with the transistor and shows how electrodes on a chip isolate single electrons in quantum dots, how you detect them one at a time, and how this could scale up using ideas from the chip industry. The second ("Quantum dot qubits") shows ways to define a qubit in such dots: the electron's charge, which is fast but fragile, or its spin, which lives much longer, plus several other variants and how two-qubit gates work.

## Explain: From the transistor to a single electron in a dot
Video: y9dt5uTvsEM 0:00-2:03
The video recalls the first transistor in 1947 and the first integrated circuit in 1958. Quantum bits can use the same core technology: a transistor is a switch controlling electrons between two contacts with the voltage on one gate. With several gates side by side, you can pull electrons in or push them away and isolate small puddles of electrons. A quantum dot is a small space where electrons are held under one gate. The community now routinely goes to the extreme of a single electron under each electrode, and the spin of that electron is the qubit.

## Explain: Why single electrons can be counted, and Coulomb blockade
Video: y9dt5uTvsEM 2:03-5:19
Adding an electron to a tiny island costs charging energy because of the repulsion between electrons, and for a small enough island this energy exceeds the thermal energy. The video's example is an island of 100 nanometre radius, with a charging energy of about 3 meV, ten times the thermal energy at 4 kelvin. Electrons can then be added one at a time. When no energy level of the dot lines up with the source and drain, no current flows, which is Coulomb blockade. Tuning the gate voltage lines a level up in the window and current flows, so the current shows sharp peaks, each one an extra electron.

## Explain: Charge sensing and neighbouring dots
Video: y9dt5uTvsEM 5:19-7:31
A second way to detect a single electron is charge sensing. A dot's current depends sharply on its gate voltage, and a charge added to a neighbouring dot acts like a small change in that gate voltage through capacitive coupling, so the current changes in a measurable way. With two dots and a gate between them to control the coupling, plotting the gate voltages shows charge transitions as lines. Two effects appear when dots are close: crosstalk, where one gate also affects the other dot, tilting the lines, and shifts in the transitions when an electron is added next door.

## Explain: Scaling up: industry fabrication, crossbars and links
Video: y9dt5uTvsEM 7:31-10:31
To scale up, quantum dots must be as uniform as possible, which needs industrial clean rooms and not just university ones. The video says a collaboration with Intel began in 2015 to make quantum dot arrays with 300 mm technology. Because wiring every qubit in a two-dimensional array is hard, it proposes a crossbar scheme like in displays and memories, where a few horizontal and vertical wires address many dots, imagining roughly 1024 qubits in an array of about 30 by 30 micrometres. Beyond that, quantum links would join local arrays on a chip, with classical control electronics integrated alongside. These are plans and visions, and the presenter calls it a phenomenal challenge.

## Explain: Charge qubits and why they decohere quickly
Video: vQnA05VnGis 0:08-2:02
The simplest quantum dot qubit uses the electron's charge: in a double dot the electron can be left, right or a superposition, and the detuning energy between the two dots sets and controls the state. It is fast and all-electric. But a charge couples easily to other charges around it. Solids have traps and impurities where charges get stuck and fluctuate, which moves the electron and changes the energy, which shifts the qubit's phase. That is decoherence, and it happens quickly for charge qubits.

## Explain: Spin qubits, gates and lifetimes
Video: vQnA05VnGis 2:02-3:55
So the spin of the electron is used instead. In a magnetic field the spin-up and spin-down states split in energy (the Zeeman splitting) and form the qubit, and a microwave magnetic field in resonance with the splitting gives Rabi rotations for single-qubit gates. Coupling neighbouring dots gives an exchange interaction that allows two-qubit gates, and the video names the native gates SWAP, CROT and CPhase. The attraction of spin is long life: T1 can be well beyond a second and T2 up to tens of milliseconds.

## Explain: Other quantum-dot qubit types and the current state of the art
Video: vQnA05VnGis 3:55-5:42
A single electron in a single dot is the Loss-DiVincenzo qubit, named after its inventors. Others use several electrons or dots: singlet-triplet qubits, which may resist magnetic-field noise better and can be controlled all-electrically (two have been entangled), and more exotic hybrid and exchange-only qubits, which are fast and all-electric. The video says the state of the art is the Loss-DiVincenzo qubit, with four-qubit logic shown in a two-by-two array that uses holes in planar germanium.
