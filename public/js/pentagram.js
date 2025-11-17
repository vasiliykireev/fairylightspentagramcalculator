"use strict";

export class Pentagram {
    constructor() {
        const fetchPentagram = fetch('icons/pentagram.svg')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                this.svg = data;
                this.clickers.forEach(clicker => {
                    clicker.innerHTML = data;
                });
                this.lights = {
                    one: document.querySelectorAll("#light1"),
                    two: document.querySelectorAll("#light2"),
                    three: document.querySelectorAll("#light3")
                }
            })
            .catch(error => {
                console.error('SVG load error:', error);
            });
        const fetchModes = fetch('js/modes.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                this.modes = data;
            })
            .catch(error => {
                console.error('JSON load error:', error);
            });
        this.ready = Promise.all([fetchPentagram, fetchModes])
            .then(() => {
                this.mode = Object.keys(this.modes)[0];
                this.changeLights(this.modes[this.mode][this.currentModeIndex]);
                return this
            })
            .catch(err => console.error('Ошибка при загрузке файлов:', err));
    }

    clickers = document.querySelectorAll('.screensaver__clicker');
    modes = {};
    mode = '';
    currentStep = 0;
    currentModeIndex = 0;
    timer;

    changeMode(mode) {
        this.mode = mode;
    }

    changeEffect() {
        clearTimeout(this.timer);
        this.currentModeIndex = (this.currentModeIndex + 1) % this.modes[this.mode].length;
        this.currentStep = 0;
        this.changeLights(this.modes[this.mode][this.currentModeIndex]);
    }

    changeLights(mode) {
        if (!mode || !mode.colors || mode.colors.length === 0) return;
        const colors = mode.colors;
        const n = colors.length;
        this.lights.one.forEach(one => { one.style.fill = colors[(0 + this.currentStep) % n]; });
        this.lights.two.forEach(two => { two.style.fill = colors[(1 + this.currentStep) % n]; });
        this.lights.three.forEach(three => { three.style.fill = colors[(2 + this.currentStep) % n]; });
        this.currentStep = (this.currentStep + 1) % n;
        this.timer = setTimeout(() => this.changeLights(this.modes[this.mode][this.currentModeIndex]), mode.speed);
    }
}