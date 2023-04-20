import request from '@/utils/request';

// 查询支付订单退款分页
export function payRefundGetRefundPageApi (params) {
  return request({
    url: '/pay/refund/getRefundPage',
    method: 'get',
    params,
  });
}

// 新增支付订单退款
export function payRefundInsertRefundApi (data) {
  return request({
    url: '/pay/refund/insertRefund',
    method: 'post',
    data,
  });
}

// 退款单退款
export function payRefundCofirmOrderApi (refundOrderId) {
  return request({
    url: `/pay/refund/cofirmOrder?refundOrderId=${refundOrderId}`,
    method: 'get',
  });
}
