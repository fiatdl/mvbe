import React, { useContext, useEffect, useState, useRef } from 'react';

import { useParams, useNavigate } from 'react-router-dom';
import SubtitlesOctopus from '../components/subtitles/subtitles-octopus';
import videojs from 'video.js';
import toWebVTT from 'srt-webvtt';
import Card from '../components/UI elements/Card';
import Hls from 'hls.js';
import {
  POSTVideoUploadAction,
  POSTThreadAction,
  POSTLargeVideoUploadAction,
  POSTLargeVideoMultipartUploadHlsAction,
  POSTLargeVideoMultipartUploadDashAction,
  POSTLargeVideoMultipartUploadConcatenateAction,
  OPTIONSLargeVideoMultipartUploadAction,
  OPTIONSLargeVideoMultipartUploadConcatenateAction,
} from '../APIs/thread-apis';
import Button from '../components/UI elements/Button';

import Utils from '../Utils';

import '../styles/ThreadPage.css';
const play = {
  fill: true,
  fluid: true,
  autoplay: true,
  controls: true,
  preload: 'metadata',
  loop: true,
  sources: [
    {
      // src: "/videos/convert/7.m3u8",
      src: '',
      type: 'application/x-mpegURL',
    },
  ],
};

const chunkFormData = (chunk, chunkIndex, chunkName, arrayChunkName, filename, ext) => {
  const formData = new FormData();
  formData.append('myMultilPartFileChunk', chunk);
  formData.append('myMultilPartFileChunkIndex', chunkIndex);
  formData.append('arraychunkname', arrayChunkName);

  // formData.append('type', 'blob');
  // formData.append('index', chunkIndex);
  // formData.append('chunkname', chunkName);
  // formData.append('filename', filename);
  // formData.append('arrayChunkName', arrayChunkName);
  // formData.append('ext', ext);

  return formData;
};

async function uploadChunkHls(chunk, chunkIndex, chunkName, arrayChunkName, filename, ext,title,infoID) {
  try {
    const formData = chunkFormData(chunk, chunkIndex, chunkName, arrayChunkName, filename, ext);
    console.log(arrayChunkName);
    const responseHls = await POSTLargeVideoMultipartUploadHlsAction(
      formData,
      chunkIndex,
      chunkName,
      arrayChunkName,
      filename,
      ext,
      title,
      infoID,
    );
    console.log(responseHls);

  } catch (error) {
    console.log(error);
  }
}

async function uploadChunkDash(chunk, chunkIndex, chunkName, arrayChunkName, filename, ext,title,infoID) {
  try {
    const formData = chunkFormData(chunk, chunkIndex, chunkName, arrayChunkName, filename, ext);
    console.log(arrayChunkName);
    const responseDash = await POSTLargeVideoMultipartUploadDashAction(
      formData,
      chunkIndex,
      chunkName,
      arrayChunkName,
      filename,
      ext,
      title,
      infoID,
    );
    console.log(responseDash);
  } catch (error) {
    console.log(error);
  }
}

