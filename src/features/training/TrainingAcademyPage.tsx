import React, { useState } from 'react';
import { GraduationCap, ArrowLeft, BookOpen, CheckCircle, ChevronRight, Award, Sparkles } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import { playChessClick, playChime } from '../../utils/sound';

interface TrackDetail {
  id: string;
  tier: string;
  title: string;
  targetRating: string;
  summary: string;
  lessons: Array<{
    name: string;
    exercises: number;
    motif: string;
    completed?: boolean;
  }>;
}

const ACADEMY_TRACKS: TrackDetail[] = [
  {
    id: 'tier-1',
    tier: 'Tier I',
    title: 'Tactical Foundations & Calculation',
    targetRating: '1000 — 1400 ELO',
    summary: 'The geometric vision that wins material: pins, forks, double attacks, and deflection.',
    lessons: [
      { name: 'The Absolute and Relative Pin', exercises: 8, motif: 'Geometry', completed: true },
      { name: 'Knight Forks and Decoy Sacrifices', exercises: 10, motif: 'Double Attack', completed: true },
      { name: 'Deflection & Overloaded Defenders', exercises: 8, motif: 'Removal of Guard' },
      { name: 'Discovered Checks & Windmills', exercises: 6, motif: 'Tactical Traps' },
    ],
  },
  {
    id: 'tier-2',
    tier: 'Tier II',
    title: 'Positional Mastery & Pawn Structures',
    targetRating: '1400 — 1800 ELO',
    summary: 'Developing strategic harmony: strong outposts, backward pawns, and open file infiltration.',
    lessons: [
      { name: 'Outposts and Bishop Color Complexes', exercises: 8, motif: 'Piece Placement' },
      { name: 'Isolated Queen Pawn (IQP) Dynamics', exercises: 12, motif: 'Pawn Structure' },
      { name: 'The Minority Attack & Pawn Weaknesses', exercises: 8, motif: 'Flank Strategy' },
      { name: 'The Seven Rank Rook Invasion', exercises: 10, motif: 'Rook Activity' },
    ],
  },
  {
    id: 'tier-3',
    tier: 'Tier III',
    title: 'Dynamic Attack & King Safety',
    targetRating: '1800 — 2200 ELO',
    summary: 'Executing decisive king attacks: classic sacrifices, opposite-side castling, and breakthroughs.',
    lessons: [
      { name: 'The Classical Bishop Sacrifice (Greek Gift)', exercises: 8, motif: 'Sacrifice' },
      { name: 'Storming the Fiances: Pawn Storms in Opposite Castling', exercises: 10, motif: 'Attack' },
      { name: 'Prophylaxis and Restricting Counterplay', exercises: 6, motif: 'Petrosian Technique' },
    ],
  },
  {
    id: 'tier-4',
    tier: 'Tier IV',
    title: 'Grandmaster Endgame Artistry',
    targetRating: '2200+ ELO',
    summary: 'Converting minimal advantages with surgical precision in rook and minor piece endgames.',
    lessons: [
      { name: 'Rook Endings: The Lucena Bridge and Philidor Drawing Zone', exercises: 10, motif: 'Theoretical Rook' },
      { name: 'Triangulation & Distant Opposition in King & Pawn', exercises: 8, motif: 'Zugzwang' },
      { name: 'Minor Piece Fortresses and Breakthroughs', exercises: 6, motif: 'Defense' },
    ],
  },
];

