import React, { useState, useEffect } from 'react';
import { Sparkles, Flame, ShieldCheck } from 'lucide-react';
import { useDesignSystem } from '../context/DesignSystemContext';

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
  creatorName?: string;
  minDuration?: number;
  onFinish?: () => void;
}

const QUOTES = [
  "Consulting Denzel's official memory archives...",
  "Calibrating friendship truth detectors...",
  "Polishing the 100% Hall of Fame trophies...",
  "Synthesizing customized roasts & titles...",
  "Verifying Supabase encrypted session & RLS...",
  "Preparing the 12-question confessional...",
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "HOTSEAT: DENZEL",
  submessage = "The official friendship interrogation...",
  creatorName = "DENZEL",
  minDuration = 2200,
  onFinish,
}) => {
  const { theme } = useDesignSystem();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    // Cycle witty quotes smoothly
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 1800);

    // Smooth, gradual progress simulation toward 100%
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        const delta = Math.floor(Math.random() * 5) + 3;
        return Math.min(prev + delta, 95);
      });
    }, 120);

    const finishTimeout = setTimeout(() => {
      setProgress(100);
      if (onFinish) {
        setTimeout(onFinish, 300);
      }
    }, minDuration);

    return () => {
      clearInterval(quoteInterval);
      clearInterval(progressInterval);
      clearTimeout(finishTimeout);
    };
  }, [minDuration, onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none bg-slate-950/80 backdrop-blur-md animate-fade-in">
      {/* Background ambient radial glow matching the molten lava aesthetic */}
      <div
        className="absolute w-96 h-96 rounded-full pointer-events-none blur-3xl opacity-20"
        style={{
          background: 'radial-gradient(circle, #f97316 0%, #ea580c 40%, transparent 70%)',
        }}
      />

      <div
        className="relative max-w-sm w-full p-6 sm:p-8 text-center space-y-6 border rounded-3xl shadow-2xl transition-all overflow-hidden"
        style={{
          backgroundColor: theme?.colors?.surface || '#0c0f17',
          borderColor: theme?.colors?.border || 'rgba(255, 255, 255, 0.1)',
          boxShadow: theme?.geometry?.shadowCard || '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
        }}
      >
        {/* Animated Central Core Orb */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          {/* Outer glowing pulsing halo */}
          <div className="absolute inset-0 rounded-2xl bg-orange-500/20 blur-md animate-pulse" />

          {/* Molten Lava Core Container */}
          <div
            className="relative w-16 h-16 rounded-2xl border flex items-center justify-center shadow-lg transition-transform hover:scale-105"
            style={{
              backgroundColor: '#120b06',
              borderColor: 'rgba(249, 115, 22, 0.45)',
              boxShadow: '0 0 20px rgba(249, 115, 22, 0.35)',
            }}
          >
            <Flame className="w-8 h-8 text-orange-400 animate-float" />
          </div>

          {/* Orbiting Sparkle Star */}
          <div className="absolute -top-1 -right-1 text-amber-300 animate-ping opacity-75">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Title & Creator Tag */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px] font-bold tracking-widest uppercase border bg-amber-500/10 border-amber-500/30 text-amber-300">
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            <span>{creatorName}'S OFFICIAL QUIZ</span>
          </div>

          <h2
            className="text-xl sm:text-2xl font-black tracking-tight"
            style={{
              color: theme?.colors?.textPrimary || '#FFFFFF',
              fontFamily: theme?.typography?.displayFont,
            }}
          >
            {message}
          </h2>

          <p
            className="text-xs font-mono font-medium opacity-80 truncate"
            style={{ color: theme?.colors?.textSecondary || '#94A3B8' }}
          >
            {submessage}
          </p>
        </div>

        {/* Molten Lava Progress Bar Indicator */}
        <div className="space-y-2">
          <div
            className="w-full rounded-full h-3 overflow-hidden p-0.5 border relative shadow-inner"
            style={{
              backgroundColor: '#0a0806',
              borderColor: 'rgba(249, 115, 22, 0.35)',
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.9)',
            }}
          >
            <div
              className="h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden animate-lava-flow animate-lava-glow"
              style={{
                width: `${Math.min(progress, 100)}%`,
                background: 'linear-gradient(90deg, #b91c1c 0%, #ea580c 35%, #f97316 70%, #fef08a 100%)',
              }}
            >
              {/* Surface Heat Wave */}
              <div
                className="absolute inset-0 opacity-60 animate-lava-wave"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)',
                  backgroundSize: '200% 100%',
                }}
              />
            </div>
          </div>

          <div
            className="flex items-center justify-between text-[11px] font-mono font-bold"
            style={{ color: theme?.colors?.textSecondary || '#94A3B8' }}
          >
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />
              Initializing...
            </span>
            <span className="text-amber-400">{Math.min(progress, 100)}%</span>
          </div>
        </div>

        {/* Cycling Quotes Banner */}
        <div
          className="p-3 rounded-2xl border text-xs font-mono italic min-h-[48px] flex items-center justify-center text-center opacity-85 transition-all"
          style={{
            backgroundColor: theme?.colors?.surfaceSubtle || 'rgba(255, 255, 255, 0.03)',
            borderColor: theme?.colors?.borderSecondary || 'rgba(255, 255, 255, 0.07)',
            color: theme?.colors?.textSecondary || '#94A3B8',
          }}
        >
          <span>"{QUOTES[quoteIndex]}"</span>
        </div>
      </div>
    </div>
  );
};
