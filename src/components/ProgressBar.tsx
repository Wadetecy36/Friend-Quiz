import React from 'react';
import { SaveStatus } from '../hooks/useParticipant';

interface ProgressBarProps {
  currentIndex: number;
  totalCount: number;
  saveStatus: SaveStatus;
  participantName?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentIndex,
  totalCount,
  saveStatus,
}) => {
  // Percentage calculated from current step (e.g. 6 / 12 = 50%)
  const percentage = Math.min(100, Math.max(0, Math.round((currentIndex / totalCount) * 100)));

  return (
    <div className="w-full mb-6">
      {/* Question Counter from Screenshot: QUESTION 6 / 12 */}
      <div className="flex items-center justify-between gap-4 mb-2.5">
        <span className="font-mono text-xs sm:text-sm font-bold tracking-[0.2em] text-stone-500 uppercase">
          QUESTION {currentIndex} / {totalCount}
        </span>

        {/* Quiet save status indicator */}
        <div className="font-mono text-[11px] text-stone-500">
          {saveStatus === 'saving' && (
            <span className="text-amber-700 animate-pulse font-medium">Saving...</span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-[#3D8F70] font-medium">Saved</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-rose-600 font-medium">Offline</span>
          )}
        </div>
      </div>

      {/* Terracotta Progress Bar from Screenshot */}
      <div className="w-full bg-[#E8E2D2] rounded-full h-2.5 sm:h-3 overflow-hidden p-0.5 border border-stone-300/60">
        <div
          className="h-full bg-[#E05338] rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
