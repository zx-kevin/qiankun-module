/*
 * @Author: 杰 xuyongfeng@jeoho.com
 * @Date: 2023-02-07 18:12:23
 * @LastEditors: 杰 xuyongfeng@jeoho.com
 * @LastEditTime: 2023-02-15 10:25:23
 * @FilePath: \decision_engine_ui\src\api\module\chat\im\chatList.js
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
 */
import request from '@/utils/request'


// 获取我的会话列表 获取聊天列表服务接口
export function queryCountMyUnreadChatMessageNum () {
  return request({
    url: 'sysAdmin/chatList/queryCountMyUnreadChatMessageNum',
    method: 'post'
  })
}


// 获取我的会话列表 获取聊天列表服务接口
export function getUsersChatListPageApi (data) {
  return request({
    url: '/chat/usersChatList/getUsersChatListPage',
    method: 'get',
    params: data
  })
}


// 设置会话是否置顶
export function usersChatListTopApi (data) {
  return request({
    url: 'chat/usersChatList/usersChatListTop',
    method: 'get',
    params: data
  })
}

// 设置会话免打扰
export function disturbGroupUserApi (data) {
  return request({
    url: '/chat/groupUser/disturbGroupUser',
    method: 'get',
    params: data
  })
}


// 设置会话删除
export function deleteUsersChatListApi (data) {
  return request({
    url: '/chat/usersChatList/deleteUsersChatList',
    method: 'delete',
    params: data
  })
}

// 清除未读数量
export function cleanUnreadNumApi (data) {
  return request({
    url: '/chat/usersChatList/cleanUnreadNum',
    method: 'get',
    params: data
  })
}

// 聊天列表创建服务接口
export function insertUsersChatListApi (data) {
  return request({
    url: '/chat/usersChatList/insertUsersChatList',
    method: 'post',
    data
  })
}

