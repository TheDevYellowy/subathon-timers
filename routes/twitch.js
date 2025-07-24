const express = require("express");
const router = express.Router();
const config = require("../config.json");
const crypto = require("node:crypto");
const fs = require("fs");

router.get("/cb", (req, res) => {
    if(!req.query.code) return res.redirect("/");

    const params = new URLSearchParams();
    params.set("client_id", config.twitch.id);
    params.set("client_secret", config.twitch.secret);
    params.set("code", req.query.code);
    params.set("grant_type", "authorization_code");
    params.set("redirect_uri", config.twitch.redirect_url);

    fetch("https://id.twitch.tv/oauth2/token", {
        method: "POST",
        headers: {
            "content-type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
    }).then(async resp => {
        if(!resp.ok) return res.redirect("/");
        const { access_token } = await resp.json();

        const userReq = await fetch("https://api.twitch.tv/helix/users", {
            method: "GET",
            headers: {
                "client-id": config.twitch.id,
                "Authorization": `Bearer ${access_token}`
            }
        });

        if(userReq.ok) {
            const { data } = await userReq.json();
            const username = data[0].login;
            const path = `${process.cwd()}/data/${username}.json`;
            const lookup = `${process.cwd()}/data/reverse_lookup.json`;
            let secret = generateSecret();

            const base = {
                secret: secret,
                pallySlug: "",
                apiToken: "",
                streamElementsToken: "",
                timeLeft: 0,
                initialTime: {
                    hours: 12,
                    minutes: 0,
                    seconds: 0
                },
                maxTime: {
                    hours: 0,
                    minutes: 0,
                    seconds: 0
                },
                times: {
                    tier1: 5*60,
                    tier2: 10*60,
                    tier3: 15*60,
                    gift: 5*60
                },
                bits: {
                    min: 100,
                    per: 2*60,
                },
                timer: {
                    backgroundColor: "#ffffff",
                    shadowColor: "#3b3b3b",
                    textColor: "#000000"
                }
            }

            if(!fs.existsSync(path)) {
                const ldata = JSON.parse(fs.readFileSync(lookup).toString());
                while (ldata[secret] !== undefined) {
                    base.secret = secret = generateSecret();
                }

                ldata[base.secret] = username;
                fs.writeFileSync(path, JSON.stringify(base));
                fs.writeFileSync(lookup, JSON.stringify(ldata));
            }
            else {
                const data = JSON.parse(fs.readFileSync(path).toString())
                secret = data.secret;

                fs.writeFileSync(path, JSON.stringify({...base, ...data}));
            }

            res.cookie("username", username);
            res.cookie("secret", secret);

            if(!req.query.state) return res.redirect("/dashboard");
            else return res.redirect(`/${req.query.state}`);
        } else {
            console.error(await userReq.text());
        }
    })
});

function generateSecret() {
    let secret = "";
    const available = "abcdefghijklmnopqrstuvwxyz123456789-";
    for(let i = 0; i < 16; i++) {
        let upper = Math.round(Math.random()) === 1;
        let ind = getRanNum(available.length);
        secret += upper ? available[ind].toUpperCase() : available[ind].toLowerCase();
    }

    return secret;
}

function getRanNum(max) {
    let numBits = Math.ceil(Math.log2(max));
    let maxIntVal = Math.pow(2, 32);
    let randomNum;

    const arrLen = Math.ceil(numBits / 32);
    const ranBits = new Uint32Array(arrLen);

    do {
        crypto.getRandomValues(ranBits);
        randomNum = ranBits.reduce((a, b, i) => {
            return a + (b * Math.pow(maxIntVal, i));
        }, 0);
    } while (randomNum >= maxIntVal - (maxIntVal % (max)));

    return randomNum % (max);
}

module.exports = router;