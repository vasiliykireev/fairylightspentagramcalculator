"use strict";

const screenWrapper = document.querySelector('.screen-settings');
const screenSaver = document.querySelector('.screensaver');
const settings = document.querySelector('.settings');

window.addEventListener('resize', () => {
    setPositionClasses();
});
setPositionClasses();
function setPositionClasses() {
    if (window.innerWidth > window.innerHeight) {

        screenWrapper.classList.remove('screen-settings__direction_column');
        screenWrapper.classList.add('screen-settings__direction_row');

        screenSaver.classList.remove('screensaver__direction_column');
        screenSaver.classList.add('screensaver__direction_row');

        settings.classList.remove('settings__direction_column');
        settings.classList.add('settings__direction_row');


    } else {
        screenWrapper.classList.remove('screen-settings__direction_row');
        screenWrapper.classList.add('screen-settings__direction_column');

        screenSaver.classList.remove('screensaver__direction_row');
        screenSaver.classList.add('screensaver__direction_column');

        settings.classList.remove('settings__direction_row');
        settings.classList.add('settings__direction_column');
    }
}