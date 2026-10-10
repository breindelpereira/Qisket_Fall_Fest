# Parts 2 and 3: build plan

This is the working plan for the three biggest pieces left in Qisket. It is written so a teammate can pick up one piece without asking anyone, and so it is clear when a piece is finished.

| Workstream | What | Size | Needs |
| --- | --- | --- | --- |
| **A** | Tutor notes for Part 2 (hardware) and Part 3 (maths) | ~15 notes files | Writing, no code. Good first job. |
| **B** | Part 2 games and labs: 9 games and 9 labs | ~25 to 30 person-days | Code, physics checking, sourced data |
| **C** | Part 3 practice activities: an answer checker and problem sets | ~10 to 12 person-days | Code, writing, maths checking |

Read "Ground rules" once, then jump to your workstream.

---

## 0. Where we are today

**Part 1 is complete and playable.** Eleven games, ten labs, quizzes, videos, the AI tutor (which also knows which game or lab is open and what part of a lesson the learner asks about).

**Part 2 has lessons and quizzes, but no activities.** Every hardware module lists a game and a lab that are not built yet (they show as "Coming soon"). The lessons are short: about three labelled points each.

| Module | Lesson | Game (planned) | Lab (planned) |
| --- | --- | --- | --- |
| hw_module_0 | What makes a good qubit? | Coherence Race | Qubit Metrics Lab |
| hw_module_1 | Superconducting qubits | Cool Down | Transmon Lab |
| hw_module_2 | Trapped ions | Ion Chain Conductor | Topology Compiler |
| hw_module_3 | Neutral atoms | Tweezer Shuffle | Rydberg Blockade Lab |
| hw_module_4 | Photonic qubits | Photon Factory | Loss Budget Lab |
| hw_module_5 | Silicon spin qubits | Dot Tuner | Exchange-Coupling Lab |
| hw_module_6 | Quantum annealing | Valley Roll | Annealing Lab |
| hw_module_7 | Frontier ideas | none (Experimental/Contested) | none |
| hw_module_8_9 | Physical to logical, capstone | Logical Qubit Builder, Quantum Architect | Overhead Calculator, Comparison Dashboard |

**Part 3 has lessons and one quiz, but no practice.** Six lessons (a primer and five lessons), each with two or three short points and equations. There is nothing to *do* yet. Several lessons are very thin (Lesson 2 shows only the X and H matrices).

**Tutor notes:** hand-written notes exist for Part 1 (`tutor/notes/module_0.md` to `module_7.md`). Parts 2 and 3 use only the lesson text, so answers there are shallow.

### What you can reuse

| Need | Already there |
| --- | --- |
| A pure maths module with tests | `src/core/labs/*.ts`, `src/core/games/*.ts` (see `errorCorrection.ts` for a good example) |
| A game or lab screen | `components/shared/Arcade.tsx`, `arcadeTheme.ts`, `components/simulations/labKit.tsx` (slider, bar chart with a prediction marker, maths box) |
| State-vector engine | `src/core/circuit/` (up to a few qubits) |
| Optical (two-path) engine | `src/core/optical/interferometer.ts` |
| Honesty tag badge | `components/shared/HonestyTag.tsx` |
| Tutor help for an activity | `src/content/gameHelp.ts`, `labHelp.ts`, plus `useActivityReport` (`src/hooks/useActivityReport.ts`) |
| Progress, quizzes, flow | `ProgressStore`, `core/learn/*` (already handle Part 2 and 3) |

There is **no stabilizer engine** and none is needed: error-correction demos use the state-vector engine (see `core/labs/errorCorrection.ts`). Most hardware labs need no quantum engine at all, only a small formula module.

---

## 1. Ground rules (apply to everything below)

