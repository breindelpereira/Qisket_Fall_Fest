import { TUTOR_LEVELS } from './types.ts';
import type { TutorLevel, TutorProvider, TutorSource } from './types.ts';

/**
 * Saving tutor answers on the device: one answer with its question (when the learner liked the explanation), or a whole
 * conversation (to keep track of what they asked). Everything stays in this browser's storage; nothing is sent anywhere.
 */

export const SAVED_KEY = 'qisket_tutor_saved_v1';
/** The most things that can be saved. When it is full the learner is asked to delete something, rather than losing an old one silently. */
export const MAX_SAVED = 50;
/**
 * Past conversations are kept too, automatically and on the device only, so an answer from an earlier chat can still be found and
 * saved later (after "New chat", or after the app was closed). Only the most recent ones are kept.
 */
export const HISTORY_KEY = 'qisket_tutor_history_v1';
export const MAX_HISTORY = 20;
export const MAX_CHAT_MESSAGES = 40;
const MAX_TEXT = 4000;
const MAX_SOURCES = 8;
const TITLE_CHARS = 70;

export interface SavedMessage {
  role: 'user' | 'tutor';
  text: string;
  sources?: TutorSource[];
  provider?: TutorProvider;
}

export interface SavedItem {
  /** For an answer: made from the question and answer text, so saving the same answer twice is the same item. For a chat: the chat's own id. */
  id: string;
  kind: 'answer' | 'chat';
  /** ISO date and time. */
  savedAt: string;
  /** The first question, shortened. */
  title: string;
  lessonId?: string;
  /** Where the learner was, for example "Module 2". */
  where?: string;
  level: TutorLevel;
  messages: SavedMessage[];
}

export interface SaveContext {
  lessonId?: string;
  where?: string;
  level: TutorLevel;
}

/** A short, stable fingerprint of some text (FNV-1a), good enough to recognise the same answer again. */
function fingerprint(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36);
}

export const answerId = (question: string, answer: string): string => `a:${fingerprint(`${question}\n${answer}`)}`;

