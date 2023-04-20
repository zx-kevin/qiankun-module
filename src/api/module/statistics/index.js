/*
 * @Author: K
 * @Date: 2023-03-29 17:16:48
 * @Descripttion: 决策统计 接口
 * @FilePath: \decision_engine_ui\src\api\module\statistics\index.js
 * @LastEditors: K
 * @LastEditTime: 2023-03-29 17:17:07
 */
import request from '@/utils/request';

// 查询数据源分页
export function analyseApi(query) {
  return request({
    url: '/decision/analyse/analyse',
    method: 'get',
    params: query,
  });
}

// 决策流结果统计
export function flowResultCountApi(query) {
  return request({
    url: '/decision/analyse/flowResultCount',
    method: 'get',
    params: query,
  });
}

// 决策结果统计
export function resultCountApi(query) {
  return request({
    url: '/decision/analyse/resultCount',
    method: 'get',
    params: query,
  });
}
