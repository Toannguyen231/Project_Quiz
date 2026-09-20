import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Format seconds into MM:SS string (or HH:MM:SS if >= 1 hour).
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatTimer(totalSeconds) {
  if (typeof totalSeconds !== 'number' || isNaN(totalSeconds) || totalSeconds < 0) {
    return '00:00';
  }
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');

  if (hours > 0) {
    const hh = hours.toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

/**
 * Custom Hook: useTimer
 * Manages exam countdown, formatted displays, auto-pause on tab switch/blur,
 * alert thresholds, and auto-submit callback on timeout.
 *
 * @param {Object|number} options - Config object or initial seconds number
 * @param {number} [options.initialSeconds=600] - Duration in seconds (default: 10 mins = 600s)
 * @param {number} [options.duration] - Alias for initialSeconds
 * @param {Function} [options.onTimeUp] - Triggered when countdown hits 0
 * @param {Function} [options.onTabSwitch] - Triggered on blur / visibilitychange
 * @param {boolean} [options.pauseOnBlur=true] - Auto-pause timer when window loses focus
 * @param {boolean} [options.autoStart=true] - Whether to start immediately
 * @param {number} [options.warningThreshold=300] - Seconds under which warning is active (<5 mins)
 * @param {number} [options.dangerThreshold=120] - Seconds under which danger is active (<2 mins)
 */
export function useTimer(options = {}) {
  // Support both useTimer(600) and useTimer({ initialSeconds: 600, ... })
  const config = typeof options === 'number'
    ? { initialSeconds: options }
    : (options || {});

  const initialDuration = config.initialSeconds ?? config.duration ?? 600;
  const onTimeUp = config.onTimeUp;
  const onTabSwitch = config.onTabSwitch;
  const pauseOnBlur = config.pauseOnBlur ?? true;
  const autoStart = config.autoStart ?? true;
  const warningThreshold = config.warningThreshold ?? 300; // 5 minutes
  const dangerThreshold = config.dangerThreshold ?? 120; // 2 minutes

  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(autoStart && initialDuration > 0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isPausedByBlur, setIsPausedByBlur] = useState(false);

  // Keep references to avoid stale closures in listeners/intervals
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  const onTabSwitchRef = useRef(onTabSwitch);
  onTabSwitchRef.current = onTabSwitch;

  const hasTriggeredTimeUp = useRef(false);
  const wasRunningBeforeBlur = useRef(isRunning);

  // Sync initial seconds if config changes externally (e.g. async fetch)
  useEffect(() => {
    if (config.initialSeconds !== undefined && config.initialSeconds !== null) {
      setTimeLeft(config.initialSeconds);
      hasTriggeredTimeUp.current = false;
    }
  }, [config.initialSeconds]);

  // Main countdown interval
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          setIsRunning(false);
          if (!hasTriggeredTimeUp.current) {
            hasTriggeredTimeUp.current = true;
            if (typeof onTimeUpRef.current === 'function') {
              onTimeUpRef.current();
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning, timeLeft]);

  // Anti-cheat: Listen for window blur and document visibilitychange
  useEffect(() => {
    if (!pauseOnBlur) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched tab or minimized window
        setTabSwitchCount((c) => {
          const nextCount = c + 1;
          if (typeof onTabSwitchRef.current === 'function') {
            onTabSwitchRef.current(nextCount);
          }
          return nextCount;
        });

        setIsRunning((currentRunning) => {
          wasRunningBeforeBlur.current = currentRunning;
          return false;
        });
        setIsPausedByBlur(true);
      } else {
        // User returned to the tab
        setIsPausedByBlur(false);
        if (wasRunningBeforeBlur.current && timeLeft > 0) {
          setIsRunning(true);
        }
      }
    };

    const handleWindowBlur = () => {
      // Blur can fire on iframe click, but indicates loss of window focus
      if (!document.hidden) {
        setTabSwitchCount((c) => {
          const nextCount = c + 1;
          if (typeof onTabSwitchRef.current === 'function') {
            onTabSwitchRef.current(nextCount);
          }
          return nextCount;
        });
        setIsRunning((currentRunning) => {
          wasRunningBeforeBlur.current = currentRunning;
          return false;
        });
        setIsPausedByBlur(true);
      }
    };

    const handleWindowFocus = () => {
      setIsPausedByBlur(false);
      if (wasRunningBeforeBlur.current && timeLeft > 0) {
        setIsRunning(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [pauseOnBlur, timeLeft]);

  const startTimer = useCallback(() => {
    if (timeLeft > 0) {
      hasTriggeredTimeUp.current = false;
      setIsRunning(true);
    }
  }, [timeLeft]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resumeTimer = useCallback(() => {
    if (timeLeft > 0) {
      setIsRunning(true);
    }
  }, [timeLeft]);

  const resetTimer = useCallback((newSeconds = initialDuration) => {
    hasTriggeredTimeUp.current = false;
    setTimeLeft(newSeconds);
    setIsRunning(autoStart && newSeconds > 0);
  }, [initialDuration, autoStart]);

  const formattedTime = formatTimer(timeLeft);

  // Status indicators for alert styling
  const isWarning = timeLeft <= warningThreshold && timeLeft > dangerThreshold;
  const isDanger = timeLeft <= dangerThreshold && timeLeft > 0;
  const isExpired = timeLeft === 0;

  let timerStatus = 'normal';
  if (isDanger || isExpired) {
    timerStatus = 'danger';
  } else if (isWarning) {
    timerStatus = 'warning';
  }

  return {
    timeLeft,
    formattedTime,
    isRunning,
    isPausedByBlur,
    tabSwitchCount,
    isWarning,
    isDanger,
    isExpired,
    timerStatus,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    setTimeLeft,
    formatTimer,
  };
}

export default useTimer;
