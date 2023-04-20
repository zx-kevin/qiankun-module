/*
 * @Author: yangxiong yangxiong@jeoho.com
 * @Date: 2023-03-10 15:51:50
 * @LastEditors: yangxiong yangxiong@jeoho.com
 * @LastEditTime: 2023-04-14 10:46:45
 * @FilePath: \decision_engine_ui\src\api\module\decision\flow.js
 * @Description: 决策流
 */

import request from '@/utils/request';

// 查询决策流分页
export function getFlowPageApi(query) {
  return request({
    url: '/decision/flow/getFlowPage',
    method: 'get',
    params: query,
  });
}

// 查询决策流详细
export function getFlowDetailApi(flowNo) {
  return request({
    url: '/decision/flow/getFlowDetail/' + flowNo,
    method: 'get',
  });
}
// 查询决策流版本详细
export function getVersionInfoApi(flowId) {
  return request({
    url: '/decision/flow/getVersionInfo/' + flowId,
    method: 'get',
  });
}

// 新增决策流
export function postInsertFlowApi(data) {
  return request({
    url: '/decision/flow/insertFlow',
    method: 'post',
    data,
    timeout: 0,
    headers: {
      repeatSubmit: false,
    },
  });
}

// 修改决策节点
export function updateFlowApi(data) {
  return request({
    url: '/decision/flow/updateFlow',
    method: 'put',
    data,
  });
}

// 查询版本
export function getFlowListApi(params) {
  return request({
    url: '/decision/flow/getFlowList',
    method: 'get',
    params,
  });
}

// 删除决策流
export function deleteFlowApi(flowNos) {
  return request({
    url: '/decision/flow/deleteFlow?flowNos=' + flowNos,
    method: 'delete',
  });
}

// 测试决策流
export function testFlowApi(data) {
  return request({
    url: '/decision/flow/testFlow',
    method: 'post',
    data,
    timeout: 0,
  });
}

// 新增决策流版本
export function addVersionApi(data) {
  return request({
    url: '/decision/flow/addVersion',
    method: 'post',
    data,
  });
}

// 部署决策流
export function postArrangeApi(data) {
  return request({
    url: '/decision/flow/arrange',
    method: 'post',
    data,
  });
}

// 删除决策流版本
export function deleteVersionApi(flowId) {
  return request({
    url: 'decision/flow/deleteVersion/' + flowId,
    method: 'delete',
  });
}

// 查询决策分页
export function getDecisionListApi(params) {
  return request({
    url: '/decision/flow/getDecisionList',
    method: 'get',
    params,
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
    params: params,
  });
}
