/*
 * @Author: yangxiong yangxiong@jeoho.com
 * @Date: 2023-02-13 17:57:10
 * @LastEditors: yangxiong yangxiong@jeoho.com
 * @LastEditTime: 2023-02-14 16:33:03
 * @FilePath: \decision_engine_ui\src\api\module\resource\channel.js
 * @Description: 资源渠道 API
 */
import request from '@/utils/request';

// 查询资源渠道分页
export function getChannelPageApi(query) {
  return request({
    url: '/resource/channel/getChannelPage',
    method: 'get',
    params: query,
  });
}

// 查询资源渠道详细
export function getChannelDetailApi(query) {
  return request({
    url: '/resource/channel/getChannelDetail',
    method: 'get',
    params: query,
  });
}

// 新增资源渠道
export function insertChannelApi(data) {
  return request({
    url: '/resource/channel/insertChannel',
    method: 'post',
    data,
  });
}

// 删除资源渠道
export function deleteChannelApi(ids) {
  return request({
    url: '/resource/channel/deleteChannel?channelIds=' + ids,
    method: 'delete',
  });
}

// 修改资源渠道
export function updateChannelApi(data) {
  return request({
    url: '/resource/channel/updateChannel',
    method: 'put',
    data,
  });
}

// 查询资源渠道选择框选项
export function getChannelOptionsApi(params) {
  return request({
    url: '/resource/channel/getChannelOptions',
    method: 'get',
    params,
  });
}

// 导出资源渠道
export function exportChannelApi(params) {
  return request({
    url: '/resource/channel/exportChannel',
    method: 'post',
    params,
  });
}
