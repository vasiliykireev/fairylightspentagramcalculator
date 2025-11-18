// ./js/save-state.js
// Сохраняет/восстанавливает: settings tab, selected mode, screen-control tab
(function () {
    'use strict';

    const LS = {
        SETTINGS_TAB: 'flp:settings-tab',
        MODE: 'flp:mode',
        SCREEN_TAB: 'flp:screen-tab'
    };

    // Сохранение при переключении вкладок Bootstrap
    document.addEventListener('shown.bs.tab', (e) => {
        // e.target — активированная вкладка (кнопка)
        const el = e.target;
        if (!el) return;

        if (el.matches('.settings__nav-link')) {
            localStorage.setItem(LS.SETTINGS_TAB, el.id);
        }

        if (el.matches('.screen-control__nav-link')) {
            localStorage.setItem(LS.SCREEN_TAB, el.id);
        }
    }, false);

    // Сохранение при выборе режима (радио)
    document.addEventListener('change', (e) => {
        const t = e.target;
        if (!t) return;
        if (t.name === 'fairy-lights-pentagram-modes') {
            // value должен быть установлен (см. правку шаблона)
            localStorage.setItem(LS.MODE, String(t.value));
        }
    }, false);

    // При клике на пентаграмму/вызове changeMode — часто режим меняется без изменения radio.
    // Попытаемся "обернуть" функцию changeMode, чтобы всегда сохранять режим.
    function attachChangeModePatch() {
        if (window.fairyLightsPentagram && typeof window.fairyLightsPentagram.changeMode === 'function') {
            const orig = window.fairyLightsPentagram.changeMode.bind(window.fairyLightsPentagram);
            // избегаем повторного патча
            if (orig._patched) return;
            const patched = function (mode) {
                try {
                    orig(mode);
                } finally {
                    if (typeof mode !== 'undefined') {
                        localStorage.setItem(LS.MODE, String(mode));
                        // попытка синхронизировать radio-элемент с новым mode (если есть)
                        const selector = `input[name="fairy-lights-pentagram-modes"][value="${CSS && CSS.escape ? CSS.escape(mode) : mode}"]`;
                        try {
                            const input = document.querySelector(selector);
                            if (input) {
                                input.checked = true;
                                // Генерим событие change чтобы остальные слушатели среагировали
                                input.dispatchEvent(new Event('change', { bubbles: true }));
                            }
                        } catch (err) {
                            // CSS.escape может отсутствовать — в таком случае селектор использован буквално
                        }
                    }
                }
            };
            patched._patched = true;
            window.fairyLightsPentagram.changeMode = patched;
        } else {
            // если объект ещё не создан — пробуем позже
            setTimeout(attachChangeModePatch, 50);
        }
    }

    // Восстанавливаем состояние (вызвать после загрузки DOM)
    function restoreState() {
        // settings tab
        try {
            const settingsId = localStorage.getItem(LS.SETTINGS_TAB);
            if (settingsId) {
                const btn = document.getElementById(settingsId);
                if (btn) {
                    // Показать вкладку через Bootstrap API
                    const bsTab = window.bootstrap && window.bootstrap.Tab
                        ? window.bootstrap.Tab.getOrCreateInstance(btn)
                        : null;
                    if (bsTab && typeof bsTab.show === 'function') {
                        bsTab.show();
                    } else {
                        // fallback: манипулируем классами (мало вероятно, что будет нужно)
                        btn.classList.add('active');
                        const target = btn.getAttribute('data-bs-target') || btn.getAttribute('href');
                        if (target) {
                            const pane = document.querySelector(target);
                            if (pane) {
                                pane.classList.add('show', 'active');
                            }
                        }
                    }
                }
            }
        } catch (err) {
            console.warn('restoreState: settings tab', err);
        }

        // screen-control tab
        try {
            const screenId = localStorage.getItem(LS.SCREEN_TAB);
            if (screenId) {
                const btn = document.getElementById(screenId);
                if (btn) {
                    const bsTab = window.bootstrap && window.bootstrap.Tab
                        ? window.bootstrap.Tab.getOrCreateInstance(btn)
                        : null;
                    if (bsTab && typeof bsTab.show === 'function') {
                        bsTab.show();
                    } else {
                        btn.classList.add('active');
                        const target = btn.getAttribute('data-bs-target') || btn.getAttribute('href');
                        if (target) {
                            const pane = document.querySelector(target);
                            if (pane) {
                                pane.classList.add('show', 'active');
                            }
                        }
                    }
                }
            }
        } catch (err) {
            console.warn('restoreState: screen tab', err);
        }

        // mode (radio)
        try {
            const mode = localStorage.getItem(LS.MODE);
            if (mode) {
                // Найдём радиокнопку с value === mode
                // Пробуем безопасно использовать CSS.escape, если доступен
                let selector;
                try {
                    selector = `input[name="fairy-lights-pentagram-modes"][value="${CSS && CSS.escape ? CSS.escape(mode) : mode}"]`;
                } catch (e) {
                    selector = `input[name="fairy-lights-pentagram-modes"][value="${mode}"]`;
                }
                const input = document.querySelector(selector);
                if (input) {
                    input.checked = true;
                    // Опционально — вызвать change, и вызвать changeMode если он существует
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    if (window.fairyLightsPentagram && typeof window.fairyLightsPentagram.changeMode === 'function') {
                        try { window.fairyLightsPentagram.changeMode(mode); } catch (err) { /* ignore */ }
                    }
                } else {
                    // Если радио для режима ещё не создано (шаблон Alpine), то попробуем повторить позже
                    // (попытки через 200ms, максимум несколько раз)
                    let attempts = 0;
                    const tryFind = () => {
                        attempts++;
                        const inp = document.querySelector(`input[name="fairy-lights-pentagram-modes"][value="${mode}"]`);
                        if (inp) {
                            inp.checked = true;
                            inp.dispatchEvent(new Event('change', { bubbles: true }));
                            if (window.fairyLightsPentagram && typeof window.fairyLightsPentagram.changeMode === 'function') {
                                try { window.fairyLightsPentagram.changeMode(mode); } catch (err) { }
                            }
                        } else if (attempts < 20) {
                            setTimeout(tryFind, 200);
                        }
                    };
                    setTimeout(tryFind, 200);
                }
            }
        } catch (err) {
            console.warn('restoreState: mode', err);
        }
    }

    // Запускаем восстановление, когда DOM готов
    function init() {
        // restore after short delay to let Alpine/Bootstrap initialize
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                restoreState();
                attachChangeModePatch();
            }, 50);
        });
    }

    init();
})();