import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { TutorIndex, TutorLevel, TutorResponse } from '../src/core/tutor/types.ts';

/**
 * The 20-question check for the DEPLOYED tutor function.
 *   TUTOR_URL=https://qisket-tutor.<you>.workers.dev/api/tutor npm run tutor:eval
 * It asks every question in tutor/eval-questions.json and checks each answer against the rules written next to the question.
 * The function allows 10 questions a minute by default, so the script waits between questions (use --fast if you raised the limit).
 * A passing run is a good sign, not a proof: also read the answers yourself.
 */
interface EvalQuestion {
  id: string;
  category: string;
  lessonId: string;
  level: TutorLevel;
  question: string;
  mustContainAny?: string[];
  mustNotContain?: string[];
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const url = process.env.TUTOR_URL ?? process.argv.find((a) => a.startsWith('http'));
if (!url) {
  console.error('Set TUTOR_URL to the address of the deployed function, for example:\n  TUTOR_URL=https://qisket-tutor.example.workers.dev/api/tutor npm run tutor:eval');
  process.exit(2);
}
const fast = process.argv.includes('--fast');

const questions = JSON.parse(readFileSync(path.join(ROOT, 'tutor', 'eval-questions.json'), 'utf8')) as EvalQuestion[];
const index = JSON.parse(readFileSync(path.join(ROOT, 'tutor', 'index.json'), 'utf8')) as TutorIndex;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let failed = 0;
for (const [i, q] of questions.entries()) {
  const order = index.courseMap.find((e) => e.lessonId === q.lessonId)?.order ?? 0;
  let reply: TutorResponse | null = null;
  let problem = '';
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ question: q.question, lessonId: q.lessonId, order, level: q.level, history: [] }),
    });
    if (!res.ok) problem = `HTTP ${res.status}`;
    else reply = (await res.json()) as TutorResponse;
  } catch (e) {
    problem = `request failed: ${(e as Error).message}`;
  }

  if (reply && reply.provider === 'offline') problem = `the function did not reach the model (${reply.reason ?? 'unknown reason'}${reply.detail ? `; ${reply.detail}` : ''})`;
  const text = (reply?.answer ?? '').toLowerCase();
  if (reply && !problem) {
    if (q.mustContainAny && !q.mustContainAny.some((p) => text.includes(p.toLowerCase()))) problem = `answer has none of: ${q.mustContainAny.join(' | ')}`;
    const bad = q.mustNotContain?.find((p) => text.includes(p.toLowerCase()));
    if (bad) problem = `answer contains "${bad}"`;
  }

  if (problem) failed += 1;
  console.log(`${problem ? 'FAIL' : 'ok  '} ${q.id} [${q.category}] ${q.question}`);
  if (problem) console.log(`       ${problem}`);
  if (reply) console.log(`       (${reply.provider}) ${reply.answer.replace(/\s+/g, ' ').slice(0, 220)}`);
  if (!fast && i < questions.length - 1) await sleep(7000);
}

console.log(`\n${questions.length - failed} of ${questions.length} passed.`);
process.exit(failed > 0 ? 1 : 0);
