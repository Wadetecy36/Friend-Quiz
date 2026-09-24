import React, { useState } from 'react';
import {
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Code2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Wrench,
  Trophy,
} from 'lucide-react';
import { clearCustomSupabaseConfig } from '../lib/supabase';
import { SCHEMA_SQL, QUICK_RECURSION_FIX_SQL } from '../lib/schemaSql';
import { useDesignSystem } from '../context/DesignSystemContext';
import { AVATAR_OPTIONS, getParticipantAvatar } from '../lib/utils';
import { sounds } from '../lib/audio';
import { Logo } from '../components/Logo';

interface LandingProps {
  onStartQuiz: (name: string) => Promise<{
    success: boolean;
    error?: string;
    isSchemaMissing?: boolean;
    isRecursionError?: boolean;
  }>;
  onResumeQuiz: (name: string) => Promise<boolean>;
  onNavigateAdmin?: () => void;
  onNavigateLeaderboard?: () => void;
  savedName?: string | null;
}

export const Landing: React.FC<LandingProps> = ({
  onStartQuiz,
  onResumeQuiz,
  onNavigateLeaderboard,
  savedName,
}) => {
  const { theme } = useDesignSystem();
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
    <div className="max-w-xl mx-auto py-6 sm:py-10 text-center space-y-6">
      {/* Brand Hero Mark */}
      <div className="flex justify-center">
        <Logo size="lg" showBadge={true} />
      </div>

      {/* Main Title */}
      <h1
        className="text-3xl sm:text-5xl font-black tracking-tight leading-tight"
        style={{
          fontFamily: theme.typography.displayFont,
          color: theme.colors.textPrimary,
        }}
      >
        How well do you <br className="hidden sm:inline" />
        know Denzel?
      </h1>

      <p
        className="text-sm sm:text-base max-w-md mx-auto leading-relaxed"
        style={{ color: theme.colors.textSecondary }}
      >
        12 honest questions to test who actually pays attention. Answers are auto-saved continuously as you play.
      </p>

      {/* Main Input Card with Notes Aesthetic */}
      <div className="relative animate-note-entrance">
        {/* Top Washi Tape Clip */}
        <div
          className="w-24 h-3 rounded-full note-tape mx-auto -mb-1.5 relative z-10 opacity-70"
          style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}
        />

        <div
          className="p-6 sm:p-8 text-left space-y-5 border transition-all note-grid-texture overflow-hidden"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.geometry.cardRadius,
            borderWidth: theme.geometry.borderWidth,
            boxShadow: theme.geometry.shadowCard,
            color: theme.colors.textPrimary,
          }}
        >
          {/* Notes Aesthetic: Author's Field Note */}
          <div
            className="p-3.5 rounded-xl border border-dashed flex items-start gap-2.5 transition-all"
            style={{
              backgroundColor: theme.colors.surfaceSubtle,
              borderColor: theme.colors.border,
            }}
          >
            <Sparkles className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm font-serif italic leading-relaxed" style={{ color: theme.colors.textSecondary }}>
              <span className="font-semibold text-amber-300 not-italic mr-1.5">Denzel's Note:</span>
              "Be brutal and completely honest with your answers. No checking old messages or second-guessing!"
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider font-mono">
                  Enter Your Name or Nickname
                </label>
                {name.trim() && (
                  <span className="font-mono text-xs flex items-center gap-1 text-orange-400">
                    <span>Avatar:</span>
                    <span className="text-base">{getParticipantAvatar(name)}</span>
                  </span>
                )}
              </div>

              <div className="relative">
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
                  className="w-full border px-4 py-3.5 text-base sm:text-lg font-bold focus:outline-none transition-all pr-12"
                  style={{
                    backgroundColor: theme.colors.surfaceSubtle,
                    borderColor: theme.colors.border,
                    borderRadius: theme.geometry.cardRadiusSm,
                    borderWidth: theme.geometry.borderWidth,
                    boxShadow: theme.geometry.shadowSm,
                    color: theme.colors.textPrimary,
                  }}
                  autoFocus
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xl select-none pointer-events-none">
                  {name.trim() ? getParticipantAvatar(name) : '✨'}
                </div>
              </div>

              <p
                className="text-xs font-mono mt-2"
                style={{ color: theme.colors.textSecondary }}
              >
                Must be unique so your answers stay isolated.
              </p>
            </div>

          {/* Infinite Recursion Policy Fix Box */}
          {error && isRecursionError && (
            <div
              className="p-4 sm:p-5 border space-y-3"
              style={{
                backgroundColor: theme.colors.surfaceSubtle,
                borderColor: theme.colors.statusWrong,
                borderRadius: theme.geometry.cardRadiusSm,
                borderWidth: theme.geometry.borderWidth,
              }}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
                  style={{ backgroundColor: theme.colors.statusWrong }}
                >
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">
                    Supabase Policy Fix Needed (Infinite Recursion)
                  </h4>
                  <p
                    className="font-mono text-xs mt-1 leading-relaxed"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    PostgreSQL reported infinite recursion in policy for relation "admins".
                    A 1-click patch is ready:
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyFixSql}
                  className="px-3.5 py-2 rounded-xl text-white text-xs font-bold border flex items-center gap-1.5 transition cursor-pointer"
                  style={{
                    backgroundColor: theme.colors.statusWrong,
                    borderColor: theme.colors.border,
                    borderRadius: theme.geometry.cardRadiusSm,
                    boxShadow: theme.geometry.shadowSm,
                  }}
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
                  onClick={handleSwitchToDemo}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer"
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    borderRadius: theme.geometry.cardRadiusSm,
                    boxShadow: theme.geometry.shadowSm,
                  }}
                >
                  Switch to Demo Mode
                </button>
              </div>
            </div>
          )}

          {/* Normal Name Conflict or Other Error */}
          {error && !isSchemaMissing && !isRecursionError && (
            <div
              className="p-3.5 border text-xs space-y-2"
              style={{
                backgroundColor: theme.colors.surfaceSubtle,
                borderColor: theme.colors.statusWrong,
                borderRadius: theme.geometry.cardRadiusSm,
              }}
            >
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: theme.colors.statusWrong }}
                />
                <span>{error}</span>
              </div>
              {canResume && (
                <div className="pt-1 flex items-center gap-2 font-mono">
                  <button
                    type="button"
                    onClick={handleResume}
                    className="inline-flex items-center gap-1 font-bold underline underline-offset-4 cursor-pointer"
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
            className="w-full py-4 px-6 border font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            style={{
              backgroundColor: theme.colors.accent,
              color: theme.colors.accentText,
              borderColor: theme.colors.border,
              borderRadius: theme.geometry.cardRadiusSm,
              borderWidth: theme.geometry.borderWidth,
              boxShadow: theme.geometry.shadowCard,
            }}
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

        <div
          className="pt-4 border-t grid grid-cols-2 gap-2 text-xs font-mono"
          style={{
            borderColor: theme.colors.borderSecondary || theme.colors.border,
            color: theme.colors.textSecondary,
          }}
        >
          <div>✓ Auto-saves instantly</div>
          <div>✓ Unique participant key</div>
        </div>

        {onNavigateLeaderboard && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onNavigateLeaderboard}
              className="w-full py-3 px-4 border font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition font-mono"
              style={{
                backgroundColor: theme.colors.surfaceSubtle,
                borderColor: theme.colors.border,
                borderRadius: theme.geometry.cardRadiusSm,
                borderWidth: theme.geometry.borderWidth,
                boxShadow: theme.geometry.shadowSm,
                color: theme.colors.textPrimary,
              }}
            >
              <Trophy className="w-4 h-4" style={{ color: theme.colors.accent }} />
              <span>View Leaderboard (Hall of Fame & Shame)</span>
            </button>
          </div>
        )}
      </div>
    </div>

      {/* Helper text */}
      <p
        className="font-mono text-xs tracking-wide text-center"
        style={{ color: theme.colors.textSecondary }}
      >
        Everything saves automatically. Close the tab and come back any time.
      </p>
    </div>
  );
};
