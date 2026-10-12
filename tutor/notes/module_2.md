---
id: module_2
---

## Explain: The Born rule and collapse
When you measure a qubit you get 0 or 1, never a blend. The Born rule says the probability of each outcome is the squared size of its amplitude. For a state with amplitudes 0.6 for |0⟩ and 0.8 for |1⟩, the probabilities are 0.6² = 0.36 for 0 and 0.8² = 0.64 for 1. They add up to 1, as they must.

After the measurement, the qubit is in the state that matches the result. If you got 1, the qubit is now |1⟩, and measuring again gives 1 every time. This sudden change is called collapse. The maths of the Born rule is not disputed; what "really" happens during collapse is an interpretation question that physicists still discuss.

## Explain: Shots and histograms
A single measurement is random, so one run tells you almost nothing about the amplitudes. Quantum computers therefore run the same circuit many times, often thousands. Each run is called a shot. Counting the results gives a histogram: a bar chart of how often each outcome appeared.

With more shots, the bars get closer to the true probabilities. The typical error shrinks like 1 divided by the square root of the number of shots, so 100 times more shots gives about 10 times less noise. With a true 50/50 state, 10 shots might give 3 zeros and 7 ones, while 10,000 shots will give something very close to 5,000 each.

## Explain: Measurement bases
You can ask a qubit different questions. The usual question, the Z basis, asks "is it |0⟩ or |1⟩?" (North Pole or South Pole). Another question, the X basis, asks "is it |+⟩ or |−⟩?" (two points on the equator).

A state can be certain in one basis and random in another. The state |+⟩ gives a 50/50 random result in the Z basis, but gives "+" every time in the X basis. In practice you measure in the X basis by applying a Hadamard gate first and then measuring as usual.

## Example: Ten shots versus a thousand
Take a qubit in |+⟩. Ten shots might show 0 four times and 1 six times. That does not mean the probability is 40/60; ten shots is too few to say. Run 1,000 shots and you might see 497 zeros and 503 ones, which points clearly to 50/50. Seeing a tiny gap from exactly 50/50 is normal statistical noise, not a sign of a broken qubit.

## FAQ: Why is the measurement result random?
According to quantum mechanics, the randomness is built in. When the amplitudes are both non-zero, the outcome is not decided beforehand; the Born rule only gives the probabilities. Experiments such as the Bell tests in Module 5A rule out simple "hidden answer" explanations.

## FAQ: What is wavefunction collapse?
It is the name for the sudden change when you measure: a superposition turns into one definite outcome. After it, the state matches what you measured. The rule for the probabilities (the Born rule) is well tested. What collapse means physically is debated, with several interpretations that make the same predictions.

## FAQ: What is Schrödinger's cat?
It is a thought experiment from 1935 by the physicist Erwin Schrödinger. A cat sits in a sealed box with a device that releases poison if a single atom decays. If the atom is described as a superposition of "decayed" and "not decayed", the rules of quantum mechanics seem to say the cat is in a superposition of dead and alive until someone opens the box. Schrödinger offered it to show how strange it is to apply the rules of tiny things to an everyday object, not as an experiment anyone could run.

## FAQ: Is Schrödinger's cat really both alive and dead?
No experiment has ever put a cat, or anything that large, in a clean superposition. A real cat, the air around it and the light in the box interact with each other all the time, which spreads any superposition out into the surroundings (this is called decoherence), so a big object always looks as if it is in one state. What happens at the moment of measurement is still discussed as an interpretation question. The useful, testable part is the one-qubit version: a qubit in a superposition gives 0 or 1 with the chances the Born rule predicts, and a second look at the same qubit gives the same answer.

## FAQ: Does measurement need a conscious observer?
No. In physics, a measurement is any interaction that records the outcome in a way that cannot be undone, such as a detector clicking. No person has to look.

## FAQ: Why do quantum computers run a circuit thousands of times?
Each run gives only one random 0 or 1 for each measured qubit. To see the probabilities, which carry the information, you repeat the run many times and count. These repeats are the shots, and the histogram is built from them.

## FAQ: Can I measure a qubit without disturbing it?
Measuring a qubit in superposition changes its state to the result you got, so in general no. You can learn about an unknown state only by preparing it many times and measuring many copies, never by reading one copy fully.

