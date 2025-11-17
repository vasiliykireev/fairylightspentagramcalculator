"use strict";

/** Костыль для решения проблем с tabindex*/
const screenControlTabs = document.querySelectorAll('.screen-control__nav-link');
screenControlTabs.forEach(tab => {
    let bootstrapTab = window.bootstrap.Tab.getOrCreateInstance(tab);
    tab.setAttribute('tabindex', '0')
});
document.addEventListener('shown.bs.tab', () => {
    screenControlTabs.forEach(tab => {
        tab.setAttribute('tabindex', '0')
    });
});