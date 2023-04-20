import request from '@/utils/request';

// 查询印章列表
export function getSealListApi(params) {
  return request({
    url: '/contract/seal/getSealList',
    method: 'get',
    params,
  });
}

// 新增印章
export function insertSealApi(data) {
  return request({
    url: '/contract/seal/insertSeal',
    method: 'post',
    data,
  });
}

// 删除印章
export function deleteSealApi(data) {
  return request({
    url: '/contract/seal/deleteSeal',
    method: 'delete',
    data,
  });
}
