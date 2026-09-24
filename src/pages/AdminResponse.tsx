import React, { useEffect, useState, useMemo } from 'react';
import { ResponseRecord, calculateCompletion, formatDate } from '../lib/utils';
import { getResponseById } from '../lib/supabase';
import { getActiveQuestions } from '../lib/questions';
import { scoreResponse, ParticipantScore } from '../lib/scoring';
import { useDesignSystem } from '../context/DesignSystemContext';
import { ArrowLeft, Calendar, Clock, Loader2, XCircle, CheckCircle2, Bookmark, Sparkles } from 'lucide-react';

interface AdminResponseProps {
  responseId: string;
  onBack: () => void;
}

export const AdminResponse: React.FC<AdminResponseProps> = ({ responseId, onBack }) => {
  const { theme } = useDesignSystem();
  const [record, setRecord] = useState<ResponseRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const activeQuestions = useMemo(() => getActiveQuestions(), []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      const res = await getResponseById(responseId);
      if (res.error) {
        setError(res.error);
      } else {
        setRecord(res.data);
      }
      setLoading(false);
    }
    loadData();
  }, [responseId]);

  const scoreData: ParticipantScore | null = useMemo(() => {
    if (!record) return null;
    return scoreResponse(record, activeQuestions);
  }, [record, activeQuestions]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-orange-400" />
        <p className="font-mono text-xs" style={{ color: theme.colors.textSecondary }}>
          Loading participant submission...
        </p>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4">
        <p className="font-mono text-xs text-rose-400 font-bold">
          {error || 'Response record not found.'}
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl border font-bold text-xs cursor-pointer"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            color: theme.colors.textPrimary,
          }}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const { count, percentage } = calculateCompletion(record.answers, activeQuestions.length);

  return (
    <div className="space-y-6 pb-16 animate-note-entrance">
      {/* Back Button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 font-mono text-xs font-bold transition cursor-pointer hover:opacity-80"
          style={{ color: theme.colors.textSecondary }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Creator Dashboard
        </button>
      </div>

      {/* Profile Card with Notes Aesthetic */}
      <div className="relative">
        {/* Top Washi Tape Clip */}
        <div
          className="w-24 h-3 rounded-full note-tape mx-auto -mb-1.5 relative z-10 opacity-70"
          style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}
        />

        <div
          className="border p-6 sm:p-8 space-y-5 note-grid-texture overflow-hidden"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.geometry.cardRadius,
            borderWidth: theme.geometry.borderWidth,
            boxShadow: theme.geometry.shadowCard,
            color: theme.colors.textPrimary,
          }}
        >
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b"
            style={{ borderColor: theme.colors.borderSecondary }}
          >
            <div className="flex items-center gap-3.5">
              <div
                className="w-14 h-14 rounded-2xl border flex items-center justify-center font-black text-xl shadow-sm"
                style={{
                  backgroundColor: 'rgba(249, 115, 22, 0.15)',
                  borderColor: 'rgba(249, 115, 22, 0.35)',
                  color: '#FDBA74',
                }}
              >
                {record.participant_name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2
                    className="text-2xl sm:text-3xl font-black tracking-tight"
                    style={{
                      fontFamily: theme.typography.displayFont,
                      color: theme.colors.textPrimary,
                    }}
                  >
                    {record.participant_name}
                  </h2>
                  {scoreData && (
                    <span
                      className={`font-mono text-xs px-2.5 py-0.5 rounded-full border font-black ${
                        scoreData.isAllCorrect
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                          : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                      }`}
                    >
                      {scoreData.correctCount} / {scoreData.totalQuestions} Correct ({scoreData.scorePercent}%)
                    </span>
                  )}
                </div>
                <p className="font-mono text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>
                  ID: {record.id.slice(0, 18)}...
                </p>
              </div>
            </div>

            <div className="font-mono text-xs space-y-1" style={{ color: theme.colors.textSecondary }}>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 opacity-70" />
                <span>Created: {formatDate(record.created_at)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 opacity-70" />
                <span>Updated: {formatDate(record.updated_at || record.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Score & Roast Banner */}
          {scoreData && (
            <div
              className="p-4 rounded-xl border space-y-1.5"
              style={{
                backgroundColor: theme.colors.surfaceSubtle,
                borderColor: theme.colors.borderSecondary,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm" style={{ color: theme.colors.textPrimary }}>
                  Score Rank: {scoreData.roastTitle}
                </span>
                <span className="font-mono text-xs font-black text-emerald-400">
                  {scoreData.correctCount} Correct · {scoreData.wrongCount} Wrong
                </span>
              </div>
              <p className="font-serif italic text-xs leading-relaxed" style={{ color: theme.colors.textSecondary }}>
                <Sparkles className="w-3.5 h-3.5 text-orange-400 inline mr-1" />
                "{scoreData.roastDescription}"
              </p>
            </div>
          )}

          {/* Progress Bar */}
          <div>
            <div
              className="flex items-center justify-between font-mono text-xs mb-2 font-bold"
              style={{ color: theme.colors.textSecondary }}
            >
              <span>Answered: {count} of {activeQuestions.length} questions</span>
              <span className="text-orange-400">{percentage}%</span>
            </div>
            <div
              className="w-full rounded-full h-2.5 overflow-hidden border"
              style={{
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.borderSecondary,
              }}
            >
              <div
                className="h-full rounded-full bg-orange-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Question by Question Breakdown */}
      <div className="space-y-4">
        <h3
          className="text-lg font-black font-mono tracking-wider uppercase flex items-center gap-2"
          style={{ color: theme.colors.textPrimary }}
        >
          <Bookmark className="w-4 h-4 text-orange-400" />
          <span>Submitted Answers & Accuracy ({activeQuestions.length} Questions)</span>
        </h3>

        <div className="space-y-3.5">
          {activeQuestions.map((q, idx) => {
            const answer = record.answers ? record.answers[q.id] : undefined;
            const hasAnswer =
              answer !== undefined && answer !== null && String(answer).trim() !== '';

            const qResult = scoreData?.results.find((r) => r.questionId === q.id);
            const isCorrect = qResult?.isCorrect;

            return (
              <div
                key={q.id}
                className="p-5 sm:p-6 rounded-2xl border space-y-3 shadow-xs"
                style={{
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                }}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span
                    className="font-mono text-xs font-bold uppercase tracking-widest"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    QUESTION {idx + 1} / {activeQuestions.length} ({q.type})
                  </span>

                  {hasAnswer ? (
                    isCorrect ? (
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-black text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/40">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct Answer
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-black text-rose-300 bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-500/40">
                        <XCircle className="w-3.5 h-3.5" /> Wrong Guess
                      </span>
                    )
                  ) : (
                    <span className="font-mono text-[11px] opacity-40">
                      Unanswered
                    </span>
                  )}
                </div>

                <h4
                  className="text-base sm:text-lg font-black leading-snug"
                  style={{ color: theme.colors.textPrimary }}
                >
                  {q.label}
                </h4>

                <div className="pt-1 space-y-2">
                  {hasAnswer ? (
                    <div
                      className={`p-3.5 rounded-xl border font-bold text-sm ${
                        isCorrect
                          ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
                          : 'border-rose-500/40 bg-rose-950/20 text-rose-200'
                      }`}
                    >
                      <div className="text-[11px] font-mono opacity-80 mb-1">
                        Participant Answer:
                      </div>
                      {q.type === 'scale' ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-lg font-black">{answer}</span>
                          <span className="font-mono text-xs opacity-70">
                            (on a scale of {q.min || 1} to {q.max || 10})
                          </span>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{String(answer)}</p>
                      )}
                    </div>
                  ) : (
                    <div
                      className="p-3 rounded-xl border border-dashed font-mono text-xs italic"
                      style={{
                        backgroundColor: theme.colors.surfaceSubtle,
                        borderColor: theme.colors.borderSecondary,
                        color: theme.colors.textSecondary,
                      }}
                    >
                      Not answered
                    </div>
                  )}

                  {/* Official Answer & Explanation */}
                  <div
                    className="p-3 border rounded-xl font-mono text-xs space-y-1"
                    style={{
                      backgroundColor: theme.colors.surfaceSubtle,
                      borderColor: theme.colors.borderSecondary,
                    }}
                  >
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold" style={{ color: theme.colors.textSecondary }}>
                        Creator's Correct Answer:
                      </span>
                      <span className="font-black text-emerald-400 bg-white/5 px-2 py-0.5 rounded border border-emerald-500/30">
                        {String(q.correctAnswer ?? 'Not specified')}
                      </span>
                    </div>
                    {q.explanation && (
                      <p className="text-[11px] font-serif italic mt-0.5" style={{ color: theme.colors.textSecondary }}>
                        Lore: "{q.explanation}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
