---
id: module_4
---

## Explain: Amplitudes add before you square
In everyday probability, if there are two ways to reach an outcome, you add their probabilities. Quantum mechanics adds the amplitudes first, and only then squares the result to get a probability. Amplitudes can be positive or negative, so they can cancel. That cancelling is destructive interference. When they have the same sign they reinforce each other, which is constructive interference.

This is the central trick of quantum computing: arrange the circuit so that the paths to wrong answers cancel and the paths to the right answer add up.

## Explain: The Mach-Zehnder interferometer
This is a setup with one photon, two beam splitters and two detectors. The first beam splitter puts the photon into a superposition of two paths. A phase shifter can change the relative phase of one path. The second beam splitter recombines the paths.

With equal paths, the contributions to one detector add and to the other cancel, so the photon always reaches the same detector, 100% of the time. Changing the phase by half a wavelength swaps which detector gets it. If you block one path, interference is destroyed: only the photons that took the other path get through, and those reach each detector with 50/50 odds. That is the surprise of the setup: removing one of the two routes makes the previously dark detector light up.

## Example: H then H gives back |0⟩
Start with |0⟩. After the first H, the amplitudes are 1/√2 for |0⟩ and 1/√2 for |1⟩. Apply H again. The amplitude for ending at |1⟩ has two routes: through |0⟩ with +1/√2 × 1/√2 = +1/2, and through |1⟩ with −1/2. They cancel to 0. For ending at |0⟩ the two routes give +1/2 and +1/2, adding to 1. So the second H returns the qubit to |0⟩ with certainty. Adding probabilities, 1/4 + 1/4 = 1/2, would wrongly predict a coin flip.

## FAQ: What is interference?
It is what happens when the amplitudes for different routes to the same outcome combine. Like water waves, they can reinforce or cancel. The size of the combined amplitude, squared, is the probability.

## FAQ: What is the difference between constructive and destructive interference?
Constructive means the amplitudes have the same sign and add up, making the outcome more likely. Destructive means opposite signs, so they cancel and make the outcome less likely, or impossible if they cancel exactly.

## FAQ: Why can't I just add the probabilities?
Because the probabilities hide the signs. Two routes with probability 1/4 each can give 1 or 0 for the outcome, depending on whether their amplitudes add or cancel. Only by adding amplitudes first can you get this right, and experiments confirm it.

## FAQ: Is the photon really in both paths at once?
"Both paths" is loose language. Its state is a superposition of the two path states, and the amplitudes for both routes take part in the result. If you put a detector in a path to see which way it went, you find it in only one, and the interference vanishes.

## FAQ: Is interference how quantum computers get speed-ups?
Yes. Algorithms such as Deutsch-Jozsa and Grover in Module 6 are designed so that wrong answers cancel and the right answer is boosted.

## Glossary: Key words
Interference: amplitudes combining like waves. Constructive: amplitudes add. Destructive: amplitudes cancel. Phase: the angle that decides whether amplitudes add or cancel. Beam splitter: a half-silvered mirror that puts a photon into a superposition of two paths. Interferometer: a device that recombines split paths.

## Misconception: Probabilities just add up
For quantum events with several routes, amplitudes add first and probabilities come from squaring the total. That is why a "guaranteed" path can go dark: the amplitudes cancel.

## FAQ: What does the Veritasium single-photon video show?
Video: GzbKb59my3U 0:00-6:00
It shows that interference survives even when only one photon is in the apparatus at a time. First it recalls how the double-slit experiment makes bright and dark bands with a laser. Then it turns the light down so low that photons arrive one by one, counts them with a very sensitive detector, and shows the interference pattern slowly appearing as the counts add up. The conclusion is that light is neither simply a wave nor simply a particle.

## Explain: How two slits make bright and dark bands
Video: GzbKb59my3U 0:00-1:45
The video recalls the history briefly: Huygens thought light was a wave, Newton thought it was a stream of tiny bullets, Young's double-slit experiment in 1801 made it look like a wave, and by 1900 it was clear that light energy comes in lumps called photons. With a laser shining through two slits you see bright and dark bands. The bright spot in the middle exists because light from both slits travels the same distance, so the waves arrive crest with crest. A dark spot appears where one path is half a wavelength longer, so a crest meets a trough and they cancel. Further out, a whole extra wavelength brings them back in step and gives another bright band.

## Explain: Single photons still build up the pattern
Video: GzbKb59my3U 1:45-3:30
The question the video asks is what happens when the light is so faint that only one photon is in the device at a time, so there is nothing else for it to interfere with. The presenter sets up a photomultiplier tube, which can detect single photons, and a counter, and plots where photons land. After one second the dots look random. But if you keep adding the results over time, the same bright and dark bands emerge, even though each photon was counted on its own.

## Explain: What the slowly appearing pattern says about light
Video: GzbKb59my3U 3:30-4:33
The presenter points out that you cannot make sense of this using everyday objects. A single photon cannot be a tiny ball that goes through one slit, because then there would be no pattern, and it is not an ordinary wave spread across both either, since it is detected at one point. His answer is that a photon is a quantum object that sometimes acts like a wave and sometimes like a lump, and is really something different from anything we meet every day. This is the idea the module builds on: a single photon's two possible paths each carry an amplitude, and the amplitudes add before you square them.

## Explain: Interference of waves, and an answer to a viewer question
Video: GzbKb59my3U 4:33-6:00
The last part recaps wave interference: where peaks meet peaks the amplitude grows (constructive interference), and where a peak meets a trough they cancel. The presenter then spends the closing minute answering a viewer question about a detail of the previous video's experiment, which used ordinary daylight instead of a laser: the blobs in that pattern were images of the light source, each slit spreading light out by diffraction and the overlapping spreads cancelling in places because they are out of phase. That is a side detail and is not needed for the single-photon idea.
