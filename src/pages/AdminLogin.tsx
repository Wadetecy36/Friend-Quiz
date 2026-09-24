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
    <div className="max-w-md mx-auto py-8 sm:py-16 text-left">
      <button
        onClick={onBackToQuiz}
        className="btn-secondary text-xs mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to quiz</span>
      </button>

      <div className="plum-card soft-glow p-7 sm:p-9 space-y-6 text-left">
        {/* Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 avatar-gradient text-[#241533]">
            {mode === 'signup' ? (
              <UserPlus className="w-5 h-5" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#FBF4EA] tracking-tight">
              {mode === 'signup' ? 'Create Admin Account' : 'Creator Admin Portal'}
            </h2>
            <p className="text-xs text-[#B9A8C9]">
              {mode === 'signup' ? 'Register quiz creator access' : 'Authorized access for Denzel Mensah'}
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-white/[0.04] rounded-[18px]">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`flex-1 py-2 px-3 rounded-[14px] text-xs font-medium transition cursor-pointer ${
              mode === 'signin'
                ? 'bg-[#FF6B4A] text-white shadow-[0_4px_16px_rgba(255,107,74,0.35)]'
                : 'text-[#B9A8C9] hover:text-[#FBF4EA]'
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
            className={`flex-1 py-2 px-3 rounded-[14px] text-xs font-medium transition cursor-pointer ${
              mode === 'signup'
                ? 'bg-[#FF6B4A] text-white shadow-[0_4px_16px_rgba(255,107,74,0.35)]'
                : 'text-[#B9A8C9] hover:text-[#FBF4EA]'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Demo Mode Notice */}
        {!isLiveConfigured && (
          <div className="p-4 rounded-[20px] bg-white/[0.04] text-xs text-[#FBF4EA] space-y-1 text-left">
            <div className="text-[#FFD35C] font-semibold">Demo Mode Active</div>
            <p className="text-[#B9A8C9]">
              Click to use{' '}
              <button
                type="button"
                onClick={handleFillDemo}
                className="underline text-[#FF6B4A] font-semibold cursor-pointer"
              >
                admin@example.com
              </button>{' '}
              with any password.
            </p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="p-4 rounded-[20px] bg-emerald-500/15 text-emerald-200 text-xs space-y-2 text-left">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <div className="leading-relaxed">
                {successMessage}
              </div>
            </div>
          </div>
        )}

        {/* Localhost redirect helper */}
        <div className="rounded-[20px] bg-white/[0.04] p-3.5 text-xs text-left">
          <button
            type="button"
            onClick={() => setShowRedirectHelp(!showRedirectHelp)}
            className="w-full flex items-center justify-between text-left text-[#B9A8C9] hover:text-[#FBF4EA] cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#FFD35C]" />
              Email link redirecting to localhost?
            </span>
            <span className="text-[11px] underline">
              {showRedirectHelp ? 'Hide' : 'Quick fix'}
            </span>
          </button>

          {showRedirectHelp && (
            <div className="mt-3 pt-3 border-t border-white/[0.06] text-xs text-[#B9A8C9] space-y-2.5 leading-relaxed">
              <p>
                In Supabase Dashboard → <strong>Authentication → URL Configuration</strong>, set <strong>Site URL</strong> to:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={currentOrigin}
                  className="flex-1 cream-input text-[11px] py-2 px-3"
                />
                <button
                  type="button"
                  onClick={handleCopyAppUrl}
                  className="btn-secondary text-xs py-2 px-3 shrink-0"
                >
                  {copiedAppUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAppUrl ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[11px] text-[#8C789B]">
                Or in Auth → Providers → Email, turn off "Confirm email" for instant login.
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-[#B9A8C9]">
                Admin Email
              </label>
              {mode === 'signup' && (
                <button
                  type="button"
                  onClick={() => handleFillSuggestedEmail('mensahdenzel285@gmail.com')}
                  className="text-xs text-[#FF6B4A] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" /> Use Denzel's email
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                className="cream-input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#B9A8C9] mb-1.5">
              Password {mode === 'signup' && <span className="text-[#8C789B]">(min 6 chars)</span>}
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                minLength={mode === 'signup' ? 6 : undefined}
                className="cream-input text-sm"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-[#B9A8C9] mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="cream-input text-sm"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-[20px] bg-rose-500/15 text-rose-200 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>

              {isRecursionError && (
                <div className="pt-2 border-t border-rose-500/20 flex items-center justify-between">
                  <span className="text-xs text-[#B9A8C9]">
                    Fix database policy recursion:
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyFix}
                    className="btn-secondary text-xs py-1 px-2.5"
                  >
                    {copiedFixSql ? 'Copied!' : 'Copy RLS Fix'}
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3.5 mt-2"
          >
            {loading ? (
              <span>{mode === 'signup' ? 'Creating account...' : 'Verifying...'}</span>
            ) : mode === 'signup' ? (
              <>
                <span>Create Admin Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Sign in to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer switch prompt */}
        <div className="pt-1 text-center text-xs text-[#B9A8C9]">
          {mode === 'signin' ? (
            <span>
              Need an admin account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className="font-semibold text-[#FF6B4A] hover:underline cursor-pointer"
              >
                Create one now
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                }}
                className="font-semibold text-[#FF6B4A] hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
