function start(name) {
    const client = new tmi.Client({
        connection: {
            reconnect: true,
            secure: true
        },
        channels: [name]
    });

    client.connect().then(() => {
        console.log(`Connected to ${name}`);
    }).catch(e => {
        console.log(e);
    });

    const prefix = "!";
    client.on("chat", (channel, user, msg) => {
        if(!user.mod && !user.badges["broadcaster"] && !(user.login === "yellowyttv")) return;
        if(!msg.startsWith(prefix)) return;

        const args = msg.slice(typeof prefix == "string" ? prefix.length : 0)
            .trim()
            .split(/ +/g);
        const command = args.shift().toLowerCase();

        switch (command) {
            case "addtime": {
                let total = 0;

                args.map(a => a.toLowerCase()).forEach(a => {
                    if(a.endsWith("s")) {
                        total += Number(a.slice(0, a.indexOf('s')));
                    } else if(a.endsWith("m")) {
                        total += Number(a.slice(0, a.indexOf('m'))) * 60;
                    } else if(a.endsWith("h")) {
                        total += Number(a.slice(0, a.indexOf('h'))) * 60 * 60;
                    }
                });

                ws.send(JSON.stringify({
                    event: "addtime",
                    time: total,
                }));
                break;
            }
            case "settime": {
                let total = 0;

                args.map(a => a.toLowerCase()).forEach(a => {
                    if(a.endsWith("s")) {
                        total += Number(a.slice(0, a.indexOf('s')));
                    } else if(a.endsWith("m")) {
                        total += Number(a.slice(0, a.indexOf('m'))) * 60;
                    } else if(a.endsWith("h")) {
                        total += Number(a.slice(0, a.indexOf('h'))) * 60 * 60;
                    }
                });

                ws.send(JSON.stringify({
                    event: "settime",
                    time: total*1000,
                }));
                break;
            }
            default: {
                ws.send(JSON.stringify({
                    event: command
                }));
                break;
            }
        }
    });

    client.on('subscription', (channel, username, methods, message, userstate) => {
        switch (methods['plan']) {
            case "Prime":
                addTime(times.tier1);
                break;
            case "1000":
                addTime(times.tier1);
                break;
            case "2000":
                addTime(times.tier2);
                break;
            case "3000":
                addTime(times.tier3);
                break;
        }
    });

    client.on('resub', (channel, username, months, message, userstate, methods) => {
        switch (methods['plan']) {
            case "Prime":
                addTime(times.tier1);
                break;
            case "1000":
                addTime(times.tier1);
                break;
            case "2000":
                addTime(times.tier2);
                break;
            case "3000":
                addTime(times.tier3);
                break;
        }
    });

    client.on('subgift', (channel, username, months, recipient, methods, userstate) => {
        switch (methods['plan']) {
            case "Prime":
                addTime(times.tier1);
                break;
            case "1000":
                addTime(times.tier1);
                break;
            case "2000":
                addTime(times.tier2);
                break;
            case "3000":
                addTime(times.tier3);
                break;
        }
    });

    client.on('cheer', (channel, userstate, message) => {
        if (userstate.bits >= bits.min) {
            let times = Math.floor(userstate.bits/bits.min);
            addTime(bits.per * times);
        }
    });
}