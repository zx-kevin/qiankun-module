/*
 * @Author: yangxiong yangxiong@jeoho.com
 * @Date: 2023-03-10 15:51:50
 * @LastEditors: yangxiong yangxiong@jeoho.com
 * @LastEditTime: 2023-03-30 16:45:29
 * @FilePath: \decision_engine_ui\src\api\module\approval\config.js
 * @Description: 审批流配置
 */

import request from '@/utils/request';

// 查询审批流分页
export function getFlowPageApi(query) {
  return request({
    url: '/appro/flow/getFlowPage',
    method: 'get',
    params: query,
  });
}

// 查询审批流详细
export function getFlowDetailApi(query) {
  return request({
    url: 'appro/flow/getFlowDetail',
    method: 'get',
    params: query,
  });
}

// 添加审批节点
export function postInsertFlowApi(data) {
  return request({
    url: '/appro/flow/insertFlow',
    method: 'post',
    data,
  });
}

// 修改审批节点
export function updateFlowApi(data) {
  return request({
    url: '/appro/flow/updateFlow',
    method: 'put',
    data,
  });
}

// 删除审批节点
export function deleteFlowApi(id) {
  return request({
    url: '/appro/flow/deleteFlow/' + id,
    method: 'DELETE',
  });
}

// 查询组织架构树
export function getSubjectTreeApi(params) {
  return request({
    url: '/appro/flow/getSubjectTree',
    method: 'get',
    params,
  });
}

// 搜索人员
export function getUserByPingYin(params) {
  return request({
    url: '/appro/flow/getUserByPingYin',
    method: 'get',
    params,
  });
}

// 改变状态
export function updateFlowStatusApi(data) {
  return request({
    url: '/appro/flow/updateFlowStatus',
    method: 'put',
    data,
  });
}
