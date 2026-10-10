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
