import React, { useState, useEffect, useMemo } from 'react';
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

  const handleQuestionsUpdated = () => {
    setActiveQuestions(getActiveQuestions());
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete responses for "${name}"?`)) {
      return;
    }

    const res = await deleteResponseById(id);
    if (res.success) {
      setResponses((prev) => prev.filter((r) => r.id !== id));
    } else {
      alert(`Delete failed: ${res.error || 'Unknown error'}`);
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
    </div>
  );
};
