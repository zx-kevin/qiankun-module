import request from '@/utils/request';

// 查询支付账户分页
export function payAccountGetAccountPageApi (params) {
  return request({
    url: '/pay/account/getAccountPage',
    method: 'get',
    params,
  });
}

// 查询账户操作分页
export function payAccountOperGetAccountOperPageApi (params) {
  return request({
    url: '/pay/accountOper/getAccountOperPage',
    method: 'get',
    params,
  });
}

// 新增账户操作
export function payAccountOperInsertAccountOperApi (data) {
  return request({
    url: '/pay/accountOper/insertAccountOper',
    method: 'post',
    data,
  });
}

// 查询支付账户选择框选项
export function payAccountGetAccountOptionsApi (params) {
  return request({
    url: '/pay/account/getAccountOptions',
    method: 'get',
    params,
  });
}

// 查询支付银行卡分页
export function payCardGetCardPageApi (params) {
  return request({
    url: '/pay/card/getCardPage',
    method: 'get',
    params,
  });
}

// 绑卡申请
export function payCardInsertCardApi (data) {
  return request({
    url: '/pay/card/insertCard',
    method: 'post',
    data,
  });
}

// 绑卡确定
export function payCardInsertCardCofirmApi (data) {
  return request({
    url: '/pay/card/insertCard/cofirm',
    method: 'post',
    data,
  });
}

// 删除支付银行卡
export function payCardDeleteCardApi (params) {
  return request({
    url: '/pay/card/deleteCard',
    method: 'delete',
    params,
  });
}
