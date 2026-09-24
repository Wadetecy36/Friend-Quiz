import React, { useState, useEffect, useMemo } from 'react';
import { ResponseRecord, calculateCompletion, exportToCSV } from '../lib/utils';
import { getAllResponses, deleteResponseById } from '../lib/supabase';
import {
  Question,
  getActiveQuestions,
  getActiveQuestionsCount,
  getStoredQuestions,
} from '../lib/questions';
import { AdminTable } from '../components/AdminTable';
import { AdminQuestionManager } from '../components/AdminQuestionManager';
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
    <div className="space-y-7 pb-12">
      {/* Top Banner / Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-2 border-stone-900">
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-mono text-xs text-stone-600">
            <span className="font-bold text-stone-900 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3D8F70]" /> ADMIN VERIFIED:
            </span>
            <span>{adminEmail}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Creator Dashboard
          </h2>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {onNavigateLeaderboard && (
            <button
              onClick={onNavigateLeaderboard}
              className="px-3.5 py-2 rounded-2xl border-2 border-stone-900 bg-[#F9C84E] hover:bg-[#eab332] text-stone-900 shadow-brutal-sm shadow-brutal-hover text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Leaderboards</span>
            </button>
          )}

          <button
            onClick={fetchResponses}
            disabled={loading}
            className="px-3.5 py-2 rounded-2xl border-2 border-stone-900 bg-white hover:bg-stone-50 text-stone-900 shadow-brutal-sm shadow-brutal-hover text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={handleExportCSV}
            disabled={responses.length === 0}
            className="px-4 py-2 rounded-2xl border-2 border-stone-900 bg-[#3D8F70] hover:bg-[#347b60] text-white shadow-brutal-sm shadow-brutal-hover text-xs font-bold flex items-center gap-2 transition disabled:opacity-40 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            Export CSV
          </button>

          <button
            onClick={onLogout}
            className="px-3.5 py-2 rounded-2xl border-2 border-stone-900 bg-white hover:bg-rose-50 text-rose-800 shadow-brutal-sm shadow-brutal-hover text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Admin Section Tabs */}
      <div className="flex p-1.5 bg-[#FAF7F0] border-2 border-stone-900 rounded-2xl shadow-brutal-sm gap-2">
        <button
          onClick={() => setActiveTab('responses')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'responses'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'text-stone-700 hover:text-stone-950'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Responses & Data ({responses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'questions'
              ? 'bg-[#3D8F70] text-white shadow-sm'
              : 'text-stone-700 hover:text-stone-950'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Custom Questions & Answers ({activeQuestions.length} Qs)</span>
        </button>
      </div>

      {activeTab === 'responses' && (
        <div className="space-y-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#FFFDF9] border-[2.5px] border-stone-900 rounded-[28px] p-5 shadow-brutal">
              <div className="flex items-center justify-between text-stone-600 text-xs font-mono uppercase font-bold mb-2">
                <span>Total Participants</span>
                <Users className="w-4 h-4 text-stone-800" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-stone-900">
                {metrics.total}
              </div>
              <p className="font-mono text-xs text-stone-500 mt-1">Unique names claimed</p>
            </div>

            <div className="bg-[#FFFDF9] border-[2.5px] border-stone-900 rounded-[28px] p-5 shadow-brutal">
              <div className="flex items-center justify-between text-stone-600 text-xs font-mono uppercase font-bold mb-2">
                <span>Finished All {activeQuestions.length}</span>
                <CheckCircle2 className="w-4 h-4 text-[#3D8F70]" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-stone-900">
                {metrics.completed}
              </div>
              <p className="font-mono text-xs text-stone-500 mt-1">
                {metrics.total > 0
                  ? `${Math.round((metrics.completed / metrics.total) * 100)}% completion rate`
                  : 'Waiting for completions'}
              </p>
            </div>

            <div className="bg-[#FFFDF9] border-[2.5px] border-stone-900 rounded-[28px] p-5 shadow-brutal">
              <div className="flex items-center justify-between text-stone-600 text-xs font-mono uppercase font-bold mb-2">
                <span>Average Progress</span>
                <BarChart3 className="w-4 h-4 text-[#E05338]" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-stone-900">
                {metrics.avgPercentage}%
              </div>
              <p className="font-mono text-xs text-stone-500 mt-1">Across all respondents</p>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl border-2 border-stone-900 bg-rose-50 text-rose-950 font-mono text-xs">
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
