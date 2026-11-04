import React from 'react';
import { BookOpen, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { LessonCard } from './LessonCard';
import { getLessonsByModuleId } from '../data';
import type { CurriculumModule } from '../types';

interface ModuleAccordionProps {
  module: CurriculumModule;
  isLessonUnlocked: (lessonId: string) => boolean;
  completedLessonIds: string[];
  onOpenLesson: (lessonId: string) => void;
}

export const ModuleAccordion: React.FC<ModuleAccordionProps> = ({
  module,
  isLessonUnlocked,
  completedLessonIds,
  onOpenLesson,
}) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const lessons = getLessonsByModuleId(module.id);

  const completedCount = lessons.filter((l) => completedLessonIds.includes(l.id)).length;
  const isModuleMastered = lessons.length > 0 && completedCount === lessons.length;

  return (
    <div className="rounded-2xl border border-[#242938] bg-[#10121B] overflow-hidden shadow-lg">
      {/* Module Header Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left bg-[#171A24]/60 hover:bg-[#171A24] transition-colors cursor-pointer border-b border-[#242938]"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isModuleMastered
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-[#1D2230] text-[#D6B36A] border-[#242938]'
            }`}
          >
            {isModuleMastered ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <BookOpen className="w-5 h-5" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D6B36A]">
                Module {module.order}
              </span>
              <span className="text-xs text-[#9297A5] font-mono">
                · {completedCount}/{lessons.length} Completed
              </span>
            </div>
            <h3 className="text-base font-bold text-[#F4F4F5] font-cinzel line-clamp-1">
              {module.title}
            </h3>
            <p className="text-xs text-[#9297A5] line-clamp-1 mt-0.5">
              {module.description}
            </p>
          </div>
        </div>

        <div className="p-2 rounded-lg text-[#9297A5] hover:text-[#F4F4F5] shrink-0">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Lesson List */}
      {isOpen && (
        <div className="p-4 sm:p-5 space-y-3 bg-[#0B0D14]/50">
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              isUnlocked={isLessonUnlocked(lesson.id)}
              isCompleted={completedLessonIds.includes(lesson.id)}
              onOpenLesson={onOpenLesson}
            />
          ))}
        </div>
      )}
    </div>
  );
};