/** The first question of a conversation, cut at a word. */
export function titleFor(text: string): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  if (flat.length <= TITLE_CHARS) return flat;
  const cut = flat.slice(0, TITLE_CHARS);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), TITLE_CHARS / 2)).replace(/[,;:\s]+$/, '')}…`;
}

const clip = (text: string): string => text.slice(0, MAX_TEXT);

const keep = (m: SavedMessage): SavedMessage => ({
  role: m.role,
  text: clip(m.text),
  ...(m.sources && m.sources.length > 0 ? { sources: m.sources.slice(0, MAX_SOURCES).map((s) => ({ lessonId: s.lessonId, heading: s.heading, ...(s.where ? { where: s.where } : {}) })) } : {}),
  ...(m.provider ? { provider: m.provider } : {}),
});

/** One question with the answer the learner liked. */
export function makeAnswerItem(question: SavedMessage, answer: SavedMessage, ctx: SaveContext, now: Date = new Date()): SavedItem {
  return {
    id: answerId(question.text, answer.text),
    kind: 'answer',
    savedAt: now.toISOString(),
    title: titleFor(question.text),
    ...(ctx.lessonId ? { lessonId: ctx.lessonId } : {}),
    ...(ctx.where ? { where: ctx.where } : {}),
    level: ctx.level,
    messages: [keep(question), keep(answer)],
  };
}

/** A whole conversation. `chatId` stays the same while the chat goes on, so saving it again updates the saved copy. */
export function makeChatItem(chatId: string, messages: SavedMessage[], ctx: SaveContext, now: Date = new Date()): SavedItem {
  const firstQuestion = messages.find((m) => m.role === 'user')?.text ?? 'Chat with Dr. Milton Schrody';
  return {
    id: `c:${chatId}`,
    kind: 'chat',
    savedAt: now.toISOString(),
    title: titleFor(firstQuestion),
    ...(ctx.lessonId ? { lessonId: ctx.lessonId } : {}),
    ...(ctx.where ? { where: ctx.where } : {}),
    level: ctx.level,
    messages: messages.slice(-MAX_CHAT_MESSAGES).map(keep),
  };
}

export type AddResult = { ok: true; list: SavedItem[]; updated: boolean } | { ok: false; reason: 'full' };

/** Adds an item at the top. An item with the same id replaces the old one (saving a chat again updates it). */
export function addItem(list: SavedItem[], item: SavedItem): AddResult {
  const exists = list.some((s) => s.id === item.id);
  if (!exists && list.length >= MAX_SAVED) return { ok: false, reason: 'full' };
  return { ok: true, list: [item, ...list.filter((s) => s.id !== item.id)], updated: exists };
}

export const removeItem = (list: SavedItem[], id: string): SavedItem[] => list.filter((s) => s.id !== id);

export const isSaved = (list: SavedItem[], id: string): boolean => list.some((s) => s.id === id);

type Store = Pick<Storage, 'getItem' | 'setItem'> | null;

const isSource = (s: unknown): s is TutorSource =>
  typeof s === 'object' && s !== null && typeof (s as TutorSource).lessonId === 'string' && typeof (s as TutorSource).heading === 'string';

function cleanMessage(raw: unknown): SavedMessage | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const m = raw as Record<string, unknown>;
  if ((m.role !== 'user' && m.role !== 'tutor') || typeof m.text !== 'string' || m.text.trim() === '') return null;
  const sources = Array.isArray(m.sources) ? m.sources.filter(isSource) : [];
  const provider = m.provider === 'gemini' || m.provider === 'prepared' || m.provider === 'offline' ? m.provider : undefined;
  return keep({ role: m.role, text: m.text, sources, provider });
}

function cleanItem(raw: unknown): SavedItem | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' || (r.kind !== 'answer' && r.kind !== 'chat') || typeof r.savedAt !== 'string' || Number.isNaN(Date.parse(r.savedAt))) return null;
  if (!Array.isArray(r.messages)) return null;
  const messages = r.messages.map(cleanMessage).filter((m): m is SavedMessage => m !== null).slice(0, MAX_CHAT_MESSAGES);
  if (messages.length === 0) return null;
  const level = (TUTOR_LEVELS as readonly unknown[]).includes(r.level) ? (r.level as TutorLevel) : 'beginner';
  return {
    id: r.id,
    kind: r.kind,
    savedAt: r.savedAt,
    title: typeof r.title === 'string' && r.title.trim() ? titleFor(r.title) : titleFor(messages[0].text),
    ...(typeof r.lessonId === 'string' ? { lessonId: r.lessonId } : {}),
    ...(typeof r.where === 'string' ? { where: r.where.slice(0, 60) } : {}),
    level,
    messages,
  };
}

/** Reads a stored list. Anything damaged or unexpected is dropped instead of breaking the tutor. */
function readList(store: Store, key: string, max: number): SavedItem[] {
  let raw: string | null = null;
  try {
    raw = store?.getItem(key) ?? null;
  } catch {
    return [];
  }
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    const seen = new Set<string>();
    const items: SavedItem[] = [];
    for (const entry of data) {
      const item = cleanItem(entry);
      if (item && !seen.has(item.id)) {
        seen.add(item.id);
        items.push(item);
      }
    }
    return items.slice(0, max);
  } catch {
    return [];
  }
}

/** Returns false when the browser would not store it (storage full or blocked), so the app can say so instead of pretending. */
function writeList(store: Store, key: string, list: SavedItem[]): boolean {
  if (!store) return false;
  try {
    store.setItem(key, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

export const readSaved = (store: Store): SavedItem[] => readList(store, SAVED_KEY, MAX_SAVED);
export const writeSaved = (store: Store, list: SavedItem[]): boolean => writeList(store, SAVED_KEY, list);
export const readHistory = (store: Store): SavedItem[] => readList(store, HISTORY_KEY, MAX_HISTORY);
export const writeHistory = (store: Store, list: SavedItem[]): boolean => writeList(store, HISTORY_KEY, list);

/** Puts a conversation at the top of the history (the same chat, asked more, replaces its older copy) and keeps only the latest few. */
export function upsertHistory(list: SavedItem[], chat: SavedItem): SavedItem[] {
  return [chat, ...list.filter((s) => s.id !== chat.id)].slice(0, MAX_HISTORY);
}

/** The answer at `index` of a stored chat, with the question it replied to, ready to save on its own. Null if it is not worth saving. */
export function answerFromChat(chat: SavedItem, index: number, now: Date = new Date()): SavedItem | null {
  const answer = chat.messages[index];
  if (!answer || !canSaveAnswer(answer)) return null;
  const question = chat.messages.slice(0, index).reverse().find((m) => m.role === 'user');
  if (!question) return null;
  return makeAnswerItem(question, answer, { lessonId: chat.lessonId, where: chat.where, level: chat.level }, now);
}

/** Whether an answer is worth keeping: a model answer, or any answer that points at a lesson. Greetings and "not found" replies are not. */
export const canSaveAnswer = (m: { role: string; provider?: TutorProvider; sources?: TutorSource[] }): boolean =>
  m.role === 'tutor' && (m.provider === 'gemini' || (m.sources?.length ?? 0) > 0);