1. **Honest by default.** Every activity shows an honesty tag (`Analogy`, `Simplified model`, `Accurate`, `Experimental/Contested`). Hardware models are almost all `Simplified model`: say so in the screen's "honest note", and say what is left out.
2. **Every number has a source and a date.** Qubit counts, fidelities, coherence times and temperatures change quickly. Put them in one data file with `source`, `url` and `asOf` (see B0). Game parameters that are *illustrative* must be labelled illustrative, not presented as facts. No vendor marketing claims as facts.
3. **Physics is checked by a second person.** We found real errors in finished games (a wrong "H forces Tails", a probability shown but never used). Whoever writes an activity asks someone else to read the explanation text against the code before merging.
4. **No timers without an untimed mode.** Prefer puzzles with a move or resource limit. Colour is never the only signal. Every control is at least 44 by 44 px (the audit snippet in section 6 finds offenders).
5. **Logic lives outside the component.** Rules and formulas go in `src/core/...` as pure TypeScript with tests in `tests/`. The component only draws and wires.
6. **Tests encode the physics, so do not edit a test to make it pass.** Fix the code. If the *decision* changes (like the quiz pass mark), say so in the commit.
7. **The tutor must know about it.** An activity is not finished until it has help text (`gameHelp.ts` or `labHelp.ts`), calls `useActivityReport`, and `npm run tutor:index` has been run.
8. **Never put the solution of a level in the help text or the report.** The tutor is told to nudge, which only works if it does not hold the answer.

### Definition of done (one activity)

- [ ] Core module in `src/core/...` with tests, including at least one "textbook" check and one "the player cannot win by doing nothing" check
- [ ] Component using the shared frame, with the honesty tag and an honest note
- [ ] Wired in `src/App.tsx` (`GAMES` or `SIMS`), id matches `src/content/activities.ts`
- [ ] The lesson's activity link and the concept's `relatedGames` / `relatedSims` agree (tests enforce this)
- [ ] Help text written, `useActivityReport` added, `npm run tutor:index` run
- [ ] Added to the lists in `tests/flow.test.ts` and `tests/start.test.ts`
- [ ] 44 px audit clean on a phone-sized screen; works with no sound; no colour-only signals
- [ ] Physics text reviewed by a second person
- [ ] `npm test`, `npx tsc -b`, `npm run lint`, `npm run build`, `npm run check:no-keys` all pass
- [ ] Looked at in the browser at 375 px width

---

## 2. Workstream A: tutor notes for Parts 2 and 3

**Goal:** the AI tutor answers hardware and maths questions as well as it answers Part 1 questions.

**Why it matters:** these notes are the only source the tutor may answer from. Without them it quotes three short bullet points.

**Who:** anyone who can read the lesson and write clearly. No coding. This is the best job for a teammate who is not building games.

### How (full format in `tutor/README.md`)

1. Pick a lesson id from the table below.
2. Create `tutor/notes/<lessonId>.md`. Copy `tutor/notes/module_2.md` for the layout.
3. Write 5 to 8 sections: `Explain`, `Example`, `FAQ` (the heading is the question a learner would type), `Glossary`, `Misconception`.
4. Run `npm run tutor:index` (it tells you what is wrong) and `npm test`.
5. Add 1 or 2 questions for the lesson to `tutor/eval-questions.json`.
6. Have someone check every number and claim.

### What each file must cover

| Lesson | Cover at least | Watch out for |
| --- | --- | --- |
| hw_module_0 | T1 vs T2, what "coherence budget" means, gate time vs fidelity, why both matter, worked depth-budget example | Do not state typical numbers without a date and source |
| hw_module_1 | Transmon, why millikelvin, dilution refrigerator, microwave control, why gates are fast but noise is high | The cryogenics-as-bottleneck claim: keep it as "one of the scaling challenges" |
| hw_module_2 | Ions in a trap, lasers, why all-to-all within a chain, why slower gates, shuttling and linking traps | Connectivity is within one chain, not across traps |
| hw_module_3 | Optical tweezers, Rydberg states, blockade, big arrays, control at scale | Blockade is how entangling gates are built, not a "qubit property" |
| hw_module_4 | Photons in waveguides, loss, probabilistic gates, detectors need cooling | Do not say photonics needs no cooling at all |
| hw_module_5 | Electron spin in a quantum dot, silicon fabs, tuning problem | Scaling potential is not scaling achieved |
| hw_module_6 | Annealing is not gate-model, energy landscape, what it is good at, "still debated" | Never say annealers are faster than classical in general |
| hw_module_7 | Topological, cat qubits, networked machines | Keep every claim hedged (Experimental/Contested) |
| hw_module_8_9 | Physical vs logical, surface code idea, overhead, trade-off capstone | Distinguish code distance from number of qubits |
| math_week_0 | Vectors, matrices, complex numbers: what and why | Keep it gentle: the learner may be a beginner |
| math_lesson_1 | State vectors, bra-ket, normalisation | Say what the symbols mean before using them |
| math_lesson_2 | Gates as matrices, unitarity, X, H, Z, S, T | Matrix times column vector, order of multiplication |
| math_lesson_3 | Tensor product, 4-element vector, CNOT as 4x4, qubit ordering | State the ordering convention the app uses (q0 is the rightmost bit) |
| math_lesson_4 | Born rule, phase, H·Phase·H for interference | Phase is invisible until a gate turns it into probability |
| math_lesson_5 | Grover as two reflections, angle theta, iterations about pi/4 times root N | The speed-up is quadratic, not exponential |

