---
id: math_week_0
tag: Accurate
---

## Explain: The three tools
To follow the maths of one qubit you need only three things. A vector is a list of numbers, and a quantum state is written as a column vector. A matrix is a grid of numbers that transforms a vector, and a quantum gate is a matrix. A complex number has two parts, a real part and an imaginary part, and it lets an amplitude carry both a size and a phase.

## Explain: Multiplying a matrix by a vector
Take each row of the matrix, multiply it entry by entry with the column, and add. The first row gives the top number of the result, the second row gives the next. For the matrix with rows (1, 2) and (3, 4) times the column (1, 1), the top entry is 1 times 1 plus 2 times 1, which is 3, and the bottom entry is 3 times 1 plus 4 times 1, which is 7. The result is the column (3, 7).

## Explain: Complex numbers
A complex number a + bi has a real part a and an imaginary part b, where i is defined by i squared equals minus 1. Multiply them using the normal rules and replace i squared by minus 1. For example (1 + i)(1 − i) = 1 − i + i − i² = 2. The size, or modulus, of a + bi is the square root of a² + b². So the size of 3 + 4i is 5. The conjugate of a + bi is a − bi, and a number times its conjugate equals its size squared.

## Example: The number you will see everywhere
1 divided by the square root of 2 is about 0.707. Its square is exactly one half. An equal superposition of two outcomes has amplitudes of this size, because the two squares must add up to 1.

## FAQ: Why do quantum states use complex numbers?
Amplitudes need a size, which gives the chance of an outcome, and a phase, which controls how amplitudes add and cancel in interference. A complex number holds both in one object. Real numbers alone cannot describe everything that quantum gates do.

## FAQ: Are imaginary numbers real?
The name is historical. Complex numbers are well-defined numbers with two parts, and they are used throughout physics and engineering. In quantum computing they are a necessary part of the description.

## FAQ: How do I add two vectors?
Add them entry by entry: the top entries together and the bottom entries together. To scale a vector, multiply every entry by the same number.

## Misconception: i means the amplitude is not real
The amplitude's phase is real physics: it changes how the state interferes with others. The size of i is 1, so it does not change a probability on its own, but it does change what later gates do.

## Glossary: Key words
Vector: a list of numbers. Column vector: a vector written top to bottom. Matrix: a grid of numbers. Complex number: a number with a real and an imaginary part. Imaginary unit i: the number whose square is minus 1. Modulus: the size of a complex number. Conjugate: the same number with the sign of the imaginary part flipped.
