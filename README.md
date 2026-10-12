# Qisket

A mobile-first app that teaches quantum computing through games, labs, lessons and an AI tutor, also usable as a website on a computer. Built for the Qiskit Fall Fest 2026 (React 19, TypeScript, Vite; wrapped for Android with Capacitor).

Everything quantum runs on small physics engines written in this repo (no quantum library), and every game and lab shows an honesty tag (Analogy, Simplified model, Accurate, Experimental/Contested).

## For judges: what to look at (3 minutes)

**Try it:** `LIVE_APP_LINK` (opens in any browser, on a computer or a phone) or install the Android app from the latest GitHub Release (`app-debug.apk`). No account, no sign-in.

**What it is:** a complete beginner course in quantum computing that you learn by playing. 11 games, 10 hands-on labs, lessons with short videos, quizzes, and an AI tutor that knows what you are looking at.

**A good path:**

1. **Home → Start.** Each module opens with a game (for example *Quantum Heist* or *Bloch Runner*), then a short video, then a lab, then a quiz.
2. **Open a game, then tap "Ask Tutor".** Dr. Milton Schrody sees which level you are on and gives a hint, not the answer. Try "I'm stuck".
3. **Labs tab → Mach-Zehnder Lab.** Change the phase and fire photons: the interference pattern appears.
4. **Learn → any lesson → "Ask about this".** The tutor explains that exact paragraph.
5. **Games → Hype Check.** Sort real, maybe-someday and hype claims about quantum computers.

**What we are proud of**

- **Honest.** Every game and lab carries a tag (Analogy, Simplified model, Accurate, Experimental/Contested) and says what it leaves out. We audited the games for physics mistakes and fixed the ones we found.
- **Real physics, not animations.** Our own state-vector and optical engines run every game and lab, with 400+ automated tests that check textbook results (Bell states, teleportation, Grover, error correction).
- **A tutor that does not spoil.** It answers only from the course notes, never reveals quiz answers, hides later modules, works offline, and the API key never reaches the app.
- **Mobile-first and accessible.** 44px touch targets, no timers without an untimed mode, nothing relies on colour alone.

**Honest status:** Part 1 (concepts) is complete. Parts 2 (hardware) and 3 (maths) have lessons and quizzes; their games, labs and practice are planned in `Plan/Parts_2_and_3_Build_Plan.md`.

**Team and contact:** `TEAM_NAMES`

---

## Get it running (about 5 minutes)

You need: **Git** and **Node.js 20 or newer** (https://nodejs.org). Nothing else.

```bash
git clone https://github.com/breindelpereira/Qisket_Fall_Fest.git
cd Qisket_Fall_Fest
npm install
npm run dev
```

Open the address it prints (usually http://localhost:5173). The app works fully without any keys: the AI tutor then answers from the notes stored on your device.

### Optional: the online AI tutor

It works out of the box: the app already points at the team's tutor function. To use your own, or to run offline only, put `VITE_TUTOR_URL=<address>` (or an empty value) in `.env.local`. The Gemini key never goes in this repo or in the app: it lives only in the Cloudflare Worker (see `worker/README.md`). The Worker limits requests per person and per day, and the app falls back to answers from the notes on the device if the limit is reached.

## Everyday commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the app with live reload |
| `npm test` | Run all tests (they encode textbook physics: fix the code, never the test) |
| `npx tsc -b` | Type check |
| `npm run lint` | Lint |
| `npm run build` | Production build into `dist/` |
| `npm run tutor:index` | Rebuild the tutor's knowledge after editing `tutor/notes/` or `src/content/gameHelp.ts` / `labHelp.ts` |
| `npm run check:no-keys` | Fails if an API key leaked into the build or the source |

## Working on it

1. Create a branch: `git checkout -b your-name/what-you-do`
2. Make your change, then run `npm test`, `npx tsc -b`, `npm run lint`.
3. Commit, push the branch and open a Pull Request on GitHub.

Please read before you start:

- `CLAUDE.md`: how the code is organised and the project rules.
- `RULES.md`: the project rulebook (honesty tags, 44px touch targets, no timers without an untimed mode).
- `Plan/Parts_2_and_3_Build_Plan.md`: what is left to build and how to pick up a piece (tutor notes, hardware games and labs, maths practice).
- `tutor/README.md`: how to write tutor notes (a good first job that needs no coding).

## Website (computer and phone)

The same build runs in any browser and picks its layout by itself (CSS in `src/desktop.css`, no setting): a computer window, or a tablet on its side, gets the desktop layout; a phone gets the phone layout. The desktop layout has tabs in a top bar, games and labs in a grid, lessons and games in a centred reading column, the tutor as a dialog, and Esc closes dialogs.

The three phone-sensor games (Hold the Bloch Sphere, Shake to Measure, Entangled Pair) are Android-app only: the website build leaves them out, and lessons do not mention them. The `npm run dev` server shows them so they can be developed.

To publish the website, run `npm run build` and upload the `dist/` folder to any static host. If it is served from a sub-folder (for example GitHub Pages at `/Qisket_Fall_Fest/`), build with `VITE_BASE=./ npm run build`, which works from any folder. Then add the site's address to `ALLOWED_ORIGINS` in `worker/wrangler.toml` and redeploy the Worker, otherwise the browser blocks the online tutor (the offline tutor still works).

## Android (only if you need the phone app)

Needs Android Studio (its bundled JDK works) and an Android SDK. Create `android/local.properties` with `sdk.dir=<your SDK path>` (git ignores it), then:

```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug     # APK: android/app/build/outputs/apk/debug/app-debug.apk
```

More notes, including a Windows Gradle fix, are in `CLAUDE.md` under "Android build notes".

## Repository map

- `src/core/`: pure TypeScript engines, game rules and the tutor logic (no React, tested in node)
- `src/components/`: screens for lessons, games, labs and the tutor
- `src/content/`: lessons, quizzes, concepts, game and lab help text
- `tutor/`: the tutor's notes and generated index
- `worker/`: the Cloudflare Worker that holds the Gemini key
- `tests/`: Vitest tests
- `android/`: the Capacitor Android project
