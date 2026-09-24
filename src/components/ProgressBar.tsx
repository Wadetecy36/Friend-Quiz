import React from 'react';
import { SaveStatus } from '../hooks/useParticipant';
import { useDesignSystem } from '../context/DesignSystemContext';
import { Flame } from 'lucide-react';

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
  const { theme } = useDesignSystem();
  // Percentage calculated from current step (e.g. 6 / 12 = 50%)
  const percentage = Math.min(100, Math.max(0, Math.round((currentIndex / totalCount) * 100)));

  return (
    <div className="w-full mb-6">
      {/* Header bar: Question Counter & Save Status */}
      <div className="flex items-center justify-between gap-4 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-amber-500">
            <Flame className="w-4 h-4 animate-pulse fill-amber-500/20" />
            <span
              className="font-mono text-xs sm:text-sm font-black uppercase tracking-[0.2em]"
              style={{ color: theme.colors.textPrimary }}
            >
              QUESTION {currentIndex} / {totalCount}
            </span>
          </div>

          {/* Glowing Lava Percent Pill */}
          <span
            className="text-[11px] font-mono font-black px-2 py-0.5 rounded-full border border-amber-500/40 bg-gradient-to-r from-amber-500/20 via-orange-500/25 to-red-500/20 text-amber-300 shadow-[0_0_10px_rgba(249,115,22,0.35)]"
          >
            {percentage}%
          </span>
        </div>

        {/* Save status indicator */}
        <div className="font-mono text-[11px]">
          {saveStatus === 'saving' && (
            <span className="animate-pulse font-medium flex items-center gap-1 text-orange-400">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />
              Auto-saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="font-medium text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Saved
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="font-medium text-rose-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              Offline cache
            </span>
          )}
        </div>
      </div>

      {/* Outer Crucible Tube Container */}
      <div
        className="w-full rounded-full h-3.5 sm:h-4 overflow-hidden p-0.5 border relative shadow-inner transition-all"
        style={{
          backgroundColor: '#0a0806',
          borderColor: 'rgba(249, 115, 22, 0.35)',
          boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.9), 0 0 10px rgba(249, 115, 22, 0.15)',
        }}
      >
        {/* Subtle fiery background heat texture when bar is low */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(249, 115, 22, 0.4) 0%, transparent 80%)',
          }}
        />

        {/* Filling Molten Lava Liquid Bar */}
        <div
          className="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden animate-lava-flow animate-lava-glow"
          style={{
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, #b91c1c 0%, #ea580c 25%, #f97316 50%, #fb923c 75%, #fef08a 100%)',
          }}
        >
          {/* Surface Liquid Heat Wave & Shimmer */}
          <div
            className="absolute inset-0 opacity-60 animate-lava-wave"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
            }}
          />

          {/* Glowing Top Meniscus Highlight */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-100 to-transparent opacity-90" />

          {/* Floating Rising Heat Bubbles */}
          {percentage > 5 && (
            <>
              <div
                className="absolute top-1/2 left-[20%] w-1.5 h-1.5 rounded-full bg-amber-200/90 shadow-[0_0_4px_#fef08a] animate-lava-bubble-1 pointer-events-none"
              />
              <div
                className="absolute top-1/2 left-[50%] w-1.5 h-1.5 rounded-full bg-yellow-200/90 shadow-[0_0_4px_#fef08a] animate-lava-bubble-2 pointer-events-none"
              />
              <div
                className="absolute top-1/2 left-[75%] w-1 h-1 rounded-full bg-white/90 shadow-[0_0_4px_#fff] animate-lava-bubble-3 pointer-events-none"
              />
              <div
                className="absolute top-1/2 left-[90%] w-1.5 h-1.5 rounded-full bg-amber-100/90 shadow-[0_0_4px_#fef08a] animate-lava-bubble-4 pointer-events-none"
              />
            </>
          )}

          {/* Leading Molten Edge Flare */}
          <div
            className="absolute right-0 top-0 bottom-0 w-3 rounded-full blur-[1px] pointer-events-none"
            style={{
              background: 'radial-gradient(circle, #ffffff 30%, #fef08a 70%, transparent 100%)',
              boxShadow: '0 0 10px #fef08a, 0 0 18px #ea580c',
            }}
          />
        </div>
      </div>
    </div>
  );
};
