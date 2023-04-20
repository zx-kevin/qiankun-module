import request from '@/utils/request';

// 查询部门列表
export function listDept(query) {
  return request({
    url: '/system/dept/list',
    method: 'get',
    params: query,
  });
}

// 查询部门列表（排除节点）
export function listDeptExcludeChild(deptId) {
  return request({
    url: '/system/dept/list/exclude/' + deptId,
    method: 'get',
  });
}

// 查询部门树
export function getDeptTree(query) {
  return request({
    url: '/system/dept/tree',
    method: 'get',
    params: query,
  });
}

// 根据角色ID查询部门树结构
export function roleDeptTree(roleId) {
  return request({
    url: '/system/dept/roleDeptTree?roleId=' + roleId,
    method: 'get',
  });
}

// 查询部门详细
export function getDept(deptId) {
  return request({
    url: '/system/dept/' + deptId,
    method: 'get',
  });
}

// 新增部门
export function addDept(data) {
  return request({
    url: '/system/dept',
    method: 'post',
    data: data,
  });
}

// 修改部门
export function updateDept(data) {
  return request({
    url: '/system/dept',
    method: 'put',
    data: data,
  });
}

// 删除部门
export function delDept(deptId) {
  return request({
    url: '/system/dept/' + deptId,
    method: 'delete',
  });
}

// 查询个体选择框选项
export function getPeopleOptionsApi(deptId) {
  return request({
    url: '/system/people/getPeopleOptions',
    method: 'get',
  });
}

// 查询用户选择框选项
export function getUserOptionsApi(params) {
  return request({
    url: '/system/user/getUserOptions',
    method: 'get',
    params,
  });
}
