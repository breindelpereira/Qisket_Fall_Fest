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
