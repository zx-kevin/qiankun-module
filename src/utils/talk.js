/*
 * @Author: 杰 xuyongfeng@jeoho.com
 * @Date: 2023-02-07 18:12:25
 * @LastEditors: 杰 xuyongfeng@jeoho.com
 * @LastEditTime: 2023-02-17 18:27:58
 * @FilePath: \decision_engine_ui\src\utils\talk.js
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
 */
import talk from '@/store/modules/talk';
import router from '@/router'
import { parseTime } from '@/utils/duojuhe'
import { insertUsersChatListApi } from '@/api/module/chat/im/chatList'
// let { talkItems, talkNum, items: talks } = storeToRefs(talk());

const KEY_INDEX_NAME = 'send_message_index_name'
/**
 * 通过对话索引查找对话列表下标
 *
 * @param {String} indexName
 */
export function findTalkIndex (indexName) {
  let im_talk = talk()
  let talks = im_talk.items
  // console.log("talks.js", talks, indexName);
  return talks.findIndex(
    item => item.indexName == indexName
  )
}

/**
 * 通过对话索引查找对话列表
 *
 * @param {String} indexName
 */
export function findTalk (indexName) {
  let im_talk = talk()
  let talks = im_talk.items
  // console.log(talks);
  return talks.find(item => item.indexName == indexName)
}

/**
 * 格式化聊天对话列表数据
 * listId -> listId
 * listId-> groupId
 * @param {Object} params
 */
export function formateTalkItem (params) {
  let options = {
    id: 0,
    listId: 1,
    groupId: 0,
    realName: '未设置昵称',
    friendRemark: '',
    headPortrait: '',
    isDisturb: 0,
    isTop: 0,
    isOnline: 0,
    unreadNum: 0,
    content: '......',
    draftText: '',
    msgText: '',
    indexName: '',
    createTime: parseTime(new Date()),
  }

  Object.assign(options, params)
  options.indexName = `${options.groupId}_${options.groupId}`

  return options
}

/**
 * 打开指定对话窗口
 *
 * @param {Integer} groupId 
 * @param {Integer} groupname 
 */
export function toTalk (groupId, groupName, listId) {
  insertUsersChatListApi({
    groupId,
    groupName,
  }).then(({ code, data }) => {
    sessionStorage.setItem(KEY_INDEX_NAME, `${groupId}_${groupId}`)
    router.push({
      path: '/chat/message',
      query: {
        v: new Date().getTime(),
      },
    })
  })
}

/**
 * 获取需要打开的对话索引值
 *
 * @returns
 */
export function getCacheIndexName () {
  let indexName = sessionStorage.getItem(KEY_INDEX_NAME)
  if (indexName) {
    sessionStorage.removeItem(KEY_INDEX_NAME)
  }

  return indexName
}
