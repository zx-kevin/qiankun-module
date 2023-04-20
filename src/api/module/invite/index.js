/*
 * @Author: K
 * @Date: 2023-03-29 10:55:49
 * @Descripttion: 组织邀请页面 API
 * @FilePath: \decision_engine_ui\src\api\module\invite\index.js
 * @LastEditors: K
 * @LastEditTime: 2023-03-29 10:56:05
 */

import request from '@/utils/request';

// 查询待加入信息
export function getInvitationInfoApi(query) {
  return request({
    url: '/system/invite/getInvitationInfo',
    method: 'get',
    params: query,
  });
}

// 加入组织
export function joinOrgApi(query) {
  return request({
    url: '/system/invite/joinOrg',
    method: 'post',
    params: query,
  });
}
