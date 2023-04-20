import request from '@/utils/request';
import { encrypt } from '@/utils/jsencrypt';

// 还有一个导出功能

// 查询个体分页
export function getPeoplePageApi(query) {
  return request({
    url: '/system/people/getPeoplePage',
    method: 'get',
    params: query,
  });
}

// 查询个体详细
export function getPeopleDetailApi(query) {
  return request({
    url: '/system/people/getPeopleDetail',
    method: 'get',
    params: query,
  });
}

// 新增个体
export function insertPeopleApi(data) {
  return request({
    url: '/system/people/insertPeople',
    method: 'post',
    data,
  });
}

// 删除个体
export function deletePeopleApi(query) {
  return request({
    url: '/system/people/deletePeople',
    method: 'delete',
    params: query,
  });
}

// 修改组织管理
export function updatePeopleApi(data) {
  return request({
    url: 'system/people/updatePeople',
    method: 'put',
    data,
  });
}

// 修改密码
export function updatePasswordApi(data) {
  return request({
    url: '/system/people/updatePassword',
    method: 'post',
    data: {
      ...data,
      password: encrypt(data.password),
    },
  });
}
