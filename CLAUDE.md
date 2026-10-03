# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Qisket: a mobile-first quantum computing learning app (React 19 + TypeScript + Vite, wrapped for Android with Capacitor 7). Games and simulations run on custom in-repo TypeScript physics engines (no quantum library). `RULES.md` (mirrored in `.gemini/rules.md`) is the project rulebook; `Plan/Implementation_Plan.md` holds the roadmap.

## Commands

```bash
npm run dev          # Vite dev server
npm run build        # tsc -b && vite build
npm run lint         # oxlint (config: .oxlintrc.json), not ESLint
npm test             # vitest run (node environment, globals enabled)
npx vitest run tests/circuit.test.ts            # single test file
npx vitest run -t "Bell"                        # single test by name
npm run cap:sync     # cap sync android (after build); cap:open / cap:run for Android Studio / device
```

## Architecture

- `src/core/circuit/`: state-vector engine (`complex.ts`, `gates.ts`, `statevector.ts`, `bloch.ts`, re-exported via `index.ts`). Pure TS with no React or DOM, so it runs under Vitest in node. `sampleCounts` and `measureQubit` take an optional rng for deterministic tests.
- `src/core/optical/interferometer.ts`: single-photon two-path engine (beam splitter, phase shifter, blocker) built on the same complex/matrix helpers. `core/stabilizer/` from `RULES.md` does not exist yet; `EngineType` in `content/types.ts` already names all three.
- `src/core/games/`: pure game rules, kept out of the components so they are testable (`blochRunner.ts`, `photonEscape.ts`, `chsh.ts`). Each game component only renders and wires state to these modules. Add new games this way, with a matching `tests/*.test.ts`.
- `src/content/`: typed content models (`types.ts`), the concept data (`concepts.ts`), and `validator.ts`, which validates records at runtime (e.g. honesty tags, prerequisites). Games, sims, lessons and quizzes link to concepts by id (`relatedGames`, `relatedSims`, `relatedLessons`).
- Learn content is hand-maintained TypeScript, taken from `Questions/Quantum Computing Course Content (clean).pdf` (the `.docx` next to it is the older, shorter draft; Part 3 equations were images, transcribed by hand). `lessonsPart1/2/3.ts` define lessons as blocks (paragraphs, bullets with optional `math`, notes) and `lessons.ts` aggregates them; `lessonText.ts` derives each lesson's plain-text `textNotes` (what the AI Tutor should retrieve from). `quizzes.ts` holds all 50 questions with a per-quiz id (`quiz_module_1`, `quiz_hardware`, `quiz_math`, ...), and `activities.ts` lists every planned game/lab (built or not) so lessons can link to them. A lesson's activities must also appear in its concept's `relatedGames`/`relatedSims` (tests enforce this).
- `src/core/learn/`: pure quiz grading (`quiz.ts`) and curriculum progress (`curriculum.ts`: module status, up-next, course %). A module with a quiz is done when the quiz is passed (80%, so 3- and 4-question quizzes need every answer right); one without a quiz is done when marked as read.
- `src/components/learn/`: the Learn tab (`LearnTab` routes between home, part, lesson and quiz views). The current view lives in `App.tsx` state so it survives tab switches. Maths is drawn by `MathView` from the structured `MathExpr` type; there is no maths library. Videos load from `youtube-nocookie.com` only after a tap. `VideoCard` talks to the player over postMessage (`useYouTubePlayer` + `core/learn/video.ts`; no YouTube script is loaded). A reference with `startSeconds`/`endSeconds` plays only that segment: YouTube's controls are hidden (`controls=0`), a shield sits over the video, the app draws its own play/pause/back-10s/progress controls and pauses just before the end so YouTube's end screen never shows. A reference without a segment keeps YouTube's normal controls. If the player reports an error or never answers, or sits unstarted for 10 s, the card says so and promotes the plain "Watch on YouTube" link (which cannot stop at an end time). YouTube can refuse embeds inside app webviews (sign-in prompt, or error 153 when no referrer is sent); this was verified on desktop but not yet on Android.
- `src/components/games/`, `src/components/simulations/`: each game or lab is one self-contained component with inline styles. `src/components/shared/HonestyTag.tsx` is the badge component.
- Every game uses the same look from `src/components/shared/Arcade.tsx` (frame, header, title, banner, modal) and `arcadeTheme.ts` (tokens, per-game accent `THEMES`, panel styles). Buttons are the global `.btn`/`.chip` classes in `src/index.css`. Build new games from these instead of hand-written styles.
- `src/App.tsx`: single-file shell with tab state (home/learn/games/sims), game/sim selection and the AI tutor drawer, with no router. A new game or sim has to be imported and wired in here.
- `src/hooks/useProgress.ts` + `src/utils/progressStore.ts`: progress (completed games, explored sims, quiz scores per quiz id, lessons marked read, concept mastery tiers `locked/familiar/explored/mastered`) persisted to localStorage under `qisket_progress_v1`, with an in-memory fallback so it works under node tests. Mastery needs game/lab evidence (Mastered = quiz >= 80% and a lab run), so passing a quiz alone does not move the tiers.
- `src/utils/audio.ts`: sound helpers.

## Project rules (from RULES.md)

- **Never change test expectations to make tests pass.** Fix the code or algorithm instead. Tests encode textbook physics (HXH = Z, Bell state 50/50 with perfect correlation, state-vector normalization, etc.).
- **Every game, simulation and model must visibly show an Honesty Tag**: `Analogy`, `Simplified model`, `Accurate`, or `Experimental/Contested`.
- Mobile-first: touch targets of at least 44×44px, colorblind-safe (never color alone), and an untimed mode for any timed gameplay.
- AI Tutor: answers only from approved product content, and API keys must never live in client code (serverless proxy).
