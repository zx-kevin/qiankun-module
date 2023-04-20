import WsSocket from '@/plugins/ws-socket'
import { getToken, getAppWebsocketUrl } from '@/utils/auth'
import { ElNotification } from 'element-plus'
import useUserStore from '@/store/modules/user.js'

// 引入消息处理类
import KeyboardEvent from '@/utils/event/keyboard'
import LoginEvent from '@/utils/event/login'
import TalkEvent from '@/utils/event/talk'
import RevokeEvent from '@/utils/event/revoke'
import DeleteEvent from '@/utils/event/delete'
import GroupJoinEvent from '@/utils/event/group-join'
import FriendApplyEvent from '@/utils/event/friend-apply'
import EventHeartbeat from '@/utils/event/event-heartbeat'
import SystemMessage from '@/utils/event/system-message'



/**
 * SocketInstance 连接实例
 *
 * 注释: 所有 WebSocket 消息接收处理在此实例中处理
 */
class SocketInstance {
  /**
   * WsSocket 实例
   */
  socket

  /**
   * SocketInstance 初始化实例
   */
  constructor () {
    this.socket = new WsSocket(
      () => {
        return getAppWebsocketUrl() + `?userId=` + useUserStore().userId
      },
      {
        onError: evt => {
          console.log('Websocket 连接失败回调方法')
        },
        // Websocket 连接成功回调方法
        onOpen: evt => {
          console.log('Websocket 连接成功回调方法')
          this.updateSocketStatus(true)
        },
        // Websocket 断开连接回调方法
        onClose: evt => {
          console.log('Websocket 断开连接回调方法')
          this.updateSocketStatus(false)
        },
      }
    )

    this.registerEvents()
  }

  // 连接 WebSocket 服务
  connect () {
    if (typeof (this.socket) === "undefined") {
      alert("您的浏览器不支持WebSocket")
      return false
    }
    this.socket.connection()
  }

  /**
   * 注册回调消息处理事件
   */
  registerEvents () {
    this.socket.on('event_talk', data => {
      new TalkEvent(data).handle()
    })

    this.socket.on('event_system_message', data => {
      new SystemMessage(data).handle()
    })

    this.socket.on('event_online_status', data => {
      new LoginEvent(data).handle()
    })

    this.socket.on('event_keyboard', data => {
      new KeyboardEvent(data).handle()
    })

    this.socket.on('event_revoke_talk', data => {
      new RevokeEvent(data).handle()
    })

    this.socket.on('event_delete_talk', data => {
      new DeleteEvent(data).handle()
    })

    this.socket.on('event_friend_apply', data => {
      new FriendApplyEvent(data).handle()
    })

    this.socket.on('event_heartbeat', data => {
      new EventHeartbeat(data).handle()
    })

    this.socket.on('event_join_group', data => {
      new GroupJoinEvent(data).handle()
    })

    this.socket.on('event_error', data => {
      ElNotification.warning({
        title: '友情提示',
        message: data.message,
      })
    })
  }

  /**
   * 更新 WebSocket 连接状态
   *
   * @param {Boolean} status 连接状态
   */
  updateSocketStatus (status) {
    // useAppStore().updateSocketStatus(status)
  }

  /**
   * 聊天发送数据
   *
   * @param {Object} message
   */
  send (message) {
    this.socket.send(message)
  }

  /**
   * 推送消息
   *
   * @param {String} event 事件名
   * @param {Object} data 数据
   */
  emit (event, data) {
    this.socket.emit(event, data)
  }
}

export default new SocketInstance()
