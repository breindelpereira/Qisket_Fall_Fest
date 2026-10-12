---
id: hw_module_4
---

## Explain: Qubits made of light
In a photonic computer the qubit is light. Photons barely interact with their surroundings, which is why they carry quantum information so well and travel far through fibres and chips. The machine is a network of beam splitters and phase shifters, the same ingredients as the Mach-Zehnder interferometer, built onto a chip as waveguides.

## Explain: Ways to encode a qubit
A common way is to use which of two paths a photon takes, the same two-path idea as in the interferometer labs. Other designs use polarisation, or the time at which a photon arrives. Some machines use squeezed states of light instead of single photons.

## Explain: Loss is the main enemy
A photon that is absorbed or scattered is gone, and with it the information. If every component lets a photon through with a probability smaller than one, the chance that a photon survives a whole circuit is those probabilities multiplied together. It falls exponentially as the circuit grows, so each component must lose very little light. This is why photonic machines work hard on low-loss components.

## Explain: Probabilistic gates
Photons do not easily interact with each other. Linear optics can make a two-photon gate that works only some of the time, and a detector then announces whether it worked. To get a reliable result, designs use many attempts, extra photons and clever routing so that failures can be discarded or repaired.

## Explain: Temperature
Light can travel through waveguides at room temperature, which is an advantage. The detectors that count single photons usually need to be very cold, as they are often superconducting. So photonic machines are not free of cooling, even though the light itself does not need it.

## FAQ: Why is photon loss such a problem?
Every lost photon is a lost qubit. And because the chances multiply across components, a small loss in each of many parts can make the whole circuit rarely work. The Loss Budget Lab shows the success chance falling exponentially.

## FAQ: Why are photonic gates probabilistic?
Photons do not interact with each other directly, so interactions have to be arranged with extra photons and measurements, and these succeed only with some probability.

## FAQ: Do photonic quantum computers work at room temperature?
The light and the chip can, but the single-photon detectors usually need cooling, so the full system generally does not.

## Misconception: Photonic means no cooling needed
Only part of the system runs at room temperature. The detectors typically need to be very cold.

## Glossary: Key words
Photon: a particle of light. Waveguide: a channel that guides light on a chip. Beam splitter: a component that splits a light path in two. Loss: photons absorbed or scattered. Probabilistic gate: a gate that works only some of the time. Detector: a device that registers single photons.

## FAQ: What do the two photonic-computer videos show?
Video: ustVvxJ8t-s 0:00-2:14
Both are short company explainers. Quantum Source describes a design where the entangled photons that form a huge computation are produced a few at a time and stitched together over time, so that only hundreds of qubits exist at any one instant even for a million-qubit calculation. Xanadu describes an actual chip that squeezes laser light into special quantum states, sends them through a programmable network of beam splitters and phase shifters, and counts the photons that come out.

## Explain: Quantum Source: spreading qubits over time
Video: ustVvxJ8t-s 0:00-1:35
The video starts from the point that a useful universal quantum computer would need millions of entangled qubits plus error correction, and that having so many at the same moment is not feasible. Using photons as qubits lets the machine spread them over the timeline of the computation. Resource state generators repeatedly produce small clusters of entangled photons, stitching devices entangle those clusters into larger ones, and long fibres act as delay loops, a kind of quantum memory, so photons can wait and be entangled with clusters produced later.

## Explain: Quantum Source: measuring the cluster to compute
Video: ustVvxJ8t-s 1:35-2:14
The huge entangled cluster is fed slice by slice to an array of detectors, and a classical computer decides the exact sequence of measurements that carries out the chosen algorithm. The video compares it to weaving a fabric of quantum information, adding photonic clusters like threads. Its claim is that a million-qubit error-corrected calculation needs only hundreds of qubits at a time. This is the company's design vision, not something already built.

## Explain: Xanadu: squeezers, interferometer and detectors
Video: v7iAqcFCTQQ 0:04-1:08
The chips are made of silicon and silicon nitride and have three parts: squeezers as the input, an interferometer as the logic, and photon detectors as the output. Classical laser light goes to an array of tiny ring-shaped resonators that make squeezed states, a particular quantum state of light, which the video describes as the company's version of a qubit and as a superposition of different photon numbers. The states are carried by waveguides to the interferometer, a network of beam splitters and phase shifters. The user's instructions are turned into voltages on the chip's components.

## Explain: Xanadu: reading out photon counts and what it is for
Video: v7iAqcFCTQQ 1:08-2:22
Inside the interferometer the squeezed states interact and become entangled, and the interferometer acts like a sequence of quantum gates. Each output goes to a transition-edge sensor, a detector that counts how many photons are present, giving a list of integers. The result of the computation is in the statistics of these counts. The video says these chips suit graph-theory problems with uses in finance, chemistry and logistics, and are available on the company's cloud. That is the company's description of the usefulness, which is still being tested.
