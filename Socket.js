const {WebSocketServer} = require("ws");
const debug = createDebug('timers:websocket');
const fs = require('node:fs');

function createDebug(namespace) {
    return function(msg) {
        console.log(`${new Date().toISOString().split("T")[1].split("Z")[0]} ${namespace} | ${msg}`);
    }
}

/**
 * @type {Record<string, WebSocket>}
 */
const sockets = {};

module.exports.sockets = sockets;

module.exports.server = function (server) {
    const WSServer = new WebSocketServer({ server });

    WSServer.on("connection", (socket) => {
        const quit = setTimeout(() => {
            socket.close();
        }, 3000);

        let ping = null;
        let close = null;

        let data = {};
        let username = "";
        let timer = false;
        let maxTime = -1;

        socket.on("message", async (d) => {
            const string = d.toString();
            if (string === "pong") {
                clearTimeout(close);
                close = setTimeout(() => socket.close(), 10000);
            }
            if (!string.startsWith("{")) return;

            const json = JSON.parse(d.toString());
            if (!json.event) return;

            switch (json.event) {
                case "login": {
                    let secret = json.secret;
                    const ldata = JSON.parse(fs.readFileSync(`${process.cwd()}/data/reverse_lookup.json`).toString());
                    if(ldata[secret] === undefined) {
                        socket.send(JSON.stringify({"error": "No data exists"}));
                        return socket.close();
                    }

                    username = ldata[secret];

                    if(!fs.existsSync(`${process.cwd()}/data/${username}.json`)) {
                        socket.send(JSON.stringify({"error": "No data exists"}));
                        return socket.close();
                    }
                    else data = JSON.parse(fs.readFileSync(`${process.cwd()}/data/${username}.json`).toString());

                    socket.send(JSON.stringify({
                        event: "login",
                        username,
                        data
                    }));

                    if(sockets[username] !== undefined) sockets[username].close(4000);
                    sockets[username] = socket;

                    clearTimeout(quit);
                    if(ping !== null) clearInterval(ping);
                    ping = setInterval(() => {
                        socket.send("ping");
                    }, 5000);
                    break;
                }
                case "resume":
                case "start": {
                    if(timer !== false) return;
                    else {
                        data = JSON.parse(fs.readFileSync(`${process.cwd()}/data/${username}.json`).toString());
                        if(data.timeLeft === 0) {
                            let temp = 0;
                            temp += data.initialTime.seconds;
                            temp += data.initialTime.minutes * 60;
                            temp += data.initialTime.hours * 60 * 60;
                            let left = addTime(username, temp, maxTime);
                            socket.send(JSON.stringify({ "event": "time", "time": left }));
                        }
                        timer = setInterval(() => {
                            let left = addTime(username, -1, maxTime);
                            if (left === 0) {
                                clearInterval(timer);
                                timer = false;
                            }
                            socket.send(JSON.stringify({ "event": "time", "time": left }));
                        }, 1000);
                    }
                    break;
                }
                case "pause":
                case "stop": {
                    debug(`${username} paused (${timer !== false})`)
                    if(timer === false) return;
                    else {
                        debug("Timer should have stopped");
                        clearInterval(timer);
                        timer = false;
                    }
                    break;
                }
                case "addtime": {
                    let left = addTime(username, json.time, maxTime);
                    debug(`adding ${json.time} seconds to ${username}`);
                    socket.send(JSON.stringify({ "event": "time", "time": left }));
                    break;
                }
                case "settime": {
                    let path = `${process.cwd()}/data/${username}.json`
                    data = JSON.parse(fs.readFileSync(path).toString());
                    if(json.time === undefined) {
                        console.log(json);
                        return;
                    }
                    data.timeLeft = json.time;

                    fs.writeFileSync(path, JSON.stringify(data));
                    socket.send(JSON.stringify({event: "time", "time": data.timeLeft }));
                    break;
                }
                default: break;
            }
        });

        socket.on("close", (ev) => {
            if(timer !== false) clearInterval(timer);
            timer = false;
            if(ping !== null) clearInterval(ping);
            ping = null;
            if(close !== null) clearTimeout(close);
            close = null;
            if(ev.code !== 4000) delete sockets[username];
        });
    });

    WSServer.on("open", () => {
        debug(`WebSocket listening on ${WSServer.address().port}`);
    });

    function addTime(username, time, maxTime) {
        if(time === undefined) time = 0;
        time *= 1000;
        let path = `${process.cwd()}/data/${username}.json`
        let data = JSON.parse(fs.readFileSync(path).toString());

        if(data.timeLeft + time < 0) data.timeLeft = 0;
        else if(maxTime > 0) {
            if(data.maxTime + time > maxTime) data.timeLeft = maxTime;
        }
        else data.timeLeft += time;

        fs.writeFileSync(path, JSON.stringify(data));
        return data.timeLeft;
    }
}
