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
