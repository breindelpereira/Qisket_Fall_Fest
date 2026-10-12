---
id: math_lesson_5
tag: Accurate
---

## Explain: Grover's algorithm as geometry
The search is easiest to see in two dimensions. All the action takes place in a plane with two directions: the marked item, and the equal mix of all the other items. The starting state, an equal superposition of every item, lies almost along the second direction, tilted towards the marked item by a small angle θ. With N items and one marked, sin θ = 1/√N.

## Explain: Two reflections make a rotation
One Grover round has two steps. The oracle flips the sign of the marked amplitude, which reflects the state about the "other items" direction. The diffusion operator then reflects every amplitude about the average, which reflects the state about the starting state. Two reflections in a row turn the state by 2θ, towards the marked item.

## Explain: The success chance
After k rounds the state is at an angle (2k + 1)θ from the "other items" direction. The chance of finding the marked item is sin²((2k + 1)θ). It is largest when (2k + 1)θ is close to 90 degrees, which happens at about k = (π/4)√N rounds.

## Example: N = 4
sin θ = 1/2, so θ = 30 degrees. After one round the angle is 3θ = 90 degrees, so the chance is 100%. One round finds the item for certain.

## Example: N = 16
sin θ = 1/4, so θ is about 14.5 degrees. After 3 rounds the angle is 7θ, about 101 degrees, and the chance is about 96%. The formula (π/4)√16 is about 3.1, which agrees with 3 rounds.

## Explain: Overshooting and the speed-up
After the best round the state keeps rotating past 90 degrees, and the chance of success falls again, so the algorithm must stop at the right time. The number of rounds grows like the square root of N, while a classical search needs about N/2 guesses on average. That is a quadratic speed-up, not an exponential one.

## FAQ: Why does Grover use the square root of N?
Each round rotates the state by a fixed angle of about 2/√N, and a rotation of about 90 degrees is needed to reach the marked item. The number of rounds is therefore proportional to √N.

## FAQ: What happens with more than one marked item?
The starting angle is larger, with sin θ equal to the square root of M over N for M marked items, so each round makes more progress and fewer rounds are needed.

## FAQ: Is Grover's algorithm exponentially faster?
No. The speed-up is quadratic, and it needs a way to check an answer inside the quantum circuit. For small lists a classical search is just as good.

## Misconception: More rounds always improve the chance
They do not. The state is rotating, so after the best round the chance of finding the answer decreases again.

## Glossary: Key words
Oracle: the part that marks the answer by flipping its sign. Diffusion: reflection of all amplitudes about their average. Reflection: a flip about a line. Rotation: two reflections in a row. Iteration: one Grover round. Quadratic speed-up: needing the square root of the classical number of steps.

## FAQ: Where does the speed-up in Grover's algorithm come from, according to the video?
Video: RQWpF2Gb-gU 31:27-34:01
The presenter argues it is not "trying everything in parallel". The first step, which makes the equal-balance state, reveals nothing about the key by itself. His one-word answer is Pythagoras: allowing diagonal directions in the state space gives a shortcut, like walking across a square diagonally instead of along its edges, and the state vector follows a quarter-circle arc towards the answer. He says to take the analogy with a grain of salt.

## Explain: Why "parallel" is the wrong summary
Video: RQWpF2Gb-gU 31:27-32:12
After the walk-through, the video says it is hard to point at one step that creates the speed-up. It is tempting to blame the first operation, applied to the equal-balance state, as a computation on every input at once. But by itself that step gives no information about where the key is. The presenter leaves open whether to call it parallel processing, or to say the balance state is a new kind of input and the function is still applied to one input at a time.

## Explain: The Pythagoras picture of the shortcut
Video: RQWpF2Gb-gU 32:12-34:01
To get across a unit square when you may only move along the x and y directions, you walk two units, but diagonally it is the square root of two. In n dimensions, walking along edges to the opposite corner of a cube takes n units, but going diagonally takes the square root of n. In quantum mechanics different observable outcomes are perpendicular directions in the state space, so a classical computer is restricted to the pure coordinate directions, while a quantum one also has all the diagonal directions available. Following the state vector in Grover's algorithm, it slowly walks along a quarter-circle arc, a path a classical state could not take, and that gives a square-root-sized shortcut. The presenter warns that runtime is not literally a distance in this space.
