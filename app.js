const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const indexRouter = require('./routes/index');
const twitchRouter = require('./routes/twitch');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/twitch', twitchRouter);

app.use((req, res, next) => {
  if(req.path.includes("timer")) res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  next();
});

module.exports.app = app;
