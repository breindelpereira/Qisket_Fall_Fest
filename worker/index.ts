import index from '../tutor/index.json';
import { answerQuestion, createServerState, DEFAULT_LIMITS } from '../src/core/tutor/server.ts';
import type { TutorServerState } from '../src/core/tutor/server.ts';
import { createSearcher } from '../src/core/tutor/search.ts';
import type { TutorIndex } from '../src/core/tutor/types.ts';

/**
 * The AI Tutor's serverless function (Cloudflare Workers). It holds the Gemini API key, which is why the app never
 * talks to Google directly. All the real logic is in src/core/tutor/server.ts; this file only does the web part:
 * routes, CORS, reading the request and the settings.
 *
 * Settings (see worker/README.md):
 *   GEMINI_API_KEY    secret, set with `wrangler secret put`; never in the repo
 *   TUTOR_MODEL       model code from Google AI Studio, e.g. gemini-3.5-flash-lite
 *   ALLOWED_ORIGINS   comma-separated list of web addresses allowed to call this from a browser
 *   RATE_PER_MINUTE, RATE_PER_DAY, GLOBAL_PER_DAY, TUTOR_TEMPERATURE   optional
 */
interface Env {
  GEMINI_API_KEY?: string;
  TUTOR_MODEL?: string;
  ALLOWED_ORIGINS?: string;
  RATE_PER_MINUTE?: string;
  RATE_PER_DAY?: string;
  GLOBAL_PER_DAY?: string;
  TUTOR_TEMPERATURE?: string;
}

const tutorIndex = index as unknown as TutorIndex;
const searcher = createSearcher(tutorIndex.chunks);
const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
const MAX_BODY_BYTES = 8 * 1024;

// Counts live as long as this copy of the worker does (see the note in guards.ts)
let state: TutorServerState | undefined;

const num = (value: string | undefined, fallback: number): number => {
  const n = Number(value);
  return value !== undefined && value !== '' && Number.isFinite(n) && n > 0 ? n : fallback;
};

function json(body: unknown, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...headers } });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const allowed = (env.ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    const origin = request.headers.get('origin');
    // Browsers always send an Origin; tools like curl do not. A browser from any other website is refused.
    const originOk = origin === null || allowed.includes(origin);
    const cors: Record<string, string> = origin && originOk ? { 'access-control-allow-origin': origin, vary: 'Origin' } : { vary: 'Origin' };

    const url = new URL(request.url);
    if (request.method === 'OPTIONS') {
      if (!originOk) return new Response(null, { status: 403 });
      return new Response(null, {
        status: 204,
        headers: { ...cors, 'access-control-allow-methods': 'POST, GET, OPTIONS', 'access-control-allow-headers': 'content-type', 'access-control-max-age': '86400' },
      });
    }
    if (!originOk) return json({ error: 'origin_not_allowed' }, 403, cors);

    if (request.method === 'GET' && url.pathname === '/api/health') {
      return json({ ok: true, configured: Boolean(env.GEMINI_API_KEY), model: env.TUTOR_MODEL ?? DEFAULT_MODEL, passages: tutorIndex.chunks.length }, 200, cors);
    }
    if (request.method !== 'POST' || (url.pathname !== '/api/tutor' && url.pathname !== '/')) return json({ error: 'not_found' }, 404, cors);

    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return json({ error: 'too_large' }, 413, cors);
    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      return json({ error: 'bad_json' }, 400, cors);
    }

    state ??= createServerState({
      perMinute: num(env.RATE_PER_MINUTE, DEFAULT_LIMITS.perMinute),
      perDay: num(env.RATE_PER_DAY, DEFAULT_LIMITS.perDay),
      globalPerDay: num(env.GLOBAL_PER_DAY, DEFAULT_LIMITS.globalPerDay),
    });
    const result = await answerQuestion(
      raw,
      request.headers.get('cf-connecting-ip') ?? 'unknown',
      {
        apiKey: env.GEMINI_API_KEY ?? '',
        model: env.TUTOR_MODEL ?? DEFAULT_MODEL,
        temperature: env.TUTOR_TEMPERATURE ? num(env.TUTOR_TEMPERATURE, 1) : undefined,
        timeoutMs: 8000,
      },
      state,
      { index: tutorIndex, searcher },
    );
    return json(result.body, result.status, cors);
  },
};
