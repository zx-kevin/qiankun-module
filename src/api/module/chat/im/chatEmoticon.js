import request from '@/utils/request'

// 收藏表情包服务接口
export function collectChatEmoticonItem(data) {
  return request({
    url: 'sysAdmin/chatEmoticonItem/collectChatEmoticonItem',
    method: 'post',
    data: JSON.stringify(data)
  })
}


// 查询用户表情包服务接口
export function queryMyChatEmoticonItemRes() {
  return request({
    url: 'sysAdmin/chatEmoticonItem/queryMyChatEmoticonItemRes',
    method: 'post'
  })
}

// 查询系统表情包服务接口
export function queryChatSystemEmoticonItemPageResList(data) {
  return request({
    url: 'sysAdmin/chatEmoticonItem/queryChatSystemEmoticonItemPageResList',
    method: 'post',
    data: JSON.stringify(data)
  })
}

// 设置用户表情包服务接口
export function saveChatEmoticonItem(data) {
  return request({
    url: 'sysAdmin/chatEmoticonItem/saveChatEmoticonItem',
    method: 'post',
    data: JSON.stringify(data)
  })
}


// 上传表情包服务接口
export function uploadDiyChatEmoticonItem(data) {
  return request({
    url: 'sysAdmin/chatEmoticonItem/uploadDiyChatEmoticonItem',
    method: 'post',
    data: data
  })
}

