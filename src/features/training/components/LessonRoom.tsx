import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flame,
  HelpCircle,
  Lightbulb,
  Lock,
  RotateCcw,
  Swords,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Chessboard } from 'react-chessboard';
import type { TrainingLesson, AcademyLevel } from '../types';
import { ExerciseBoard } from './ExerciseBoard';
import { ExerciseFeedback } from './ExerciseFeedback';
import { useExerciseSession } from '../hooks/useExerciseSession';
import { getPreviousLesson, getNextLesson } from '../data';
import { PromotionModal } from '../../quick-match/components/PromotionModal';
import { useAppStore } from '../../../stores/useAppStore';

interface LessonRoomProps {
  lesson: TrainingLesson;
  level: AcademyLevel;
  isLessonCompleted: boolean;
  onBackToCurriculum: () => void;
  onOpenLesson: (lessonId: string) => void;
  onCompleteLesson: (lesson: TrainingLesson) => void;
  onRecordExerciseAttempt: (lesson: TrainingLesson, success: boolean) => void;
  isLessonUnlocked: (lessonId: string) => boolean;
}

export const LessonRoom: React.FC<LessonRoomProps> = ({
  lesson,
  level,
  isLessonCompleted,
  onBackToCurriculum,
  onOpenLesson,
  onCompleteLesson,
  onRecordExerciseAttempt,
  isLessonUnlocked,
}) => {
  const { currentProfile, updateSettings } = useAppStore();
  const soundEnabled = currentProfile.settings.soundEnabled;

  const [activeTab, setActiveTab] = useState<'study' | 'exercise'>('study');
  const [readingFinished, setReadingFinished] = useState(isLessonCompleted);

  // Exercise session hook
  const exerciseSession = useExerciseSession(
    lesson.exercise,
    soundEnabled,
    () => {
      onRecordExerciseAttempt(lesson, true);
      onCompleteLesson(lesson);
    }
  );

  const prevLesson = getPreviousLesson(lesson.id);
  const nextLesson = getNextLesson(lesson.id);

  const toggleSound = () => {
    updateSettings({ soundEnabled: !soundEnabled });
  };

  const handleFinishReading = () => {
    setReadingFinished(true);
    setActiveTab('exercise');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-2 sm:px-4 animate-fadeIn">
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#10121B] border border-[#242938]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToCurriculum}
            className="p-2 rounded-lg text-[#9297A5] hover:text-[#F4F4F5] hover:bg-[#171A24] transition-colors cursor-pointer"
            title="Return to Curriculum"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#D6B36A] px-2 py-0.5 rounded bg-[#171A24] border border-[#242938]">
                {level.romanNumeral}
              </span>
              <span className="text-xs text-[#9297A5] font-mono">
                Lesson {lesson.order}
              </span>
              {isLessonCompleted && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  Completed
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold font-cinzel text-[#F4F4F5]">
              {lesson.title}
            </h2>
          </div>
        </div>

        {/* Tab & Audio Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex p-1 rounded-lg bg-[#171A24] border border-[#242938]">
            <button
              type="button"
              onClick={() => setActiveTab('study')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all cursor-pointer ${
                activeTab === 'study'
                  ? 'bg-[#D6B36A] text-[#0B0D14]'
                  : 'text-[#9297A5] hover:text-[#F4F4F5]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Study</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('exercise')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all cursor-pointer ${
                activeTab === 'exercise'
                  ? 'bg-[#D6B36A] text-[#0B0D14]'
                  : 'text-[#9297A5] hover:text-[#F4F4F5]'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Exercise</span>
              {exerciseSession.status === 'completed' && (
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={toggleSound}
            className="p-2 rounded-lg text-[#9297A5] hover:text-[#F4F4F5] hover:bg-[#171A24] transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute' : 'Enable Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Grid: Content Area & Side Guide Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Lesson Content OR Exercise Board */}
        <div className="lg:col-span-8 space-y-6">
          {activeTab === 'study' ? (
            /* Study & Concepts View */
            <div className="rounded-2xl border border-[#242938] bg-[#10121B] p-6 sm:p-8 space-y-7 shadow-xl">
              {/* Introduction */}
              <div className="space-y-3 pb-6 border-b border-[#242938]">
                <h3 className="text-xl font-bold font-cinzel text-[#F4F4F5]">
                  Conceptual Foundation
                </h3>
                <p className="text-sm text-[#9297A5] leading-relaxed">
                  {lesson.content.introduction}
                </p>
              </div>

              {/* Sections with Diagrams */}
              <div className="space-y-6">
                {lesson.content.sections.map((section, idx) => (
                  <div key={idx} className="space-y-4">
                    <h4 className="text-base font-bold font-cinzel text-[#D6B36A]">
                      {section.title}
                    </h4>

                    <div className="space-y-2.5">
                      {section.paragraphs.map((para, pIdx) => (
                        <p key={pIdx} className="text-xs sm:text-sm text-[#F4F4F5] leading-relaxed">
                          {para}
                        </p>
                      ))}
                    </div>

                    {/* Demonstration Diagram FEN if present */}
                    {section.diagramFen && (
                      <div className="p-4 rounded-xl bg-[#171A24] border border-[#242938] space-y-2">
                        <div className="w-full max-w-[320px] aspect-square mx-auto">
                          <Chessboard
                            options={{
                              position: section.diagramFen,
                              boardOrientation: lesson.exercise.playerSide === 'w' ? 'white' : 'black',
                              allowDragging: false,
                              darkSquareStyle: { backgroundColor: '#1E2332' },
                              lightSquareStyle: { backgroundColor: '#384257' },
                              showNotation: true,
                              boardStyle: { borderRadius: '8px' },
                            }}
                          />
                        </div>
                        {section.diagramCaption && (
                          <p className="text-[11px] text-center font-mono text-[#9297A5]">
                            {section.diagramCaption}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Bullet points if present */}
                    {section.bulletPoints && section.bulletPoints.length > 0 && (
                      <ul className="space-y-2 pl-4 text-xs sm:text-sm text-[#9297A5] list-disc list-outside">
                        {section.bulletPoints.map((bp, bIdx) => (
                          <li key={bIdx}>{bp}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              {/* Key Takeaways Card */}
              <div className="p-5 rounded-xl bg-[#171A24] border border-[#D6B36A]/30 space-y-3">
                <div className="flex items-center gap-2 text-[#D6B36A]">
                  <Lightbulb className="w-4 h-4" />
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider">
                    Key Master Takeaways
                  </h4>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-[#F4F4F5]">
                  {lesson.content.keyTakeaways.map((tk, tIdx) => (
                    <li key={tIdx} className="flex items-start gap-2">
                      <span className="text-[#D6B36A] font-bold">·</span>
                      <span>{tk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button: Proceed to Exercise */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleFinishReading}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#D6B36A] hover:bg-[#E8CF96] text-[#0B0D14] text-xs font-bold font-mono tracking-wide transition-all shadow-lg active:scale-98 cursor-pointer"
                >
                  <span>Practice on Interactive Board</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Interactive Exercise View */
            <div className="space-y-5">
              <ExerciseBoard
                fen={exerciseSession.fen}
                playerSide={lesson.exercise.playerSide}
                isPlayerTurn={exerciseSession.isPlayerTurn}
                isCheck={exerciseSession.isCheck}
                selectedSquare={exerciseSession.selectedSquare}
                legalMovesForSelected={exerciseSession.legalMovesForSelected}
                lastMove={exerciseSession.lastMove}
                onPieceDrop={exerciseSession.commitMove}
                onSquareClick={exerciseSession.handleSquareClick}
              />

              <ExerciseFeedback
                status={exerciseSession.status}
                feedbackMessage={exerciseSession.feedback}
                exercise={lesson.exercise}
                currentStepIndex={exerciseSession.stepIndex}
                totalSteps={lesson.exercise.steps.length}
                showHint={exerciseSession.showHint}
                onToggleHint={exerciseSession.toggleHint}
                onReset={exerciseSession.resetExercise}
                onNextLesson={() => {
                  if (nextLesson && isLessonUnlocked(nextLesson.id)) {
                    onOpenLesson(nextLesson.id);
                  }
                }}
                hasNextLesson={Boolean(nextLesson && isLessonUnlocked(nextLesson.id))}
              />
            </div>
          )}
        </div>

        {/* Right Column: Side Guide & Navigation Panel */}
        <div className="lg:col-span-4 space-y-5">
          {/* Objective Summary Card */}
          <div className="rounded-2xl border border-[#242938] bg-[#10121B] p-5 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#9297A5] font-bold">
              Lesson Objectives
            </h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2.5 text-xs text-[#F4F4F5]">
                <CheckCircle2
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    readingFinished ? 'text-emerald-400' : 'text-[#9297A5]'
                  }`}
                />
                <span>Study conceptual foundation & diagrams</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-[#F4F4F5]">
                <CheckCircle2
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    exerciseSession.status === 'completed' || isLessonCompleted
                      ? 'text-emerald-400'
                      : 'text-[#9297A5]'
                  }`}
                />
                <span>Solve interactive exercise on the board</span>
              </div>
            </div>

            <div className="border-t border-[#242938] pt-3 text-[11px] font-mono text-[#9297A5] space-y-1">
              <div className="flex justify-between">
                <span>Side to Move:</span>
                <span className="text-[#F4F4F5] capitalize">
                  {lesson.exercise.playerSide === 'w' ? 'White' : 'Black'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Exercise Category:</span>
                <span className="text-[#D6B36A] capitalize">
                  {lesson.exercise.exerciseType.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Attempts this session:</span>
                <span className="text-[#F4F4F5]">{exerciseSession.attemptsCount}</span>
              </div>
            </div>
          </div>

          {/* Lesson Navigation Footer Card */}
          <div className="rounded-2xl border border-[#242938] bg-[#10121B] p-4 flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={!prevLesson}
              onClick={() => prevLesson && onOpenLesson(prevLesson.id)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#242938] bg-[#171A24] text-xs font-mono text-[#9297A5] hover:text-[#F4F4F5] hover:bg-[#1D2230] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              disabled={!nextLesson || !isLessonUnlocked(nextLesson.id)}
              onClick={() => nextLesson && onOpenLesson(nextLesson.id)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#D6B36A] hover:bg-[#E8CF96] text-[#0B0D14] text-xs font-mono font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <span>Next Lesson</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Pawn Promotion Modal */}
      <PromotionModal
        isOpen={Boolean(exerciseSession.pendingPromotion)}
        color={lesson.exercise.playerSide}
        onSelectPiece={(piece) => {
          if (exerciseSession.pendingPromotion) {
            exerciseSession.commitMove(
              exerciseSession.pendingPromotion.from,
              exerciseSession.pendingPromotion.to,
              piece
            );
            exerciseSession.setPendingPromotion(null);
          }
        }}
        onCancel={() => exerciseSession.setPendingPromotion(null)}
      />
    </div>
  );
};
