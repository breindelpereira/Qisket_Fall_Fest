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
};

export const LAB_HELP_IDS = Object.keys(LAB_HELP);
