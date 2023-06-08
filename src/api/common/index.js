/*
 * @Author: yangxiong yangxiong@jeoho.com
 * @Date: 2023-02-28 16:38:57
 * @LastEditors: K
 * @LastEditTime: 2023-06-08 11:20:13
 * @FilePath: \demo-ui\src\api\common\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import request from '@/utils/request';

/**
 * 切换身份
 * @param data
 */
export function switchApi(params) {
  return request({
    url: `/switch`,
    method: 'post',
    params: params,
  });
}
