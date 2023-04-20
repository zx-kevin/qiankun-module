/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2013-2021 Winlin
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import request from '@/utils/request_chat.js'
import useAppStore from '@/store/modules/app.js'
const AppStore = useAppStore()
import $ from 'jquery'
  ; ('use strict')
var contain = {
  publish: {
    pc: null,
    stream: null,
  },
  player: [],
},
  playstreams = {}
// Depends on adapter-7.4.0.min.js from https://github.com/webrtc/adapter
// Async-awat-prmise based SRS RTC Publisher.
export function SrsRtcPublisherAsync (recordType = '') {
  var self = {}
  // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
  let constraints = {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
    },
    video: {
      width: { ideal: 320, max: 576 },
      facingMode: 'user',
    },
  }
  let srceen = {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
    },
    // 屏幕分享
    video: {
      width: 1920,
      height: 1080,
      frameRate: {
        ideal: 30,
        max: 150,
      },
    },
  }
  self.constraints = recordType ? srceen : constraints
  console.log(self.constraints, '<= constraints')
  // @see https://github.com/rtcdn/rtcdn-draft
  // @url The WebRTC url to play with, for example:
  //      webrtc://r.ossrs.net/live/livestream
  // or specifies the API port:
  //      webrtc://r.ossrs.net:11985/live/livestream
  // or autostart the publish:
  //      webrtc://r.ossrs.net/live/livestream?autostart=true
  // or change the app from live to myapp:
  //      webrtc://r.ossrs.net:11985/myapp/livestream
  // or change the stream from livestream to mystream:
  //      webrtc://r.ossrs.net:11985/live/mystream
  // or set the api server to myapi.domain.com:
  //      webrtc://myapi.domain.com/live/livestream
  // or set the candidate(ip) of answer:
  //      webrtc://r.ossrs.net/live/livestream?eip=39.107.238.185
  // or force to access https API:
  //      webrtc://r.ossrs.net/live/livestream?schema=https
  // or use plaintext, without SRTP:
  //      webrtc://r.ossrs.net/live/livestream?encrypt=false
  // or any other information, will pass-by in the query:
  //      webrtc://r.ossrs.net/live/livestream?vhost=xxx
  //      webrtc://r.ossrs.net/live/livestream?token=xxx
  // console.log('%c视频分享', 'color: #f00; font-size: 20px;', recordType);
  let mergeTracks = (baseStrem, extraStream) => {
    if (!baseStrem.getAudioTracks().length) {
      baseStrem.addTrack(extraStream.getAudioTracks()[0])
      return baseStrem
    }
    var context = new AudioContext()
    var baseSource = context.createMediaStreamSource(baseStrem)
    var extraSource = context.createMediaStreamSource(extraStream)
    var dest = context.createMediaStreamDestination()

    var baseGain = context.createGain()
    var extraGain = context.createGain()
    baseGain.gain.value = 0.8
    extraGain.gain.value = 0.8

    baseSource.connect(baseGain).connect(dest)
    extraSource.connect(extraGain).connect(dest)

    return new MediaStream([baseStrem.getVideoTracks()[0], dest.stream.getAudioTracks()[0]])
  }
  self.publish = async function (url) {
    var stream = null
    console.log('SrsRtcPublisherAsync => publish_url', url)
    var conf = self.__internal.prepareUrl(url)
    self.pc.addTransceiver('audio', { direction: 'sendonly' })
    self.pc.addTransceiver('video', { direction: 'sendonly' })

    var getMediaMethod = recordType ? 'getDisplayMedia' : 'getUserMedia'
    try {
      await navigator.mediaDevices[getMediaMethod](self.constraints).then(mediaStream => {
        console.log(getMediaMethod, '<= 哪种视频流')
        console.log('%c视频类型=>', 'color:green;', mediaStream)
        stream = mediaStream
      })
      // var getUserMedia = (navigator.mediaDevices.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
      // var stream = await getUserMedia.call(navigator, self.constraints);
    } catch (error) {
      // window.alert(
      //   'Tips:麦克风和摄像头未允许或不支持，请授予权限或切换浏览器。'
      // )
      console.error('get device failed', error)
      return { tips: true }
    }

    // @see https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addStream#Migrating_to_addTrack
    stream.getTracks().forEach(function (track) {
      self.pc.addTrack(track)

      // Notify about local track when stream is ok.
      self.ontrack && self.ontrack({ track: track })
    })
    if (getMediaMethod === 'getDisplayMedia') {
      $.each(playstreams, function (index, obj) {
        obj.getAudioTracks().forEach(function (audioTrack) {
          // srsPublisher.pc.addTrack(audioTrack);
          // srsPublisher.stream.addTrack(audioTrack);

          contain.player.push(new MediaStream([stream.getVideoTracks()[0], audioTrack]))
        })
      })
      // console.log(getMediaMethod, 'getAudioTracks', contain.player)
      contain.player.map(item => {
        self.stream = mergeTracks(self.stream, item)
      })
    }
    var offer = await self.pc.createOffer()
    await self.pc.setLocalDescription(offer)
    var session = await new Promise(function (resolve, reject) {
      // @see https://github.com/rtcdn/rtcdn-draft
      var data_ = {
        api: conf.apiUrl,
        tid: conf.tid,
        streamurl: conf.streamUrl,
        clientip: null,
        sdp: offer.sdp,
      }
      console.log('Generated offer: ', conf)

      request({
        method: 'post',
        url: conf.apiUrl,
        data: JSON.stringify(data_),
      }).then(res => {
        // console.log(res);
        resolve(res)
      }).catch(res => {
        resolve(res)
        stream = false
        console.error(res);
      })
      // .then(function (data) {
      //   console.log('%c本人Got answer: ', 'color: red; font-size:14px;', data)
      //   if (data.code) {
      //     reject(data)
      //     return
      //   }

      //   resolve(data)
      // })
      // .fail(function (reason) {
      //   reject(reason)
      // })
    })
    await self.pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: session.sdp }))
    session.simulator = `${conf.schema}//${conf.urlObject.server}${conf.port ? ':' + conf.port : conf.port}/rtc/v1/nack/`

    return { session, stream }
  }

  // Close the publisher.
  self.close = function () {
    self.pc && self.pc.close()
    self.pc = null
  }

  // The callback when got local stream.
  // @see https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addStream#Migrating_to_addTrack
  self.ontrack = function (event) {
    // Add track to stream of SDK.
    self.stream.addTrack(event.track)
  }

  // Internal APIs.
  self.__internal = {
    defaultPath: '/rtc/v1/publish/',
    prepareUrl: function (webrtcUrl) {
      var urlObject = self.__internal.parse(webrtcUrl)

      // If user specifies the schema, use it as API schema.
      var schema = urlObject.user_query.schema
      schema = schema ? schema + ':' : window.location.protocol

      var port = urlObject.port || 1985
      if (schema === 'https:') {
        port = urlObject.port || 443
      }

      // @see https://github.com/rtcdn/rtcdn-draft
      var api = urlObject.user_query.play || self.__internal.defaultPath
      if (api.lastIndexOf('/') !== api.length - 1) {
        api += '/'
      }
      console.log(import.meta.env.VITE_APP_ENV)
      var apiUrl = ''
      if (import.meta.env.VITE_APP_ENV === 'development') {
        apiUrl = `${schema}//${urlObject.server}${port ? ':' + port : port}${api}`//暂不需要端口号 
      } else {
        let { videoDomain } = AppStore.doMain;
        apiUrl = `${videoDomain}${api}`
      }

      for (var key in urlObject.user_query) {
        if (key !== 'api' && key !== 'play') {
          apiUrl += '&' + key + '=' + urlObject.user_query[key]
        }
      }
      console.log(apiUrl, 'apiUrlapiUrlapiUrl')
      // Replace /rtc/v1/play/&k=v to /rtc/v1/play/?k=v
      var apiUrl = apiUrl.replace(api + '&', api + '?')

      var streamUrl = urlObject.url

      return {
        apiUrl: apiUrl,
        streamUrl: streamUrl,
        schema: schema,
        urlObject: urlObject,
        port: port,
        tid: Number(parseInt(new Date().getTime() * Math.random() * 100))
          .toString(16)
          .slice(0, 7),
      }
    },
    parse: function (url) {
      // @see: http://stackoverflow.com/questions/10469575/how-to-use-location-object-to-parse-url-without-redirecting-the-page-in-javascri
      var a = document.createElement('a')
      a.href = url.replace('rtmp://', 'http://').replace('webrtc://', 'http://').replace('rtc://', 'http://')
      let server = url.replace('rtmp://', 'http://').replace('webrtc://', 'http://').replace('rtc://', 'http://')
      console.dir(url)
      console.log("server", server.split('/')[0])
      var vhost = a.hostname
      var app = a.pathname.substring(1, a.pathname.lastIndexOf('/'))
      var stream = a.pathname.slice(a.pathname.lastIndexOf('/') + 1)

      // parse the vhost in the params of app, that srs supports.
      app = app.replace('...vhost...', '?vhost=')
      if (app.indexOf('?') >= 0) {
        var params = app.slice(app.indexOf('?'))
        app = app.slice(0, app.indexOf('?'))

        if (params.indexOf('vhost=') > 0) {
          vhost = params.slice(params.indexOf('vhost=') + 'vhost='.length)
          if (vhost.indexOf('&') > 0) {
            vhost = vhost.slice(0, vhost.indexOf('&'))
          }
        }
      }

      // when vhost equals to server, and server is ip,
      // the vhost is __defaultVhost__
      if (a.hostname === vhost) {
        var re = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/
        if (re.test(a.hostname)) {
          vhost = '__defaultVhost__'
        }
      }

      // parse the schema
      var schema = 'rtmp'
      if (url.indexOf('://') > 0) {
        schema = url.slice(0, url.indexOf('://'))
      }

      var port = a.port
      if (!port) {
        if (schema === 'http') {
          port = 80
        } else if (schema === 'https') {
          port = 443
        } else if (schema === 'rtmp') {
          port = 443// 1935
        }
      }

      var ret = {
        url: url,
        schema: schema,
        server: process.env.NODE_ENV === 'development' ? a.hostname : server.split('/')[0],//,
        port: port,
        vhost: vhost,
        app: app,
        stream: stream,
      }
      self.__internal.fill_query(a.search, ret)
      // For webrtc API, we use 443 if page is https, or schema specified it.
      if (!ret.port) {
        if (schema === 'webrtc' || schema === 'rtc') {
          if (ret.user_query.schema === 'https') {
            ret.port = 443
          } else if (window.location.href.indexOf('https://') === 0) {
            ret.port = 443
          } else {
            // For WebRTC, SRS use 1985 as default API port.
            ret.port = 1985
          }
        }
      }
      console.log("%c ret=>", "color:red", ret);
      return ret
    },
    fill_query: function (query_string, obj) {
      // pure user query object.
      obj.user_query = {}

      if (query_string.length === 0) {
        return
      }

      // split again for angularjs.
      if (query_string.indexOf('?') >= 0) {
        query_string = query_string.split('?')[1]
      }

      var queries = query_string.split('&')
      for (var i = 0; i < queries.length; i++) {
        var elem = queries[i]

        var query = elem.split('=')
        obj[query[0]] = query[1]
        obj.user_query[query[0]] = query[1]
      }

      // alias domain for vhost.
      if (obj.domain) {
        obj.vhost = obj.domain
      }
    },
  }

  self.pc = new RTCPeerConnection(null)

  // To keep api consistent between player and publisher.
  // @see https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addStream#Migrating_to_addTrack
  // @see https://webrtc.org/getting-started/media-devices
  self.stream = new MediaStream()

  return self
}

