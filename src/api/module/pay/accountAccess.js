import request from '@/utils/request';

// 查询订单账户流水分页
export function payAccountAccessGetAccountAccessPageApi (params) {
  return request({
    url: '/pay/accountAccess/getAccountAccessPage',
    method: 'get',
    params,
  });
}

// 新增订单账户流水
export function payAccountAccessExportAccountAccessApi (data) {
  return request({
    url: '/pay/accountAccess/exportAccountAccess',
    method: 'post',
    data,
  });
}
