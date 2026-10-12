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

## FAQ: Can I build a quantum computer at home?
Not a real one. Quantum computers need very specialised equipment: ultra-high vacuum chambers and lasers for atoms and ions, or refrigerators that reach millikelvin temperatures for superconducting circuits, together with precise control electronics and years of research. That is why they are built in labs and companies, not in a garage. What you can do at home is learn the ideas and try them on a simulator. This app runs small quantum circuits on an ordinary phone, and free open-source software such as Qiskit lets you write circuits and run them on a simulator on your own computer. A laptop can simulate a few dozen qubits at most, because the memory needed doubles with every qubit. Some companies also let people run small circuits on their real machines over the internet, and you should check their current terms.

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

## FAQ: What does the Map of Quantum Computing video cover?
Video: -UlxHPIEVqA 0:00-33:28
It is a long overview from Domain of Science. First it explains the three ideas behind every quantum computer (superposition, entanglement and interference). Then it covers what quantum algorithms are for, and why simulating nature is the application the presenter likes best. Then it compares the different models of quantum computing, and ends with the many physical ways of building qubits and the obstacles they all share: noise, decoherence and scale. The presenter's own conclusion is that nobody knows yet which hardware approach will end up on top.

## Explain: The video's three ideas: superposition, entanglement, interference
Video: -UlxHPIEVqA 0:00-2:45
The presenter says that to understand a quantum computer you need three things. Superposition comes first. A classical bit is a switch that is 0 or 1 and gives you exactly what it holds when you read it. A qubit is pictured as an arrow in 3D space: up means 0, down means 1, and any other direction is a superposition of the two. When you measure, you still only get 0 or 1, but the direction of the arrow sets the odds. Pointing mostly up makes 0 likely, mostly down makes 1 likely, and on the equator it is 50/50. This arrow picture is the Bloch sphere from Module 1.

## Explain: Entanglement and why n qubits give 2^n possibilities
Video: -UlxHPIEVqA 2:45-4:23
In a classical computer each bit is independent. Entangled qubits are not: they become parts of one shared state, so you describe the group with one set of probabilities over all the outcomes (00, 01, 10 and 11 for two qubits) instead of separate odds for each. Changing one qubit then changes the odds for the whole system. The video points out that the number of outcomes doubles with every qubit you add (2, 4, 8 and so on, so 2^n for n qubits). It calls this the core difference: a classical machine holds one state at a time, a quantum one can hold a superposition over all of them.

## Explain: Interference is how a quantum algorithm gets its answer
Video: -UlxHPIEVqA 4:23-6:30
The video says the Bloch sphere is only a convenient picture. What really describes a qubit is a wavefunction, and the wavefunctions of the qubits add together, like ripples on water: they can reinforce (constructive interference) or cancel (destructive interference). The final wavefunction sets the probability of each outcome. A useful algorithm is a recipe that steers constructive interference onto the correct answer and destructive interference onto wrong ones, so that the one result you get when you measure is very likely the right one. Having a superposition of millions of states does not help by itself, because a measurement returns only one.

