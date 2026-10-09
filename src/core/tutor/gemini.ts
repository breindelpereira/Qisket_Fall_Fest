import type { BuiltPrompt } from './prompt.ts';

/** Why a call to the model did not give an answer. */
export type GeminiFailure = 'rate_limited' | 'timeout' | 'server' | 'network' | 'blocked' | 'bad_request' | 'auth' | 'empty';

export type GeminiResult =
  | { ok: true; text: string; truncated: boolean }
  | { ok: false; kind: GeminiFailure; status?: number; message?: string };

export interface GeminiConfig {
  apiKey: string;
  /** Model code from Google AI Studio, e.g. gemini-3.5-flash-lite. Kept in an environment variable so it can change without a release. */
  model: string;
  /** Includes the model's own thinking tokens, so leave room beyond the visible answer. */
  maxOutputTokens?: number;
  /** Left unset by default: Google recommends the default for Gemini 3 models. */
  temperature?: number;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

export const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
export const DEFAULT_MAX_OUTPUT_TOKENS = 1024;
export const DEFAULT_TIMEOUT_MS = 10_000;

/** A model code is letters, digits, dots and dashes only, so it can never change the URL it is put in. */
export const isSafeModelName = (model: string): boolean => /^[a-z0-9][a-z0-9.-]{1,60}$/.test(model);

export function buildGeminiBody(prompt: Pick<BuiltPrompt, 'system' | 'contents'>, config: Pick<GeminiConfig, 'maxOutputTokens' | 'temperature'>) {
  const generationConfig: Record<string, number> = { maxOutputTokens: config.maxOutputTokens ?? DEFAULT_MAX_OUTPUT_TOKENS };
  if (config.temperature !== undefined) generationConfig.temperature = config.temperature;
  return {
    systemInstruction: { parts: [{ text: prompt.system }] },
    contents: prompt.contents,
    generationConfig,
  };
}

interface GeminiPart {
  text?: string;
  thought?: boolean;
}
interface GeminiBody {
  candidates?: { content?: { parts?: GeminiPart[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
  error?: { message?: unknown };
}

const BLOCKED_FINISH = new Set(['SAFETY', 'PROHIBITED_CONTENT', 'BLOCKLIST', 'SPII', 'RECITATION']);

/** Turns an HTTP status and body into either the answer text or the reason there is none. */
export function parseGeminiResponse(status: number, body: unknown): GeminiResult {
  const data = (body ?? {}) as GeminiBody;
  // Google's own explanation of an error, kept short so it can be logged and shown to the team
  const message = typeof data.error?.message === 'string' ? data.error.message.slice(0, 200) : undefined;
  const fail = (kind: GeminiFailure): GeminiResult => ({ ok: false, kind, status, message });
  if (status === 429) return fail('rate_limited');
  if (status === 401 || status === 403) return fail('auth');
  if (status === 408 || status === 504) return fail('timeout');
  if (status >= 500) return fail('server');
  if (status >= 400) return fail('bad_request');

  if (data.promptFeedback?.blockReason) return fail('blocked');
  const candidate = data.candidates?.[0];
  if (candidate?.finishReason && BLOCKED_FINISH.has(candidate.finishReason)) return fail('blocked');
  const text = (candidate?.content?.parts ?? [])
    .filter((p) => !p.thought && typeof p.text === 'string')
    .map((p) => p.text)
    .join('')
    .trim();
  if (!text) return { ok: false, kind: 'empty', status, message: candidate?.finishReason ? `finish reason ${candidate.finishReason}` : undefined };
  return { ok: true, text, truncated: candidate?.finishReason === 'MAX_TOKENS' };
}

/** One call to the Gemini API. Never throws: every problem comes back as a `kind`. */
export async function callGemini(prompt: Pick<BuiltPrompt, 'system' | 'contents'>, config: GeminiConfig): Promise<GeminiResult> {
  if (!config.apiKey || !isSafeModelName(config.model)) return { ok: false, kind: 'bad_request' };
  const doFetch = config.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  try {
    const res = await doFetch(`${GEMINI_BASE}/${config.model}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': config.apiKey },
      body: JSON.stringify(buildGeminiBody(prompt, config)),
      signal: controller.signal,
    });
    let json: unknown = null;
    try {
      json = await res.json();
    } catch {
      // an error page or an empty body: the status alone decides
    }
    return parseGeminiResponse(res.status, json);
  } catch (e) {
    return { ok: false, kind: (e as { name?: string })?.name === 'AbortError' ? 'timeout' : 'network' };
  } finally {
    clearTimeout(timer);
  }
}
