import React from 'react';
import { LESSONS, LESSON_BY_ID, quizForLesson } from '../../content/lessons';
import { adjacentLessons } from '../../core/learn/curriculum';
import { LearnHome } from './LearnHome';
import { LessonView } from './LessonView';
import { PartView } from './PartView';
import { QuizView } from './QuizView';
import type { LearnView } from './learnView';

interface Props {
  view: LearnView;
  onNavigate: (view: LearnView) => void;
  /** Ids of the games and labs that are playable today; anything else shows as "coming soon". */
  availableGameIds: string[];
  availableSimIds: string[];
  onOpenGame: (id: string) => void;
  onOpenSim: (id: string) => void;
}

/** The Learn tab: course home, a part's module list, a lesson, or its quiz. The current view is owned by the app so it survives tab switches. */
export const LearnTab: React.FC<Props> = ({ view, onNavigate, availableGameIds, availableSimIds, onOpenGame, onOpenSim }) => {
  const openLesson = (lessonId: string) => onNavigate({ kind: 'lesson', lessonId });

  if (view.kind === 'part') {
    return <PartView part={view.part} onBack={() => onNavigate({ kind: 'home' })} onOpenLesson={openLesson} />;
  }

  if (view.kind === 'lesson' || view.kind === 'quiz') {
    const lesson = LESSON_BY_ID[view.lessonId];
    const quiz = lesson ? quizForLesson(lesson) : undefined;
    if (!lesson) return <LearnHome onOpenPart={(part) => onNavigate({ kind: 'part', part })} onOpenLesson={openLesson} />;

    if (view.kind === 'quiz' && quiz) {
      return (
        <QuizView
          key={quiz.id}
          quiz={quiz}
          lesson={lesson}
          nextLesson={adjacentLessons(LESSONS, lesson.id).next}
          onBackToLesson={() => openLesson(lesson.id)}
          onOpenLesson={openLesson}
        />
      );
    }

    return (
      <LessonView
        key={lesson.id}
        lesson={lesson}
        availableGameIds={availableGameIds}
        availableSimIds={availableSimIds}
        onBack={() => onNavigate({ kind: 'part', part: lesson.part })}
        onOpenLesson={openLesson}
        onStartQuiz={() => onNavigate({ kind: 'quiz', lessonId: lesson.id })}
        onOpenGame={onOpenGame}
        onOpenSim={onOpenSim}
      />
    );
  }

  return <LearnHome onOpenPart={(part) => onNavigate({ kind: 'part', part })} onOpenLesson={openLesson} />;
};
