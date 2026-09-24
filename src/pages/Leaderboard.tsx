import React, { useState, useEffect, useMemo } from 'react';
import { ResponseRecord, formatDate } from '../lib/utils';
import { getAllResponses } from '../lib/supabase';
import {
  calculateLeaderboards,
  ParticipantScore,
  QuestionResult,
  getStoredAnswerKey,
  saveCustomAnswerKey,
  resetAnswerKey,
  QuestionKey,
} from '../lib/scoring';
import { getActiveQuestions, Question } from '../lib/questions';
import {
  Trophy,
  Flame,
  AlertTriangle,
  Search,
  RefreshCw,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Sliders,
  Settings2,
  X,
  Share2,
  Check,
} from 'lucide-react';

interface LeaderboardProps {
  onBack: () => void;
  onTakeQuiz: () => void;
  isAdmin: boolean;
  currentParticipantName?: string | null;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  onBack,
  onTakeQuiz,
  isAdmin,
  currentParticipantName,
}) => {
  const [activeTab, setActiveTab] = useState<'all-correct' | 'wrong' | 'all'>('all-correct');
  const [responses, setResponses] = useState<ResponseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedParticipantId, setExpandedParticipantId] = useState<string | null>(null);
  const [showAnswerKeyModal, setShowAnswerKeyModal] = useState(false);
  const [answerKey, setAnswerKey] = useState<Record<string, QuestionKey>>(getStoredAnswerKey());
  const [copiedShare, setCopiedShare] = useState(false);

  const fetchResponses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllResponses();
      if (res.error) {
        setError(res.error);
      }
      setResponses(res.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, []);

  const activeQuestions = useMemo(() => getActiveQuestions(), []);

  // Compute scored leaderboards
  const { allScores, allCorrectScores, questionsWrongScores, topContenders } = useMemo(() => {
    return calculateLeaderboards(responses, activeQuestions, answerKey);
  }, [responses, activeQuestions, answerKey]);

  // Filter by search query
  const filterList = (list: ParticipantScore[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter((p) => p.participant_name.toLowerCase().includes(q));
  };

  const filteredAllCorrect = useMemo(() => filterList(allCorrectScores), [allCorrectScores, searchQuery]);
  const filteredWrong = useMemo(() => filterList(questionsWrongScores), [questionsWrongScores, searchQuery]);
  const filteredAll = useMemo(() => filterList(allScores), [allScores, searchQuery]);
  const filteredTopContenders = useMemo(() => filterList(topContenders), [topContenders, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedParticipantId((prev) => (prev === id ? null : id));
  };

  const handleShare = () => {
    const url = window.location.href;
    const shareText = `See who really knows Denzel! Check out the leaderboard: ${url}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 3000);
    }
  };

  const handleSaveAnswerKey = (updated: Record<string, Partial<QuestionKey>>) => {
    saveCustomAnswerKey(updated);
    setAnswerKey(getStoredAnswerKey());
    setShowAnswerKeyModal(false);
  };

  const handleResetAnswerKey = () => {
    if (confirm('Reset official answer key back to default answers for Denzel?')) {
      resetAnswerKey();
      setAnswerKey(getStoredAnswerKey());
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-16 space-y-6">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-stone-600 hover:text-stone-900 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => setShowAnswerKeyModal(true)}
              className="px-3 py-1.5 rounded-xl border-2 border-stone-900 bg-white hover:bg-stone-100 text-xs font-mono font-bold text-stone-900 shadow-brutal-sm flex items-center gap-1.5 cursor-pointer"
              title="Configure Official Answers"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Official Answer Key</span>
            </button>
          )}

          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-xl border-2 border-stone-900 bg-white hover:bg-stone-100 text-xs font-mono font-bold text-stone-900 shadow-brutal-sm flex items-center gap-1.5 cursor-pointer"
            title="Share leaderboard"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#3D8F70]" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>

          <button
            onClick={fetchResponses}
            disabled={loading}
            className="p-1.5 rounded-xl border-2 border-stone-900 bg-white hover:bg-stone-100 text-stone-900 shadow-brutal-sm transition disabled:opacity-40 cursor-pointer"
            title="Refresh Leaderboard"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-[#FFFDF9] border-[2.5px] border-stone-900 rounded-[28px] p-6 sm:p-8 shadow-brutal space-y-4 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="font-mono text-xs font-bold tracking-[0.25em] text-stone-500 uppercase">
              HALL OF FAME & SHAME · DENZEL
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight mt-1">
              Who Really Knows Me?
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Live rankings scored against Denzel's official 12-question answer key.
            </p>
          </div>

          <button
            onClick={onTakeQuiz}
            className="self-center sm:self-auto px-5 py-3 rounded-2xl border-2 border-stone-900 bg-[#3D8F70] hover:bg-[#347b60] text-white font-black text-sm shadow-brutal shadow-brutal-hover flex items-center gap-2 cursor-pointer transition flex-shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>{currentParticipantName ? 'Continue My Quiz' : 'Take The Quiz'}</span>
          </button>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-3 border-t-2 border-stone-200 text-center font-mono text-xs">
          <div className="p-2 sm:p-3 rounded-xl bg-[#FAF7F0] border border-stone-900">
            <span className="text-stone-500 block text-[10px] uppercase font-bold">Total Players</span>
            <span className="font-black text-base sm:text-lg text-stone-900">{responses.length}</span>
          </div>
          <div className="p-2 sm:p-3 rounded-xl bg-[#E8F5E9] border border-stone-900">
            <span className="text-[#1B5E20] block text-[10px] uppercase font-bold">100% Club</span>
            <span className="font-black text-base sm:text-lg text-[#1B5E20]">{allCorrectScores.length}</span>
          </div>
          <div className="p-2 sm:p-3 rounded-xl bg-[#FEE2E2] border border-stone-900">
            <span className="text-[#991B1B] block text-[10px] uppercase font-bold">Got Wrong</span>
            <span className="font-black text-base sm:text-lg text-[#991B1B]">{questionsWrongScores.length}</span>
          </div>
        </div>
      </div>

      {/* Primary Ranking Mode Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#FAF7F0] border-2 border-stone-900 rounded-2xl shadow-brutal-sm">
        <button
          type="button"
          onClick={() => setActiveTab('all-correct')}
          className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'all-correct'
              ? 'bg-[#3D8F70] text-white shadow-sm'
              : 'text-stone-700 hover:text-stone-950'
          }`}
        >
          <Trophy className="w-4 h-4 flex-shrink-0" />
          <span>All Correct ({allCorrectScores.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('wrong')}
          className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'wrong'
              ? 'bg-[#E05338] text-white shadow-sm'
              : 'text-stone-700 hover:text-stone-950'
          }`}
        >
          <Flame className="w-4 h-4 flex-shrink-0" />
          <span>Got Wrong ({questionsWrongScores.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#1C1917] text-white shadow-sm'
              : 'text-stone-700 hover:text-stone-950'
          }`}
        >
          <span>All Ranks ({allScores.length})</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by participant name..."
          className="w-full bg-[#FFFDF9] border-2 border-stone-900 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white shadow-brutal-sm font-mono"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 font-bold text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* TAB 1: ALL QUESTIONS CORRECT (100% CLUB) */}
      {activeTab === 'all-correct' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-black text-lg text-stone-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#3D8F70]" />
              The 100% Club — All 12 Questions Correct
            </h2>
            <span className="font-mono text-xs text-stone-500 font-bold">
              {filteredAllCorrect.length} player{filteredAllCorrect.length === 1 ? '' : 's'}
            </span>
          </div>

          {filteredAllCorrect.length === 0 ? (
            <div className="bg-[#FFFDF9] border-2 border-stone-900 rounded-[28px] p-8 text-center space-y-4 shadow-brutal">
              <div className="w-14 h-14 rounded-2xl border-2 border-stone-900 bg-[#F9C84E] flex items-center justify-center mx-auto shadow-brutal-sm">
                <Trophy className="w-7 h-7 text-stone-900" />
              </div>
              <h3 className="text-xl font-black text-stone-900">
                {searchQuery ? 'No match found' : 'The 100% Club Throne is Currently Empty!'}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
                {searchQuery
                  ? `No participant named "${searchQuery}" has achieved 12/12 yet.`
                  : 'Nobody has achieved the elusive 12/12 perfection yet. Can you be the very first person to crack the code?'}
              </p>
              <button
                onClick={onTakeQuiz}
                className="px-6 py-3 rounded-2xl border-2 border-stone-900 bg-[#3D8F70] hover:bg-[#347b60] text-white font-black text-sm shadow-brutal cursor-pointer inline-flex items-center gap-2"
              >
                <span>Take the Quiz & Shoot for 12/12</span>
              </button>

              {/* Honorable Mentions / Almost Made It */}
              {filteredTopContenders.length > 0 && !searchQuery && (
                <div className="pt-6 border-t-2 border-stone-200 text-left space-y-3">
                  <div className="font-mono text-xs font-bold uppercase tracking-wider text-stone-500">
                    Honorable Mentions — Closest Contenders (80%+ Correct):
                  </div>
                  <div className="space-y-2.5">
                    {filteredTopContenders.slice(0, 5).map((contender, idx) => (
                      <div
                        key={contender.id}
                        className="p-3.5 bg-[#FAF7F0] border-2 border-stone-900 rounded-2xl flex items-center justify-between shadow-brutal-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-sm text-stone-500">
                            #{idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-sm text-stone-900">
                              {contender.participant_name}
                            </div>
                            <div className="font-mono text-[11px] text-stone-500">
                              {contender.correctCount} of {contender.totalQuestions} correct · {contender.wrongCount} mistake{contender.wrongCount === 1 ? '' : 's'}
                            </div>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-xl border border-stone-900 bg-white">
                          {contender.scorePercent}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAllCorrect.map((item, index) => {
                const isCurrent = currentParticipantName && item.participant_name.toLowerCase() === currentParticipantName.toLowerCase();
                const isExpanded = expandedParticipantId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`bg-[#FFFDF9] border-[2.5px] border-stone-900 rounded-2xl p-4 sm:p-5 shadow-brutal transition ${
                      isCurrent ? 'ring-4 ring-[#3D8F70]/40 bg-[#F0FDF4]' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Rank Badge */}
                        <div
                          className={`w-10 h-10 rounded-xl border-2 border-stone-900 flex items-center justify-center font-black text-base shadow-brutal-sm flex-shrink-0 ${
                            index === 0
                              ? 'bg-[#F9C84E] text-stone-900'
                              : index === 1
                              ? 'bg-stone-200 text-stone-900'
                              : index === 2
                              ? 'bg-amber-700 text-white'
                              : 'bg-white text-stone-800'
                          }`}
                        >
                          {index === 0 ? '👑' : `#${index + 1}`}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-base sm:text-lg text-stone-900 truncate">
                              {item.participant_name}
                            </span>
                            {isCurrent && (
                              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#3D8F70] text-white">
                                You
                              </span>
                            )}
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border border-stone-900 bg-[#E8F5E9] text-[#1B5E20]">
                              12/12 PERFECT
                            </span>
                          </div>
                          <div className="font-mono text-xs text-stone-500 mt-0.5">
                            {item.roastTitle} · {formatDate(item.created_at)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="text-right">
                          <span className="font-black text-base sm:text-xl text-[#3D8F70]">
                            100%
                          </span>
                          <span className="block font-mono text-[10px] text-stone-500">
                            0 errors
                          </span>
                        </div>
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className="p-1.5 rounded-xl border border-stone-900 hover:bg-stone-100 text-stone-700 cursor-pointer"
                          title="View answers"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Detailed Answer Breakdown Drawer */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t-2 border-stone-200 space-y-2">
                        <div className="font-mono text-xs font-bold text-stone-700 uppercase">
                          All Correct Answers Verified:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                          {item.results.map((r, qIdx) => (
                            <div
                              key={r.questionId}
                              className="p-2.5 rounded-xl bg-[#FAF7F0] border border-stone-300 flex items-start gap-2"
                            >
                              <CheckCircle2 className="w-4 h-4 text-[#3D8F70] flex-shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <span className="font-bold text-stone-900 block truncate">
                                  Q{qIdx + 1}: {r.label}
                                </span>
                                <span className="text-[#1B5E20] font-bold truncate block">
                                  Answer: {String(r.userAnswer || '—')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GOT QUESTIONS WRONG (THE HALL OF SHAME) */}
      {activeTab === 'wrong' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="font-black text-lg text-stone-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#E05338]" />
                The Hall of Shame — Most Questions Wrong
              </h2>
              <p className="font-mono text-xs text-stone-500">
                Ranked from most mistakes to fewest mistakes. Click any card to inspect their funny guesses!
              </p>
            </div>
            <span className="font-mono text-xs text-stone-500 font-bold">
              {filteredWrong.length} player{filteredWrong.length === 1 ? '' : 's'}
            </span>
          </div>

          {filteredWrong.length === 0 ? (
            <div className="bg-[#FFFDF9] border-2 border-stone-900 rounded-[28px] p-8 text-center space-y-3 shadow-brutal">
              <div className="w-12 h-12 rounded-2xl border-2 border-stone-900 bg-[#E8F5E9] flex items-center justify-center mx-auto shadow-brutal-sm">
                <CheckCircle2 className="w-6 h-6 text-[#1B5E20]" />
              </div>
              <h3 className="text-lg font-black text-stone-900">
                No Mistakes Recorded Yet!
              </h3>
              <p className="text-xs font-mono text-stone-600 max-w-sm mx-auto">
                Either everyone who played got 100%, or no submissions have been recorded yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredWrong.map((item, index) => {
                const isCurrent = currentParticipantName && item.participant_name.toLowerCase() === currentParticipantName.toLowerCase();
                const isExpanded = expandedParticipantId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`bg-[#FFFDF9] border-[2.5px] border-stone-900 rounded-2xl p-4 sm:p-5 shadow-brutal transition ${
                      isCurrent ? 'ring-4 ring-[#E05338]/40 bg-[#FEF2F2]' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Shame Rank Badge */}
                        <div
                          className={`w-10 h-10 rounded-xl border-2 border-stone-900 flex items-center justify-center font-black text-sm shadow-brutal-sm flex-shrink-0 ${
                            index === 0
                              ? 'bg-[#E05338] text-white'
                              : index === 1
                              ? 'bg-[#F9C84E] text-stone-900'
                              : 'bg-[#FAF7F0] text-stone-800'
                          }`}
                        >
                          #{index + 1}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-base sm:text-lg text-stone-900 truncate">
                              {item.participant_name}
                            </span>
                            {isCurrent && (
                              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E05338] text-white">
                                You
                              </span>
                            )}
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border border-stone-900 bg-rose-100 text-rose-900">
                              {item.wrongCount} WRONG
                            </span>
                          </div>
                          <div className="font-mono text-xs text-rose-800 font-bold mt-0.5">
                            {item.roastTitle}
                          </div>
                          <div className="font-mono text-[11px] text-stone-500">
                            {item.roastDescription}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="text-right">
                          <span className="font-black text-base sm:text-xl text-[#E05338]">
                            {item.scorePercent}%
                          </span>
                          <span className="block font-mono text-[10px] text-stone-500">
                            {item.correctCount}/{item.totalQuestions} right
                          </span>
                        </div>
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className="p-1.5 rounded-xl border border-stone-900 hover:bg-stone-100 text-stone-700 cursor-pointer"
                          title="Inspect mistakes"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Inspect Wrong Answers Drawer */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t-2 border-stone-200 space-y-2.5">
                        <div className="flex items-center justify-between font-mono text-xs font-bold text-stone-700 uppercase">
                          <span>
                            Mistakes Breakdown ({item.wrongResults.length} questions):
                          </span>
                          <span className="text-[11px] text-stone-500 lowercase font-normal">
                            Their guess vs Denzel's actual answer
                          </span>
                        </div>

                        <div className="space-y-2">
                          {item.wrongResults.map((r) => (
                            <div
                              key={r.questionId}
                              className="p-3 rounded-xl bg-white border border-stone-300 font-mono text-xs space-y-1"
                            >
                              <div className="font-bold text-stone-900">
                                {r.label}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
                                <div className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-1.5">
                                  <XCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                                  <span className="truncate">
                                    Their Guess: <strong>{String(r.userAnswer || 'Skipped')}</strong>
                                  </span>
                                </div>
                                <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                  <span className="truncate">
                                    Actual: <strong>{String(r.correctAnswer)}</strong>
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: OVERALL / ALL RANKS */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-black text-lg text-stone-900">
              Complete Leaderboard — All Submissions Ranked
            </h2>
            <span className="font-mono text-xs text-stone-500 font-bold">
              {filteredAll.length} participant{filteredAll.length === 1 ? '' : 's'}
            </span>
          </div>

          {filteredAll.length === 0 ? (
            <div className="bg-[#FFFDF9] border-2 border-stone-900 rounded-[28px] p-8 text-center text-xs font-mono text-stone-600 shadow-brutal">
              No participant records found.
            </div>
          ) : (
            <div className="bg-[#FFFDF9] border-[2.5px] border-stone-900 rounded-[24px] shadow-brutal overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-[#FAF7F0] border-b-2 border-stone-900 font-bold text-stone-800 uppercase">
                    <tr>
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Participant</th>
                      <th className="py-3 px-4 text-center">Score</th>
                      <th className="py-3 px-4 text-center">Correct</th>
                      <th className="py-3 px-4 text-center">Wrong</th>
                      <th className="py-3 px-4">Status / Roast</th>
                      <th className="py-3 px-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {filteredAll.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-[#FAF7F0] transition">
                        <td className="py-3 px-4 font-black">
                          {idx === 0 ? '👑 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `#${idx + 1}`}
                        </td>
                        <td className="py-3 px-4 font-bold text-stone-900">
                          {item.participant_name}
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                          <span
                            className={`px-2 py-0.5 rounded-full border border-stone-900 ${
                              item.scorePercent === 100
                                ? 'bg-[#3D8F70] text-white'
                                : item.scorePercent >= 60
                                ? 'bg-[#F9C84E] text-stone-900'
                                : 'bg-rose-100 text-rose-900'
                            }`}
                          >
                            {item.scorePercent}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-[#1B5E20] font-bold">
                          {item.correctCount}
                        </td>
                        <td className="py-3 px-4 text-center text-rose-700 font-bold">
                          {item.wrongCount}
                        </td>
                        <td className="py-3 px-4 truncate max-w-xs text-stone-600">
                          {item.roastTitle}
                        </td>
                        <td className="py-3 px-4 text-right text-stone-500 whitespace-nowrap">
                          {formatDate(item.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Answer Key Modal for Admin/Denzel */}
      {showAnswerKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
          <div className="bg-[#FFFDF9] border-[3px] border-stone-900 rounded-[28px] max-w-2xl w-full p-6 sm:p-8 shadow-brutal max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b-2 border-stone-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#F9C84E] border-2 border-stone-900 flex items-center justify-center font-black">
                  <Settings2 className="w-5 h-5 text-stone-900" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-stone-900">
                    Denzel's Official Answer Key
                  </h3>
                  <p className="font-mono text-xs text-stone-500">
                    Leaderboard rankings automatically calculate against these answers
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAnswerKeyModal(false)}
                className="p-1.5 rounded-xl border border-stone-900 hover:bg-stone-100 text-stone-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              {activeQuestions.map((q, idx) => {
                const key = answerKey[q.id];
                return (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-xl border-2 border-stone-900 bg-[#FAF7F0] space-y-2"
                  >
                    <div className="font-bold text-stone-900 text-sm">
                      Q{idx + 1}: {q.label}
                    </div>

                    {q.type === 'select' && q.options && (
                      <div className="space-y-1">
                        <label className="text-stone-600 block text-[11px] font-bold">
                          Select Correct Option:
                        </label>
                        <select
                          value={String(key?.correctAnswer || '')}
                          onChange={(e) => {
                            setAnswerKey((prev) => ({
                              ...prev,
                              [q.id]: {
                                ...prev[q.id],
                                correctAnswer: e.target.value,
                              },
                            }));
                          }}
                          className="w-full bg-white border border-stone-900 rounded-lg p-2 font-mono text-xs"
                        >
                          {q.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {q.type === 'text' && (
                      <div className="space-y-1">
                        <label className="text-stone-600 block text-[11px] font-bold">
                          Accepted Answer (Case-insensitive):
                        </label>
                        <input
                          type="text"
                          value={String(key?.correctAnswer || '')}
                          onChange={(e) => {
                            setAnswerKey((prev) => ({
                              ...prev,
                              [q.id]: {
                                ...prev[q.id],
                                correctAnswer: e.target.value,
                              },
                            }));
                          }}
                          className="w-full bg-white border border-stone-900 rounded-lg p-2 font-mono text-xs"
                        />
                      </div>
                    )}

                    {q.type === 'scale' && (
                      <div className="space-y-1">
                        <label className="text-stone-600 block text-[11px] font-bold">
                          Target Score ({q.min} to {q.max}):
                        </label>
                        <input
                          type="number"
                          min={q.min || 1}
                          max={q.max || 10}
                          value={Number(key?.correctAnswer || 10)}
                          onChange={(e) => {
                            setAnswerKey((prev) => ({
                              ...prev,
                              [q.id]: {
                                ...prev[q.id],
                                correctAnswer: Number(e.target.value),
                              },
                            }));
                          }}
                          className="w-full bg-white border border-stone-900 rounded-lg p-2 font-mono text-xs"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetAnswerKey}
                className="px-3 py-2 rounded-xl text-xs font-mono font-bold text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-300 transition"
              >
                Reset to Defaults
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAnswerKeyModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-900 bg-white font-mono text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveAnswerKey(answerKey)}
                  className="px-4 py-2 rounded-xl border-2 border-stone-900 bg-[#3D8F70] text-white font-mono text-xs font-bold shadow-brutal-sm cursor-pointer"
                >
                  Save Answer Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
