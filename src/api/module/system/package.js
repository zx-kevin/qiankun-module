import request from '@/utils/request';

// 还有一个导出功能

// 查询套餐分页
export function getPackagePageApi(query) {
  return request({
    url: '/system/package/getPackagePage',
    method: 'get',
    params: query,
  });
}

// 查询套餐详细
export function getPackageDetailApi(query) {
  return request({
    url: '/system/package/getPackageDetail',
    method: 'get',
    params: query,
  });
}

// 添加套餐管理
export function insertPackageApi(data) {
  return request({
    url: '/system/package/insertPackage',
    method: 'post',
    data,
  });
}

// 删除套餐管理
export function deletePackageApi(query) {
  return request({
    url: '/system/package/deletePackage',
    method: 'delete',
    params: query,
  });
}

// 修改套餐管理
export function updatePackageApi(data) {
  return request({
    url: '/system/package/updatePackage',
    method: 'put',
    data,
  });
}

// 查询菜单树
export function treeselectApi(params) {
  return request({
    url: '/system/menu/treeselect',
    method: 'get',
    params,
  });
}
