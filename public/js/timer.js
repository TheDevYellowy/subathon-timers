function loadScript(name, fun, ...args) {
    let script = document.createElement("script");
    script.src = '/js/timer/' + name + ".js";
    script.onload = () => {
        if (typeof this[fun] === "function") {
            this[fun](...args);
        }
    }

    document.body.appendChild(script);
}

let times = {};
let bits = {};
let ws = null;
let pallySlug = "";

window.onload = () => {
    loadScript("functions");
    loadScript("websocket", "start");
}

const timeFunc = {
    getHours(time) {
        let hours;
        if (typeof time !== 'number') {
            hours = time.getHours().toString();
        }
        else {
            hours = Math.floor(time / (1000 * 60 * 60)).toString();
        }
        hours = hours.padStart(2, '0');
        return hours;
    },
    getMinutes(time) {
        let minutes;
        if (typeof time !== 'number') {
            minutes = time.getMinutes().toString();
        }
        else {
            minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60)).toString();
        }
        minutes = minutes.padStart(2, "0");
        return minutes;
    },
    getSeconds(time) {
        let seconds;
        if (typeof time !== 'number') {
            seconds = time.getSeconds().toString();
        }
        else {
            seconds = Math.floor((time % (1000 * 60)) / 1000).toString();
        }
        seconds = seconds.padStart(2, "0");
        return seconds;
    }
};