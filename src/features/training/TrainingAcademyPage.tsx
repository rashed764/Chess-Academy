import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTrainingProgress } from './hooks/useTrainingProgress';
import { CurriculumOverview } from './components/CurriculumOverview';
import { LessonRoom } from './components/LessonRoom';
import { getLessonById, getLevelById } from './data';
import type { AcademyLevelId } from './types';

export const TrainingAcademyPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const lessonParam = searchParams.get('lesson');

  const {
    progress,
    stats,
    isLevelUnlocked,
    isLessonUnlocked,
    getLevelLockReason,
    setCurrentLevel,
    recordLessonCompleted,
    recordExerciseAttempt,
    resetAllProgress,
  } = useTrainingProgress();

  const [selectedLevelId, setSelectedLevelId] = useState<AcademyLevelId>(
    progress.currentLevelId || 'level-1-absolute-beginner'
  );
  const [activeLessonId, setActiveLessonId] = useState<string | null>(lessonParam);

  // Synchronize URL query parameter with active lesson
  useEffect(() => {
    if (lessonParam && isLessonUnlocked(lessonParam)) {
      setActiveLessonId(lessonParam);
      const targetLesson = getLessonById(lessonParam);
      if (targetLesson) {
        setSelectedLevelId(targetLesson.levelId);
      }
    } else if (lessonParam && !isLessonUnlocked(lessonParam)) {
      // Locked lesson attempted via URL
      setActiveLessonId(null);
      setSearchParams({});
    }
  }, [lessonParam, isLessonUnlocked, setSearchParams]);

  const handleOpenLesson = (lessonId: string) => {
    if (isLessonUnlocked(lessonId)) {
      setActiveLessonId(lessonId);
      setSearchParams({ lesson: lessonId });
      const targetLesson = getLessonById(lessonId);
      if (targetLesson) {
        setSelectedLevelId(targetLesson.levelId);
      }
    }
  };

  const handleBackToCurriculum = () => {
    setActiveLessonId(null);
    setSearchParams({});
  };

  const activeLesson = activeLessonId ? getLessonById(activeLessonId) : null;
  const activeLevel = activeLesson ? getLevelById(activeLesson.levelId) : null;

  if (activeLesson && activeLevel) {
    return (
      <LessonRoom
        lesson={activeLesson}
        level={activeLevel}
        isLessonCompleted={progress.completedLessonIds.includes(activeLesson.id)}
        onBackToCurriculum={handleBackToCurriculum}
        onOpenLesson={handleOpenLesson}
        onCompleteLesson={recordLessonCompleted}
        onRecordExerciseAttempt={recordExerciseAttempt}
        isLessonUnlocked={isLessonUnlocked}
      />
    );
  }

  return (
    <CurriculumOverview
      progress={progress}
      stats={stats}
      selectedLevelId={selectedLevelId}
      onSelectLevel={(levelId) => {
        setSelectedLevelId(levelId);
        setCurrentLevel(levelId);
      }}
      isLevelUnlocked={isLevelUnlocked}
      isLessonUnlocked={isLessonUnlocked}
      getLevelLockReason={getLevelLockReason}
      onOpenLesson={handleOpenLesson}
      onResetProgress={resetAllProgress}
    />
  );
};
