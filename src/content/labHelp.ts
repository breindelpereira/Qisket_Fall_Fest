import type { GameHelp } from './gameHelp.ts';

/**
 * What the AI tutor knows about each lab, so it can answer a learner's doubts while they experiment (or just after).
 * It works exactly like `gameHelp.ts` (same shape, same rules, turned into passages with an `activityId`), with two
 * differences: a lab has no puzzle to solve, so there is no "I'm stuck" nudge, and the closing section is
 * "What should I notice in ...?", which says what the lab is there to show.
 *
 * The first section of every lab is "How do I use ...", the last is "What should I notice in ...".
 */
export const LAB_HELP: Record<string, GameHelp> = {
  single_qubit_lab: {
    tag: 'Accurate',
    sections: [
      {
        kind: 'explain',
        heading: 'How do I use the Single-Qubit Lab?',
        text: `The red arrow on the Bloch sphere is your qubit. Move it with the two sliders (latitude and longitude), the preset state buttons (|0>, |1>, |+>, |->, |+i>, |-i>) or the gates H, X, Z and S. The readout shows the chances of measuring 0 and 1. Sample 100 Shots measures the same state a hundred times. Try Guided Experiments walks you through superposition, phase and the bit flip, and the Match Target State Challenge asks you to steer the arrow onto a target. Show the math lists the exact amplitudes.`,
      },
      {
        kind: 'explain',
        heading: 'What do latitude and longitude mean?',
        text: `Latitude (theta) is the angle down from the north pole: 0 degrees is |0>, 90 degrees is the equator and 180 degrees is |1>. It sets the chances: the chance of 1 is sin squared of theta over two. Longitude (phi) is how far around the sphere you are, which is the relative phase between the two parts. It does not change the chances of 0 and 1 at all, but it changes what later gates do.`,
      },
      {
        kind: 'faq',
        heading: 'Why do |+> and |-> show the same percentages?',
        text: `Both sit on the equator, so a measurement gives 0 or 1 with 50% each. They differ only in phase, which is invisible to that measurement. A Hadamard gate turns the phase difference into a difference you can see: H takes |+> to |0> and |-> to |1>. That is why phase matters even though you cannot read it directly.`,
      },
      {
        kind: 'faq',
        heading: 'Why do 100 shots not give exactly the predicted split?',
        text: `The chances describe what happens over many runs. Each single measurement is random, so a hundred of them wobble around the prediction, like a hundred coin flips not giving exactly fifty heads. More shots settle closer to the prediction. The Shots + Histogram Lab shows this in detail.`,
      },
      {
        kind: 'faq',
        heading: 'What do the H, X, Z and S gates do to the arrow?',
        text: `Every gate rotates the sphere. X is a half-turn about the X axis, which swaps the poles. Z is a half-turn about the vertical axis, which swings the arrow to the opposite side of the equator and leaves the poles alone. S is a quarter-turn about the vertical axis. H tips a pole onto the equator and back, a half-turn about the axis between X and Z.`,
      },
      {
        kind: 'faq',
        heading: 'How do I match the target in the challenge?',
        text: `Look at the ghost target and ask whether it is higher or lower than the arrow (latitude), or in a different direction around the sphere (longitude). The preset buttons snap to the common states, and the gates move you in whole steps. You are done when the arrow is close enough to the target, not exactly on it.`,
      },
      {
        kind: 'explain',
        heading: 'What should I notice in the Single-Qubit Lab?',
        text: `Three things. A qubit's state is a point on a sphere, not just a 0 or a 1. The chances of 0 and 1 depend only on the height of the arrow, and the direction around the sphere (phase) is hidden until a gate turns it into a chance. And a measurement always gives a plain 0 or 1, never a blend. This lab is exact for one qubit and has no noise.`,
      },
    ],
  },

  shots_histogram_lab: {
    tag: 'Accurate',
    sections: [
      {
        kind: 'explain',
        heading: 'How do I use the Shots + Histogram Lab?',
        text: `Choose a state: one tilted qubit, a Bell pair, or three qubits that each had an H. For the tilted qubit, the slider sets its tilt. Choose how many shots per run (10, 100, 1,000 or 10,000) and tap Run: that many measurements are added to the histogram. The bars are what was measured, and the dashed marker on each bar is what the maths predicts. The clear button empties the tally.`,
      },
      {
        kind: 'faq',
        heading: 'Why is the histogram never exactly the prediction?',
        text: `Each shot is one random draw from the probabilities, so a finite number of shots wobbles around them. The typical size of the wobble is the square root of p times (1 minus p) divided by the number of shots, so ten times the shots shrinks it only about threefold. A real quantum computer returns one bitstring per run, so every result on hardware is a histogram like this.`,
      },
      {
        kind: 'faq',
        heading: 'How many shots do I need?',
        text: `It depends on how precisely you want to know a probability. To halve the wobble you need four times the shots. Pinning a 50/50 outcome down to about one percent takes thousands of shots. The banner under the chart tells you the typical wobble for the number of shots you have run so far.`,
      },
      {
        kind: 'faq',
        heading: 'Why does the Bell pair only show 00 and 11?',
        text: `The two qubits are entangled so that their answers always agree. The outcomes 01 and 10 have chance zero, and 00 and 11 each have 50%. Each qubit alone is a fair coin flip, but together they never disagree. Bitstrings read from the highest qubit on the left down to qubit 0 on the right.`,
      },
      {
        kind: 'faq',
        heading: 'Why does three qubits with H give eight outcomes of 12.5% each?',
        text: `Each H puts one qubit into an even superposition, and with three qubits there are eight possible bitstrings, all with the same amplitude. Each has a chance of one in eight, which is 12.5%. It is the same idea as flipping three fair coins and listing the eight possible results.`,
      },
      {
        kind: 'explain',
        heading: 'What should I notice in the Shots + Histogram Lab?',
        text: `A single measurement tells you almost nothing about a quantum state: you only see the odds by repeating it. As the shots grow, the bars settle onto the dashed predictions, slowly, because the wobble shrinks only with the square root of the shots. The lab samples the exact probabilities, so it is accurate but has no hardware noise.`,
      },
    ],
  },

  circuit_lab: {
    tag: 'Accurate',
    sections: [
      {
        kind: 'explain',
        heading: 'How do I use the Circuit Lab?',
        text: `Choose 1, 2 or 3 qubits; every wire starts at 0 and time runs left to right. Pick a gate (H, X, Y, Z, S, T) and tap a cell in the grid to place it. For a CNOT, pick CNOT, tap the control cell, then tap the target cell in the same column. Erase removes a gate and the bin clears the circuit. Run 1000 shots samples the circuit, and the famous circuits (such as a Bell pair) fill in the grid for you. The bars show the exact probability of each result, and Show the math lists the amplitudes.`,
      },
      {
        kind: 'faq',
        heading: 'How do I read the bitstrings in the Circuit Lab?',
        text: `Bitstrings read from the highest qubit on the left down to qubit 0 on the right, the same order as Qiskit. So with three qubits, 100 means q2 is 1 and q1 and q0 are 0. This is the opposite of the order the wires are drawn, which has q0 at the top.`,
      },
      {
        kind: 'faq',
        heading: 'Why do Z, S and T seem to do nothing in the Circuit Lab?',
        text: `They only change the phase of the 1 part, which does not change the chance of 0 or 1 by itself. Their effect shows up when a later gate, usually an H, turns the phase difference into a difference in probabilities. Put an H before and after a Z and watch the result change.`,
      },
      {
        kind: 'faq',
        heading: 'How does a CNOT create entanglement?',
        text: `A CNOT flips the target qubit only when the control is 1. If the control is in superposition, the target is flipped in one branch and not in the other, so the two qubits can no longer be described separately. An H on one qubit followed by a CNOT from that qubit to the other makes a Bell pair, whose results always agree.`,
      },
      {
        kind: 'faq',
        heading: 'Why does the measured result differ a little from the prediction?',
        text: `The bars show the exact probabilities, and the measured result is 1,000 random shots from them. A thousand shots wobble by a few percent around the exact value, which is normal. The exact bars are what an ideal quantum computer would do, and a real one adds noise on top.`,
      },
      {
        kind: 'explain',
        heading: 'What should I notice in the Circuit Lab?',
        text: `A circuit is a recipe: gates in order, then a measurement. Hadamards create superpositions and interference decides which results are likely, which is why a gate that seems to do nothing can still matter later. A CNOT is how qubits become entangled. This is an exact simulator for up to 3 qubits, so it shows what an ideal machine would do.`,
      },
    ],
  },

  mach_zehnder_lab: {
    tag: 'Accurate',
    sections: [
      {
        kind: 'explain',
        heading: 'How do I use the Mach-Zehnder Lab?',
        text: `One photon enters from the source, meets a beam splitter, takes two arms, and meets a second beam splitter before reaching the top or bottom detector. The phase slider (or the 0, 90, 180 and 270 degree buttons) turns the phase of the bottom arm. The arm blocker puts an obstacle in the top or bottom arm. Fire 1 or Fire 100 sends photons and the bars show where they landed, against the dashed prediction. The curve shows the odds at every phase, and the bonus bomb test uses a hidden object.`,
      },
      {
        kind: 'explain',
        heading: 'What does the phase do to the two detectors?',
        text: `With nothing blocked, the chance of the top detector is sin squared of phi over two and the bottom is cos squared of phi over two. At 0 degrees the paths cancel at the top and add at the bottom, so only the bottom clicks. At 180 degrees it flips. In between, the chance moves smoothly, with 50% each at 90 degrees. This pattern is interference.`,
      },
      {
        kind: 'faq',
        heading: 'Does the photon really split in two?',
        text: `No. A photon is always found whole, at one detector. What takes both arms is its probability amplitude, and the two routes add up like waves at the second beam splitter. Where they add the photon is likely to land, and where they cancel it never does. Fire many photons and the pattern appears even though each one lands in a single place.`,
      },
      {
        kind: 'faq',
        heading: 'Why does blocking an arm make the interference vanish?',
        text: `With one arm blocked there is only one route left to the second splitter, so there is nothing to interfere with. The photon is then sent 50/50 to each detector, with half of all photons absorbed by the blocker. That gives 25% at each detector, at every phase. Knowing which path the photon took removes the interference.`,
      },
      {
        kind: 'faq',
        heading: 'How does the bomb test work?',
        text: `The phase is fixed at 0 degrees, so with an empty arm the top detector never clicks. If an object sits in the bottom arm, the interference is destroyed and the top detector can click. A click at the top proves an object is there, and the photon was not absorbed. With an object present, 50% of the time the photon is absorbed (a bang), 25% the top detector clicks (found safely) and 25% the bright detector clicks (no information).`,
      },
      {
        kind: 'explain',
        heading: 'What should I notice in the Mach-Zehnder Lab?',
        text: `Probabilities are not the whole story: the two routes add as amplitudes, so they can cancel, which is what makes one detector go dark. Block a route, or learn which path the photon took, and the cancellation disappears. The model is idealised: perfect 50/50 splitters, no losses, one photon at a time.`,
      },
    ],
  },

  two_qubit_lab: {
    tag: 'Accurate',
    sections: [
      {
        kind: 'explain',
        heading: 'How do I use the Two-Qubit Lab?',
        text: `Alice and Bob each hold one qubit and both start at 0. Apply H, X, Z, S or T to either one, or a CNOT in either direction. Measure collapses a qubit and Reset to 00 starts again. The meter shows how entangled the pair is (concurrence, from 0 to 1). Each qubit's own panel shows whether it still has a state of its own. Measure the pair 20 times shows 20 results. The goal is a Bell pair: H on Alice, then CNOT with Alice as control.`,
      },
      {
        kind: 'faq',
        heading: 'What does the entanglement meter show?',
        text: `It is the concurrence of the pair's pure state: 0 when the two qubits each have their own state, and 1 for a maximally entangled pair such as a Bell pair. In between, the qubits are partly entangled. It is twice the size of (a00 times a11, minus a01 times a10), where each a is the amplitude of that result.`,
      },
      {
        kind: 'faq',
        heading: 'Why does each qubit alone show no state when the pair is entangled?',
        text: `In an entangled pair the information is in the relationship between the qubits, not in either one. Looked at on its own, each qubit is a perfectly random coin, which is a Bloch arrow of length zero. The pair as a whole does have a definite state. That is why the panels say no state for each qubit, while the pair's bars show a clear pattern.`,
      },
      {
        kind: 'faq',
        heading: 'Why do the two qubits always agree in a Bell pair?',
        text: `A Bell pair is an equal mix of 00 and 11 and nothing else. So whichever answer one qubit gives, the other gives the same, but which answer comes up is random. The 20 measurements show it: every pair reads 00 or 11, about half of each, and no pair ever disagrees.`,
      },
      {
        kind: 'faq',
        heading: 'Why does measuring one qubit change the meter?',
        text: `Measuring collapses the pair into one definite result, so afterwards each qubit has its own state again and the entanglement is gone. To explore again, press Reset to 00. This is why the meter drops to zero after a measurement.`,
      },
      {
        kind: 'explain',
        heading: 'What should I notice in the Two-Qubit Lab?',
        text: `Entanglement is a property of the pair: the pair can have a perfectly definite state while neither qubit has one. Correlated answers on their own are not strange, because two matching coins would do that, so the point is that no script prepared in advance can imitate the correlations (see the Bell and CHSH Explorer). The meter works for a pure two-qubit state only.`,
      },
    ],
  },

  bell_chsh_explorer: {
    tag: 'Accurate',
    sections: [
      {
        kind: 'explain',
        heading: 'How do I use the Bell and CHSH Explorer?',
        text: `Alice and Bob share an entangled pair, and each picks a measurement angle depending on a question. The four sliders set Alice's angle for question 0 and 1 and Bob's angle for question 0 and 1. The value S combines the four correlations. Use the best angles sets them to the strongest setting. Play 100 rounds or 1000 rounds plays the CHSH game with your angles, and the table shows each correlation.`,
      },
      {
        kind: 'explain',
        heading: 'What does the value S mean?',
        text: `S is the sum of three correlations minus one, each running from +1 (always agree) to -1 (always differ). Any shared pre-agreed script, a local hidden variable, can reach at most 2 in size. Quantum mechanics reaches up to 2 times the square root of 2, about 2.83. Seeing the size of S above 2 is the Bell violation.`,
      },
      {
        kind: 'faq',
        heading: 'Why can a shared plan not go above 2?',
        text: `With a plan, every answer is fixed in advance, so each of the four correlations is either +1 or -1 for that plan. Three of them can be +1, but then the fourth is forced to agree too, and since it is subtracted the sum is at most 2 in size. Averages of plans cannot do better. The entangled pair does not follow a fixed plan, which is how it gets past 2.`,
      },
      {
        kind: 'faq',
        heading: 'Does passing 2 let Alice and Bob send messages?',
        text: `No. Each person's own results look completely random whatever the other does. The correlation only shows up when the two lists of results are put side by side, which needs an ordinary message. So Bell tests rule out local hidden variables, and do not give a way to signal faster than light.`,
      },
      {
        kind: 'faq',
        heading: 'Which angles give the largest S?',
        text: `Alice's two angles should be 45 degrees apart, with Bob's two angles sitting halfway between them, one on each side. For example, Alice at 0 and 45 degrees and Bob at 22.5 and -22.5 degrees gives S equal to 2 times the square root of 2 and a CHSH win rate of about 85.4%. The Use the best angles button sets these.`,
      },
      {
        kind: 'explain',
        heading: 'What should I notice in the Bell and CHSH Explorer?',
        text: `The correlation between the two measurements follows a smooth wave in the angle gap, and a shared script can only trace a zig-zag with the same corner points. That difference is what the Bell test detects. The lab is exact for an ideal Bell pair, with no noise, so in a real experiment the value of S is a little lower.`,
      },
    ],
  },

  teleportation_lab: {
    tag: 'Accurate',
    sections: [
      {
        kind: 'explain',
        heading: 'How do I use the Teleportation Lab?',
        text: `Choose the message Alice wants to send, either with the named buttons or the tilt and turn sliders. Then step through the protocol with the button: make the Bell pair, entangle the message with Alice's half, apply a Hadamard, measure, and correct. The two spheres show the message and Bob's qubit, and the bar shows how well Bob's qubit matches. After the measurement you can untick Alice's two bits reach Bob. Teleport 200 times repeats the whole thing.`,
      },
      {
        kind: 'faq',
        heading: 'Why does Bob not have the message before he gets the bits?',
        text: `After Alice measures, Bob's qubit holds the message but scrambled by one of four possible flips, and which one depends on Alice's random result. Without her two bits Bob cannot tell which, so averaged over her outcomes his qubit is pure noise. Untick Alice's bits reach Bob to see that: he is wrong unless the bits happened to be 00.`,
      },
      {
        kind: 'faq',
        heading: 'Why does teleportation not beat the speed of light?',
        text: `The bits have to travel by an ordinary route, so the message cannot arrive before they do. Before the bits arrive, Bob's qubit is useless as a message. The entanglement was prepared earlier and only makes the transfer possible, which is why nothing is sent faster than light.`,
      },
      {
        kind: 'faq',
        heading: 'Where does the original qubit go?',
        text: `Alice's measurement destroys it: her message qubit becomes a plain 0 or 1 that tells her nothing about the message. The state has been moved to Bob, not copied. Copying an unknown quantum state is impossible, which is the no-cloning theorem. Only the state travels, not matter or energy.`,
      },
      {
        kind: 'faq',
        heading: 'What does the match percentage mean?',
        text: `It is how close Bob's qubit is to the message: 100% is an exact match, and 50% is what a random guess would score. Each step moves it, and after the correction it should read 100% for any message. A short arrow on Bob's sphere means his qubit is still tangled up with Alice's.`,
      },
      {
        kind: 'explain',
        heading: 'What should I notice in the Teleportation Lab?',
        text: `A quantum state can be moved with one shared entangled pair and two ordinary bits, and it works for any message you choose. Each of the four bit pairs comes up about a quarter of the time, whatever the message is. The simulation follows the real textbook protocol exactly on three qubits.`,
      },
    ],
  },

  deutsch_jozsa_explorer: {
    tag: 'Accurate',
    sections: [
      {
        kind: 'explain',
        heading: 'How do I use the Deutsch-Jozsa Explorer?',
        text: `Choose how many input bits the function has. Pick a preset function or tap cells of the truth table to flip f(x) for each input. The signs show what the function does to each input after one query. Run the circuit once reads the input qubits, and the verdict reads: all zeros means constant, anything else means balanced. The Queries to be sure panel compares how many questions a classical and a quantum detective need.`,
      },
      {
        kind: 'explain',
        heading: 'What is a constant and a balanced function?',
        text: `The function takes an n-bit input and returns 0 or 1. It is constant if it gives the same answer for every input, and balanced if it gives 0 for exactly half the inputs and 1 for the other half. The algorithm promises to work only when the function is one of these two. If you flip cells so it is neither, the lab warns that the promise is broken.`,
      },
      {
        kind: 'faq',
        heading: 'Why does reading all zeros mean constant?',
        text: `After the oracle, each input has a plus or minus sign depending on f. The final Hadamards make those signs interfere. When all signs are the same, they add up on the all-zeros outcome and the readout is always all zeros. When half are plus and half minus, they cancel exactly on all zeros, so it never appears. So one run is enough to tell them apart for certain.`,
      },
      {
        kind: 'faq',
        heading: 'Why are there signs after the oracle?',
        text: `The extra helper qubit is prepared so that asking the function flips its sign instead of a bit. This is called phase kickback. Every input then carries a sign of plus one or minus one, according to f(x), and all inputs are asked at the same time because they are in superposition.`,
      },
      {
        kind: 'faq',
        heading: 'How many queries does a classical computer need?',
        text: `To be certain, a classical detective may have to look at more than half of the inputs, which is half of them plus one, in the worst case. The quantum circuit needs one. The gap grows exponentially in n, but it is a speed-up only against a classical algorithm that must be certain, and this problem has no practical use.`,
      },
      {
        kind: 'explain',
        heading: 'What should I notice in the Deutsch-Jozsa Explorer?',
        text: `Interference can settle a question with one query that a classical method has to check many times. The oracle here is given as a truth table, so the lab shows the idea and not a real-world speed-up. Real speed-ups need an oracle that is cheap to build as a circuit.`,
      },
    ],
  },

  grover_explorer: {
    tag: 'Accurate',
    sections: [
      {
        kind: 'explain',
        heading: 'How do I use the Grover Explorer?',
        text: `Choose the size of the list (4, 8 or 16 items). Tap an item to hide the prize under it; you can mark up to half the list. Each tap of Grover round applies one round of the algorithm. The bars show the amplitude of every item, positive up and negative down, and the dashed line is their average. The number and the bar show the chance that a measurement finds a marked item. The back button returns to the start.`,
      },
      {
        kind: 'explain',
        heading: 'What does one Grover round do?',
        text: `A round has two steps. First the oracle flips the sign of the marked amplitude. Then every amplitude is reflected about the average, so each becomes twice the average minus itself. The marked one, now below the average, ends up higher than before, and all the others sink a little. Repeating the round raises the marked amplitude step by step.`,
      },
      {
        kind: 'faq',
        heading: 'Why do too many rounds make the chance fall again?',
        text: `Grover's rounds are a rotation of the state, so after the best round the state keeps turning and carries the answer away again. The chance of success follows sin squared of (2k plus 1) times theta, which rises, peaks and falls. The lab shows the best number of rounds, and stopping there is part of the algorithm.`,
      },
      {
        kind: 'faq',
        heading: 'How much faster is Grover than a classical search?',
        text: `About the square root of N. A classical search of an unsorted list needs around N over 2 guesses on average, while Grover needs about pi over 4 times the square root of N rounds. That is a quadratic speed-up, not an exponential one. For a handful of items the classical search is just as good, and the gap only matters for huge lists.`,
      },
      {
        kind: 'faq',
        heading: 'What changes if I mark more than one item?',
        text: `Each round turns the state by the same angle, but the angle is larger when more items are marked, so you need fewer rounds. The best number of rounds is about pi over 4 times the square root of N over M, for M marked items out of N. With half the list marked a random guess is already right half the time, so there is little for the algorithm to gain.`,
      },
      {
        kind: 'explain',
        heading: 'What should I notice in the Grover Explorer?',
        text: `Amplitude is moved onto the answer by interference: a sign flip and a reflection about the average. The algorithm is a rotation, so it can overshoot. It gives a square-root speed-up and needs a way to check an answer inside the quantum circuit. The lab is an exact simulation.`,
      },
    ],
  },

  noise_lab: {
    tag: 'Simplified model',
    sections: [
      {
        kind: 'explain',
        heading: 'How do I use the Noise Lab?',
        text: `Choose how many qubits hold one qubit's worth of information (1 is no protection). The slider sets the chance that each qubit flips. Run trials repeats the noise many times and compares one bare qubit with the group. The bars show how often the information is lost, against the maths prediction, and the curve shows the failure rate at every noise level. The section Find the error without looking at the data compares qubits with a helper and fixes a flip.`,
      },
      {
        kind: 'faq',
        heading: 'Why is the code better than a single qubit?',
        text: `The group takes a vote: the information is lost only if more than half of the qubits flip. For three qubits that needs two or three flips, which is much rarer than one flip when the noise is small. The chance falls from p to 3p squared minus 2p cubed. With 5 or more qubits it falls further, as long as the noise is below 50%.`,
      },
      {
        kind: 'faq',
        heading: 'Why does the code get worse when the noise is above 50%?',
        text: `A qubit that flips more often than not is more likely to be wrong than right, so a vote among such qubits is more likely to come out wrong too. At exactly 50% the code and a single qubit are equally bad. Real codes have a much lower break-even point, around 1% per operation, which is why today's qubits are not yet good enough for useful error correction.`,
      },
      {
        kind: 'faq',
        heading: 'How can the helper find the error without reading the data?',
        text: `The helper qubit only compares two data qubits and says whether they agree or differ. It never learns what either one holds, so the encoded superposition is untouched. Two comparisons, Q1 with Q2 and Q2 with Q3, point at a single flipped qubit. The panel shows that the amplitudes of the data are the same before and after the probes.`,
      },
      {
        kind: 'faq',
        heading: 'Why do two flips fool the code?',
        text: `The code assumes the odd qubit out is the one that flipped. When two qubits flip, the odd one out is actually the healthy one, so the repair flips the wrong qubit and the whole encoded qubit ends up flipped. The code can undo one flip at a time. That is the reason its failure rate is not zero.`,
      },
      {
        kind: 'explain',
        heading: 'What should I notice in the Noise Lab?',
        text: `Errors can be found without reading the data, and a group of noisy qubits can be more reliable than one, as long as the noise is rare enough. This is a simplified model: only bit flips, every qubit flips independently, and the probes and gates are perfect. Real machines also have phase flips and errors in the checks themselves, so real codes are bigger.`,
      },
    ],
  },
  qubit_metrics_lab: {
    tag: 'Simplified model',
    sections: [
      {
        kind: 'explain',
        heading: 'How do I use the Qubit Metrics Lab?',
        text: `Four sliders set T1, T2, the time one gate takes and the error per gate. Two bars show how many gates fit: by time (T2 divided by the gate time) and by error (one divided by the error). The smaller bar is the usable depth, and the readout also gives the chance that a circuit that long runs with no error at all. The three preset buttons are illustrative machines, and the Willow-like one uses two figures from Google's published spec sheet. Show the math lists the arithmetic.`,
      },
      {
        kind: 'faq',
        heading: 'What do T1 and T2 mean in the Qubit Metrics Lab?',
        text: `T1 is how long a qubit keeps its energy: a 1 relaxes back to 0 after about T1. T2 is how long it keeps its phase, the relative sign between 0 and 1 that interference depends on. T2 can be shorter than T1 but never more than twice T1, which is why the lab pulls a T2 slider back if you push it too far.`,
      },
      {
        kind: 'faq',
        heading: 'Why are there two limits on circuit depth?',
        text: `A qubit can fail you in two ways. It can run out of time, because the state is spoiled after about T2. Or each gate can have a small chance of going wrong, so after about one over the error rate in gates you expect a mistake. A machine can have a long T2 and still be limited by error, or the other way round, so both numbers matter.`,
      },
      {
        kind: 'faq',
        heading: 'Why is a faster gate not always better here?',
        text: `A shorter gate time raises the by-time limit, so it helps when time is the limit. But if the error is the limit, speeding up the gates changes nothing, and in real devices pushing a gate faster often raises its error. This lab keeps the two numbers separate so you can see which one is holding the budget.`,
      },
      {
        kind: 'faq',
        heading: 'Why does the error-free chance only reach about 37 percent?',
        text: `At the error limit, a circuit has about one error expected in it. If each gate fails independently, the chance of no failure at all is about one over e, roughly 37 percent. The rule of thumb tells you where errors start to be likely, not where they are impossible. Error correction exists to get past exactly this limit.`,
      },
      {
        kind: 'misconception',
        heading: 'Are these numbers measurements of a real machine?',
        text: `No. The presets are illustrative and are labelled so. The lab is a simplified model: real gate errors have several causes that are not independent of T1 and T2, and different devices are limited by different things. Only the T1 and the error in the Willow-like preset come from a source, and its gate time and T2 are round numbers of ours.`,
      },
      {
        kind: 'explain',
        heading: 'What should I notice in the Qubit Metrics Lab?',
        text: `Notice that the usable depth is set by the smaller of two limits, so improving the wrong number does nothing. Notice that slow, clean qubits and fast, noisy ones can end up with budgets of similar size for different reasons. And notice that even at the budget, a circuit often fails, which is why error correction is needed for long computations.`,
      },
    ],
  },
  transmon_lab: {
    tag: 'Simplified model',
    sections: [
      {
        kind: 'explain',
        heading: 'How do I use the Transmon Lab?',
        text: `Set the drive strength and the chart shows the chance of finding the qubit in 1 as a microwave pulse is applied. Turn noise on to add T1 and T2, switch it off for the perfect curve, and change the time span to zoom in or out. The dashed white curve is the ideal one, so you can see what noise takes away. The readouts give the length of a pi pulse, the best flip chance and how fast the oscillation fades.`,
      },
      {
        kind: 'faq',
        heading: 'What is a Rabi oscillation?',
        text: `When a resonant pulse drives a qubit, its state turns steadily about an axis, so the chance of reading 1 rises, peaks at certain, and falls again in a regular wave. The wave is a Rabi oscillation. A stronger drive turns faster, so the wave is quicker. A pi pulse is the pulse length that turns 0 into 1 completely, and that is how a bit-flip gate is made.`,
      },
      {
        kind: 'faq',
        heading: 'Why do the peaks get lower with noise?',
        text: `T1 pulls the qubit back toward 0 while the drive pushes it toward 1, and T2 blurs the phase of the turning. Together they wash the swing out, so the peaks shrink and the curve settles near 50 percent. The fade time is two divided by (one over T1 plus one over T2), so either one being short is enough to spoil it.`,
      },
      {
        kind: 'faq',
        heading: 'Why does a stronger drive help?',
        text: `A stronger drive makes the pi pulse shorter, so the qubit gets flipped before T1 and T2 have had time to act. Compared with how fast it fades, a quick gate is a clean gate. In real devices there is a limit, because driving too hard can push the transmon into a third level, which this two-level model does not show.`,
      },
      {
        kind: 'faq',
        heading: 'Why must T2 stay under twice T1?',
        text: `Losing energy also destroys phase information, so phase cannot last more than about twice as long as energy. The slider is limited to that. A T2 below T1 is common, because other noise also scrambles the phase, so the lab lets T2 go lower freely.`,
      },
      {
        kind: 'explain',
        heading: 'What should I notice in the Transmon Lab?',
        text: `Notice that a gate is a rotation, and that its length decides how far it turns. Notice that noise limits the number of flips you can do before the signal is gone, so gates must be fast compared with T1 and T2. And remember what is missing: a real transmon has more than two levels, so this is a simplified model of the lowest two.`,
      },
    ],
  },
  topology_compiler: {
    tag: 'Simplified model',
    sections: [
      {
        kind: 'explain',
        heading: 'How do I use the Topology Compiler?',
        text: `Choose a circuit and a hardware layout. The picture shows which qubits touch. The readout counts the SWAP gates the compiler had to add and the total CNOTs, since each SWAP is three of them. The bars show the same circuit on all three layouts, and the list at the bottom says, gate by gate, what the compiler did. Show the math gives the counting rule.`,
      },
      {
        kind: 'faq',
        heading: 'Why does connectivity cost extra gates?',
        text: `A two-qubit gate needs the two qubits to be neighbours. When they are not, the compiler swaps one qubit step by step along a path until they touch, does the gate, and may need to keep the new arrangement for later. Every SWAP is three CNOTs, and every gate has a chance of error, so more distance means more noise.`,
      },
      {
        kind: 'faq',
        heading: 'Why can everyone-to-everyone need no SWAPs?',
        text: `In a trapped-ion chain every ion can interact with every other one, so any pair of qubits is already a neighbour. No qubit has to be moved, and the count is zero for any circuit. That is the main advantage of trapped ions in this lab. It applies within one chain: moving to many separate chains brings the need to move ions back.`,
      },
      {
        kind: 'faq',
        heading: 'Why is the line sometimes better than the grid?',
        text: `The best layout depends on the circuit. A chain of gates between consecutive qubits fits a line exactly and needs no SWAPs, while on a small 2 by 2 grid two of those qubits sit on a diagonal and cost one. For circuits that connect far-apart qubits, the grid shortens distances and wins. No layout is best for everything.`,
      },
      {
        kind: 'misconception',
        heading: 'Is this how real compilers route circuits?',
        text: `Only roughly. This router carries one qubit along a shortest path and keeps the new arrangement. Real compilers also choose where to place the qubits at the start, can move both qubits, and reorder gates that do not depend on each other, so they usually do better. The lab is a simplified model meant to show the cost, not to be the best compiler.`,
      },
      {
        kind: 'explain',
        heading: 'What should I notice in the Topology Compiler?',
        text: `Notice that the same circuit costs different amounts on different hardware, so the machine and the program have to be matched. Notice that the cost is in extra gates and so in extra errors, not only in time. And notice that all-to-all connectivity removes the cost entirely for one chain, which is why connectivity is one of the trade-offs between hardware types.`,
      },
    ],
  },
  rydberg_blockade_lab: {
    tag: 'Simplified model',
    sections: [
      {
        kind: 'explain',
        heading: 'How do I use the Rydberg Blockade Lab?',
        text: `Two sliders set the distance between two atoms and the strength of the laser. The picture shows the atoms and a dashed ring, the blockade radius. The banner says whether the second atom is inside it. The chart shows, over half a microsecond, the chance that both atoms are excited and the chance that exactly one is. The readouts give the radius, the push at this distance and the pair swing time.`,
      },
      {
        kind: 'faq',
        heading: 'Why do the atoms in the Rydberg Blockade Lab go to a Rydberg state?',
        text: `A Rydberg state is an atom with an electron excited very far from the nucleus, so the atom is huge and extremely sensitive to its neighbours. Two such atoms push on each other strongly over several micrometres. Neutral-atom quantum computers use a laser to take an atom to a Rydberg state briefly, only to make that interaction, and keep the qubit itself in two long-lived ground states.`,
      },
      {
        kind: 'faq',
        heading: 'What is the blockade radius?',
        text: `It is the distance at which the push between two Rydberg atoms equals the strength of the laser. Closer than that, the laser cannot excite the second atom, because the first atom's push moves the second one off resonance. Further apart, the atoms are excited independently. The radius depends on the laser: a weaker laser has a larger radius.`,
      },
      {
        kind: 'faq',
        heading: 'Why does a blockaded pair swing faster?',
        text: `With the blockade, the pair can only share one excitation between the two atoms, and the two ways of doing that add up coherently. That gives a combined swing rate of the square root of two times the single-atom rate, so a blockaded pair completes a pulse a little sooner. It is a collective effect, and it is how a controlled gate is built.`,
      },
      {
        kind: 'misconception',
        heading: 'Is the blockade an all-or-nothing switch?',
        text: `No. The label blockaded or not blockaded is a convenient cut at the radius, but the push grows smoothly as one over distance to the sixth power. Just inside the radius a little double excitation still leaks through, and the chart shows it. Real atoms also have more levels and laser noise, which this simplified model leaves out.`,
      },
      {
        kind: 'explain',
        heading: 'What should I notice in the Rydberg Blockade Lab?',
        text: `Notice that the blockade turns an interaction between atoms that normally ignore each other into a controllable gate: close atoms cannot both be excited, far atoms can. Notice how steeply the push changes with distance, which is why atom spacing is a design choice. The defaults follow a published experiment, but the curves are the simplified two-atom model.`,
      },
    ],
  },
  loss_budget_lab: {
    tag: 'Simplified model',
    sections: [
      {
        kind: 'explain',
        heading: 'How do I use the Loss Budget Lab?',
        text: `Three sliders set the loss of each component in decibels, how many components the photons pass through and how many photons must all arrive. The readouts give the total loss, the chance that one photon arrives, the chance that all of them arrive and how many tries a success takes on average. The chart shows how success falls as components are added, and a fourth slider sets a target and tells you the largest number of components that still meets it.`,
      },
      {
        kind: 'faq',
        heading: 'What does a decibel of loss mean?',
        text: `Decibels are a logarithmic way to write loss. Three decibels is a factor of two, so half the light gets through, and ten decibels is a factor of ten. Their advantage is that they add: two parts with 0.5 decibels each lose 1 decibel together. Under the hood, the fractions that get through multiply, and the decibels simply add.`,
      },
      {
        kind: 'faq',
        heading: 'Why does success fall so quickly with more photons?',
        text: `Each photon has to survive, and survival chances multiply. If one photon arrives with 80 percent, four arrive together with about 41 percent, and eight with about 17 percent. So a modest loss per component becomes a very small success chance once many components and many photons are involved.`,
      },
      {
        kind: 'faq',
        heading: 'Is photon loss the same as a gate error?',
        text: `No. A photon that is lost is simply gone, and in many designs the loss is detectable, which is a different problem from a qubit silently flipping. That is why photonic designs try to tolerate or detect loss with extra photons, multiplexing and error-correcting codes, instead of just making gates cleaner.`,
      },
      {
        kind: 'misconception',
        heading: 'Does this show how a real photonic chip performs?',
        text: `No. The lab assumes every component loses the same amount independently, which no real chip does, and it ignores detector efficiency, source quality and any correction scheme. It is a simplified model meant to show why loss is the central problem, not to predict the performance of a particular machine.`,
      },
      {
        kind: 'explain',
        heading: 'What should I notice in the Loss Budget Lab?',
        text: `Notice that success falls exponentially with the number of components: each added part multiplies the chance by the same factor. Notice how quickly small losses add up to a hopeless success rate, and how the number of photons raises the stakes. That is why photonic machines need very low loss per component, and why reducing loss is the main engineering target.`,
      },
    ],
  },
  exchange_coupling_lab: {
    tag: 'Simplified model',
    sections: [
      {
        kind: 'explain',
        heading: 'How do I use the Exchange-Coupling Lab?',
        text: `The barrier slider sets the wall between two quantum dots, and the pulse slider sets how long the wall is lowered for. Two buttons jump to the pulse lengths of a full swap and of a square root of SWAP. The readouts give the coupling J, how long a full swap takes, how likely the spins have swapped and how entangled they are. The chart shows both against pulse length.`,
      },
      {
        kind: 'faq',
        heading: 'What is the exchange coupling?',
        text: `When the barrier between two electrons is lowered, their wave functions overlap and their spins interact. The strength of that interaction is the exchange coupling J. It makes two opposite spins swap places back and forth at a rate set by J. Raising the barrier switches the interaction off, so the barrier works as an electrical switch.`,
      },
      {
        kind: 'faq',
        heading: 'Why is the half swap an entangling gate?',
        text: `A full swap exchanges the two spins, which just rearranges them. Half way through, the pair is an equal superposition of unswapped and swapped, and that state cannot be written as one state for each spin, so the spins are fully entangled. That half swap is the square root of SWAP, and with single-spin rotations it can make a CNOT.`,
      },
      {
        kind: 'faq',
        heading: 'Why does a higher barrier make the swap slower?',
        text: `The overlap of the two electrons falls roughly exponentially as the barrier grows, so J falls the same way. A smaller J means a longer wait for a full swap. The exponential also makes the barrier a delicate control: a small change in the voltage is a big change in J, and so in how long the pulse should be.`,
      },
      {
        kind: 'misconception',
        heading: 'Is this exactly how a silicon qubit device behaves?',
        text: `No. This is the textbook exchange model with an illustrative way that J depends on the barrier. Real devices also have charge noise that jitters the barrier, valley states in silicon, and magnetic-field differences between the dots, which spoil the clean oscillation drawn here. It is a simplified model of the idea.`,
      },
      {
        kind: 'explain',
        heading: 'What should I notice in the Exchange-Coupling Lab?',
        text: `Notice that a gate is a pulse of the right length, so timing and barrier control are the whole game. Notice that the best entangling pulse is half of a swap, not a full one. And notice how sensitive J is to the barrier, which is one reason that tuning many dots at once is hard.`,
      },
    ],
  },
  annealing_lab: {
    tag: 'Simplified model',
    sections: [
      {
        kind: 'explain',
        heading: 'How do I use the Annealing Lab?',
        text: `Pick one of three small spin problems and set the anneal time. The lab simulates the spins exactly and shows the chance that they end up in the lowest-energy answer. A bar for each bit string reached shows where they landed, and a star marks the best one. Two charts show how success depends on anneal time and how the energy gap between the lowest two levels changes during the anneal. Show the math gives the Hamiltonian.`,
      },
      {
        kind: 'faq',
        heading: 'What is the Annealing Lab simulating?',
        text: `Annealing starts the spins in an equal mix of all answers, with a strong transverse field, and then slowly turns that field off while the problem's own energy is turned on. If it goes slowly enough, the system stays in its lowest-energy state and finishes in the best answer. It is a different kind of machine from a gate-model computer, designed only for optimisation problems.`,
      },
      {
        kind: 'faq',
        heading: 'What is the energy gap and why does it matter?',
        text: `The gap is the difference between the lowest energy level and the next one. If the anneal goes too fast through a place where the gap is small, the system can jump up to the higher level and be left behind. The smaller the smallest gap, the longer the anneal has to be, roughly one over the gap squared.`,
      },
      {
        kind: 'faq',
        heading: 'Why does a quick anneal give a poor answer?',
        text: `The spins need time to follow the changing energy landscape. Run it too fast and the state does not adjust in step, so it ends up in a mixture that includes higher-energy answers. The slow run follows the lowest level and finishes in the best answer. The success chart shows that rise as the time grows.`,
      },
      {
        kind: 'misconception',
        heading: 'Does this lab show that annealers beat classical computers?',
        text: `No. It is a perfect, closed simulation of four or five spins, which a laptop solves instantly by brute force. Real annealers have thousands of qubits, are noisy and open to their surroundings, and are compared with very good classical solvers. Whether they are faster is still debated, and this lab says nothing either way.`,
      },
      {
        kind: 'explain',
        heading: 'What should I notice in the Annealing Lab?',
        text: `Notice that success depends on how long you take, not only on what you start with, and that the harder problem has a narrower gap and so needs more time. Notice the gap chart: its lowest point is where the anneal is in danger. And keep in mind the scale: a few spins here, thousands in a real machine.`,
      },
    ],
  },
  overhead_calculator: {
    tag: 'Simplified model',
    sections: [
      {
        kind: 'explain',
        heading: 'How do I use the Overhead Calculator?',
        text: `Two sliders set the physical error per step and the logical error you want to reach. The readouts show the smallest code distance that gets there, the number of physical qubits for one logical qubit, and how much each step in distance divides the error. The chart shows the logical error against the distance. The three preset buttons jump to a figure from Google's spec sheet, to the threshold, and to a very good qubit.`,
      },
      {
        kind: 'faq',
        heading: 'What is the threshold?',
        text: `The threshold is the physical error rate below which making a code bigger makes the logical error smaller, and above which it makes it larger. The surface code threshold in the study this lab follows is 0.57 percent per step. Below it, error correction works and adding qubits pays. Above it, adding qubits only adds more places to fail.`,
      },
      {
        kind: 'faq',
        heading: 'What is the code distance?',
        text: `The distance is the number of errors a code needs to be fooled by, in effect how big the code is. A distance-three code can fix one error, a distance-five code two. Every step of two in distance multiplies the protection, and costs more qubits: this lab counts (2d minus 1) squared physical qubits for distance d.`,
      },
      {
        kind: 'faq',
        heading: 'Why does the number of qubits explode near the threshold?',
        text: `Close to the threshold each step in distance helps only a little, because the error shrinks by the ratio of threshold to physical error, which is barely above one. So you need many steps, and the qubit count grows with the square of the distance. Far below the threshold a few steps are enough.`,
      },
      {
        kind: 'misconception',
        heading: 'Is this formula a prediction for real machines?',
        text: `No. It is an empirical fit from one numerical study with one noise model and decoder, so the threshold and prefactor belong to that setting. Other codes, layouts and noise give different numbers, and newer layouts use roughly half the qubits. The lab shows the shape of the trade-off, which is robust, not exact figures.`,
      },
      {
        kind: 'explain',
        heading: 'What should I notice in the Overhead Calculator?',
        text: `Notice the cliff at the threshold: below it each step in distance improves things exponentially, above it nothing helps. Notice how many physical qubits a single good logical qubit costs when the target is demanding. This is why the quality of physical qubits matters as much as how many there are.`,
      },
    ],
  },
  comparison_dashboard: {
    tag: 'Simplified model',
    sections: [
      {
        kind: 'explain',
        heading: 'How do I use the Comparison Dashboard?',
        text: `Choose up to three systems from the list and their cards appear below, each with qubit count, two-qubit error, T1 and connectivity, a note on what the figures do not show, and a source with its date and a link. The three buttons at the top order the list by qubits, by lowest error or by newest source. A figure the source does not give is shown as not given, never filled in.`,
      },
      {
        kind: 'faq',
        heading: 'Why are some figures missing?',
        text: `Each card only shows what its source states. A paper about error rates may say nothing about coherence time, and a product announcement may give a qubit count with no fidelity at all. Leaving the figure blank is deliberate, because a guess would look like a measurement. The source link on each card is where the missing detail would be.`,
      },
      {
        kind: 'faq',
        heading: 'Can I rank the machines by these numbers?',
        text: `Not safely. The systems are different kinds of device, measured in different ways and in different years. A trapped-ion error rate and a superconducting one are measured on different gates, and an annealer's qubit count is not comparable with a gate-model machine's. The dashboard is for reading side by side, not for declaring a winner.`,
      },
      {
        kind: 'faq',
        heading: 'Why does every card have a date?',
        text: `Hardware figures change quickly, so a number without a date is hard to trust. The date is the date of the source, not today. When a newer source appears, the record is replaced, and the lesson text and tutor notes that quote it are rechecked.`,
      },
      {
        kind: 'misconception',
        heading: 'Does a missing system mean it is worse?',
        text: `No. The list is short because each record has to be a source that was checked and can be quoted. Many strong machines are not here simply because they are not in the list yet. Equally, being in the list does not make a system the best: it just has a checkable source.`,
      },
      {
        kind: 'explain',
        heading: 'What should I notice in the Comparison Dashboard?',
        text: `Notice that no single number tells you which machine is best, and that each card carries a caveat about what its figures leave out. Notice how different the connectivity is, from a grid to all-to-all to a moving array. This is the capstone for the hardware part: every choice is a trade-off, and the data is only as good as its source.`,
      },
    ],
  },
  maths_workbench: {
    tag: 'Accurate',
    sections: [
      {
        kind: 'explain',
        heading: 'How do I use the Maths Workbench?',
        text: `Choose A state or A matrix. For a state, type the amplitude of 0 and of 1 in the two boxes, or tap a preset. For a matrix, type its four entries row by row. You can write numbers the way you would on paper: 1/√2, 0.7071, i/√2 or (1+i)/2. The symbol buttons insert √, π and i for a phone keyboard. The screen then shows the chances, the point on the Bloch sphere, or whether the matrix is a legal gate.`,
      },
      {
        kind: 'faq',
        heading: 'What does the squared sizes must add up to 1 message mean?',
        text: `The chances of 0 and 1 come from the squared sizes of the two amplitudes, and a measurement has to give one of them, so the two chances must add up to 1. If they do not, the typed vector is not a valid state yet. The Normalise button divides both entries by the same number so that they do, which keeps the ratio between them and so the chances.`,
      },
      {
        kind: 'faq',
        heading: 'How do I read the point on the Bloch sphere?',
        text: `The picture shows the sphere seen from the side: up is z, to the right is x, and y points into the page. A state with z equal to 1 is |0⟩, with z equal to −1 is |1⟩. A state with z equal to zero is on the equator, where 0 and 1 are equally likely, and the direction around the equator is the relative phase.`,
      },
      {
        kind: 'faq',
        heading: 'What does unitary mean for a matrix?',
        text: `A matrix is unitary when multiplying its conjugate transpose by it gives the identity matrix. That is exactly the condition that it keeps the total chance at 1 for every state, so only unitary matrices can be quantum gates. A matrix such as all ones does not keep the total chance, so it is not a gate, and the workbench says so.`,
      },
      {
        kind: 'faq',
        heading: 'Why does it say a matrix is a gate up to a global phase?',
        text: `Multiplying a whole state, or a whole matrix, by a number of size 1 changes nothing that any measurement can show. So minus X acts on measurable things exactly like X, and the workbench names it X times a phase. Only relative phases, between 0 and 1 inside a state, are physical.`,
      },
      {
        kind: 'misconception',
        heading: 'Does the workbench show more than one qubit?',
        text: `No. It handles one qubit, with two amplitudes, and 2 by 2 matrices, which is where the arithmetic of the first lessons lives. Several qubits have four or more amplitudes and bigger matrices, and the Circuit Lab and the Two-Qubit Lab show those. The workbench is exact, with no noise and no sampling.`,
      },
      {
        kind: 'explain',
        heading: 'What should I notice in the Maths Workbench?',
        text: `Notice that a state is just two numbers, a gate is a grid of four, and applying the gate is the multiplication from the lessons. Notice that chances come from squared sizes, so signs and phases are invisible until a gate turns them into chances, which you can see by applying H after a Z. And check that every named gate is unitary.`,
      },
    ],
  },
};

export const LAB_HELP_IDS = Object.keys(LAB_HELP);