// Depends on adapter-7.4.0.min.js from https://github.com/webrtc/adapter
// Async-await-promise based SRS RTC Player.
export function SrsRtcPlayerAsync (display) {
  var self = {}

  // @see https://github.com/rtcdn/rtcdn-draft
  // @url The WebRTC url to play with, for example:
  //      webrtc://r.ossrs.net/live/livestream
  // or specifies the API port:
  //      webrtc://r.ossrs.net:11985/live/livestream
  // or autostart the play:
  //      webrtc://r.ossrs.net/live/livestream?autostart=true
  // or change the app from live to myapp:
  //      webrtc://r.ossrs.net:11985/myapp/livestream
  // or change the stream from livestream to mystream:
  //      webrtc://r.ossrs.net:11985/live/mystream
  // or set the api server to myapi.domain.com:
  //      webrtc://myapi.domain.com/live/livestream
  // or set the candidate(ip) of answer:
  //      webrtc://r.ossrs.net/live/livestream?eip=39.107.238.185
  // or force to access https API:
  //      webrtc://r.ossrs.net/live/livestream?schema=https
  // or use plaintext, without SRTP:
  //      webrtc://r.ossrs.net/live/livestream?encrypt=false
  // or any other information, will pass-by in the query:
  //      webrtc://r.ossrs.net/live/livestream?vhost=xxx
  //      webrtc://r.ossrs.net/live/livestream?token=xxx
  self.play = async function (url) {
    var conf = self.__internal.prepareUrl(url)
    self.pc.addTransceiver('audio', { direction: 'recvonly' })
    self.pc.addTransceiver('video', { direction: 'recvonly' })

    var offer = await self.pc.createOffer()
    await self.pc.setLocalDescription(offer)
    var session = await new Promise(function (resolve, reject) {
      // @see https://github.com/rtcdn/rtcdn-draft
      var data = {
        api: conf.apiUrl,
        sdp: offer.sdp,
        tid: conf.tid,
        streamurl: conf.streamUrl,
        clientip: null,
      }
      console.log('Generated offer: ', data)

      resolve(
        request({
          method: 'post',
          url: conf.apiUrl, //'https://192.168.101.27:3000/rtc/v1/play/',
          data: JSON.stringify(data),
        })
      )
      // .then(function (data) {
      //   console.log('%c其他人Got answer: ', 'color:red;', data)
      //   if (data.code) {
      //     reject(data)
      //     return
      //   }

      //   resolve(data)
      // })
      // .fail(function (reason) {
      //   reject(reason)
      // })
    })
    await self.pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: session.sdp }))
    session.simulator = `${conf.schema}//${conf.urlObject.server}${conf.port ? ':' + conf.port : conf.port}/rtc/v1/nack/`
    return session
  }

  // Close the player.
  self.close = function () {
    self.pc && self.pc.close()
    self.pc = null
  }

  // The callback when got remote track.
  // Note that the onaddstream is deprecated, @see https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/onaddstream
  self.ontrack = function (event) {
    // https://webrtc.org/getting-started/remote-streams
    self.stream.addTrack(event.track)
  }

  // Internal APIs.
  self.__internal = {
    defaultPath: '/rtc/v1/play/',
    prepareUrl: function (webrtcUrl) {
      var urlObject = self.__internal.parse(webrtcUrl)

      // If user specifies the schema, use it as API schema.
      var schema = urlObject.user_query.schema
      schema = schema ? schema + ':' : window.location.protocol

      var port = urlObject.port || 1985
      if (schema === 'https:') {
        port = urlObject.port || 443
      }

      // @see https://github.com/rtcdn/rtcdn-draft
      var api = urlObject.user_query.play || self.__internal.defaultPath
      if (api.lastIndexOf('/') !== api.length - 1) {
        api += '/'
      }

      apiUrl = `${schema}//${urlObject.server}${port ? ':' + port : port}${api}`
      for (var key in urlObject.user_query) {
        if (key !== 'api' && key !== 'play') {
          apiUrl += '&' + key + '=' + urlObject.user_query[key]
        }
      }
      // Replace /rtc/v1/play/&k=v to /rtc/v1/play/?k=v
      var apiUrl = apiUrl.replace(api + '&', api + '?')

      var streamUrl = urlObject.url

      return {
        apiUrl: apiUrl,
        tid: Number(parseInt(new Date().getTime() * Math.random() * 100))
          .toString(16)
          .slice(0, 7),
        streamUrl: streamUrl,
        schema: schema,
        urlObject: urlObject,
        port: port,
      }
    },
    parse: function (url) {
      // @see: http://stackoverflow.com/questions/10469575/how-to-use-location-object-to-parse-url-without-redirecting-the-page-in-javascri
      var a = document.createElement('a')
      a.href = url.replace('rtmp://', 'http://').replace('webrtc://', 'http://').replace('rtc://', 'http://')

      var vhost = a.hostname
      var app = a.pathname.substring(1, a.pathname.lastIndexOf('/'))
      var stream = a.pathname.slice(a.pathname.lastIndexOf('/') + 1)

      // parse the vhost in the params of app, that srs supports.
      app = app.replace('...vhost...', '?vhost=')
      if (app.indexOf('?') >= 0) {
        var params = app.slice(app.indexOf('?'))
        app = app.slice(0, app.indexOf('?'))

        if (params.indexOf('vhost=') > 0) {
          vhost = params.slice(params.indexOf('vhost=') + 'vhost='.length)
          if (vhost.indexOf('&') > 0) {
            vhost = vhost.slice(0, vhost.indexOf('&'))
          }
        }
      }

      // when vhost equals to server, and server is ip,
      // the vhost is __defaultVhost__
      if (a.hostname === vhost) {
        var re = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/
        if (re.test(a.hostname)) {
          vhost = '__defaultVhost__'
        }
      }

      // parse the schema
      var schema = 'rtmp'
      if (url.indexOf('://') > 0) {
        schema = url.slice(0, url.indexOf('://'))
      }

      var port = a.port
      if (!port) {
        if (schema === 'http') {
          port = 80
        } else if (schema === 'https') {
          port = 443
        } else if (schema === 'rtmp') {
          port = 443 //1935
        }
      }

      var ret = {
        url: url,
        schema: schema,
        server: a.hostname,
        port: port,
        vhost: vhost,
        app: app,
        stream: stream,
      }
      self.__internal.fill_query(a.search, ret)

      // For webrtc API, we use 443 if page is https, or schema specified it.
      if (!ret.port) {
        if (schema === 'webrtc' || schema === 'rtc') {
          if (ret.user_query.schema === 'https') {
            ret.port = 443
          } else if (window.location.href.indexOf('https://') === 0) {
            ret.port = 443
          } else {
            // For WebRTC, SRS use 1985 as default API port.
            ret.port = 1985
          }
        }
      }
      console.log("%c ret=>", "color:red", ret);
      return ret
    },
    fill_query: function (query_string, obj) {
      // pure user query object.
      obj.user_query = {}

      if (query_string.length === 0) {
        return
      }

      // split again for angularjs.
      if (query_string.indexOf('?') >= 0) {
        query_string = query_string.split('?')[1]
      }

      var queries = query_string.split('&')
      for (var i = 0; i < queries.length; i++) {
        var elem = queries[i]

        var query = elem.split('=')
        obj[query[0]] = query[1]
        obj.user_query[query[0]] = query[1]
      }

      // alias domain for vhost.
      if (obj.domain) {
        obj.vhost = obj.domain
      }
    },
  }

  self.pc = new RTCPeerConnection(null)

  // Create a stream to add track to the stream, @see https://webrtc.org/getting-started/remote-streams
  self.stream = new MediaStream()

  // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/ontrack
  self.pc.ontrack = function (event) {
    if (self.ontrack) {
      self.ontrack(event)
    }
  }
  playstreams[display] = self.stream
  return self
}

// Format the codec of RTCRtpSender, kind(audio/video) is optional filter.
// https://developer.mozilla.org/en-US/docs/Web/Media/Formats/WebRTC_codecs#getting_the_supported_codecs
export function SrsRtcFormatSenders (senders, kind) {
  var codecs = []
  senders.forEach(function (sender) {
    var params = sender.getParameters()
    params &&
      params.codecs &&
      params.codecs.forEach(function (c) {
        if (kind && sender.track.kind !== kind) {
          return
        }

        if (c.mimeType.indexOf('/red') > 0 || c.mimeType.indexOf('/rtx') > 0 || c.mimeType.indexOf('/fec') > 0) {
          return
        }

        var s = ''

        s += c.mimeType.replace('audio/', '').replace('video/', '')
        s += ', ' + c.clockRate + 'HZ'
        if (sender.track.kind === 'audio') {
          s += ', channels: ' + c.channels
        }
        s += ', pt: ' + c.payloadType

        codecs.push(s)
      })
  })
  return codecs.join(', ')
}
