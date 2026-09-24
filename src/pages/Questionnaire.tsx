import React, { useState, useMemo } from 'react';
import { getActiveQuestions, Question } from '../lib/questions';
import { QuestionCard } from '../components/QuestionCard';
import { ProgressBar } from '../components/ProgressBar';
import { calculateCompletion } from '../lib/utils';
import { scoreResponse } from '../lib/scoring';
import { SaveStatus } from '../hooks/useParticipant';
import { Check, CheckCircle2, RotateCcw, ArrowRight, Trophy, Sparkles } from 'lucide-react';

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

  const currentQuestion = activeQuestions[currentIndex];
  const { count, percentage } = calculateCompletion(answers, activeQuestions.length);
  const isAllAnswered = count === activeQuestions.length;
  const isCurrentAnswered =
    currentQuestion &&
    answers[currentQuestion.id] !== undefined &&
    answers[currentQuestion.id] !== null &&
    String(answers[currentQuestion.id]).trim() !== '';

  const handleNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompletedView(true);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
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

  // Completion summary view
  if (isCompletedView) {
    return (
      <div className="max-w-xl mx-auto py-8 text-center space-y-6">
        <div className="bg-[#FFFDF9] border-[2.5px] border-stone-900 rounded-[28px] p-8 shadow-brutal space-y-5">
          <div className="w-16 h-16 rounded-full border-2 border-stone-900 bg-[#F9C84E] flex items-center justify-center mx-auto shadow-brutal-sm">
            <Check className="w-8 h-8 stroke-[3] text-stone-900" />
          </div>

          <h2 className="text-3xl font-black text-stone-900 tracking-tight">
            You're all done!
          </h2>

          <p className="text-sm font-medium text-stone-600 max-w-md mx-auto">
            Thanks for taking the questionnaire, <span className="font-bold text-stone-900">{participantName}</span>. Your answers have been recorded.
          </p>

          <div className="p-4 rounded-2xl bg-[#FAF7F0] border-2 border-stone-900 text-left font-mono text-xs text-stone-700 space-y-2">
            <div className="flex justify-between">
              <span>Answered Questions:</span>
              <span className="font-bold text-stone-900">{count} / {activeQuestions.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Correct Score:</span>
              <span className="font-bold text-[#3D8F70]">
                {userScore.correctCount} / {activeQuestions.length} ({userScore.scorePercent}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-bold text-stone-900">{userScore.roastTitle}</span>
            </div>
            <div className="pt-1 text-[11px] text-stone-500 italic">
              "{userScore.roastDescription}"
            </div>
          </div>

          {onNavigateLeaderboard && (
            <button
              onClick={onNavigateLeaderboard}
              className="w-full py-4 px-6 rounded-2xl border-2 border-stone-900 bg-[#F9C84E] hover:bg-[#eab332] text-stone-900 font-black text-sm sm:text-base shadow-brutal shadow-brutal-hover flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <Trophy className="w-5 h-5 text-stone-900" />
              <span>See Where You Rank on Leaderboard</span>
            </button>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => {
                setIsCompletedView(false);
                setCurrentIndex(0);
              }}
              className="flex-1 py-3 px-5 rounded-2xl border-2 border-stone-900 bg-[#FAF7F0] hover:bg-white text-stone-900 font-bold text-xs shadow-brutal-sm cursor-pointer"
            >
              Review My Answers
            </button>
            <button
              onClick={() => {
                if (confirm('Start a fresh questionnaire session with another name?')) {
                  onClearSession();
                }
              }}
              className="flex-1 py-3 px-5 rounded-2xl border-2 border-stone-900 bg-[#3D8F70] hover:bg-[#347b60] text-white font-bold text-xs shadow-brutal-sm cursor-pointer"
            >
              New Participant
            </button>
          </div>
        </div>

        <p className="font-mono text-xs text-stone-600">
          Everything saves automatically. Close the tab and come back any time.
        </p>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center font-mono text-xs text-stone-600">
        No active questions found. Check admin settings.
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-2 sm:py-6">
      {/* Question Counter & Terracotta Progress Bar */}
      <ProgressBar
        currentIndex={currentIndex + 1}
        totalCount={activeQuestions.length}
        saveStatus={saveStatus}
        participantName={participantName}
      />

      {/* Main Question Card */}
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
          className="flex-1 py-3.5 px-6 rounded-2xl border-2 border-stone-900 bg-white hover:bg-stone-100 text-stone-900 font-bold text-sm shadow-brutal-sm shadow-brutal-hover transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleNext}
          className={`flex-[2] py-3.5 px-6 rounded-2xl border-2 border-stone-900 text-white font-black text-sm shadow-brutal shadow-brutal-hover flex items-center justify-center gap-2 transition cursor-pointer ${
            currentIndex === activeQuestions.length - 1
              ? 'bg-[#3D8F70] hover:bg-[#347b60]'
              : 'bg-stone-900 hover:bg-stone-800'
          }`}
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
      <div className="mt-6 flex items-center justify-between font-mono text-xs text-stone-500 px-1">
        <span>Question {currentIndex + 1} of {activeQuestions.length}</span>
        {onNavigateLeaderboard && (
          <button
            onClick={onNavigateLeaderboard}
            className="hover:text-stone-900 underline flex items-center gap-1 cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-stone-700" />
            <span>Leaderboard</span>
          </button>
        )}
      </div>
    </div>
  );
};
