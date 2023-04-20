import request from '@/utils/request';
import { parseStrEmpty } from '@/utils/jeoho';
import { encrypt } from '@/utils/jsencrypt';

// 查询用户列表
export function listUser(query) {
  return request({
    url: '/system/user/list',
    method: 'get',
    params: query,
  });
}

// 选择框列表
export function selectOptions(userId) {
  return request({
    url: '/system/user/selectOptions/' + parseStrEmpty(),
    method: 'get',
  });
}

// 查询用户详细
export function getUser(userId) {
  return request({
    url: '/system/user/' + parseStrEmpty(userId),
    method: 'get',
  });
}

// 新增用户
export function addUser(data) {
  return request({
    url: '/system/user',
    method: 'post',
    data: data,
  });
}

// 修改用户
export function updateUser(data) {
  return request({
    url: '/system/user',
    method: 'put',
    data: data,
  });
}

// 用户状态修改
export function updateUserStatus(userId, status) {
  const data = {
    userId,
    status,
  };
  return request({
    url: '/system/user/updateUserStatus',
    method: 'put',
    data: data,
  });
}

// 删除用户
export function delUser(userId) {
  return request({
    url: '/system/user/' + userId,
    method: 'delete',
  });
}

// 用户密码重置
export function resetUserPwd(userId, password) {
  const data = {
    userId,
    password,
  };
  return request({
    url: '/system/user/resetPwd',
    method: 'put',
    data: data,
  });
}

// 查询用户个人信息
export function getUserProfile() {
  return request({
    url: '/system/user/profile',
    method: 'get',
  });
}

// 修改用户个人信息
export function updateUserProfile(data) {
  return request({
    url: '/system/user/profile',
    method: 'put',
    data: data,
  });
}

// 用户密码重置
export function updateUserPwd(oldPassword, newPassword) {
  const data = {
    oldPassword: encrypt(oldPassword),
    newPassword: encrypt(newPassword),
  };
  return request({
    url: '/system/user/profile/updatePwd',
    method: 'post',
    data,
  });
}

// 用户头像上传
export function uploadAvatar(data) {
  return request({
    url: '/system/user/profile/avatar',
    method: 'post',
    data: data,
  });
}

// 查询授权角色
export function getAuthRole(userId) {
  return request({
    url: '/system/user/authRole/' + userId,
    method: 'get',
  });
}

// 保存授权角色
export function updateAuthRole(data) {
  return request({
    url: '/system/user/authRole',
    method: 'put',
    params: data,
  });
}

// 创建邀请链接
export function createLinkApi(data) {
  return request({
    url: '/system/invite/createLink',
    method: 'post',
    data,
  });
}
