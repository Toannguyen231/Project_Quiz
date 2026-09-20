import { act } from '@testing-library/react';
import { renderHookWithProviders } from '../../test-utils';
import useTimer, { formatTimer } from '../useTimer';

describe('useTimer Hook Unit Tests', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        act(() => {
            jest.clearAllTimers();
        });
        jest.useRealTimers();
    });

    describe('Countdown & Auto-Submit on Timeout', () => {
        test('initializes with default options and decrements correctly over time', () => {
            const { result } = renderHookWithProviders(() => useTimer({ initialSeconds: 60, autoStart: true }));

            expect(result.current.timeLeft).toBe(60);
            expect(result.current.isRunning).toBe(true);
            expect(result.current.formattedTime).toBe('01:00');

            act(() => {
                jest.advanceTimersByTime(3000);
            });

            expect(result.current.timeLeft).toBe(57);
            expect(result.current.formattedTime).toBe('00:57');
        });

        test('triggers onTimeUp callback and stops running when countdown reaches zero', () => {
            const onTimeUpMock = jest.fn();
            const { result } = renderHookWithProviders(() =>
                useTimer({
                    initialSeconds: 3,
                    autoStart: true,
                    onTimeUp: onTimeUpMock,
                })
            );

            expect(result.current.timeLeft).toBe(3);
            expect(onTimeUpMock).not.toHaveBeenCalled();

            // Advance 3 seconds to hit 0
            act(() => {
                jest.advanceTimersByTime(3000);
            });

            expect(result.current.timeLeft).toBe(0);
            expect(result.current.isRunning).toBe(false);
            expect(result.current.isExpired).toBe(true);
            expect(result.current.timerStatus).toBe('danger');
            expect(onTimeUpMock).toHaveBeenCalledTimes(1);

            // Advancing further does not trigger multiple calls
            act(() => {
                jest.advanceTimersByTime(2000);
            });
            expect(onTimeUpMock).toHaveBeenCalledTimes(1);
        });

        test('supports numeric argument directly as initialSeconds', () => {
            const { result } = renderHookWithProviders(() => useTimer(120));
            expect(result.current.timeLeft).toBe(120);
            expect(result.current.formattedTime).toBe('02:00');
        });
    });

    describe('Tab Switch & Blur Detection (Anti-Cheat & Auto-Pause)', () => {
        let originalHidden;

        beforeEach(() => {
            originalHidden = document.hidden;
        });

        afterEach(() => {
            Object.defineProperty(document, 'hidden', {
                configurable: true,
                get: () => originalHidden,
            });
        });

        test('pauses countdown and increments tabSwitchCount on document visibilitychange (hidden)', () => {
            let isDocumentHidden = false;
            Object.defineProperty(document, 'hidden', {
                configurable: true,
                get: () => isDocumentHidden,
            });

            const onTabSwitchMock = jest.fn();
            const { result } = renderHookWithProviders(() =>
                useTimer({
                    initialSeconds: 100,
                    autoStart: true,
                    pauseOnBlur: true,
                    onTabSwitch: onTabSwitchMock,
                })
            );

            expect(result.current.isRunning).toBe(true);
            expect(result.current.tabSwitchCount).toBe(0);

            // User switches tab: document becomes hidden
            isDocumentHidden = true;
            act(() => {
                document.dispatchEvent(new Event('visibilitychange'));
            });

            expect(result.current.isRunning).toBe(false);
            expect(result.current.isPausedByBlur).toBe(true);
            expect(result.current.tabSwitchCount).toBe(1);
            expect(onTabSwitchMock).toHaveBeenCalledWith(1);

            // While paused, time does not decrement
            act(() => {
                jest.advanceTimersByTime(5000);
            });
            expect(result.current.timeLeft).toBe(100);

            // User returns to tab: document becomes visible
            isDocumentHidden = false;
            act(() => {
                document.dispatchEvent(new Event('visibilitychange'));
            });

            expect(result.current.isRunning).toBe(true);
            expect(result.current.isPausedByBlur).toBe(false);

            // Resumes decrementing
            act(() => {
                jest.advanceTimersByTime(2000);
            });
            expect(result.current.timeLeft).toBe(98);
        });

        test('handles window blur and focus events', () => {
            const { result } = renderHookWithProviders(() =>
                useTimer({
                    initialSeconds: 50,
                    autoStart: true,
                    pauseOnBlur: true,
                })
            );

            // Window loses focus
            act(() => {
                window.dispatchEvent(new Event('blur'));
            });

            expect(result.current.isRunning).toBe(false);
            expect(result.current.isPausedByBlur).toBe(true);
            expect(result.current.tabSwitchCount).toBe(1);

            // Window gains focus back
            act(() => {
                window.dispatchEvent(new Event('focus'));
            });

            expect(result.current.isRunning).toBe(true);
            expect(result.current.isPausedByBlur).toBe(false);
        });
    });

    describe('Manual Controls (start, pause, resume, reset)', () => {
        test('manual pause and resume functionality', () => {
            const { result } = renderHookWithProviders(() =>
                useTimer({
                    initialSeconds: 30,
                    autoStart: false, // does not start automatically
                })
            );

            expect(result.current.isRunning).toBe(false);
            expect(result.current.timeLeft).toBe(30);

            // Start manually
            act(() => {
                result.current.startTimer();
            });
            expect(result.current.isRunning).toBe(true);

            // Advance 5s
            act(() => {
                jest.advanceTimersByTime(5000);
            });
            expect(result.current.timeLeft).toBe(25);

            // Pause manually
            act(() => {
                result.current.pauseTimer();
            });
            expect(result.current.isRunning).toBe(false);

            // Advance 5s while paused
            act(() => {
                jest.advanceTimersByTime(5000);
            });
            expect(result.current.timeLeft).toBe(25);

            // Resume manually
            act(() => {
                result.current.resumeTimer();
            });
            expect(result.current.isRunning).toBe(true);

            act(() => {
                jest.advanceTimersByTime(3000);
            });
            expect(result.current.timeLeft).toBe(22);
        });

        test('resetTimer resets to new duration or initial duration', () => {
            const { result } = renderHookWithProviders(() =>
                useTimer({
                    initialSeconds: 50,
                    autoStart: true,
                })
            );

            act(() => {
                jest.advanceTimersByTime(20000);
            });
            expect(result.current.timeLeft).toBe(30);

            // Reset to initial
            act(() => {
                result.current.resetTimer();
            });
            expect(result.current.timeLeft).toBe(50);
            expect(result.current.isRunning).toBe(true);

            // Reset to custom duration
            act(() => {
                result.current.resetTimer(80);
            });
            expect(result.current.timeLeft).toBe(80);
        });
    });

    describe('Status Thresholds & formatTimer helper', () => {
        test('correctly sets warning and danger threshold statuses', () => {
            // warningThreshold: 300, dangerThreshold: 120
            const { result } = renderHookWithProviders(() =>
                useTimer({
                    initialSeconds: 350,
                    warningThreshold: 300,
                    dangerThreshold: 120,
                    autoStart: false,
                })
            );

            expect(result.current.timerStatus).toBe('normal');
            expect(result.current.isWarning).toBe(false);
            expect(result.current.isDanger).toBe(false);

            // Set to 200 (within warning: <= 300 and > 120)
            act(() => {
                result.current.setTimeLeft(200);
            });
            expect(result.current.timerStatus).toBe('warning');
            expect(result.current.isWarning).toBe(true);
            expect(result.current.isDanger).toBe(false);

            // Set to 60 (within danger: <= 120)
            act(() => {
                result.current.setTimeLeft(60);
            });
            expect(result.current.timerStatus).toBe('danger');
            expect(result.current.isDanger).toBe(true);
            expect(result.current.isWarning).toBe(false);
        });

        test('formatTimer formats minutes, hours, and invalid inputs accurately', () => {
            expect(formatTimer(0)).toBe('00:00');
            expect(formatTimer(59)).toBe('00:59');
            expect(formatTimer(60)).toBe('01:00');
            expect(formatTimer(65)).toBe('01:05');
            expect(formatTimer(3599)).toBe('59:59');
            expect(formatTimer(3600)).toBe('01:00:00');
            expect(formatTimer(3665)).toBe('01:01:05');
            expect(formatTimer(-10)).toBe('00:00');
            expect(formatTimer(null)).toBe('00:00');
            expect(formatTimer(undefined)).toBe('00:00');
            expect(formatTimer('not a number')).toBe('00:00');
        });
    });
});
