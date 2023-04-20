import request from '@/utils/request';

// 查询合同列表
export function getMyContractApi(params) {
  return request({
    url: '/contract/order/getMyContract',
    method: 'get',
    params,
  });
}

// 新增合同业务
export function insertOrderApi(data) {
  return request({
    url: '/contract/order/insertOrder',
    method: 'post',
    data,
    timeout: 20000,
  });
}

// 修改合同业务
export function updateOrderApi(data) {
  return request({
    url: '/contract/order/updateOrder',
    method: 'put',
    data,
    timeout: 20000,
  });
}

// 删除合同
export function deleteOrderApi(data) {
  return request({
    url: '/contract/order/deleteOrder',
    method: 'delete',
    data,
  });
}

// 查询合同模板选择框选项
export function getTemplateOptionsApi() {
  return request({
    url: '/contract/template/getTemplateOptions',
    method: 'get',
  });
}

// 签署合同
export function signContractApi(id) {
  return request({
    url: '/contract/order/signContract?contractId=' + id,
    method: 'put',
  });
}

// 拒绝签署
export function refuseSignApi(id) {
  return request({
    url: '/contract/order/refuseSign?contractId=' + id,
    method: 'put',
  });
}

// 查看合同详情
export function getOrderDetailApi(id) {
  return request({
    url: '/contract/order/getOrderDetail?contractId=' + id,
    method: 'get',
  });
}
