"use strict";
/** Защита от мигания */
(function () {
    try {
        const stored = localStorage.getItem('theme'); // 'system' | 'dark' | 'light' | null
        if (stored === 'dark' || stored === 'light') {
            document.documentElement.setAttribute('data-bs-theme', stored);
        } else {
            // system: выставляем текущую системную тему (dark если prefers-color-scheme: dark)
            const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
        }
    } catch (e) {
        // ignore — если доступ к localStorage запрещён
    }
})();