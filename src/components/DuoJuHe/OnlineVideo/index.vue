<!--
 * @Author: 杰 xuyongfeng@jeoho.com
 * @Date: 2023-02-20 10:26:52
 * @LastEditors: 杰 xuyongfeng@jeoho.com
 * @LastEditTime: 2023-02-20 10:33:33
 * @FilePath: \decision_engine_ui\src\components\DuoJuHe\OnlineVideo\index.vue
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
-->
<script>
import './adapter-7.4.0.min';
import { SrsRtcPublisherAsync, SrsRtcPlayerAsync, SrsRtcFormatSenders } from './srs.sdk.js';
import { wsObject, SrsRtcSignalingParse } from './srs.sig.js';
import $ from 'jquery';
import { getSeekableBlob } from './ebml.util.js';
import { postvideoAcceptUpload, getDomainApi } from '@/api/module/chat/im/chatGroup.js';
import useAppStore from '@/store/modules/app.js';
import useUserStore from '@/store/modules/user';
import request from '@/utils/request_chat.js';
let userStore = useUserStore();
let appStore = useAppStore();
// 秒数转时分秒
function getTime(time) {
  // 转换为式分秒
  let h = parseInt((time / 60 / 60) % 24);
  h = h < 10 ? '0' + h : h;
  let m = parseInt((time / 60) % 60);
  m = m < 10 ? '0' + m : m;
  let s = parseInt(time % 60);
  s = s < 10 ? '0' + s : s;
  // 作为返回值返回
  return [h, m, s];
}
export default {
  props: {
    currentRow: {
      type: Object,
      default: () => {},
    },

    self: {
      type: Object,
      default: () => {},
    },
  },
  setup() {},
  data() {
    return {
      streamList: [],
      name: userStore.userId,
      screendisplay: '', // 屏幕分享人名
      publisher: {}, //srs实例
      players: {}, //播放人数
      sig: null,
      srceen_sig: null, // 屏幕分享websocket 聊天
      startScreen: null, // 分享屏幕
      screenStream: null, // 分享屏幕 管道
      hasStartScreen: false, // 是否有人开启分享屏幕
      video_length: 0,
      conf: {
        query: {},
        rawQuery: {},
        wsSchema: {},
        wsHost: {},
        host: '',
        room: '',
        display: '',
        autostart: '',
        role: '',
      },

      iframe_url: '',
      value: 100, // 音量
      textname: window.location.href.indexOf('notarization') > -1 ? '关闭' : '结束',
      dropHeight: '', // 此弹窗高度,
      screenTimer: '', // 屏幕分享定时器
      screenTimerVlaue: -1, //
      screenTimeValue: ['00', '00', '00'], //时间数
      fulls: false, // 全屏
      awayActive: false, // 侧边栏收起
      videoActive: false,
      audioActive: false,

      mediaRecorder: null, // 录制视频
      RECblobs: [], // 录制视频流
      RECStatus: '', // 录制状态
      dialogTips: false, // 摄像头不存在
      peopleList: [],

      v1_treams: false, //
    };
  },
  created() {},
  async mounted() {
    let that = this;
    // 获取全屏状态
    var getFullscreenElement = () => {
      return (
        document['fullscreenElement'] ||
        document['mozFullScreenElement'] ||
        document['msFullScreenElement'] ||
        document['webkitFullscreenElement'] ||
        null
      );
    };
    this.$refs.videoContain.addEventListener('fullscreenchange', () => {
      if (getFullscreenElement() == null) {
        console.log('exit');
        this.exitScreen(true);
        this.fulls = false;
      } else {
        console.log('full');
        this.fulls = true;
      }
    });
    this.$nextTick((_) => {
      // this.drag(document.querySelector('.drag-box'))
    });
    console.log('%cthis.currentRow=>', 'color: red;', this.currentRow);
    let { videoChatDomain, videoDomain: viewDomainName } = appStore.doMain;
    // console.log('视频地址', res);
    // this.iframe_url = await `${
    //   import.meta.env.VITE_APP_WEB_SOCKET_URL_S
    // }?autostart=true&wss=wss&wsh=${
    //   import.meta.env.VITE_APP_WEB_SOCKET_URL_S
    //     ? import.meta.env.VITE_APP_WEB_SOCKET_URL_S.split('//')[1]
    //     : import.meta.env.VITE_APP_WEB_SOCKET_URL_S
    // }&host=${
    //   import.meta.env.VITE_APP_WEB_SOCKET_URL_S
    //     ? import.meta.env.VITE_APP_WEB_SOCKET_URL_S.split('//')[1]
    //     : import.meta.env.VITE_APP_WEB_SOCKET_URL_S
    // }&room=${this.currentRow.notarizeId}&display=${this.self.chatUserName}_${
    //   this.name
    // }_${new Date().getTime()}`;
    this.iframe_url = `${
      viewDomainName ? viewDomainName.replace('/api', '') : window.location.origin
    }/videoroom/trtc_open.html?autostart=true&wss=wss&wsh=${
      viewDomainName ? viewDomainName.split('//')[1] : import.meta.env.VITE_APP_WEB_SOCKET_URL_S
    }&host=${
      viewDomainName ? viewDomainName.split('//')[1] : import.meta.env.VITE_APP_WEB_SOCKET_URL_S
    }&room=${this.currentRow.notarizeId}&display=${this.self.chatUserName}_${
      this.name
    }_${new Date().getTime()}`;
    // console.log(this.currentRow, this.self)
    this.conf = await SrsRtcSignalingParse(this.iframe_url);
    this.conf.videoChatDomain = videoChatDomain.split('//')[1];
    console.log('%cthis.conf', 'color:red; font-size: 15px;', this.conf, this.iframe_url);
    this.startDemo();
  },

  methods: {
    // 退出全屏
    exitScreen(sta = false) {
      this.screenTimerVlaue = -100;
      this.screenTimer && clearTimeout(this.screenTimer);
      this.screenTimer = null;
      if (sta) return false;
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    },
    // 打开全屏
    quanpin() {
      this.screenTimer && clearTimeout(this.screenTimer);
      this.screenTimer = null;
      this.screenTimerVlaue = $('#rtc_media_startScreen')[0]?.currentTime;
      this.currentTimeFn();
      let btnvideoBox = $('.video-contain')[0];
      // console.log(btnvideoBox.requestFullscreen)
      if (btnvideoBox.requestFullscreen) {
        btnvideoBox.requestFullscreen();
      } else if (btnvideoBox.mozRequestFullScreen) {
        btnvideoBox.mozRequestFullScreen();
      } else if (btnvideoBox.webkitRequestFullScreen) {
        btnvideoBox.webkitRequestFullScreen();
      }
    },
    // 屏幕共享时间
    currentTimeFn() {
      if (this.screenTimerVlaue >= 0) {
        this.screenTimer = setTimeout(() => {
          this.screenTimeValue = getTime(this.screenTimerVlaue);
          this.screenTimerVlaue += 1;
          this.currentTimeFn();
        }, 1000);
      }
    },
    // 音量控制
    change(val) {
      console.log(val);
      let dom = document.querySelectorAll('video');
      console.log(dom);
      for (let i = 0; i < dom.length; i++) {
        dom[i].volume = val / 100;
      }
    },
    // 底部操作栏
    controlFn(op) {
      switch (op) {
        case 'mute': // 静音
          this.audioActive = !this.audioActive;
          this.audioActive
            ? this.publisher.stream.getTracks()[0].stop()
            : this.publisher.stream.getTracks()[0].start();

          console.log(this.publisher.stream.getTracks()[0]);
          break;
        case 'video': // 视频
          this.videoActive = !this.videoActive;
          if (this.videoActive) {
            this.publisher.stream.getTracks()[1].stop();
            this.sig.send({
              action: 'closePublish',
              room: this.conf.room,
              display: this.conf.display,
            });
          } else {
            this.startDemo();
          }

          console.log(this.publisher.stream.getTracks()[1]);
          break;
        case 'REC': // 开始录屏
          if (this.mediaRecorder) return;
          if (this.screenStream) {
            console.log('-轨道:', this.screenStream.getTracks());
            this.$confirm(
              '开启录制后，将录制会议中的音频画面、共享屏幕内容到本地设备、并告知所有参会成员。',
              '是否开启本地录制',
              {
                confirmButtonText: '开启',
                cancelButtonText: '取消',
                // type: 'info',
              },
            )
              .then(() => {
                this.mediaRecorder = new MediaRecorder(this.screenStream, {
                  mimeType: 'video/webm;codecs=opus',
                  audioBitsPerSecond: 128000,
                  videoBitsPerSecond: 2500000,
                });
                this.mediaRecorder.ondataavailable = (e) => {
                  // 每过多少秒
                  this.RECblobs.push(e.data);
                  this.uploadBolb(e.data);
                };
                this.mediaRecorder.start(10000);
                this.RECStatus = 'start';
              })
              .catch((res) => {
                console.error(res);
                console.log('取消');
              });
            return;
          } else {
            this.$message.warning('请打开屏幕分享');
          }
          break;
        case 'RECover': // 结束录屏
          // console.log(this.mediaRecorder)
          this.RECStatus = 'stop';
          this.mediaRecorder && this.mediaRecorder.stop();
          let { Title } = this.currentRow;
          if (this.RECblobs.length <= 0) {
            setTimeout(() => {
              this.RECblobs = [];
              this.mediaRecorder && (this.mediaRecorder = null);
            }, 400);
            this.$message.warning('录制时间过短，保存失败！');
            return;
          }
          var blob = new Blob(this.RECblobs, {
            type: 'video/webm',
          });
          setTimeout(() => {
            this.RECblobs = [];
            this.mediaRecorder && (this.mediaRecorder = null);
          }, 400);
          // 生成带时间的视频文件
          getSeekableBlob(blob, function (seekableBlob) {
            const url = window.URL.createObjectURL(seekableBlob);
            const link = document.createElement('a');
            link.style.display = 'none';
            link.href = url;
            const fileName = `${Title}_${new Date().getTime()}.webm`;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          });
          this.$message.success('您的录制保存成功'); //将自动转换为mp4格式
          break;
        case 'RECpause': // 暂停录屏
          this.RECStatus = 'pause';
          this.mediaRecorder && this.mediaRecorder.pause();
          break;
        case 'RECresume': // 恢复录屏
          this.RECStatus = 'resume';
          this.mediaRecorder && this.mediaRecorder.resume();
          break;
      }
    },
    // 上传文件流
    async uploadBolb(blob) {
      // Blob 转 File
      console.log(blob, this.RECStatus);
      let blobToFile = (Fblob, fileName) => {
        console.log(Fblob);
        let file = new File([Fblob], fileName, { type: Fblob.type });
        return file;
      };
      var oMyForm = new FormData();
      oMyForm.append('sign', this.RECStatus == 'stop' ? 0 : 1);
      oMyForm.append('userId', this.name);
      var oBlob = new Blob([blob], { type: 'video/webm' });
      let file = await blobToFile(
        oBlob,
        `${this.currentRow.notarizeId}_${new Date().getTime()}.mp4`,
      );
      console.log(file);
      oMyForm.append('file', file);
      // await getSeekableBlob(oBlob, function (seekableBlob) {})
      oMyForm.append('fileName', `${this.currentRow.notarizeId}_${new Date().getTime()}.mp4`);
      postvideoAcceptUpload(oMyForm).then((res) => {});
    },
    // 停止屏幕共享
    stopScreen() {
      this.startScreen && this.startScreen.close(); // stream ==> 屏幕分享的MediaStream
      this.startScreen = null;
      this.mediaRecorder && this.controlFn('RECstop'); // 停止录屏
      this.srceen_sig && this.srceen_sig.close();
      this.srceen_sig = null;
      if (this.screenStream) {
        const tracks = this.screenStream.getTracks(); // stream ==> 屏幕分享的MediaStream
        tracks.forEach((track) => track.stop());
      }
      setTimeout(() => {
        this.RECblobs = [];
        this.mediaRecorder && (this.mediaRecorder = null);
      }, 400);
      return new Promise((resolve, reject) => {
        this.hasStartScreen = false;
        $('#start-screen').hide();
        this.video_length_change();
        resolve();
      });
    },
    // 分享屏幕
    async startScreenFn(sta = false) {
      if (this.screenStream) return; // false 屏幕分享   true - 重新打开新的屏幕分享
      this.stopScreen().then((res) => {
        var host = this.conf.host;
        var room = this.conf.room;
        var display = this.conf.display.split('_');
        display = `${display[0]}-screen_${display[1]}_${new Date().getTime()}`;
        // console.log('// 分享屏幕', display)
        if (this.srceen_sig) {
        } else {
          this.srceen_sig = new wsObject();
          this.srceen_sig.connect(this.conf.wsSchema, this.conf.videoChatDomain, room, display);
          this.srceen_sig.onmessage = function (msg) {
            console.log('%cNotify 分享屏幕: ', 'color:red;', JSON.parse(msg.data));
          };
        }
        // this.screenTimer && this.exitScreen()
        this.startScreenPublish(host, room, display);
      });
    },
    // 屏幕分享
    async startScreenPublish(host, room, display) {
      const url = `webrtc://${host}/${room}/${display}${this.conf.query}`,
        that = this;
      if (this.startScreen) {
        this.startScreen.close();
        this.startScreen = null;
      }
      this.startScreen = new SrsRtcPublisherAsync('screen');

      console.log('startScreen=>', this.startScreen);

      await this.startScreen
        .publish(url)
        .then(async function (session) {})
        .catch(function (reason) {
          that.hasStartScreen = false;
          that.startScreen.close();
          that.startScreen = null;
          console.error(reason);
        });
      console.log(this.startScreen, !this.startScreen);
      if (!this.startScreen) return;
      let rr = this.srceen_sig.send({
        action: 'join',
        room: room,
        display: display,
      });
      console.log('srceen_sig: join ok', rr);

      // Start publish media if signaling is ok.
      let r1 = this.srceen_sig.send({
        action: 'publish',
        room: room,
        display: display,
      });
      console.log('srceen_sig: publish ok', r1);
      this.hasStartScreen = true;
      $('#rtc_media_startScreen').prop('srcObject', this.startScreen.stream);
      console.log('Display轨道:', this.startScreen.stream.getTracks());
      let session = this.startScreen;
      if (session.stream) {
        console.log(session.stream);
        this.screenStream = session.stream;
        // 点击漂浮栏中的【停止共享】按钮， MediaStream 触发 oninactive 事件，同时 MediaStreamTrack 触发 onended 事件
        this.screenStream.oninactive = () => {
          console.log('%c停止共享', 'color:red;');
          this.hasStartScreen = false;
          this.screenStream = null;
          $('#start-screen').hide();
          this.srceen_sig &&
            this.srceen_sig.send({
              action: 'leave',
              room: room,
              display: display,
            });
          this.video_length_change();
        };
        // $.each(that.players, function (index, obj) {
        //   obj.player.stream.getAudioTracks().forEach(function (audioTrack) {
        //     that.startScreen.ontrack({ track: audioTrack })
        //   })
        // })
      }
      this.video_length_change();
      $('#start-screen').show();
      $('#rtc_media_startScreen').show();
    },
    // 发起视频
    async startDemo() {
      var { host, room, display } = this.conf;
      const that = this;

      // Connect to signaling first.
      if (this.sig) {
        console.log('sig存在=>', this.sig);
        this.sig.close();
      }
      // sig = new SrsRtcSignalingAsync()
      this.sig = new wsObject();
      console.log(1);
      this.sig.onmessage = async function (res) {
        // console.log('Notify: ', res)
        let msg = JSON.parse(res.data).msg;
        console.log('Notify data细节:online ', msg);
        // Subscribe if new user start to publish.
        if (msg.event === 'publish') {
          if (
            msg.peer &&
            msg.peer.publishing &&
            msg.peer.display !== display &&
            !that.peopleList[msg.peer.display.split('_')[0]]
          ) {
            console.log('this.peopleList', that.peopleList);
            that.peopleList[msg.peer.display.split('_')[0]] = msg.peer.display;
            that.startPlay(host, msg.peer.room, msg.peer.display);
          }
        }
        // Remove dead players.
        if (msg.event === 'join' || msg.event === 'leave' || msg.action == 'leave') {
          console.log(that.players);
          $.each(that.players, function (k, obj) {
            let stillAlive = false;
            console.log('onmessage=>', k, obj);
            msg.participants.forEach(function (participant) {
              if (participant.display === k) {
                stillAlive = true;
              }
            });
            if (!stillAlive) {
              console.log('%cremove DOM', 'color:red');
              obj.player.close();
              if (k.indexOf('screen') < 0) {
                obj.ui.remove();
              }
            }
          });
        }
        if ((msg.event === 'leave' || msg.action == 'leave') && !this.v1_treams) {
          this.v1_treams = true;
          request({
            method: 'post',
            url: '/rtc/v1/streams/',
          })
            .then((res) => {
              console.log(res);
            })
            .catch((res) => {
              console.error(res);
            })
            .finally(() => {
              that.v1_treams = false;
            });
        }
        if (msg.event === 'closePublish') {
          $.each(that.players, function (k, obj) {
            msg.participants.forEach(function (participant) {
              if (participant.display === k) {
                obj.player.stream.getTracks()[1].stop();
              }
            });
          });
        }
        if (msg.event === 'leave' && msg.display.indexOf('screen') > -1) {
          that.stopScreen();
          $('#start-screen').hide();
          $('#rtc_media_startScreen').hide();
          that.hasStartScreen = false;
        }
        this.video_length = msg.participants.length;
        that.video_length_change();
        console.log(this.video_length);
      };
      console.log(2);
      await this.sig.connect(this.conf.wsSchema, this.conf.videoChatDomain, room, display);
      // await sig.connect('ws', '192.168.101.41:1989', room, display)
      console.log(3, host, room, display);
      let r0 = await this.sig.send({
        action: 'join',
        room: room,
        display: display,
      });
      console.log(4);
      console.log('Signaling: join ok', r0);
      this.video_length = r0.participants.length;
      // Start publish media if signaling is ok.
      await this.startPublish(host, room, display);
      let r1 = await this.sig.send({
        action: 'publish',
        room: room,
        display: display,
      });
      console.log('Signaling: publish ok', r1);

      // Play the stream already in room.
      for (let idx = r0.participants.length - 1; idx >= 0; idx--) {
        const element = r0.participants[idx];
        if (!this.peopleList[element.display.split('_')[0]] && element.publishing) {
          if (element.display.split('_')[0] === display.split('_')[0] || !element.publishing)
            continue;
          that.peopleList[element.display.split('_')[0]] = element.display;
          // console.log('peopleList', !element.publishing)
          that.startPlay(host, element.room, element.display);
        }
      }
      this.video_length_change();
    },
    //连接srs
    async startPublish() {
      var host = this.conf.host;
      var room = this.conf.room + '_video';
      var display = this.conf.display;
      const url = `webrtc://${host}/${room}/${display}${this.conf.query}`;
      if (JSON.stringify(this.publisher) !== '{}') {
        this.publisher.close();
      }
      this.publisher = new SrsRtcPublisherAsync();
      console.log('%cthis.publisher', 'color: red;', this.publisher);
      this.$refs.mainVideo.srcObject = this.publisher.stream; //设置视频源 此方法去除   使用iframe播放
      this.publisher
        .publish(url)
        .then((res) => {
          if (res.stream) {
            this.publisher.publishStream = res.stream;
          }
          if (res.tips) {
            this.dialogTips = res.tips;
          }
          console.log('publisher res ------------', res);
        })
        .catch((err) => {
          this.publisher.close();
          console.log('publisher err ------------', err);
        });
    },
    //开始播放
    startPlay(host, room, display) {
      var url = 'webrtc://' + host + '/' + room + '/' + display + this.conf.query;
      if (this.players[display]) {
        this.clsoePlayer(display);
      }
      let ui = $('#player')
        .clone()
        .attr('id', 'player-' + display);
      let video = ui.children('#rtc_media_player'),
        that = this;
      // console.log(video.length);
      let player = new SrsRtcPlayerAsync();
      // Clone a player from template.

      if (display.indexOf('screen') > -1) {
        console.log('%c有人分享屏幕', 'color:red; font-size:14px;');
        // 是否是屏幕分享标识
        ui = $('#start-screen>div');
        $('#start-screen').show();
        ui.attr('id', 'player-' + display);
        video = $('#rtc_media_startScreen');
        // console.log(video.length);
        $('#rtc_media_startScreen').show();
        this.hasStartScreen = true;
      } else {
        $('.srs_players').append(ui);
      }
      this.players[display] = {
        ui: ui,
        video: video,
        player: player,
      };
      player
        .play(url)
        .then(function () {
          video.show();
          ui.show();
          video.prop('srcObject', player.stream);
          // console.log(player.stream.getAudioTracks())
          if (that.screenStream) {
            console.log(that.screenStream.getTracks());
            that.RECblobs.length > 0 && that.controlFn('REC');
          }
          if (display.indexOf('screen') > -1) {
            // 是否是屏幕分享标识
            // $('#start-screen')
            //   .find('#screen-dom')
            //   .text(display.split('_')[0] + '屏幕分享中')
            // $('#start-screen').find('#screen-dom-alt').text(display)
            that.screendisplay = display.split('-')[0] + '屏幕分享中';
            video.prop('muted', true);
            // document.querySelector('#rtc_media_startScreen').play()
            console.log(getTime($('#rtc_media_startScreen')[0]?.currentTime));
          } else {
            ui.find('#peer').text(display.split('_')[0]);
            ui.find('.peer-alt').text(display);
            video.prop('muted', false);
            // document.querySelector('#rtc_media_player').play()
          }
          that.video_length_change();
        })
        .catch(function (reason) {
          player.close();
          video.hide();
          console.error(reason);
        });
    },

    clsoePlayer(display) {
      this.players[display].ui.remove();
      this.players[display].player.close();
      delete this.players[display];
    },
    // 关闭视频弹窗
    hangUp(is) {
      // 停止本地视频及音轨
      console.log(this.publisher);
      if (JSON.stringify(this.publisher) != '{}') {
        this.publisher.stream && this.publisher.stream.getTracks().forEach((track) => track.stop());
        this.publisher.close();
      }

      // 关闭其他视频
      for (let name in this.players) {
        this.clsoePlayer(name);
      }
      this.sig && this.sig.close();
      this.screenTimer && clearInterval(this.screenTimer);
      this.srceen_sig && this.srceen_sig.close();
      this.stopScreen();
      this.players = {};
      this.sig = null;
      this.srceen_sig = null;
      if (!is) return;
      this.$emit('close');
    },
    // video重新排版
    video_length_change() {
      let window_width = window.screen.width;
      if (this.video_length <= 4) {
        if (this.hasStartScreen) {
          // 屏幕分享时
          $('.srs_players').css({
            width: '100%',
            'flex-direction': 'column',
            'justify-content': 'center',
          });
          $('.srs_players').children('div').not('#player').css('width', '100%');
        } else {
          $('.srs_players').css({
            width: '100%',
            'justify-content': 'initial',
            'flex-direction': 'row',
          });
          $('.srs_players')
            .children('div')
            .not('#player')
            .css('width', window_width < 991 ? '49%' : '50%');
        }
      } else if (this.video_length > 4) {
        if (this.hasStartScreen) {
          // 屏幕分享时
          $('.srs_players').css({
            width: '100%',
            'flex-direction': 'column',
            'flex-wrap': 'nowrap',
            'max-height': '720px',
          });
          $('.srs_players').children('div').not('#player').css('width', '100%');
        } else {
          $('.srs_players').css({
            width: '100%',
            'flex-direction': 'row',
          });
          $('.srs_players')
            .children('div')
            .not('#player')
            .css('width', window_width < 991 ? '32%' : '33.3333%');
          window_width < 991
            ? $('.srs_players').removeClass('srs_players_9_33')
            : $('.srs_players').removeClass('srs_players_9_32');
          $('.srs_players').addClass(window_width < 991 ? 'srs_players_9_32' : 'srs_players_9_33');
        }
      }
      this.bindShowScreen();
    },
    bindShowScreen() {
      const that = this;
      if (this.hasStartScreen) {
        $('.srs_players>div').click(function (e) {
          // $('#start-screen .hide').remove()
          let index = $('.srs_players>div').index($(this));
          let dom = $('.srs_players>div').eq(index).clone();
          let display = dom.attr('id').replace('player-', '');
          // console.log(index, players[display])
          if (index == 0) {
            return false;
          }
          // let ui = players[display].ui,
          //   video = players[display].video
          // let player = this.players[display].player
          $('.srs_players').append($('#start-screen>div'));
          $('#start-screen').append($('.srs_players>div').eq(index));
          that.bindShowScreen();
        });
      }
    },
  },

  destroyed() {
    this.srceen_sig && this.srceen_sig.close();
    this.sig && this.sig.close();
    this.hangUp(false);
  },
};
</script>

