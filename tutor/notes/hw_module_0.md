---
id: hw_module_0
---

## Explain: The coherence budget
A quantum program is a race against forgetting. A qubit slowly loses its information because of its surroundings, and the program has to finish its operations before that happens. The number of operations that fit is roughly the coherence time divided by the time one operation takes.

For example, a phase coherence time (T2) of 100 microseconds with gates of 50 nanoseconds gives 100,000 ns divided by 50 ns, which is about 2,000 operations. That is the most you could hope for, and the real number is lower, because every gate also adds a little error.

## Explain: T1 and T2
T1 is the energy relaxation time: how long a qubit stays in |1⟩ before it falls to |0⟩. T2 is the dephasing time: how long the phase of a superposition stays stable. A qubit in superposition can lose its phase information without losing any energy, so T2 is usually the shorter one, and it can never be longer than twice T1.

Because most algorithms depend on phase and interference, T2 is the number that usually limits how long a program can run.

## Explain: Gate speed and fidelity
Gate speed is how long one operation takes. Fidelity measures how close the operation came to the ideal one. A fidelity of 99.9% means roughly one gate in a thousand goes wrong. Both matter: a very fast but sloppy gate is no use, and a very accurate but slow gate wastes the coherence time.

## Example: Two budgets
Suppose a qubit has a coherence budget of 2,000 gates, but each gate has an error of 1 in 1,000. After 1,000 gates a mistake is quite likely, so the error limit (about 1,000) bites before the time limit (2,000). The usable depth is whichever limit comes first. The Qubit Metrics Lab lets you move the numbers and see which limit wins.

## FAQ: What is the difference between T1 and T2?
T1 is about energy: when the qubit falls from |1⟩ to |0⟩. T2 is about phase: when the superposition stops being reliable. T2 is typically shorter, since phase can fade without any energy loss.

## FAQ: Is a machine with more qubits always better?
No. Qubit count is only one number. A smaller machine with long coherence times, fast accurate gates and good connectivity can run deeper programs than a larger noisy one. What matters is how many accurate operations you can do.

## FAQ: What does 99.9% fidelity mean in practice?
About one operation in a thousand is wrong. That sounds small, but a program with thousands of gates will probably contain several errors, which is why error correction is needed for long programs.

## Misconception: Longer coherence is all that matters
A long coherence time is useless if the gates are slow or inaccurate, since the budget is the coherence time divided by the gate time, and errors add up. Good qubits need long coherence, fast gates and high fidelity together.

## Glossary: Key words
T1: how long a qubit keeps its energy. T2: how long it keeps its phase. Coherence time: how long quantum information lasts. Gate time: how long one operation takes. Fidelity: how close an operation is to the ideal one. Depth budget: roughly how many gates fit before errors or forgetting take over. Connectivity: which qubits can interact directly.

## FAQ: What do the two videos in this module explain?
Video: RRvzE_430DY 0:00-5:55
The first, from QuTech Academy, shows how a qubit's lifetime is actually measured. A microwave pulse makes the qubit swing between 0 and 1 (Rabi oscillations), the swings die away because of noise, and two standard experiments (the Hahn echo and the Ramsey experiment) pull out the numbers T2 and T2*. The second, a short QuEra clip, defines gate fidelity: how often a gate does exactly what it should, and why error correction needs it to be above roughly 99%.

## Explain: Rabi oscillations, pi pulses and detuning
Video: RRvzE_430DY 0:00-1:33
To run a gate on a real qubit you shine electromagnetic radiation on it. If its frequency matches the energy gap between 0 and 1, the qubit oscillates between the two states: these are Rabi oscillations. On the Bloch sphere they are rotations about the X or Y axis. Flipping the qubit from 0 to 1 (an X gate) means applying a pulse of exactly half a Rabi cycle, called a pi pulse. If the frequency does not match exactly, the difference is called detuning. The video says some detuning is always present, which keeps the oscillations from reaching the poles fully.

## Explain: Why Rabi oscillations fade and what T1 and T2 mean
Video: RRvzE_430DY 1:33-3:10
The video explains the fading with an uncertainty-principle argument: a state that lives only briefly has a poorly defined energy, so there is always some random detuning, and the oscillations decay. The time for the decay to reach 1/e of its size is a measure of the qubit's lifetime. Two kinds of process limit it. Longitudinal relaxation, with timescale T1, is the qubit losing energy and falling back to its ground state. Transverse decoherence, with timescale T2, is the loss of phase information. What you observe is the combination of T2 and a slowly varying static contribution from the environment, called T2 prime, which together give the aggregate T2 star: 1 over T2 star equals 1 over T2 plus 1 over T2 prime.

## Explain: The Hahn echo measures T2
Video: RRvzE_430DY 3:10-4:35
Because the static part (T2 prime) does not change in time, its effect can be undone. The Hahn echo starts with a pi/2 pulse that tips the spin into the x-y plane. During a wait time t the spin dephases, mainly due to the static effect. A pi pulse then flips the spin over, so the same dephasing continues in the direction that refocuses it. After another wait of exactly t, the static effect has cancelled and a measurement shows only T2. Repeating with longer waits, the signal decays exponentially with decay constant T2.

## Explain: The Ramsey experiment measures T2 star
Video: RRvzE_430DY 4:35-5:55
For the aggregate effect, the Ramsey experiment uses two pi/2 pulses with a wait in between, and then a measurement. The spin precesses around the x-y plane during the wait. With a wait close to zero the spin ends in state 1, and with a wait of half a precession period it ends in state 0, so the measurement oscillates as a function of wait time. The oscillations decay because of both T2 and T2 prime, and the time at which the decay reaches 1/e is T2 star.

## Explain: What gate fidelity means, in the QuEra clip
Video: ehDUE0SdcTE 0:00-1:06
Gate fidelity measures how closely a real gate matches the ideal one. If a CNOT does the right thing 99 times out of 100, its fidelity is 99%. Noise and imperfect hardware make perfect fidelity practically impossible, and imperfect gates limit how long and complex a computation can be. The video says single- and two-qubit gates need fidelities above about 99% for error correction to work. Error correction then groups several physical qubits into a logical qubit, which stores the information redundantly and keeps checking it.

## Explain: Trade-offs of high fidelity, and the vendor's point of view
Video: ehDUE0SdcTE 1:06-2:28
High fidelity and error correction come with costs: more physical qubits, a harder design to scale, and in some implementations extra delay. The clip, made by a company that builds neutral-atom computers, adds that atoms may have an advantage because they can be packed densely and shuttled around inside the machine, so groups of physical qubits that form a logical qubit can move together. Treat that part as the company's claim about its own approach, not a neutral comparison.
