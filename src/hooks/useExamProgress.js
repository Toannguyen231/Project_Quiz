import { useState, useCallback, useRef, useEffect } from 'react';
import instance from '../util/axiosCutomes';

/**
 * Custom Hook: useExamProgress
 * Auto-saves and restores exam progress from localStorage.
 * Provides a debounced backend synchronization helper for PUT /submissions/:id/progress.
 *
 * @param {string|number} quizId - ID of current quiz
 * @param {string|number} [userId] - Optional candidate user ID to isolate storage
 * @param {Object} [options]
 * @param {number} [options.debounceMs=3000] - Debounce interval for backend sync
 */
export function useExamProgress(quizId, userId = null, options = {}) {
  const debounceMs = options.debounceMs ?? 3000;
  const storageKey = `quiz_progress_${quizId}${userId ? `_u${userId}` : ''}`;

  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  const debounceTimerRef = useRef(null);

  /**
   * Load saved progress from localStorage.
   * Returns saved object or null.
   */
  const loadProgress = useCallback(() => {
    if (!quizId) return null;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          answersMap: parsed.answersMap || {},
          flaggedQuestions: Array.isArray(parsed.flaggedQuestions) ? parsed.flaggedQuestions : [],
          timeLeft: typeof parsed.timeLeft === 'number' ? parsed.timeLeft : null,
          currentIndex: typeof parsed.currentIndex === 'number' ? parsed.currentIndex : (parsed.index || 0),
          tabSwitchCount: typeof parsed.tabSwitchCount === 'number' ? parsed.tabSwitchCount : 0,
          lastSavedAt: parsed.lastSavedAt || null,
        };
      }
    } catch (err) {
      console.warn(`[useExamProgress] Failed to read ${storageKey} from localStorage:`, err);
    }
    return null;
  }, [quizId, storageKey]);

  /**
   * Save progress to localStorage immediately.
   */
  const saveProgress = useCallback((data) => {
    if (!quizId || !data) return;
    try {
      const now = Date.now();
      const payload = {
        quizId,
        userId,
        answersMap: data.answersMap || {},
        flaggedQuestions: data.flaggedQuestions || [],
        timeLeft: data.timeLeft,
        currentIndex: data.currentIndex ?? data.index ?? 0,
        tabSwitchCount: data.tabSwitchCount ?? 0,
        lastSavedAt: now,
      };

      localStorage.setItem(storageKey, JSON.stringify(payload));
      setLastSavedAt(now);
    } catch (err) {
      console.warn(`[useExamProgress] Failed to save ${storageKey} to localStorage:`, err);
    }
  }, [quizId, userId, storageKey]);

  /**
   * Remove progress from localStorage (e.g. after successful submission or exit).
   */
  const clearProgress = useCallback(() => {
    if (!quizId) return;
    try {
      localStorage.removeItem(storageKey);
      setLastSavedAt(null);
    } catch (err) {
      console.warn(`[useExamProgress] Failed to clear ${storageKey}:`, err);
    }
  }, [quizId, storageKey]);

  /**
   * Debounced sync helper for backend progress saving (PUT /api/v1/submissions/:id/progress).
   * Gracefully falls back if backend endpoint is not yet active.
   */
  const syncBackendProgress = useCallback((submissionId, progressData) => {
    if (!submissionId) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsSyncing(true);
      setSyncError(null);
      try {
        await instance.put(`/api/v1/submissions/${submissionId}/progress`, {
          quizId,
          answers: progressData?.answersMap || {},
          remainingSeconds: progressData?.timeLeft,
          flaggedQuestions: progressData?.flaggedQuestions || [],
          currentIndex: progressData?.currentIndex ?? 0,
          tabSwitchCount: progressData?.tabSwitchCount ?? 0,
        });
      } catch (err) {
        // Log quietly so app does not crash if backend is still deploying M5
        setSyncError(err.message || 'Progress sync failed');
      } finally {
        setIsSyncing(false);
      }
    }, debounceMs);
  }, [quizId, debounceMs]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    storageKey,
    lastSavedAt,
    isSyncing,
    syncError,
    loadProgress,
    saveProgress,
    clearProgress,
    syncBackendProgress,
  };
}

export default useExamProgress;
