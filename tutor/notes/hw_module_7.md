---
id: hw_module_7
tag: Experimental/Contested
---

## Explain: Making qubits harder to disturb
The ideas in this module share one goal: reduce the amount of error correction that a machine needs, by making the physical qubits more robust or by linking smaller machines together. They are research directions with a possible payoff. They are not products, and each one is still being proven.

## Explain: Topological qubits
A topological qubit would store information in collective, global properties of an exotic material, so that a small local disturbance cannot change it. In theory this would give a qubit with very low errors built in. Microsoft is pursuing this approach, using quasi-particles called Majorana modes. Early experimental claims have been debated by physicists, and it remains unproven that a working topological qubit has been made.

## Explain: Cat qubits
A cat qubit encodes information in states of a microwave resonator, in a way that makes one kind of error, the bit flip, exponentially rare. The name comes from Schrödinger's cat, since the states are superpositions of two distinct large-amplitude states. With one error type suppressed, a smaller error-correcting code may be enough. AWS and the company Alice & Bob explore this approach.

## Explain: Networked machines
Instead of one giant chip, link several smaller quantum processors with photons, so that entanglement can be shared between them. This could allow machines to grow by adding modules and could connect quantum computers far apart. It needs efficient ways to turn a qubit's state into a photon and back, and to create entanglement between distant nodes.

## FAQ: Why are these called experimental or contested?
Because none of them has been shown to work at the scale needed for a useful computer, and for some of them, such as topological qubits, even the early evidence is debated by experts.

## FAQ: Will one of these replace the current approaches?
Nobody knows. They may complement them or may not work out. A fair way to read the field is to follow what has actually been measured and repeated by independent groups.

## FAQ: How should I read news about quantum breakthroughs?
Look at what was measured, whether it was repeated by others, whether it concerns one qubit or a whole machine, and what the authors say is still missing. One promising result is the start of a long path, not the end of it.

## Misconception: A promising idea is a working computer
Each of these approaches is promising on paper. Turning an idea into a machine that works at scale takes years of engineering and may not succeed.

## Glossary: Key words
Topological qubit: a qubit stored in global properties of a material. Majorana mode: an exotic quasi-particle proposed for topological qubits. Cat qubit: a qubit encoded in a resonator that suppresses bit-flips. Bosonic: using states of a harmonic oscillator such as a resonator. Modular: made of linked smaller machines. Experimental/Contested: the honesty tag for ideas not yet proven.

## FAQ: What do the three frontier videos in this module cover?
Video: _otDRv7IN28 0:00-6:28
They cover three ideas that are still at the research stage. A QuTech lecture explains Majorana states, the building block of topological qubits, and why superconductors are the place to look for them. An Alice & Bob video explains cat qubits and an error-correcting code built for them that the company says needs far fewer qubits. A short QuTech video shows the first small network of three connected quantum nodes, a step towards a quantum internet. The module is tagged Experimental/Contested, so treat the claims as targets and company statements.

## Explain: What a Majorana fermion is
Video: _otDRv7IN28 0:09-2:29
In high-energy physics, every particle has an antiparticle (electron and positron, proton and antiproton), and those are called Dirac fermions. A Majorana fermion is a particle that is its own antiparticle. The idea comes from Ettore Majorana, and the video says no elementary Majorana particle has been found in nature, though neutrinos are candidates in some extensions. In condensed matter physics the aim is different: to realise a Majorana-like quasi-particle. What shows up there is more properly called a Majorana bound state, "Majoranas" for short, and not quite the particle high-energy physicists search for.

## Explain: Two Majoranas make one ordinary fermion state
Video: _otDRv7IN28 2:29-4:00
In a solid, a state can be filled (an electron) or empty (a hole), the counterparts of particle and antiparticle. The video shows that an equal superposition of the creation and annihilation operators gives two operators that each equal their own conjugate, which makes them Majorana operators. It stresses this is a change of mathematical basis: one ordinary fermionic state can always be described by two Majorana operators. It becomes interesting only when the two can be separated in space and told apart. Majoranas in a solid always come in pairs.

## Explain: Why a pair of Majoranas could make a protected qubit
Video: _otDRv7IN28 4:00-5:07
A fermionic state, empty or filled, can be a qubit's 0 or 1, like a charge qubit, but charge qubits are very sensitive to local disturbances. If the two Majoranas that make up one fermion are far apart, the information is stored non-locally, so no local disturbance can reach it. The video calls that a topological qubit: two Majorana bound states form one qubit, which it says is protected against almost all kinds of perturbation and should stay coherent for a very long time. That is the reason people look for them, and it is still an expectation, not a demonstrated qubit.

## Explain: Why superconductors are the place to look
Video: _otDRv7IN28 5:07-6:28
A Majorana state would need a superposition of an electron and a hole, but they have opposite charge, which normally forbids a superposition. In a superconductor, there is a sea of Cooper pairs, which are pairs of electrons. A hole together with a Cooper pair taken out of that sea looks just like a single electron, so the line between electron and hole is blurred. That makes superconductors the natural place to look for these states.

## Explain: Why error correction is costly and what cat qubits change (Alice & Bob)
Video: nI0Yg-QRAns 0:11-1:41
Alice & Bob's video says error correction is the biggest resource problem: about a thousand qubits to make one error-free logical qubit, like using a whole orchestra to play one flawless note, and, for the first useful applications, hundreds of logical qubits would be needed. Its company's answer is the cat qubit, which is protected by design against one of the two kinds of noise, leaving only one kind to correct. It claims that for demanding algorithms such as factoring this could cut the number of qubits needed by up to 60 times compared with standard qubits. These are the company's claims.

## Explain: LDPC codes, folding a line and the claimed saving
Video: nI0Yg-QRAns 1:41-4:49
Low-density parity-check codes are an older type of error-correcting code used in Wi-Fi and 5G, and theory suggests a quantum version could need about 15 times less hardware. The catch is the long-range connections between qubits, and nobody had a convincing way to run logic gates on such codes. Cat qubits sit in a line, so the video's idea is to fold the line, bringing distant qubits next to each other so the extra connections are easy. After searching through billions of designs, the team says it found a simple pattern that runs error correction with five times fewer qubits, and the company argues this makes useful machines nearer. Both numbers are company statements from the video.

## Explain: The first multi-node quantum network
Video: DRGT5ZgGrEc 0:05-2:42
QuTech is working on a quantum internet: a network that connects quantum devices over long distances using qubits. Two connected devices do not make a network, so they linked three nodes called Alice, Bob and Charlie. Bob has two qubits: a communication qubit for creating entanglement and a memory qubit to hold it, so the communication qubit can be reused to entangle with Charlie. They then showed an entangled state across all three nodes, and teleported entanglement so that the outer two nodes, with no direct link, became entangled. The video calls it the world's first rudimentary quantum network.
