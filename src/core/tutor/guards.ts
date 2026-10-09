import { ACTIVITY_STATUSES, LIMITS, TUTOR_LEVELS } from './types.ts';
import type { ActivityRef, ActivityStatus, TutorChunk, TutorIndex, TutorRequest, TutorTurn } from './types.ts';

export type ParsedRequest = { ok: true; req: TutorRequest } | { ok: false; error: string };

/** Control characters and runs of white space become one space, so nothing can hide in the prompt. */
export const tidy = (s: string): string =>
  Array.from(s, (ch) => (ch.charCodeAt(0) < 32 || ch.charCodeAt(0) === 127 ? ' ' : ch))
    .join('')
    .replace(/\s+/g, ' ')
    .trim();

const ACTIVITY_ID = /^[a-z0-9_]{1,40}$/;

/**
 * The game the learner is playing. This is extra context, so a bad or unknown value is dropped and the question is
 * still answered. When the index is known, the id must be a game the tutor has notes on.
 */
export function parseActivity(raw: unknown, chunks?: TutorChunk[]): ActivityRef | undefined {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return undefined;
  const a = raw as Record<string, unknown>;
  if (typeof a.id !== 'string' || !ACTIVITY_ID.test(a.id)) return undefined;
  if (chunks && !chunks.some((c) => c.activityId === a.id)) return undefined;
  if (!(ACTIVITY_STATUSES as readonly unknown[]).includes(a.status)) return undefined;
  const field = (v: unknown): string | undefined => (typeof v === 'string' ? tidy(v).slice(0, LIMITS.activityChars).trim() || undefined : undefined);
  const ref: ActivityRef = { id: a.id, status: a.status as ActivityStatus };
  for (const key of ['step', 'mission', 'state', 'hint'] as const) {
    const value = field(a[key]);
    if (value) ref[key] = value;
  }
  return ref;
}

/** Checks what a client sent. Anything unexpected is refused, never repaired, except over-long chat history which is trimmed. */
export function parseRequest(raw: unknown, index: Pick<TutorIndex, 'courseMap'> & Partial<Pick<TutorIndex, 'chunks'>>): ParsedRequest {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return { ok: false, error: 'bad_request' };
  const body = raw as Record<string, unknown>;

  if (typeof body.question !== 'string') return { ok: false, error: 'question_missing' };
  const question = tidy(body.question);
  if (!question) return { ok: false, error: 'question_missing' };
  if (question.length > LIMITS.questionChars) return { ok: false, error: 'question_too_long' };

  const level = body.level === undefined ? 'beginner' : body.level;
  if (!(TUTOR_LEVELS as readonly unknown[]).includes(level)) return { ok: false, error: 'level_invalid' };

  const last = index.courseMap.length - 1;
  const order = body.order;
  if (typeof order !== 'number' || !Number.isInteger(order) || order < 0 || order > last) return { ok: false, error: 'order_invalid' };

  let lessonId: string | undefined;
  if (typeof body.lessonId === 'string' && index.courseMap.some((e) => e.lessonId === body.lessonId)) lessonId = body.lessonId;

  const history: TutorTurn[] = [];
  if (body.history !== undefined) {
    if (!Array.isArray(body.history)) return { ok: false, error: 'history_invalid' };
    for (const t of body.history.slice(-LIMITS.historyTurns)) {
      const turn = t as Record<string, unknown> | null;
      if (!turn || (turn.role !== 'user' && turn.role !== 'tutor') || typeof turn.text !== 'string') return { ok: false, error: 'history_invalid' };
      const text = tidy(turn.text).slice(0, LIMITS.turnChars);
      if (text) history.push({ role: turn.role, text });
    }
  }

  const activity = parseActivity(body.activity, index.chunks);
  return {
    ok: true,
    req: { question, lessonId, order, level: level as TutorRequest['level'], history, inQuiz: body.inQuiz === true, ...(activity ? { activity } : {}) },
  };
}

/** The app running on the learner's own computer while the team develops it (any port). */
const LOCAL_DEV_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d{1,5})?$/;

/** May a browser page from this address call the function? The listed addresses, plus local development on any port. */
export function isOriginAllowed(origin: string, allowed: string[]): boolean {
  return allowed.includes(origin) || LOCAL_DEV_ORIGIN.test(origin);
}

export interface LimiterOptions {
  perMinute: number;
  perDay: number;
  /** Across everyone, so a crowd cannot use up the free quota alone. */
  globalPerDay: number;
}

export type LimitResult = { ok: true } | { ok: false; reason: 'minute' | 'day' | 'global'; retryAfterSec: number };

export interface Limiter {
  /** Counts one request against `key` (for example an IP address) and says whether it may go ahead. */
  check(key: string): LimitResult;
}

const MINUTE = 60_000;
const DAY = 86_400_000;

/**
 * A simple fixed-window limiter held in memory. On a serverless host each running copy has its own counts, so this
 * is a polite brake, not a hard guarantee; the free Gemini tier having no billing is the real protection.
 */
export function createLimiter(options: LimiterOptions, now: () => number = Date.now): Limiter {
  const perKey = new Map<string, { minute: number; minuteCount: number; day: number; dayCount: number }>();
  let globalDay = -1;
  let globalCount = 0;

  return {
    check(key) {
      const t = now();
      const minute = Math.floor(t / MINUTE);
      const day = Math.floor(t / DAY);
      if (day !== globalDay) {
        globalDay = day;
        globalCount = 0;
        perKey.clear();
      }
      if (globalCount >= options.globalPerDay) {
        return { ok: false, reason: 'global', retryAfterSec: Math.ceil(((day + 1) * DAY - t) / 1000) };
      }
      let entry = perKey.get(key);
      if (!entry) {
        // keep the table from growing without bound under a flood of different addresses
        if (perKey.size > 5000) perKey.clear();
        entry = { minute, minuteCount: 0, day, dayCount: 0 };
        perKey.set(key, entry);
      }
      if (entry.minute !== minute) {
        entry.minute = minute;
        entry.minuteCount = 0;
      }
      if (entry.dayCount >= options.perDay) {
        return { ok: false, reason: 'day', retryAfterSec: Math.ceil(((day + 1) * DAY - t) / 1000) };
      }
      if (entry.minuteCount >= options.perMinute) {
        return { ok: false, reason: 'minute', retryAfterSec: Math.ceil(((minute + 1) * MINUTE - t) / 1000) };
      }
      entry.minuteCount += 1;
      entry.dayCount += 1;
      globalCount += 1;
      return { ok: true };
    },
  };
}

export interface Breaker {
  /** Stop calling the model for a while, for example after a 429. A shorter `cooldownMs` suits a passing hiccup. */
  trip(reason?: string, cooldownMs?: number): void;
  isOpen(): boolean;
  remainingMs(): number;
  /** Why it was last tripped. */
  reason(): string | undefined;
}

export function createBreaker(cooldownMs: number, now: () => number = Date.now): Breaker {
  let until = 0;
  let why: string | undefined;
  return {
    trip(reason, ms) {
      until = now() + (ms ?? cooldownMs);
      why = reason;
    },
    isOpen: () => now() < until,
    remainingMs: () => Math.max(0, until - now()),
    reason: () => why,
  };
}
