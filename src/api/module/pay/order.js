import request from '@/utils/request';

// 查询支付订单分页
export function payOrderGetOrderPageApi (params) {
  return request({
    url: '/pay/order/getOrderPage',
    method: 'get',
    params,
  });
}

// 新增支付订单
export function payOrderInsertOrderApi (data) {
  return request({
    url: '/pay/order/insertOrder',
    method: 'post',
    data,
  });
}

// 修改支付订单
export function payOrderUpdateOrderApi (data) {
  return request({
    url: '/pay/order/updateOrder',
    method: 'put',
    data,
  });
}

// 支付
export function payOrderCofirmOrderApi (orderId) {
  return request({
    url: `/pay/order/cofirmOrder?orderId=${orderId}`,
    method: 'get',
  });
}
