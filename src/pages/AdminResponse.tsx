import React, { useEffect, useState, useMemo } from 'react';
import { ResponseRecord, calculateCompletion, formatDate } from '../lib/utils';
import { getResponseById } from '../lib/supabase';
import { getActiveQuestions, Question } from '../lib/questions';
import { scoreResponse, ParticipantScore } from '../lib/scoring';
import { ArrowLeft, Calendar, Clock, Loader2, Check, XCircle, CheckCircle2, Trophy } from 'lucide-react';

interface AdminResponseProps {
  responseId: string;
  onBack: () => void;
}

export const AdminResponse: React.FC<AdminResponseProps> = ({ responseId, onBack }) => {
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
        <Loader2 className="w-8 h-8 animate-spin text-stone-700 mx-auto mb-3" />
        <p className="font-mono text-xs text-stone-600">Loading participant submission...</p>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4">
        <p className="font-mono text-xs text-rose-700 font-bold">
          {error || 'Response record not found.'}
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl border-2 border-stone-900 bg-white font-bold text-xs"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const { count, percentage } = calculateCompletion(record.answers, activeQuestions.length);

  return (
    <div className="space-y-6 pb-16">
      {/* Back Button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-stone-600 hover:text-stone-900 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Creator Dashboard
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-[#FFFDF9] border-[2.5px] border-stone-900 rounded-[28px] p-6 sm:p-8 shadow-brutal space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-stone-200">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl border-2 border-stone-900 bg-[#F9C84E] flex items-center justify-center font-black text-xl text-stone-900 shadow-brutal-sm">
              {record.participant_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
                  {record.participant_name}
                </h2>
                {scoreData && (
                  <span
                    className={`font-mono text-xs px-2.5 py-0.5 rounded-full border border-stone-900 font-black ${
                      scoreData.isAllCorrect
                        ? 'bg-[#E8F5E9] text-[#1B5E20]'
                        : 'bg-[#FEF2F2] text-[#B91C1C]'
                    }`}
                  >
                    {scoreData.correctCount} / {scoreData.totalQuestions} Correct ({scoreData.scorePercent}%)
                  </span>
                )}
              </div>
              <p className="font-mono text-xs text-stone-500 mt-0.5">
                ID: {record.id.slice(0, 18)}...
              </p>
            </div>
          </div>

          <div className="font-mono text-xs text-stone-600 space-y-1">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-stone-700" />
              <span>Created: {formatDate(record.created_at)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-700" />
              <span>Updated: {formatDate(record.updated_at || record.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Score & Roast Banner */}
        {scoreData && (
          <div className="p-4 rounded-2xl bg-[#FAF7F0] border-2 border-stone-900 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900 text-sm">
                Score Rank: {scoreData.roastTitle}
              </span>
              <span className="font-mono text-xs font-black text-[#3D8F70]">
                {scoreData.correctCount} Correct · {scoreData.wrongCount} Wrong
              </span>
            </div>
            <p className="font-mono text-xs text-stone-600 italic">
              "{scoreData.roastDescription}"
            </p>
          </div>
        )}

        {/* Terracotta Progress Bar */}
        <div>
          <div className="flex items-center justify-between font-mono text-xs text-stone-700 mb-2 font-bold">
            <span>Answered: {count} of {activeQuestions.length} questions</span>
            <span className="text-[#E05338]">{percentage}%</span>
          </div>
          <div className="w-full bg-[#E8E2D2] rounded-full h-2.5 overflow-hidden border border-stone-300">
            <div
              className="h-full bg-[#E05338] rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question by Question Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-stone-900 font-mono tracking-wider uppercase">
          Submitted Answers & Accuracy ({activeQuestions.length} Questions)
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
                className="p-5 sm:p-6 rounded-[22px] border-2 border-stone-900 bg-[#FFFDF9] shadow-brutal-sm space-y-3"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-stone-500">
                    QUESTION {idx + 1} / {activeQuestions.length} ({q.type})
                  </span>

                  {hasAnswer ? (
                    isCorrect ? (
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-black text-[#1B5E20] bg-emerald-100 px-2 py-0.5 rounded-full border border-stone-900">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct Answer
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-black text-[#B91C1C] bg-rose-100 px-2 py-0.5 rounded-full border border-stone-900">
                        <XCircle className="w-3.5 h-3.5" /> Wrong Guess
                      </span>
                    )
                  ) : (
                    <span className="font-mono text-[11px] text-stone-400">
                      Unanswered
                    </span>
                  )}
                </div>

                <h4 className="text-base sm:text-lg font-black text-stone-900 leading-snug">
                  {q.label}
                </h4>

                <div className="pt-1 space-y-2">
                  {hasAnswer ? (
                    <div
                      className={`p-3.5 rounded-xl border-2 border-stone-900 font-bold text-stone-900 text-sm shadow-brutal-sm ${
                        isCorrect ? 'bg-[#F9C84E]' : 'bg-[#FEF2F2]'
                      }`}
                    >
                      <div className="text-[11px] font-mono text-stone-600 mb-1">
                        Participant Answer:
                      </div>
                      {q.type === 'scale' ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-lg font-black">{answer}</span>
                          <span className="font-mono text-xs text-stone-700">
                            (on a scale of {q.min || 1} to {q.max || 10})
                          </span>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{String(answer)}</p>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl border-2 border-dashed border-stone-300 bg-[#FAF7F0] font-mono text-xs italic text-stone-500">
                      Not answered
                    </div>
                  )}

                  {/* Official Answer & Explanation */}
                  <div className="p-3 bg-[#FAF7F0] border border-stone-900 rounded-xl font-mono text-xs space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-stone-700">Creator's Correct Answer:</span>
                      <span className="font-black text-[#3D8F70] bg-white px-2 py-0.5 rounded border border-stone-300">
                        {String(q.correctAnswer ?? 'Not specified')}
                      </span>
                    </div>
                    {q.explanation && (
                      <p className="text-[11px] text-stone-500 italic mt-0.5">
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
