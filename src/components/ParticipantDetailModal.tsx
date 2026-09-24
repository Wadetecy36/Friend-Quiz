import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  CheckCircle2,
  XCircle,
  Share2,
  Check,
  Sparkles,
  Calendar,
  Flame,
  Lock,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import { ParticipantScore } from '../lib/scoring';
import { formatDate, getParticipantAvatar } from '../lib/utils';
import { useDesignSystem } from '../context/DesignSystemContext';
import { triggerCelebration, sounds } from '../lib/audio';

interface ParticipantDetailModalProps {
  participant: ParticipantScore | null;
  rankIndex?: number;
  isAdmin?: boolean;
  onClose: () => void;
  onTakeQuiz?: () => void;
}

export const ParticipantDetailModal: React.FC<ParticipantDetailModalProps> = ({
  participant,
  rankIndex,
  isAdmin = false,
  onClose,
}) => {
  const { theme } = useDesignSystem();
  const [filterMode, setFilterMode] = useState<'all' | 'wrong' | 'correct'>('all');
  const [copiedShare, setCopiedShare] = useState(false);

  if (!participant) return null;

  const total = participant.totalQuestions || 12;
  const correctCount = participant.correctCount || 0;
  const wrongCount = participant.wrongCount || (total - correctCount);
  const correctPercent = Math.round((correctCount / total) * 100);
  const wrongPercent = 100 - correctPercent;

  const displayRank =
    typeof rankIndex === 'number'
      ? rankIndex === 0
        ? '👑 #1 Champion'
        : rankIndex === 1
        ? '🥈 #2 Runner-Up'
        : rankIndex === 2
        ? '🥉 #3 Bronze'
        : `#${rankIndex + 1}`
      : 'Participant';

  const handleShare = () => {
    sounds.playClick();
    const shareText = `Check out ${participant.participant_name}'s score on HotSeat: ${correctCount}/${total} (${correctPercent}% Correct, ${wrongPercent}% Wrong)! Rank Title: "${participant.roastTitle}". Can you beat them? Play at: ${window.location.origin}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const filteredResults = participant.results.filter((r) => {
    if (filterMode === 'correct') return r.isCorrect;
    if (filterMode === 'wrong') return !r.isCorrect;
    return true;
  });

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 select-none"
      style={{ minHeight: '100vh', WebkitOverflowScrolling: 'touch' }}
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center py-4">
        {/* Modal Dialog Window */}
        <div
          className="relative max-w-md w-full max-h-[90vh] flex flex-col border rounded-3xl shadow-2xl overflow-hidden transition-all z-10"
          style={{
            backgroundColor: theme?.colors?.surface || '#0c0f17',
            borderColor: 'rgba(249, 115, 22, 0.35)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 25px rgba(249, 115, 22, 0.15)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header Bar */}
        <div
          className="p-5 sm:p-6 border-b flex items-center justify-between relative bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent"
          style={{ borderColor: theme?.colors?.borderSecondary || 'rgba(255, 255, 255, 0.1)' }}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Large Participant Avatar */}
            <div
              className="w-14 h-14 rounded-2xl border flex items-center justify-center text-3xl shadow-md flex-shrink-0"
              style={{
                backgroundColor: 'rgba(249, 115, 22, 0.12)',
                borderColor: 'rgba(249, 115, 22, 0.4)',
              }}
            >
              {getParticipantAvatar(participant.participant_name)}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3
                  className="text-lg sm:text-xl font-black truncate"
                  style={{
                    color: theme?.colors?.textPrimary || '#FFFFFF',
                    fontFamily: theme?.typography?.displayFont,
                  }}
                >
                  {participant.participant_name}
                </h3>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/15 text-amber-300 whitespace-nowrap">
                  {displayRank}
                </span>
              </div>

              <div
                className="flex items-center gap-1.5 text-xs font-mono mt-0.5 opacity-75"
                style={{ color: theme?.colors?.textSecondary || '#94A3B8' }}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(participant.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-2 rounded-xl border transition cursor-pointer hover:bg-white/10 opacity-70 hover:opacity-100"
            style={{
              borderColor: theme?.colors?.borderSecondary || 'rgba(255, 255, 255, 0.15)',
              color: theme?.colors?.textPrimary || '#FFFFFF',
            }}
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 font-mono text-xs">
          {/* Main Score Showcase */}
          <div
            className="p-5 rounded-2xl border text-center space-y-4"
            style={{
              backgroundColor: theme?.colors?.surfaceSubtle || 'rgba(255, 255, 255, 0.03)',
              borderColor: theme?.colors?.borderSecondary || 'rgba(255, 255, 255, 0.08)',
            }}
          >
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest block opacity-60">
                Final Score
              </span>
              <div className="flex items-baseline justify-center gap-1.5 mt-1">
                <span className="text-4xl sm:text-5xl font-black text-emerald-400">
                  {correctCount}
                </span>
                <span className="text-xl font-bold opacity-50">
                  / {total}
                </span>
              </div>
            </div>

            {/* Visual Correct vs Wrong Percentage Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-900 border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                  style={{ width: `${correctPercent}%` }}
                />
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-500"
                  style={{ width: `${wrongPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-bold pt-0.5">
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {correctPercent}% Correct ({correctCount})
                </span>
                <span className="text-rose-400 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  {wrongPercent}% Wrong ({wrongCount})
                </span>
              </div>
            </div>

            {/* Quick Stat Cards: Correct % & Wrong % */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
              <div className="p-3 rounded-xl border border-emerald-500/25 bg-emerald-950/20 text-center">
                <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Accuracy Rate
                </div>
                <div className="text-2xl font-black text-emerald-300 mt-0.5">
                  {correctPercent}%
                </div>
                <div className="text-[10px] opacity-70 text-emerald-200">
                  {correctCount} of {total} correct
                </div>
              </div>

              <div className="p-3 rounded-xl border border-rose-500/25 bg-rose-950/20 text-center">
                <div className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                  Error Rate
                </div>
                <div className="text-2xl font-black text-rose-300 mt-0.5">
                  {wrongPercent}%
                </div>
                <div className="text-[10px] opacity-70 text-rose-200">
                  {wrongCount} mistake{wrongCount === 1 ? '' : 's'}
                </div>
              </div>
            </div>

            {/* Official Title & Roast */}
            <div
              className="pt-3 border-t space-y-1.5"
              style={{ borderColor: theme?.colors?.borderSecondary || 'rgba(255, 255, 255, 0.08)' }}
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/35 text-amber-300">
                <Flame className="w-3.5 h-3.5" />
                <span>Title: {participant.roastTitle}</span>
              </div>
              <p
                className="font-serif italic text-xs leading-relaxed max-w-sm mx-auto"
                style={{ color: theme?.colors?.textSecondary || '#94A3B8' }}
              >
                "{participant.roastDescription}"
              </p>
            </div>
          </div>

          {/* Privacy Note for Participants (Answers hidden) */}
          {!isAdmin && (
            <div
              className="p-3.5 rounded-2xl border flex items-start gap-2.5 opacity-80"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderColor: 'rgba(255, 255, 255, 0.07)',
              }}
            >
              <Lock className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-[11px] block" style={{ color: theme?.colors?.textPrimary || '#FFFFFF' }}>
                  Individual Answers Confidential
                </span>
                <p className="text-[10px] leading-relaxed opacity-70" style={{ color: theme?.colors?.textSecondary || '#94A3B8' }}>
                  Scores and percentage stats are public, but question-by-question responses are kept private to protect quiz answers.
                </p>
              </div>
            </div>
          )}

          {/* ADMIN ONLY: Detailed Question & Answer Breakdown */}
          {isAdmin && (
            <div className="space-y-2.5 pt-2 border-t border-amber-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin: Full Answers</span>
                </div>
                <div className="flex items-center gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setFilterMode('all')}
                    className={`px-2 py-0.5 rounded-lg border font-bold transition cursor-pointer ${
                      filterMode === 'all'
                        ? 'border-orange-500/50 bg-orange-500/20 text-orange-300'
                        : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    All ({participant.results.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('correct')}
                    className={`px-2 py-0.5 rounded-lg border font-bold transition cursor-pointer ${
                      filterMode === 'correct'
                        ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                        : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    Correct ({participant.correctCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('wrong')}
                    className={`px-2 py-0.5 rounded-lg border font-bold transition cursor-pointer ${
                      filterMode === 'wrong'
                        ? 'border-rose-500/50 bg-rose-500/20 text-rose-300'
                        : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    Wrong ({participant.wrongCount})
                  </button>
                </div>
              </div>

              {/* List of Questions and Answers for Admin */}
              <div className="space-y-2">
                {filteredResults.map((r, qIdx) => (
                  <div
                    key={r.questionId || qIdx}
                    className="p-3 rounded-2xl border space-y-2 transition"
                    style={{
                      backgroundColor: theme?.colors?.surfaceSubtle || 'rgba(255, 255, 255, 0.02)',
                      borderColor: r.isCorrect
                        ? 'rgba(16, 185, 129, 0.25)'
                        : 'rgba(239, 68, 68, 0.25)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className="font-bold text-xs"
                        style={{ color: theme?.colors?.textPrimary || '#FFFFFF' }}
                      >
                        {r.label}
                      </span>
                      {r.isCorrect ? (
                        <span className="flex-shrink-0 flex items-center gap-1 font-bold text-[10px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded-md border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Right
                        </span>
                      ) : (
                        <span className="flex-shrink-0 flex items-center gap-1 font-bold text-[10px] text-rose-400 bg-rose-950/40 px-1.5 py-0.5 rounded-md border border-rose-500/30">
                          <XCircle className="w-3 h-3" />
                          Wrong
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] pt-1 border-t border-white/5">
                      <div
                        className={`p-2 rounded-xl border flex items-center gap-1.5 ${
                          r.isCorrect
                            ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
                            : 'border-rose-500/30 bg-rose-950/20 text-rose-300'
                        }`}
                      >
                        <span className="opacity-70 font-semibold">Guess:</span>
                        <strong className="truncate">{String(r.userAnswer || 'Skipped')}</strong>
                      </div>

                      {!r.isCorrect && (
                        <div className="p-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 flex items-center gap-1.5">
                          <span className="opacity-70 font-semibold">Correct:</span>
                          <strong className="truncate">{String(r.correctAnswer)}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div
          className="p-4 border-t flex items-center justify-between gap-2"
          style={{
            borderColor: theme?.colors?.borderSecondary || 'rgba(255, 255, 255, 0.1)',
            backgroundColor: theme?.colors?.surfaceSubtle || 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 py-2.5 px-3 border rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition hover:bg-white/10"
            style={{
              borderColor: theme?.colors?.borderSecondary || 'rgba(255, 255, 255, 0.2)',
              color: theme?.colors?.textPrimary || '#FFFFFF',
            }}
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-orange-400" />
                <span>Share Score</span>
              </>
            )}
          </button>

          {correctPercent === 100 && (
            <button
              type="button"
              onClick={() => {
                sounds.playFanfare();
                triggerCelebration('gold');
              }}
              className="py-2.5 px-3 border border-amber-500/40 bg-amber-500/20 text-amber-300 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-amber-500/30 transition"
              title="Celebrate 100% perfection"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Celebrate</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="py-2.5 px-4 rounded-xl border border-white/10 font-mono text-xs font-bold cursor-pointer hover:bg-white/10 transition opacity-80 hover:opacity-100"
            style={{ color: theme?.colors?.textPrimary || '#FFFFFF' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>,
  document.body
);
};
