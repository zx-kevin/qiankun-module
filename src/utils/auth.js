/*
 * @Author: 杰 xuyongfeng@jeoho.com
 * @Date: 2023-02-01 15:01:35
 * @LastEditors: 杰 xuyongfeng@jeoho.com
 * @LastEditTime: 2023-02-16 11:50:18
 * @FilePath: \decision_engine_ui\src\utils\auth.js
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
 */
import Cookies from 'js-cookie'

import useAppStore from '@/store/modules/app.js';
const TokenKey = 'Admin-Token'
export function getToken () {
  return Cookies.get(TokenKey)
}

export function setToken (token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken () {
  return Cookies.remove(TokenKey)
}
/**
 * 获取服务端接口连接地址
 * @returns {string}
 */
export function getAppApiUrl () {
  // 判断开发环境（一般用于本地代理）
  if (import.meta.env.VITE_APP_ENV === 'development') {
    return import.meta.env.VITE_APP_BASE_API
  } else {
    return import.meta.env.VITE_APP_BASE_API
  }
}

/**
 * 获取websocket连接地址
 * @returns {string|*}
 */
export function getAppWebsocketUrl () {

  let appStore = useAppStore();
  let { chatDomain, videoDomain } = appStore.doMain;
  let urlSuffix = "/chat";
  let socket_url = window.location.protocol == 'http:' ? import.meta.env.VITE_APP_WEB_SOCKET_URL : import.meta.env.VITE_APP_WEB_SOCKET_URL_S
  if (chatDomain) {
    socket_url = chatDomain
  }
  // 判断开发环境（一般用于本地代理）
  if (import.meta.env.VITE_APP_ENV === 'development') {
    return socket_url + urlSuffix
  } else {
    return socket_url + urlSuffix
  }
}
