import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { BookOpen, Send, Trash2, X } from 'lucide-react';
import { DrQuantum } from '../shared/DrQuantum';
import { askTutor } from '../../core/tutor/client';
import { loadTutorKnowledge } from '../../core/tutor/loader';
import type { TutorKnowledge } from '../../core/tutor/loader';
import type { TutorPosition } from '../../core/tutor/position';
import { readConsent, readLevel, writeConsent, writeLevel } from '../../core/tutor/prefs';
import type { TutorConsent } from '../../core/tutor/prefs';
import { starterQuestions } from '../../core/tutor/starters';
import { LEVEL_LABELS, LIMITS, TUTOR_LEVELS } from '../../core/tutor/types';
import type { TutorLevel, TutorResponse, TutorSource } from '../../core/tutor/types';
import { safeStorage } from '../../utils/safeStorage';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Where the learner is: the tutor only uses notes up to here. */
  position: TutorPosition;
  /** A quiz is open: the tutor explains ideas but never says which option is right. */
  inQuiz: boolean;
  onOpenLesson: (lessonId: string) => void;
}

interface Message {
  id: number;
  role: 'user' | 'tutor';
  text: string;
  sources?: TutorSource[];
  provider?: TutorResponse['provider'];
  reason?: TutorResponse['reason'];
}

/** Address of the deployed tutor function. Empty when this build has none, and then the tutor answers from the notes on the device. */
const TUTOR_URL = (import.meta.env.VITE_TUTOR_URL as string | undefined)?.trim() ?? '';

/** Longer chip text reads better in the body font than the pixel font. */
const textChip = { whiteSpace: 'normal', textAlign: 'left', fontFamily: 'var(--font-family)', fontSize: '0.82rem', fontWeight: 700, lineHeight: 1.35, maxWidth: '100%' } as const;