## Glossary: Key words
Measurement: reading out a qubit, giving 0 or 1. Born rule: probability equals the amplitude's size squared. Collapse: the state becoming the measured outcome. Shot: one run of a circuit. Histogram: counts of how often each result appeared. Basis: the question a measurement asks, such as Z or X.

## Misconception: The value was already 0 or 1 before you looked
It is tempting to think the qubit secretly held a value and measurement just reveals it. For a state like |+⟩ there is no pre-set answer to reveal; the 50/50 result is created when you measure. The measurement forces the qubit to choose. (A qubit in |0⟩ is different: measuring it in the Z basis always gives 0.)

## FAQ: What does the 3Blue1Brown video in this module cover?
Video: RQWpF2Gb-gU 0:00-15:52
This is the first part of 3Blue1Brown's "But what is quantum computing?". It starts by arguing that the popular "a quantum computer tries every answer at once" summary is misleading, using a search quiz as the test. Then it builds quantum computing as maths rather than analogy: a computer's output is random, the machine's state is a vector, and squaring the vector's entries gives the probabilities. It finishes with the single qubit as an arrow of length 1 and the notation for its two basic states.

## Explain: The quiz that exposes a common misconception
Video: RQWpF2Gb-gU 0:00-2:33
The video begins with the usual pop-science line that a quantum computer holds every possible bit pattern at once and processes them in parallel. To test it, the presenter sets a puzzle. A secret number lies somewhere among the numbers from 0 to n-1, and a mystery function says "true" only for that number. You may only try values. A classical computer can do nothing better than guess and check, which takes about n/2 tries on average, written O(n) because the runtime grows in proportion to n. The question is then: what is the best a quantum computer can do?

## Explain: The answer: a square-root speed-up, not magic
Video: RQWpF2Gb-gU 2:33-5:30
Most people, including audiences of thousands, pick the constant-time answer, which is wrong and comes from the "everything in parallel" picture. The next most popular answer, a logarithmic runtime, is also wrong: exponential speed-ups exist only for special problems. The true best runtime is about the square root of n. That limit was proven in 1994, and a procedure that reaches it was found two years later. So searching a million options takes about a thousand steps, and a trillion options about a million. It is a real but modest gain that applies to a huge class of problems, any problem where a proposed answer is easy to check.

## Explain: A computer's readout is random, and the program sets the odds
Video: RQWpF2Gb-gU 5:30-9:12
The video builds the idea in layers. The bottom layer is the physics, the middle layer is the maths, and the top layer is the numbers you read out. In a classical machine, what is stored and what you read are the same string of bits. In a quantum machine they differ. What you read out is random: a program does not fix one output, it fixes a probability distribution over all possible outputs. With k qubits you read k bits, so there are 2^k possible outputs. You never see the whole distribution or all the strings at once. You see one string drawn at random.

## Explain: The state vector and the squaring rule
Video: RQWpF2Gb-gU 9:12-11:24
After you read the result, the computer's state changes so that all the probability sits on what you saw, so reading again gives the same value. The state is described by a vector, a long list of numbers with one entry for each possible output (16 entries for a 4-bit readout). The key rule: take the size of an entry and square it, and you get the probability of that output. For example, an entry of 0.5 gives 0.25, a 25% chance. The presenter admits this takes getting used to and promises to come back to a detail he is leaving out for now.

## Explain: Negative entries and the unit circle
Video: RQWpF2Gb-gU 11:24-13:14
Entries may be negative. Flipping a sign does not change the square, so the probabilities stay the same, but the video insists it is a different state, and says that sign flips play a central role later. To picture the smallest case, take two possible outputs, 0 and 1. The state vector then has two entries and can be drawn as an arrow in a plane: the horizontal part gives the chance of 0 and the vertical part gives the chance of 1. Because the chances add to 1, the arrow always has length 1, so it lives on a circle of radius 1.

## Explain: What a qubit is, and kets
Video: RQWpF2Gb-gU 13:14-15:52
This two-entry example is the qubit: a unit vector in a two-dimensional space, with one axis for each readout value. Measuring gives 0 or 1 and the arrow then jumps onto that axis, so repeating the measurement gives the same result unless something prepares the qubit again. The presenter says the rules look odd, and they are the postulates of quantum mechanics: spins and photon polarisations behave like this, and the squaring rule is called the Born rule. A qubit is an abstraction over such systems in the way a bit is over many physical switches. The video also introduces ket notation: the vectors for the two readouts are written with a 0 or a 1 inside, and a general qubit is written as a weighted sum of those two.
