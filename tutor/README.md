# The tutor's notes

Dr Quantum answers only from the files in this folder (the AI tutor never makes up facts from its own memory). Everything here is bundled into `index.json`, which the app and the function both read.

## What is in the folder

| File | What it is | Edit by hand? |
| --- | --- | --- |
| `notes/<lessonId>.md` | Richer notes for one lesson: worked examples, FAQs, mix-ups, key words. | Yes |
| `demo-answers.json` | Pre-written answers for questions we expect in a demo. Used when the online tutor is off or cannot be reached, so a demo still works without a network. | Yes |
| `eval-questions.json` | The 20-question test set. | Yes |
| `index.json` | Everything above plus the lesson text, split into passages. | **No**: run `npm run tutor:index` |

Every lesson is searchable even without a notes file, because the lesson's own text is split into passages automatically. A notes file just makes answers better. Quiz questions are never included, so the tutor cannot leak an answer.

Written so far: `module_0` to `module_7` (all of Part 1). Part 2 (`hw_module_0` to `hw_module_8_9`) and Part 3 (`math_week_0`, `math_lesson_1` to `math_lesson_5`) still use their lesson text only. Writing those is a good job for teammates.

## Game help

What the tutor knows about each game is in `src/content/gameHelp.ts` (not in `notes/`). Each game has sections written like notes: the first is "How do I play ...?", then its common doubts, an "I'm stuck" nudge, and "What does finishing ... show?". These passages are used only while that game is open or was just left, and they never contain the solution to a level or the text of the game's Hint button. When you add a game, add its help there and make its component call `useActivityReport`. Then run `npm run tutor:index`.

## Writing a notes file

Create `tutor/notes/<lessonId>.md`, where the id is the lesson's id in `src/content/lessonsPart*.ts` (for example `hw_module_2.md`).

```markdown
---
id: hw_module_2
tag: Simplified model
---

## Explain: How a trapped-ion qubit is held
One idea, about 100 to 300 words, in plain language.

## Example: A small worked example
Numbers or a picture in words.

## FAQ: Why are ions slower than superconducting qubits?
The answer, written as you would say it to a friend.

## Glossary: Key words
Term: short meaning. Term: short meaning.

## Misconception: A common wrong idea
What people think, and the gentle correction.
```

- The first lines (between the `---` lines) need `id`, which must match the file name. `tag` is optional: it defaults to the lesson's honesty tag. Use one of `Analogy`, `Simplified model`, `Accurate`, `Experimental/Contested`.
- Each section starts with `## Kind: Heading`. Kinds: `Explain`, `Example`, `FAQ`, `Glossary`, `Misconception`.
- For an `FAQ`, write the heading as the question a learner would type. These become the "Try asking" buttons in the drawer.
- Keep each section to one idea and under 400 words (the build refuses longer ones). Do not repeat a heading in the same file.

Rules for the writing, because the tutor repeats it to learners:

1. Be accurate. If you are not sure, leave it out or ask. A wrong note means a wrong answer.
2. Say when something is an analogy or a simplification, in the text itself.
3. Plain language first, then the technical word. No jargon without a meaning.
4. Never put quiz questions or answers in the notes.
5. Write about this lesson only. Pointing at another module is fine ("you will meet this in Module 4"), but do not teach it here: the tutor hides notes from modules the learner has not reached.

## After you change anything

```bash
npm run tutor:index   # rebuilds tutor/index.json and tells you what is wrong, if anything
npm test              # a test fails if index.json is out of date
```

Commit `index.json` together with your notes.

## Demo answers

`demo-answers.json` is a list of `{ id, questions, answer, sources }`. `questions` are the ways a learner might ask it; a question matches when it uses (almost) the same words. Each source needs a `lessonId` and a `heading` that exists in the notes (a test checks this). A prepared answer is only shown once the learner has reached the lesson it comes from.

## The 20-question set

`eval-questions.json` has the questions used to check the tutor. Each has the lesson the learner is on, a level, and rules for the answer: `mustContainAny` (at least one of these phrases) and `mustNotContain` (none of these). `expectLesson` and `expectNothing` / `expectLater` are checked automatically against the search in `npm test`. To check the real answers from the deployed function, see step 7 in `worker/README.md`.
