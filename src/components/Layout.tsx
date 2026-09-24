import React, { useState } from 'react';
import {
  ShieldCheck,
  Database,
  X,
  CheckCircle2,
  LogOut,
  User,
  SlidersHorizontal,
  Copy,
  Check,
  Trophy,
  Sparkles,
} from 'lucide-react';
import {
  isLiveConfigured,
  updateCustomSupabaseConfig,
  clearCustomSupabaseConfig,
} from '../lib/supabase';
import { SCHEMA_SQL, QUICK_RECURSION_FIX_SQL } from '../lib/schemaSql';

interface LayoutProps {
  children: React.ReactNode;
  participantName?: string | null;
  onClearParticipant?: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  onPreviewLoadingScreen?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  participantName,
  onClearParticipant,
  currentPage,
  onNavigate,
  onPreviewLoadingScreen,
}) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedFixSql, setCopiedFixSql] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleCopyFixSql = () => {
    navigator.clipboard.writeText(QUICK_RECURSION_FIX_SQL);
    setCopiedFixSql(true);
    setTimeout(() => setCopiedFixSql(false), 3000);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      alert('Please fill in both Supabase URL and Anon Key.');
      return;
    }
    updateCustomSupabaseConfig(supabaseUrl, supabaseAnonKey);
  };

  const handleResetConfig = () => {
    if (confirm('Clear custom Supabase configuration and revert to defaults?')) {
      clearCustomSupabaseConfig();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-stone-900 font-sans antialiased selection:bg-[#F9C84E] selection:text-stone-900">
      {/* Top Header matching screenshot */}
      <header className="sticky top-0 z-40 bg-[#FAF7F0]/95 backdrop-blur-sm border-b-2 border-stone-900 px-4 sm:px-8 py-3.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          {/* Left Title */}
          <div
            onClick={() => onNavigate(participantName ? 'questionnaire' : 'landing')}
            className="cursor-pointer group flex items-center gap-2"
          >
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 hover:opacity-80 transition">
              How well do you know me?
            </h1>
          </div>

          {/* Right Section: Creator Name + Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="font-mono text-xs font-bold tracking-[0.25em] text-stone-600 uppercase select-none">
              DENZEL
            </span>

            {/* Quick Actions / DB status */}
            <button
              onClick={() => setShowConfigModal(true)}
              className="px-2.5 py-1 rounded-xl border-2 border-stone-900 bg-white hover:bg-[#F9C84E] shadow-brutal-sm text-[11px] font-mono font-bold text-stone-900 transition flex items-center gap-1.5 cursor-pointer"
              title="Database Configuration"
            >
              <Database className="w-3 h-3 text-stone-800" />
              <span className="hidden sm:inline">
                {isLiveConfigured ? 'DB Live' : 'Demo DB'}
              </span>
            </button>

            {/* Leaderboard button */}
            <button
              onClick={() => onNavigate('leaderboard')}
              className={`px-2.5 sm:px-3 py-1 rounded-xl border-2 border-stone-900 shadow-brutal-sm text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                currentPage === 'leaderboard'
                  ? 'bg-[#F9C84E] text-stone-900'
                  : 'bg-white hover:bg-stone-100 text-stone-900'
              }`}
              title="View Leaderboards"
            >
              <Trophy className="w-3.5 h-3.5 text-stone-900" />
              <span className="hidden sm:inline">Ranks</span>
            </button>

            {/* Admin or Participant toggle */}
            {currentPage.startsWith('admin') ? (
              <button
                onClick={() => onNavigate(participantName ? 'questionnaire' : 'landing')}
                className="px-3 py-1 rounded-xl border-2 border-stone-900 bg-white hover:bg-stone-100 shadow-brutal-sm text-xs font-bold text-stone-900 transition cursor-pointer"
              >
                Quiz
              </button>
            ) : (
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className="px-3 py-1 rounded-xl border-2 border-stone-900 bg-white hover:bg-stone-100 shadow-brutal-sm text-xs font-bold text-stone-900 transition flex items-center gap-1 cursor-pointer"
                title="Admin Dashboard"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-stone-800" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}

            {participantName && currentPage === 'questionnaire' && onClearParticipant && (
              <button
                onClick={onClearParticipant}
                className="p-1.5 rounded-xl border-2 border-stone-900 bg-white hover:bg-rose-100 shadow-brutal-sm text-stone-900 transition cursor-pointer"
                title={`Signed in as ${participantName}. Click to change.`}
              >
                <LogOut className="w-3.5 h-3.5 text-stone-800" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>

      {/* Supabase Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
          <div className="bg-[#FFFDF9] border-[2.5px] border-stone-900 rounded-[28px] max-w-md w-full p-6 sm:p-7 shadow-brutal relative">
            <button
              onClick={() => setShowConfigModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full border-2 border-stone-900 bg-white flex items-center justify-center text-stone-900 hover:bg-[#F9C84E] transition shadow-brutal-sm cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl border-2 border-stone-900 bg-[#F9C84E] flex items-center justify-center text-stone-900 shadow-brutal-sm">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-stone-900">
                  Database Settings
                </h3>
                <p className="text-xs font-mono text-stone-600">
                  Supabase PostgreSQL & RLS
                </p>
              </div>
            </div>

            <div className="mb-5 p-3.5 rounded-2xl bg-[#FAF7F0] border-2 border-stone-900 text-xs text-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-700">Status:</span>
                {isLiveConfigured ? (
                  <span className="inline-flex items-center gap-1 text-[#3D8F70] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Connected to Supabase
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-amber-800">
                    Interactive Demo Mode
                  </span>
                )}
              </div>
              <p className="font-mono text-[11px] text-stone-600 leading-relaxed">
                Migration schema: <span className="font-bold">supabase/migrations/01_schema.sql</span>
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyFixSql}
                  className="px-2.5 py-1 rounded-lg border border-stone-900 bg-[#E05338] hover:bg-[#c9452c] text-white font-mono text-[11px] font-bold shadow-brutal-sm flex items-center gap-1 cursor-pointer"
                  title="Run this in Supabase SQL editor if you get 'infinite recursion detected' error"
                >
                  {copiedFixSql ? (
                    <>
                      <Check className="w-3 h-3 stroke-[3]" /> Copied RLS Fix!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy RLS Fix SQL
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-2.5 py-1 rounded-lg border border-stone-900 bg-white hover:bg-[#F9C84E] text-stone-900 font-mono text-[11px] font-bold shadow-brutal-sm flex items-center gap-1 cursor-pointer"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3 h-3 text-[#3D8F70]" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Full Migration SQL
                    </>
                  )}
                </button>
                {isLiveConfigured && (
                  <button
                    type="button"
                    onClick={clearCustomSupabaseConfig}
                    className="px-2.5 py-1 rounded-lg border border-stone-900 bg-stone-100 hover:bg-stone-200 text-stone-900 font-mono text-[11px] font-bold cursor-pointer"
                  >
                    Revert to Demo Mode
                  </button>
                )}

                {onPreviewLoadingScreen && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfigModal(false);
                      onPreviewLoadingScreen();
                    }}
                    className="px-2.5 py-1 rounded-lg border border-stone-900 bg-white hover:bg-stone-100 text-stone-900 font-mono text-[11px] font-bold shadow-brutal-sm flex items-center gap-1 cursor-pointer"
                    title="Test the loading screen animation"
                  >
                    <Sparkles className="w-3 h-3 text-[#E05338]" />
                    Test Loading Screen
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 font-mono">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full bg-[#FAF7F0] border-2 border-stone-900 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 font-mono">
                  Supabase Anon Key
                </label>
                <input
                  type="password"
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  placeholder="eyJhbGciOi..."
                  className="w-full bg-[#FAF7F0] border-2 border-stone-900 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResetConfig}
                  className="text-xs font-mono font-bold text-stone-500 hover:text-rose-600 underline cursor-pointer"
                >
                  Reset
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold border-2 border-stone-900 bg-white hover:bg-stone-100 text-stone-900 shadow-brutal-sm cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold border-2 border-stone-900 bg-[#3D8F70] hover:bg-[#347b60] text-white shadow-brutal-sm shadow-brutal-hover cursor-pointer"
                  >
                    Save & Connect
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
