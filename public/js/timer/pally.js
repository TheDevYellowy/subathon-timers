function start(token) {
    pally = new WebSocket(`wss://events.pally.gg?channel=firehose&auth=${token}`);
    let interval = null;

    pally.onopen = () => {
        interval = setInterval(() => {
            pally.send("ping");
        }, 50000);
        pally.send("ping");
    }

    pally.onclose = () => {
        clearInterval(interval);
        start(token);
    }

    pally.onmessage = (event) => {
        console.log(`[pally] ${event.data}`);
        if(event.data === "pong") return;

        const info = JSON.parse(event.data).payload;
        const payload = info.payload;
        const page = payload.page;
        if(page !== pallySlug) return;

        const amount = payload.campaignTip.netAmountInCents / 100;

        if(info.type.toLowerCase() !== "campaigntip.notify") return;
        addTime(amount * times.gift);
    }

    window.onbeforeunload = () => {
        pally.close();
    }
}