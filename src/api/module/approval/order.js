/*
 * @Author: yangxiong yangxiong@jeoho.com
 * @Date: 2023-02-14 10:59:25
 * @LastEditors: yangxiong yangxiong@jeoho.com
 * @LastEditTime: 2023-04-11 19:41:09
 * @FilePath: \decision_engine_ui\src\api\module\resource\product.js
 * @Description: 审批单
 */
import request from '@/utils/request';

// 查询审批订单分页
export function getApproOrderPageApi(query) {
  return request({
    url: '/appro/order/getOrderPage',
    method: 'get',
    params: query,
  });
}

// 查询审批流选择框选项
export function getFlowOptionsApi(query) {
  return request({
    url: '/appro/flow/getFlowOptions',
    method: 'get',
    params: query,
  });
}

// 查询审批订单详细
export function getOrderDetailApi(query) {
  return request({
    url: '/appro/order/getOrderDetail',
    method: 'get',
    params: query,
  });
}

// 新增审批订单
export function insertOrderApi(data) {
  return request({
    url: 'appro/order/insertOrder',
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

// 查询资源产品选择框选项
export function getProductOptionsApi(params) {
  return request({
    url: '/resource/product/getProductOptions',
    method: 'get',
    params,
  });
}

// 审批同意
export function orderAgreeApi(data) {
  return request({
    url: '/appro/order/agree',
    method: 'post',
    data,
  });
}

// 审批撤销
export function orderCancelApi(data) {
  return request({
    url: '/appro/order/cancel',
    method: 'post',
    data,
  });
}

// 审批参与评论
export function orderCommentApi(data) {
  return request({
    url: '/appro/order/comment',
    method: 'post',
    data,
  });
}

// 审批加签
export function orderCountersignApi(data) {
  return request({
    url: '/appro/order/countersign',
    method: 'post',
    data,
  });
}

// 审批拒绝
export function orderRefuseignApi(data) {
  return request({
    url: '/appro/order/refuse',
    method: 'post',
    data,
  });
}

// 审批转交
export function orderDeliverApi(data) {
  return request({
    url: '/appro/order/deliver',
    method: 'post',
    data,
  });
}

// 审批退回
export function orderRollBackApi(data) {
  return request({
    url: '/appro/order/rollBack',
    method: 'post',
    data,
  });
}

// 查询可退回的操作步骤
export function getOperateProcessApi(id) {
  return request({
    url: '/appro/orderProcess/getOperateProcess/' + id,
    method: 'get',
  });
}