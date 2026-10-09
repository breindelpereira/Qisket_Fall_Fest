import { matchPrepared, offlineAnswer } from './offline.ts';
import type { PreparedAnswer } from './offline.ts';
import type { Searcher } from './search.ts';
import type { TutorIndex, TutorRequest, TutorResponse, TutorSource } from './types.ts';

export interface AskContext {
  request: TutorRequest;
  index: TutorIndex;
  searcher: Searcher;
  prepared: PreparedAnswer[];
  /** The learner's choice: may the question be sent to the online tutor? */
  online: boolean;
  /** Address of the tutor function. Empty when the app was built without one. */
  url?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

/** Longer than the function's own timeout plus its one retry, so the function gets to give its answer. */
export const CLIENT_TIMEOUT_MS = 20_000;

const REASONS = ['rate_limited', 'unavailable', 'busy', 'off'] as const;

const isSource = (s: unknown): s is TutorSource =>
  typeof s === 'object' && s !== null && typeof (s as TutorSource).lessonId === 'string' && typeof (s as TutorSource).heading === 'string';

/** Accepts only a well-formed reply from the function; anything else is treated as "no answer". */
export function readReply(raw: unknown): TutorResponse | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.answer !== 'string' || (r.provider !== 'gemini' && r.provider !== 'prepared' && r.provider !== 'offline')) return null;
  const sources = Array.isArray(r.sources) ? r.sources.filter(isSource).map((s) => ({ lessonId: s.lessonId, heading: s.heading, where: s.where })) : [];
  const reason = (REASONS as readonly unknown[]).includes(r.reason) ? (r.reason as TutorResponse['reason']) : undefined;
  return { answer: r.answer, sources, provider: r.provider, reason };
}

/**
 * Gets an answer for one question. Order: a pre-written answer if the question is one we expect, then the online tutor
 * (only if the learner allowed it), then the notes on the device. This never throws and always returns something useful.
 */
export async function askTutor(ctx: AskContext): Promise<TutorResponse> {
  const { request, index, searcher } = ctx;
  const prepared = matchPrepared(ctx.prepared, request.question, request.order, index);
  if (prepared) return prepared;

  const fallback = (reason: TutorResponse['reason']): TutorResponse => ({ ...offlineAnswer(searcher, request, index), reason });
  if (!ctx.online) return fallback('off');
  if (!ctx.url) return fallback('unavailable');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ctx.timeoutMs ?? CLIENT_TIMEOUT_MS);
  try {
    const res = await (ctx.fetchImpl ?? fetch)(ctx.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
    if (res.status === 429) return fallback('busy');
    if (!res.ok) return fallback('unavailable');
    const reply = readReply(await res.json());
    if (!reply) return fallback('unavailable');
    if (reply.provider === 'offline' || (reply.provider === 'gemini' && reply.answer.trim() === '')) {
      return fallback(reply.reason === 'rate_limited' || reply.reason === 'busy' ? reply.reason : 'unavailable');
    }
    return reply;
  } catch {
    return fallback('unavailable');
  } finally {
    clearTimeout(timer);
  }
}
