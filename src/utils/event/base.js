/*
 * @Author: 杰 xuyongfeng@jeoho.com
 * @Date: 2023-02-08 11:54:06
 * @LastEditors: 杰 xuyongfeng@jeoho.com
 * @LastEditTime: 2023-02-17 18:18:49
 * @FilePath: \decision_engine_ui\src\utils\event\base.js
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
 */

import useUserStore from '@/store/modules/user.js'
import dialogue from '@/store/modules/dialogue.js'
import notify from '@/store/modules/notify.js'
import talks from '@/store/modules/talk.js';

import router from '@/router'
import { ElNotification as Notification } from 'element-plus'

class Base {
  /**
   * 初始化
   */
  constructor () {
    this.$notify = Notification
  }

  getStoreInstance () {
    let UserStore = useUserStore()
    let im_dialogue = dialogue()
    let im_notify = notify()
    let im_talks = talks()
    let data = { UserStore, im_dialogue, im_notify, im_talks }
    // console.log(data);
    return data
  }

  /**
   * 获取当前登录用户的ID
   */
  getAccountId () {
    return useUserStore().userId
  }

  getTalkParams () {
    let { listId, groupId, indexName } = dialogue()
    // console.log("getTalkParams", listId, groupId, indexName);
    return { listId, groupId, indexName }
  }

  /**
   * 判断消息是否来自当前对话
   *
   * @param {String} listId 聊天消息类型[群聊;]
   * @param {String} senderId 发送者ID
   * @param {String} receiverId 接收者ID
   *
   */
  isTalk (listId, groupId, senderId) {
    let params = this.getTalkParams()
    // console.log("event_talk", listId, params);
    if (listId != params.listId) {
      return false
    } else if (
      params.groupId == groupId
      // ||
      // params.receiverId === senderId
    ) {
      return true
    }

    return false
  }

  /**
   * 判断用户是否打开对话页
   */
  isTalkPage () {
    let path = toRaw(router)
    path = path.currentRoute.value.path
    return !(path != '/chat/message' && path != '/')
  }
}

export default Base
