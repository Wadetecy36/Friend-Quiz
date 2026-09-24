import { useState, useEffect, useCallback, useRef } from 'react';
import {
  claimParticipantName,
  setParticipantContext,
  getParticipantResponse,
  updateParticipantAnswers,
} from '../lib/supabase';
import { debounce } from '../lib/utils';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useParticipant() {
  const [participantName, setParticipantName] = useState<string | null>(() => {
    return localStorage.getItem('participant_name') || null;
  });
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Keep a ref to latest answers to avoid stale state in debounce
  const answersRef = useRef(answers);
  answersRef.current = answers;

  // Initialize participant session context on mount or name change
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      const storedName = localStorage.getItem('participant_name');
      if (!storedName) {
        if (isMounted) {
          setIsLoading(false);
          setParticipantName(null);
        }
        return;
      }

      setIsLoading(true);
      try {
        // Set RLS session context in Supabase
        await setParticipantContext(storedName);

        // Fetch participant answers
        const record = await getParticipantResponse(storedName);
        if (isMounted) {
          if (record) {
            setParticipantName(record.participant_name);
            setAnswers(record.answers || {});
          } else {
            // Name exists in storage but not found in DB
            setParticipantName(storedName);
            setAnswers({});
          }
        }
      } catch (err) {
        console.error('Failed to initialize participant session:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Debounced auto-save function
  const debouncedSave = useRef(
    debounce(async (name: string, updatedAnswers: Record<string, string | number>) => {
      try {
        setSaveStatus('saving');
        const res = await updateParticipantAnswers(name, updatedAnswers);
        if (res.success) {
          setSaveStatus('saved');
        } else {
          setSaveStatus('error');
          setErrorMessage(res.error || 'Failed to auto-save');
        }
      } catch (err: unknown) {
        setSaveStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Auto-save failed');
      }
    }, 500)
  ).current;

  // Change answer for a specific question
  const setAnswer = useCallback(
    (questionId: string, value: string | number) => {
      const currentName = participantName || localStorage.getItem('participant_name');
      if (!currentName) return;

      setAnswers((prev) => {
        const next = { ...prev, [questionId]: value };
        debouncedSave(currentName, next);
        return next;
      });
    },
    [participantName, debouncedSave]
  );

  // Claim name on landing page
  const claimSession = async (
    name: string
  ): Promise<{ success: boolean; error?: string; isSchemaMissing?: boolean; isRecursionError?: boolean }> => {
    const trimmed = name.trim();
    if (!trimmed) {
      return { success: false, error: 'Name cannot be empty' };
    }

    setIsLoading(true);
    setErrorMessage(null);

    const result = await claimParticipantName(trimmed);
    if (result.success) {
      localStorage.setItem('participant_name', trimmed);
      setParticipantName(trimmed);
      await setParticipantContext(trimmed);
      setAnswers({});
      setIsLoading(false);
      return { success: true };
    } else {
      setIsLoading(false);
      setErrorMessage(result.error || 'This name is already in use.');
      return {
        success: false,
        error: result.error,
        isSchemaMissing: result.isSchemaMissing,
        isRecursionError: result.isRecursionError,
      };
    }
  };

  // Resume session if existing name matches local session
  const resumeExistingSession = async (name: string): Promise<boolean> => {
    const trimmed = name.trim();
    setIsLoading(true);
    await setParticipantContext(trimmed);
    const existing = await getParticipantResponse(trimmed);
    if (existing) {
      localStorage.setItem('participant_name', trimmed);
      setParticipantName(trimmed);
      setAnswers(existing.answers || {});
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  // Sign out / start over
  const clearSession = useCallback(() => {
    localStorage.removeItem('participant_name');
    setParticipantName(null);
    setAnswers({});
    setSaveStatus('idle');
  }, []);

  return {
    participantName,
    answers,
    isLoading,
    saveStatus,
    errorMessage,
    setAnswer,
    claimSession,
    resumeExistingSession,
    clearSession,
  };
}
