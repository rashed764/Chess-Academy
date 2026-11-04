import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowLeft, BookOpen, History, Search } from 'lucide-react';
import { LevelSelector } from './LevelSelector';
import { LevelProgressBanner } from './LevelProgressBanner';
import { ModuleAccordion } from './ModuleAccordion';
import { LearningHistoryView } from './LearningHistoryView';
import { getLevelById, getModulesByLevelId } from '../data';
import type { AcademyLevelId, AcademyProgressState } from '../types';

interface CurriculumOverviewProps {
  progress: AcademyProgressState;
  stats: {
    totalLessons: number;
    completedLessons: number;
    completionPercentage: number;
    exerciseSuccessRate: number;
    totalAttempts: number;
    levelCompletionMap: Record<
      AcademyLevelId,
      { total: number; completed: number; percentage: number }
    >;
  };
  selectedLevelId: AcademyLevelId;
  onSelectLevel: (levelId: AcademyLevelId) => void;
  isLevelUnlocked: (levelId: AcademyLevelId) => boolean;
  isLessonUnlocked: (lessonId: string) => boolean;
  getLevelLockReason: (levelId: AcademyLevelId) => string;
  onOpenLesson: (lessonId: string) => void;
  onResetProgress: () => void;
}

export const CurriculumOverview: React.FC<CurriculumOverviewProps> = ({
  progress,
  stats,
  selectedLevelId,
  onSelectLevel,
  isLevelUnlocked,
  isLessonUnlocked,
  getLevelLockReason,
  onOpenLesson,
  onResetProgress,
}) => {
  const [activeTab, setActiveTab] = useState<'curriculum' | 'history'>('curriculum');
  const [searchQuery, setSearchQuery] = useState('');

  const currentLevel = getLevelById(selectedLevelId)!;
  const modules = getModulesByLevelId(selectedLevelId);
  const isUnlocked = isLevelUnlocked(selectedLevelId);
  const lockReason = getLevelLockReason(selectedLevelId);
  const levelStats = stats.levelCompletionMap[selectedLevelId] || {
    total: 0,
    completed: 0,
    percentage: 0,
  };

  return (
    <div className="space-y-7 max-w-6xl mx-auto px-2 sm:px-4 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242938] pb-5">
        <div className="flex items-center gap-3">
          <NavLink
            to="/"
            className="p-2 rounded-lg text-[#9297A5] hover:text-[#F4F4F5] hover:bg-[#171A24] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </NavLink>
          <div>
            <h2 className="text-2xl font-bold font-cinzel text-[#F4F4F5]">
              Training Academy
            </h2>
            <p className="text-xs text-[#9297A5] mt-0.5">
              Structured 7-level grandmaster curriculum from zero knowledge to elite preparation.
            </p>
          </div>
        </div>

        {/* Overview Tab Switcher (Curriculum vs History) */}
        <div className="flex p-1 rounded-xl bg-[#10121B] border border-[#242938] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('curriculum')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
              activeTab === 'curriculum'
                ? 'bg-[#D6B36A] text-[#0B0D14]'
                : 'text-[#9297A5] hover:text-[#F4F4F5]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Curriculum</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#D6B36A] text-[#0B0D14]'
                : 'text-[#9297A5] hover:text-[#F4F4F5]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
            {progress.activityHistory.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#171A24] text-[#D6B36A]">
                {progress.activityHistory.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'curriculum' ? (
        <div className="space-y-6">
          {/* Level Selection Tabs */}
          <LevelSelector
            selectedLevelId={selectedLevelId}
            onSelectLevel={onSelectLevel}
            isLevelUnlocked={isLevelUnlocked}
            levelCompletionMap={stats.levelCompletionMap}
          />

          {/* Level Progress Banner */}
          <LevelProgressBanner
            level={currentLevel}
            isUnlocked={isUnlocked}
            lockReason={lockReason}
            completedLessons={levelStats.completed}
            totalLessons={levelStats.total}
            completionPercentage={levelStats.percentage}
          />

          {/* Module List */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-cinzel text-[#F4F4F5] uppercase tracking-wider">
                Modules & Syllabus
              </h3>
              <span className="text-xs font-mono text-[#9297A5]">
                {modules.length} Modules in {currentLevel.title}
              </span>
            </div>

            <div className="space-y-4">
              {modules.map((mod) => (
                <ModuleAccordion
                  key={mod.id}
                  module={mod}
                  isLessonUnlocked={isLessonUnlocked}
                  completedLessonIds={progress.completedLessonIds}
                  onOpenLesson={onOpenLesson}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* History View */
        <LearningHistoryView
          activityHistory={progress.activityHistory}
          totalAttempts={stats.totalAttempts}
          correctAttempts={progress.correctExerciseAttempts}
          completedLessonsCount={stats.completedLessons}
          onResetProgress={onResetProgress}
        />
      )}
    </div>
  );
};
