import React, { useState } from 'react';
import { useDesignSystem } from '../context/DesignSystemContext';
import { DesignSystemId, DesignSystemMeta } from '../lib/designSystems';
import {
  Palette,
  X,
  Check,
  Copy,
  Sparkles,
  Layers,
  Type,
  Maximize2,
  Sliders,
  ShieldCheck,
  Eye,
  CheckCircle2,
  Code2,
  Info,
} from 'lucide-react';

export const DesignSystemModal: React.FC = () => {
  const {
    theme,
    themeId,
    setThemeId,
    availableThemes,
    isExplorerOpen,
    closeExplorer,
  } = useDesignSystem();

  const [activeTab, setActiveTab] = useState<'overview' | 'components' | 'tokens' | 'code'>('overview');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // Playground interactive states
  const [demoSelectedOption, setDemoSelectedOption] = useState<string>('Option A');
  const [demoScaleValue, setDemoScaleValue] = useState<number>(8);

  if (!isExplorerOpen) return null;

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const handleCopyConfig = () => {
    const configExport = `/* Design System: ${theme.name} (${theme.subtitle}) */
:root {
${Object.entries(theme.cssVariables)
  .map(([k, v]) => `  ${k}: ${v};`)
  .join('\n')}
}

/* Typography */
--font-display: ${theme.typography.displayFont};
--font-body: ${theme.typography.bodyFont};
--font-mono: ${theme.typography.monoFont};

/* Geometry & Shadow */
--radius-card: ${theme.geometry.cardRadius};
--radius-btn: ${theme.geometry.cardRadiusSm};
--border-width: ${theme.geometry.borderWidth};
--shadow-card: ${theme.geometry.shadowCard};
`;
    navigator.clipboard.writeText(configExport);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/70 backdrop-blur-sm overflow-y-auto">
      <div
        className="w-full max-w-4xl my-auto max-h-[92vh] flex flex-col rounded-[24px] sm:rounded-[32px] overflow-hidden transition-all duration-300 shadow-2xl border"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          color: theme.colors.textPrimary,
          fontFamily: theme.typography.bodyFont,
        }}
      >
        {/* Top Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between gap-4"
          style={{ borderColor: theme.colors.borderSecondary || theme.colors.border }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold border"
              style={{
                backgroundColor: theme.colors.accent,
                color: theme.colors.accentText,
                borderColor: theme.colors.border,
                boxShadow: theme.geometry.shadowSm,
              }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  className="text-lg sm:text-xl font-bold tracking-tight"
                  style={{ fontFamily: theme.typography.displayFont }}
                >
                  Custom UI/UX Design Systems
                </h2>
                <span
                  className="text-[11px] font-mono font-bold px-2 py-0.5 rounded border"
                  style={{
                    backgroundColor: theme.colors.surfaceSubtle,
                    borderColor: theme.colors.border,
                    color: theme.colors.textSecondary,
                  }}
                >
                  5 Bespoke Archetypes
                </span>
              </div>
              <p
                className="text-xs text-left"
                style={{ color: theme.colors.textSecondary }}
              >
                Click any design system to apply it instantly to the entire application.
              </p>
            </div>
          </div>

          <button
            onClick={closeExplorer}
            className="w-8 h-8 rounded-full flex items-center justify-center border transition hover:opacity-80 cursor-pointer"
            style={{
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surfaceSubtle,
              color: theme.colors.textPrimary,
            }}
            title="Close Design Explorer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Theme Selector Row (5 Cards) */}
        <div
          className="p-4 sm:p-5 border-b overflow-x-auto"
          style={{
            backgroundColor: theme.colors.surfaceSubtle,
            borderColor: theme.colors.borderSecondary || theme.colors.border,
          }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 min-w-[580px] sm:min-w-0">
            {availableThemes.map((sys) => {
              const isSelected = sys.id === themeId;
              return (
                <button
                  key={sys.id}
                  onClick={() => setThemeId(sys.id)}
                  className="p-3 text-left rounded-xl border transition-all cursor-pointer relative group flex flex-col justify-between"
                  style={{
                    backgroundColor: isSelected ? sys.colors.surface : sys.colors.surfaceElevated,
                    borderColor: isSelected ? sys.colors.accent : sys.colors.border,
                    borderWidth: isSelected ? '2px' : '1px',
                    boxShadow: isSelected ? sys.geometry.shadowSm : 'none',
                    transform: isSelected ? 'translateY(-2px)' : 'none',
                  }}
                >
                  <div>
                    {/* Color Swatch Bar */}
                    <div className="flex items-center gap-1 mb-2">
                      <div
                        className="w-4 h-4 rounded-full border border-black/10"
                        style={{ backgroundColor: sys.colors.canvas }}
                        title={`Canvas: ${sys.colors.canvas}`}
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-black/10"
                        style={{ backgroundColor: sys.colors.surface }}
                        title={`Surface: ${sys.colors.surface}`}
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-black/10"
                        style={{ backgroundColor: sys.colors.accent }}
                        title={`Accent: ${sys.colors.accent}`}
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-black/10"
                        style={{ backgroundColor: sys.colors.statusCorrect }}
                        title={`Success: ${sys.colors.statusCorrect}`}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      <h4
                        className="text-xs font-bold truncate"
                        style={{ color: sys.colors.textPrimary }}
                      >
                        {sys.name}
                      </h4>
                      {isSelected && (
                        <CheckCircle2
                          className="w-3.5 h-3.5 flex-shrink-0"
                          style={{ color: sys.colors.accent }}
                        />
                      )}
                    </div>
                    <p
                      className="text-[10px] leading-tight line-clamp-2 mt-0.5"
                      style={{ color: sys.colors.textSecondary }}
                    >
                      {sys.subtitle}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between text-[9px] font-mono">
                    <span style={{ color: sys.colors.textMuted }}>
                      {sys.geometry.borderWidth} / {sys.geometry.cardRadius}
                    </span>
                    {isSelected && (
                      <span
                        className="font-bold uppercase tracking-wider"
                        style={{ color: sys.colors.accent }}
                      >
                        Active
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className="px-6 pt-3 flex items-center gap-2 border-b text-xs font-bold"
          style={{ borderColor: theme.colors.borderSecondary || theme.colors.border }}
        >
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-current font-bold'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Overview & Philosophy</span>
          </button>
          <button
            onClick={() => setActiveTab('components')}
            className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'components'
                ? 'border-current font-bold'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Interactive Component Sandbox</span>
          </button>
          <button
            onClick={() => setActiveTab('tokens')}
            className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tokens'
                ? 'border-current font-bold'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Color & Spatial Tokens</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'border-current font-bold'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Export Configuration</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Highlight Hero Card */}
              <div
                className="p-5 sm:p-6 rounded-2xl border"
                style={{
                  backgroundColor: theme.colors.surfaceSubtle,
                  borderColor: theme.colors.border,
                  boxShadow: theme.geometry.shadowSm,
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <span
                      className="text-xs font-mono font-bold tracking-widest uppercase block mb-1"
                      style={{ color: theme.colors.textMuted }}
                    >
                      {theme.subtitle}
                    </span>
                    <h3
                      className="text-2xl sm:text-3xl font-black tracking-tight"
                      style={{ fontFamily: theme.typography.displayFont }}
                    >
                      {theme.name}
                    </h3>
                  </div>
                  <button
                    onClick={closeExplorer}
                    className="px-4 py-2 rounded-xl text-xs font-bold border transition shadow-sm cursor-pointer self-start sm:self-auto"
                    style={{
                      backgroundColor: theme.colors.accent,
                      color: theme.colors.accentText,
                      borderColor: theme.colors.border,
                      boxShadow: theme.geometry.shadowSm,
                    }}
                  >
                    Use This Design System
                  </button>
                </div>

                <p
                  className="text-sm sm:text-base leading-relaxed mb-4 italic"
                  style={{ color: theme.colors.textSecondary }}
                >
                  "{theme.curatorQuote}"
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-3 border-t border-black/10">
                  <div>
                    <span className="font-bold block mb-0.5">Target Mood:</span>
                    <span style={{ color: theme.colors.textSecondary }}>{theme.targetMood}</span>
                  </div>
                  <div>
                    <span className="font-bold block mb-0.5">Best Suited For:</span>
                    <span style={{ color: theme.colors.textSecondary }}>{theme.bestSuitedFor}</span>
                  </div>
                </div>
              </div>

              {/* Anti-AI Slop & Constitution Restraints */}
              <div
                className="p-5 rounded-2xl border"
                style={{
                  backgroundColor: theme.colors.surfaceElevated,
                  borderColor: theme.colors.borderSecondary || theme.colors.border,
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck
                    className="w-4 h-4"
                    style={{ color: theme.colors.statusCorrect }}
                  />
                  <h4 className="text-sm font-bold tracking-tight">
                    Frontend Design Constitution & Anti-AI Slop Compliance
                  </h4>
                </div>

                <ul className="space-y-2 text-xs leading-relaxed">
                  {theme.antiSlopRestraints.map((restraint, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span
                        className="text-xs font-mono font-bold mt-0.5"
                        style={{ color: theme.colors.statusCorrect }}
                      >
                        ✓
                      </span>
                      <span style={{ color: theme.colors.textSecondary }}>{restraint}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-2">
                    <span
                      className="text-xs font-mono font-bold mt-0.5"
                      style={{ color: theme.colors.statusCorrect }}
                    >
                      ✓
                    </span>
                    <span style={{ color: theme.colors.textSecondary }}>
                      Zero-pill static metadata: unboxed typography with elegant separator dots.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span
                      className="text-xs font-mono font-bold mt-0.5"
                      style={{ color: theme.colors.statusCorrect }}
                    >
                      ✓
                    </span>
                    <span style={{ color: theme.colors.textSecondary }}>
                      60-30-10 color discipline: 60% neutral canvas, 30% structural surfaces, 10% accent intent.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Typography Preview */}
              <div
                className="p-5 rounded-2xl border"
                style={{
                  backgroundColor: theme.colors.surfaceElevated,
                  borderColor: theme.colors.borderSecondary || theme.colors.border,
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Type className="w-4 h-4" style={{ color: theme.colors.accent }} />
                  <h4 className="text-sm font-bold tracking-tight">
                    Typographic System (2+1 Rule)
                  </h4>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-black/5" style={{ backgroundColor: theme.colors.surfaceSubtle }}>
                    <div className="text-[11px] font-mono font-bold mb-1 opacity-60">
                      DISPLAY FONT · {theme.typography.displayFontName}
                    </div>
                    <div
                      className="text-2xl sm:text-3xl font-black leading-tight"
                      style={{ fontFamily: theme.typography.displayFont }}
                    >
                      How well do you know me?
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-black/5" style={{ backgroundColor: theme.colors.surfaceSubtle }}>
                    <div className="text-[11px] font-mono font-bold mb-1 opacity-60">
                      BODY PROSE · {theme.typography.bodyFontName}
                    </div>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ fontFamily: theme.typography.bodyFont, color: theme.colors.textSecondary }}
                    >
                      Answer 12 honest questions to test how closely you pay attention. Your responses save continuously and isolate securely to your participant handle.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-black/5" style={{ backgroundColor: theme.colors.surfaceSubtle }}>
                    <div className="text-[11px] font-mono font-bold mb-1 opacity-60">
                      DATA & TABULAR NUMERALS · {theme.typography.monoFontName}
                    </div>
                    <div
                      className="text-sm font-mono tracking-wider tabular-nums flex items-center justify-between"
                    >
                      <span>RANK #01 · JORDAN M.</span>
                      <span className="font-bold" style={{ color: theme.colors.statusCorrect }}>
                        12 / 12 (100%) · 00:01:42
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPONENT SANDBOX */}
          {activeTab === 'components' && (
            <div className="space-y-6">
              <div className="text-xs mb-2" style={{ color: theme.colors.textSecondary }}>
                Live rendering of core questionnaire components using {theme.name} tokens:
              </div>

              {/* Sample Question Card */}
              <div
                className="p-6 rounded-[24px] border transition-all"
                style={{
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  borderRadius: theme.geometry.cardRadius,
                  borderWidth: theme.geometry.borderWidth,
                  boxShadow: theme.geometry.shadowCard,
                }}
              >
                {/* Step kicker */}
                <div
                  className="font-mono text-xs font-bold uppercase mb-2"
                  style={{
                    color: theme.colors.textSecondary,
                    letterSpacing: '0.2em',
                  }}
                >
                  QUESTION 06 / 12 · LIVE PREVIEW
                </div>

                <h3
                  className="text-xl sm:text-2xl font-bold tracking-tight mb-5"
                  style={{ fontFamily: theme.typography.displayFont }}
                >
                  What is Denzel's absolute favorite food or comfort meal?
                </h3>

                {/* Option buttons */}
                <div className="space-y-2.5">
                  {['Jollof rice with fried plantains & grilled chicken', 'Neapolitan margherita pizza with fresh basil', 'Spicy ramen with soft-boiled egg'].map(
                    (opt, i) => {
                      const isSelected = demoSelectedOption === opt;
                      const letter = ['A', 'B', 'C'][i];
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setDemoSelectedOption(opt)}
                          className="w-full text-left p-3.5 rounded-xl border flex items-center transition-all cursor-pointer"
                          style={{
                            backgroundColor: isSelected
                              ? theme.colors.accent
                              : theme.colors.surfaceSubtle,
                            borderColor: theme.colors.border,
                            borderWidth: theme.geometry.borderWidth,
                            borderRadius: theme.geometry.cardRadiusSm,
                            color: isSelected
                              ? theme.colors.accentText
                              : theme.colors.textPrimary,
                            boxShadow: isSelected
                              ? theme.geometry.shadowSm
                              : 'none',
                          }}
                        >
                          <div
                            className="w-7 h-7 rounded-full border flex items-center justify-center font-mono font-bold text-xs mr-3 flex-shrink-0"
                            style={{
                              borderColor: theme.colors.border,
                              color: isSelected
                                ? theme.colors.accentText
                                : theme.colors.textPrimary,
                            }}
                          >
                            {letter}
                          </div>
                          <span className="font-semibold text-xs sm:text-sm">{opt}</span>
                        </button>
                      );
                    }
                  )}
                </div>

                {/* Scale demo */}
                <div className="mt-6 pt-5 border-t" style={{ borderColor: theme.colors.borderSecondary || theme.colors.border }}>
                  <div
                    className="text-xs font-mono font-bold uppercase mb-2"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    1 - 10 Scale Selector
                  </div>
                  <div className="grid grid-cols-10 gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                      const isSelected = demoScaleValue === num;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setDemoScaleValue(num)}
                          className="aspect-square rounded-lg font-mono font-bold text-xs border flex items-center justify-center transition cursor-pointer"
                          style={{
                            backgroundColor: isSelected
                              ? theme.colors.accent
                              : theme.colors.surfaceSubtle,
                            color: isSelected
                              ? theme.colors.accentText
                              : theme.colors.textPrimary,
                            borderColor: theme.colors.border,
                            borderWidth: theme.geometry.borderWidth,
                            boxShadow: isSelected ? theme.geometry.shadowSm : 'none',
                          }}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Progress bar and controls */}
                <div className="mt-6 pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderColor: theme.colors.borderSecondary || theme.colors.border }}>
                  <div className="w-full sm:w-1/2">
                    <div className="flex justify-between text-[11px] font-mono mb-1" style={{ color: theme.colors.textSecondary }}>
                      <span>Progress</span>
                      <span>50%</span>
                    </div>
                    <div
                      className="w-full h-2.5 rounded-full overflow-hidden border p-0.5"
                      style={{
                        backgroundColor: theme.colors.surfaceSubtle,
                        borderColor: theme.colors.border,
                      }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: '50%',
                          backgroundColor: theme.colors.statusWrong,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer"
                      style={{
                        backgroundColor: theme.colors.surfaceElevated,
                        borderColor: theme.colors.border,
                        borderRadius: theme.geometry.cardRadiusSm,
                        boxShadow: theme.geometry.shadowSm,
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer"
                      style={{
                        backgroundColor: theme.colors.accent,
                        color: theme.colors.accentText,
                        borderColor: theme.colors.border,
                        borderRadius: theme.geometry.cardRadiusSm,
                        boxShadow: theme.geometry.shadowSm,
                      }}
                    >
                      Next Question
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TOKENS */}
          {activeTab === 'tokens' && (
            <div className="space-y-6">
              {/* Color Swatches Grid */}
              <div>
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider mb-3" style={{ color: theme.colors.textSecondary }}>
                  60-30-10 Palette Swatches (Click to copy Hex)
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: '60% Canvas', hex: theme.colors.canvas, role: 'Base Background' },
                    { label: '30% Surface', hex: theme.colors.surface, role: 'Card Container' },
                    { label: 'Surface Subtle', hex: theme.colors.surfaceSubtle, role: 'Secondary Area' },
                    { label: 'Border', hex: theme.colors.border, role: 'Structural Stroke' },
                    { label: '10% Accent', hex: theme.colors.accent, role: 'Primary Action' },
                    { label: 'Secondary Accent', hex: theme.colors.accentSecondary, role: 'Supporting Cue' },
                    { label: 'Status Correct', hex: theme.colors.statusCorrect, role: 'Quiz Correct' },
                    { label: 'Status Wrong', hex: theme.colors.statusWrong, role: 'Quiz Wrong' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleCopyColor(item.hex)}
                      className="p-3 rounded-xl border text-left transition hover:scale-[1.02] cursor-pointer group"
                      style={{
                        backgroundColor: theme.colors.surfaceElevated,
                        borderColor: theme.colors.borderSecondary || theme.colors.border,
                      }}
                    >
                      <div
                        className="w-full h-10 rounded-lg border mb-2 relative flex items-center justify-center"
                        style={{
                          backgroundColor: item.hex,
                          borderColor: theme.colors.border,
                        }}
                      >
                        {copiedColor === item.hex && (
                          <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-black/80 text-white">
                            Copied!
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-[11px] font-mono" style={{ color: theme.colors.textSecondary }}>
                        {item.hex}
                      </div>
                      <div className="text-[10px] mt-0.5" style={{ color: theme.colors.textMuted }}>
                        {item.role}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Geometry Specs */}
              <div
                className="p-5 rounded-2xl border"
                style={{
                  backgroundColor: theme.colors.surfaceElevated,
                  borderColor: theme.colors.borderSecondary || theme.colors.border,
                }}
              >
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider mb-3" style={{ color: theme.colors.textSecondary }}>
                  Spatial Math & Geometric Tokens
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
                  <div>
                    <span className="block opacity-60">Card Corner Radius:</span>
                    <span className="font-bold text-sm">{theme.geometry.cardRadius}</span>
                  </div>
                  <div>
                    <span className="block opacity-60">Button/Input Radius:</span>
                    <span className="font-bold text-sm">{theme.geometry.cardRadiusSm}</span>
                  </div>
                  <div>
                    <span className="block opacity-60">Stroke Border Width:</span>
                    <span className="font-bold text-sm">{theme.geometry.borderWidth}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block opacity-60">Box-Shadow Formula:</span>
                    <span className="font-bold text-xs truncate block">{theme.geometry.shadowCard}</span>
                  </div>
                  <div>
                    <span className="block opacity-60">Active Press Physics:</span>
                    <span className="font-bold text-xs">{theme.geometry.buttonActiveTransform}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EXPORT CODE */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold">Copy-Pasteable Design Tokens</h4>
                  <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                    Ready-to-use CSS Variables and Tailwind design token parameters.
                  </p>
                </div>
                <button
                  onClick={handleCopyConfig}
                  className="px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
                  style={{
                    backgroundColor: theme.colors.accent,
                    color: theme.colors.accentText,
                    borderColor: theme.colors.border,
                    boxShadow: theme.geometry.shadowSm,
                  }}
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy CSS Variables</span>
                    </>
                  )}
                </button>
              </div>

              <pre
                className="p-4 rounded-xl border font-mono text-xs overflow-x-auto select-all leading-relaxed"
                style={{
                  backgroundColor: theme.colors.surfaceSubtle,
                  borderColor: theme.colors.border,
                  color: theme.colors.textPrimary,
                }}
              >
{`/* -------------------------------------------------------------
 * Design System: ${theme.name}
 * Archetype: ${theme.subtitle}
 * Philosophy: ${theme.tagline}
 * ------------------------------------------------------------- */

:root[data-theme="${theme.id}"] {
  --ds-canvas: ${theme.colors.canvas};
  --ds-surface: ${theme.colors.surface};
  --ds-surface-subtle: ${theme.colors.surfaceSubtle};
  --ds-border: ${theme.colors.border};
  --ds-text-primary: ${theme.colors.textPrimary};
  --ds-text-secondary: ${theme.colors.textSecondary};
  --ds-accent: ${theme.colors.accent};
  --ds-accent-text: ${theme.colors.accentText};
  --ds-accent-sec: ${theme.colors.accentSecondary};
  --ds-shadow: ${theme.geometry.shadowCard};
  --ds-shadow-sm: ${theme.geometry.shadowSm};
  --ds-radius-card: ${theme.geometry.cardRadius};
  --ds-radius-btn: ${theme.geometry.cardRadiusSm};
}

/* Typography Pairing */
Display: ${theme.typography.displayFont}
Body:    ${theme.typography.bodyFont}
Mono:    ${theme.typography.monoFont}`}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className="px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{
            backgroundColor: theme.colors.surfaceSubtle,
            borderColor: theme.colors.borderSecondary || theme.colors.border,
          }}
        >
          <div className="flex items-center gap-2 text-xs font-mono">
            <span style={{ color: theme.colors.textSecondary }}>Active System:</span>
            <span
              className="font-bold px-2 py-0.5 rounded border"
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.textPrimary,
              }}
            >
              {theme.name}
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={closeExplorer}
              className="px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer"
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.textPrimary,
              }}
            >
              Done Previewing
            </button>
            <button
              onClick={closeExplorer}
              className="px-5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer"
              style={{
                backgroundColor: theme.colors.accent,
                color: theme.colors.accentText,
                borderColor: theme.colors.border,
                boxShadow: theme.geometry.shadowSm,
              }}
            >
              Apply {theme.name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
