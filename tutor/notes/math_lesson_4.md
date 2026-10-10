---
id: math_lesson_4
tag: Accurate
---

## Explain: Measurement and the Born rule
When you measure, the chance of each result is the squared size of that result's amplitude. This is the Born rule. Phase is the part of an amplitude that squaring throws away, so phase never shows up in a single measurement. It matters when amplitudes are added together before squaring.

## Explain: The phase gate
A phase of φ multiplies the |1⟩ amplitude by e^(iφ) and leaves the |0⟩ amplitude alone. It is the matrix with rows (1, 0) and (0, e^(iφ)). Setting φ = π gives the Z gate, since e^(iπ) is −1, and φ = π/2 gives the S gate, since e^(iπ/2) is i.

## Example: H, then a phase, then H
Start with |0⟩. After H the state is (1/√2) times (1, 1). After the phase gate it is (1/√2) times (1, e^(iφ)). After the second H it is one half times (1 + e^(iφ), 1 − e^(iφ)). So the chance of measuring 0 is the squared size of 1 + e^(iφ) divided by 4, which is cos²(φ/2), and the chance of measuring 1 is sin²(φ/2).

## Explain: Three special cases
At φ = 0 the state is (1, 0): the result is always 0. At φ = π the state is (0, 1): the result is always 1. At φ = π/2 the two chances are both 50%. This is exactly the Mach-Zehnder interferometer: the first H is the first beam splitter, the phase gate is the phase shifter, and the second H is the second beam splitter.

## Explain: Why it is interference
The result 0 gets two contributions that add: 1 from one path and e^(iφ) from the other. When they point the same way they reinforce. When they point in opposite directions, as at φ = π, they cancel exactly, and that detector goes dark. The cancelling happens in the amplitudes, before squaring.

## FAQ: Why do probabilities not simply add?
Because in quantum mechanics you add amplitudes first and square afterwards. Amplitudes can be negative or complex, so adding them can cancel. Probabilities are never negative, so adding probabilities can never give zero.

## FAQ: What is global phase?
Multiplying the whole state by a number of size 1, such as −1 or i, changes no probability, now or after any later gate. So states that differ only by a global phase are the same physical state.

## FAQ: How is relative phase different?
A relative phase is the difference between the phases of two amplitudes, for example |+⟩ versus |−⟩. It cannot be removed, and it changes what gates like H do.

## Misconception: Phase has no physical effect
Phase cannot be seen in a single measurement in the 0 and 1 basis, but it has strong physical effects through interference, as the Mach-Zehnder interferometer shows.

## Glossary: Key words
Born rule: probability is squared size. Phase: the angle part of a complex amplitude. Relative phase: the phase difference between two amplitudes. Global phase: a common factor that has no effect. Interference: amplitudes adding or cancelling. Destructive: when amplitudes cancel.
