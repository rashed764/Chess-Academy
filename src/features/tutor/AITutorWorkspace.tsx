/**
 * Main AI Tutor Workspace for Training Academy.
 * Integrates the two-column interactive studio: Left interactive chessboard, Right persistent AI Tutor chat.
 * Preserves the canonical curriculum overview tab, assessment modal, and Test Arena transitions.
 */

import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  LayoutGrid,
  CheckCircle2,
  GraduationCap,
  Layers,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';
import { TutorBoard } from './components/TutorBoard';
import { TutorChat } from './components/TutorChat';
import { TestArenaModal } from './components/TestArenaModal';
import { CurriculumOverview } from '../training/components/CurriculumOverview';
import { useAITutorSession } from './hooks/useAITutorSession';
import { useTrainingProgress } from '../training/hooks/useTrainingProgress';
import { getLessonById, getLevelById } from '../training/data';
import type { AcademyLevelId } from '../training/types';

export const AITutorWorkspace: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const lessonParam = searchParams.get('lesson');

  const [activeTab, setActiveTab] = useState<'studio' | 'curriculum'>('studio');
  const [mobileStudioTab, setMobileStudioTab] = useState<'board' | 'chat'>('board');

  const {
    progress,
    stats,
    isLevelUnlocked,
    isLessonUnlocked,
    getLevelLockReason,
    setCurrentLevel,
    resetAllProgress,
  } = useTrainingProgress();

  const [selectedLevelId, setSelectedLevelId] = useState<AcademyLevelId>(
    progress.currentLevelId || 'level-1-absolute-beginner'
  );

  const {
    boardState,
    messages,
    assessmentState,
    testArenaPrompt,
    isThinking,
    tutorStatus,
    sendMessage,
    handlePieceDrop,
    handleSquareClick,
    startAssessment,
    submitAssessmentAnswer,
    resetBoard,
    flipBoard,
    clearChat,
    setTestArenaPrompt,
  } = useAITutorSession(lessonParam);

  const handleOpenLesson = (lessonId: string) => {
    if (isLessonUnlocked(lessonId)) {
      setSearchParams({ lesson: lessonId });
      const targetLesson = getLessonById(lessonId);
      if (targetLesson) {
        setSelectedLevelId(targetLesson.levelId);
      }
      setActiveTab('studio');
      setMobileStudioTab('board');
      // Send message to AI tutor asking to teach this lesson
      sendMessage(`I would like to study lesson "${targetLesson?.title || lessonId}". Could you guide me through its key concepts and exercises?`);
    }
  };

  const currentLevelObj = getLevelById(progress.currentLevelId || 'level-1-absolute-beginner');

  return (
    <div className="flex flex-col min-h-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      {/* Academy Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#10121B] border border-[#242938] shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <GraduationCap className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-zinc-100 tracking-wide">
              Training Academy
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              AI Tutor Active
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Autonomous grandmaster-guided chess education with live board control, adaptive assessments & curriculum orchestration.
          </p>
        </div>

        {/* View Switcher Tabs & Status Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center p-1 rounded-xl bg-[#171A24] border border-[#242938]">
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'studio'
                  ? 'bg-amber-500 text-zinc-950 font-semibold shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Tutor Studio</span>
            </button>
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'curriculum'
                  ? 'bg-amber-500 text-zinc-950 font-semibold shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>7-Level Curriculum</span>
            </button>
          </div>

          {/* Level Standing Chip */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#171A24] border border-[#242938] text-xs">
            <span className="text-zinc-500 font-medium">Standing:</span>
            <span className="font-semibold text-amber-400">{currentLevelObj?.title || 'Level 1'}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'studio' ? (
        <div className="flex flex-col space-y-3">
          {/* Mobile Studio Tab Toggle (Visible only on mobile/tablet) */}
          <div className="flex md:hidden items-center p-1 rounded-xl bg-[#171A24] border border-[#242938] text-xs">
            <button
              onClick={() => setMobileStudioTab('board')}
              className={`flex-1 py-2 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
                mobileStudioTab === 'board'
                  ? 'bg-amber-500 text-zinc-950 font-semibold shadow'
                  : 'text-zinc-400'
              }`}
            >
              <span>♟️ Interactive Board</span>
            </button>
            <button
              onClick={() => setMobileStudioTab('chat')}
              className={`flex-1 py-2 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
                mobileStudioTab === 'chat'
                  ? 'bg-amber-500 text-zinc-950 font-semibold shadow'
                  : 'text-zinc-400'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>AI Tutor Chat</span>
            </button>
          </div>

          {/* Two-Column Responsive Workspace */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            {/* Left Column: Interactive Chessboard */}
            <div
              className={`md:col-span-7 xl:col-span-7 ${
                mobileStudioTab === 'board' ? 'block' : 'hidden md:block'
              }`}
            >
              <TutorBoard
                boardState={boardState}
                onPieceDrop={handlePieceDrop}
                onSquareClick={handleSquareClick}
                onFlipBoard={flipBoard}
                onResetBoard={resetBoard}
              />
            </div>

            {/* Right Column: AI Tutor Chat */}
            <div
              className={`md:col-span-5 xl:col-span-5 h-[580px] sm:h-[640px] ${
                mobileStudioTab === 'chat' ? 'block' : 'hidden md:block'
              }`}
            >
              <TutorChat
                messages={messages}
                isThinking={isThinking}
                tutorStatus={tutorStatus}
                assessmentState={assessmentState}
                onSendMessage={sendMessage}
                onSubmitAssessmentAnswer={submitAssessmentAnswer}
                onStartAssessment={startAssessment}
                onClearChat={clearChat}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Preserved Canonical 7-Level Curriculum Overview */
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
      )}

      {/* Test Arena Transition Modal */}
      <TestArenaModal
        prompt={testArenaPrompt}
        onClose={() => setTestArenaPrompt(null)}
      />
    </div>
  );
};
