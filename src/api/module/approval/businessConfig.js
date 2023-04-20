/*
 * @Author: yangxiong yangxiong@jeoho.com
 * @Date: 2023-02-14 10:59:25
 * @LastEditors: yangxiong yangxiong@jeoho.com
 * @LastEditTime: 2023-04-11 20:13:19
 * @FilePath: \decision_engine_ui\src\api\module\resource\product.js
 * @Description: 审配配置 API
 */
import request from '@/utils/request';

// 查询审配配置分页
export function getBusinessConfigPageApi(params) {
  return request({
    url: '/appro/businessConfig/getBusinessConfigPage',
    method: 'get',
    params: params,
  });
}

// 查询审配配置详细
export function getBusinessConfigDetailApi(query) {
  return request({
    url: '/appro/businessConfig/getBusinessConfigDetail',
    method: 'get',
    params: query,
  });
}

// 新增审配配置
export function insertBusinessConfigApi(data) {
  return request({
    url: '/appro/businessConfig/insertBusinessConfig',
    method: 'post',
    data,
  });
}

// 删除审配配置
export function deleteBusinessConfigApi() {
  return request({
    url: '/appro/businessConfig/deleteBusinessConfig',
    method: 'delete',
    params: query,
  });
}

// 修改审配配置
export function updateBusinessConfigApi(data) {
  return request({
    url: '/appro/businessConfig/updateBusinessConfig',
    method: 'put',
    data,
  });
}

// 查询业务类型
export function getBusinessTypeApi() {
  return request({
    url: '/appro/businessType/getBusinessType',
    method: 'get',
  });
}

// // 查询资源产品选择框选项
// export function getProductOptionsApi(params) {
//   return request({
//     url: '/resource/product/getProductOptions',
//     method: 'get',
//     params,
//   });
// }

// // 导出资源产品
// export function exportProductApi(params) {
//   return request({
//     url: '/resource/product/exportProduct',
//     method: 'post',
//     params,
//   });
// }