### Done when

- [ ] 15 notes files exist (`hw_module_0` to `hw_module_8_9` = 9 files, `math_week_0` and `math_lesson_1` to `5` = 6 files; `hw_module_7` can be shorter)
- [ ] `npm run tutor:index` reports no problems and the index test passes
- [ ] At least 10 new questions in `tutor/eval-questions.json` (6 hardware, 4 maths), including one out-of-scope and one "comes later" question per part
- [ ] `TUTOR_URL=<function address> npm run tutor:eval` passes (needs the deployed function)
- [ ] Every figure has a date, every claim was read by a second person

**Effort:** about 1 to 1.5 hours per file, so roughly 2 days for one person. It can run in parallel with everything else.

---

## 3. Workstream B: Part 2 games and labs

### B0. Foundation (do this first; it unblocks the rest)

| Task | Output | Notes |
| --- | --- | --- |
| **B0.1 Hardware data file** | `src/content/hardwareData.ts` (or JSON), typed | One record per modality and, where useful, per vendor: `modality`, `vendor`, `qubits`, `twoQubitFidelity`, `t1`, `t2`, `gateTime`, `temperature`, `connectivity`, `source`, `url`, `asOf`. Ranges, not false precision. A test fails if a record has no `source` or `asOf`. |
| **B0.2 Hardware maths module** | `src/core/hardware/*.ts` | Small pure functions shared by labs and games (listed per activity below). Tests first. |
| **B0.3 Lab and game shell checks** | Copy of the "definition of done" checklist in this file | So every activity is reviewed the same way |
| **B0.4 Data refresh note** | A comment at the top of the data file | Says how to update a figure and what to change in the tutor notes |

**Effort:** 2 to 3 days (most of it is finding and citing sources).

### B1. The labs (cheaper and mostly pure maths: build these first, the games reuse them)

Each lab: one core module with tests, one screen with 1 to 3 sliders, a readout, a "show the math" box, an honest note.

| # | Lab | Concept | Model (what the maths is) | Interaction | Tests must show | Size |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | **Qubit Metrics Lab** (hw_0) | Coherence budget | Depth limit by time = T2 / gate time; limit by error = about 1 / error; usable depth is the smaller | Sliders: T1, T2, gate time, gate error. Bars for both limits | T2 = 100 us, 50 ns gives 2,000 (the lesson's example); raising error lowers the budget; T1 and T2 relationship note (T2 cannot exceed 2 T1) | S |
| 2 | **Transmon Lab** (hw_1) | Rabi oscillation, decay | P(1) = sin squared of (Omega t / 2), with an exponential envelope for T1 and T2 | Slider: drive strength; toggle: noise. Plot of P(1) vs time | Pi-pulse at t = pi / Omega; without noise the curve reaches 1; envelope decays | M |
| 3 | **Topology Compiler** (hw_2) | Connectivity cost | Route a list of two-qubit interactions on a line, a grid or all-to-all, inserting SWAPs along shortest paths; count them | Pick topology and a preset circuit; show the SWAP count and depth | All-to-all needs 0 SWAPs; a line needs the textbook count for a given pair; result never worse than a naive count | M |
| 4 | **Rydberg Blockade Lab** (hw_3) | Blockade | Blockade radius R_b = (C6 / hbar Omega)^(1/6); if the distance is below R_b only one of two atoms can be excited, with collective Rabi rate sqrt(2) Omega | Slider: atom distance (and laser strength). Shows blockade on or off and the oscillation | Below R_b the double excitation is suppressed; far above it the atoms act independently; sqrt(2) enhancement | M |
| 5 | **Loss Budget Lab** (hw_4) | Photon loss | Total transmission is the product of each component's transmission (sum of dB); chance that all n photons survive is that to the power n | Sliders: loss per component, number of components, number of photons | Success falls exponentially as components are added (the plan's test gate); 3 dB is half | S |
| 6 | **Exchange-Coupling Lab** (hw_5) | Spin-spin gate | Exchange J falls exponentially as the barrier rises; swap probability = sin squared of (J t / 2 hbar); half-way time gives sqrt(SWAP), an entangling gate | Sliders: barrier height and pulse time | Full swap at J t = pi hbar; sqrt(SWAP) at half that time; a higher barrier makes J smaller so the swap is slower | M |
| 7 | **Annealing Lab** (hw_6) | Annealing | Evolve 4 to 6 spins under H(s) = -(1-s) sum of X + s H_Ising from a transverse-field ground state, using a small custom time-stepper (the state-vector engine has no continuous Hamiltonian evolution) | Slider: anneal time; choose one of 3 preset Ising problems. Chart of success chance vs time and the energy gap | Slow anneal finds the ground state with chance near 1; a very fast one does not; result matches exact diagonalisation for a 2-spin problem | L |
| 8 | **Overhead Calculator** (hw_8_9) | Cost of error correction | Surface code: logical error about A (p / p_th)^((d+1)/2), with threshold p_th around 1% (cite it); physical qubits about 2 d squared minus 1 | Sliders: physical error rate, target logical error. Output: code distance and qubits per logical qubit | Below threshold more distance helps, above it makes it worse; matches the repetition code in `errorCorrection.ts` for small cases | M |
| 9 | **Comparison Dashboard** (hw_8_9) | Trade-offs | None: it shows the data file side by side | Pick 2 to 3 modalities; show cards with sources and "as of" dates | Every figure shown has a source and date; sorting never reorders without the data | M |

