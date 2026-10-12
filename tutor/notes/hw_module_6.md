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

## FAQ: What do the two D-Wave videos in this module cover?
Video: zvfkXjzzYOo 0:00-5:58
Both are explainers from D-Wave, a company that builds quantum annealers, so they present annealing from the maker's viewpoint. The first says what annealing is for (optimisation and sampling problems) and how it differs from gate-model quantum computing. The second shows how a chip actually works: each qubit settles into one of two valleys of an energy landscape, biases tilt the valleys, couplers link qubits, and the user programs the machine by choosing the biases and couplings.

## Explain: What annealing is for: optimisation and sampling
Video: zvfkXjzzYOo 0:00-2:54
The video says quantum annealing uses quantum effects to help solve optimisation problems, finding the best configuration among very many, and the related task of sampling. Its example is spending a fixed budget on a house to get the most happiness out of the things you can afford. These can be written as energy-minimisation problems, and physics always tries to reach the lowest energy: things roll downhill and hot things cool. Sampling means collecting many low-energy states to describe the shape of the energy landscape, useful in machine learning for building a probabilistic model. Both kinds of problem are hard on classical computers, which is why alternatives are of interest.

## Explain: Annealing versus gate-model computing
Video: zvfkXjzzYOo 2:54-5:58
In annealing you set up the problem and let the quantum system evolve naturally, and the final configuration is the answer, with no control over the evolution in between. Gate-model machines aim to control and manipulate that evolution, which is much more ambitious and delicate, but lets them solve a bigger class of problems. The video says that is why annealers had been scaled past a thousand qubits while gate-model machines were around ten. That comparison is from the video's time and counts different things, so do not read it as one being ahead. Annealing is not a universal quantum computer, but adiabatic quantum computing, which is universal, is closely related to it.

## Explain: A single qubit as a valley that splits in two
Video: UV_RlCAc5Zs 0:00-2:07
In the annealing chip a qubit is a circulating current with an associated magnetic field, and can be in a superposition of the 0 and 1 states. At the start of the anneal the energy diagram has one valley whose bottom is the superposition. As the anneal runs, a barrier is raised and the diagram becomes a double well: the left valley bottom is 0 and the right one is 1. With nothing else, the qubit has an even chance of ending in either. Applying an external magnetic field, called a bias, tilts the double well and makes the lower valley more likely.

## Explain: Couplers, entanglement and how you program the machine
Video: UV_RlCAc5Zs 2:07-4:13
A coupler defines how two qubits influence each other. It can make them prefer the same value (both 0 or both 1) or opposite values. Coupled qubits are entangled and must be treated as a single object with four states, and what the coupler "wants" means that it lowers the energy of those states. The user chooses every bias and every coupler, including its sign and strength, and that set of numbers defines an energy landscape. Programming the machine means choosing that landscape, and the annealer then finds its lowest-energy point.

## Explain: Why the number of states explodes, and the whole sequence
Video: UV_RlCAc5Zs 4:13-5:56
Each added qubit doubles the number of states the landscape is defined over: 4 for two qubits, 8 for three, 2 to the n for n. The summary the video gives: start with qubits each in a superposition and not yet connected, introduce the biases and couplings during the anneal so the qubits become entangled as one large quantum object, which shifts the probability of each qubit ending as 0 or 1, and at the end each qubit is 0 or 1. The end result is the lowest-energy state of your problem, or one very close to it, and this takes around 20 microseconds on their chips, according to the video.
