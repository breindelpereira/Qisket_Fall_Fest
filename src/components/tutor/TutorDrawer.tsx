import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { BookOpen, Bookmark, BookmarkCheck, FileText, Gamepad2, HelpCircle, History as HistoryIcon, Library, Plus, Save, Send, SlidersHorizontal, X } from 'lucide-react';
import { Milton } from '../shared/Milton';
import { ACTIVITIES } from '../../content/activities';
import { activityStore } from '../../core/tutor/activityStore';
import { askTutor } from '../../core/tutor/client';
import { loadTutorKnowledge } from '../../core/tutor/loader';
import type { TutorKnowledge } from '../../core/tutor/loader';
import type { TutorPosition } from '../../core/tutor/position';
import { readConsent, readLevel, writeConsent, writeLevel } from '../../core/tutor/prefs';
import type { TutorConsent } from '../../core/tutor/prefs';
import {
  MAX_SAVED, addItem, answerId, canSaveAnswer, isSaved, makeAnswerItem, makeChatItem, readHistory, readSaved, removeItem, upsertHistory, writeHistory, writeSaved,
} from '../../core/tutor/saved';
import type { SavedItem, SavedMessage } from '../../core/tutor/saved';
import { starterQuestions } from '../../core/tutor/starters';
import { LEVEL_LABELS, LIMITS, TUTOR_LEVELS } from '../../core/tutor/types';
import type { ActivityRef, TutorFocus, TutorLevel, TutorResponse, TutorSource } from '../../core/tutor/types';
import { safeStorage } from '../../utils/safeStorage';
import { SavedList } from './SavedList';
import type { KeptTab } from './SavedList';
import { bubble, textChip, toolChip } from './tutorStyles';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Where the learner is: the tutor only uses notes up to here. */
  position: TutorPosition;
  /** A quiz is open: the tutor explains ideas but never says which option is right. */
  inQuiz: boolean;
  onOpenLesson: (lessonId: string) => void;
  /** The part of the page the learner tapped "Ask about this" on: its text goes with every question until it is cleared. */
  focus: TutorFocus | null;
  onClearFocus: () => void;
}

interface Message {
  id: number;
  role: 'user' | 'tutor';
  text: string;
  sources?: TutorSource[];
  provider?: TutorResponse['provider'];
  reason?: TutorResponse['reason'];
}

/**
 * The team's deployed tutor function, used when the build does not set VITE_TUTOR_URL, so a fresh clone and a hosted build
 * both get the online tutor. The address is not a secret: the Gemini key lives only in the Worker, which also limits
 * requests per person and per day. Set VITE_TUTOR_URL to something else to point at another function, or to an empty
 * value to run offline only.
 */
const DEFAULT_TUTOR_URL = 'https://qisket-tutor.qisket-fallfest.workers.dev/api/tutor';
const configured = import.meta.env.VITE_TUTOR_URL as string | undefined;
const TUTOR_URL = configured === undefined ? DEFAULT_TUTOR_URL : configured.trim();

const newChatId = (): string => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** Questions to offer once a part of the page has been chosen: they work for any part, because the part's text goes along. */
const FOCUS_STARTERS = ['Explain this in simple words.', 'Why does this matter?', 'Can you give me an example?'];

const GAME_STATUS_WORDS: Record<ActivityRef['status'], string> = {
  playing: 'playing now',
  finished: 'just finished',
  left: 'played a moment ago',
};

const LAB_STATUS_WORDS: Record<ActivityRef['status'], string> = {
  playing: 'open now',
  finished: 'just finished',
  left: 'used a moment ago',
};

/** Chats and answers picked out of History get today's date in the saved list. */
const fresh = (item: SavedItem): SavedItem => ({ ...item, savedAt: new Date().toISOString() });

const toSaved = (m: Message): SavedMessage => ({ role: m.role, text: m.text, sources: m.sources, provider: m.provider });

/** Says where an answer came from, in words, so it never relies on colour. */
function provenance(m: Message): string | null {
  if (m.role !== 'tutor') return null;
  if (m.provider === 'gemini') return 'AI answer from the course notes. If it seems off, check the lesson.';
  if (m.provider === 'prepared') {
    if (m.reason === 'rate_limited' || m.reason === 'busy') return 'The online tutor is busy right now, so this is a prepared answer from the course notes.';
    if (m.reason === 'unavailable') return 'Could not reach the online tutor, so this is a prepared answer from the course notes.';
    return 'Prepared answer from the course notes.';
  }
  if (m.reason === 'off') return 'From the notes on your device (online tutor is off).';
  if (m.reason === 'rate_limited' || m.reason === 'busy') return 'The online tutor is busy right now, so this comes straight from the notes.';
  return 'From the notes on your device (could not reach the online tutor).';
}

