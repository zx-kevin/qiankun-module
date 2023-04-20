/*
 * @Author: K
 * @Date: 2023-02-27 16:29:55
 * @Descripttion: 数据源 API
 * @FilePath: \decision_engine_ui\src\api\module\dataSource\index.js
 * @LastEditors: K
 * @LastEditTime: 2023-02-27 17:39:21
 */

import request from '@/utils/request';

// 查询数据源分页
export function getSourcePageApi(query) {
  return request({
    url: '/decision/source/getSourcePage',
    method: 'get',
    params: query,
  });
}

// 查询数据源分页
export function getSourceDetailApi(query) {
  return request({
    url: '/decision/source/getSourceDetail',
    method: 'get',
    params: query,
  });
}

// 查询数据源选择框选项
export function getSourceOptionsApi(query) {
  return request({
    url: '/decision/source/getSourceOptions',
    method: 'get',
    params: query,
  });
}

// 新增数据源
export function insertSourceApi(data) {
  return request({
    url: '/decision/source/insertSource',
    method: 'post',
    data,
  });
}

// 修改数据源
export function updateSourceApi(data) {
  return request({
    url: '/decision/source/updateSource',
    method: 'put',
    data,
  });
}

// 删除数据源
export function deleteSourceApi(sourceIds) {
  return request({
    url: '/decision/source/deleteSource',
    method: 'delete',
    params: { sourceIds },
  });
}
