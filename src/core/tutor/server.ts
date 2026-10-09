import { callGemini, DEFAULT_MAX_OUTPUT_TOKENS, DEFAULT_TIMEOUT_MS } from './gemini.ts';
import type { GeminiFailure, GeminiResult } from './gemini.ts';
import { withGameBasics } from './game.ts';
import { createBreaker, createLimiter, parseRequest } from './guards.ts';
import type { Breaker, Limiter, LimiterOptions } from './guards.ts';
import { offlineAnswer } from './offline.ts';
import { buildPrompt, extractCitations } from './prompt.ts';
import { createSearcher } from './search.ts';
import type { Searcher } from './search.ts';
import type { TutorIndex, TutorResponse } from './types.ts';

/**
 * The tutor function's logic, with no hosting details: the Cloudflare worker (and the tests) call `answerQuestion`.
 * The chain is: the model, one retry for a short outage, then a reply that tells the app to answer from its own notes.
 */

export interface TutorServerConfig {
  apiKey: string;
  model: string;
  temperature?: number;
  maxOutputTokens?: number;
  timeoutMs?: number;
  /** Wait before the single retry. */
  retryDelayMs?: number;
}

export interface TutorServerState {
  limiter: Limiter;
  breaker: Breaker;
}

export interface TutorServerDeps {
  index: TutorIndex;
  searcher?: Searcher;
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
}

export type ServerResult =
  | { status: 200; body: TutorResponse }
  | { status: 400 | 429 | 500; body: { error: string; retryAfterSec?: number } };

export const DEFAULT_LIMITS: LimiterOptions = { perMinute: 10, perDay: 60, globalPerDay: 800 };
/** After the model says it is out of quota (or the key or model name is wrong), leave it alone this long. */
export const BREAKER_COOLDOWN_MS = 60_000;
/** After a passing hiccup (the model overloaded or slow), only a short pause, so one bad moment does not shut everyone out. */
export const HICCUP_COOLDOWN_MS = 10_000;

export function createServerState(limits: LimiterOptions = DEFAULT_LIMITS, now: () => number = Date.now): TutorServerState {
  return { limiter: createLimiter(limits, now), breaker: createBreaker(BREAKER_COOLDOWN_MS, now) };
}

/** How long to wait before each retry, by kind of failure. A busy model often recovers within seconds; an exhausted quota does not. */
const RETRY_DELAYS_MS: Partial<Record<GeminiFailure, number[]>> = {
  rate_limited: [1500],
  timeout: [1000],
  server: [1000, 2500],
  network: [1000, 2500],
  empty: [500],
};
const HICCUPS: GeminiFailure[] = ['timeout', 'server', 'network'];
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const BLOCKED_ANSWER =
  'I cannot help with that one. I can only talk about quantum computing and this course. Try asking about qubits, measurement or gates!';

export async function answerQuestion(
  raw: unknown,
  clientKey: string,
  config: TutorServerConfig,
  state: TutorServerState,
  deps: TutorServerDeps,
): Promise<ServerResult> {
  const { index } = deps;
  const parsed = parseRequest(raw, index);
  if (!parsed.ok) return { status: 400, body: { error: parsed.error } };
  const req = parsed.req;

  const limit = state.limiter.check(clientKey);
  if (!limit.ok) return { status: 429, body: { error: `limit_${limit.reason}`, retryAfterSec: limit.retryAfterSec } };

  const searcher = deps.searcher ?? createSearcher(index.chunks);
  // while a game is open its own passages are searched too, whatever the learner's position in the course
  const found = searcher.search(req.question, {
    maxOrder: req.order,
    focusLessonId: req.lessonId,
    allowPart3: req.level === 'math',
    activityId: req.activity?.id,
  });
  const hits = withGameBasics(found, index, req.activity, req.question);

  // Nothing in the learner's part of the course matches: say so from the notes (or point to the later module that does),
  // without spending any quota. When something matches, even weakly, the model decides, because it can also see the
  // course map and is told not to teach topics marked LATER.
  if (hits.length === 0) {
    const reply = offlineAnswer(searcher, req, index);
    return { status: 200, body: { ...reply, provider: 'prepared' } };
  }

  if (!config.apiKey) return { status: 500, body: { error: 'not_configured' } };
  if (state.breaker.isOpen()) {
    const why = state.breaker.reason();
    return {
      status: 200,
      body: { answer: '', sources: [], provider: 'offline', reason: why === 'rate_limited' ? 'rate_limited' : 'unavailable', detail: `paused after: ${why ?? 'a failure'}` },
    };
  }

  const prompt = buildPrompt(index, req, hits);
  const call = () =>
    callGemini(prompt, {
      apiKey: config.apiKey,
      model: config.model,
      temperature: config.temperature,
      maxOutputTokens: config.maxOutputTokens ?? DEFAULT_MAX_OUTPUT_TOKENS,
      timeoutMs: config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      fetchImpl: deps.fetchImpl,
    });

  let result: GeminiResult = await call();
  const delays = [...(result.ok ? [] : (RETRY_DELAYS_MS[result.kind] ?? []))];
  while (!result.ok && delays.length > 0) {
    await (deps.sleep ?? wait)(config.retryDelayMs ?? delays[0]);
    delays.shift();
    result = await call();
    // a failure that cannot be helped by waiting (a bad key, a refusal) ends the retries
    if (!result.ok && !RETRY_DELAYS_MS[result.kind]) break;
  }

  if (result.ok) {
    const { answer, sources } = extractCitations(result.text, prompt.passages);
    return { status: 200, body: { answer: result.truncated ? `${answer}…` : answer, sources, provider: 'gemini' } };
  }
  if (result.kind === 'blocked') {
    return { status: 200, body: { answer: BLOCKED_ANSWER, sources: [], provider: 'prepared' } };
  }
  // for the team: this shows up in the Worker's logs (npx wrangler tail) and in the reply's `detail`
  const detail = `${result.kind}${result.status ? ` ${result.status}` : ''}${result.message ? `: ${result.message}` : ''}`.slice(0, 240);
  console.warn(`tutor: model call failed (${detail})`);
  // an empty answer is about this one question; anything else means the model is not usable for now
  if (result.kind !== 'empty') state.breaker.trip(result.kind, HICCUPS.includes(result.kind) ? HICCUP_COOLDOWN_MS : BREAKER_COOLDOWN_MS);
  return {
    status: 200,
    body: { answer: '', sources: [], provider: 'offline', reason: result.kind === 'rate_limited' ? 'rate_limited' : 'unavailable', detail },
  };
}
