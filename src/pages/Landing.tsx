import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Database,
  Code2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Wrench,
  Trophy,
} from 'lucide-react';
import { clearCustomSupabaseConfig } from '../lib/supabase';
import { SCHEMA_SQL, QUICK_RECURSION_FIX_SQL } from '../lib/schemaSql';

interface LandingProps {
  onStartQuiz: (name: string) => Promise<{
    success: boolean;
    error?: string;
    isSchemaMissing?: boolean;
    isRecursionError?: boolean;
  }>;
  onResumeQuiz: (name: string) => Promise<boolean>;
  onNavigateAdmin: () => void;
  onNavigateLeaderboard?: () => void;
  savedName?: string | null;
}

export const Landing: React.FC<LandingProps> = ({
  onStartQuiz,
  onResumeQuiz,
  onNavigateAdmin,
  onNavigateLeaderboard,
  savedName,
}) => {
  const [name, setName] = useState(savedName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSchemaMissing, setIsSchemaMissing] = useState(false);
  const [isRecursionError, setIsRecursionError] = useState(false);
  const [canResume, setCanResume] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedFixSql, setCopiedFixSql] = useState(false);
  const [showSqlCode, setShowSqlCode] = useState(false);
  const [showFixSqlCode, setShowFixSqlCode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = name.trim();
    if (!clean) {
      setError('Please enter your name or nickname to get started.');
      return;
    }

    setLoading(true);
    setError(null);
    setIsSchemaMissing(false);
    setIsRecursionError(false);
    setCanResume(false);

    const result = await onStartQuiz(clean);
    setLoading(false);

    if (!result.success) {
      const errMsg = result.error || 'This name has already been claimed.';
      setError(errMsg);

      // Detect recursion error
      const isRecursion =
        Boolean(result.isRecursionError) ||
        errMsg.includes('infinite recursion') ||
        errMsg.includes('42P17') ||
        errMsg.includes('policy for relation "admins"');

      if (isRecursion) {
        setIsRecursionError(true);
        return;
      }

      // Detect if schema table/function is missing
      const isMissing =
        Boolean(result.isSchemaMissing) ||
        errMsg.includes('claim_name') ||
        errMsg.includes('schema cache') ||
        errMsg.includes('relation "public.responses" does not exist') ||
        errMsg.includes('PGRST202') ||
        errMsg.includes('42P01');

      if (isMissing) {
        setIsSchemaMissing(true);
      } else {
        setCanResume(true);
      }
    }
  };

  const handleResume = async () => {
    const clean = name.trim();
    if (!clean) return;
    setLoading(true);
    const ok = await onResumeQuiz(clean);
    setLoading(false);
    if (!ok) {
      setError('Could not resume session for this name. Please pick another nickname.');
      setCanResume(false);
    }
  };

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

  const handleSwitchToDemo = () => {
    clearCustomSupabaseConfig();
  };

  return (
    <div className="max-w-xl mx-auto py-8 sm:py-16 text-center space-y-6">
      {/* Question Counter Style Kicker */}
      <div className="font-mono text-xs sm:text-sm font-bold tracking-[0.25em] text-stone-500 uppercase">
        12 QUESTIONS · AUTO-SAVED · DENZEL
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight leading-tight">
        How well do you <br className="hidden sm:inline" />
        know me?
      </h1>

      <p className="text-sm sm:text-base text-stone-600 max-w-md mx-auto leading-relaxed">
        Answer 12 quick questions to find out. Your answers save continuously as you go.
      </p>

      {/* Main Input Card */}
      <div className="bg-[#FFFDF9] border-[2.5px] border-stone-900 rounded-[28px] p-6 sm:p-8 shadow-brutal text-left space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 mb-2 font-mono">
              Enter Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) {
                  setError(null);
                  setIsSchemaMissing(false);
                  setIsRecursionError(false);
                }
                setCanResume(false);
              }}
              maxLength={40}
              placeholder="e.g. Alex, Jordan, Sarah M."
              className="w-full bg-[#FAF7F0] border-2 border-stone-900 rounded-2xl px-4 py-3.5 text-base sm:text-lg font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white shadow-brutal-sm"
              autoFocus
            />
            <p className="text-xs font-mono text-stone-500 mt-2">
              Must be unique so your answers stay isolated.
            </p>
          </div>

          {/* Infinite Recursion Policy Fix Box */}
          {error && isRecursionError && (
            <div className="p-4 sm:p-5 rounded-2xl border-2 border-stone-900 bg-[#FEF2F2] text-stone-900 shadow-brutal-sm space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E05338] text-white flex items-center justify-center flex-shrink-0 border border-stone-900 shadow-brutal-sm">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-stone-900">
                    Supabase Policy Fix Needed (Infinite Recursion)
                  </h4>
                  <p className="font-mono text-xs text-stone-700 mt-1 leading-relaxed">
                    PostgreSQL reported <code className="bg-white px-1.5 py-0.5 rounded border border-stone-300 font-bold text-[#E05338]">infinite recursion in policy for relation "admins"</code>.
                    This occurs when the admin check recursively queries itself. A 1-click patch is ready:
                  </p>
                </div>
              </div>

              {/* Steps */}
              <div className="p-3 bg-white rounded-xl border border-stone-300 font-mono text-xs text-stone-800 space-y-1">
                <div>1. Click <span className="font-bold text-stone-900">"Copy RLS Fix SQL"</span> below.</div>
                <div>2. Open <span className="font-bold">Supabase Dashboard &gt; SQL Editor &gt; New Query</span>.</div>
                <div>3. Paste and click <span className="font-bold text-[#3D8F70]">Run</span>.</div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyFixSql}
                  className="px-3.5 py-2 rounded-xl border-2 border-stone-900 bg-[#E05338] hover:bg-[#c9452c] text-white text-xs font-bold shadow-brutal-sm flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedFixSql ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Copied RLS Fix!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy RLS Fix SQL</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-3.5 py-2 rounded-xl border-2 border-stone-900 bg-white hover:bg-stone-100 text-stone-900 text-xs font-bold shadow-brutal-sm flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#3D8F70]" />
                      <span>Copied Full Schema!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Full Schema SQL</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSwitchToDemo}
                  className="px-3.5 py-2 rounded-xl border-2 border-stone-900 bg-[#FAF7F0] hover:bg-stone-200 text-stone-900 text-xs font-bold shadow-brutal-sm transition cursor-pointer"
                >
                  Switch to Demo Mode
                </button>

                <button
                  type="button"
                  onClick={() => setShowFixSqlCode(!showFixSqlCode)}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold text-stone-700 hover:text-stone-950 flex items-center gap-1 cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>{showFixSqlCode ? 'Hide Fix' : 'View Fix'}</span>
                  {showFixSqlCode ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {showFixSqlCode && (
                <div className="mt-2 text-left">
                  <pre className="p-3 bg-stone-900 text-stone-100 rounded-xl text-[11px] font-mono overflow-x-auto max-h-48 border border-stone-700 select-all">
                    {QUICK_RECURSION_FIX_SQL}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Missing Supabase Schema Help Box */}
          {error && isSchemaMissing && !isRecursionError && (
            <div className="p-4 sm:p-5 rounded-2xl border-2 border-stone-900 bg-[#FFF3D6] text-stone-900 shadow-brutal-sm space-y-3">
              <div className="flex items-start gap-2.5">
                <Database className="w-5 h-5 text-amber-800 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-stone-900">
                    Supabase Schema Setup Needed
                  </h4>
                  <p className="font-mono text-xs text-stone-700 mt-1 leading-relaxed">
                    Your Supabase project is connected, but the SQL migration hasn't been run yet in your database.
                  </p>
                </div>
              </div>

              {/* 3 Step instructions */}
              <div className="p-3 bg-white/80 rounded-xl border border-stone-300 font-mono text-xs text-stone-800 space-y-1">
                <div>1. Copy the SQL migration script below.</div>
                <div>2. Go to your <span className="font-bold">Supabase Dashboard &gt; SQL Editor</span>.</div>
                <div>3. Paste and click <span className="font-bold text-[#3D8F70]">Run</span>.</div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-3.5 py-2 rounded-xl border-2 border-stone-900 bg-[#3D8F70] hover:bg-[#347b60] text-white text-xs font-bold shadow-brutal-sm flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy SQL Migration</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSwitchToDemo}
                  className="px-3.5 py-2 rounded-xl border-2 border-stone-900 bg-white hover:bg-stone-100 text-stone-900 text-xs font-bold shadow-brutal-sm transition cursor-pointer"
                  title="Test the app right now in local demo storage without Supabase setup"
                >
                  Switch to Demo Mode
                </button>

                <button
                  type="button"
                  onClick={() => setShowSqlCode(!showSqlCode)}
                  className="px-3 py-2 rounded-xl text-xs font-mono font-bold text-stone-700 hover:text-stone-950 flex items-center gap-1 transition cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>{showSqlCode ? 'Hide SQL' : 'View SQL'}</span>
                  {showSqlCode ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {/* Expandable SQL preview */}
              {showSqlCode && (
                <div className="mt-2 text-left">
                  <pre className="p-3 bg-stone-900 text-stone-100 rounded-xl text-[11px] font-mono overflow-x-auto max-h-48 border border-stone-700 select-all">
                    {SCHEMA_SQL}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Normal Name Conflict or Other Error */}
          {error && !isSchemaMissing && !isRecursionError && (
            <div className="p-3.5 rounded-2xl border-2 border-stone-900 bg-rose-50 text-rose-950 text-xs shadow-brutal-sm space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-700 flex-shrink-0" />
                <span>{error}</span>
              </div>
              {canResume && (
                <div className="pt-1 flex items-center gap-2 font-mono">
                  <button
                    type="button"
                    onClick={handleResume}
                    className="inline-flex items-center gap-1 font-bold text-stone-900 underline underline-offset-4 hover:text-stone-700 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Resume session for "{name}"
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full py-4 px-6 rounded-2xl border-2 border-stone-900 bg-[#3D8F70] hover:bg-[#347b60] text-white font-black text-base sm:text-lg shadow-brutal shadow-brutal-hover flex items-center justify-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <span>Checking name...</span>
            ) : (
              <>
                <span>Start Questionnaire</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-stone-200 grid grid-cols-2 gap-2 text-xs font-mono text-stone-600">
          <div>✓ Auto-saves instantly</div>
          <div>✓ Unique participant key</div>
        </div>

        {onNavigateLeaderboard && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onNavigateLeaderboard}
              className="w-full py-3 px-4 rounded-2xl border-2 border-stone-900 bg-[#FAF7F0] hover:bg-white text-stone-900 font-bold text-xs sm:text-sm shadow-brutal-sm shadow-brutal-hover flex items-center justify-center gap-2 cursor-pointer transition font-mono"
            >
              <Trophy className="w-4 h-4 text-[#F9C84E]" />
              <span>View Leaderboard (Hall of Fame & Shame)</span>
            </button>
          </div>
        )}
      </div>

      {/* Helper text */}
      <p className="font-mono text-xs text-stone-600 tracking-wide text-center">
        Everything saves automatically. Close the tab and come back any time.
      </p>

      {/* Admin Link */}
      <div className="pt-4">
        <button
          onClick={onNavigateAdmin}
          className="text-xs font-mono font-bold text-stone-500 hover:text-stone-900 inline-flex items-center gap-1.5 transition underline underline-offset-4 cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Quiz Creator Admin Portal
        </button>
      </div>
    </div>
  );
};