**Order inside B1:** 1 and 5 first (S), then 8 (needs B0.1), then 3, 2, 4, 6, then 7 (L), then 9 (needs the finished data file).

**Honest-note texts to include** (each lab must say what it leaves out):

- Metrics: real gate errors have several causes; the two limits are a rule of thumb.
- Transmon: a two-level model; real transmons have extra levels (leakage).
- Topology: simple shortest-path routing; real compilers do better.
- Rydberg: the blockade is a sharp threshold here; in reality it is gradual.
- Loss: independent, identical components assumed.
- Exchange: ignores charge noise and valley effects.
- Annealing: closed-system simulation of a few spins; real annealers are open, noisy systems with thousands of qubits, and whether they beat classical methods is still debated.
- Overhead: the formula is an approximation with fitted constants.

### B2. The games (build after the lab they share maths with)

Each game: levels (4 to 8), a move or resource limit, stars for efficiency, an untimed design, hints, a finish screen that says what real engineers do. Use the Gate Deck / Bloch Runner structure (`src/core/games/*.ts` plus a component).

| # | Game | Teaches | Rule (one sentence) | Reuses | Size |
| --- | --- | --- | --- | --- | --- |
| 11 | **Coherence Race** (hw_0) | Depth budget | Pick gate speed vs accuracy for a circuit of N gates: finish before coherence runs out *and* keep total error low | Lab 1 | M |
| 12 | **Cool Down** (hw_1) | Cryogenics | Add qubits and control lines to a dilution refrigerator without exceeding the cooling power of each temperature stage | B0.1 (stage cooling power, sourced) | M |
| 13 | **Ion Chain Conductor** (hw_2) | Connectivity, shuttling | Reorder or shuttle ions so a list of two-qubit gates runs with the fewest moves | Lab 3 | M |
| 14 | **Tweezer Shuffle** (hw_3) | Arrays, blockade | Move atoms with tweezers into a target pattern, respecting how close atoms may be | Lab 4 | M |
| 15 | **Photon Factory** (hw_4) | Loss, probabilistic gates | Chain heralded steps and multiplexing to keep the success chance above a target within a loss budget | Lab 5 | M |
| 16 | **Dot Tuner** (hw_5) | Tuning | Set gate voltages so electrons sit in the right dots and the coupling hits a target time | Lab 6 | M |
| 17 | **Valley Roll** (hw_6) | Annealing, tunnelling | Roll through an energy landscape: climb over, or tunnel through, to reach the lowest valley; choose the schedule | Lab 7 | M |
| 18 | **Logical Qubit Builder** (hw_8_9) | Physical vs logical | Spend a qubit budget on code distance to reach a target logical error at a given physical error | Lab 8, `errorCorrection.ts` | M to L |
| 19 | **Quantum Architect** (hw_8_9) | Trade-offs (capstone) | Read a client brief and choose a modality, defending the choice with data | B0.1, lab 9 | L |

