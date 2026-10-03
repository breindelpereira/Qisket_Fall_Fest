# Qisket — Status Check & Revised Development Flow

Companion to `Implementation_Plan.md` (kept unchanged). Written against the repo at commit `99d54ea`.

## 1. Where we actually are

| Phase | Plan says | Reality |
|---|---|---|
| 0 Setup | Vite, Capacitor, Vitest, rules, git | Done. Not verified: blank app on a phone over USB (test gate). |
| 1 Foundations | Circuit core, content model, shell, progress | Done. 13 tests pass. Shell has 4 tabs, not 5 (no Progress tab). `core/circuit` has no Born-rule sampling test. |
| 2 Module 1 slice | Lesson template, Heist, Single-Qubit Lab, Module 1 content | **Half done.** Heist and SingleQubitLab are built (heavily polished). Lesson page, quiz component, "show the math" toggle, video embed and Module 1 content are **not built**. Learn tab is a placeholder. |
| 3 AI Tutor | Serverless proxy, grounding, fallback | **UI shell only** (drawer with input). No backend, no context, no fallback, no content to ground on. |
| 5 Stealth | Stealth game + shots lab + circuit lab | Stealth game done. Shots/histogram lab (partly inside SingleQubitLab's 100-shot sampler) and circuit lab not built. |
| Unplanned | n/a | Quantum Coin Flip game (not in the 19-game catalog). |

Also not started: `core/optical`, `core/stabilizer`, Phase 4 and later, the Progress tab, any lesson/quiz content, any wiring of games and sims into `useProgress` (concept mastery is not yet fed by gameplay in a verifiable way).

## 2. What is wrong with the current flow

1. **Games got ahead of the learning spine.** Three games and one lab exist but there is no Learn tab, so no submit point is demoable (Point A requires lesson and quiz). The work was done in the order that was most fun, not the order that unlocks milestones.
2. **Phase 3 (Tutor) depends on content that doesn't exist.** The tutor answers only from lessons and concept records. Building it before there are lessons means building against 4 one-line concepts.
3. **Each game was polished before the next was started.** The Heist took 3 commits of visual revamp. Polish belongs in Phase 11; per-game polish is the biggest schedule risk.
4. **Thin Parts 2 and 3 are the "protect this" milestone** but sit behind five phases of feature work.
5. **Engines 2 and 3 are scheduled late (phases 8 and 7) but games 4 and 9 and the demo script depend on them.** The 3-minute demo opens with Photon Escape Room and Mach-Zehnder, both of which need the optical engine. That is currently last in Part 1.
6. **Tests are not gating the games.** Each game should have an engine-level test for its mechanic (like the Phase 5, 6 and 7 gates), but game logic lives inside 1000-line components, so it can't be tested in node.

## 3. Revised flow

### Step 0: Housekeeping (small, do first)
- Pick one rules file (`RULES.md` and `.gemini/rules.md` differ).
- Record the Quantum Coin Flip decision: add it to the catalog as an extra, or move it behind "Expansion".
- Verify the Phase 0 gate on a real phone once. Android Studio is the "biggest unknown" and still unchecked.
- Add a "feature freeze on polish" rule: no more visual revamps until Phase 11.

### Step 1: Extract game logic into `core/` (new, before more games)
Move the pure mechanics out of the components (e.g. Stealth's detection and collapse-risk math, Heist's door and aim logic, Coin Flip's pipeline) into testable modules and add Vitest cases. Cost: about one session. Benefit: every later game follows the same pattern, and the "never relax test expectations" rule has something to enforce.

### Step 2: Close Phase 2 properly → Submit Point A
Build the missing learning spine, in this order:
1. Lesson page template (notes, "show the math" toggle, video embed with fallback).
2. Quiz component with scoring that writes `quizScores` via `useProgress`.
3. Module 1 content (concept record, notes, quiz) wired to Heist and SingleQubitLab through `relatedGames` and `relatedSims`.
4. Replace the Learn placeholder with a module list.
5. Hook game completion and sim exploration into mastery tiers.

Gate: playable end to end on a phone, quiz score survives restart.

### Step 3: Content before the tutor
Write concept records, notes and quizzes for **Modules 1-3 and the Part 1 modules for games that already exist** (Heist, Stealth, Coin Flip) plus a FAQ and the ~10 misconception seeds. Content is the slow part, so run this in parallel with Step 4.

### Step 4: AI Tutor (Phase 3) → Submit Point B
Only now, with real content to retrieve. Build in this order: grounded retrieval and quick-answer fallback first (works offline, no backend), then the serverless proxy with rate limit and cost cap, then consent toggle and level setting. Gate on the 20-question test set and a check that no key is in the built bundle.

### Step 5: Thin Parts 2 and 3 (Phase 4) → Submit Point C
Move straight here, as planned. This is the real minimum target and nothing after it should be allowed to delay it.

### Step 6: Build the shared lab framework once
Before more sims, extract a slider / readout / math-toggle / drawer template (Part 2 labs reuse it, per the plan). Qubit metrics lab (Step 5) is the first user, so do this as part of that step. Add the missing shots + histogram lab and the circuit lab here, since the circuit core already supports them.

### Step 7: Optical engine early → demo path
Pull `core/optical` and the Mach-Zehnder lab **forward** to right after Point C, together with Photon Escape Room. This is the demo's centrepiece, so it must not be left to "Part 1 remainder". Gate: bright and dark ports match the circuit core.

### Step 8: Remaining Part 1 in dependency order
1. Alice & Bob, Two-qubit lab, CHSH explorer (needs the CHSH 75% / ~85% test).
2. Stabilizer engine, Qubit Surgeon, Noise lab (needs the 3p² - 2p³ test).
3. Bloch Runner, Gate Deck, Oracle Detective, Grover, Teleportation.
4. Hype Check and period-finding last (first to cut).

### Step 9: Part 2 full, Part 3 full, Polish, Hardening
Unchanged from the plan, except that Phase 11's Progress tab should be started earlier (see below) and Hardening keeps its 14%.

### Cross-cutting
- **One content pass per step**: each submit point ships with its notes, quizzes and tutor FAQ entries, not just code.
- **Progress tab early**: add it right after Step 2, since it is cheap and makes every later milestone visible. Currently the shell has 4 tabs vs the planned 5.
- **Tag git and keep an APK at each lettered point** (no tags exist yet; the plan requires them).
- **Reduce the cut list**: the plan's cut order still holds; add "per-game visual polish" at the top of it.

## 4. Suggested next three tasks

1. Step 0 housekeeping plus the Phase 0 phone check.
2. Step 2.1-2.2: lesson template and quiz component, using Heist and SingleQubitLab as Module 1's linked activities.
3. Step 1: extract and test Stealth and Heist mechanics, since those are the freshest code.
