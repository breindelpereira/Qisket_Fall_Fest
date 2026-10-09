import { describe, it, expect } from 'vitest';
import {
  HISTORY_KEY, MAX_CHAT_MESSAGES, MAX_HISTORY, MAX_SAVED, SAVED_KEY, addItem, answerFromChat, answerId, canSaveAnswer, isSaved, makeAnswerItem, makeChatItem,
  readHistory, readSaved, removeItem, titleFor, upsertHistory, writeHistory, writeSaved,
} from '../src/core/tutor/saved';
import type { SavedItem, SavedMessage } from '../src/core/tutor/saved';

const NOW = new Date('2026-10-09T12:00:00.000Z');
const ctx = { lessonId: 'module_1', where: 'Module 1', level: 'beginner' as const };
const q = (text: string): SavedMessage => ({ role: 'user', text });
const a = (text: string): SavedMessage => ({ role: 'tutor', text, provider: 'gemini', sources: [{ lessonId: 'module_1', heading: 'The Bloch sphere', where: 'Module 1' }] });

const memory = () => {
  const data: Record<string, string> = {};
  return { data, store: { getItem: (k: string) => data[k] ?? null, setItem: (k: string, v: string) => { data[k] = v; } } };
};

describe('Saved tutor answers and chats', () => {
  it('saves one question with its answer, and the same answer twice is the same item', () => {
    const item = makeAnswerItem(q('What is the Bloch sphere?'), a('A globe for one qubit.'), ctx, NOW);
    expect(item).toMatchObject({ kind: 'answer', title: 'What is the Bloch sphere?', lessonId: 'module_1', where: 'Module 1', level: 'beginner', savedAt: '2026-10-09T12:00:00.000Z' });
    expect(item.messages).toHaveLength(2);
    expect(item.messages[1].sources?.[0]).toEqual({ lessonId: 'module_1', heading: 'The Bloch sphere', where: 'Module 1' });
    expect(item.id).toBe(answerId('What is the Bloch sphere?', 'A globe for one qubit.'));
    expect(makeAnswerItem(q('What is the Bloch sphere?'), a('A globe for one qubit.'), ctx, new Date()).id).toBe(item.id);
    expect(answerId('What is a qubit?', 'A globe for one qubit.')).not.toBe(item.id);
    expect(answerId('What is the Bloch sphere?', 'A different explanation.')).not.toBe(item.id);
  });

  it('saves a whole chat under the chat\'s own id, titled by its first question, keeping at most the last 40 messages', () => {
    const messages = Array.from({ length: 60 }, (_, i) => (i % 2 === 0 ? q(`Question ${i}`) : a(`Answer ${i}`)));
    const chat = makeChatItem('abc123', messages, ctx, NOW);
    expect(chat).toMatchObject({ id: 'c:abc123', kind: 'chat', title: 'Question 0' });
    expect(chat.messages).toHaveLength(MAX_CHAT_MESSAGES);
    expect(chat.messages[0].text).toBe('Question 20');
    expect(makeChatItem('x', [a('only an answer')], ctx, NOW).title).toBe('Chat with Dr Quantum');
  });

  it('shortens long titles at a word and cuts very long text', () => {
    expect(titleFor('Short question?')).toBe('Short question?');
    const long = titleFor('Why does the measurement of a qubit in superposition give a random result every single time I try it?');
    expect(long.length).toBeLessThanOrEqual(71);
    expect(long.endsWith('…')).toBe(true);
    expect(long).not.toMatch(/\s…$/);
    const item = makeAnswerItem(q('Q'), a('x'.repeat(9000)), ctx, NOW);
    expect(item.messages[1].text).toHaveLength(4000);
  });

  it('adds new items at the top, replaces an item with the same id, and refuses a new one when full', () => {
    const one = makeAnswerItem(q('One?'), a('1'), ctx, NOW);
    const two = makeAnswerItem(q('Two?'), a('2'), ctx, NOW);
    let list: SavedItem[] = [];
    const first = addItem(list, one);
    expect(first).toMatchObject({ ok: true, updated: false });
    list = first.ok ? first.list : [];
    const second = addItem(list, two);
    list = second.ok ? second.list : [];
    expect(list.map((s) => s.title)).toEqual(['Two?', 'One?']);
    expect(isSaved(list, one.id)).toBe(true);

    // saving a chat again updates it instead of adding a second copy, and moves it to the top
    const chat1 = makeChatItem('c1', [q('Hi?'), a('Hello')], ctx, NOW);
    list = (addItem(list, chat1) as { list: SavedItem[] }).list;
    list = (addItem(list, two) as { list: SavedItem[] }).list;
    const longer = makeChatItem('c1', [q('Hi?'), a('Hello'), q('More?'), a('Sure')], ctx, NOW);
    const updated = addItem(list, longer);
    expect(updated).toMatchObject({ ok: true, updated: true });
    const after = updated.ok ? updated.list : [];
    expect(after.filter((s) => s.id === 'c:c1')).toHaveLength(1);
    expect(after[0].messages).toHaveLength(4);

    const full = Array.from({ length: MAX_SAVED }, (_, i) => makeAnswerItem(q(`Q${i}`), a(`A${i}`), ctx, NOW));
    expect(addItem(full, one)).toEqual({ ok: false, reason: 'full' });
    expect(addItem(full, full[3])).toMatchObject({ ok: true, updated: true });
  });

  it('removes one item and leaves the rest', () => {
    const one = makeAnswerItem(q('One?'), a('1'), ctx, NOW);
    const two = makeAnswerItem(q('Two?'), a('2'), ctx, NOW);
    expect(removeItem([one, two], one.id)).toEqual([two]);
    expect(removeItem([one], 'nothing')).toEqual([one]);
  });

  it('remembers what was saved, and ignores damaged or unexpected data', () => {
    const { data, store } = memory();
    const item = makeAnswerItem(q('What is a qubit?'), a('The quantum version of a bit.'), ctx, NOW);
    expect(readSaved(store)).toEqual([]);
    expect(writeSaved(store, [item])).toBe(true);
    expect(readSaved(store)).toEqual([item]);

    data[SAVED_KEY] = '{oops';
    expect(readSaved(store)).toEqual([]);
    data[SAVED_KEY] = '{"not":"a list"}';
    expect(readSaved(store)).toEqual([]);
    data[SAVED_KEY] = JSON.stringify([
      item,
      { ...item },
      { id: 'x', kind: 'sideways', savedAt: NOW.toISOString(), messages: [q('hi')] },
      { id: 'y', kind: 'answer', savedAt: 'not a date', messages: [q('hi')] },
      { id: 'z', kind: 'answer', savedAt: NOW.toISOString(), messages: [] },
      { id: 'w', kind: 'answer', savedAt: NOW.toISOString(), level: 'wizard', messages: [{ role: 'robot', text: 'x' }, q('Kept?'), { role: 'tutor', text: '   ' }] },
      42,
      null,
    ]);
    const read = readSaved(store);
    expect(read.map((s) => s.id)).toEqual([item.id, 'w']);
    expect(read[1]).toMatchObject({ level: 'beginner', title: 'Kept?' });
    expect(read[1].messages).toEqual([{ role: 'user', text: 'Kept?' }]);
  });

  it('says so when the browser will not store it', () => {
    const blocked = { getItem: () => { throw new Error('no'); }, setItem: () => { throw new Error('full'); } };
    expect(readSaved(blocked)).toEqual([]);
    expect(writeSaved(blocked, [])).toBe(false);
    expect(readSaved(null)).toEqual([]);
    expect(writeSaved(null, [])).toBe(false);
  });

  it('offers to save model answers and answers that point at a lesson, but not greetings or "not found" replies', () => {
    expect(canSaveAnswer({ role: 'tutor', provider: 'gemini' })).toBe(true);
    expect(canSaveAnswer({ role: 'tutor', provider: 'prepared', sources: [{ lessonId: 'module_1', heading: 'h' }] })).toBe(true);
    expect(canSaveAnswer({ role: 'tutor', provider: 'offline', sources: [{ lessonId: 'module_1', heading: 'h' }] })).toBe(true);
    expect(canSaveAnswer({ role: 'tutor', provider: 'prepared', sources: [] })).toBe(false);
    expect(canSaveAnswer({ role: 'tutor', provider: 'offline' })).toBe(false);
    expect(canSaveAnswer({ role: 'user', provider: 'gemini' })).toBe(false);
  });
});