**Design notes for the less obvious ones**

- *Cool Down* is a resource puzzle, not a timing game. Cooling power per stage and heat per line are illustrative and labelled so unless sourced.
- *Quantum Architect* should have several valid answers per brief and explain the trade-off, not reward one "right" modality. Include a brief where annealing is the honest answer and one where it is not.
- *Valley Roll* must not claim annealers beat classical machines. The finish text says the question is open.
- *Logical Qubit Builder* must show the case where more qubits make things worse (physical error above threshold).

**Effort:** each game 1.5 to 2 days including tests, help text and review; the capstone about 3.

### B3. Module 7 (Frontier Ideas) and the rest

- hw_module_7 has no activities by design (Experimental/Contested). Optional: a "Claim check" card sort in the style of Hype Check, with a strict `Experimental/Contested` tag. Only if time remains.
- Each new activity must be added to `src/content/gameHelp.ts` or `labHelp.ts`. Use the existing entries as the template (first section "How do I play" or "How do I use", an "I'm stuck" nudge for games, "What should I notice" for labs).

### B4. Suggested order and checkpoints

| Week | Deliver | Check |
| --- | --- | --- |
| 1 | B0 (data file, maths module skeleton); labs 1 and 5; notes for hw_0 to hw_2 (Workstream A) | Data file test passes; two labs reviewed |
| 2 | Labs 8, 3, 2, 4; games 11 and 13 | Physics review of each; 44 px audit |
| 3 | Labs 6, 7; games 12, 14, 15, 16 | Annealing lab matches exact result for the 2-spin case |
| 4 | Games 17, 18; lab 9; game 19; polish | All of Part 2 reachable and "Coming soon" gone; tutor eval passes |

If time runs short, **cut in this order**: Quantum Architect, Valley Roll plus Annealing Lab, Tweezer Shuffle, Dot Tuner. Never cut: the data file with sources, the Qubit Metrics Lab, the Loss Budget Lab, the Overhead Calculator, and the honesty notes.

---

## 4. Workstream C: Part 3 practice activities

### What is missing

Part 3 is the optional Math Companion, and it only has reading. A learner can read that X times the vector for 0 gives the vector for 1, but cannot try it. The plan's own test gate says: "every problem has at least one equivalent accepted answer".

### C0. Deepen the lessons (writing)

The six lessons are thin. Before building problems, each needs: a short explanation of every symbol, one fully worked example, and a "common slip" note. This also feeds Workstream A. **Size: M, shared with A.**

### C1. Answer checker (core, pure TypeScript)

`src/core/math/` with tests. **Size: M (about 2 days).**

| Part | What it does |
| --- | --- |
| Expression parser | Reads what a learner types: `1/sqrt(2)`, `1/√2`, `0.7071`, `(1+i)/2`, `-i`, `e^(i*pi/4)`. A small safe parser, never `eval`. Accepts `√`, `π`, `i`, fractions and decimals |
| Number and complex compare | Equal within a tolerance (default 0.001); "exact" mode for fractions |
| Vector and matrix input | Fixed-shape grids of cells; each cell parsed the same way |
| Equivalences | Optional: equal up to a global phase; equal up to ordering of basis states; any normalised multiple |
| Feedback | Returns *why* it is wrong from a list of `commonWrong` answers per problem ("you forgot to divide by √2") |

**Tests:** every accepted form of one answer is accepted (`1/√2`, `0.707`, `sqrt(2)/2`); a near miss is rejected; a global-phase answer is accepted only where allowed; garbage input never throws.

### C2. Practice component

`src/components/learn/PracticeView.tsx` (name is a suggestion). **Size: M (about 1.5 days).**

- A problem card: statement, answer cells, symbol buttons (`√`, `π`, `i`, `/`, `-`) because phone keyboards lack them, Check, Hint (a ladder of 2 or 3), Show worked solution (only after an attempt or a hint).
- Touch targets at least 44 px, no timer, explains what was accepted ("0.707 and 1/√2 are the same number").
- Shown at the bottom of a Part 3 lesson, above the quiz.

### C3. Problem sets (writing + maths checking)

About 6 to 8 per lesson, each with: id, statement, accepted answers, `commonWrong` with feedback, 2 hints, worked solution. Add a seeded variant generator where useful (so "retry" gives a fresh number). **Size: L (3 to 4 days).**

