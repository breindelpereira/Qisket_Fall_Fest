import type { HonestyTag } from './types.ts';

/**
 * What the AI tutor knows about each game, so it can answer a learner's doubts while they play (or just after).
 * `scripts/build-tutor-index.ts` turns every section into a passage in `tutor/index.json`, tagged with the game's id.
 * A game's passages are used only while that game is open (or was left a short while ago), so they do not clutter
 * answers to other questions.
 *
 * Writing rules:
 *  - The first section of every game is "How to play": the rules, the buttons and how stars or lives work.
 *  - Explain how the game works and the idea it teaches. Never write out the solution to a level: the tutor is told to
 *    nudge, and it can only nudge well if it does not hold the answers.
 *  - Every game has an "I'm stuck" section with a nudge that works for any level, and (where it applies) the honest
 *    limits of the game, because the honesty tag has to show up in the explanation too.
 *  - One idea per section, about 40 to 120 words. Headings are phrased as the question a learner would ask.
 */
export type HelpKind = 'explain' | 'faq' | 'misconception';

export interface HelpSection {
  kind: HelpKind;
  heading: string;
  text: string;
}

export interface GameHelp {
  /** Must match the tag on the game's card in App.tsx (a test checks this). */
  tag: HonestyTag;
  sections: HelpSection[];
}

