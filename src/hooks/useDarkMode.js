import { useState, useEffect } from 'react';

const THEME_KEY = 'quizmaster_theme';

export default function useDarkMode() {
    const [theme, setTheme] = useState(() => {
        if (typeof window === 'undefined') return 'light';
        try {
            const saved = localStorage.getItem(THEME_KEY);
            if (saved) return saved;
            if (typeof window.matchMedia === 'function') {
                return window.matchMedia('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light';
            }
        } catch (e) {
            // ignore localStorage / matchMedia errors in constrained environments
        }
        return 'light';
    });

    useEffect(() => {
        if (typeof document === 'undefined') return;
        try {
            document.documentElement.setAttribute('data-theme', theme);
            document.body.setAttribute('data-theme', theme);
            localStorage.setItem(THEME_KEY, theme);
        } catch (e) {
            // ignore
        }
    }, [theme]);

    const toggleDarkMode = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    const isDarkMode = theme === 'dark';

    return {
        theme,
        isDarkMode,
        toggleDarkMode,
        setTheme,
    };
}
