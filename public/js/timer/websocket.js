function start() {
    const socket = new WebSocket(`${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`);

    socket.onopen = () => {
        socket.send(JSON.stringify({
            event: "login",
            secret: window.location.pathname.split('/')[2],
        }));
    }

    socket.addEventListener("message", async (d) => {
        let text = document.getElementById("timeText");
        const string = d.data.toString();
        if (string === "ping") {
            return socket.send("pong");
        }
        if (!string.startsWith("{")) return;

        const json = JSON.parse(string);
        if(json.error) {
            const main = document.getElementById("textDiv");
            const text = document.getElementById("timeText");

            main.style.backgroundColor = "white";
            text.style.color = "red";
            text.innerText = json.error;

            return;
        }
        if(!json.event) return;

        switch(json.event) {
            case "login": {
                loadScript("twitch", "start", json.username);
                let time = json.data.timeLeft;
                let container = document.getElementById("container");

                times = json.data.times;
                bits = json.data.bits;
                ws = socket;

                text.innerText = `${timeFunc.getHours(time)}:${timeFunc.getMinutes(time)}:${timeFunc.getSeconds(time)}`;

                container.style.backgroundColor = json.data.timer.background;
                container.style.boxShadow = `0 0 1.5rem 1rem ${json.data.timer.shadow}`;
                text.style.color = json.data.timer.text;

                if(json.data.pallySlug !== "" && json.data.apiToken !== "") {
                    pallySlug = json.data.pallySlug;
                    loadScript("pally", "start", json.data.apiToken);
                }

                break;
            }
            case "time": {
                const time = json.time;
                text.innerText = `${timeFunc.getHours(time)}:${timeFunc.getMinutes(time)}:${timeFunc.getSeconds(time)}`;
            }
        }
    });

    window.onbeforeunload = () => {
        socket.close();
    }
}