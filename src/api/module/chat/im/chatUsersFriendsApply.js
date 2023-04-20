import request from '@/utils/request'

// 【好友申请服务接口】分页查询好友申请服务接口
export function queryMyChatUsersFriendsApplyPageResList(data) {
  return request({
    url: 'sysAdmin/chatUsersFriendsApply/queryMyChatUsersFriendsApplyPageResList',
    method: 'post',
    data: JSON.stringify(data)
  })
}

// 好友申请服务接口
export function saveChatUsersFriendsApply(data) {
  return request({
    url: 'sysAdmin/chatUsersFriendsApply/saveChatUsersFriendsApply',
    method: 'post',
    data: JSON.stringify(data)
  })
}

// 同意 处理好友申请服务接口
export function acceptChatUsersFriendsApply(data) {
  return request({
    url: 'sysAdmin/chatUsersFriendsApply/acceptChatUsersFriendsApply',
    method: 'post',
    data: JSON.stringify(data)
  })
}

// 拒绝 处理好友申请服务接口
export function declineChatUsersFriendsApply(data) {
  return request({
    url: 'sysAdmin/chatUsersFriendsApply/declineChatUsersFriendsApply',
    method: 'post',
    data: JSON.stringify(data)
  })
}

// 查询好友申请未读数量服务接口
export function queryMyChatUsersFindFriendApplyNum() {
  return request({
    url: 'sysAdmin/chatUsersFriendsApply/queryMyChatUsersFindFriendApplyNum',
    method: 'post'
  })
}
