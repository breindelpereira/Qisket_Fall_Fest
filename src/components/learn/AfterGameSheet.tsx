import React from 'react';
import { BookOpen, FlaskConical, Gamepad2, Video, Trophy } from 'lucide-react';
import { ACTIVITIES } from '../../content/activities';
import type { LessonRecord } from '../../content/types';
import { nextAfterActivity, readStartChoices } from '../../core/learn/start';
import { ArcadeModal } from '../shared/Arcade';
import { THEMES } from '../shared/arcadeTheme';
import { safeStorage } from '../../utils/safeStorage';

interface Props {
  lesson: LessonRecord;
  gameId: string;
  availableGameIds: string[];
  availableSimIds: string[];
  onClose: () => void;
  onWatch: () => void;
  onOpenGame: (id: string) => void;
  onOpenSim: (id: string) => void;
  onQuiz: () => void;
  onLesson: () => void;
}

/** Shown when a game from a lesson is finished: offers the next step of that lesson, usually its video. */
export const AfterGameSheet: React.FC<Props> = ({
  lesson, gameId, availableGameIds, availableSimIds, onClose, onWatch, onOpenGame, onOpenSim, onQuiz, onLesson,
}) => {
  const choice = readStartChoices(safeStorage())[lesson.id];
  const next = nextAfterActivity(lesson, gameId, availableGameIds, availableSimIds, choice);
  const gameTitle = ACTIVITIES[gameId]?.title ?? 'the game';

  let text = '';
  let action: { label: string; icon: React.ReactNode; run: () => void } | null = null;
  if (next.kind === 'watch') {
    text = 'The video puts words to what you just did, so it will make more sense now.';
    action = { label: 'Watch the video', icon: <Video size={20} />, run: onWatch };
  } else if (next.kind === 'activity') {
    const info = ACTIVITIES[next.activity.id];
    const isGame = next.activity.kind === 'game';
    text = isGame ? 'Next, put it to work with a practice game.' : 'Next, see how it really works in a lab, and change the numbers yourself.';
    action = {
      label: `${isGame ? 'Play' : 'Open'} ${info.title}`,
      icon: isGame ? <Gamepad2 size={20} /> : <FlaskConical size={20} />,
      run: () => (isGame ? onOpenGame(next.activity.id) : onOpenSim(next.activity.id)),
    };
  } else if (next.kind === 'quiz') {
    text = 'That was the last hands-on step of this module. Check what you learned with the quiz.';
    action = { label: 'Take the quiz', icon: <Trophy size={20} />, run: onQuiz };
  } else {
    text = 'Head back to the lesson to see what is next.';
  }

  return (
    <ArcadeModal theme={THEMES.yellow} title="NICE WORK!" onClose={onClose} closeLabel="Stay here">
      <p>You finished <b>{gameTitle}</b>.</p>
      <p>{text}</p>
      {action && (
        <button className="btn btn-mint" onClick={action.run}>
          {action.icon}
          <span>{action.label}</span>
        </button>
      )}
      <button className={action ? 'chip' : 'btn btn-mint'} onClick={onLesson} style={action ? { alignSelf: 'center' } : undefined}>
        <BookOpen size={16} />
        <span>Back to the lesson</span>
      </button>
    </ArcadeModal>
  );
};
