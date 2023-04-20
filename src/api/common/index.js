/*
 * @Author: yangxiong yangxiong@jeoho.com
 * @Date: 2023-02-28 16:38:57
 * @LastEditors: yangxiong yangxiong@jeoho.com
 * @LastEditTime: 2023-03-01 11:19:17
 * @FilePath: \decision_engine_ui\src\api\common\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import request from '@/utils/request';

/**
 * 切换身份
 * @param data
 */
// /${id}
export function switchApi(params) {
  return request({
    url: `/switch`,
    method: 'post',
    params: params,
  });
}