const loadSubtitleRed5 = async (player, VideoJS_player) => {
  try {
    console.log(player);
    const video = player.current;
    const subASSResponse = await fetch('http://localhost:5080/oflaDemo/ハルジオン.ass', {
      method: 'GET',
    });
    const subSRTResponse = await fetch('http://localhost:5080/oflaDemo/ハルジオン.srt', {
      method: 'GET',
    });
    if (subSRTResponse.status != 500) {
      //oke, cho đến hiện tại chỉ có libass là hỗ trợ hiển thị sub ass thôi, còn srt chả thấy thư viện hay gói nào hỗ trợ hết.
      //nếu người dùng bất đắc dĩ đăng file sub srt thì theo quy trình sau:
      //server nhận SRT , dùng ffmpeg để tổng hợp từ file sub srt và video ra thành hls kèm sub
      console.log(subSRTResponse);
      // const srtSub = await subSRTResponse.text();
      // console.log(srtSub);
      const vtt = await subSRTResponse.blob();
      console.log(vtt);
      const WebVTT_sutitle = await toWebVTT(vtt); // this function accepts a parameer of SRT subtitle blob/file object
      // cái trên là lấy 1
      console.log(WebVTT_sutitle);

      // const localURL = await URL.createObjectURL(vtt);
      VideoJS_player.addRemoteTextTrack({ src: WebVTT_sutitle, kind: 'subtitles', label: 'Vietnamese' }, false);
      // ayda, ngộ là ngộ hiểu rồi nha, be stream file srt về response cho fe, fe chuyển stream nhận đc thành 1 obj blob
      // Dùng obj blob đó cùng phương thức toWebVTT thành blob nguồn(src) cho _player videojs blob:http://localhost:3000/xxxxx-xxx-xxxxxxx-xxxxxxx
    }

    // nếu để ASS ở dưới thì ưu tiên ASS hơn, sẽ tìm cách xét độ ưu tiên sau
    if (subASSResponse.status != 500) {
      var options = {
        video: video, // HTML5 video element
        subUrl: 'http://localhost:5080/oflaDemo/ハルジオン.ass', // Link to subtitles
        // fonts: ['/test/font-1.ttf', '/test/font-2.ttf'], // Links to fonts (not required, default font already included in build)
        fonts: ['/Arial.ttf', '/TimesNewRoman.ttf'],
        workerUrl: process.env.PUBLIC_URL + '/subtitles-octopus-worker.js', // Link to WebAssembly-based file "libassjs-worker.js"
        legacyWorkerUrl: process.env.PUBLIC_URL + '/subtitles-octopus-worker.js', // Link to non-WebAssembly worker
      };
      const SubtitlesOctopus_subtitle = new SubtitlesOctopus(options);
      console.log(SubtitlesOctopus_subtitle);
    }
  } catch (error) {
    console.log(error);
  }
};
const loadSubtitle = async (player, VideoJS_player, videoname) => {
  try {
    console.log(player);
    const video = player.current;
    const subASSResponse = await fetch('/videos/' + videoname + '.ass', {
      method: 'GET',
    });
    const subSRTResponse = await fetch('/videos/' + videoname + '.srt', {
      method: 'GET',
    });
    if (subSRTResponse.status != 500) {
      //oke, cho đến hiện tại chỉ có libass là hỗ trợ hiển thị sub ass thôi, còn srt chả thấy thư viện hay gói nào hỗ trợ hết.
      //nếu người dùng bất đắc dĩ đăng file sub srt thì theo quy trình sau:
      //server nhận SRT , dùng ffmpeg để tổng hợp từ file sub srt và video ra thành hls kèm sub
      console.log(subSRTResponse);
      // const srtSub = await subSRTResponse.text();
      // console.log(srtSub);
      const vtt = await subSRTResponse.blob();
      console.log(vtt);
      const WebVTT_sutitle = await toWebVTT(vtt); // this function accepts a parameer of SRT subtitle blob/file object
      // cái trên là lấy 1
      console.log(WebVTT_sutitle);

      // const localURL = await URL.createObjectURL(vtt);
      VideoJS_player.addRemoteTextTrack({ src: WebVTT_sutitle, kind: 'subtitles', label: 'Vietnamese' }, false);
      // ayda, ngộ là ngộ hiểu rồi nha, be stream file srt về response cho fe, fe chuyển stream nhận đc thành 1 obj blob
      // Dùng obj blob đó cùng phương thức toWebVTT thành blob nguồn(src) cho _player videojs blob:http://localhost:3000/xxxxx-xxx-xxxxxxx-xxxxxxx
    }

    // nếu để ASS ở dưới thì ưu tiên ASS hơn, sẽ tìm cách xét độ ưu tiên sau
    if (subASSResponse.status != 500) {
      var options = {
        video: video, // HTML5 video element
        subUrl: '/videos/' + videoname + '.ass', // Link to subtitles
        // fonts: ['/test/font-1.ttf', '/test/font-2.ttf'], // Links to fonts (not required, default font already included in build)
        fonts: ['/Arial.ttf', '/TimesNewRoman.ttf'],
        workerUrl: process.env.PUBLIC_URL + '/subtitles-octopus-worker.js', // Link to WebAssembly-based file "libassjs-worker.js"
        legacyWorkerUrl: process.env.PUBLIC_URL + '/subtitles-octopus-worker.js', // Link to non-WebAssembly worker
      };
      const SubtitlesOctopus_subtitle = new SubtitlesOctopus(options);
      console.log(SubtitlesOctopus_subtitle);
    }
  } catch (error) {
    console.log(error);
  }
};