export function TutorDrawer({ open, onClose, position, inQuiz, onOpenLesson, focus, onClearFocus }: Props) {
  const [knowledge, setKnowledge] = useState<TutorKnowledge | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [consent, setConsent] = useState<TutorConsent | null>(() => readConsent(safeStorage()));
  const [level, setLevel] = useState<TutorLevel>(() => readLevel(safeStorage()));
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<'chat' | 'saved'>('chat');
  const [saved, setSaved] = useState<SavedItem[]>(() => readSaved(safeStorage()));
  // earlier chats, kept automatically so an answer from one of them can still be saved later
  const [pastChats, setPastChats] = useState<SavedItem[]>(() => readHistory(safeStorage()));
  const [keptTab, setKeptTab] = useState<KeptTab>('saved');
  // stays the same while a chat goes on, so saving the chat again updates the saved copy instead of adding another
  const [chatId, setChatId] = useState(newChatId);
  const [notice, setNotice] = useState<string | null>(null);
  // the game the learner is playing or has just left, and whether the tutor may be told about it
  const [activity, setActivity] = useState<ActivityRef | null>(null);
  const [shareGame, setShareGame] = useState(true);
  // level, online switch, saved, history and chat tools live behind one button, so the conversation gets the room
  const [menuOpen, setMenuOpen] = useState(false);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = useRef(1);
  const listRef = useRef<HTMLDivElement>(null);

  // Load the notes the first time the drawer opens
  useEffect(() => {
    if (!open || knowledge) return;
    let cancelled = false;
    loadTutorKnowledge()
      .then((k) => {
        if (!cancelled) setKnowledge(k);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [open, knowledge]);

  // Ask the games what they are showing, each time the drawer opens
  useEffect(() => {
    if (!open) return;
    const refresh = () => setActivity(activityStore.read());
    refresh();
    return activityStore.subscribe(refresh);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(
    () => () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    },
    [],
  );

  // Show the start of a new answer (so it can be read from the top), and the end of the chat otherwise
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const last = messages[messages.length - 1];
    const bubbleEl = last?.role === 'tutor' && !busy ? list.querySelector<HTMLElement>(`[data-msg="${last.id}"]`) : null;
    list.scrollTop = bubbleEl ? Math.max(0, bubbleEl.offsetTop - 4) : list.scrollHeight;
  }, [messages, busy, open, view]);

  const choose = (value: TutorConsent) => {
    setConsent(value);
    writeConsent(safeStorage(), value);
  };

  const pickLevel = (value: TutorLevel) => {
    setLevel(value);
    writeLevel(safeStorage(), value);
  };

  // A quiz is no place for game help, and the learner can switch the sharing off
  const gameTitle = activity ? ACTIVITIES[activity.id]?.title : undefined;
  const gameForTutor = shareGame && !inQuiz && gameTitle ? activity : null;
  const isLab = activity ? ACTIVITIES[activity.id]?.kind === 'sim' : false;

  const send = useCallback(
    async (raw: string) => {
      const question = raw.trim();
      if (!question || busy || !knowledge || consent === null) return;
      const recent = messages.slice(-LIMITS.historyTurns).map((m) => ({ role: m.role, text: m.text.slice(0, LIMITS.turnChars) }));
      const userMessage: Message = { id: nextId.current++, role: 'user', text: question };
      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setBusy(true);
      const reply = await askTutor({
        request: { question, lessonId: position.lessonId, order: position.order, level, history: recent, inQuiz, ...(gameForTutor ? { activity: gameForTutor } : {}), ...(focus ? { focus } : {}) },
        index: knowledge.index,
        searcher: knowledge.searcher,
        prepared: knowledge.prepared,
        online: consent === 'online',
        url: TUTOR_URL,
      });
      const tutorMessage: Message = { id: nextId.current++, role: 'tutor', text: reply.answer, sources: reply.sources, provider: reply.provider, reason: reply.reason };
      setMessages((prev) => [...prev, tutorMessage]);
      setBusy(false);
      // keep the conversation so far in History, so it is not lost when a new chat is started or the app is closed
      const where = knowledge.index.courseMap.find((e) => e.lessonId === position.lessonId)?.where;
      const chat = makeChatItem(chatId, [...messages, userMessage, tutorMessage].map(toSaved), { lessonId: position.lessonId, where, level });
      const list = upsertHistory(pastChats, chat);
      writeHistory(safeStorage(), list);
      setPastChats(list);
    },
    [busy, knowledge, consent, messages, position, level, inQuiz, chatId, pastChats, gameForTutor, focus],
  );

  if (!open) return null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const here = knowledge?.index.courseMap.find((e) => e.lessonId === position.lessonId);
  const reached = knowledge?.index.courseMap.find((e) => e.order === position.order);
  const starters = focus
    ? FOCUS_STARTERS
    : knowledge
      ? starterQuestions(knowledge.index, position.lessonId, position.order, gameForTutor ?? undefined)
      : [];
  const needsChoice = consent === null;
  const canAsk = !needsChoice && !busy && knowledge !== null;

  // ---- saving ----
  const flash = (text: string) => {
    setNotice(text);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 4000);
  };

  /** Stores the new list, and only then shows it: if the browser refuses, the learner is told instead of being shown a false "saved". */
  const commit = (list: SavedItem[], done: string) => {
    if (!writeSaved(safeStorage(), list)) {
      flash('Could not save here: this browser is not allowing storage.');
      return;
    }
    setSaved(list);
    flash(done);
  };

  const saveContext = { lessonId: position.lessonId, where: here?.where, level };

  /** The question a tutor message answered. */
  const questionFor = (index: number): Message | undefined => messages.slice(0, index).reverse().find((m) => m.role === 'user');

  /** Saves an answer, or takes it back out if it was already saved. */
  const toggleItem = (item: SavedItem) => {
    if (isSaved(saved, item.id)) {
      commit(removeItem(saved, item.id), 'Removed from saved.');
      return;
    }
    const result = addItem(saved, item);
    if (!result.ok) {
      flash(`Your saved list is full (${MAX_SAVED}). Open Saved and delete something first.`);
      return;
    }
    commit(result.list, 'Answer saved.');
  };

  const toggleAnswer = (index: number) => {
    const answer = messages[index];
    const question = questionFor(index);
    if (answer && question) toggleItem(makeAnswerItem(toSaved(question), toSaved(answer), saveContext));
  };

  /** Saves a whole conversation. Saving the same chat again updates the saved copy. */
  const keepChat = (item: SavedItem) => {
    const result = addItem(saved, item);
    if (!result.ok) {
      flash(`Your saved list is full (${MAX_SAVED}). Open Saved and delete something first.`);
      return;
    }
    commit(result.list, result.updated ? 'Saved chat updated.' : 'Chat saved.');
  };

  const saveChat = () => keepChat(makeChatItem(chatId, messages.map(toSaved), saveContext));

  // the chat so far stays in History, so starting a new one loses nothing
  const newChat = () => {
    setMessages([]);
    setChatId(newChatId());
    flash('New chat started. The last one is in History.');
  };

  const openKept = (tab: KeptTab) => {
    setKeptTab(tab);
    setView('saved');
  };

  const keepHistory = (list: SavedItem[]) => {
    writeHistory(safeStorage(), list);
    setPastChats(list);
  };


  const inSaved = view === 'saved';

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(23, 6, 54, 0.7)', backdropFilter: 'blur(6px)',
        display: 'flex', justifyContent: 'center', alignItems: 'flex-end', zIndex: 50,
      }}
    >
      <div
        role="dialog"
        aria-label="AI Quantum Tutor"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 440, background: 'var(--bg-surface-elevated)', borderTopLeftRadius: 28, borderTopRightRadius: 28,
          padding: 18, borderTop: '3px solid var(--yellow)', display: 'flex', flexDirection: 'column', gap: 12, height: '85dvh', maxHeight: 680,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <Milton size={44} />
            <div style={{ minWidth: 0 }}>
              <div className="pixel" style={{ fontSize: '0.8rem' }}>Dr. Milton Schrody</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.3 }}>
                {here ? `Helping with ${here.where}: ${here.title}` : 'Your quantum tutor'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            {!inSaved && (
              <button
                aria-label="Tutor settings and tools"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
                style={{ background: menuOpen ? 'var(--yellow)' : 'rgba(255, 255, 255, 0.14)', color: menuOpen ? 'var(--ink)' : '#fff', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <SlidersHorizontal size={20} />
              </button>
            )}
            <button
              aria-label="Close tutor"
              onClick={onClose}
              style={{ background: 'rgba(255, 255, 255, 0.14)', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {inSaved ? (
          <>
            {notice && (
              <div role="status" style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--mint)', lineHeight: 1.35 }}>
                {notice}
              </div>
            )}
            <SavedList
            tab={keptTab}
            onTab={setKeptTab}
            saved={saved}
            history={pastChats}
            isSavedId={(id) => isSaved(saved, id)}
            onToggleAnswer={(answer) => toggleItem(fresh(answer))}
            onSaveChat={(chat) => keepChat(fresh(chat))}
            onDeleteSaved={(id) => commit(removeItem(saved, id), 'Deleted.')}
            onDeleteHistory={(id) => keepHistory(removeItem(pastChats, id))}
            onClearHistory={() => keepHistory([])}
            onOpenLesson={onOpenLesson}
            onBack={() => setView('chat')}
          />
          </>
        ) : (
          <>
            {menuOpen && !needsChoice && (
              <div className="card" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="eyebrow">How much detail</div>
                <div role="radiogroup" aria-label="How much detail" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {TUTOR_LEVELS.map((l) => (
                    <button
                      key={l}
                      role="radio"
                      aria-checked={level === l}
                      className="chip"
                      onClick={() => pickLevel(l)}
                      style={{
                        flex: '1 1 auto', justifyContent: 'center', padding: '8px 6px', fontSize: '0.54rem',
                        background: level === l ? 'var(--yellow)' : undefined, color: level === l ? 'var(--ink)' : undefined,
                        borderColor: level === l ? 'var(--yellow-edge)' : undefined,
                      }}
                    >
                      {level === l ? '✓ ' : ''}{LEVEL_LABELS[l]}
                    </button>
                  ))}
                </div>
                {TUTOR_URL ? (
                  <button role="switch" aria-checked={consent === 'online'} className="chip" onClick={() => choose(consent === 'online' ? 'offline' : 'online')} style={{ ...toolChip, alignSelf: 'flex-start' }}>
                    Online tutor: {consent === 'online' ? 'ON' : 'OFF'}
                  </button>
                ) : (
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', fontWeight: 600, lineHeight: 1.35 }}>
                    No online tutor in this build, so answers come from the notes on your device.
                  </span>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <button className="chip" onClick={() => { setMenuOpen(false); openKept('saved'); }} style={toolChip}>
                    <Library size={14} /><span>Saved ({saved.length})</span>
                  </button>
                  <button className="chip" onClick={() => { setMenuOpen(false); openKept('history'); }} style={toolChip}>
                    <HistoryIcon size={14} /><span>History ({pastChats.length})</span>
                  </button>
                  {messages.length >= 2 && (
                    <button className="chip" onClick={() => { saveChat(); setMenuOpen(false); }} style={toolChip}>
                      <Save size={14} /><span>Save chat</span>
                    </button>
                  )}
                  {messages.length > 0 && (
                    <button className="chip" onClick={() => { newChat(); setMenuOpen(false); }} style={toolChip}>
                      <Plus size={14} /><span>New chat</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {(focus || (activity && gameTitle && !inQuiz)) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {focus && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255, 210, 63, 0.12)', border: '2px solid var(--yellow)', borderRadius: 14, padding: '0 0 0 10px', maxWidth: '100%', minWidth: 0 }}>
                    <FileText size={14} color="var(--yellow)" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>
                      {focus.label}
                    </span>
                    <button
                      aria-label="Stop asking about this part"
                      onClick={onClearFocus}
                      style={{ width: 44, height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: 'transparent' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                {activity && gameTitle && !inQuiz && (
                  <button
                    role="switch"
                    aria-checked={shareGame}
                    aria-label={`${shareGame ? 'Sharing' : 'Not sharing'} your ${isLab ? 'lab' : 'game'} screen with the tutor. Tap to change.`}
                    className="chip"
                    onClick={() => setShareGame((v) => !v)}
                    style={{ ...textChip, fontSize: '0.72rem', maxWidth: '100%', ...(shareGame ? { background: 'var(--mint)', color: 'var(--ink)', borderColor: 'var(--mint-edge)' } : {}) }}
                  >
                    <Gamepad2 size={14} style={{ flexShrink: 0 }} />
                    <span>{gameTitle} · {(isLab ? LAB_STATUS_WORDS : GAME_STATUS_WORDS)[activity.status]}{shareGame ? '' : ' · not shared'}</span>
                  </button>
                )}
              </div>
            )}

            {needsChoice && (
              <div className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="pixel" style={{ fontSize: '0.64rem' }}>Before you ask</div>
                <p style={{ fontSize: '0.84rem', lineHeight: 1.45, fontWeight: 600 }}>
                  The online tutor sends your question to Google's free Gemini service, which may use it to improve Google products. If you are in a game,
                  it also sends a short note about your game or lab screen (the level or settings and what you did), which you can switch off. Please do not type
                  personal information. Or stay offline: you will get answers straight from the course notes on this device.
                </p>
                <button className="btn btn-mint" onClick={() => choose('online')}>Use online tutor</button>
                <button className="chip" onClick={() => choose('offline')} style={{ alignSelf: 'center' }}>Stay offline</button>
              </div>
            )}

            <div ref={listRef} role="log" aria-live="polite" aria-label="Conversation" style={{ flex: 1, minHeight: 0, overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.length === 0 && (
                <div style={{ ...bubble, background: '#fff', color: 'var(--ink)', alignSelf: 'flex-start', maxWidth: '92%' }}>
                  Hi! Ask me anything about the lessons up to {reached ? reached.where : 'where you are'}. I answer from the course notes and tell you where each answer comes from. Later modules stay a surprise.
                </div>
              )}
              {messages.map((m, index) => {
                const asked = canSaveAnswer(m) ? questionFor(index) : undefined;
                const answerSaved = asked ? isSaved(saved, answerId(asked.text, m.text)) : false;
                return (
                  <div key={m.id} data-msg={m.id} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '92%', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ ...bubble, background: m.role === 'user' ? 'var(--yellow)' : '#fff', color: 'var(--ink)' }}>{m.text}</div>
                    {provenance(m) && <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.35 }}>{provenance(m)}</div>}
                    {((m.sources && m.sources.length > 0) || asked) && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                        {m.sources?.map((s) =>
                          // a passage about the game or lab being played is a question of its own: tapping it asks it
                          s.where === 'Game' || s.where === 'Lab' ? (
                            <button
                              key={`${s.lessonId}:${s.heading}`}
                              className="chip"
                              disabled={!canAsk}
                              onClick={() => void send(s.heading)}
                              aria-label={`Ask: ${s.heading}`}
                              style={{ ...textChip, opacity: canAsk ? 1 : 0.6 }}
                            >
                              <HelpCircle size={14} style={{ flexShrink: 0 }} />
                              <span>{s.heading}</span>
                            </button>
                          ) : (
                            <button
                              key={`${s.lessonId}:${s.heading}`}
                              className="chip"
                              onClick={() => onOpenLesson(s.lessonId)}
                              style={textChip}
                            >
                              <BookOpen size={14} style={{ flexShrink: 0 }} />
                              <span>{s.where ? `${s.where}: ` : ''}{s.heading}</span>
                            </button>
                          ),
                        )}
                        {asked && (
                          <button
                            className="chip"
                            aria-pressed={answerSaved}
                            aria-label={answerSaved ? 'Saved. Tap to remove this answer from saved' : 'Save this answer with its question'}
                            onClick={() => toggleAnswer(index)}
                            style={{ minWidth: 44, justifyContent: 'center', ...(answerSaved ? { background: 'var(--mint)', color: 'var(--ink)', borderColor: 'var(--mint-edge)' } : {}) }}
                          >
                            {answerSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {busy && <div role="status" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Dr. Milton Schrody is thinking…</div>}
              {loadFailed && <div style={{ fontSize: '0.8rem', color: 'var(--pink)', fontWeight: 700 }}>The notes could not be loaded. Close the tutor and try again.</div>}
              {messages.length === 0 && !needsChoice && starters.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                  <div className="eyebrow">Try asking</div>
                  {starters.map((q) => (
                    <button key={q} className="chip" disabled={!canAsk} onClick={() => void send(q)} style={{ ...textChip, opacity: canAsk ? 1 : 0.6 }}>
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {notice && (
              <div role="status" style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--mint)', lineHeight: 1.35 }}>
                {notice}
              </div>
            )}

            <form onSubmit={submit} style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder={needsChoice ? 'Choose an option above first' : 'Ask a question...'}
                aria-label="Your question"
                value={input}
                maxLength={LIMITS.questionChars}
                disabled={needsChoice}
                onChange={(e) => setInput(e.target.value)}
                style={{
                  flex: 1, minWidth: 0, minHeight: 48, background: 'rgba(0, 0, 0, 0.3)', border: '2px solid var(--border-subtle)',
                  borderRadius: 16, padding: '10px 14px', color: '#fff', fontSize: '1rem', fontWeight: 600,
                }}
              />
              <button type="submit" className="btn" aria-label="Send" disabled={!canAsk || input.trim() === ''} style={{ width: 56, padding: 0, flexShrink: 0, opacity: canAsk && input.trim() !== '' ? 1 : 0.6 }}>
                <Send size={20} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