const bubble = { borderRadius: 18, padding: '10px 14px', fontSize: '0.92rem', lineHeight: 1.45, fontWeight: 600, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' } as const;

/** Says where an answer came from, in words, so it never relies on colour. */
function provenance(m: Message): string | null {
  if (m.role !== 'tutor') return null;
  if (m.provider === 'gemini') return 'AI answer from the course notes. If it seems off, check the lesson.';
  if (m.provider === 'prepared') return 'Prepared answer from the course notes.';
  if (m.reason === 'off') return 'From the notes on your device (online tutor is off).';
  if (m.reason === 'rate_limited' || m.reason === 'busy') return 'The online tutor is busy right now, so this comes straight from the notes.';
  return 'From the notes on your device (could not reach the online tutor).';
}

export function TutorDrawer({ open, onClose, position, inQuiz, onOpenLesson }: Props) {
  const [knowledge, setKnowledge] = useState<TutorKnowledge | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [consent, setConsent] = useState<TutorConsent | null>(() => readConsent(safeStorage()));
  const [level, setLevel] = useState<TutorLevel>(() => readLevel(safeStorage()));
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Show the start of a new answer (so it can be read from the top), and the end of the chat otherwise
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const last = messages[messages.length - 1];
    const bubbleEl = last?.role === 'tutor' && !busy ? list.querySelector<HTMLElement>(`[data-msg="${last.id}"]`) : null;
    list.scrollTop = bubbleEl ? Math.max(0, bubbleEl.offsetTop - 4) : list.scrollHeight;
  }, [messages, busy, open]);

  const choose = (value: TutorConsent) => {
    setConsent(value);
    writeConsent(safeStorage(), value);
  };

  const pickLevel = (value: TutorLevel) => {
    setLevel(value);
    writeLevel(safeStorage(), value);
  };

  const send = useCallback(
    async (raw: string) => {
      const question = raw.trim();
      if (!question || busy || !knowledge || consent === null) return;
      const history = messages.slice(-LIMITS.historyTurns).map((m) => ({ role: m.role, text: m.text.slice(0, LIMITS.turnChars) }));
      setMessages((prev) => [...prev, { id: nextId.current++, role: 'user', text: question }]);
      setInput('');
      setBusy(true);
      const reply = await askTutor({
        request: { question, lessonId: position.lessonId, order: position.order, level, history, inQuiz },
        index: knowledge.index,
        searcher: knowledge.searcher,
        prepared: knowledge.prepared,
        online: consent === 'online',
        url: TUTOR_URL,
      });
      setMessages((prev) => [...prev, { id: nextId.current++, role: 'tutor', text: reply.answer, sources: reply.sources, provider: reply.provider, reason: reply.reason }]);
      setBusy(false);
    },
    [busy, knowledge, consent, messages, position, level, inQuiz],
  );

  if (!open) return null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const here = knowledge?.index.courseMap.find((e) => e.lessonId === position.lessonId);
  const reached = knowledge?.index.courseMap.find((e) => e.order === position.order);
  const starters = knowledge ? starterQuestions(knowledge.index, position.lessonId, position.order) : [];
  const needsChoice = consent === null;
  const canAsk = !needsChoice && !busy && knowledge !== null;

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
            <DrQuantum size={44} />
            <div style={{ minWidth: 0 }}>
              <div className="pixel" style={{ fontSize: '0.8rem' }}>Ask Dr Quantum</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.3 }}>
                {here ? `Helping with ${here.where}: ${here.title}` : 'Your quantum tutor'}
              </div>
            </div>
          </div>
          <button
            aria-label="Close tutor"
            onClick={onClose}
            style={{ background: 'rgba(255, 255, 255, 0.14)', borderRadius: '50%', width: 44, height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
          >
            <X size={20} />
          </button>
        </div>

        {messages.length === 0 && (
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.4 }}>
            I only use the course notes up to {reached ? reached.where : 'where you are'}, so later modules stay a surprise.
          </div>
        )}

        <div role="radiogroup" aria-label="How much detail" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {TUTOR_LEVELS.map((l) => (
            <button
              key={l}
              role="radio"
              aria-checked={level === l}
              className="chip"
              onClick={() => pickLevel(l)}
              style={{
                flex: '1 1 auto', justifyContent: 'center', padding: '8px 10px', fontSize: '0.54rem',
                background: level === l ? 'var(--yellow)' : undefined, color: level === l ? 'var(--ink)' : undefined,
                borderColor: level === l ? 'var(--yellow-edge)' : undefined,
              }}
            >
              {level === l ? '✓ ' : ''}{LEVEL_LABELS[l]}
            </button>
          ))}
        </div>

        {needsChoice && (
          <div className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="pixel" style={{ fontSize: '0.64rem' }}>Before you ask</div>
            <p style={{ fontSize: '0.84rem', lineHeight: 1.45, fontWeight: 600 }}>
              The online tutor sends your question to Google's free Gemini service, which may use it to improve Google products. Please do not type
              personal information. Or stay offline: you will get answers straight from the course notes on this device.
            </p>
            <button className="btn btn-mint" onClick={() => choose('online')}>Use online tutor</button>
            <button className="chip" onClick={() => choose('offline')} style={{ alignSelf: 'center' }}>Stay offline</button>
          </div>
        )}

        <div ref={listRef} role="log" aria-live="polite" aria-label="Conversation" style={{ flex: 1, minHeight: 0, overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.length === 0 && (
            <div style={{ ...bubble, background: '#fff', color: 'var(--ink)', alignSelf: 'flex-start', maxWidth: '92%' }}>
              Hi! Ask me anything about the lessons you have reached. I answer from the course notes, and I tell you where each answer comes from.
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} data-msg={m.id} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '92%', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ ...bubble, background: m.role === 'user' ? 'var(--yellow)' : '#fff', color: 'var(--ink)' }}>{m.text}</div>
              {provenance(m) && <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.35 }}>{provenance(m)}</div>}
              {m.sources && m.sources.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {m.sources.map((s) => (
                    <button
                      key={`${s.lessonId}:${s.heading}`}
                      className="chip"
                      onClick={() => onOpenLesson(s.lessonId)}
                      style={textChip}
                    >
                      <BookOpen size={14} style={{ flexShrink: 0 }} />
                      <span>{s.where ? `${s.where}: ` : ''}{s.heading}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {busy && <div role="status" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Dr Quantum is thinking…</div>}
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

        {!needsChoice && (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            {TUTOR_URL ? (
              <button role="switch" aria-checked={consent === 'online'} className="chip" onClick={() => choose(consent === 'online' ? 'offline' : 'online')} style={{ fontSize: '0.54rem' }}>
                Online tutor: {consent === 'online' ? 'ON' : 'OFF'}
              </button>
            ) : (
              <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', fontWeight: 600, lineHeight: 1.35 }}>
                No online tutor in this build, so answers come from the notes on your device.
              </span>
            )}
            {messages.length > 0 && (
              <button className="chip" onClick={() => setMessages([])} style={{ fontSize: '0.54rem' }}>
                <Trash2 size={14} />
                <span>Clear chat</span>
              </button>
            )}
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
      </div>
    </div>
  );
}
