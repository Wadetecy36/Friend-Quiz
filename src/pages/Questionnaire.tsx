import React, { useState, useMemo, useEffect } from 'react';
import { getActiveQuestions } from '../lib/questions';
import { QuestionCard } from '../components/QuestionCard';
import { ProgressBar } from '../components/ProgressBar';
import { calculateCompletion, getParticipantAvatar } from '../lib/utils';
import { scoreResponse } from '../lib/scoring';
import { SaveStatus } from '../hooks/useParticipant';
import { useDesignSystem } from '../context/DesignSystemContext';
import { Check, ArrowRight, Trophy, Bookmark, Volume2, VolumeX, Share2 } from 'lucide-react';
import { triggerCelebration, sounds } from '../lib/audio';

interface QuestionnaireProps {
  participantName: string;
  answers: Record<string, string | number>;
  onAnswerChange: (questionId: string, value: string | number) => void;
  saveStatus: SaveStatus;
  onClearSession: () => void;
  onNavigateLeaderboard?: () => void;
}

export const Questionnaire: React.FC<QuestionnaireProps> = ({
  participantName,
  answers,
  onAnswerChange,
  saveStatus,
  onClearSession,
  onNavigateLeaderboard,
}) => {
  const { theme } = useDesignSystem();
  const activeQuestions = useMemo(() => getActiveQuestions(), []);

  // Start on first unanswered question or 0
  const [currentIndex, setCurrentIndex] = useState(() => {
    const firstUnanswered = activeQuestions.findIndex((q) => {
      const val = answers[q.id];
      return val === undefined || val === null || String(val).trim() === '';
    });
    return firstUnanswered !== -1 ? firstUnanswered : 0;
  });

  const [isCompletedView, setIsCompletedView] = useState(false);
  const [soundActive, setSoundActive] = useState(() => sounds.isEnabled());

  const currentQuestion = activeQuestions[currentIndex];
  const { count } = calculateCompletion(answers, activeQuestions.length);

  const toggleSound = () => {
    const updated = sounds.toggleSound();
    setSoundActive(updated);
  };

  const handleNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      sounds.playNext();
      setCurrentIndex((prev) => prev + 1);
    } else {
      sounds.playFanfare();
      setIsCompletedView(true);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      sounds.playClick();
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Grade user's answers when completed
  const userScore = useMemo(() => {
    return scoreResponse(
      {
        id: 'current_user',
        participant_name: participantName,
        answers,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      activeQuestions
    );
  }, [answers, participantName, activeQuestions]);

  // Trigger celebration confetti when completion screen opens
  useEffect(() => {
    if (isCompletedView) {
      const mode = userScore.isAllCorrect ? 'gold' : userScore.scorePercent >= 60 ? 'rainbow' : 'standard';
      triggerCelebration(mode);
    }
  }, [isCompletedView, userScore.isAllCorrect, userScore.scorePercent]);

  // Completion summary view (Clean, uncluttered, modern minimal)
  if (isCompletedView) {
    return (
      <div className="max-w-md mx-auto py-6 sm:py-10 text-center space-y-4 px-2">
        <div className="relative animate-note-entrance">
          <div
            className="p-6 sm:p-8 border space-y-5 transition-all relative overflow-hidden"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.geometry.cardRadius,
              borderWidth: theme.geometry.borderWidth,
              boxShadow: theme.geometry.shadowCard,
              color: theme.colors.textPrimary,
            }}
          >
            {/* Participant Avatar & Verified Badge */}
            <div className="relative inline-block mx-auto">
              <div
                className="w-20 h-20 rounded-3xl border flex items-center justify-center mx-auto shadow-xl text-4xl select-none animate-float"
                style={{
                  backgroundColor: 'rgba(99, 102, 241, 0.12)',
                  borderColor: 'rgba(99, 102, 241, 0.35)',
                }}
              >
                {getParticipantAvatar(participantName)}
              </div>
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center absolute -bottom-1 -right-1 border-2 border-slate-950 shadow">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>

            {/* Name & Headline */}
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-orange-400 block mb-1">
                Quiz Complete
              </span>
              <h2
                className="text-2xl sm:text-3xl font-black tracking-tight"
                style={{ fontFamily: theme.typography.displayFont }}
              >
                {participantName}
              </h2>
            </div>

            {/* Focused Score Showcase */}
            <div
              className="p-4 rounded-2xl border text-center font-mono space-y-2"
              style={{
                backgroundColor: theme.colors.surfaceSubtle,
                borderColor: theme.colors.borderSecondary || theme.colors.border,
              }}
            >
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-3xl sm:text-4xl font-black text-emerald-400">
                  {userScore.correctCount}
                </span>
                <span className="text-lg font-bold opacity-50" style={{ color: theme.colors.textSecondary }}>
                  / {activeQuestions.length}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full ml-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  {userScore.scorePercent}%
                </span>
              </div>

              <div className="text-xs font-bold text-orange-400">
                {userScore.roastTitle}
              </div>

              {/* Concise Note */}
              <p
                className="text-[11px] font-serif italic pt-1 border-t opacity-80"
                style={{
                  borderColor: theme.colors.borderSecondary,
                  color: theme.colors.textSecondary,
                }}
              >
                "{userScore.roastDescription}"
              </p>
            </div>

            {/* Primary Action: See Where You Rank */}
            {onNavigateLeaderboard && (
              <button
                onClick={onNavigateLeaderboard}
                className="interactive-option w-full py-4 px-6 border font-bold text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer transition shadow-lg"
                style={{
                  backgroundColor: theme.colors.accent,
                  color: theme.colors.accentText,
                  borderColor: theme.colors.accent,
                  borderRadius: theme.geometry.cardRadiusSm,
                  borderWidth: theme.geometry.borderWidth,
                }}
              >
                <Trophy className="w-5 h-5 text-amber-300 animate-float" />
                <span>See Where You Rank on Leaderboard</span>
              </button>
            )}

            {/* Minimal Auxiliary Actions: Share & Review */}
            <div className="flex items-center gap-2 text-xs font-mono font-bold">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  const shareText = `I scored ${userScore.correctCount}/${activeQuestions.length} (${userScore.scorePercent}%) on "How Well Do You Know Denzel?"! My rank title: ${userScore.roastTitle} 👑 Test your knowledge here: ${window.location.origin}`;
                  navigator.clipboard.writeText(shareText);
                  alert('Score copied to clipboard! Share it in your group chat.');
                }}
                className="flex-1 py-2.5 px-3 border rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition hover:bg-white/5 opacity-80 hover:opacity-100"
                style={{
                  borderColor: theme.colors.borderSecondary,
                  color: theme.colors.textSecondary,
                }}
              >
                <Share2 className="w-3.5 h-3.5 text-orange-400" />
                <span>Share Score</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsCompletedView(false);
                  setCurrentIndex(0);
                }}
                className="flex-1 py-2.5 px-3 border rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition hover:bg-white/5 opacity-80 hover:opacity-100"
                style={{
                  borderColor: theme.colors.borderSecondary,
                  color: theme.colors.textSecondary,
                }}
              >
                <span>Review Answers</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div
        className="max-w-xl mx-auto py-12 text-center font-mono text-xs"
        style={{ color: theme.colors.textSecondary }}
      >
        No active questions found. Check admin settings.
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-2 sm:py-6">
      {/* Question Counter & Progress Bar */}
      <ProgressBar
        currentIndex={currentIndex + 1}
        totalCount={activeQuestions.length}
        saveStatus={saveStatus}
        participantName={participantName}
      />

      {/* Main Question Card with Notes Aesthetic & Options Animation */}
      <QuestionCard
        question={currentQuestion}
        index={currentIndex}
        value={answers[currentQuestion.id]}
        onChange={(val) => onAnswerChange(currentQuestion.id, val)}
      />

      {/* Bottom Controls Row: [ Back ] and [ Next question ] */}
      <div className="flex items-center gap-3.5 mt-5">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentIndex === 0}
          className="interactive-option flex-1 py-3.5 px-6 border font-bold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.geometry.cardRadiusSm,
            borderWidth: theme.geometry.borderWidth,
            boxShadow: theme.geometry.shadowSm,
            color: theme.colors.textPrimary,
          }}
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="interactive-option flex-[2] py-3.5 px-6 border font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg"
          style={{
            backgroundColor:
              currentIndex === activeQuestions.length - 1
                ? theme.colors.statusCorrect
                : theme.colors.accent,
            color:
              currentIndex === activeQuestions.length - 1
                ? '#FFFFFF'
                : theme.colors.accentText,
            borderColor: theme.colors.border,
            borderRadius: theme.geometry.cardRadiusSm,
            borderWidth: theme.geometry.borderWidth,
            boxShadow: theme.geometry.shadowButton || theme.geometry.shadowSm,
          }}
        >
          {currentIndex === activeQuestions.length - 1 ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Complete & Finish</span>
            </>
          ) : (
            <>
              <span>Next Question</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </>
          )}
        </button>
      </div>

      {/* Bottom helper info */}
      <div
        className="mt-6 flex items-center justify-between font-mono text-xs px-1"
        style={{ color: theme.colors.textSecondary }}
      >
        <span>
          Question {currentIndex + 1} of {activeQuestions.length}
        </span>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSound}
            className="flex items-center gap-1 cursor-pointer transition hover:opacity-80"
            title={soundActive ? 'Mute sound effects' : 'Unmute sound effects'}
            style={{ color: soundActive ? theme.colors.textSecondary : theme.colors.textSecondary }}
          >
            {soundActive ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-orange-400" />
                <span className="hidden sm:inline">Sound On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 opacity-50" />
                <span className="hidden sm:inline opacity-50">Muted</span>
              </>
            )}
          </button>

          {onNavigateLeaderboard && (
            <button
              onClick={onNavigateLeaderboard}
              className="hover:underline flex items-center gap-1 cursor-pointer transition hover:text-orange-400"
              style={{ color: theme.colors.textPrimary }}
            >
              <Trophy className="w-3.5 h-3.5" style={{ color: theme.colors.accent }} />
              <span>Leaderboard</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
