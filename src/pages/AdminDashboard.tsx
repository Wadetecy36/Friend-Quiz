import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ResponseRecord, calculateCompletion, exportToCSV } from '../lib/utils';
import { getAllResponses, deleteResponseById } from '../lib/supabase';
import {
  Question,
  getActiveQuestions,
} from '../lib/questions';
import { AdminTable } from '../components/AdminTable';
import { AdminQuestionManager } from '../components/AdminQuestionManager';
import { useDesignSystem } from '../context/DesignSystemContext';
import {
  Download,
  Users,
  CheckCircle2,
  BarChart3,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Sliders,
  FileSpreadsheet,
  Trophy,
  Bookmark,
  Trash2,
  X,
  AlertCircle,
} from 'lucide-react';

interface AdminDashboardProps {
  adminEmail: string;
  onLogout: () => void;
  onViewResponse: (id: string) => void;
  onNavigateLeaderboard?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminEmail,
  onLogout,
  onViewResponse,
  onNavigateLeaderboard,
}) => {
  const { theme } = useDesignSystem();
  const [activeTab, setActiveTab] = useState<'responses' | 'questions'>('responses');
  const [responses, setResponses] = useState<ResponseRecord[]>([]);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>(getActiveQuestions());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResponses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllResponses();
      if (res.error) {
        setError(res.error);
      } else {
        setResponses(res.data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load responses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, []);

  const [responseToDelete, setResponseToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    if (responseToDelete) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [responseToDelete]);

  const handleQuestionsUpdated = () => {
    setActiveQuestions(getActiveQuestions());
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteError(null);
    setResponseToDelete({ id, name });
  };

  const confirmDeleteResponse = async () => {
    if (!responseToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await deleteResponseById(responseToDelete.id);
      if (res.success) {
        setResponses((prev) => prev.filter((r) => r.id !== responseToDelete.id));
        setResponseToDelete(null);
      } else {
        setDeleteError(`Delete failed: ${res.error || 'Unknown database error'}`);
      }
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = () => {
    exportToCSV(responses, activeQuestions);
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = responses.length;
    if (total === 0) return { total: 0, completed: 0, avgPercentage: 0 };

    let totalPercentage = 0;
    let completedCount = 0;

    for (const r of responses) {
      const { count, percentage } = calculateCompletion(r.answers, activeQuestions.length);
      totalPercentage += percentage;
      if (count === activeQuestions.length) {
        completedCount++;
      }
    }

    return {
      total,
      completed: completedCount,
      avgPercentage: Math.round(totalPercentage / total),
    };
  }, [responses, activeQuestions]);

  return (
    <div className="space-y-7 pb-12 animate-note-entrance">
      {/* Top Banner / Actions with Notes Aesthetic */}
      <div
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b"
        style={{ borderColor: theme.colors.border }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-mono text-xs">
            <span className="font-bold flex items-center gap-1.5 text-orange-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ADMIN VERIFIED:
            </span>
            <span style={{ color: theme.colors.textSecondary }}>{adminEmail}</span>
          </div>
          <h2
            className="text-2xl sm:text-4xl font-black tracking-tight"
            style={{
              fontFamily: theme.typography.displayFont,
              color: theme.colors.textPrimary,
            }}
          >
            Creator Dashboard
          </h2>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {onNavigateLeaderboard && (
            <button
              onClick={onNavigateLeaderboard}
              className="interactive-option px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              style={{
                backgroundColor: theme.colors.surfaceSubtle,
                borderColor: theme.colors.borderSecondary,
                color: theme.colors.textPrimary,
              }}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Leaderboards</span>
            </button>
          )}

          <button
            onClick={fetchResponses}
            disabled={loading}
            className="interactive-option px-3.5 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            style={{
              backgroundColor: theme.colors.surfaceSubtle,
              borderColor: theme.colors.borderSecondary,
              color: theme.colors.textPrimary,
            }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={handleExportCSV}
            disabled={responses.length === 0}
            className="interactive-option px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-2 transition disabled:opacity-40 cursor-pointer shadow-sm"
            style={{
              backgroundColor: '#10B981',
            }}
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            Export CSV
          </button>

          <button
            onClick={onLogout}
            className="interactive-option px-3.5 py-2 rounded-xl border text-rose-400 border-rose-500/30 hover:bg-rose-950/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Admin Section Tabs */}
      <div
        className="flex p-1.5 border rounded-2xl gap-2 shadow-sm"
        style={{
          backgroundColor: theme.colors.surfaceSubtle,
          borderColor: theme.colors.border,
        }}
      >
        <button
          onClick={() => setActiveTab('responses')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'responses'
              ? 'bg-orange-500 text-white shadow-md'
              : 'hover:text-white'
          }`}
          style={{
            color: activeTab === 'responses' ? '#FFFFFF' : theme.colors.textSecondary,
          }}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Responses & Data ({responses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'questions'
              ? 'bg-orange-500 text-white shadow-md'
              : 'hover:text-white'
          }`}
          style={{
            color: activeTab === 'questions' ? '#FFFFFF' : theme.colors.textSecondary,
          }}
        >
          <Sliders className="w-4 h-4" />
          <span>Custom Questions & Answers ({activeQuestions.length} Qs)</span>
        </button>
      </div>

      {activeTab === 'responses' && (
        <div className="space-y-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className="border rounded-2xl p-5 shadow-sm transition hover:border-orange-500/40"
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              }}
            >
              <div
                className="flex items-center justify-between text-xs font-mono uppercase font-bold mb-2"
                style={{ color: theme.colors.textSecondary }}
              >
                <span>Total Participants</span>
                <Users className="w-4 h-4 text-orange-400" />
              </div>
              <div
                className="text-3xl sm:text-4xl font-black"
                style={{ color: theme.colors.textPrimary }}
              >
                {metrics.total}
              </div>
              <p
                className="font-mono text-xs mt-1"
                style={{ color: theme.colors.textSecondary }}
              >
                Unique names claimed
              </p>
            </div>

            <div
              className="border rounded-2xl p-5 shadow-sm transition hover:border-emerald-500/40"
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              }}
            >
              <div
                className="flex items-center justify-between text-xs font-mono uppercase font-bold mb-2"
                style={{ color: theme.colors.textSecondary }}
              >
                <span>Finished All {activeQuestions.length}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">
                {metrics.completed}
              </div>
              <p
                className="font-mono text-xs mt-1"
                style={{ color: theme.colors.textSecondary }}
              >
                {metrics.total > 0
                  ? `${Math.round((metrics.completed / metrics.total) * 100)}% completion rate`
                  : 'Waiting for completions'}
              </p>
            </div>

            <div
              className="border rounded-2xl p-5 shadow-sm transition hover:border-orange-500/40"
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              }}
            >
              <div
                className="flex items-center justify-between text-xs font-mono uppercase font-bold mb-2"
                style={{ color: theme.colors.textSecondary }}
              >
                <span>Average Progress</span>
                <BarChart3 className="w-4 h-4 text-orange-400" />
              </div>
              <div
                className="text-3xl sm:text-4xl font-black"
                style={{ color: theme.colors.textPrimary }}
              >
                {metrics.avgPercentage}%
              </div>
              <p
                className="font-mono text-xs mt-1"
                style={{ color: theme.colors.textSecondary }}
              >
                Across all respondents
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/20 text-rose-300 font-mono text-xs">
              Error: {error}
            </div>
          )}

          {deleteError && (
            <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/20 text-rose-300 font-mono text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{deleteError}</span>
              </div>
              <button
                onClick={() => setDeleteError(null)}
                className="p-1 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Responses Table */}
          <AdminTable
            responses={responses}
            onView={onViewResponse}
            onDelete={handleDelete}
          />
        </div>
      )}

      {activeTab === 'questions' && (
        <AdminQuestionManager onQuestionsUpdated={handleQuestionsUpdated} />
      )}

      {/* In-app Response Deletion Modal (Portaled to body, immune to parent transforms) */}
      {responseToDelete &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-sm p-4"
            style={{ minHeight: '100vh', WebkitOverflowScrolling: 'touch' }}
            onClick={() => !isDeleting && setResponseToDelete(null)}
          >
            <div className="flex min-h-full items-center justify-center py-4">
              <div
                className="relative w-full max-w-md p-6 rounded-2xl border shadow-2xl space-y-4 text-left"
                style={{
                  backgroundColor: '#13171F',
                  borderColor: 'rgba(239, 68, 68, 0.4)',
                  boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.95)',
                  color: '#F1F5F9',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Permanently Delete Submission?</h3>
                    <p className="text-xs text-stone-400">This action cannot be undone.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#1C222E] border border-white/10 text-xs space-y-1">
                  <span className="font-bold text-stone-300 block">Participant:</span>
                  <p className="text-stone-100 font-bold text-sm">{responseToDelete.name}</p>
                </div>

                <p className="text-xs text-stone-400 leading-relaxed">
                  Are you sure you want to permanently delete all answers and ranking metrics for this participant?
                </p>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => setResponseToDelete(null)}
                    className="px-4 py-2 rounded-xl bg-[#1C222E] border border-white/10 text-stone-300 hover:text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={confirmDeleteResponse}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isDeleting ? 'Deleting...' : 'Yes, Permanently Delete'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
