import React, { useState } from 'react';
import { Question } from '../lib/questions';
import { useDesignSystem } from '../context/DesignSystemContext';
import { Check, Edit3, Bookmark } from 'lucide-react';
import { sounds } from '../lib/audio';

interface QuestionCardProps {
  question: Question;
  index: number;
  value: string | number | undefined;
  onChange: (val: string | number) => void;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  value,
  onChange,
}) => {
  const { theme } = useDesignSystem();
  const [showCustomInput, setShowCustomInput] = useState(() => {
    // If current value is not in preset options, show custom input
    if (question.type === 'select' && question.options && value) {
      return !question.options.includes(String(value));
    }
    return false;
  });

  const isCustomAnswer =
    question.type === 'select' &&
    question.options &&
    value &&
    !question.options.includes(String(value));

  return (
    <div className="relative animate-note-entrance">
      {/* Visual Top Washi Tape / Archival Note Clip */}
      <div
        className="w-20 h-3 rounded-full note-tape mx-auto -mb-1.5 relative z-10 opacity-80"
        style={{
          borderColor: 'rgba(255, 255, 255, 0.15)',
        }}
      />

      {/* Main Note Card Container */}
      <div
        className="p-6 sm:p-8 transition-all border relative note-grid-texture overflow-hidden"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.geometry.cardRadius,
          borderWidth: theme.geometry.borderWidth,
          boxShadow: theme.geometry.shadowCard,
          color: theme.colors.textPrimary,
        }}
      >
        {/* Confessional Note Aesthetic Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-orange-400">
            <Bookmark className="w-3.5 h-3.5 fill-orange-400/20 text-orange-400" />
            <span>Field Note #{question.id.replace('q', '')}</span>
          </div>

          <div
            className="px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold"
            style={{
              backgroundColor: theme.colors.surfaceSubtle,
              borderColor: theme.colors.borderSecondary,
              color: theme.colors.textSecondary,
            }}
          >
            {question.type === 'select' ? 'Multiple Choice' : question.type === 'scale' ? 'Scale 1–10' : 'Open Guess'}
          </div>
        </div>

        {/* Question Title */}
        <h2
          className="text-2xl sm:text-3xl font-black leading-tight tracking-tight mb-2"
          style={{
            fontFamily: theme.typography.displayFont,
            color: theme.colors.textPrimary,
          }}
        >
          {question.label}
        </h2>

        {/* Notes Aesthetic: Author's Context / Whisper Note */}
        {question.description && (
          <div
            className="my-4 p-3 sm:p-3.5 rounded-xl border border-dashed flex items-start gap-2.5 transition-all"
            style={{
              backgroundColor: theme.colors.surfaceSubtle,
              borderColor: theme.colors.border,
            }}
          >
            <Edit3 className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm font-serif italic leading-relaxed" style={{ color: theme.colors.textSecondary }}>
              <span className="font-semibold text-amber-300 not-italic mr-1.5">Denzel's Note:</span>
              "{question.description}"
            </div>
          </div>
        )}

        {/* 1. SELECT (Multiple Choice Options) */}
        {question.type === 'select' && question.options && (
          <div className="space-y-3 pt-2">
            {question.options.map((option, optIdx) => {
              const isSelected = value === option;
              const letter = LETTERS[optIdx] || String(optIdx + 1);

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setShowCustomInput(false);
                    onChange(option);
                  }}
                  className={`interactive-option w-full text-left p-3.5 sm:p-4 border flex items-center justify-between cursor-pointer group ${
                    isSelected ? 'animate-option-pop' : ''
                  }`}
                  style={{
                    backgroundColor: isSelected ? theme.colors.accent : theme.colors.surfaceSubtle,
                    color: isSelected ? theme.colors.accentText : theme.colors.textPrimary,
                    borderColor: isSelected ? theme.colors.accent : theme.colors.border,
                    borderWidth: theme.geometry.borderWidth,
                    borderRadius: theme.geometry.cardRadiusSm,
                    boxShadow: isSelected
                      ? `0 0 16px -2px ${theme.colors.accent}40, ${theme.geometry.shadowSm}`
                      : 'none',
                  }}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Circle Letter Badge: (A), (B), (C), (D) */}
                    <div
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center font-mono font-bold text-xs sm:text-sm flex-shrink-0 transition-transform ${
                        isSelected ? 'scale-110' : 'group-hover:scale-105'
                      }`}
                      style={{
                        borderColor: isSelected ? 'transparent' : theme.colors.border,
                        backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : theme.colors.surfaceElevated,
                        color: isSelected ? theme.colors.accentText : theme.colors.textPrimary,
                      }}
                    >
                      {letter}
                    </div>

                    <span className="font-bold text-sm sm:text-base leading-snug">
                      {option}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="flex-shrink-0 ml-2 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center animate-option-pop">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              );
            })}

            {/* Custom Answer Option */}
            <div className="pt-2">
              {!showCustomInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="font-serif italic text-xs sm:text-sm transition underline underline-offset-4 cursor-pointer hover:text-orange-400"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Or pen your own custom answer...
                </button>
              ) : (
                <div
                  className="p-3.5 border space-y-2 transition-all animate-note-entrance"
                  style={{
                    backgroundColor: theme.colors.surfaceSubtle,
                    borderColor: theme.colors.border,
                    borderRadius: theme.geometry.cardRadiusSm,
                    borderWidth: theme.geometry.borderWidth,
                    boxShadow: theme.geometry.shadowSm,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="font-serif italic text-xs font-bold"
                      style={{ color: theme.colors.textPrimary }}
                    >
                      Personal handwritten answer:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomInput(false);
                        if (isCustomAnswer) onChange('');
                      }}
                      className="text-[11px] font-mono font-bold cursor-pointer opacity-70 hover:opacity-100"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      Cancel
                    </button>
                  </div>
                  <input
                    type="text"
                    value={isCustomAnswer ? String(value) : ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Type your own specific answer..."
                    autoFocus
                    className="w-full border px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                    style={{
                      backgroundColor: theme.colors.surfaceElevated,
                      borderColor: theme.colors.border,
                      borderRadius: theme.geometry.cardRadiusInner,
                      color: theme.colors.textPrimary,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. SCALE (1 - 10) */}
        {question.type === 'scale' && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {Array.from(
                { length: (question.max || 10) - (question.min || 1) + 1 },
                (_, i) => (question.min || 1) + i
              ).map((num) => {
                const isSelected = Number(value) === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      onChange(num);
                    }}
                    className={`interactive-scale-btn aspect-square sm:aspect-auto sm:h-12 font-mono font-bold text-sm sm:text-base border flex items-center justify-center cursor-pointer ${
                      isSelected ? 'animate-option-pop z-10' : ''
                    }`}
                    style={{
                      backgroundColor: isSelected ? theme.colors.accent : theme.colors.surfaceSubtle,
                      color: isSelected ? theme.colors.accentText : theme.colors.textPrimary,
                      borderColor: isSelected ? theme.colors.accent : theme.colors.border,
                      borderWidth: theme.geometry.borderWidth,
                      borderRadius: theme.geometry.cardRadiusSm,
                      boxShadow: isSelected
                        ? `0 0 16px -2px ${theme.colors.accent}50, ${theme.geometry.shadowSm}`
                        : 'none',
                    }}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            {(question.minLabel || question.maxLabel) && (
              <div
                className="flex justify-between items-center font-mono text-xs px-1 pt-1"
                style={{ color: theme.colors.textSecondary }}
              >
                <span>{question.minLabel || `${question.min || 1} (Lowest)`}</span>
                <span>{question.maxLabel || `${question.max || 10} (Highest)`}</span>
              </div>
            )}
          </div>
        )}

        {/* 3. TEXT INPUT */}
        {question.type === 'text' && (
          <div className="space-y-2 pt-2">
            <textarea
              rows={4}
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={question.placeholder || 'Type your guess here...'}
              className="w-full border p-4 text-base font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/40 leading-relaxed transition-all"
              style={{
                backgroundColor: theme.colors.surfaceSubtle,
                borderColor: theme.colors.border,
                borderRadius: theme.geometry.cardRadiusSm,
                borderWidth: theme.geometry.borderWidth,
                boxShadow: theme.geometry.shadowSm,
                color: theme.colors.textPrimary,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