| Lesson | Problem types |
| --- | --- |
| Primer | Add two vectors; complex conjugate and modulus; matrix times vector |
| 1 State vectors | Is this state normalised? Find the missing amplitude; chance of 0; write |+> as a vector |
| 2 Gates as matrices | Apply X, H, Z to a given state; compute H X H; check a matrix is unitary |
| 3 Multiple qubits | Tensor product of two states; apply CNOT to a basis state; write the Bell state vector |
| 4 Measurement and interference | H · Phase(phi) · H on |0>; chance at each output; find phi for 50/50 |
| 5 Grover in 2D | Compute theta from N; amplitude after k rounds; best number of rounds |

Rules: every problem has at least one accepted answer **and** one listed wrong answer that is rejected (tests enforce both). Qubit ordering uses the app's convention (q0 is the rightmost bit), stated on the card.

### C4. Optional extras (only if time remains)

- A "Maths Workbench" lab: type a state or a matrix and see it on the Bloch sphere or as a circuit, linking to the Circuit Lab's "Show the math".
- Links to external courses from the plan (open in the system browser; never embed).

### C5. Progress and tutor

- Part 3 stays out of the course percentage (it is optional). Record solved problems in the progress store for a small badge; do **not** change the quiz-based course progress.
- Add each problem set to the tutor's activity reports (the problem text, the learner's last answer if wrong, the hint level). Never include accepted answers in the report. Add a `practice` help entry per lesson so the tutor can nudge ("check the normalisation first") without giving the answer.

### Done when

- [ ] Checker has tests for every accepted and rejected form and never throws
- [ ] Every Part 3 lesson has a problem set; every problem has an accepted and a rejected answer in a test
- [ ] Works on a phone: symbol buttons, no horizontal scrolling at 375 px
- [ ] Tutor nudges on a stuck learner without revealing the answer
- [ ] Physics and maths read by a second person

### Suggested order

C1 (checker) → C2 (card, with 3 sample problems) → C0 and C3 lesson by lesson (Lesson 1 first, then 2, 3, 4, 5, primer) → C5 → C4.

---

## 5. Risks and how we handle them

| Risk | What we do |
| --- | --- |
| Hardware figures go stale | One data file, `asOf` dates, banner "subject to rapid change" (already in Part 2). A refresh note in the file |
| Marketing claims presented as fact | Source required for every figure; prefer papers and company technical pages; note "claimed" where it is a claim |
| Simple models read as the real thing | Honest note on every screen; tag `Simplified model`; tutor help states what is left out |
| Physics mistakes in explanation text | Second-person review is part of "done"; look especially at success messages and "why it works" panels |
| Scope | Cut order above; the data file and the three core labs are protected |
| Phone usability of maths input | Symbol buttons, number tolerance, test on a real phone |
| Annealing lab is the hardest | Start it early in its week, compare with exact diagonalisation for a tiny case, allow the cut |

---

## 6. Handy commands and checks

```bash
npm test                  # all tests
npx tsc -b                # types (also: npx tsc -p tsconfig.tools.json --noEmit)
npm run lint
npm run build
npm run tutor:index       # rebuild the tutor's knowledge after changing notes or help text
npm run check:no-keys
TUTOR_URL=<address> npm run tutor:eval
```

**44 px audit** (paste into the browser console on a phone-sized window, on the screen you built):

```js
[...document.querySelectorAll('button, input, a, select, summary, [role=button], [role=switch], [role=radio]')]
  .filter(e => { const r = e.getBoundingClientRect(); return r.width && r.height && (r.height < 43.5 || r.width < 43.5); })
  .map(e => `${e.tagName} "${(e.getAttribute('aria-label') || e.innerText || '').slice(0, 30)}" ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`)
```

---

## 7. Open questions for the team

1. **Who owns which workstream?** A suits someone who writes; B needs two coders; C needs one coder plus a maths checker.
2. **Which vendors do we name?** The lessons name IBM, Google, Rigetti, IonQ, Quantinuum, QuEra, Pasqal, Atom Computing, PsiQuantum, Xanadu, Intel, Diraq and D-Wave. We should agree whether the dashboard shows vendors or only modalities (modalities are safer and age better).
3. **How deep should Part 3 go?** Five lessons of "read and try a few problems", or more worked material? This decides the size of C3.
4. **Do we want Module 7 (Frontier Ideas) to have an activity?** Current plan: no.
5. **Competition deadline and judging criteria.** These decide what we cut first.
