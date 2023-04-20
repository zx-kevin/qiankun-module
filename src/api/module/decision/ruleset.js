/*
 * @Author: K
 * @Date: 2023-02-22 17:13:16
 * @Descripttion: 规则集  API
 * @FilePath: \decision_engine_ui\src\api\module\decision\ruleset.js
 * @LastEditors: K
 * @LastEditTime: 2023-04-07 14:39:14
 */
import request from '@/utils/request';

// 查询决策分页
export function getDecisionPageApi(query) {
  return request({
    url: '/decision/getDecisionPage',
    method: 'get',
    params: query,
  });
}

// 新增决策
export function insertDecisionApi(data) {
  return request({
    url: '/decision/insertDecision',
    method: 'post',
    data,
    timeout: 0,
    headers: {
      repeatSubmit: false,
    },
  });
}

// 新增决策版本
export function addVersionApi(data) {
  return request({
    url: '/decision/addVersion',
    method: 'post',
    data,
    timeout: 0,
    headers: {
      repeatSubmit: false,
    },
  });
}

// 修改决策
export function updateDecisionApi(data) {
  return request({
    url: '/decision/updateDecision',
    method: 'put',
    data,
    timeout: 0,
    headers: {
      repeatSubmit: false,
    },
  });
}

// 删除决策
export function deleteDecisionApi(decisionNos) {
  return request({
    url: '/decision/deleteDecision',
    method: 'delete',
    params: {
      decisionNos,
    },
  });
}

// 删除版本
export function deleteVersionApi(decisionNo) {
  return request({
    url: `/decision/deleteVersion/${decisionNo}`,
    method: 'delete',
  });
}

// 查询决策详细
export function getDecisionDetailApi(decisionNo) {
  return request({
    url: `/decision/getDecisionDetail/${decisionNo}`,
    method: 'get',
  });
}

// 查询决策版本详细
export function getVersionInfoApi(decisionId) {
  return request({
    url: `/decision/getVersionInfo/${decisionId}`,
    method: 'get',
  });
}

// 决策测试
export function testDecisionApi(data) {
  return request({
    url: '/decision/testDecision',
    method: 'post',
    data,
  });
}

// 修改决策状态
export function updateDecisionStatusApi(data) {
  return request({
    url: '/decision/updateDecisionStatus',
    method: 'post',
    data,
  });
}

// 查询名单库数据列表
export function queryListDataApi(query) {
  return request({
    url: '/decision/queryListData',
    method: 'get',
    params: query,
  });
}

// 新增名单库数据
export function addListDataApi(data) {
  return request({
    url: '/decision/addListData',
    method: 'post',
    data,
  });
}

// 删除名单库数据
export function deleteListDataApi(data) {
  return request({
    url: '/decision/deleteListData',
    method: 'delete',
    data,
  });
}
