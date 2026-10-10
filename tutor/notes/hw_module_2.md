---
id: hw_module_2
---

## Explain: Using atoms that nature made
Trapped-ion computers use real atoms as qubits. An ion is an atom with an electric charge, so electric fields can hold it still in a vacuum. Two of its internal energy levels are used as |0⟩ and |1⟩. All ions of the same element are identical, so each qubit starts out nearly perfect, which is a big advantage of this approach.

## Explain: How ions are controlled
Precisely tuned lasers do the work. A laser pulse can rotate a single ion's state, which is a single-qubit gate, and another laser reads the qubit out by making the ion glow or stay dark depending on its state.

## Explain: How two ions interact
Ions in a chain repel each other, so the chain behaves like beads on springs and the ions share vibrations. A laser pulse can use that shared motion to link the states of two chosen ions. That is the entangling gate. Because the motion is shared by the whole chain, in principle any ion can be linked to any other.

## Explain: All-to-all connectivity
Connectivity says which pairs of qubits can interact directly. On a chip where only neighbours interact, a gate between distant qubits needs a chain of extra SWAP operations, and each one adds error. In a chain of ions any pair can be addressed directly, so fewer operations are needed. This holds inside one chain or trap.

## Explain: Trade-offs
Trapped ions typically have very long coherence times and very accurate gates, but the gates are slow, typically microseconds to hundreds of microseconds, much slower than superconducting gates. A single chain also becomes harder to control as it gets longer, so larger machines move ions between zones or link several traps, for example with photons.

## FAQ: Why are ion gates slower than superconducting ones?
The operations use lasers acting on the ion's motion and internal state, which takes longer than a microwave pulse on a circuit. The long coherence time makes up for much of the difference.

## FAQ: What does all-to-all connectivity mean?
Any qubit can interact with any other qubit in the same trap directly, without moving the information through the qubits in between.

## FAQ: Is there a limit to how many ions can be in a chain?
There is a practical limit. Longer chains have more modes of vibration, which are harder to control, and the ions are harder to address individually. Larger machines are expected to use several smaller chains with ways to move or link ions.

## Misconception: All-to-all connectivity means unlimited size
It holds within one chain. Going beyond one chain needs shuttling ions between zones or linking separate traps, and those steps are slower and less accurate.

## Glossary: Key words
Ion: an atom with an electric charge. Trap: the electric fields that hold ions in place. Chain: a row of ions in one trap. All-to-all connectivity: any pair of qubits can interact. Shuttling: moving ions between places. SWAP: an operation that exchanges two qubits' states.
