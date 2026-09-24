import React, { useState, useEffect, useMemo } from 'react';
import { ResponseRecord, getParticipantAvatar } from '../lib/utils';
import { getAllResponses } from '../lib/supabase';
import {
  calculateLeaderboards,
  ParticipantScore,
  getStoredAnswerKey,
  saveCustomAnswerKey,
  resetAnswerKey,
  QuestionKey,
} from '../lib/scoring';
import { getActiveQuestions } from '../lib/questions';
import { useDesignSystem } from '../context/DesignSystemContext';
import { triggerCelebration, sounds } from '../lib/audio';
import { ParticipantDetailModal } from '../components/ParticipantDetailModal';
import {
  Trophy,
  Flame,
  Search,
  RefreshCw,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Settings2,
  X,
  Share2,
  Check,
  Bookmark,
  Crown,
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
  const { theme } = useDesignSystem();
  const [activeTab, setActiveTab] = useState<'all' | 'all-correct' | 'wrong'>('all');
  const [responses, setResponses] = useState<ResponseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAnswerKeyModal, setShowAnswerKeyModal] = useState(false);
  const [answerKey, setAnswerKey] = useState<Record<string, QuestionKey>>(getStoredAnswerKey());
  const [copiedShare, setCopiedShare] = useState(false);
  
  // Selected participant for modal view
  const [selectedParticipant, setSelectedParticipant] = useState<{
    item: ParticipantScore;
    rankIndex: number;
  } | null>(null);

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

  const filteredAll = useMemo(() => filterList(allScores), [allScores, searchQuery]);
  const filteredAllCorrect = useMemo(() => filterList(allCorrectScores), [allCorrectScores, searchQuery]);
  const filteredWrong = useMemo(() => filterList(questionsWrongScores), [questionsWrongScores, searchQuery]);

  const handleOpenParticipant = (item: ParticipantScore, index: number) => {
    sounds.playClick();
    setSelectedParticipant({ item, rankIndex: index });
  };

  const handleShare = () => {
    sounds.playClick();
    const url = window.location.href;
    const shareText = `See who really knows Denzel! Check out the live HotSeat scoreboard: ${url}`;
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
    resetAnswerKey();
    setAnswerKey(getStoredAnswerKey());
    setShowAnswerKeyModal(false);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="px-3.5 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition hover:bg-white/5 opacity-80 hover:opacity-100"
          style={{
            borderColor: theme.colors.borderSecondary || theme.colors.border,
            color: theme.colors.textPrimary,
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Quiz</span>
        </button>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => setShowAnswerKeyModal(true)}
              className="px-3 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition hover:bg-white/5 text-amber-400"
              style={{
                borderColor: 'rgba(245, 158, 11, 0.4)',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
              }}
              title="Edit Denzel's Master Answer Key"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Answer Key</span>
            </button>
          )}

          <button
            onClick={fetchResponses}
            disabled={loading}
            className="p-2 rounded-xl border text-xs font-mono transition cursor-pointer hover:bg-white/5 opacity-80 hover:opacity-100"
            style={{
              borderColor: theme.colors.borderSecondary || theme.colors.border,
              color: theme.colors.textPrimary,
            }}
            title="Refresh Leaderboard"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-400' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            className="px-3.5 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition hover:bg-white/5 opacity-80 hover:opacity-100"
            style={{
              borderColor: theme.colors.borderSecondary || theme.colors.border,
              color: theme.colors.textPrimary,
            }}
            title="Share leaderboard"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-orange-400" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div
        className="border p-5 sm:p-7 space-y-4 text-center sm:text-left relative overflow-hidden rounded-3xl shadow-xl transition-all"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          color: theme.colors.textPrimary,
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 font-mono text-[11px] font-bold tracking-[0.25em] text-orange-400 uppercase">
              <Bookmark className="w-3.5 h-3.5 fill-orange-400/20" />
              <span>OFFICIAL LEADERBOARD · DENZEL</span>
            </div>
            <h1
              className="text-2xl sm:text-3xl font-black tracking-tight mt-1"
              style={{
                fontFamily: theme.typography.displayFont,
                color: theme.colors.textPrimary,
              }}
            >
              Who Really Knows Me?
            </h1>
            <p
              className="text-xs sm:text-sm mt-0.5 opacity-75 font-serif italic"
              style={{ color: theme.colors.textSecondary }}
            >
              Click any participant to view their score summary and accuracy breakdown.
            </p>
          </div>

          <button
            onClick={onTakeQuiz}
            className="self-center sm:self-auto px-5 py-2.5 rounded-xl border font-black text-xs font-mono flex items-center gap-2 cursor-pointer transition flex-shrink-0 shadow-md hover:scale-102 active:scale-98"
            style={{
              backgroundColor: theme.colors.accent,
              borderColor: theme.colors.accent,
              color: theme.colors.accentText,
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{currentParticipantName ? 'Continue Quiz' : 'Take The Quiz'}</span>
          </button>
        </div>

        {/* Quick Stats Summary */}
        <div
          className="grid grid-cols-3 gap-2 pt-3 border-t text-center font-mono text-xs"
          style={{ borderColor: theme.colors.borderSecondary }}
        >
          <div
            className="p-2 sm:p-2.5 rounded-xl border transition"
            style={{
              backgroundColor: theme.colors.surfaceSubtle,
              borderColor: theme.colors.borderSecondary,
            }}
          >
            <span className="block text-[10px] uppercase font-bold tracking-wider opacity-60">
              Total Players
            </span>
            <span className="font-black text-base sm:text-lg" style={{ color: theme.colors.textPrimary }}>
              {responses.length}
            </span>
          </div>

          <div
            className="p-2 sm:p-2.5 rounded-xl border transition"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderColor: 'rgba(16, 185, 129, 0.3)',
            }}
          >
            <span className="text-emerald-400 block text-[10px] uppercase font-bold tracking-wider">
              100% Club
            </span>
            <span className="font-black text-base sm:text-lg text-emerald-300">
              {allCorrectScores.length}
            </span>
          </div>

          <div
            className="p-2 sm:p-2.5 rounded-xl border transition"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderColor: 'rgba(239, 68, 68, 0.3)',
            }}
          >
            <span className="text-rose-400 block text-[10px] uppercase font-bold tracking-wider">
              Got Wrong
            </span>
            <span className="font-black text-base sm:text-lg text-rose-300">
              {questionsWrongScores.length}
            </span>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Showcase (Clickable to view modal) */}
      {allScores.length > 0 && (
        <div
          className="border p-4 sm:p-5 space-y-3 relative overflow-hidden rounded-3xl transition-all"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-400 animate-float" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">
                Top Contenders
              </span>
            </div>
            <span className="text-[11px] font-mono opacity-60">Tap to inspect</span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end pt-2 pb-1">
            {/* 2nd Place (Silver) */}
            <div className="flex flex-col items-center text-center order-1">
              {allScores[1] ? (
                <div
                  onClick={() => handleOpenParticipant(allScores[1], 1)}
                  className="w-full flex flex-col items-center space-y-1.5 cursor-pointer group transition hover:scale-103"
                  title="Click to view details"
                >
                  <div className="text-2xl sm:text-3xl select-none transition group-hover:scale-110">
                    {getParticipantAvatar(allScores[1].participant_name)}
                  </div>
                  <div className="font-black text-xs truncate w-full px-1" style={{ color: theme.colors.textPrimary }}>
                    {allScores[1].participant_name}
                  </div>
                  <div className="font-mono text-[10px] sm:text-[11px] font-bold text-slate-300">
                    {allScores[1].scorePercent}%
                  </div>
                  <div
                    className="w-full h-16 sm:h-20 rounded-t-xl border border-b-0 flex flex-col items-center justify-center font-black transition-all bg-slate-400/10 border-slate-400/30 group-hover:border-slate-300/60"
                  >
                    <span className="text-lg sm:text-xl">🥈</span>
                    <span className="font-mono text-[9px] sm:text-[10px] text-slate-300 font-bold uppercase">2nd</span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-16 sm:h-20 rounded-t-xl border border-dashed flex items-center justify-center opacity-25 text-xs font-mono">
                  —
                </div>
              )}
            </div>

            {/* 1st Place (Gold Champion) */}
            <div className="flex flex-col items-center text-center order-2">
              {allScores[0] ? (
                <div
                  onClick={() => handleOpenParticipant(allScores[0], 0)}
                  className="w-full flex flex-col items-center space-y-1.5 cursor-pointer group transition hover:scale-103"
                  title="Click to view details"
                >
                  <div className="relative">
                    <div className="text-3xl sm:text-4xl select-none animate-float transition group-hover:scale-110">
                      {getParticipantAvatar(allScores[0].participant_name)}
                    </div>
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-sm">👑</div>
                  </div>
                  <div className="font-black text-xs sm:text-sm truncate w-full px-1 text-amber-300">
                    {allScores[0].participant_name}
                  </div>
                  <div className="font-mono text-xs font-bold text-amber-400">
                    {allScores[0].scorePercent}%
                  </div>
                  <div
                    className="w-full h-22 sm:h-26 rounded-t-xl border border-b-0 flex flex-col items-center justify-center font-black transition-all bg-amber-500/15 border-amber-500/40 shadow-sm group-hover:border-amber-400"
                  >
                    <span className="text-xl sm:text-2xl">🏆</span>
                    <span className="font-mono text-[10px] text-amber-300 font-bold uppercase tracking-wider">#1 Champ</span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-22 sm:h-26 rounded-t-xl border border-dashed flex items-center justify-center opacity-25 text-xs font-mono">
                  —
                </div>
              )}
            </div>

            {/* 3rd Place (Bronze) */}
            <div className="flex flex-col items-center text-center order-3">
              {allScores[2] ? (
                <div
                  onClick={() => handleOpenParticipant(allScores[2], 2)}
                  className="w-full flex flex-col items-center space-y-1.5 cursor-pointer group transition hover:scale-103"
                  title="Click to view details"
                >
                  <div className="text-2xl sm:text-3xl select-none transition group-hover:scale-110">
                    {getParticipantAvatar(allScores[2].participant_name)}
                  </div>
                  <div className="font-black text-xs truncate w-full px-1" style={{ color: theme.colors.textPrimary }}>
                    {allScores[2].participant_name}
                  </div>
                  <div className="font-mono text-[10px] sm:text-[11px] font-bold text-amber-400/80">
                    {allScores[2].scorePercent}%
                  </div>
                  <div
                    className="w-full h-14 sm:h-16 rounded-t-xl border border-b-0 flex flex-col items-center justify-center font-black transition-all bg-amber-800/15 border-amber-700/30 group-hover:border-amber-600/60"
                  >
                    <span className="text-base sm:text-lg">🥉</span>
                    <span className="font-mono text-[9px] text-amber-200 font-bold uppercase">3rd</span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-14 sm:h-16 rounded-t-xl border border-dashed flex items-center justify-center opacity-25 text-xs font-mono">
                  —
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div
        className="grid grid-cols-3 gap-1.5 p-1 border rounded-2xl shadow-inner font-mono text-xs"
        style={{
          backgroundColor: theme.colors.surfaceSubtle,
          borderColor: theme.colors.borderSecondary,
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`py-2 px-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'all'
              ? 'bg-orange-500 text-white shadow-md'
              : 'opacity-70 hover:opacity-100 hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 flex-shrink-0" />
          <span>All ({allScores.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('all-correct')}
          className={`py-2 px-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'all-correct'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'opacity-70 hover:opacity-100 hover:text-white'
          }`}
        >
          <Crown className="w-3.5 h-3.5 flex-shrink-0" />
          <span>100% Club ({allCorrectScores.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('wrong')}
          className={`py-2 px-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'wrong'
              ? 'bg-rose-600 text-white shadow-md'
              : 'opacity-70 hover:opacity-100 hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Got Wrong ({questionsWrongScores.length})</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50"
          style={{ color: theme.colors.textSecondary }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by name..."
          className="w-full border rounded-2xl pl-10 pr-4 py-2.5 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition placeholder:opacity-40"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            color: theme.colors.textPrimary,
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-60 hover:opacity-100 font-bold"
            style={{ color: theme.colors.textSecondary }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Simple, Clean Participant List (Click to open details modal) */}
      <div className="space-y-2">
        {activeTab === 'all' && (
          <>
            {filteredAll.length === 0 ? (
              <div
                className="border rounded-2xl p-8 text-center text-xs font-mono opacity-70"
                style={{
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                }}
              >
                No participant records found.
              </div>
            ) : (
              filteredAll.map((item, idx) => {
                const isCurrent =
                  currentParticipantName &&
                  item.participant_name.toLowerCase() === currentParticipantName.toLowerCase();

                return (
                  <div
                    key={item.id}
                    onClick={() => handleOpenParticipant(item, idx)}
                    className={`group p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 hover:border-orange-500/50 hover:bg-white/5 active:scale-99 ${
                      isCurrent ? 'ring-2 ring-orange-500/60' : ''
                    }`}
                    style={{
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    }}
                  >
                    {/* Left: Rank & Avatar & Name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl border flex items-center justify-center font-black text-xs font-mono flex-shrink-0 ${
                          idx === 0
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : idx === 1
                            ? 'bg-slate-400/20 text-slate-300 border-slate-400/40'
                            : idx === 2
                            ? 'bg-amber-800/30 text-amber-200 border-amber-700/40'
                            : 'bg-white/5 text-slate-400 border-white/10'
                        }`}
                      >
                        {idx === 0 ? '👑' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </div>

                      <div className="text-xl sm:text-2xl select-none flex-shrink-0 transition-transform group-hover:scale-110">
                        {getParticipantAvatar(item.participant_name)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="font-bold text-sm sm:text-base truncate"
                            style={{ color: theme.colors.textPrimary }}
                          >
                            {item.participant_name}
                          </span>
                          {isCurrent && (
                            <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500 text-white">
                              You
                            </span>
                          )}
                        </div>
                        <div
                          className="font-mono text-[11px] opacity-70 truncate"
                          style={{ color: theme.colors.textSecondary }}
                        >
                          {item.roastTitle}
                        </div>
                      </div>
                    </div>

                    {/* Right: Score Pill & Chevron */}
                    <div className="flex items-center gap-2 flex-shrink-0 font-mono">
                      <span
                        className={`px-2.5 py-1 rounded-xl border text-xs font-bold whitespace-nowrap ${
                          item.scorePercent === 100
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : item.scorePercent >= 60
                            ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                            : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                        }`}
                      >
                        {item.correctCount}/{item.totalQuestions} ({item.scorePercent}%)
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        {/* TAB 2: ALL CORRECT (100% CLUB) */}
        {activeTab === 'all-correct' && (
          <>
            {filteredAllCorrect.length === 0 ? (
              <div
                className="border rounded-2xl p-8 text-center space-y-3 font-mono text-xs"
                style={{
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                }}
              >
                <div className="w-12 h-12 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-center mx-auto">
                  <Trophy className="w-6 h-6 text-amber-400 animate-float" />
                </div>
                <h3 className="text-base font-black" style={{ color: theme.colors.textPrimary }}>
                  Throne is Currently Empty!
                </h3>
                <p className="opacity-70 max-w-sm mx-auto" style={{ color: theme.colors.textSecondary }}>
                  No player has achieved 12/12 perfection yet. Can you be the first?
                </p>
                <button
                  onClick={onTakeQuiz}
                  className="px-4 py-2 rounded-xl bg-orange-500 text-white font-black text-xs cursor-pointer shadow-md inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Shoot for 12/12</span>
                </button>
              </div>
            ) : (
              filteredAllCorrect.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenParticipant(item, idx)}
                  className="group p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 hover:border-emerald-500/50 hover:bg-white/5 active:scale-99"
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderColor: 'rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black text-xs font-mono flex-shrink-0">
                      👑
                    </div>
                    <div className="text-xl sm:text-2xl select-none flex-shrink-0">
                      {getParticipantAvatar(item.participant_name)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm sm:text-base truncate" style={{ color: theme.colors.textPrimary }}>
                        {item.participant_name}
                      </div>
                      <div className="font-mono text-[11px] text-emerald-400 truncate">
                        12/12 Perfect Score
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 font-mono">
                    <span className="px-2.5 py-1 rounded-xl border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 text-xs font-bold">
                      100%
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* TAB 3: GOT WRONG (HALL OF SHAME) */}
        {activeTab === 'wrong' && (
          <>
            {filteredWrong.length === 0 ? (
              <div
                className="border rounded-2xl p-8 text-center space-y-2 font-mono text-xs opacity-70"
                style={{
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                }}
              >
                No mistakes recorded yet!
              </div>
            ) : (
              filteredWrong.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenParticipant(item, idx)}
                  className="group p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 hover:border-rose-500/50 hover:bg-white/5 active:scale-99"
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl border border-rose-500/40 bg-rose-950/40 text-rose-300 flex items-center justify-center font-black text-xs font-mono flex-shrink-0">
                      #{idx + 1}
                    </div>
                    <div className="text-xl sm:text-2xl select-none flex-shrink-0">
                      {getParticipantAvatar(item.participant_name)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm sm:text-base truncate" style={{ color: theme.colors.textPrimary }}>
                        {item.participant_name}
                      </div>
                      <div className="font-mono text-[11px] text-rose-400 truncate">
                        {item.wrongCount} mistake{item.wrongCount === 1 ? '' : 's'} · {item.roastTitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 font-mono">
                    <span className="px-2.5 py-1 rounded-xl border border-rose-500/40 bg-rose-950/40 text-rose-300 text-xs font-bold">
                      {item.scorePercent}%
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* Participant Detail Modal */}
      {selectedParticipant && (
        <ParticipantDetailModal
          participant={selectedParticipant.item}
          rankIndex={selectedParticipant.rankIndex}
          isAdmin={isAdmin}
          onClose={() => setSelectedParticipant(null)}
          onTakeQuiz={onTakeQuiz}
        />
      )}

      {/* Answer Key Modal for Admin/Denzel */}
      {showAnswerKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in select-none">
          <div
            className="border rounded-3xl max-w-xl w-full p-6 sm:p-7 max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: 'rgba(249, 115, 22, 0.4)',
              color: theme.colors.textPrimary,
            }}
          >
            <div
              className="flex items-center justify-between pb-3 border-b"
              style={{ borderColor: theme.colors.borderSecondary }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center font-black">
                  <Settings2 className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black" style={{ color: theme.colors.textPrimary }}>
                    Denzel's Official Master Key
                  </h3>
                  <p className="font-mono text-xs opacity-75" style={{ color: theme.colors.textSecondary }}>
                    Leaderboards calculate automatically against these answers
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAnswerKeyModal(false)}
                className="p-1.5 rounded-xl border hover:bg-white/10 cursor-pointer"
                style={{
                  borderColor: theme.colors.borderSecondary,
                  color: theme.colors.textSecondary,
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {activeQuestions.map((q, idx) => {
                const key = answerKey[q.id];
                return (
                  <div
                    key={q.id}
                    className="p-3 rounded-2xl border space-y-1.5"
                    style={{
                      backgroundColor: theme.colors.surfaceSubtle,
                      borderColor: theme.colors.borderSecondary,
                    }}
                  >
                    <div className="font-bold text-xs" style={{ color: theme.colors.textPrimary }}>
                      Q{idx + 1}: {q.label}
                    </div>

                    {q.type === 'select' && q.options && (
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
                        className="w-full border rounded-xl p-2 font-mono text-xs focus:outline-none bg-slate-900 border-white/10"
                      >
                        {q.options.map((opt) => (
                          <option key={opt} value={opt} className="bg-slate-900 text-white">
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {q.type === 'text' && (
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
                        className="w-full border rounded-xl p-2 font-mono text-xs focus:outline-none bg-slate-900 border-white/10"
                        placeholder="Accepted answer..."
                      />
                    )}

                    {q.type === 'scale' && (
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
                        className="w-full border rounded-xl p-2 font-mono text-xs focus:outline-none bg-slate-900 border-white/10"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div
              className="pt-3 border-t flex items-center justify-between"
              style={{ borderColor: theme.colors.borderSecondary }}
            >
              <button
                type="button"
                onClick={handleResetAnswerKey}
                className="px-3 py-2 rounded-xl text-xs font-mono font-bold text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
              >
                Reset to Defaults
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAnswerKeyModal(false)}
                  className="px-4 py-2 rounded-xl border font-mono text-xs font-bold cursor-pointer hover:bg-white/10"
                  style={{
                    borderColor: theme.colors.borderSecondary,
                    color: theme.colors.textSecondary,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveAnswerKey(answerKey)}
                  className="px-4 py-2 rounded-xl font-mono text-xs font-bold cursor-pointer shadow-md bg-orange-500 text-white hover:bg-orange-600 transition"
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