describe('Chat history: earlier answers can still be saved', () => {
  const chat = (id: string, n = 2) => makeChatItem(id, Array.from({ length: n }, (_, i) => (i % 2 === 0 ? q(`Question ${id}-${i}`) : a(`Answer ${id}-${i}`))), ctx, NOW);

  it('keeps the newest chats on top, replaces a chat that went on, and keeps only the last 20', () => {
    let list: SavedItem[] = [];
    list = upsertHistory(list, chat('one'));
    list = upsertHistory(list, chat('two'));
    expect(list.map((c) => c.id)).toEqual(['c:two', 'c:one']);
    list = upsertHistory(list, chat('one', 4));
    expect(list.map((c) => c.id)).toEqual(['c:one', 'c:two']);
    expect(list[0].messages).toHaveLength(4);

    for (let i = 0; i < 30; i += 1) list = upsertHistory(list, chat(`n${i}`));
    expect(list).toHaveLength(MAX_HISTORY);
    expect(list[0].id).toBe('c:n29');
    expect(list.some((c) => c.id === 'c:one')).toBe(false);
  });

  it('remembers the history separately from what was saved, and survives broken data', () => {
    const data: Record<string, string> = {};
    const store = { getItem: (k: string) => data[k] ?? null, setItem: (k: string, v: string) => { data[k] = v; } };
    expect(readHistory(store)).toEqual([]);
    expect(writeHistory(store, [chat('one')])).toBe(true);
    expect(readHistory(store)).toEqual([chat('one')]);
    expect(readSaved(store)).toEqual([]);
    expect(data[HISTORY_KEY]).toBeDefined();
    expect(data[SAVED_KEY]).toBeUndefined();

    data[HISTORY_KEY] = JSON.stringify(Array.from({ length: 30 }, (_, i) => chat(`m${i}`)));
    expect(readHistory(store)).toHaveLength(MAX_HISTORY);
    data[HISTORY_KEY] = 'not json';
    expect(readHistory(store)).toEqual([]);
    const blocked = { getItem: () => { throw new Error('no'); }, setItem: () => { throw new Error('full'); } };
    expect(readHistory(blocked)).toEqual([]);
    expect(writeHistory(blocked, [])).toBe(false);
  });

  it('turns any answer in an old chat into a saved answer with the question it replied to', () => {
    const old = makeChatItem('old', [q('First?'), a('First answer'), q('Second?'), a('Second answer'), q('Hi'), { role: 'tutor', text: 'Hello!', provider: 'prepared' }], ctx, NOW);
    expect(answerFromChat(old, 1, NOW)).toMatchObject({ kind: 'answer', title: 'First?', where: 'Module 1' });
    const second = answerFromChat(old, 3, NOW);
    expect(second?.messages.map((m) => m.text)).toEqual(['Second?', 'Second answer']);
    expect(second?.id).toBe(answerId('Second?', 'Second answer'));
    expect(answerFromChat(old, 0)).toBeNull();
    expect(answerFromChat(old, 5)).toBeNull();
    expect(answerFromChat(old, 99)).toBeNull();
    // the same answer saved from the live chat and from history is one item, not two
    expect(makeAnswerItem(q('Second?'), a('Second answer'), ctx, NOW).id).toBe(second?.id);
  });
});
