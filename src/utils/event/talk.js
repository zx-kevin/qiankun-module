/*
 * @Author: 杰 xuyongfeng@jeoho.com
 * @Date: 2023-02-08 11:54:06
 * @LastEditors: 杰 xuyongfeng@jeoho.com
 * @LastEditTime: 2023-02-17 18:25:14
 * @FilePath: \decision_engine_ui\src\utils\event\talk.js
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
 */
import Base from './base'
import { nextTick, h } from 'vue'
// import vm from '@/src/main'
import NewMessageNotify from '@/components/DuoJuHe/Chat/notify/NewMessageNotify'
import { cleanUnreadNumApi, insertUsersChatListApi } from '@/api/module/chat/im/chatList'
import { formateTalkItem, findTalkIndex, toTalk } from '@/utils/talk'
import { useDict } from '@/utils/dict.js'
import { parseTime } from '@/utils/functions'
import router from '@/router'
import SocketInstance from '@/utils/socket-instance'

/**
 * 好友状态事件
 */
class Talk extends Base {
  /**
   * @var resource 资源
   */
  resource

  /**
   * 发送者ID
   */
  sendUserId = 0

  /**
   * 接收者ID
   */
  groupId = 0

  /**
   * 聊天类型[1:私聊;2:群聊;]
   */
  listId = 0

  groupName = ''
  /**
   * 初始化构造方法
   *
   * @param {Object} resource Socket消息
   */
  constructor (resource) {
    super()
    // console.log(resource);
    this.sendUserId = resource.sendUserId
    this.groupId = resource.groupId
    this.listId = resource.listId
    this.groupName = resource.groupName || ''

    this.resource = resource
  }

  /**
   * 判断消息发送者是否来自于我
   * @returns
   */
  isCurrSender () {
    return this.sendUserId == this.getAccountId()
  }

  /**
   * 获取对话索引
   *
   * @return String
   */
  getIndexName () {
    // if (this.listId == 2) {
    //   return `${this.listId}_${this.groupId}`
    // }

    // let groupId = this.isCurrSender() ? this.groupId : this.sendUserId

    return `${this.groupId}_${this.groupId}`
  }

  /**
   * 消息浮动方式
   *
   * @returns
   */
  getFloatType () {
    let userId = this.resource.sendUserId
    if (userId == -1) return 'center'
    return userId == this.getAccountId() ? 'right' : 'left'
  }

  /**
   * 获取聊天列表左侧的对话信息
   */
  getTalkText () {
    let text;
    switch (Number(this.resource.msgType)) {
      case 0:
        text = '[文本消息]'
        break
      case 1:
        text = '[文件消息]'
        break
      case 2:
        // let fileType = this.resource.fileType
        // text = fileType == 0 ? '[图片消息]' : '[文件消息]'
        text = '[代码消息]'
        break
      case 3:
        text = '[投票消息]'
        break
      case 4:
        text = '[入群退群消息]'
        break
      case 5:
        text = '[视频消息]'
        break
      case 6:
        text = '[群组公告]'
        break
      case 7:
        text = '[好友申请]'
        break
      case 8:
        text = '[登录提醒]'
        break
      case 9:
        text = '[入群退群消息]'
        break
      default:
        text = '[系统消息]'
    }

    return text
  }

  handle () {
    let { im_notify } = this.getStoreInstance()
    // 判断当前是否在聊天页面

    if (!this.isTalkPage()) {
      im_notify.INCR_UNREAD_NUM()

      // 判断消息是否来自于我自己，否则会提示消息通知
      return !this.isCurrSender() && this.showMessageNotice()
    }

    // 判断会话列表是否存在，不存在则创建
    if (findTalkIndex(this.getIndexName()) == -1) {
      console.log(this.getIndexName());
      console.log(findTalkIndex(this.getIndexName()) == -1);
      return this.addTalkItem()
    }

    let isTrue = this.isTalk(this.listId, this.groupId, this.sendUserId)
    // console.log("isTrue", isTrue);
    // 判断当前是否正在和好友对话
    if (isTrue) {
      this.insertTalkRecord()
    } else {
      this.updateTalkItem()
    }
  }

