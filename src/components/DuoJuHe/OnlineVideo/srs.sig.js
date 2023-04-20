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

'use strict'
export function wsObject () {
  let wsdto = {}
  //建立websock连接
  wsdto.connect = async function (protocol, host, room, display, heartbeatInterval = 1000 * 10) {
    wsdto.url = `${protocol}://${host}/sig/v1/rtc?room=${room}&display=${display}`
    console.log(wsdto.url)
    wsdto.heartbeatInterval = heartbeatInterval //单位：毫秒ms
    wsdto.binaryType = 'blob'
    wsdto.ws = new WebSocket(wsdto.url)
    console.log('-------wss', wsdto.ws, protocol, host, room, display)
    wsdto.ws.onmessage = function (event) {
      var r = JSON.parse(event.data)
      var promise = wsdto._internals.msgs[r.tid]
      if (promise) {
        promise.resolve(r.msg)
        delete wsdto._internals.msgs[r.tid]
      } else {
        wsdto.onmessage(event)
      }
    }
    wsdto.ws.onclose = function (event) {
      clearInterval(wsdto.pingIntervalId) // clear send heartbeat task
      wsdto.onclose(event)
    }
    return new Promise(function (resolve, reject) {
      wsdto.ws.onopen = function (event) {
        wsdto.pingIntervalId = setInterval(wsdto.ping, wsdto.heartbeatInterval)
        // resolve(wsdto.ws)
        resolve(event)
      }

      wsdto.ws.onerror = function (event) {
        // reject(wsdto.ws)
        reject(event)
      }
    })
  }
  //发送websocket消息
  wsdto.send = async function (message) {
    return new Promise(function (resolve, reject) {
      var r = {
        tid: Number(parseInt(new Date().getTime() * Math.random() * 100))
          .toString(16)
          .slice(0, 7),
        msg: message,
      }
      wsdto._internals.msgs[r.tid] = { resolve: resolve, reject: reject }
      wsdto.ws.send(JSON.stringify(r))
    })
  }
  //发送ping消息
  wsdto.ping = function (msg) {
    msg = msg ? msg : '心跳内容'
    wsdto.ws.send(msg)
  }
  //消息接收事件
  wsdto.onmessage = function (event) { }
  //连接关闭事件
  wsdto.onclose = function (event) { }

  wsdto.close = function () {
    wsdto.ws && wsdto.ws.close()
    wsdto.ws = null
    clearInterval(wsdto.pingIntervalId) // clear send heartbeat task
    for (const tid in wsdto._internals.msgs) {
      var promise = wsdto._internals.msgs[tid]
      promise.reject('close')
    }
  }
  wsdto._internals = {
    // Key is tid, value is object {resolve, reject, response}.
    msgs: {},
  }
  return wsdto
}
// Async-await-promise based SRS RTC Signaling.
export function SrsRtcSignalingAsync () {
  var self = {}

  // The schema is ws or wss, host is ip or ip:port, display is nickname
  // of user to join the room.
  self.connect = async function (schema, host, room, display) {
    var url = schema + '://' + host + '/sig/v1/rtc'
    self.ws = new WebSocket(url + '?room=' + room + '&display=' + display)
    console.log('-------wss', self.ws, schema, host, room, display)
    self.ws.onmessage = function (event) {
      var r = JSON.parse(event.data)
      var promise = self._internals.msgs[r.tid]
      if (promise) {
        promise.resolve(r.msg)
        delete self._internals.msgs[r.tid]
      } else {
        self.onmessage(r.msg)
      }
    }

    return new Promise(function (resolve, reject) {
      self.ws.onopen = function (event) {
        resolve(event)
      }

      self.ws.onerror = function (event) {
        reject(event)
      }
    })
  }

  // The message is a json object.
  self.send = async function (message) {
    return new Promise(function (resolve, reject) {
      var r = {
        tid: Number(parseInt(new Date().getTime() * Math.random() * 100))
          .toString(16)
          .slice(0, 7),
        msg: message,
      }
      self._internals.msgs[r.tid] = { resolve: resolve, reject: reject }
      self.ws.send(JSON.stringify(r))
    })
  }

  self.close = function () {
    self.ws && self.ws.close()
    self.ws = null

    for (const tid in self._internals.msgs) {
      var promise = self._internals.msgs[tid]
      promise.reject('close')
    }
  }

  // The callback when got messages from signaling server.
  self.onmessage = function (msg) { }

  self._internals = {
    // Key is tid, value is object {resolve, reject, response}.
    msgs: {},
  }

  return self
}

// Parse params in query string.
export function SrsRtcSignalingParse (location) {
  let query = location.split('?')[1]
  query = query ? '?' + query : null

  let wsSchema = location.split('wss=')[1]
  console.log("wsSchema", wsSchema);
  wsSchema = wsSchema ? wsSchema.split('&')[0] : window.location.protocol === 'http:' ? 'ws' : 'wss'
  let wsHost = location.split('wsh=')[1]
  wsHost = wsHost ? wsHost.split('&')[0] : window.location.hostname

  let wsPort = location.split('wsp=')[1]
  wsPort = wsPort ? wsPort.split('&')[0] : '' // window.location.host.split(':')[1] 此版本不带端口

  let host = location.split('host=')[1]
  host = host ? host.split('&')[0] : window.location.hostname

  let room = location.split('room=')[1]
  room = room ? room.split('&')[0] : null

  let role = location.split('role=')[1]
  role = role ? role.split('&')[0] : null

  let display = location.split('display=')[1]
  display = display
    ? display.split('&')[0]
    : Number(parseInt(new Date().getTime() * Math.random() * 100))
      .toString(16)
      .toString(16)
      .slice(0, 7)

  let autostart = location.split('autostart=')[1]
  autostart = autostart && autostart.split('&')[0] === 'true'

  // Remove data in query.
  let rawQuery = query
  if (query) {
    query = query.replace('wss=' + wsSchema, '')
    query = query.replace('wsh=' + wsHost, '')
    query = query.replace('wsp=' + wsPort, '')
    query = query.replace('host=' + host, '')
    if (room) {
      query = query.replace('room=' + room, '')
    }
    query = query.replace('display=' + display, '')
    query = query.replace('autostart=' + autostart, '')

    while (query.indexOf('&&') >= 0) {
      query = query.replace('&&', '&')
    }
    query = query.replace('?&', '?')
    if (query.lastIndexOf('?') === query.length - 1) {
      query = query.slice(0, query.length - 1)
    }
    if (query.lastIndexOf('&') === query.length - 1) {
      query = query.slice(0, query.length - 1)
    }
  }

  // Regenerate the host of websocket.
  wsHost = wsPort ? wsHost.split(':')[0] + ':' + wsPort : wsHost

  return {
    query: query,
    rawQuery: rawQuery,
    wsSchema: wsSchema,
    wsHost: wsHost,
    host: host,
    room: room,
    display: display,
    autostart: autostart,
    role: role,
  }
}
