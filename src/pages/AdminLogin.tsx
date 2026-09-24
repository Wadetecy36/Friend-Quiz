import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  UserPlus,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { QUICK_RECURSION_FIX_SQL } from '../lib/schemaSql';

interface AdminLoginProps {
  onLogin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  onSignup: (
    email: string,
    pass: string
  ) => Promise<{ success: boolean; error?: string; requiresEmailConfirmation?: boolean }>;
  onBackToQuiz: () => void;
  isLiveConfigured: boolean;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLogin,
  onSignup,
  onBackToQuiz,
  isLiveConfigured,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedFixSql, setCopiedFixSql] = useState(false);
  const [copiedAppUrl, setCopiedAppUrl] = useState(false);
  const [showRedirectHelp, setShowRedirectHelp] = useState(false);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  const handleCopyAppUrl = () => {
    if (currentOrigin) {
      navigator.clipboard.writeText(currentOrigin);
      setCopiedAppUrl(true);
      setTimeout(() => setCopiedAppUrl(false), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError('Please provide both your admin email and password.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify your password.');
        return;
      }
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (mode === 'signup') {
      const res = await onSignup(cleanEmail, password);
      setLoading(false);

      if (!res.success) {
        setError(res.error || 'Failed to create admin account.');
      } else if (res.requiresEmailConfirmation) {
        setSuccessMessage(
          `Account created for ${cleanEmail}! Supabase sent a confirmation email to your inbox. Please verify it, then sign in.`
        );
        setMode('signin');
      }
    } else {
      const res = await onLogin(cleanEmail, password);
      setLoading(false);

      if (!res.success) {
        setError(res.error || 'Authentication failed.');
      }
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@example.com');
    setPassword('admin123');
    setError(null);
    setSuccessMessage(null);
  };

  const handleFillSuggestedEmail = (suggested: string) => {
    setEmail(suggested);
  };

  const handleCopyFix = () => {
    navigator.clipboard.writeText(QUICK_RECURSION_FIX_SQL);
    setCopiedFixSql(true);
    setTimeout(() => setCopiedFixSql(false), 3000);
  };

  const isRecursionError =
    error && (error.includes('recursion') || error.includes('42P17') || error.includes('admins'));

  return (
    <div className="max-w-md mx-auto py-8 sm:py-16">
      <button
        onClick={onBackToQuiz}
        className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-stone-600 hover:text-stone-900 mb-6 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Questionnaire
      </button>

      <div className="bg-[#FFFDF9] border-[2.5px] border-stone-900 rounded-[28px] p-6 sm:p-8 shadow-brutal space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl border-2 border-stone-900 bg-[#F9C84E] flex items-center justify-center text-stone-900 shadow-brutal-sm">
              {mode === 'signup' ? (
                <UserPlus className="w-6 h-6 stroke-[2.5]" />
              ) : (
                <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
              )}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                {mode === 'signup' ? 'Create Admin' : 'Admin Portal'}
              </h2>
              <p className="text-xs font-mono text-stone-600">
                {mode === 'signup' ? 'Register quiz creator account' : 'Restricted to quiz creator'}
              </p>
            </div>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 p-1 bg-[#FAF7F0] border-2 border-stone-900 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
              mode === 'signin'
                ? 'bg-[#1C1917] text-white shadow-sm'
                : 'text-stone-700 hover:text-stone-950'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
              mode === 'signup'
                ? 'bg-[#1C1917] text-white shadow-sm'
                : 'text-stone-700 hover:text-stone-950'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Demo Mode Notice */}
        {!isLiveConfigured && (
          <div className="p-3.5 rounded-2xl border-2 border-stone-900 bg-[#FAF7F0] text-xs font-mono text-stone-800 shadow-brutal-sm space-y-1">
            <div className="font-bold text-amber-800">Demo Mode Active:</div>
            <p className="text-stone-600">
              Sign in using{' '}
              <button
                type="button"
                onClick={handleFillDemo}
                className="font-bold underline text-stone-900 hover:text-amber-800 cursor-pointer"
              >
                admin@example.com
              </button>{' '}
              (or enter any email to test).
            </p>
          </div>
        )}

        {/* Success Message & Localhost Redirect Explanation */}
        {successMessage && (
          <div className="p-4 rounded-2xl border-2 border-stone-900 bg-[#E8F5E9] text-[#1B5E20] text-xs shadow-brutal-sm space-y-2.5">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="font-semibold text-stone-900 leading-relaxed">
                {successMessage}
              </div>
            </div>

            <div className="p-3 bg-white/80 rounded-xl border border-stone-300 font-mono text-[11px] text-stone-700 space-y-1.5">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                Did the verification link redirect to localhost?
              </div>
              <p>
                <strong>No problem!</strong> Clicking the link already confirmed your email on Supabase. You can now enter your password below and click <strong>Sign In</strong>!
              </p>
            </div>
          </div>
        )}

        {/* Localhost redirect helper accordion */}
        <div className="rounded-2xl border-2 border-stone-900 bg-[#FAF7F0] p-3 text-xs shadow-brutal-sm">
          <button
            type="button"
            onClick={() => setShowRedirectHelp(!showRedirectHelp)}
            className="w-full flex items-center justify-between text-left font-mono font-bold text-stone-800 hover:text-stone-950 cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-700" />
              Supabase email redirecting to localhost?
            </span>
            <span className="text-[11px] text-stone-500 underline">
              {showRedirectHelp ? 'Hide instructions' : 'See 30-sec fix'}
            </span>
          </button>

          {showRedirectHelp && (
            <div className="mt-3 pt-3 border-t border-stone-300 font-mono text-[11px] text-stone-700 space-y-2.5 leading-relaxed">
              <p>
                By default, new Supabase projects set their default Site URL to <code>http://localhost:3000</code>.
              </p>
              <div className="space-y-1.5">
                <div className="font-bold text-stone-900">Option 1: Fix Redirect URL (1 minute)</div>
                <ol className="list-decimal list-inside space-y-1 text-stone-600 pl-1">
                  <li>In your Supabase Dashboard, go to <strong>Authentication → URL Configuration</strong>.</li>
                  <li>Set <strong>Site URL</strong> and add to <strong>Redirect URLs</strong>:</li>
                </ol>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    readOnly
                    value={currentOrigin}
                    className="flex-1 px-2.5 py-1.5 bg-white border border-stone-400 rounded-lg text-[10px] text-stone-800 font-mono select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyAppUrl}
                    className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedAppUrl ? (
                      <>
                        <Check className="w-3 h-3 stroke-[3]" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy URL
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200">
                <div className="font-bold text-stone-900">Option 2: Instant Sign-Up without email links (Easiest)</div>
                <p className="text-stone-600 mt-1">
                  In Supabase Dashboard → <strong>Authentication → Providers → Email</strong>, toggle <strong>OFF</strong> <em>"Confirm email"</em>. Admin accounts will log in instantly without waiting for any confirmation emails.
                </p>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 font-mono">
                Admin Email
              </label>
              {mode === 'signup' && (
                <button
                  type="button"
                  onClick={() => handleFillSuggestedEmail('mensahdenzel285@gmail.com')}
                  className="text-[11px] font-mono text-[#3D8F70] hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" /> Use my email
                </button>
              )}
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                className="w-full bg-[#FAF7F0] border-2 border-stone-900 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white shadow-brutal-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 mb-1.5 font-mono">
              Password {mode === 'signup' && <span className="text-stone-500">(min 6 chars)</span>}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                minLength={mode === 'signup' ? 6 : undefined}
                className="w-full bg-[#FAF7F0] border-2 border-stone-900 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white shadow-brutal-sm font-mono"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 mb-1.5 font-mono">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-[#FAF7F0] border-2 border-stone-900 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white shadow-brutal-sm font-mono"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-2xl border-2 border-stone-900 bg-rose-50 text-rose-950 text-xs shadow-brutal-sm space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-700" />
                <span className="font-semibold">{error}</span>
              </div>

              {isRecursionError && (
                <div className="pt-2 border-t border-rose-200 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-stone-700">
                    Fix database policy recursion:
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyFix}
                    className="px-2.5 py-1 rounded-lg bg-[#E05338] text-white font-mono text-[11px] font-bold border border-stone-900 shadow-brutal-sm flex items-center gap-1 cursor-pointer"
                  >
                    {copiedFixSql ? (
                      <>
                        <Check className="w-3 h-3 stroke-[3]" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy RLS Fix
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-2xl border-2 border-stone-900 text-white font-black text-base shadow-brutal shadow-brutal-hover flex items-center justify-center gap-2 transition disabled:opacity-40 cursor-pointer ${
              mode === 'signup'
                ? 'bg-[#E05338] hover:bg-[#c9452c]'
                : 'bg-[#3D8F70] hover:bg-[#347b60]'
            }`}
          >
            {loading ? (
              <span>{mode === 'signup' ? 'Creating account...' : 'Verifying...'}</span>
            ) : mode === 'signup' ? (
              <>
                <span>Create Admin Account</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        {/* Footer switch prompt */}
        <div className="pt-2 text-center text-xs font-mono text-stone-600">
          {mode === 'signin' ? (
            <span>
              Don't have an admin account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className="font-bold underline text-stone-900 hover:text-[#E05338] cursor-pointer"
              >
                Create one now
              </button>
            </span>
          ) : (
            <span>
              Already registered as admin?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                }}
                className="font-bold underline text-stone-900 hover:text-[#3D8F70] cursor-pointer"
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>

      <p className="font-mono text-xs text-stone-500 text-center mt-6">
        Protected with PostgreSQL Row Level Security & Supabase Auth
      </p>
    </div>
  );
};