## Explain: Why factoring made people take quantum computing seriously
Video: -UlxHPIEVqA 6:30-10:25
Multiplying two big numbers is easy, but working backwards (finding the factors of a big number) has no known fast classical method, and a lot of internet encryption relies on that. In 1994 Peter Shor published a fast quantum method for factoring, the first practical application with serious security consequences, and that is when many people began to take quantum computers seriously. The video explains it through complexity: the best classical method scales exponentially as the number gets longer, while the quantum one scales polynomially. It then calms the worry: breaking real encryption would need about a million qubits (the video's estimate) and the best machines then had around a hundred, and people are already working on post-quantum encryption and on quantum cryptography.

## Explain: Classical and quantum machines compute the same things, at different cost
Video: -UlxHPIEVqA 10:25-12:36
The presenter is careful not to oversell. A clever classical way of factoring is unlikely but not ruled out, and anything that is impossible for a classical computer (such as the halting problem) is impossible for a quantum one too. In terms of what can be computed at all, the two kinds of machine are equivalent, and a classical computer can simulate a quantum one. The catch is cost. Simulating a quantum system on a classical machine gets exponentially harder with every extra qubit, while a quantum computer is already a quantum system, which is why the video calls simulation its favourite application.

## Explain: What quantum simulation could be used for, and a warning about hype
Video: -UlxHPIEVqA 12:36-15:00
Simulating chemistry or materials with only about 30 particles already strains the best supercomputers. The video lists hoped-for payoffs: understanding why some materials superconduct, a more energy-efficient way to make fertiliser (fertiliser production is around 2% of global carbon emissions, the video says), better batteries and solar panels, new drugs and aerospace materials, all tested inside a computer before anyone builds them. Other proposed uses are optimisation, machine learning, finance, weather and security. The presenter adds two cautions: these are potential uses, since no quantum computer yet beats an ordinary one on a practical problem, and many claims come from people raising money, so treat them with care.

## Explain: The circuit (gate) model, and why the video mentions Qiskit
Video: -UlxHPIEVqA 15:00-19:23
The video separates two layers: the model of computing (how you manipulate the qubits) and the physical qubit you build it from. The most common model is the circuit or gate model: a set of qubits, a sequence of gates that rotate the arrows without measuring, and a measurement at the end. A classical computer can be built from just bits and NOR gates, and the quantum circuit model is the same kind of idea. The video is sponsored by Qiskit, which is free and open source, and the presenter states plainly that Qiskit is funded by IBM and that they used to work for another quantum company, so you know where the speaker is coming from.

## Explain: The other models of quantum computing the video mentions
Video: -UlxHPIEVqA 19:23-24:15
Measurement-based (one-way) computing starts from a large entangled state and measures qubits one at a time; it has been shown equivalent to the circuit model. Adiabatic computing encodes the problem as an energy landscape whose lowest point is the answer, and changes the landscape slowly so the system stays in the lowest state; it is also equivalent to the circuit model. A related but less general scheme keeps the energy-landscape idea and is used for optimisation problems. The most theoretical model builds its qubits from exotic quasi-particles that are expected to be protected from noise; the video notes that it is still debated whether they have really been observed.

## Explain: Why building one is hard: decoherence, error correction and scale
Video: -UlxHPIEVqA 24:15-27:15
A qubit only needs two states, such as spin up and spin down, but every design shares the same problems. Decoherence is information leaking into the environment because your qubits entangle with whatever is nearby. Noise from heat, radiation and stray particles pushes them off course, and it gets worse as you add qubits. Quantum error correction spreads one reliable qubit over many physical ones, and the video quotes a range of 100 to 1000 physical qubits per fault-tolerant qubit. Scalability is the other obstacle: every qubit needs its own control and readout wiring, which becomes a huge engineering task. The video says that whether big working machines are possible is still an open question.

## Explain: The physical approaches the video surveys
Video: -UlxHPIEVqA 27:15-31:49
The video walks through how a qubit can be made. Superconducting circuits are currently the most popular. Silicon and other semiconductor chips can hold a qubit in the spin or charge of electrons. Photonic computers use particles of light steered through chips. Trapped ions are charged atoms held by electromagnetic fields and controlled with lasers or microwaves. Colour-centre qubits sit inside diamond or silicon carbide. Neutral atoms are held in a lattice made of laser beams. The video adds that other designs exist but are less developed. Each of these gets its own lesson in Part 2 (Hardware).

## Explain: The video's conclusion: no clear front-runner yet
Video: -UlxHPIEVqA 31:49-33:28
After the tour, the presenter's point is that nobody knows yet which approach will come out on top in the long run. The video does not cover the companies and their roadmaps, which it says would come in a follow-up, and then ends with credits.
