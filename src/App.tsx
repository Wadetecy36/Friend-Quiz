/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Questionnaire } from './pages/Questionnaire';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminResponse } from './pages/AdminResponse';
import { Leaderboard } from './pages/Leaderboard';
import { LoadingScreen } from './components/LoadingScreen';
import { useParticipant } from './hooks/useParticipant';
import { useAdminAuth } from './hooks/useAdminAuth';

export default function App() {
  const {
    participantName,
    answers,
    isLoading: participantLoading,
    saveStatus,
    setAnswer,
    claimSession,
    resumeExistingSession,
    clearSession,
  } = useParticipant();

  const {
    adminUser,
    isAuthenticated: isAdminAuthenticated,
    loading: adminLoading,
    login: adminLogin,
    signup: adminSignup,
    logout: adminLogout,
    isLiveConfigured,
  } = useAdminAuth();

  // Navigation page state
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [viewingResponseId, setViewingResponseId] = useState<string | null>(null);

  // Loading screen states
  const [isInitialBoot, setIsInitialBoot] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<{
    message: string;
    submessage?: string;
  } | null>(null);

  // Auto-dismiss initial boot screen once background data loaders finish
  useEffect(() => {
    if (!participantLoading && !adminLoading) {
      const timer = setTimeout(() => {
        setIsInitialBoot(false);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [participantLoading, adminLoading]);

  // Auto-route based on existing participant or admin session
  useEffect(() => {
    if (!participantLoading && !isInitialBoot) {
      if (participantName && currentPage === 'landing') {
        setCurrentPage('questionnaire');
      }
    }
  }, [participantName, participantLoading, isInitialBoot]);

  // Route to admin-dashboard when admin signs in or returns via auth confirmation link
  useEffect(() => {
    if (isAdminAuthenticated && currentPage === 'admin-login') {
      setCurrentPage('admin-dashboard');
    }
  }, [isAdminAuthenticated, currentPage]);

  // Handle participant start with tactile loading feedback
  const handleStartQuiz = async (name: string) => {
    setActionLoading({
      message: `Welcome, ${name}!`,
      submessage: 'Securing private response session & loading questions...',
    });

    try {
      const res = await claimSession(name);
      if (res.success) {
        setCurrentPage('questionnaire');
      }
      return res;
    } finally {
      setTimeout(() => setActionLoading(null), 400);
    }
  };

  // Handle participant resume with loading feedback
  const handleResumeQuiz = async (name: string) => {
    setActionLoading({
      message: `Resuming session for ${name}...`,
      submessage: 'Restoring your auto-saved answers...',
    });

    try {
      const ok = await resumeExistingSession(name);
      if (ok) {
        setCurrentPage('questionnaire');
      }
      return ok;
    } finally {
      setTimeout(() => setActionLoading(null), 400);
    }
  };

  // Handle viewing a specific response in Admin
  const handleViewResponse = (id: string) => {
    setViewingResponseId(id);
    setCurrentPage('admin-response');
  };

  // 1. Initial Application Boot Screen
  if (isInitialBoot) {
    return (
      <LoadingScreen
        creatorName="DENZEL"
        minDuration={800}
        onFinish={() => setIsInitialBoot(false)}
      />
    );
  }

  return (
    <>
      {/* 2. Action Transition Loading Screen */}
      {actionLoading && (
        <LoadingScreen
          message={actionLoading.message}
          submessage={actionLoading.submessage}
          creatorName="DENZEL"
          minDuration={400}
        />
      )}

      <Layout
        participantName={participantName}
        onClearParticipant={clearSession}
        currentPage={currentPage}
        onNavigate={(page) => {
          if (page === 'admin-dashboard' && !isAdminAuthenticated) {
            setCurrentPage('admin-login');
          } else {
            setCurrentPage(page);
          }
        }}
        onPreviewLoadingScreen={() => {
          setActionLoading({
            message: 'How well do you know me?',
            submessage: 'Testing Denzel’s custom loading experience...',
          });
          setTimeout(() => {
            setActionLoading(null);
          }, 2400);
        }}
      >
      {/* 1. Landing Page */}
      {currentPage === 'landing' && (
        <Landing
          onStartQuiz={handleStartQuiz}
          onResumeQuiz={handleResumeQuiz}
          onNavigateAdmin={() =>
            setCurrentPage(isAdminAuthenticated ? 'admin-dashboard' : 'admin-login')
          }
          onNavigateLeaderboard={() => setCurrentPage('leaderboard')}
          savedName={participantName}
        />
      )}

      {/* 2. Questionnaire Page */}
      {currentPage === 'questionnaire' && (
        <Questionnaire
          participantName={participantName || 'Participant'}
          answers={answers}
          onAnswerChange={setAnswer}
          saveStatus={saveStatus}
          onClearSession={() => {
            clearSession();
            setCurrentPage('landing');
          }}
          onNavigateLeaderboard={() => setCurrentPage('leaderboard')}
        />
      )}

      {/* 3. Admin Login Page */}
      {currentPage === 'admin-login' && (
        <AdminLogin
          onLogin={async (email, pass) => {
            const res = await adminLogin(email, pass);
            if (res.success) {
              setCurrentPage('admin-dashboard');
            }
            return res;
          }}
          onSignup={async (email, pass) => {
            const res = await adminSignup(email, pass);
            if (res.success && !res.requiresEmailConfirmation) {
              setCurrentPage('admin-dashboard');
            }
            return res;
          }}
          onBackToQuiz={() => setCurrentPage(participantName ? 'questionnaire' : 'landing')}
          isLiveConfigured={isLiveConfigured}
        />
      )}

      {/* 4. Admin Dashboard Page */}
      {currentPage === 'admin-dashboard' && (
        isAdminAuthenticated && adminUser ? (
          <AdminDashboard
            adminEmail={adminUser.email}
            onLogout={async () => {
              await adminLogout();
              setCurrentPage('admin-login');
            }}
            onViewResponse={handleViewResponse}
            onNavigateLeaderboard={() => setCurrentPage('leaderboard')}
          />
        ) : (
          <AdminLogin
            onLogin={async (email, pass) => {
              const res = await adminLogin(email, pass);
              if (res.success) {
                setCurrentPage('admin-dashboard');
              }
              return res;
            }}
            onSignup={async (email, pass) => {
              const res = await adminSignup(email, pass);
              if (res.success && !res.requiresEmailConfirmation) {
                setCurrentPage('admin-dashboard');
              }
              return res;
            }}
            onBackToQuiz={() => setCurrentPage('landing')}
            isLiveConfigured={isLiveConfigured}
          />
        )
      )}

      {/* 5. Admin Single Response Detail */}
      {currentPage === 'admin-response' && viewingResponseId && (
        isAdminAuthenticated ? (
          <AdminResponse
            responseId={viewingResponseId}
            onBack={() => {
              setViewingResponseId(null);
              setCurrentPage('admin-dashboard');
            }}
          />
        ) : (
          <AdminLogin
            onLogin={async (email, pass) => {
              const res = await adminLogin(email, pass);
              if (res.success) {
                setCurrentPage('admin-response');
              }
              return res;
            }}
            onSignup={async (email, pass) => {
              const res = await adminSignup(email, pass);
              if (res.success && !res.requiresEmailConfirmation) {
                setCurrentPage('admin-response');
              }
              return res;
            }}
            onBackToQuiz={() => setCurrentPage('landing')}
            isLiveConfigured={isLiveConfigured}
          />
        )
      )}

      {/* 6. Live Leaderboard (Hall of Fame & Shame) */}
      {currentPage === 'leaderboard' && (
        <Leaderboard
          onBack={() => setCurrentPage(participantName ? 'questionnaire' : 'landing')}
          onTakeQuiz={() => setCurrentPage(participantName ? 'questionnaire' : 'landing')}
          isAdmin={isAdminAuthenticated}
          currentParticipantName={participantName}
        />
      )}
    </Layout>
    </>
  );
}
