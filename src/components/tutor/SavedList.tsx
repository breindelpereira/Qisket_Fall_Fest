import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { MAX_SAVED } from '../../core/tutor/saved';
import type { SavedItem } from '../../core/tutor/saved';
import { bubble, textChip, toolChip } from './tutorStyles';

interface Props {
  items: SavedItem[];
  onDelete: (id: string) => void;
  onOpenLesson: (lessonId: string) => void;
  onBack: () => void;
}

const when = (iso: string): string => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

const kindLabel = (item: SavedItem): string => (item.kind === 'chat' ? `Chat, ${item.messages.length} messages` : 'Answer');

/** The answers and chats the learner chose to keep. Tap one to read it. */
export function SavedList({ items, onDelete, onOpenLesson, onBack }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  // deleting takes two taps, so a slip does not lose something: the second tap has to come within a few seconds
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!confirmId) return;
    const t = setTimeout(() => setConfirmId(null), 4000);
    return () => clearTimeout(t);
  }, [confirmId]);

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <button className="chip" onClick={onBack} style={toolChip}>
          <ArrowLeft size={14} />
          <span>Back to chat</span>
        </button>
        <span className="eyebrow">Saved ({items.length})</span>
      </div>
      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.4 }}>
        Kept on this device only. You can keep up to {MAX_SAVED}.
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.length === 0 && (
          <div style={{ ...bubble, background: '#fff', color: 'var(--ink)', alignSelf: 'flex-start', maxWidth: '92%' }}>
            Nothing saved yet. Under an answer you like, tap <b>Save answer</b> to keep it with your question. Tap <b>Save chat</b> to keep the whole conversation.
          </div>
        )}
        {items.map((item) => {
          const open = openId === item.id;
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
                    {[kindLabel(item), item.where, when(item.savedAt)].filter(Boolean).join(' · ')}
                  </span>
                </span>
                {open ? <ChevronUp size={20} aria-hidden /> : <ChevronDown size={20} aria-hidden />}
              </button>

              {open && (
                <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {item.messages.map((m, i) => (
                    <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '94%', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ ...bubble, background: m.role === 'user' ? 'var(--yellow)' : '#fff', color: 'var(--ink)' }}>{m.text}</div>
                      {m.sources && m.sources.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {m.sources.map((s) => (
                            <button key={`${s.lessonId}:${s.heading}`} className="chip" onClick={() => onOpenLesson(s.lessonId)} style={textChip}>
                              <BookOpen size={14} style={{ flexShrink: 0 }} />
                              <span>{s.where ? `${s.where}: ` : ''}{s.heading}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    className="chip"
                    onClick={() => {
                      if (confirmId === item.id) {
                        setConfirmId(null);
                        setOpenId(null);
                        onDelete(item.id);
                      } else {
                        setConfirmId(item.id);
                      }
                    }}
                    style={{ ...toolChip, alignSelf: 'flex-start', ...(confirmId === item.id ? { background: 'var(--pink)', borderColor: 'var(--pink-edge)' } : {}) }}
                  >
                    <Trash2 size={14} />
                    <span>{confirmId === item.id ? 'Tap again to delete' : 'Delete'}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
