import React, { useState } from 'react';
import { Question } from '../lib/questions';

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
    <div className="bg-[#FFFDF9] border-[2.5px] border-stone-900 rounded-[28px] p-6 sm:p-8 shadow-brutal transition-all">
      {/* Question Title */}
      <h2 className="text-2xl sm:text-3xl font-black text-stone-900 leading-tight tracking-tight mb-6">
        {question.label}
      </h2>

      {/* 1. SELECT (Multiple Choice) - Matches screenshot layout & yellow active state */}
      {question.type === 'select' && question.options && (
        <div className="space-y-3.5">
          {question.options.map((option, optIdx) => {
            const isSelected = value === option;
            const letter = LETTERS[optIdx] || String(optIdx + 1);

            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setShowCustomInput(false);
                  onChange(option);
                }}
                className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 border-stone-900 flex items-center transition-all cursor-pointer shadow-brutal-sm shadow-brutal-hover ${
                  isSelected
                    ? 'bg-[#F9C84E] text-stone-900'
                    : 'bg-[#FAF7F0] hover:bg-white text-stone-900'
                }`}
              >
                {/* Circle Letter Badge: (A), (B), (C), (D) */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-stone-900 flex items-center justify-center font-mono font-bold text-xs sm:text-sm mr-3.5 flex-shrink-0 bg-transparent text-stone-900">
                  {letter}
                </div>
                <span className="font-bold text-sm sm:text-base leading-snug">
                  {option}
                </span>
              </button>
            );
          })}

          {/* Custom Answer Option ("Or type your own answer..." from screenshot) */}
          <div className="pt-2">
            {!showCustomInput ? (
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="font-serif italic text-xs sm:text-sm text-stone-500 hover:text-stone-900 transition underline underline-offset-4 cursor-pointer"
              >
                Or type your own answer...
              </button>
            ) : (
              <div className="p-3.5 rounded-2xl border-2 border-stone-900 bg-[#FAF7F0] shadow-brutal-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-serif italic text-xs text-stone-600 font-bold">
                    Custom answer:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomInput(false);
                      if (isCustomAnswer) onChange('');
                    }}
                    className="text-[11px] font-mono font-bold text-stone-500 hover:text-stone-800"
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
                  className="w-full bg-white border-2 border-stone-900 rounded-xl px-3.5 py-2.5 text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-[#FFFDF9]"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. SCALE (1 - 10) - Tactile brutalist buttons */}
      {question.type === 'scale' && (
        <div className="space-y-4">
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
                  onClick={() => onChange(num)}
                  className={`aspect-square sm:aspect-auto sm:h-12 rounded-xl font-mono font-bold text-sm sm:text-base border-2 border-stone-900 flex items-center justify-center transition shadow-brutal-sm shadow-brutal-hover cursor-pointer ${
                    isSelected
                      ? 'bg-[#F9C84E] text-stone-900 scale-105'
                      : 'bg-[#FAF7F0] hover:bg-white text-stone-900'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          {(question.minLabel || question.maxLabel) && (
            <div className="flex justify-between items-center font-mono text-xs text-stone-600 px-1 pt-1">
              <span>{question.minLabel || `${question.min || 1} (Lowest)`}</span>
              <span>{question.maxLabel || `${question.max || 10} (Highest)`}</span>
            </div>
          )}
        </div>
      )}

      {/* 3. TEXT INPUT */}
      {question.type === 'text' && (
        <div className="space-y-2">
          <textarea
            rows={4}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || 'Type your answer here...'}
            className="w-full bg-[#FAF7F0] border-2 border-stone-900 rounded-2xl p-4 text-base font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white shadow-brutal-sm leading-relaxed"
          />
        </div>
      )}
    </div>
  );
};
