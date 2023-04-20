import request from '@/utils/request'

// 分页查询聊天记录接口 获取聊天记录服务接口
// export function queryChatTalkRecordPageResList(data) {
//   return request({
//     url: 'sysAdmin/chatTalkRecord/queryChatTalkRecordPageResList',
//     method: 'post',
//     data: JSON.stringify(data)
//   })
// }



// 获取转发会话记录详情列表服务接口
export function queryChatTalkRecordForwardPageResList (data) {
  return request({
    url: 'sysAdmin/chatTalkRecord/queryChatTalkRecordForwardPageResList',
    method: 'post',
    data: JSON.stringify(data)
  })
}



// 查找聊天记录服务接口
export function getGroupMsgPageApi (data) {
  return request({
    url: '/chat/groupMsg/getGroupMsgPage',
    method: 'get',
    params: data
  })
}

// 发送代码块消息服务接口
export function sendTalkCodeBlock (data) {
  return request({
    url: 'sysAdmin/chatTalkRecord/sendTalkCodeBlock',
    method: 'post',
    data: JSON.stringify(data)
  })
}

// 发送文件消息服务接口
export function sendTalkFile (data) {
  return request({
    url: 'sysAdmin/chatTalkRecord/sendTalkFile',
    method: 'post',
    data: JSON.stringify(data)
  })
}

// 发送图片消息服务接口
export function sendTalkImage (data) {
  return request({
    url: 'sysAdmin/chatTalkRecord/sendTalkImage',
    method: 'post',
    data: data
  })
}

// 发送表情包服务接口
export function sendTalkEmoticon (data) {
  return request({
    url: 'sysAdmin/chatTalkRecord/sendTalkEmoticon',
    method: 'post',
    data: JSON.stringify(data)
  })
}

// 转发消息服务接口
export function forwardTalkRecord (data) {
  return request({
    url: 'sysAdmin/chatTalkRecord/forwardTalkRecord',
    method: 'post',
    data: JSON.stringify(data)
  })
}

// 发送投票服务接口
export function sendTalkVote (data) {
  return request({
    url: 'sysAdmin/chatTalkRecord/sendTalkVote',
    method: 'post',
    data: JSON.stringify(data)
  })
}

// 提交投票服务接口
export function userVoteApi (data) {
  return request({
    url: 'chat/groupMsg/userVote',
    method: 'get',
    params: data
  })
}

// 根据会话id查询投票记录汇总信息
export function getGroupMsgVoteDetailApi (data) {
  return request({
    url: '/chat/groupMsgVote/getGroupMsgVoteDetail',
    method: 'get',
    params: data
  })
}

// 撤回消息服务接口
export function revokeRecordByRecordId (data) {
  return request({
    url: 'sysAdmin/chatTalkRecord/revokeRecordByRecordId',
    method: 'post',
    data: JSON.stringify(data)
  })
}

// 删除消息服务接口
export function deleteRecordByRecordId (data) {
  return request({
    url: 'sysAdmin/chatTalkRecord/deleteRecordByRecordId',
    method: 'post',
    data: JSON.stringify(data)
  })
}

// 批量删除消息服务接口
export function batchDeleteRecordByRecordIdList (data) {
  return request({
    url: 'sysAdmin/chatTalkRecord/batchDeleteRecordByRecordIdList',
    method: 'post',
    data: JSON.stringify(data)
  })
}


