"use strict";

import { Pentagram } from './pentagram.js';
document.addEventListener('alpine:init', () => {
    Alpine.data('load', () => ({
        icons: [],
        fairyLightsPentagram: null,
        fairyLightsModes: [],

        async init() {
            const instance = new Pentagram();
            this.fairyLightsPentagram = instance;
            try {
                await instance.ready;
            } catch (e) {
                console.error('Pentagram load failed', e);
                return;
            }
            this.fairyLightsModes = instance.modes;
            Promise.all([
                'icons/menu.svg',
                'icons/close.svg',
                'icons/calculator.svg',
                'icons/settings.svg',
                'icons/info.svg'
            ].map(u => fetch(u).then(r => r.text())))
                .then(arr => this.icons = arr
                )
                .catch(() => console.error('SVG icons load error'));
        }
    }));
});