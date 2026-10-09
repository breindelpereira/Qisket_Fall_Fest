import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, Bookmark, BookmarkCheck, ChevronDown, ChevronUp, Save, Trash2 } from 'lucide-react';
import { MAX_HISTORY, MAX_SAVED, answerFromChat } from '../../core/tutor/saved';
import type { SavedItem } from '../../core/tutor/saved';
import { bubble, textChip, toolChip } from './tutorStyles';

export type KeptTab = 'saved' | 'history';

interface Props {
  tab: KeptTab;
  onTab: (tab: KeptTab) => void;
  saved: SavedItem[];
  history: SavedItem[];
  isSavedId: (id: string) => boolean;
  /** Save, or take back, one answer picked out of an earlier chat. */
  onToggleAnswer: (answer: SavedItem) => void;
  onSaveChat: (chat: SavedItem) => void;
  onDeleteSaved: (id: string) => void;
  onDeleteHistory: (id: string) => void;
  onClearHistory: () => void;
  onOpenLesson: (lessonId: string) => void;
  onBack: () => void;
}

const when = (iso: string): string => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

const kindLabel = (item: SavedItem): string => (item.kind === 'chat' ? `Chat, ${item.messages.length} messages` : 'Answer');

const CLEAR_ALL = 'clear-history';

/** What the learner chose to keep (Saved), and the chats they had before (History), where any earlier answer can still be saved. */
export function SavedList(props: Props) {
  const { tab, saved, history, isSavedId } = props;
  const [openId, setOpenId] = useState<string | null>(null);
  // deleting takes two taps, so a slip does not lose something: the second tap has to come within a few seconds
  const [confirm, setConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!confirm) return;
    const t = setTimeout(() => setConfirm(null), 4000);
    return () => clearTimeout(t);
  }, [confirm]);

  const items = tab === 'saved' ? saved : history;

  const twoTap = (key: string, run: () => void) => () => {
    if (confirm === key) {
      setConfirm(null);
      run();
    } else {
      setConfirm(key);
    }
  };

  const tabChip = (id: KeptTab, label: string, count: number) => (
    <button
      key={id}
      role="tab"
      aria-selected={tab === id}
      className="chip"
      onClick={() => {
        setOpenId(null);
        props.onTab(id);
      }}
      style={{
        ...toolChip, flex: '1 1 auto', justifyContent: 'center',
        ...(tab === id ? { background: 'var(--yellow)', color: 'var(--ink)', borderColor: 'var(--yellow-edge)' } : {}),
      }}
    >
      {tab === id ? '✓ ' : ''}{label} ({count})
    </button>
  );

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <button className="chip" onClick={props.onBack} style={{ ...toolChip, alignSelf: 'flex-start' }}>
        <ArrowLeft size={14} />
        <span>Back to chat</span>
      </button>

      <div role="tablist" aria-label="Saved answers and chat history" style={{ display: 'flex', gap: 6 }}>
        {tabChip('saved', 'Saved', saved.length)}
        {tabChip('history', 'History', history.length)}
      </div>

      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.4 }}>
        {tab === 'saved'
          ? `Answers and chats you chose to keep. Kept on this device only. You can keep up to ${MAX_SAVED}.`
          : `Your last ${MAX_HISTORY} chats, kept automatically on this device only. Open one to save any answer from it.`}
      </div>

      {tab === 'history' && history.length > 0 && (
        <button
          className="chip"
          onClick={twoTap(CLEAR_ALL, props.onClearHistory)}
          style={{ ...toolChip, alignSelf: 'flex-start', ...(confirm === CLEAR_ALL ? { background: 'var(--pink)', borderColor: 'var(--pink-edge)' } : {}) }}
        >
          <Trash2 size={14} />
          <span>{confirm === CLEAR_ALL ? 'Tap again to clear history' : 'Clear history'}</span>
        </button>
      )}

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.length === 0 && (
          <div style={{ ...bubble, background: '#fff', color: 'var(--ink)', alignSelf: 'flex-start', maxWidth: '92%' }}>
            {tab === 'saved' ? (
              <>Nothing saved yet. Under an answer you like, tap <b>Save answer</b> to keep it with your question. Tap <b>Save chat</b> to keep the whole conversation.</>
            ) : (
              <>No earlier chats yet. Your chats appear here automatically, so you can come back and save an answer later.</>
            )}
          </div>
        )}
        {items.map((item) => {
          const open = openId === item.id;
          const key = `${tab}:${item.id}`;
          return (
            <div key={item.id} className="card" style={{ padding: 0, overflow: 'hidden', flexShrink: 0 }}>
              <button
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : item.id)}
                style={{ width: '100%', minHeight: 56, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'transparent', color: '#fff', textAlign: 'left' }}
              >
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, lineHeight: 1.3, overflowWrap: 'anywhere' }}>{item.title}</span>
                  <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {[kindLabel(item), item.where, when(item.savedAt), tab === 'history' && isSavedId(item.id) ? 'Saved' : null].filter(Boolean).join(' · ')}
                  </span>
                </span>
                {open ? <ChevronUp size={20} aria-hidden /> : <ChevronDown size={20} aria-hidden />}
              </button>

              {open && (
                <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {item.messages.map((m, i) => {
                    // an answer in an earlier chat can be saved on its own (the date only fixes the order of the saved list)
                    const answer = tab === 'history' ? answerFromChat(item, i, new Date(item.savedAt)) : null;
                    const answerSaved = answer ? isSavedId(answer.id) : false;
                    return (
                      <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '94%', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ ...bubble, background: m.role === 'user' ? 'var(--yellow)' : '#fff', color: 'var(--ink)' }}>{m.text}</div>
                        {m.sources && m.sources.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {m.sources.map((s) => (
                              <button key={`${s.lessonId}:${s.heading}`} className="chip" onClick={() => props.onOpenLesson(s.lessonId)} style={textChip}>
                                <BookOpen size={14} style={{ flexShrink: 0 }} />
                                <span>{s.where ? `${s.where}: ` : ''}{s.heading}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        {answer && (
                          <button
                            className="chip"
                            aria-pressed={answerSaved}
                            aria-label={answerSaved ? 'Saved. Tap to remove this answer from saved' : 'Save this answer with its question'}
                            onClick={() => props.onToggleAnswer(answer)}
                            style={{ ...toolChip, alignSelf: 'flex-start', ...(answerSaved ? { background: 'var(--mint)', color: 'var(--ink)', borderColor: 'var(--mint-edge)' } : {}) }}
                          >
                            {answerSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                            <span>{answerSaved ? 'Saved' : 'Save answer'}</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {tab === 'history' && (
                      <button className="chip" onClick={() => props.onSaveChat(item)} style={toolChip}>
                        <Save size={14} />
                        <span>{isSavedId(item.id) ? 'Update saved chat' : 'Save chat'}</span>
                      </button>
                    )}
                    <button
                      className="chip"
                      onClick={twoTap(key, () => {
                        setOpenId(null);
                        if (tab === 'saved') props.onDeleteSaved(item.id);
                        else props.onDeleteHistory(item.id);
                      })}
                      style={{ ...toolChip, ...(confirm === key ? { background: 'var(--pink)', borderColor: 'var(--pink-edge)' } : {}) }}
                    >
                      <Trash2 size={14} />
                      <span>{confirm === key ? 'Tap again to delete' : tab === 'history' ? 'Remove from history' : 'Delete'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
