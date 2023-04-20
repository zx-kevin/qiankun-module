/*
 * @Author: K
 * @Date: 2023-04-03 14:24:51
 * @Descripttion: 决策 - 订单 API
 * @FilePath: \decision_engine_ui\src\api\module\decision\order.js
 * @LastEditors: K
 * @LastEditTime: 2023-04-03 14:41:24
 */

import request from '@/utils/request';

// 查询订单分页
export function getOrderPageApi(query) {
  return request({
    url: '/decision/order/getOrderPage',
    method: 'get',
    params: query,
  });
}

// 查询订单详细
export function getOrderDetailApi(query) {
  return request({
    url: '/decision/order/getOrderDetail',
    method: 'get',
    params: query,
  });
}
