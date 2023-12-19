'use strict';
const express = require('express');
const morgan = require('morgan');
const app = express();
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const videoController = require('./controllers/videoController');
const redirectController = require('./controllers/redirectController');

const cors = require('cors');
var path = require('path');
const fs = require('fs');

// const client_posts = JSON.parse(fs.readFileSync('./json-resources/client_posts.json'));

//MIDDLEWARE
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
}
console.log(process.env.NODE_ENV);
app.use(express.json());
app.use(express.static('public'));

app.use(cors());

app.use((req, res, next) => {
  // res.setHeader('Access-Control-Allow-Origin', '*');
  // res.setHeader('Access-Control-Allow-Credentials', 'true');
  // res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
  // res.setHeader(
  //   'Access-Control-Allow-Headers',
  //   'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers'
  // );

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
//http://localhost:9000/videos/convert/無意識.m3u8
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.requestTime);
  //console.log(req.headers);
  req.url = decodeURIComponent(req.url);

  next();
});

// #region Handling extra requests, such as subtitle requests
app.get('/*.vtt', videoController.VTTHandler);
app.get('/*.ass', videoController.ASSHandler);
app.get('/*.srt', videoController.SRTHandler);
// app.get('/*.mp4', videoController.MP4MPDHandler);
// app.get('/*.mpd', videoController.MPDHandler);
// app.get('/*.m4s', redirectController.M4SHandler);

// #endregion

//ROUTES
const defaultRoute = require('./routes/defaultRoute');
const threadRouter = require('./routes/threadRoute');
const userRouter = require('./routes/userRoute');
const authRouter = require('./routes/authRoute');
const videoRouter = require('./routes/videoRoute');
const serverRouter = require('./routes/serverRoute');
const infoRouter = require('./routes/infoRoute');
const payRouter =require('./routes/payRouter');
const testRouter = require('./routes/testRoute');
const redirectRouter = require('./routes/redirectRoute');

const ratingRoute = require('./routes/rating.route');
const playlistRoute=require('./routes/playlist.route');
const commentRoute = require('./routes/comment.route');
app.use('/api/v1/', defaultRoute);
app.use('/api/v1/threads', threadRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/info', infoRouter);
app.use('/api/v1/video', videoRouter);
app.use('/api/v1/server', serverRouter);
app.use('/api/v1/comment', commentRoute);
app.use('/api/v1/playlist', playlistRoute);
app.use('/api/test', testRouter);
app.use('/redirect', redirectRouter);
app.use('/pay',payRouter);
app.use('/rating',ratingRoute);
app.use('/playlists',playlistRoute);
app.use('/comments',commentRoute);
app.all('*', (req, res, next) => {
  next(new AppError('Cant find ' + req.originalUrl + ' on the server', 404));
});
app.use(globalErrorHandler);
module.exports = app;
