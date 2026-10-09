import { callGemini, DEFAULT_MAX_OUTPUT_TOKENS, DEFAULT_TIMEOUT_MS } from './gemini.ts';
import type { GeminiFailure, GeminiResult } from './gemini.ts';
import { createBreaker, createLimiter, parseRequest } from './guards.ts';
import type { Breaker, Limiter, LimiterOptions } from './guards.ts';
import { laterTopic, offlineAnswer } from './offline.ts';
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
/** After the model says it is out of quota, leave it alone this long. */
export const BREAKER_COOLDOWN_MS = 60_000;
const RETRY_DELAY_MS = 1500;

export function createServerState(limits: LimiterOptions = DEFAULT_LIMITS, now: () => number = Date.now): TutorServerState {
  return { limiter: createLimiter(limits, now), breaker: createBreaker(BREAKER_COOLDOWN_MS, now) };
}

const RETRYABLE: GeminiFailure[] = ['rate_limited', 'timeout', 'server', 'network'];
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
  const hits = searcher.search(req.question, { maxOrder: req.order, focusLessonId: req.lessonId, allowPart3: req.level === 'math' });

  // Nothing in the learner's part of the course matches (or the question is clearly about a later module): say so from the
  // notes, without spending any quota
  const later = laterTopic(searcher, req, hits[0]?.score);
  if (hits.length === 0 || later) {
    const reply = offlineAnswer(searcher, req, index);
    return { status: 200, body: { ...reply, provider: 'prepared' } };
  }

  if (!config.apiKey) return { status: 500, body: { error: 'not_configured' } };
  if (state.breaker.isOpen()) return { status: 200, body: { answer: '', sources: [], provider: 'offline', reason: 'rate_limited' } };

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
  if (!result.ok && RETRYABLE.includes(result.kind)) {
    await (deps.sleep ?? wait)(config.retryDelayMs ?? RETRY_DELAY_MS);
    result = await call();
  }

  if (result.ok) {
    const { answer, sources } = extractCitations(result.text, prompt.passages);
    return { status: 200, body: { answer: result.truncated ? `${answer}…` : answer, sources, provider: 'gemini' } };
  }
  if (result.kind === 'blocked') {
    return { status: 200, body: { answer: BLOCKED_ANSWER, sources: [], provider: 'prepared' } };
  }
  // an empty answer is about this one question; anything else means the model is not usable for now
  if (result.kind !== 'empty') state.breaker.trip();
  return {
    status: 200,
    body: { answer: '', sources: [], provider: 'offline', reason: result.kind === 'rate_limited' ? 'rate_limited' : 'unavailable' },
  };
}
