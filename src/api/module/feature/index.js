/*
 * @Author: K
 * @Date: 2023-02-27 14:46:54
 * @Descripttion: 特征库 API
 * @FilePath: \decision_engine_ui\src\api\module\feature\index.js
 * @LastEditors: K
 * @LastEditTime: 2023-03-22 09:53:56
 */

import request from '@/utils/request';

// 查询特征库分页
export function getLibFeaturePageApi(query) {
  return request({
    url: '/decision/libFeature/getLibFeaturePage',
    method: 'get',
    params: query,
  });
}

// 查询特征库选择框选项
export function getLibFeatureOptionsApi(query) {
  return request({
    url: '/decision/libFeature/getLibFeatureOptions',
    method: 'get',
    params: query,
  });
}

// 新增特征库
export function insertLibFeatureApi(data) {
  return request({
    url: '/decision/libFeature/insertLibFeature',
    method: 'post',
    data,
  });
}

// 修改特征库
export function updateLibFeatureApi(data) {
  return request({
    url: '/decision/libFeature/updateLibFeature',
    method: 'put',
    data,
  });
}

// 删除特征库
export function deleteLibFeatureApi(featureIds) {
  return request({
    url: '/decision/libFeature/deleteLibFeature',
    method: 'delete',
    params: {
      featureIds,
    },
  });
}

// 修改特征库状态
export function updateLibFeatureStatusApi(data) {
  return request({
    url: '/decision/libFeature/updateLibFeatureStatus',
    method: 'put',
    params: data,
  });
}
