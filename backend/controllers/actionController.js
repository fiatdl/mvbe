const fs = require('fs');
const path = require('path');
const users = JSON.parse(fs.readFileSync('./json-resources/users.json'));
const helperAPI = require('../modules/helperAPI');
const driveAPI = require('../modules/driveAPI');
const firebaseAPI = require('../modules/firebaseAPI');
const redirectAPI = require('../modules/redirectAPI');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
var FormData = require('form-data');

const User = require('../models/mongo/User');
const Log = require('../models/mongo/Log');
const Server = require('../models/mongo/Server');
const Video = require('../models/mongo/Video');

const fluentFfmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
fluentFfmpeg.setFfmpegPath(ffmpegPath);

const axios = require('axios');
const Playlist = require('../models/mongo/Playlist');
const VideoComment = require('../models/mongo/VideoComment');

exports.GetVideoByID = catchAsync(async (req, res, next) => {
  const videoID=req.params.videoID;
  if(!videoID){
    res.status(200).json({
    status:400,
    message:'Request body missing videoID'
    });
    return;
  }
  const video=await Video.findById(videoID);

  req.video=video;
next()

});

exports.CommentVideo = catchAsync(async (req, res, next) => {
  const user=req.user;
  const video=req.video;
  const content=req.body.content;
  const comment =await VideoComment.create({user,video,content})
  res.status(200).json({
    status:200,
    message:'Success comment to video',
    comment,
  });

});
exports.AddVideoToPlaylist = catchAsync(async (req, res, next) => {
  const userId=req.user;
  if(!req.body.playlistID){
    res.status(400).json({
      status:400,
      message:'PlaylistID is missing!'
    });
  }
  const playlist=await Playlist.findById(req.body.playlistID);
  const inforId=req.video;
  playlist.Infos.push(inforId);
  await playlist.save();
  res.status(200).json({
    status:200,
    message:'Success add video to playlist'
  });
});
exports.CreatePlaylist = catchAsync(async (req, res, next) => {
  const user=req.user;
  const playlistname=req.body.playlistname
  const playlist=await Playlist.create({user,playlistname});
  res.status(200).json({
    status:200,
    message:'Success create video playlist',
    playlist
  });
});

exports.GetUserAllPlaylist = catchAsync(async (req, res, next) => {
  const user=req.user;
  const playlistes=await Playlist.find({user:user._id})
  res.status(200).json({
    status:200,
    message:'Success get user playlist',
    playlistes,
  });
});

exports.GetAllVideoCommentWithID = catchAsync(async (req, res, next) => {
  const video=req.video;
  const videoComments=await VideoComment.find({video:video});
  res.status(200).json({
    status:200,
    message:'Success get video all comments',
    videoComments,
  });
});