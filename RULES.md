# Antigravity Rules — Qisket (Quantum Computing App)

## 1. Technical Stack
- **Framework:** React 19 + TypeScript + Vite
- **Mobile Runtime:** Capacitor 7 (Android)
- **Styling:** Mobile-first, responsive, clean CSS / CSS modules / modern styling
- **Engines:** Custom TypeScript simulation cores:
  - `src/core/circuit/`: State-Vector Circuit Engine (up to 8-10 qubits)
  - `src/core/optical/`: Optical / Interferometer Engine (spatial paths, Mach-Zehnder)
  - `src/core/stabilizer/`: Stabilizer / Tableau + Stochastic Noise Engine
- **Test Runner:** Vitest (`npm test`)

## 2. Testing & Integrity Iron Rule
- **NEVER CHANGE TEST EXPECTATIONS TO MAKE TESTS PASS.**
- If a test fails, fix the code/algorithm, never relax the physics or math expectations.
- Test suites must verify known textbook physics:
  - `HXH = Z`
  - Bell state produces exact 50/50 probabilities with perfect correlations
  - State vectors remain normalized ($\sum |a_i|^2 = 1$)
  - Mach-Zehnder output ports match expected interference
  - Grover iteration peaks near $\frac{\pi}{4}\sqrt{N}$
  - Error correction logical error threshold beats physical rate ($3p^2 - 2p^3 < p$ at low noise)

## 3. Honesty Tags System
Every game, simulation, and model must visibly display its Honesty Tag:
- `Analogy`: An intuitive metaphor that doesn't literally match physical quantum systems.
- `Simplified model`: Accurate within its toy assumptions, but omitting noise or higher-order effects.
- `Accurate`: Physically accurate representation (e.g. Mach-Zehnder interferometer or unitary gate rotation).
- `Experimental/Contested`: Active research or unproven physical realization (e.g. topological qubits).

## 4. Mobile-First Sizing & UI Principles
- Design strictly for mobile screens first (tested on phone via Capacitor/Chrome responsive mode).
- Target touch targets: Minimum 44×44px for buttons and interactive controls.
- On small screens: "Controls", "Math View", and "AI Tutor" share collapsible bottom drawers so the visualization canvas remains usable.
- Colorblind-safe palette: Never rely solely on color (use shapes, patterns, labels, and icons alongside colors).
- No-timer modes: Always provide untimed learning options for timed gameplay.

## 5. Folder Layout
```
src/
├── core/              # Physics & simulation engines
│   ├── circuit/       # State-vector circuit engine
│   ├── optical/       # Interferometer engine
│   └── stabilizer/    # Clifford / error correction engine
├── content/           # JSON/TS content models (concepts, lessons, quizzes, hardware data)
├── components/        # React components
│   ├── shell/         # Navigation, 5 tabs, header
│   ├── games/         # Playable games
│   ├── simulations/   # Interactive simulation labs
│   ├── learn/         # Curriculum viewer, video embed, quizzes
│   ├── tutor/         # AI Tutor drawer & chat
│   └── shared/        # Honesty tags, badges, buttons, drawers
├── hooks/             # Custom React hooks (progress, persistence)
├── utils/             # Math & quantum helpers
└── tests/             # Vitest test suites
```

## 6. AI Tutor Grounding
- Serverless proxy protects API keys — NEVER include keys in client-side code.
- Answers ONLY from approved product content (lessons, concept records, video notes, game/sim descriptions).
- Never fabricate; cite sources directly.
- Handles common misconceptions gently with conceptual explanations and links.
