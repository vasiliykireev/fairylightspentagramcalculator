"use strict";

export class Pentagram {
    constructor() {
        const fetchPentagram = fetch('icons/pentagram.svg')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.text();
            })
            .then(data => {
                this.svg = data;
                this.clickers.forEach(clicker => clicker.innerHTML = data);
                this.lights = {
                    one: document.querySelectorAll("#light1"),
                    two: document.querySelectorAll("#light2"),
                    three: document.querySelectorAll("#light3")
                };
            })
            .catch(error => console.error('SVG load error:', error));

        const fetchModes = fetch('js/modes.json')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                this.modes = data;
            })
            .catch(error => console.error('JSON load error:', error));
        this.ready = Promise.all([fetchPentagram, fetchModes])
    .then(() => {
        const savedMode = localStorage.getItem('flp:mode');
        const savedIndexRaw = localStorage.getItem('flp:currentModeIndex');
        const savedIndex = savedIndexRaw !== null ? parseInt(savedIndexRaw, 10) : NaN;
        this.mode = (savedMode && this.modes[savedMode]) ? savedMode : Object.keys(this.modes)[0];
        const len = this.modes[this.mode].length;
        this.currentModeIndex = (!isNaN(savedIndex) && savedIndex >= 0 && savedIndex < len) ? savedIndex : 0;
        this.currentStep = 0;
        const entry = this.modes[this.mode][this.currentModeIndex];
        this.changeLights(entry, this.currentModeIndex);

        return this;
    })
    .catch(err => console.error('Ошибка при загрузке файлов:', err));
    }

    clickers = document.querySelectorAll('.screensaver__clicker');
    // modes = {};
    // mode = '';
    // currentStep = 0;
    // currentModeIndex = 0;
    // timer = null;

    changeMode(newMode) {
        if (!this.modes[newMode]) return;
        this.mode = newMode;
        // this.currentModeIndex = 0; // при смене режима начинаем с нулевого кадра
        localStorage.setItem('flp:mode', this.mode);
        localStorage.setItem('flp:currentModeIndex', String(this.currentModeIndex));
        this.currentStep = 0;
        const entry = this.modes[this.mode][this.currentModeIndex];
        this.changeLights(entry, this.currentModeIndex);
    }

    changeEffect() {
        clearTimeout(this.timer);
        this.currentModeIndex = (this.currentModeIndex + 1) % this.modes[this.mode].length;
        localStorage.setItem('flp:currentModeIndex', String(this.currentModeIndex));
        this.currentStep = 0;
        const entry = this.modes[this.mode][this.currentModeIndex];
        this.changeLights(entry, this.currentModeIndex);
    }

changeLights(entry, modeIndex) {
    if (!entry || !entry.colors || entry.colors.length === 0) return;

    clearTimeout(this.timer);

    const colors = entry.colors;
    const n = colors.length;

    this.lights.one.forEach(one => { one.style.fill = colors[(0 + this.currentStep) % n]; });
    this.lights.two.forEach(two => { two.style.fill = colors[(1 + this.currentStep) % n]; });
    this.lights.three.forEach(three => { three.style.fill = colors[(2 + this.currentStep) % n]; });

    this.currentStep = (this.currentStep + 1) % n;

    const speed = typeof entry.speed === 'number' ? entry.speed : 1000;

    this.timer = setTimeout(() => this.changeLights(entry, modeIndex), speed);
    }
}