  // 调用chrome消息通知器
  // 播放消息声音
  popNotice (message) {
    let that = this
    if (Notification.permission == 'granted') {
      let notification = new Notification('收到一条新消息', {
        body: this.getTalkText(),
        icon: message.avatar || '',
        tag: 'renotify',
        renotify: true
      })
      notification.onclick = function (e) {
        that.$nextTick(() => {
          setTimeout(() => {
            //具体操作
          }, 500)
        })
        //可直接打开通知notification相关联的tab窗
        window.focus()
        notification.close()
      }
      console.log('浏览器通知！')
    } else {
      console.log('声音通知！')
      const audio = document.getElementById('chatAudio')
      // 从头播放
      audio.currentTime = 0
      audio.play()
    }
  }

  /**
   * 显示消息提示
   * @returns
   */
  showMessageNotice () {
    if ('/chat/message' !== router.currentRoute.path) {
      return
    }
    let avatar
    let realName = this.resource.realName || ''
    let listId = this.resource.listId
    let groupId = this.groupId
    if (listId) {
      avatar = this.resource.groupAvatar
      realName += `【 ${this.resource.groupName} 】`
    } else {
      avatar = this.resource.headPortrait
      realName += `【 ${this.resource.realName} 】`
      groupId = this.sendUserId
    }
    this.$notify({
      message: h(NewMessageNotify, {
        props: {
          avatar,
          listId,
          realName,
          content: this.getTalkText(),
          datetime: this.resource.createTime,
        },
      }),
      customClass: 'im-notify',
      duration: 3000,
      position: 'top-right',
      onClick: function () {
        this.close()
        toTalk(this.groupId, this.groupName, this.listId)
      },
    })
  }

  /**
   * 加载对接节点
   */
  addTalkItem () {
    let { im_talks } = this.getStoreInstance()
    let groupId = this.groupId
    let listId = this.listId
    if (listId == 1 && this.groupId != this.getAccountId()) {
      groupId = this.groupId
    } else if (listId == 2) {
      groupId = this.groupId
    }
    // insertUsersChatListApi({
    //   listId: listId,
    //   groupId: groupId,
    // }).then(response => {
    //   im_talks.PUSH_TALK_ITEM(formateTalkItem(response.data))
    // })
  }


  /**
   * 插入对话记录
   */
  insertTalkRecord () {
    let { im_dialogue, im_talks } = this.getStoreInstance()
    let record = this.resource
    // console.log(record);
    record.float = this.getFloatType()

    im_dialogue.PUSH_DIALOGUE(record)

    // 获取聊天面板元素节点
    let el = document.getElementById('duoJuHeChatPanel')

    // 判断的滚动条是否在底部
    let isBottom = Math.ceil(el.scrollTop) + el.clientHeight >= el.scrollHeight

    if (isBottom || record.userId == this.getAccountId()) {
      nextTick(() => {
        el.scrollTop = el.scrollHeight
      })
    } else {
      im_talks.SET_TALK_UNREAD_MESSAGE({
        content: this.getTalkText(),
        realName: record.realName,
      })
    }
    im_talks.UPDATE_TALK_ITEM({
      indexName: this.getIndexName(),
      msgText: this.getTalkText(),
      updateTime: parseTime(new Date()),
    })
    if (this.listId === 1 && this.getAccountId() !== this.sendUserId) {
      cleanUnreadNumApi({
        listId: this.listId,
        receiverId: this.sendUserId,
      })
    } else if (this.listId === 2 && this.getAccountId() !== this.sendUserId) {
      cleanUnreadNumApi({
        listId: this.listId,
        receiverId: this.sendUserId,
      })
    }
  }

  /**
   * 更新对话列表记录
   */
  updateTalkItem () {
    let { im_notify, im_talks } = this.getStoreInstance()

    im_notify.INCR_UNREAD_NUM()
    im_talks.UPDATE_TALK_MESSAGE({
      indexName: this.getIndexName(),
      msgText: this.getTalkText(),
      updateTime: parseTime(new Date()),
    })
    //发送websocket消息
    /*SocketInstance.emit('send', "echo")*/
  }
}

export default Talk
