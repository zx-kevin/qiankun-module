import request from '@/utils/request'

// 查询用户群聊服务接口
export function getGroupPageApi (data) {
  return request({
    url: '/chat/group/getGroupPage',
    method: 'get',
    params: data
  })
}


// 获取群信息服务接口
export function getGroupDetailApi (data) {
  return request({
    url: '/chat/group/getGroupDetail',
    method: 'get',
    params: data
  })
}

// 创建群聊服务接口
export function insertGroupApi (data) {
  return request({
    url: '/chat/group/insertGroup',
    method: 'post',
    data
  })
}

// 修改群信息
export function updateChatGroup (data) {
  return request({
    url: 'sysAdmin/chatGroup/updateChatGroup',
    method: 'post',
    data: JSON.stringify(data)
  })
}
// 修改群头像
export function updateGroupAvtarApi (data) {
  return request({
    url: '/chat/group/updateGroupAvtar',
    method: 'get',
    params: data
  })
}
// 修改群简介
export function updateGroupIntroduceApi (data) {
  return request({
    url: '/chat/group/updateGroupIntroduce',
    method: 'get',
    params: data
  })
}
// 修改群名称
export function updateGroupNameApi (data) {
  return request({
    url: '/chat/group/updateGroupName',
    method: 'get',
    params: data
  })
}


// 设置群组全员禁言
export function updateGroupMuteApi (data) {
  return request({
    url: '/chat/group/updateGroupMute',
    method: 'get',
    params: data
  })
}

// 邀请好友加入群聊服务接口
export function insertGroupUserApi (data) {
  return request({
    url: '/chat/groupUser/insertGroupUser',
    method: 'post',
    data
  })
}


// 移除群聊成员服务接口
export function deleteGroupUserApi (data) {
  return request({
    url: '/chat/groupUser/deleteGroupUser',
    method: 'delete',
    params: data
  })
}


// 管理员解散群聊服务接口
export function deleteGroupApi (data) {
  return request({
    url: '/chat/group/deleteGroup',
    method: 'delete',
    params: data
  })
}


// 退出群组
export function quitGroupUserApi (data) {
  return request({
    url: '/chat/groupUser/quitGroupUser',
    method: 'delete',
    params: data
  })
}


// 修改群聊名片服务接口
export function updateUserChatGroupVisitCard (data) {
  return request({
    url: 'sysAdmin/chatGroup/updateUserChatGroupVisitCard',
    method: 'post',
    data: JSON.stringify(data)
  })
}

// 获取用户可邀请加入群组的好友列表
export function queryInviteChatGroupUserPageResList (data) {
  return request({
    url: '/system/user/list',
    method: 'get',
    params: data
  })
}

// 获取群组成员列表
export function getGroupUserPageApi (data) {
  return request({
    url: '/chat/groupUser/getGroupUserPage',
    method: 'get',
    params: data
  })
}

// 获取群组公告列表
export function queryChatGroupNoticePageResList (data) {
  return request({
    url: 'sysAdmin/chatGroup/queryChatGroupNoticePageResList',
    method: 'post',
    data: JSON.stringify(data)
  })
}


// 设置群公告
export function updateGroupNoticeApi (data) {
  return request({
    url: '/chat/group/updateGroupNotice',
    method: 'get',
    params: data
  })
}

// 转让群主
export function updateGroupleaderApi (data) {
  return request({
    url: '/chat/groupUser/updateGroupleader',
    method: 'get',
    params: data
  })
}

// 设置群管理员
export function updateGroupUserTypeApi (data) {
  return request({
    url: '/chat/groupUser/updateGroupUserType',
    method: 'get',
    params: data
  })
}

// 设置用户禁言
export function muteGroupUserApi (data) {
  return request({
    url: '/chat/groupUser/muteGroupUser',
    method: 'get',
    params: data
  })
}

// 设置群昵称
export function groupNickNameGroupUserApi (data) {
  return request({
    url: '/chat/groupUser/groupNickNameGroupUser',
    method: 'get',
    params: data
  })
}

// 群上传头像返回路径
export function avatarFileApi (data) {
  return request({
    url: '/chat/common/avatarFile',
    method: 'post',
    data
  })
}
// 群上传文件返回路径
export function chatFileApi (data) {
  return request({
    url: '/chat/common/chatFile',
    method: 'post',
    data
  })
}

// 群上传文件返回路径
export function postvideoAcceptUpload (data) {
  return request({
    url: '/im/videoBreakpoint/uploadVideoFile',
    method: 'post',
    data
  })
}

// 导出聊天记录 -pdf
export function exportGroupMsgListApi (data) {
  return request({
    url: '/chat/groupMsg/exportGroupMsgList',
    method: 'get',
    params: data
  })
}

// 导出聊天记录 -pdf
export function getDomainApi (data) {
  return request({
    url: '/chat/common/getDomain',
    method: 'post',
  })
}
