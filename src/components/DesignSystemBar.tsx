import React from 'react';
import { useDesignSystem } from '../context/DesignSystemContext';
import { Palette, Sparkles, SlidersHorizontal } from 'lucide-react';

export const DesignSystemBar: React.FC = () => {
  const { theme, themeId, setThemeId, availableThemes, openExplorer } = useDesignSystem();

  return (
    <div
      className="w-full border-b transition-colors duration-200 py-1.5 px-3 sm:px-6"
      style={{
        backgroundColor: theme.colors.surfaceSubtle,
        borderColor: theme.colors.borderSecondary || theme.colors.border,
      }}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Quick label */}
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold flex-shrink-0">
          <Palette className="w-3.5 h-3.5" style={{ color: theme.colors.accent }} />
          <span className="hidden sm:inline" style={{ color: theme.colors.textSecondary }}>
            Design System:
          </span>
        </div>

        {/* Center: Quick switcher buttons */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
          {availableThemes.map((sys) => {
            const isSelected = sys.id === themeId;
            return (
              <button
                key={sys.id}
                onClick={() => setThemeId(sys.id)}
                className="px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer border"
                style={{
                  backgroundColor: isSelected ? sys.colors.surface : 'transparent',
                  borderColor: isSelected ? sys.colors.border : 'transparent',
                  color: isSelected ? sys.colors.textPrimary : theme.colors.textSecondary,
                  boxShadow: isSelected ? sys.geometry.shadowSm : 'none',
                  fontWeight: isSelected ? 700 : 500,
                }}
                title={sys.subtitle}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: sys.colors.accent }}
                />
                <span className="truncate">{sys.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Compare All / Customize Button */}
        <button
          onClick={openExplorer}
          className="px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-bold border transition flex items-center gap-1 flex-shrink-0 cursor-pointer shadow-xs"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            color: theme.colors.textPrimary,
          }}
          title="Open Design System Explorer & Comparison Gallery"
        >
          <SlidersHorizontal className="w-3 h-3" />
          <span className="hidden sm:inline">Compare 5 Systems</span>
          <span className="sm:hidden">Gallery</span>
        </button>
      </div>
    </div>
  );
};
