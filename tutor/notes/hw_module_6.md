---
id: hw_module_6
---

## Explain: Solving by settling
A ball on a hilly landscape rolls into a valley and stops. If a problem can be described as a landscape in which the best answer is the lowest valley, a physical system that settles into its lowest state solves the problem. Quantum annealing is a machine built to do exactly that, and the physical system is a set of quantum bits.

## Explain: The Ising picture
The problem is written as an Ising model: a set of spins, each of which prefers to point up or down, with couplings that reward or penalise pairs of spins for agreeing. The total energy depends on the arrangement of the spins. The arrangement with the lowest energy is the best answer to the problem.

## Explain: What the quantum part does
The machine starts with a strong quantum field that puts every spin in an equal superposition. During the anneal that field is slowly turned down while the problem's couplings are turned up. If this is slow enough, the system stays in its lowest state and ends in the best arrangement. Quantum tunnelling can let the system pass through a barrier instead of climbing over it.

## Explain: A different kind of machine
An annealer is not a universal gate-model computer. It does not run circuits, and it cannot run algorithms such as Shor's or Grover's. It is specialised for optimisation and sampling problems that can be written in the Ising form.

## Explain: Honest status
Annealers are real machines with thousands of qubits, and people use them. Whether they give a speed-up over the best classical methods on practical problems is an open question that is still debated. If the schedule is too fast, or noise disturbs the system, it can settle in a valley that is not the lowest one, so runs are repeated and the best result kept.

## FAQ: What is quantum annealing?
A way of solving optimisation problems by letting a quantum system settle into its lowest-energy state, which encodes the answer.

## FAQ: Is an annealer a quantum computer?
It uses quantum effects, but it is a different kind of machine from a gate-model quantum computer. It is not universal and cannot run general quantum algorithms.

## FAQ: Do quantum annealers beat normal computers?
It is debated. There are specific cases where they have been shown to do something fast, but whether they beat the best classical algorithms on real, useful problems is not settled.

## Misconception: An annealer is a faster general-purpose quantum computer
It is built for one kind of task. For anything outside optimisation problems in the Ising form, it is not the right tool.

## Glossary: Key words
Annealing: slowly changing a system so it settles into a low-energy state. Ising model: spins with couplings, used to describe optimisation problems. Energy landscape: the energy for every arrangement. Tunnelling: passing through an energy barrier instead of over it. Gate model: the usual circuit-based kind of quantum computer.