export const GAME_HELP: Record<string, GameHelp> = {
  hype_check: {
    tag: 'Simplified model',
    sections: [
      {
        kind: 'explain',
        heading: 'How do I play Hype Check?',
        text: `You get ten claims about quantum computers, one at a time. Tap one of three buttons: Real today, Maybe someday, or Hype or myth. The game then shows the right bin with a short reason, and you tap Next card. A round always has 3 real, 3 maybe-someday and 4 hype claims. You pass with 7 or more right, and 9 or more earns three stars. New cards deals a different set. There is no timer.`,
      },
      {
        kind: 'faq',
        heading: 'How do I decide which bin a claim belongs in?',
        text: `Ask two questions. Can this be done or seen today? Then it is Real today. If not, is it a sensible goal that researchers are working towards but that needs bigger or less noisy machines? Then it is Maybe someday. If the claim misunderstands how quantum computers work, or promises something they will not do, it is Hype or myth. Many claims have a true core, so read the reason after each card.`,
      },
      {
        kind: 'faq',
        heading: `I'm stuck. How do I get better at Hype Check?`,
        text: `Keep three ideas in mind. Quantum computers are specialist machines for a few kinds of problems, not faster versions of everything. Today's machines are small and noisy. And the speed-ups come from interference, which cancels wrong answers, not from trying every answer at once. When a claim sounds exciting, look for the word that makes it too big, such as everything, replace, or instantly.`,
      },
      {
        kind: 'faq',
        heading: 'Why is a claim Maybe someday when scientists say it is possible?',
        text: `Possible in principle is not the same as real today. Maybe someday means the idea is sound, but the machines are not big or reliable enough yet, or the research is still open. Real today means you can do it or see it now. The reason shown after each card says which of the two it is.`,
      },
      {
        kind: 'faq',
        heading: 'Why did I get a card wrong when it sounded true?',
        text: `Many myths contain a true part. The wording matters: a quantum computer being faster at some problems is true, faster at everything is a myth. Read the reason on the card to see exactly where the claim goes too far, then look for the same pattern in the next card.`,
      },
      {
        kind: 'explain',
        heading: 'What does finishing Hype Check show?',
        text: `Passing means you can tell the real picture from the hype: quantum computers are real, promising and limited. Passing a round counts as completing the game in the course. The three bins simplify a messy picture, so real experts often say it depends. The reason on each card is the real lesson, even when you got the card right.`,
      },
    ],
  },

  quantum_heist: {
    tag: 'Simplified model',
    sections: [
      {
        kind: 'explain',
        heading: 'How do I play Quantum Heist?',
        text: `There are three stages and three shields (hearts). In each stage you set up your agent's quantum state, then tap the breach button. A wrong state trips the alarm and costs a shield, and losing all three ends the run. Stage 1 has two doors, Stage 2 has a wave trap, and Stage 3 has a 3D Bloch sphere radar that you steer with the arrow pad. Pressing the H, X and Z keys is free; only the breach button can set off the alarm. Rules explains the controls and Hint shows the next move. There is no timer.`,
      },
      {
        kind: 'explain',
        heading: 'What do the H, X and Z keys do in Quantum Heist?',
        text: `H (Hadamard) spreads a definite door evenly over both doors, and gathers an even spread back to one door. X swaps the two doors, so Door 0 becomes Door 1. Z leaves the chance at each door alone but flips the sign (the phase) of the Door 1 part. You cannot see a sign in the door percentages, yet it changes what the next H does.`,
      },
      {
        kind: 'faq',
        heading: 'Why does the scanner not catch me when I am split 50/50?',
        text: `The camera fires if you are 100% at one door. A 50/50 split leaves it with nothing to aim at, which is a playful picture of superposition: before any measurement the agent has no single door. This is a simplified model, because a real measurement would still find the qubit at one door, with 50% chance for each.`,
      },
      {
        kind: 'faq',
        heading: 'Why does Stage 2 care about a sign when the percentages look the same?',
        text: `Two different states can both show 50/50 at the doors. They differ in the sign between the two parts, which is the phase. Waves from the two parts can add up or cancel out, like ripples on water, depending on that sign. The trap's wave cancels only for one of the two signs.`,
      },
      {
        kind: 'faq',
        heading: 'How does the Bloch sphere radar in Stage 3 work?',
        text: `Every single-qubit state is a point on the Bloch sphere. The north pole is |0>, the south pole is |1>, and the equator holds the 50/50 states. How far around the equator you are is the phase. The arrow pad tilts the crosshair up and down, which changes the chances, or turns it left and right, which changes the phase. You are ready when the crosshair is close to the target ring.`,
      },
      {
        kind: 'faq',
        heading: `I'm stuck in Quantum Heist. What can I try?`,
        text: `Read the mission objective, then look at your door percentages and ask what is different between where you are and what is asked. Is it the chance at the doors, the sign, or the place on the sphere? Try each key once and watch what changes. After an alarm, Retry infiltration puts you back at the start of the stage. The Hint button shows the next move whenever you want it.`,
      },
      {
        kind: 'explain',
        heading: 'What does finishing Quantum Heist show?',
        text: `You have met superposition, phase and the Bloch sphere in one story. Honesty note: this is a simplified model. Real state preparation uses gates, and a real measurement gives only one outcome.`,
      },
    ],
  },

  coin_flip: {
    tag: 'Accurate',
    sections: [
      {
        kind: 'explain',
        heading: 'How do I play the Quantum Penny Paradox?',
        text: `A penny starts on Heads, which is |0>. Each round has three steps: Dr. Quantum plays a move, you play a move, then Dr. Quantum plays again and the coin is measured. Dr. Quantum wins on Heads and you win on Tails. You start in classical mode, where your moves are FLIP (X) and KEEP (I). The Unlock button switches to quantum mode, which adds a third move, the phase flip (Z). Play as many rounds as you like; there is no timer. It is David Meyer's 1999 game.`,
      },
      {
        kind: 'explain',
        heading: 'Why does Dr. Quantum always win in classical mode?',
        text: `Dr. Quantum's first move, H, puts the coin into an equal superposition, |+>. Flipping swaps the two equal halves, which gives exactly the same state back, so a flip does nothing. Keeping does nothing too. Dr. Quantum's second H then undoes the first one, and the coin lands on Heads every time.`,
      },
      {
        kind: 'explain',
        heading: 'What does the quantum move do?',
        text: `The phase flip (Z) changes the sign between the two halves, so |+> becomes |->. That is a different state even though it still looks 50/50, and no classical move can reach it. Dr. Quantum's second H turns |-> into |1>, so the coin lands on Tails every time.`,
      },
      {
        kind: 'faq',
        heading: 'Why does a phase flip beat Dr. Quantum when the coin looks the same?',
        text: `The chances of Heads and Tails are not the whole state. The sign between the two halves is part of the state too, and H turns a plus into Heads and a minus into Tails. This is interference at work: the two halves add up for one outcome and cancel for the other.`,
      },
      {
        kind: 'faq',
        heading: `I'm stuck. Can I ever beat Dr. Quantum?`,
        text: `Not in classical mode, because flip and keep lead to the same result. Switch on quantum mode with the Unlock button and look at the extra move you are given. Think about what that move changes that a flip does not: a flip changes which half is which, but a flip cannot change the sign between them.`,
      },
      {
        kind: 'misconception',
        heading: 'Would the Hadamard gate also beat Dr. Quantum?',
        text: `No. If you played H as your move, the coin would go from |+> to |0>, and Dr. Quantum's second H would take it back to |+>, so the final measurement would be a 50/50 coin flip. Only a move that changes the sign, such as Z, forces Tails.`,
      },
      {
        kind: 'faq',
        heading: 'Is the Quantum Penny Paradox a real quantum game?',
        text: `Yes. David Meyer described it in 1999 as one of the first quantum games. The app runs the ideal version, with perfect gates and no noise. Dr. Quantum is not cheating: a quantum player simply has moves that a classical player does not.`,
      },
      {
        kind: 'explain',
        heading: 'What does finishing the Quantum Penny Paradox show?',
        text: `Winning shows that the chances of Heads and Tails are not the whole state: the sign between the two halves matters too, and interference turns that sign into a different outcome. A move that no classical player has is enough to turn a lost game into a won one. The game is accurate, though it is the ideal noiseless version of Meyer's game.`,
      },
    ],
  },

  schrodingers_stealth: {
    tag: 'Accurate',
    sections: [
      {
        kind: 'explain',
        heading: `How do I play Schrödinger's Stealth?`,
        text: `There are three sectors, each a corridor of laser checkpoints. Every checkpoint is a slot shaped like a quantum state: vertical for |0>, horizontal for |1>, 45 degrees for |+>, and the opposite diagonal for |->. Your agent starts vertical. Use the gadgets [H] TILT, [X] FLIP and [Z] PHASE to change your stance until it matches the slot, then slip through. A match passes with certainty. If it does not match, the laser measures you: you slip through with exactly the chance shown (a 50% match passes half the time), and otherwise your state collapses and the alarm goes up by 25 to 40 percent. At 100 percent the run is over. Using gadgets is free. A gadget pulses when it is the one that helps.`,
      },
      {
        kind: 'explain',
        heading: 'What are the blue and pink scanners?',
        text: `A scanner is a measurement in a chosen basis. The blue scanner asks whether you are |0> or |1>. The pink scanner asks whether you are |+> or |->, and the purple scanner is the pink one set for the negative diagonal. If your state matches what a scanner is asking about, the answer is certain and nothing is disturbed. If it does not match, the answer is random with chances given by the Born rule, and the measurement collapses your state into whichever answer came out.`,
      },
      {
        kind: 'faq',
        heading: 'What does the percent chance of stealth mean?',
        text: `It is the chance that this scanner finds you in exactly the state its slot is shaped for. When your state is close enough to a match (above 95%) the game shows 100% STEALTH and you pass for certain. Anything lower is a gamble: the laser measures you, you slip through with exactly that chance, and otherwise you are caught.`,
      },
      {
        kind: 'faq',
        heading: 'Why does the same H gadget sometimes take me to diagonal and sometimes back to vertical?',
        text: `H swaps the two views of the qubit. From vertical |0> it gives the diagonal |+>, and from the diagonal |+> it gives vertical |0> again. Applying H twice does nothing at all. So the same gadget goes both ways, depending on where you are.`,
      },
      {
        kind: 'faq',
        heading: 'What does the Z phase gadget do when my shape does not seem to change?',
        text: `Z flips the sign of the |1> part. For vertical |0> and horizontal |1> that makes no visible difference, because the sign is only a global factor. For a diagonal it matters a lot: |+> becomes |->, the other diagonal. So Z is only useful once you are in a superposition.`,
      },
      {
        kind: 'faq',
        heading: `I'm stuck in Schrödinger's Stealth. What should I do?`,
        text: `Compare two things: the shape of the slot at the checkpoint and the shape of your agent. Then ask which single gadget turns your shape into theirs. The gadget that helps pulses. You can try gadgets as often as you like, because only stepping through the slot can raise the alarm.`,
      },
      {
        kind: 'explain',
        heading: `What does finishing Schrödinger's Stealth show?`,
        text: `Measurement depends on the question being asked. A state that matches the question gets a certain answer and is left alone, and a state that does not match gets a random answer and is changed. That is why measuring in the wrong basis disturbs a qubit.`,
      },
    ],
  },

  miltons_box: {
    tag: 'Analogy',
    sections: [
      {
        kind: 'explain',
        heading: `How do I play Milton's Box?`,
        text: `There are five boxes, one after another, with no timer. A box holds Milton, the app's tutor, in a state of one qubit: he is Awake when the qubit reads 0 and Asleep when it reads 1. Some boxes give you a recipe and ask for the chance of finding him Awake: set the slider and tap Open the box. Some give you gate buttons and a goal. The last one lets you open a box and look again. Tap Hint on any box for a nudge. Stars reward a first try.`,
      },
      {
        kind: 'explain',
        heading: 'How do I get the chance from the recipe?',
        text: `The recipe lists an amplitude for Awake and one for Asleep. The chance of an outcome is its amplitude squared, which is the Born rule. For example, an amplitude of 0.5 gives a chance of 0.25, which is 25%. The two chances always add up to 100%, so once you know one you know the other. Squaring is the step people forget: the amplitude is not the chance.`,
      },
      {
        kind: 'faq',
        heading: 'Does a minus sign in the recipe change the chance?',
        text: `No. Squaring removes the sign, so an amplitude of minus 0.5 and one of plus 0.5 give the same 25%. The sign does matter when amplitudes meet, because they can cancel or add. That is interference. Opening the box straight away cannot see the sign, which is why two boxes can look identical until a gate brings the signs into play.`,
      },
      {
        kind: 'faq',
        heading: 'What do the H, X and Z buttons do?',
        text: `H, the Hadamard gate, spreads a certain Awake or certain Asleep into an equal mix of both, and spreads an equal mix back into a certain one. X flips Awake and Asleep over. Z leaves Awake and Asleep as they are but flips the sign on the Asleep part, so it changes no chances on its own. Each gate acts on whatever state the box is in at that moment, so the order matters.`,
      },
      {
        kind: 'faq',
        heading: `I'm stuck in Milton's Box. What should I do?`,
        text: `Read what the box is asking: a chance from a recipe, a goal chance reached with gates, or a repeated look. For a recipe, square the amplitude. For gates, watch the two chance bars after every press and use Undo freely, because pressing a gate costs nothing but a slot. If a gate seems to do nothing, it may be changing a sign that the bars cannot show yet.`,
      },
      {
        kind: 'faq',
        heading: 'Why does looking again always give the same answer?',
        text: `Opening the box is a measurement, and a measurement changes the state. After the first look Milton is Awake for certain or Asleep for certain, whichever was found. A second look then has only one possible answer. The first look of a 50/50 box is a fair coin, and every later look repeats it. To get a new random answer you need a fresh, identical box.`,
      },
      {
        kind: 'faq',
        heading: 'What do the 20 identical boxes show?',
        text: `Each opening in the batch is a fresh box prepared the same way, so each is a new fair draw with the same chances. The share of Awake comes out near the chance but is rarely exact, and it is different every time you run it. A small chance is not zero: with an 8% chance you will sometimes see several Awake in a batch of 20.`,
      },
      {
        kind: 'misconception',
        heading: 'Is the cat really alive and dead at once?',
        text: `The cat is an analogy, and that is why this game carries the Analogy tag. Schrödinger described it in 1935 to show how strange it would be for something big to sit in a superposition. The maths of a single qubit is real and is what the game runs. A real cat is never in a clean superposition, because the air, the light and the box itself keep interacting with it, which is called decoherence.`,
      },
      {
        kind: 'explain',
        heading: `What does finishing Milton's Box show?`,
        text: `You have seen that the chance of an outcome is its amplitude squared, that a superposition is built with the Hadamard gate, that a sign you cannot see can still steer a result once amplitudes interfere, and that opening a box changes it. Finishing counts the game as completed for Module 2.`,
      },
    ],
  },
  bloch_runner: {
    tag: 'Accurate',
    sections: [
      {
        kind: 'explain',
        heading: 'How do I play Bloch Runner?',
        text: `Your qubit is the red arrow on the Bloch sphere, and the ghost marker is the target. Each level gives you a few gate buttons. Tap a gate to apply it and the arrow moves. Reach the ghost to clear the checkpoint. Undo removes your last move, Restart clears them all, and Hint gives a clue. You also have a move limit, which is the shortest solution plus three. Stars: par or fewer moves earns 3, one over par earns 2, more earns 1. Show the math lists the amplitudes and the Bloch coordinates. There is no timer.`,
      },
      {
        kind: 'explain',
        heading: 'What does each gate do on the Bloch sphere?',
        text: `Every gate is a rotation of the sphere. X, Y and Z are half-turns about their own axes. S is a quarter-turn and T an eighth-turn about the vertical Z axis, and S-dagger is the quarter-turn the other way. H tips the pole onto the equator and back; it is a half-turn about the axis between X and Z. Gates that turn about the vertical axis change the direction you face around the equator but not your height.`,
      },
      {
        kind: 'faq',
        heading: 'Why does a gate sometimes seem to do nothing to the arrow?',
        text: `A rotation about an axis leaves a point on that axis where it is. At the north pole, spinning about the vertical axis does not move the arrow, so Z, S and T leave |0> alone. Only the overall phase changes, and nobody can measure that. The same thing happens at the south pole.`,
      },
      {
        kind: 'faq',
        heading: 'What do the |0> and |1> percentage bars mean?',
        text: `They are the chances of getting 0 or 1 if you measured the qubit now. At the north pole it is 100% for 0, on the equator it is 50% each, and at the south pole it is 100% for 1. The bars do not show the direction around the equator, which is the phase. Two points on the equator share the same bars but are different states, which is why you sometimes need the sphere and not the bars.`,
      },
      {
        kind: 'faq',
        heading: 'What does par mean, and why can I run out of moves?',
        text: `Par is the fewest moves that solve the level, found by a search. Your move limit is par plus three, so you can wander a little but not forever. If you run out, Undo a step or Restart and try another route. Running out of moves costs nothing; it only means you have not found a short enough path yet.`,
      },
      {
        kind: 'faq',
        heading: `I'm stuck in Bloch Runner. How do I plan a path?`,
        text: `Look at the arrow and the ghost, and ask two things. Does the ghost sit at a different height, meaning a different chance of 0 or 1? Or is it at the same height but facing a different direction around the sphere? Gates like X and H usually change height, and gates like Z, S and T turn you around the vertical axis. Tap Hint if you want a clue.`,
      },
      {
        kind: 'explain',
        heading: 'What does finishing Bloch Runner show?',
        text: `Every single-qubit gate is a rotation, and you can steer a qubit to any place on the sphere by combining a few of them. The Bloch sphere is an exact picture for one qubit, so this game is accurate. It only has one qubit, so entanglement is not part of it.`,
      },
    ],
  },

  photon_escape_room: {
    tag: 'Accurate',
    sections: [
      {
        kind: 'explain',
        heading: 'How do I play the Photon Escape Room?',
        text: `A photon enters from the source on the left and leaves through the top or bottom door on the right. Between them are slots. Tap a slot to cycle what is in it: empty, a beam splitter, or in some rooms a phase shifter with settings of 0, 90, 180 and 270 degrees on the lower path. The goal list turns green as you meet each goal. Fire a photon sends one photon and shows which door clicks. The percentages on the doors are chances, and the beam brightness shows the chance on each path. Some rooms need a minimum number of beam splitters. Reset and Hint are available, and there is no timer.`,
      },
      {
        kind: 'explain',
        heading: 'What do the beam splitter and the phase shifter do?',
        text: `A beam splitter sends a photon down both paths at once, in superposition. A phase shifter delays the lower path by part of a wavelength. A second beam splitter then brings the two paths back together, and the photon's two possibilities add or cancel at each door depending on the phase between them. That adding and cancelling is interference.`,
      },
      {
        kind: 'faq',
        heading: 'Why do two beam splitters not just give 25% for each door?',
        text: `Probabilities only multiply when the paths cannot interfere. Here the two paths come back together at the second splitter, so their amplitudes combine and can add or cancel. The result can be 100% at one door and 0% at the other. Change the phase and the numbers change smoothly, so you can watch them.`,
      },
      {
        kind: 'faq',
        heading: 'Why does the photon click only one door when the percentages are not 100%?',
        text: `One photon is always found at just one door. The percentages are the chances, and you only see them in the clicks after firing many photons. The tally under the button counts your clicks so far. Your goals are about the chances, not about any single click.`,
      },
      {
        kind: 'faq',
        heading: 'Why can a saboteur make the dark door click?',
        text: `A blocker in one path removes the interference, because only one path is left to reach the last splitter. With a single path the photon is sent 50/50, so a door that was dark with both paths can now click. That is the idea behind the bomb test: a change in where clicks can happen reveals that something is in the path.`,
      },
      {
        kind: 'faq',
        heading: `I'm stuck in the Photon Escape Room. What can I try?`,
        text: `Change one slot at a time and watch the door percentages and the goal list. Ask whether you need a splitter in a slot at all, and what the phase does to the numbers. The percentages move smoothly, so you can tell which way to go. If a room needs a minimum number of splitters, do all of them. Tap Hint for a clue.`,
      },
      {
        kind: 'explain',
        heading: 'What does finishing the Photon Escape Room show?',
        text: `A single photon takes both paths at once, and where the paths agree the photon can exit and where they cancel the door stays dark. Interference is the tool quantum algorithms use to boost right answers. The model is the real single-photon maths, so the game is accurate.`,
      },
    ],
  },

  alice_and_bob: {
    tag: 'Simplified model',
    sections: [
      {
        kind: 'explain',
        heading: 'How do I play Alice and Bob?',
        text: `A guard asks Alice and Bob a question each, 0 or 1, and each answers 0 or 1 without talking. The door opens when their answers differ only if both were asked 1; otherwise their answers must match. Part 1: tap the buttons to set what each person says for each question and watch the table show which of the four question pairs you win. Run 100 rounds plays random questions. After flipping at least four answers you can go to Part 2, where the pair share an entangled state. There you set four measurement angles in 22.5 degree steps. You need an 80 percent win chance to open the door.`,
      },
      {
        kind: 'faq',
        heading: 'Why can I never win all four question pairs with a classical plan?',
        text: `Three of the four question pairs ask for matching answers, and one asks for different answers. If you follow the three matching rules, every answer ends up equal to every other, which breaks the fourth rule. The game checked all 16 possible plans: the best classical score is 3 of 4, which is 75 percent.`,
      },
      {
        kind: 'explain',
        heading: 'What are the angles in Part 2?',
        text: `Each angle is the direction in which that person measures their half of the entangled pair, chosen according to the question they were asked. The win chance for each question pair depends on how far apart Alice's angle and Bob's angle are. The table shows the chance for each question pair, and the total is their average.`,
      },
      {
        kind: 'faq',
        heading: 'Why does Run 100 rounds not give exactly the win chance?',
        text: `The rounds are random: random questions, and random measurement outcomes with the stated chances. A hundred rounds wobble around the true chance, a bit like a hundred coin flips giving not exactly fifty heads. More rounds would settle closer to the exact number.`,
      },
      {
        kind: 'faq',
        heading: 'Does this mean Alice and Bob are sending messages faster than light?',
        text: `No. Each person's own answers look completely random. The pattern only appears when the two lists are compared afterwards, using a normal message. Entanglement gives correlations that no shared classical plan can match, but it cannot be used to send a signal.`,
      },
      {
        kind: 'faq',
        heading: `I'm stuck in Part 2 of Alice and Bob. What can I try?`,
        text: `Change one angle at a time and watch the table and the total. The win chance for a question pair depends on the gap between the two angles used for it. Three of the question pairs want the gap small and one wants it large, so look for angles that balance the two needs. The game shows its own hint if you stay under the target.`,
      },
      {
        kind: 'explain',
        heading: 'What does finishing Alice and Bob show?',
        text: `No team using only a shared plan can beat 75 percent, and an entangled pair lets them reach about 85 percent, the best the maths allows. That is a Bell test (the CHSH game). The game is a simplified model: it uses an ideal entangled pair and lets you pick the measurement angles directly, with no noise.`,
      },
    ],
  },

  teleport_relay: {
    tag: 'Accurate',
    sections: [
      {
        kind: 'explain',
        heading: 'How do I play Teleport Relay?',
        text: `A qubit message travels along a chain: Alice, one or more repeaters, then Bob. At each hop a fresh Bell pair links the sender and the receiver. The sender measures, and the game shows the two bits they get. The receiver's qubit is now a twisted copy of the message, and you add fix gates (up to three, in order) and tap Send it on. If the red arrow lands on the ghost marker, the hop is complete. Wrong tries cost stars and there is no timer. Rule shows the answer table, which is a spoiler, and Hint gives a clue.`,
      },
      {
        kind: 'explain',
        heading: 'What does the ghost marker mean, and what is the red arrow?',
        text: `The ghost marker is the original message. The red arrow is the qubit that the receiving repeater really has right now. A hop is correct when the arrow sits exactly on the ghost, and the message then moves on to the next repeater. The percent in a wrong try says how close the two are: 100 is perfect, and 50 is no better than a coin flip.`,
      },
      {
        kind: 'faq',
        heading: 'Why does the receiver need the two bits to fix the qubit?',
        text: `The measurement can leave the receiver's qubit damaged in four possible ways: not at all, with a bit flip, with a phase flip, or with both. Without the two bits the receiver cannot tell which one happened, and their qubit looks random. The bits travel by an ordinary route, so teleportation cannot send anything faster than light.`,
      },
      {
        kind: 'faq',
        heading: 'Where does the original qubit go, and can I keep a copy?',
        text: `The sender's measurement destroys the original, so teleportation moves a qubit and does not copy it. Copying an unknown quantum state is impossible, which is the no-cloning theorem. Each hop also uses up one Bell pair.`,
      },
      {
        kind: 'faq',
        heading: 'Why do some levels list gates I do not need?',
        text: `Some panels include extra gates to tempt you. Think about what kinds of damage the measurement can cause: a bit flip, a phase flip, both, or neither. Gates that cannot undo any of those are decoys. One hop may even need no gate at all.`,
      },
      {
        kind: 'faq',
        heading: 'Does the order of the fix gates matter?',
        text: `When two fixes are needed, X then Z and Z then X differ only by an overall sign, and nobody can measure that. So either order works. For the game, what matters is which fixes you include.`,
      },
      {
        kind: 'faq',
        heading: `I'm stuck in Teleport Relay. What should I do?`,
        text: `Look at the two bits: each of them is connected to one kind of damage. Ask what each bit being 0 or 1 means, and try the level's Hint. You can also try a fix and send it: a wrong try costs a star but shows you how close you were. If you want to see the whole table, Rule shows it, but it is a spoiler.`,
      },
      {
        kind: 'explain',
        heading: 'What does finishing Teleport Relay show?',
        text: `Each hop used one Bell pair and two ordinary bits, and the qubit itself never travelled. Chains of hops like this are the idea behind a quantum network. The game follows the real protocol with fixed bits so every level plays the same way each time.`,
      },
    ],
  },

  gate_deck: {
    tag: 'Accurate',
    sections: [
      {
        kind: 'explain',
        heading: 'How do I play Gate Deck?',
        text: `Each level names a target gate that you must build. Your hand has cards: gates on a particular qubit, and CNOT cards written control to target. Tap a card to play it. Cards run left to right and each card can be used once, and you do not have to use all of them. The circuit preview shows one row per qubit, with a dot for the control and a plus-in-a-circle for the target. Below it, test inputs show a green check for every input where your circuit acts like the target. When all are green, you have built the gate. Undo, Clear and Hint are there to help, and stars reward the shortest recipe. There is no timer.`,
      },
      {
        kind: 'faq',
        heading: 'What does matching the target on each test input mean?',
        text: `A gate is defined by what it does to every input. The test inputs are each basis state plus some equal mixtures of basis states. If your circuit gives the same result as the target on all of them, it is the same gate. A red cross tells you which input still behaves differently, which is a clue about what is missing.`,
      },
      {
        kind: 'faq',
        heading: 'What does up to a global phase mean?',
        text: `Multiplying a whole state by a constant like -1 or i changes nothing you can measure. So two circuits that differ only by such a factor count as the same gate, and for some gates two different card orders are both accepted.`,
      },
      {
        kind: 'faq',
        heading: 'How do I read a CNOT card?',
        text: `A card such as CNOT 0 to 1 means qubit 0 is the control and qubit 1 is the target. The target is flipped only when the control is 1. In the preview, q0 is the top row. A CNOT in the opposite direction is a different card, and sandwiching a CNOT with Hadamards on both qubits changes which one acts as the control.`,
      },
      {
        kind: 'faq',
        heading: 'Why does wrapping a gate in Hadamards change what it does?',
        text: `H changes the point of view: it swaps the Z-axis view of the qubit with the X-axis view. A gate applied in the new view looks different from the old one. For example, a bit flip seen through H becomes a phase flip, and the other way round. The sandwich H, gate, H is how many gates are built from others.`,
      },
      {
        kind: 'faq',
        heading: `I'm stuck in Gate Deck. How do I find the recipe?`,
        text: `Play a card and look at which test inputs turn green or stay red. Ask what your cards do on their own and what the target does, and which input is still wrong. The order of the cards matters, so try rearranging with Undo. The Hint gives the idea for the level. Cards you do not need are decoys.`,
      },
      {
        kind: 'explain',
        heading: 'What does finishing Gate Deck show?',
        text: `Real quantum hardware offers only a few native gates, and everything else is a recipe built from them. You built Z, X, S, Y, a reversed CNOT, a SWAP and a CZ from other gates. The game is accurate: it checks your circuit against the target with the real maths.`,
      },
    ],
  },

  oracle_detective: {
    tag: 'Accurate',
    sections: [
      {
        kind: 'explain',
        heading: 'How do I play Oracle Detective?',
        text: `A hidden function is either constant, with every locker showing the same light, or balanced, with exactly half on and half off. Tap a locker to open it and see its light. Each opened locker counts as one question. In later cases a quantum informant can be asked once, and that also counts as one question. When you are ready, press Constant or Balanced. Stars: a wrong verdict earns none, a lucky guess one, a proven verdict with more than two questions two, and a proven verdict with two or fewer three. New file replays the case with a different function. There is no timer.`,
      },
      {
        kind: 'faq',
        heading: 'What counts as proof that a function is balanced or constant?',
        text: `Two lockers that disagree prove the function is balanced, because a constant function never disagrees. To prove it constant you must open more than half of the lockers and find them all the same, because a balanced function has exactly half of each value. The panel What you can prove so far tells you where you stand.`,
      },
      {
        kind: 'faq',
        heading: 'Why can I not be sure after a few lockers all agree?',
        text: `A balanced function could still show the same value in its first few lockers by luck. Only when you have opened more than half of them is it impossible for a balanced function to show all the same. Until then, agreement is a hint and not a proof.`,
      },
      {
        kind: 'faq',
        heading: 'How does the quantum informant answer with only one question?',
        text: `She puts all the locker numbers into superposition, asks the oracle once, and applies Hadamards again. Each locker's answer becomes a plus or minus sign, and the signs interfere. If every locker is the same, everything lands on the all-zeros reading. If half are on, the signs cancel exactly and all zeros never comes up. This is the Deutsch-Jozsa algorithm.`,
      },
      {
        kind: 'faq',
        heading: 'What does the readout from the informant mean?',
        text: `It is the result of measuring the input qubits, written as a string of 0s and 1s. All zeros means the function is constant. Anything else means it is balanced. In the game the informant is always right, because the simulation has no noise.`,
      },
      {
        kind: 'faq',
        heading: `I'm stuck in Oracle Detective. What should I do?`,
        text: `Look at What you can prove so far and ask what evidence would settle the question. Each locker and each informant question costs one question, and fewer questions earn more stars. If the informant is out of town, you have to use lockers. If she is in town, think about which is cheaper. The Hint reminds you what each question costs.`,
      },
      {
        kind: 'explain',
        heading: 'What does finishing Oracle Detective show?',
        text: `Classically you may have to open more than half of the lockers to be sure, and the quantum informant needed one question. It is a small, honest example of interference beating brute force, though nobody needs this exact problem solved. The game is accurate because the informant runs the real Deutsch-Jozsa circuit.`,
      },
    ],
  },

  qubit_surgeon: {
    tag: 'Simplified model',
    sections: [
      {
        kind: 'explain',
        heading: 'How do I play Qubit Surgeon?',
        text: `Each patient is one qubit spread over three data qubits, Q1, Q2 and Q3. Noise may have flipped some of them. A probe compares two qubits and tells you whether they agree or differ, and it never reads their values. Use probes, decide which qubit to flip back, and tap Flip Q1, Flip Q2, Flip Q3, or Leave alone. A ward is a set of patients, and stars reward the method: three stars need every fix proven by probes with no spare probes, two need no wrong fixes, and one allows a single wrong fix. Patients nobody could save do not count against you. There is no timer.`,
      },
      {
        kind: 'faq',
        heading: 'Why can I not just look at the qubits?',
        text: `Reading a data qubit measures it, which forces it to be a plain 0 or 1 and destroys the superposition that carried the encoded information. That is why probes only compare qubits. The Look directly button shows what happens: the patient is lost.`,
      },
      {
        kind: 'faq',
        heading: 'What does a probe tell me?',
        text: `A probe compares two qubits and says whether they agree or differ, without saying what either one is. A flipped qubit disagrees with its neighbours, so different probes point at different qubits. Think about which pattern of agree and differ each single flipped qubit would produce.`,
      },
      {
        kind: 'faq',
        heading: 'Why are two probes enough?',
        text: `Two different probes already give four possible patterns, which is enough to tell apart no flip, and a flip of each of the three qubits. The third probe on the tray is just the other two combined, so it adds nothing. Extra probes only cost time and stars.`,
      },
      {
        kind: 'faq',
        heading: 'Why should I leave a healthy patient alone?',
        text: `If every comparison agrees, no single qubit flipped. Flipping a qubit anyway would create an error in a healthy patient. Leave alone is a real option and sometimes the right answer.`,
      },
      {
        kind: 'faq',
        heading: 'Why can two flips at once fool the code?',
        text: `The code works like a vote: it assumes the one odd qubit out is the flipped one. When two qubits flip, the odd one out is actually the healthy one, so the fix flips the wrong qubit and the whole encoded qubit ends up flipped. The code can undo one flip, not two. That is why protection is not perfect: the chance of losing the qubit falls from p to about 3p squared minus 2p cubed.`,
      },
      {
        kind: 'faq',
        heading: `I'm stuck in Qubit Surgeon. What should I try?`,
        text: `Use a probe and read the answer, then use a second, different probe. Look at the panel What you can prove so far, which tells you when the evidence is enough. Ask what each flipped qubit would have done to the probes. The Hint explains the pattern if you want it.`,
      },
      {
        kind: 'explain',
        heading: 'What does finishing Qubit Surgeon show?',
        text: `Errors can be found without ever reading the data, just by comparing qubits. Real machines use bigger codes that also catch phase flips, and they need many physical qubits for one reliable logical qubit. This game is a simplified model: it protects only against bit flips and keeps the noise to a few simple cases. The Noise Lab shows how the failure rate falls over thousands of runs.`,
      },
    ],
  },
};

/** Ids of the games that have help. */
export const GAME_HELP_IDS = Object.keys(GAME_HELP);
