import React from 'react';
import { Volume2, Eye, ArrowLeft, Shield } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import { playChessClick } from '../../utils/sound';

export const SettingsPage: React.FC = () => {
  const { currentProfile, updateSettings } = useAppStore();
  const settings = currentProfile.settings;

  const handleToggleSound = (checked: boolean) => {
    updateSettings({ soundEnabled: checked });
    if (checked) {
      playChessClick(true, 0.7);
    }
  };

  const handleToggle = (key: keyof typeof settings, checked: boolean) => {
    playChessClick(settings.soundEnabled, 0.5);
    updateSettings({ [key]: checked });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#242938] pb-6">
        <div className="flex items-center gap-3">
          <NavLink
            to="/"
            onClick={() => playChessClick(settings.soundEnabled)}
            className="p-2 rounded-lg text-[#9297A5] hover:text-[#F4F4F5] hover:bg-[#171A24] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </NavLink>
          <div>
            <h2 className="text-2xl font-bold text-[#F4F4F5] font-cinzel">
              Academy Settings
            </h2>
            <p className="text-xs text-[#9297A5] mt-0.5">
              Configure acoustic feedback, piece aesthetics, and training assists.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Audio Preferences */}
        <div className="rounded-xl border border-[#242938] bg-[#171A24] p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#242938]">
            <Volume2 className="w-4 h-4 text-[#D6B36A]" />
            <h3 className="text-sm font-bold text-[#F4F4F5] font-cinzel">
              Acoustic Feedback
            </h3>
          </div>

          <label className="flex items-center justify-between p-3 rounded-lg bg-[#10121B]/60 border border-[#242938] hover:border-[#D6B36A]/40 transition-colors cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-[#F4F4F5] block">
                Wooden Chessboard Acoustics
              </span>
              <span className="text-[11px] text-[#9297A5]">
                Rich synthesized clicks and chimes for moves, captures, and checkmate.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => handleToggleSound(e.target.checked)}
              className="w-4 h-4 accent-[#D6B36A] rounded bg-[#0B0D14] border-[#242938] cursor-pointer"
            />
          </label>
        </div>

        {/* Board Visual Options */}
        <div className="rounded-xl border border-[#242938] bg-[#171A24] p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#242938]">
            <Eye className="w-4 h-4 text-[#D6B36A]" />
            <h3 className="text-sm font-bold text-[#F4F4F5] font-cinzel">
              Board Aesthetics & Visual Assists
            </h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg bg-[#10121B]/60 border border-[#242938] hover:border-[#D6B36A]/40 transition-colors cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-[#F4F4F5] block">
                  Highlight Legal Move Indicators
                </span>
                <span className="text-[11px] text-[#9297A5]">
                  Displays subtle guide dots on valid destination squares during selection.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.showLegalMoves}
                onChange={(e) => handleToggle('showLegalMoves', e.target.checked)}
                className="w-4 h-4 accent-[#D6B36A] rounded bg-[#0B0D14] border-[#242938] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-[#10121B]/60 border border-[#242938] hover:border-[#D6B36A]/40 transition-colors cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-[#F4F4F5] block">
                  Rank & File Coordinate Notations
                </span>
                <span className="text-[11px] text-[#9297A5]">
                  Shows 1-8 ranks and a-h files along the board edges.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.showCoordinates}
                onChange={(e) => handleToggle('showCoordinates', e.target.checked)}
                className="w-4 h-4 accent-[#D6B36A] rounded bg-[#0B0D14] border-[#242938] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-[#10121B]/60 border border-[#242938] hover:border-[#D6B36A]/40 transition-colors cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-[#F4F4F5] block">
                  Auto-Queen on Promotion
                </span>
                <span className="text-[11px] text-[#9297A5]">
                  Automatically promotes passed pawns to Queen unless alternative is specified.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoQueenOnPromotion}
                onChange={(e) => handleToggle('autoQueenOnPromotion', e.target.checked)}
                className="w-4 h-4 accent-[#D6B36A] rounded bg-[#0B0D14] border-[#242938] cursor-pointer"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