<template>
  <div style="position: absolute; left: 50%; transform: translateX(-50%); top: 0; z-index: 999">
    <el-dialog
      top="10vh"
      title="提示"
      width="435px"
      custom-class="entryClerk"
      :visible="dialogTips"
      :append-to-body="true"
      :close-on-click-modal="false"
    >
      <span class="text"> Tips:麦克风和摄像头未允许或不支持，请授予权限或切换浏览器。 </span>
      <span slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          @click="
            () => {
              this.dialogTips = false;
            }
          "
          >确定</el-button
        >
      </span>
    </el-dialog>
    <div ref="dragBox" class="drag-box on">
      <div
        class="drag"
        v-chatDrag
        drag-top="80"
        drag-bottom="300"
        drag-left="300"
        drag-right="1300"
      >
        <div></div>
        <div class="dragimg">
          <img @click="quanpin" src="../../../assets/images/quanping.png" alt="" />
          <div class="round-btn close" @click="hangUp(true)"></div>
        </div>
      </div>
      <div class="move-left">
        <!--左侧div内容-->
      </div>

      <div class="move-right">
        <!--右侧div内容-->
      </div>
      <!-- <div class="move-bottom"></div> -->
      <el-scrollbar style="height: 100%">
        <div class="video-contain" ref="videoContain">
          <!-- -->
          <div v-if="mediaRecorder" class="recorder">
            <div class="recorder-left">
              <img
                :class="{ 'REC-animate': RECStatus == 'pause' ? false : true }"
                src=".././../../assets/images/yuandianl.png"
                alt=""
              />
              {{ RECStatus == 'pause' ? '录制暂停' : '录制中' }}
            </div>
            <div class="recorder-right">
              <div>
                <div v-if="mediaRecorder && RECStatus != 'pause'" @click="controlFn('RECpause')">
                  <el-popover
                    popper-class="RECbox"
                    placement="bottom-start"
                    trigger="hover"
                    content="暂停录制"
                    :visible-arrow="false"
                  >
                    <template #reference>
                      <img slot="reference" src="../../../assets/images/p_pause.png" alt="" />
                    </template>
                  </el-popover>
                </div>
                <!--  -->
                <div v-if="RECStatus == 'pause'" @click="controlFn('RECresume')">
                  <el-popover
                    popper-class="RECbox"
                    placement="bottom-start"
                    trigger="hover"
                    content="恢复录制"
                    :visible-arrow="false"
                  >
                    <template #reference>
                      <img slot="reference" src="../../../assets/images/p_resume.png" alt="" />
                    </template>
                  </el-popover>
                </div>
              </div>
              <div @click="controlFn('RECstop')">
                <el-popover
                  popper-class="RECbox"
                  placement="bottom-start"
                  trigger="hover"
                  content="停止录制"
                  :visible-arrow="false"
                >
                  <template #reference>
                    <img src="../../../assets/images/p_over.png" alt="" />
                  </template>
                </el-popover>
              </div>
            </div>
          </div>
          <div v-show="hasStartScreen && fulls" class="stopHeader">
            <div class="currenttime">
              {{ screenTimeValue[0] > 0 ? screenTimeValue[0] + ':' : ''
              }}{{ screenTimeValue[1] }}:{{ screenTimeValue[2] }}
              <span style="margin-left: 10px">屏幕共享</span>
            </div>
            <div v-if="hasStartScreen && fulls" @click="exitScreen()" class="fulScreen">
              <img src="../../../assets/images/delete.png" alt="" />
            </div>
            <div class="footer">
              <div @click="startScreenFn(true)">
                <img src="../../../assets/images/zdian_nao.png" />
                <span>打开新的共享</span>
              </div>
              <div>
                <!-- <img :src="imgList[1]" /> -->
              </div>
              <div>
                <!-- <img :src="imgList[2]" /> -->
              </div>
              <div>
                <!-- <img :src="imgList[3]" />
              <div style="width: 70px; margin-left: 10px">
                <el-slider @change="change" v-model="value"></el-slider>
              </div> -->
              </div>
              <div class="hang-up" @click="hangUp(true)">
                {{ textname }}
              </div>
            </div>
          </div>
          <div
            id="start-screen"
            :style="{ position: 'relative', display: 'none', width: fulls ? '100%' : '' }"
          >
            <div style="position: relative; cursor: pointer">
              <video
                id="rtc_media_startScreen"
                style="display: none"
                autoplay
                playsinline
                controls
              ></video>
              <!--controls-->
              <!-- <div class="info_box">
              <div class="info_po">
                <div class="info_item">
                  <span class="dot"></span>
                  <div id="screen-dom"></div>
                </div>
                <div class="info_mouse">
                  <div id="screen-dom-alt"></div>
                </div>
              </div>
            </div> -->
              <div class="user-info">
                <tooltip-text
                  id="tooltip-text-box"
                  :content="screendisplay ? screendisplay : '未知'"
                >
                  <div class="name">
                    {{ screendisplay }}
                  </div>
                </tooltip-text>
                <!-- <div class="audio_box audio" id="self_audio"></div> -->
              </div>
            </div>
          </div>
          <el-scrollbar
            :style="{
              height: dropHeight ? dropHeight - 90 + 'px' : '100%',
              width: hasStartScreen ? '30%' : '100%',
            }"
            :class="{
              isfulls: hasStartScreen && fulls,
              awayClass: hasStartScreen && fulls && awayActive,
            }"
          >
            <div
              class="player__wide-btn"
              v-show="hasStartScreen && fulls"
              @click="awayActive = !awayActive"
            >
              <svg viewBox="0 0 9 59" width="9" height="59" class="player__wide-btn-shape">
                <path
                  d="M3.8,5.1C1.7,4.3,0.2,2.4,0,0h0v5v4v41v5v3.9c0.6-1.9,2.1-3.4,4-4v0c2.9-0.7,5-3.2,5-6.3v-37  C9,8.4,6.8,5.7,3.8,5.1z"
                ></path>
              </svg>
              <i
                class="icon-arrow"
                :class="awayActive ? 'el-icon-arrow-right' : 'el-icon-arrow-left'"
              ></i>
            </div>

            <div class="srs_players">
              <div class="hide" id="publisher">
                <video
                  id="rtc_media_publisher"
                  ref="mainVideo"
                  width="310"
                  autoplay
                  playsinline
                  muted
                ></video>

                <div class="user-info">
                  <tooltip-text
                    id="tooltip-text-box"
                    :content="self.chatUserName ? self.chatUserName : '未知'"
                  >
                    <div class="name">
                      {{ self.chatUserName ? self.chatUserName : self.chatUserName }}
                    </div>
                  </tooltip-text>
                  <el-icon class="audio_box audio" id="self_audio"><Microphone /></el-icon>
                </div>
              </div>
              <div class="hide" id="player">
                <video
                  id="rtc_media_player"
                  style="display: none"
                  width="310"
                  autoplay
                  playsinline
                  muted
                ></video>

                <div class="info_box">
                  <div class="info_po">
                    <div class="info_item">
                      <span class="dot"></span>
                      <div id="peer"></div>
                    </div>
                    <div class="info_mouse">
                      <!-- <div class="peer-alt"></div> -->
                    </div>
                  </div>
                  <el-icon class="audio_box audio" id="self_audio"><Microphone /></el-icon>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </el-scrollbar>
      <div class="footer">
        <div
          @click="startScreenFn()"
          :class="{ noDrop: hasStartScreen ? true : false }"
          class="screenbox"
        >
          <img src="../../../assets/images/zdian_nao.png" />
          <span>屏幕分享</span>
        </div>
        <span v-if="hasStartScreen" @click="stopScreen" class="noScreen">停止共享</span>
        <div
          v-if="hasStartScreen"
          :class="{ noDrop: mediaRecorder ? true : false }"
          class="RECcontrol"
          @click="controlFn('REC')"
        >
          <img src="../../../assets/images/zREC.png" />
          <span>开始录屏</span>
        </div>
        <div id="self_video" :class="{ active: videoActive }" @click="controlFn('video')">
          <div></div>
          <el-popover
            popper-class="RECbox"
            placement="bottom-start"
            trigger="hover"
            content="摄像头"
            :visible-arrow="false"
          >
            <template #reference>
              <img slot="reference" src="../../../assets/images/zshe_xiang.png" />
            </template>
          </el-popover>
        </div>
        <div id="self_audio" :class="{ active: audioActive }" @click="controlFn('mute')">
          <img src="../../../assets/images/zlu_yin.png" />
        </div>
        <div class="volumebox">
          <img src="../../../assets/images/zsheng_yin.png" />
          <div style="width: 70px; margin-left: 10px">
            <el-slider @change="change" v-model="value"></el-slider>
          </div>
        </div>
        <div class="hang-up" @click="hangUp(true)">
          {{ textname }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import './index.scss';
@import './video.scss';
</style>
<style>
.RECbox {
  min-width: auto;
  width: auto;
  padding: 4px 10px;
  line-height: 1.5;
  background: rgba(31, 39, 70, 1);
  color: #fff;
}
</style>
