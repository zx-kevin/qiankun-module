import request from '@/utils/request';

// 查询合同模板列表
export function getTemplateListApi(params) {
  return request({
    url: '/contract/template/getTemplateList',
    method: 'get',
    params,
  });
}

// 新增模板
export function insertTemplateApi(data) {
  return request({
    url: '/contract/template/insertTemplate',
    method: 'post',
    data,
  });
}

// 修改模板
export function updateTemplateApi(data) {
  return request({
    url: '/contract/template/updateTemplate',
    method: 'put',
    data,
  });
}

// 删除模板
export function deleteTemplateApi(data) {
  return request({
    url: '/contract/template/deleteTemplate',
    method: 'delete',
    data,
  });
}

// 查询合同印章选择框选项
export function getSealOptionsApi() {
  return request({
    url: '/contract/seal/getSealOptions',
    method: 'get',
  });
}

// 查询合同模板详情
export function getTemplateDetailApi(id) {
  return request({
    url: '/contract/template/getTemplateDetail?templateId=' + id,
    method: 'get',
  });
}