const VideoPageVer2 = () => {
  const params = useParams();
  const threadVideoRef = useRef();
  const videoNode = useRef(null);
  const [player, setPlayer] = useState(null);
  const [play_source, setPlaySource] = useState(null);
  const [threadVideo, setThreadVideo] = useState(null);

  const CreateNewThreadHandler = async () => {
    try {
      console.log('press create new thread btn');
      const file = threadVideo;
      const chunkSize = 30 * 1024 * 1024; // Set the desired chunk size (30MB in this example)
      const totalChunks = Math.ceil(file.size / chunkSize);

      // let chunkNameHls = Utils.RandomString(7);
      // let arrayChunkNameHls = [];
      // for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      //   arrayChunkNameHls.push(chunkNameHls + '_' + chunkIndex);
      // }

      // // Iterate over the chunks and upload them sequentially
      // for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      //   const start = chunkIndex * chunkSize;
      //   const end = Math.min(start + chunkSize, file.size);
      //   const chunk = file.slice(start, end);
      //   console.log(start);
      //   console.log(end);
      //   // Make an API call to upload the chunk to the backend
      //   const ext = file.name.split('.')[1];
      //   await uploadChunkHls(chunk, chunkIndex, arrayChunkNameHls[chunkIndex], arrayChunkNameHls, chunkNameHls, ext);
      // }

      let chunkName = Utils.RandomString(7);
      let arrayChunkName = [];
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        arrayChunkName.push(chunkName + '_' + chunkIndex);
      }

      // // Iterate over the chunks and upload them sequentially
      // for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      //   const start = chunkIndex * chunkSize;
      //   const end = Math.min(start + chunkSize, file.size);
      //   const chunk = file.slice(start, end);
      //   console.log(start);
      //   console.log(end);
      //   // Make an API call to upload the chunk to the backend
      //   const ext = file.name.split('.')[1];

      //   await uploadChunkHls(chunk, chunkIndex, arrayChunkName[chunkIndex], arrayChunkName, chunkName, ext);
      // }

      var chunkIndex = 0;
      async function uploadLoop() {
        //  create a loop function
        setTimeout(async function () {
          //  call a 3s setTimeout when the loop is called
          console.log('looping'); //  your code here

          const start = chunkIndex * chunkSize;
          const end = Math.min(start + chunkSize, file.size);
          const chunk = file.slice(start, end);
          console.log(start);
          console.log(end);
          // Make an API call to upload the chunk to the backend
          const ext = file.name.split('.')[1];
          const title=chunkName;
          const infoID="654ef92c9f7e923ef27cf32c";
          await uploadChunkHls(chunk, chunkIndex, arrayChunkName[chunkIndex], arrayChunkName, chunkName, ext,title, infoID);
          // await uploadChunkDash(chunk, chunkIndex, arrayChunkName[chunkIndex], arrayChunkName, chunkName, ext, title, infoID);

          chunkIndex++; //  increment the counter
          if (chunkIndex < totalChunks) {
            //  if the counter < totalChunks, call the loop function
            uploadLoop(); //  ..  again which will trigger another
          } //  ..  setTimeout()
        }, 500);
      }
      uploadLoop();
      // const formData = new FormData();
      // formData.append('myMultilPartFile', threadVideo);
      // const response = await POSTLargeVideoMultipartUploadAction(formData);
      // console.log(response);
    } catch (error) {
      console.log(error);
    }
  };
  const VideoChangeHandler = async (event) => {
    if (event.target.files.length > 0) {
      const localURL = await URL.createObjectURL(event.target.files[0]);
      setThreadVideo(event.target.files[0]);
      console.log(event.target.files[0]);
    }
  };

  useEffect(() => {
    const CheckVideoAndEncode = async () => {
      const response = await fetch('/api/v1/video/video-proc/convert-stream/' + params.videoname, {
        method: 'GET',
        headers: {
          // 'Content-Type': 'application/json',
          // Authorization: storedToken,
        },
      });
      const data = await response.json();
      if (data.status) {
        if (data.status === 'found and converted') {
          setPlaySource((prevState) => {
            return {
              fill: true,
              fluid: true,
              autoplay: true,
              controls: true,
              preload: 'metadata',
              loop: true,
              sources: [
                {
                  src: data.path,
                  type: 'application/x-mpegURL',
                },
              ],
            };
          });
        }
      }
    };
    const LoadVideo = async () => {
      try {
        var obj_play;
        let url = '';

        const config = {
          startPosition: 0, // can be any number you want
        };

        if (params.videoname === 'bbb') {
          obj_play = {
            fill: true,
            fluid: true,
            autoplay: true,
            controls: true,
            preload: 'auto',
            loop: true,
            sources: [
              {
                src: 'http://192.168.140.104/tmp/hls/bbb.m3u8',
                type: 'application/x-mpegURL',
                // withCredentials: true,

                // type:'video/flv',
              },
            ],
            // liveui: true,
            // techorder : ["flash","html5"],
          };
        } else if (params.videoname === 'aa') {
          obj_play = {
            fill: true,
            fluid: true,
            autoplay: true,
            controls: true,
            preload: 'auto',
            loop: true,
            sources: [
              {
                src: 'http://192.168.140.104/tmp/hls/aa.m3u8',
                type: 'application/x-mpegURL',
                // withCredentials: true,

                // type:'video/flv',
              },
            ],
            // liveui: true,
            // techorder : ["flash","html5"],
          };
        } else if (params.videoname === 'bb') {
          obj_play = {
            fill: true,
            fluid: true,
            autoplay: true,
            controls: true,
            preload: 'auto',
            loop: true,
            //HLS lo tất
            sources: [
              {
                src: 'http://192.168.140.104/tmp/hls/bb.m3u8',
                type: 'application/x-mpegURL',
                // withCredentials: true,

                // type:'video/flv',
              },
            ],
            // liveui: true,
            // techorder : ["flash","html5"],
          };
        } else if (params.videoname === 'bbbb') {
          obj_play = {
            fill: true,
            fluid: true,
            autoplay: true,
            controls: true,
            preload: 'auto',
            loop: true,
            //HLS lo tất
            // sources: [
            //   {
            //     src: 'http://192.168.140.104/tmp/hls/bb.m3u8',
            //     type: 'application/x-mpegURL',
            //     // withCredentials: true,

            //     // type:'video/flv',
            //   },
            // ],
            // liveui: true,
            // techorder : ["flash","html5"],
          };
          url = 'http://192.168.140.104/tmp/prep/convert/bbbb.m3u8';
          const hls = new Hls(config);
          hls.loadSource(url);
          hls.attachMedia(videoNode.current);
          hls.subtitleDisplay = true;
        } else if (params.videoname === 'cc') {
          obj_play = {
            fill: true,
            fluid: true,
            autoplay: true,
            controls: true,
            preload: 'auto',
            loop: true,
            sources: [
              {
                src: 'http://192.168.140.104/tmp/hls/cc.m3u8',
                type: 'application/x-mpegURL',
                // withCredentials: true,

                // type:'video/flv',
              },
            ],
            // liveui: true,
            // techorder : ["flash","html5"],
          };
        } else if (params.videoname === 'dd') {
          obj_play = {
            fill: true,
            fluid: true,
            autoplay: true,
            controls: true,
            preload: 'auto',
            loop: true,
            sources: [
              {
                src: 'http://192.168.140.104/tmp/hls/dd.m3u8',
                type: 'application/x-mpegURL',
                // withCredentials: true,

                // type:'video/flv',
              },
            ],
            // liveui: true,
            // techorder : ["flash","html5"],
          };
        } else if (params.videoname === 'ee') {
          obj_play = {
            fill: true,
            fluid: true,
            autoplay: true,
            controls: true,
            preload: 'auto',
            loop: true,
            sources: [
              {
                src: 'http://192.168.140.104/tmp/hls/ee.m3u8',
                type: 'application/x-mpegURL',
                // withCredentials: true,

                // type:'video/flv',
              },
            ],
            // liveui: true,
            // techorder : ["flash","html5"],
          };
        } else if (params.videoname === 'stein') {
          obj_play = {
            fill: true,
            fluid: true,
            autoplay: true,
            controls: true,
            preload: 'auto',
            loop: true,
            sources: [
              {
                src: 'http://192.168.140.104/stein.m3u8',
                type: 'application/x-mpegURL',
                // withCredentials: true,

                // type:'video/flv',
              },
            ],
            // liveui: true,
            // techorder : ["flash","html5"],
          };
        } else if (params.videoname === 'ハルジオン-Red5-mp4') {
          url = 'http://localhost:5080/oflaDemo/ハルジオン.mp4';

          obj_play = {
            fill: true,
            fluid: true,
            autoplay: true,
            controls: true,
            preload: 'auto',
            loop: true,
            sources: [
              {
                src: url,
              },
            ],
          };
        } else if (params.videoname === 'ハルジオン-Red5-m3u8') {
          obj_play = {
            fill: true,
            fluid: true,
            autoplay: true,
            controls: true,
            preload: 'auto',
            loop: true,
          };
          url = 'http://localhost:5080/oflaDemo/convert/ハルジオン.m3u8';
          const hls = new Hls(config);
          hls.loadSource(url);
          hls.attachMedia(videoNode.current);
          hls.subtitleDisplay = true;
        } else {
          const response = await fetch('/api/v1/video/video-proc/convert-stream/' + params.videoname, {
            method: 'GET',
            headers: {
              // 'Content-Type': 'application/json',
              // Authorization: storedToken,
            },
          });
          const data = await response.json();
          console.log(data);
          if (data.status) {
            if (data.status === 'found and converted') {
              let url = data.path;
              obj_play = {
                fill: true,
                fluid: true,
                autoplay: true,
                controls: true,
                preload: 'auto',
                loop: true,
                sources: [
                  // {
                  //   src: data.path,
                  //   type: 'application/x-mpegURL',
                  //   withCredentials: true,
                  // },
                ],
              };

              const hls = new Hls(config);
              hls.loadSource(url);
              hls.attachMedia(videoNode.current);
              hls.subtitleDisplay = true;
            } else {
            }
          }
        }

        const _player = videojs(videoNode.current, obj_play, function onPlayerReady() {
          videojs.log('Your player is ready!');

          // In this context, `this` is the player that was created by Video.js.
          this.play();

          // volume scale 0 - 1
          const defaultVolume = 0.4;
          this.volume(defaultVolume);

          // How about an event listener?
          this.on('ended', function () {
            videojs.log('Awww...over so soon?!');
          });
        });
        console.log(_player);

        // _player.on('xhr-hooks-ready', () => {
        //   const playerRequestHook = (options) => {
        //     options.beforeSend = (xhr) => {
        //       xhr.setRequestHeader('foo', 'bar');
        //     };
        //     console.log(options)
        //     return options;
        //   };
        //   _player.tech().vhs.xhr.onResponse(playerRequestHook);
        // });

        if (params.videoname === 'ハルジオン-Red5-m3u8') {
          loadSubtitleRed5(videoNode, _player);
        } else if (params.videoname === 'ハルジオン-Red5-mp4') {
          loadSubtitleRed5(videoNode, _player);
        } else {
          loadSubtitle(videoNode, _player, params.videoname);
        }
      } catch (error) {
        console.log(error);
      }
    };
    //CheckVideoAndEncode();
    LoadVideo();
  }, []);

  return (
    <React.Fragment>
      <Card className="thread-page__thread">
        <video id="my-player" ref={videoNode} className="video-js"></video>
      </Card>
      <input ref={threadVideoRef} type="file" accept="video/*|mkv/*.mkv" onChange={VideoChangeHandler} />
      <Button className="workshop-new-thread-tab__complete-btn" content="Upload" onClick={CreateNewThreadHandler} />
    </React.Fragment>
  );
};

export default VideoPageVer2;
