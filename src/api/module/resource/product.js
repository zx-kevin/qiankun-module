/*
 * @Author: yangxiong yangxiong@jeoho.com
 * @Date: 2023-02-14 10:59:25
 * @LastEditors: yangxiong yangxiong@jeoho.com
 * @LastEditTime: 2023-02-14 14:53:52
 * @FilePath: \decision_engine_ui\src\api\module\resource\product.js
 * @Description: 资源产品 API
 */
import request from '@/utils/request';

// 查询资源产品分页
export function getProductPageApi(query) {
  return request({
    url: '/resource/product/getProductPage',
    method: 'get',
    params: query,
  });
}

// 查询资源产品详细
export function getProductDetailApi(query) {
  return request({
    url: '/resource/product/getProductDetail',
    method: 'get',
    params: query,
  });
}

// 新增资源产品
export function insertProductApi(data) {
  return request({
    url: '/resource/product/insertProduct',
    method: 'post',
    data,
  });
}

// 删除资源产品
export function deleteProductApi(ids) {
  return request({
    url: '/resource/product/deleteProduct?productIds=' + ids,
    method: 'delete',
    // params: query,
  });
}

// 修改资源产品
export function updateProductApi(data) {
  return request({
    url: '/resource/product/updateProduct',
    method: 'put',
    data,
  });
}

// 查询资源产品选择框选项
export function getProductOptionsApi(params) {
  return request({
    url: '/resource/product/getProductOptions',
    method: 'get',
    params,
  });
}

// 导出资源产品
export function exportProductApi(params) {
  return request({
    url: '/resource/product/exportProduct',
    method: 'post',
    params,
  });
}
