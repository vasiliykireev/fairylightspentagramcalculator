"use strict";

function themeSwitcher() {
    return {
        theme: localStorage.getItem('theme') || 'system',
        init() {
            this.apply();
            this._sysHandler = () => {
                if (this.theme === 'system') this.apply();
            };
            document.addEventListener('system-theme-updated', this._sysHandler);
        },
        set(value) {
            this.theme = value;
            try { localStorage.setItem('theme', value); } catch (e) { }
            this.apply();
        },
        apply() {
            if (this.theme === 'system') {
                const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
            } else {
                document.documentElement.setAttribute('data-bs-theme', this.theme);
            }
        }
    };
}

(function () {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    function handleChange(e) {
        try {
            const userTheme = localStorage.getItem('theme') || 'system';
            if (userTheme === 'system') {
                const isDark = (e && typeof e.matches === 'boolean') ? e.matches : mql.matches;
                document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
                document.dispatchEvent(new CustomEvent('system-theme-updated', { detail: { isDark } }));
            }
        } catch (err) {
            console.warn('Theme listener error', err);
        }
    }
    if (mql.addEventListener) {
        mql.addEventListener('change', handleChange);
    }
    handleChange();
})();