import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, HelpCircle, Heart, ShieldCheck, Database } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
  creatorName?: string;
  onFinish?: () => void;
  minDuration?: number; // milliseconds before onFinish can be triggered
}

const WITTY_QUOTES = [
  'Consulting Denzel’s official memory archives...',
  'Checking if anyone actually knows Denzel’s middle name...',
  'Syncing custom questions and answer key...',
  'Polishing the Hall of Fame & Hall of Shame trophies...',
  'Calibrating friendship accuracy meters...',
  'Verifying Supabase PostgreSQL connection...',
  'Preparing roast algorithms for wrong guesses...',
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message,
  submessage,
  creatorName = 'DENZEL',
  onFinish,
  minDuration = 800,
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [progress, setProgress] = useState(15);
  const [iconPhase, setIconPhase] = useState<0 | 1 | 2>(0);

  // Cycle witty quotes every 1.6s
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % WITTY_QUOTES.length);
      setIconPhase((prev) => ((prev + 1) % 3) as 0 | 1 | 2);
    }, 1600);

    return () => clearInterval(quoteInterval);
  }, []);

  // Animate progress smoothly towards 100%
  useEffect(() => {
    const start = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(95, Math.floor(15 + (elapsed / minDuration) * 80));
      setProgress(pct);

      if (elapsed >= minDuration && onFinish) {
        setProgress(100);
        clearInterval(progressInterval);
        setTimeout(() => {
          onFinish();
        }, 150);
      }
    }, 40);

    return () => clearInterval(progressInterval);
  }, [minDuration, onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FAF7F0] p-4 select-none">
      {/* Background Micro Grid */}
      <div
        className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(#1C1917 1px, transparent 1px), radial-gradient(#1C1917 1px, #FAF7F0 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
        }}
      />

      {/* Main Neo-Brutalist Loading Card */}
      <div className="relative max-w-md w-full bg-[#FFFDF9] border-[3px] border-stone-900 rounded-[32px] p-7 sm:p-9 shadow-brutal text-center space-y-6">
        {/* Creator Brand Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-stone-900 bg-[#FAF7F0] text-[11px] font-mono font-bold tracking-widest uppercase text-stone-700 shadow-brutal-sm">
          <Sparkles className="w-3 h-3 text-[#F9C84E]" />
          <span>{creatorName}’S QUESTIONNAIRE</span>
        </div>

        {/* Dynamic Mascot / Badge */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          {/* Animated decorative ring */}
          <div className="absolute inset-0 rounded-2xl border-2 border-stone-900 bg-[#FAF7F0] rotate-6 shadow-brutal-sm" />

          {/* Main icon box */}
          <div className="relative w-20 h-20 rounded-2xl border-2 border-stone-900 bg-[#F9C84E] flex items-center justify-center shadow-brutal-sm transition-transform duration-300 transform -rotate-3 hover:rotate-0">
            {iconPhase === 0 && (
              <HelpCircle className="w-10 h-10 stroke-[2.5] text-stone-900 animate-pulse" />
            )}
            {iconPhase === 1 && (
              <Trophy className="w-10 h-10 stroke-[2.5] text-stone-900 animate-bounce" />
            )}
            {iconPhase === 2 && (
              <Heart className="w-10 h-10 stroke-[2.5] text-[#E05338] fill-[#E05338] animate-pulse" />
            )}
          </div>
        </div>

        {/* Heading & Lore Message */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            {message || 'How well do you know me?'}
          </h2>
          <p className="font-mono text-xs sm:text-sm text-stone-600 min-h-[36px] flex items-center justify-center transition-all duration-300">
            {submessage || WITTY_QUOTES[quoteIndex]}
          </p>
        </div>

        {/* Striped Neo-Brutalist Progress Bar */}
        <div className="space-y-2 pt-2">
          <div className="w-full bg-[#E8E2D2] border-2 border-stone-900 rounded-2xl h-5 p-0.5 overflow-hidden shadow-brutal-sm">
            <div
              className="h-full bg-[#3D8F70] rounded-xl transition-all duration-150 animate-stripes"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between font-mono text-[11px] text-stone-500 font-bold px-1">
            <span className="flex items-center gap-1">
              <Database className="w-3 h-3 text-stone-700" />
              <span>Initializing data</span>
            </span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Sub-features Checklist */}
        <div className="pt-3 border-t-2 border-stone-200 grid grid-cols-2 gap-2 font-mono text-[10px] text-stone-500 text-left">
          <div className="flex items-center gap-1">
            <span className="text-[#3D8F70] font-bold">✓</span> Auto-saved continuously
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[#3D8F70] font-bold">✓</span> RLS session isolated
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[#3D8F70] font-bold">✓</span> Live rankings ready
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[#3D8F70] font-bold">✓</span> Instant resume support
          </div>
        </div>
      </div>
    </div>
  );
};