export const TrainingAcademyPage: React.FC = () => {
  const { currentProfile } = useAppStore();
  const [selectedTrackId, setSelectedTrackId] = useState('tier-1');
  const [studyNotice, setStudyNotice] = useState<string | null>(null);

  const selectedTrack = ACADEMY_TRACKS.find((t) => t.id === selectedTrackId) || ACADEMY_TRACKS[0];

  const handleTrackSelect = (id: string) => {
    playChessClick(currentProfile.settings.soundEnabled, 0.6);
    setSelectedTrackId(id);
    setStudyNotice(null);
  };

  const handleStartLesson = (lessonName: string) => {
    playChime(currentProfile.settings.soundEnabled, 0.5);
    setStudyNotice(`Curriculum lesson "${lessonName}" initialized. Interactive exercise engine launches in TASK 05.`);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242938] pb-6">
        <div className="flex items-center gap-3">
          <NavLink
            to="/"
            onClick={() => playChessClick(currentProfile.settings.soundEnabled)}
            className="p-2 rounded-lg text-[#9297A5] hover:text-[#F4F4F5] hover:bg-[#171A24] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </NavLink>
          <div>
            <h2 className="text-2xl font-bold text-[#F4F4F5] font-cinzel">
              Training Academy
            </h2>
            <p className="text-xs text-[#9297A5] mt-0.5">
              Curated master curricula structured for progressive chess growth.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#D6B36A] font-medium uppercase tracking-wider px-3 py-1 rounded-full border border-[#D6B36A]/30 bg-[#D6B36A]/10 font-sans">
            Curriculum Phase
          </span>
        </div>
      </div>

      {/* Track Selection Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ACADEMY_TRACKS.map((track) => {
          const isSelected = track.id === selectedTrackId;
          return (
            <button
              key={track.id}
              type="button"
              onClick={() => handleTrackSelect(track.id)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#D6B36A] bg-[#171A24] shadow-lg shadow-[#D6B36A]/10'
                  : 'border-[#242938] bg-[#10121B]/60 hover:bg-[#171A24] hover:border-[#2E3547]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-[#D6B36A] font-cinzel">
                  {track.tier}
                </span>
                <span className="text-[10px] text-[#9297A5] font-mono">
                  {track.targetRating.split(' ')[0]}
                </span>
              </div>
              <h4 className="text-xs font-semibold text-[#F4F4F5] line-clamp-1">
                {track.title.split('&')[0]}
              </h4>
            </button>
          );
        })}
      </div>

      {/* Selected Track Overview & Syllabus */}
      <div className="rounded-xl border border-[#242938] bg-[#171A24] p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#242938]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#D6B36A] font-cinzel">{selectedTrack.tier}</span>
              <span className="text-xs text-[#9297A5]">· Target: {selectedTrack.targetRating}</span>
            </div>
            <h3 className="text-lg font-bold text-[#F4F4F5] font-cinzel">
              {selectedTrack.title}
            </h3>
            <p className="text-xs text-[#9297A5] max-w-2xl leading-relaxed">
              {selectedTrack.summary}
            </p>
          </div>
        </div>

        {/* Lesson Modules */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#9297A5] font-cinzel">
            Curriculum Lessons & Diagnostic Drills
          </h4>

          <div className="space-y-2.5">
            {selectedTrack.lessons.map((lesson, idx) => (
              <div
                key={lesson.name}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-[#10121B]/70 border border-[#242938] hover:border-[#D6B36A]/40 transition-colors gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#1D2230] text-[#D6B36A] flex items-center justify-center text-xs font-mono font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <h5 className="text-sm font-semibold text-[#F4F4F5]">
                      {lesson.name}
                    </h5>
                    <div className="flex items-center gap-3 text-[11px] text-[#9297A5] mt-0.5">
                      <span>{lesson.exercises} interactive positions</span>
                      <span>·</span>
                      <span className="text-[#D6B36A]">{lesson.motif}</span>
                      {lesson.completed && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Mastered
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleStartLesson(lesson.name)}
                  className="px-4 py-2 rounded-lg bg-[#1D2230] hover:bg-[#D6B36A] hover:text-[#0B0D14] text-[#F4F4F5] text-xs font-semibold tracking-wide border border-[#242938] hover:border-[#D6B36A] transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span>Begin Lesson</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {studyNotice && (
          <div className="p-4 rounded-lg bg-[#10121B] border border-[#D6B36A]/40 text-xs text-[#9297A5] flex items-center gap-3 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-[#D6B36A] shrink-0" />
            <span className="text-[#F4F4F5]">{studyNotice}</span>
          </div>
        )}
      </div>
    </div>
  );
};
