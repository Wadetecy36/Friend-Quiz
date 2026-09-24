import React from 'react';
import {
  ShieldCheck,
  LogOut,
  Trophy,
} from 'lucide-react';
import { useDesignSystem } from '../context/DesignSystemContext';
import { Logo } from './Logo';

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
}) => {
  const { theme } = useDesignSystem();

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-200 antialiased"
      style={{
        backgroundColor: theme.colors.canvas,
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.bodyFont,
      }}
    >
      {/* Clean Top Header */}
      <header
        className="sticky top-0 z-40 backdrop-blur-sm border-b transition-colors px-4 sm:px-8 py-3.5"
        style={{
          backgroundColor: `${theme.colors.canvas}F0`,
          borderColor: theme.colors.borderSecondary || theme.colors.border,
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Wordmark & Logo */}
          <div
            onClick={() => onNavigate(participantName ? 'questionnaire' : 'landing')}
            className="cursor-pointer group flex items-center gap-2 select-none"
            title="HotSeat — The Official Denzel Questionnaire"
          >
            <Logo size="md" showBadge={true} />
          </div>

          {/* Clean User Navigation: Leaderboard & Admin */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Leaderboard button */}
            <button
              onClick={() => onNavigate('leaderboard')}
              className="px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              style={{
                backgroundColor:
                  currentPage === 'leaderboard' ? theme.colors.accent : theme.colors.surface,
                color:
                  currentPage === 'leaderboard'
                    ? theme.colors.accentText
                    : theme.colors.textPrimary,
                borderColor: theme.colors.border,
                borderRadius: theme.geometry.cardRadiusSm,
                boxShadow: theme.geometry.shadowSm,
              }}
              title="View Leaderboards"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Leaderboard</span>
              <span className="sm:hidden">Ranks</span>
            </button>

            {/* Admin or Participant toggle */}
            {currentPage.startsWith('admin') ? (
              <button
                onClick={() => onNavigate(participantName ? 'questionnaire' : 'landing')}
                className="px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer"
                style={{
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  color: theme.colors.textPrimary,
                  borderRadius: theme.geometry.cardRadiusSm,
                  boxShadow: theme.geometry.shadowSm,
                }}
              >
                Back to Quiz
              </button>
            ) : (
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                style={{
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  color: theme.colors.textPrimary,
                  borderRadius: theme.geometry.cardRadiusSm,
                  boxShadow: theme.geometry.shadowSm,
                }}
                title="Admin Dashboard"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}

            {participantName && currentPage === 'questionnaire' && onClearParticipant && (
              <button
                onClick={onClearParticipant}
                className="p-1.5 rounded-xl border transition cursor-pointer"
                style={{
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  color: theme.colors.textPrimary,
                  borderRadius: theme.geometry.cardRadiusSm,
                  boxShadow: theme.geometry.shadowSm,
                }}
                title={`Signed in as ${participantName}. Click to change.`}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
};
