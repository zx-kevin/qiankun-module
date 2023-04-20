/*
 * @Author: yangxiong yangxiong@jeoho.com
 * @Date: 2023-02-14 15:01:35
 * @LastEditors: yangxiong yangxiong@jeoho.com
 * @LastEditTime: 2023-02-14 16:07:56
 * @FilePath: \decision_engine_ui\src\api\module\resource\order.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * @description: 资源订单 APi
 * @return {*}
 */
import request from '@/utils/request';

// 查询资源订单分页
export function getOrderPageApi(query) {
  return request({
    url: '/resource/order/getOrderPage',
    method: 'get',
    params: query,
  });
}

// 查询资源订单详细
export function getOrderDetailApi(query) {
  return request({
    url: '/resource/order/getOrderDetail',
    method: 'get',
    params: query,
  });
}


// 查询资源订单选择框选项
export function getOrderOptionsApi(params) {
  return request({
    url: '/resource/order/getOrderOptions',
    method: 'get',
    params,
  });
}

// 导出资源订单
export function exportOrderApi(params) {
  return request({
    url: '/resource/order/exportOrder',
    method: 'post',
    params,
  });
}
