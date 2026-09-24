import { useState, useCallback } from 'react';
import {
  Question,
  getStoredQuestions,
  saveStoredQuestions,
  getActiveQuestionsCount,
  setActiveQuestionsCount,
  resetQuestionsToDefault,
  MIN_QUESTIONS_COUNT,
  MAX_QUESTIONS_COUNT,
} from '../lib/questions';

export function useQuestions() {
  const [questionsList, setQuestionsList] = useState<Question[]>(() => getStoredQuestions());
  const [activeCount, setActiveCount] = useState<number>(() => getActiveQuestionsCount());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setQuestionsList(getStoredQuestions());
    setActiveCount(getActiveQuestionsCount());
  }, []);

  const saveQuestion = useCallback(
    async (question: Question, isEdit: boolean): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      setError(null);
      try {
        let updated: Question[];
        if (isEdit) {
          updated = questionsList.map((q) => (q.id === question.id ? question : q));
        } else {
          updated = [...questionsList, question];
        }
        setQuestionsList(updated);
        saveStoredQuestions(updated);
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to save question';
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setIsLoading(false);
      }
    },
    [questionsList]
  );

  const deleteQuestion = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      setError(null);
      try {
        if (questionsList.length <= MIN_QUESTIONS_COUNT) {
          const errText = `Cannot delete. The questionnaire requires a minimum of ${MIN_QUESTIONS_COUNT} questions.`;
          setError(errText);
          return { success: false, error: errText };
        }
        const updated = questionsList.filter((q) => q.id !== id);
        setQuestionsList(updated);
        saveStoredQuestions(updated);

        if (activeCount > updated.length) {
          const nextCount = Math.max(MIN_QUESTIONS_COUNT, updated.length);
          setActiveCount(nextCount);
          setActiveQuestionsCount(nextCount);
        }
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to delete question';
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setIsLoading(false);
      }
    },
    [questionsList, activeCount]
  );

  const reorderQuestions = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= questionsList.length) return;
      const copy = [...questionsList];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      setQuestionsList(copy);
      saveStoredQuestions(copy);
    },
    [questionsList]
  );

  const changeActiveCount = useCallback((newCount: number) => {
    const clamped = Math.max(MIN_QUESTIONS_COUNT, Math.min(MAX_QUESTIONS_COUNT, newCount));
    setActiveCount(clamped);
    setActiveQuestionsCount(clamped);
  }, []);

  const resetAllToDefaults = useCallback(() => {
    resetQuestionsToDefault();
    const defaults = getStoredQuestions();
    setQuestionsList(defaults);
    setActiveCount(12);
    setActiveQuestionsCount(12);
  }, []);

  return {
    questionsList,
    activeCount,
    isLoading,
    error,
    setError,
    saveQuestion,
    deleteQuestion,
    reorderQuestions,
    changeActiveCount,
    resetAllToDefaults,
    refresh,
  };
}
