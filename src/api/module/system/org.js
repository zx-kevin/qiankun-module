/*
 * @Author: yangxiong yangxiong@jeoho.com
 * @Date: 2023-03-09 09:13:44
 * @LastEditors: yangxiong yangxiong@jeoho.com
 * @LastEditTime: 2023-03-17 11:40:59
 * @FilePath: \decision_engine_ui\src\api\module\system\org.js
 * @Description: 组织管理 api
 */
import request from '@/utils/request';

// 查询组织管理列表
export function getOrgPageApi(query) {
  return request({
    url: '/system/org/getOrgPage',
    method: 'get',
    params: query,
  });
}

// 查询组织管理详情
export function getOrgDetailApi(query) {
  return request({
    url: '/system/org/getOrgDetail',
    method: 'get',
    params: query,
  });
}

// 添加组织管理
export function insertOrgApi(data) {
  return request({
    url: '/system/org/insertOrg',
    method: 'post',
    data,
  });
}

// 删除组织管理
export function deleteOrgApi(query) {
  return request({
    url: '/system/org/deleteOrg/',
    method: 'delete',
    params: query,
  });
}

// 修改组织管理
export function updateOrgApi(data) {
  return request({
    url: '/system/org/updateOrg',
    method: 'put',
    data,
  });
}

// 查询套餐选择框选项
export function getPackageOptionsApi(params) {
  return request({
    url: '/system/package/getPackageOptions',
    method: 'get',
    params,
  });
}


// 查询个体选择框选项
export function getPeopleOptionsApi(params) {
  return request({
    url: '/system/people/getPeopleOptions',
    method: 'get',
    params,
  });
}
