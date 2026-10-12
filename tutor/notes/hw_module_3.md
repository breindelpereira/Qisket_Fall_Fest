---
id: hw_module_3
---

## Explain: Atoms held by light
Neutral atoms have no electric charge, so they are not held by electric fields. A tightly focused laser beam attracts a single atom, and is called an optical tweezer. Many tweezers make an array, a grid of atoms with each one acting as a qubit. Two long-lived internal levels of each atom are used as |0⟩ and |1⟩.

## Explain: Rearranging the array
Tweezers can be moved. After the atoms are loaded, which fills the array only partly at random, tweezers shuffle atoms into the pattern wanted and fill the gaps. The same trick can bring chosen atoms close together for a gate. That gives a flexible connectivity that a fixed chip does not have.

## Explain: Rydberg states and the blockade
A Rydberg atom is an atom with one electron lifted into a very large orbit. Such an atom is huge and strongly affects its neighbours. If two atoms are closer than a certain distance, only one of them can be excited into the Rydberg state at a time: an excited atom blocks its neighbour from being excited. This is the Rydberg blockade.

## Explain: From blockade to a gate
The blockade makes the state of one atom decide what the laser does to the other, which is a conditional operation. A conditional operation is the basis of an entangling gate such as a controlled-phase gate. If the atoms are too far apart the blockade does not work, so the distance between atoms matters.

## Explain: Trade-offs
Neutral-atom arrays can hold hundreds to thousands of qubits in a small space, which is a major strength. The challenges are controlling every atom accurately at that scale, keeping lasers uniform across the array, losing atoms from the traps during a run, and doing gates and readout quickly enough.

## FAQ: What are optical tweezers?
Tightly focused laser beams that hold tiny objects, here single atoms, in place with light. Their inventor shared the 2018 Nobel Prize in Physics.

## FAQ: What is a Rydberg state?
An atomic state in which an electron is in a very distant, large orbit. These atoms are very sensitive to each other, which is useful for making them interact.

## FAQ: What does the blockade do?
It stops two nearby atoms from being excited together. That conditional behaviour is what makes an entangling gate possible with neutral atoms.

## Misconception: The blockade is a property of one qubit
It is an interaction between two atoms, and it depends on how close they are. One atom on its own has no blockade.

## Glossary: Key words
Neutral atom: an atom with no net electric charge. Optical tweezer: a focused laser that traps one atom. Array: a grid of trapped atoms. Rydberg state: a highly excited atom with a huge orbit. Blockade: one excited atom preventing a neighbour from being excited. Entangling gate: an operation that links two qubits.

## FAQ: What do the two videos in the neutral-atoms module explain?
Video: JmnZVhQc-H8 0:00-3:16
A short QuEra clip walks through how a neutral-atom computer works: trapped, laser-cooled atoms are arranged by "optical tweezers", gates are laser pulses and a camera reads the result. Then a physics explainer (Atoms and Sporks) explains the idea behind optical tweezers, the technology that won part of the 2018 Nobel Prize in Physics, in terms of the push light gives to what it passes through.

## Explain: The QuEra clip: trapping atoms and arranging them
Video: JmnZVhQc-H8 0:00-1:46
The qubits are individual neutral atoms, with 0 and 1 stored as different energy levels of the atom. First, a cloud of ultra-cold atoms is made in a vacuum chamber, which isolates them from disturbances, and the atoms are trapped and cooled with lasers to microkelvin temperatures. Then a spatial light modulator creates optical tweezers that hold the atoms in a structured array, and an acousto-optic deflector can move the tweezers so individual atoms can be repositioned for an algorithm.

## Explain: The QuEra clip: gates, readout and claimed advantages
Video: JmnZVhQc-H8 1:46-3:16
Laser pulses change the atoms' energy states and make them interact, which creates entanglement, and quantum gates are carefully controlled laser pulses. At the end a sensitive camera records the light the atoms give off to reveal their states. The company lists scalability (tweezers can position large arrays), connectivity (any atom can be moved next to any other) and room-temperature operation as advantages. Remember it is the vendor's own summary. The atoms are cooled by lasers to microkelvin, so the "room temperature" refers to the surrounding equipment not needing a cryogenic fridge, and the clip admits the technology is still in development.

## Explain: What optical tweezers are, and how the video builds up the idea
Video: UAmdoOX3870 0:00-4:13
The Nobel Prize in Physics 2018 was split between pulse-generation methods and, for the second half, optical tweezers, which the presenter likens to tractor beams made of light for tiny objects such as DNA molecules and proteins. The explanation rests on one fact: light carries momentum. To get there, the video first uses a ball bouncing off a box. A perfect bounce reverses the ball's direction, so its momentum changes sign and the box must receive twice the ball's original momentum. The take-home is that anything bouncing back from something is pushing it.

## Explain: Light pushes mirrors and lenses, and a bright centre holds them in place
Video: UAmdoOX3870 4:13-7:22
Light reflecting off a mirror changes direction, so it pushes the mirror. Light bending through a lens pushes the lens in the opposite direction to the bend. If a lens is lit evenly the sideways pushes cancel, but if the beam is brightest in the middle and weaker at the edges, a lens that drifts off-centre is lit unevenly and gets pushed back to the centre, so it is held in the beam. Focusing the beam so its brightness also varies front to back holds a small glass sphere in all directions. That is the principle of optical tweezers.

## Explain: What tweezers are used for and what the video leaves open
Video: UAmdoOX3870 7:22-8:41
Because a molecule or a cell or a bacterium's tail can be chemically attached to a tiny bead, you can move the bead with light and thereby move that object, which earned the Nobel Prize. The presenter admits a simplification: he glossed over how light can have momentum despite having no mass, and over why we do not feel its push in everyday life, and promises to cover them in a later video. In a neutral-atom computer, a related light force holds single atoms in place, as the QuEra clip shows.
