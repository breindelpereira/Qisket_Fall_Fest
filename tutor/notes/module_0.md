---
id: module_0
---

## Explain: What a quantum computer is good for
A quantum computer is a specialist machine. It is built to help with a short list of problem types, not to run everything faster.

The best-understood uses are: simulating quantum systems, such as molecules for drug discovery or new battery materials, because nature itself is quantum; some search, optimisation and sampling problems, where the speed-up is often modest or still being studied; and a few cryptography tasks. The famous example is Shor's algorithm, which could break the public-key encryption used on the web today, but only on a very large, error-corrected machine that does not exist yet.

For most of what a computer does, such as browsing, spreadsheets, video and games, a classical computer is better, cheaper and always will be.

## Explain: Why it is not just a faster laptop
A classical computer follows one path through a calculation, step by step. A quantum computer does something different: it keeps a state described by amplitudes, shapes those amplitudes with gates, and uses interference so that wrong answers cancel out and right answers get stronger. Then it measures once and reads out one result.

That recipe only helps when a problem has the right structure for interference to exploit. That is why quantum computers give big speed-ups on a few problems and none on most.

## Example: A spreadsheet versus a molecule
Adding up a column of numbers in a spreadsheet gains nothing from quantum tricks: the answer is simple and a classical chip does it in microseconds.

Working out how a caffeine molecule behaves is different. The molecule's electrons follow quantum rules, and the number of possibilities to track grows extremely fast as the molecule gets bigger. A classical computer struggles to keep up, while a quantum computer follows the same rules natively. That is the kind of job people hope quantum computers will do well.

## FAQ: Who is Dr. Milton Schrody?
Dr. Milton Schrody, called Milton, is the cat who is the tutor and mascot of Qisket. His name is a joke on Schrödinger's cat. He is a cartoon character, not a physics claim: nobody has ever put a real cat in a quantum superposition. In the game Milton's Box he stands for one qubit, who is Awake or Asleep when the box is opened.

## FAQ: Will a quantum computer replace my laptop or phone?
No. Quantum computers are not meant to replace everyday computers. They are specialised machines for certain problems, and they currently need extreme conditions such as very low temperatures or vacuum chambers. Think of one as a special tool that sits next to normal computers, not instead of them.

## FAQ: Does a quantum computer try every answer at once?
No, this is the most common mix-up. A quantum computer does not just try all the answers in parallel and pick the right one. If it did, measuring would give a random answer out of all of them. The real power comes from interference: the algorithm arranges the amplitudes so that wrong answers cancel and the right answer is amplified before you measure. You will see this in Modules 4 and 6.

## FAQ: Can a quantum computer break all encryption?
Not all of it, and not today. Shor's algorithm would break the public-key schemes (RSA and elliptic curves) that protect many websites, but it needs a large error-corrected quantum computer, far beyond today's machines. Everyday symmetric encryption such as AES is only weakened a little by quantum search, and can be protected by using longer keys. Researchers are also building "post-quantum" cryptography that quantum computers are not known to break.

## FAQ: Are quantum computers real, or is it all hype?
They are real: there are working machines with tens to over a thousand physical qubits. But today's qubits are noisy and the machines are small, so clear, practical advantage over the best classical methods is still being demonstrated for useful problems. Be sceptical of headlines that promise instant revolutions; the field is promising but young.

## Glossary: Key words from the orientation
A qubit is the quantum version of a bit. Superposition means a qubit's state is described by amplitudes for both 0 and 1. Entanglement is a link between qubits that cannot be described one at a time. Interference is the adding and cancelling of amplitudes, like waves. Measurement is reading out a result, which gives a plain 0 or 1. Quantum advantage means a quantum computer solving a task better than the best classical method.

## Misconception: A quantum computer checks every answer at once
It sounds right and appears in many headlines, but it is not how quantum computers work. They do not read out all the answers. The gain comes from using interference to boost the right answer and cancel the wrong ones, followed by one measurement. If you remember one thing from this course, remember that.
