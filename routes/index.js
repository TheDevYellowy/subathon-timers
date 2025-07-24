const express = require('express');
const router = express.Router();
const config = require("../config.json");
const fs = require("fs");

const twitchRedirect = `https://id.twitch.tv/oauth2/authorize?client_id=${config.twitch.id}&redirect_uri=${encodeURIComponent(config.twitch.redirect_url)}&response_type=code&scope=${encodeURIComponent("")}`;

/* GET home page. */
router.get('/', function(req, res) {
  let username = req.cookies.username;
  if(username === undefined) return res.redirect(twitchRedirect);
  else return res.redirect("/dashboard");
});

router.get("/dashboard", function(req, res) {
  let username = req.cookies.username;
  let secret = req.cookies.secret;
  if(username === undefined || secret === undefined) return res.redirect(twitchRedirect);

  const path = `${process.cwd()}/data/${username}.json`
  if(!fs.existsSync(path)) res.redirect(twitchRedirect);

  let data = JSON.parse(fs.readFileSync(path).toString());
  if(data.secret !== req.cookies.secret) return res.status(401).json("Secret mismatch");

  res.render("dashboard", {
    data
  });
})

router.get("/timer/:secret", (req, res) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.render("timer");
})

router.post("/dashboard", function(req, _res) {
  const data = req.body;
  const old = JSON.parse(fs.readFileSync(`${process.cwd()}/data/${req.cookies.username}.json`).toString());
  fs.writeFileSync(`${process.cwd()}/data/${req.cookies.username}.json`, JSON.stringify({...old, ...data}));

  _res.sendStatus(200);
});

module.exports = router;
