import request from '@/utils/request'

// 获取我的好友list 获取好友列表服务接口
export function queryMyChatUsersFriendsPageResList(data) {
  return request({
    url: 'sysAdmin/chatUsersFriends/queryMyChatUsersFriendsPageResList',
    method: 'post',
    data: JSON.stringify(data)
  })
}

// 解除好友关系
export function removeChatFriendByFriendId(data) {
  return request({
    url: 'sysAdmin/chatUsersFriends/removeChatFriendByFriendId',
    method: 'post',
    data: JSON.stringify(data)
  })
}

// 修改好友备注
export function updateFriendRemark(data) {
  return request({
    url: 'sysAdmin/chatUsersFriends/updateFriendRemark',
    method: 'post',
    data: JSON.stringify(data)
  })
}

// 搜索好友接口 搜索联系人
export function querySearchFriendsUserIdBySearchKeyWords(data) {
  return request({
    url: 'sysAdmin/chatUsersFriends/querySearchFriendsUserIdBySearchKeyWords',
    method: 'post',
    data: JSON.stringify(data)
  })
}
// 根据用户id查询用户详情
export function queryChatUsersDetailResByUserId(data) {
  return request({
    url: 'sysAdmin/chatUsersFriends/queryChatUsersDetailResByUserId',
    method: 'post',
    data: JSON.stringify(data)
  })
}
