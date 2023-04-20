import request from '@/utils/request'

/**
 * 单图片上传
 * @param data
 */
export function imageSingleUpload (data) {
  return request({
    url: '/sysCommon/upload/imageSingleUpload',
    method: 'post',
    data: data
  })
}

/**
 * 单图片上传 返回base64格式图片
 * @param data
 */
export function imageSingleUploadToImageBase64 (data) {
  return request({
    url: '/sysCommon/upload/imageSingleUploadToImageBase64',
    method: 'post',
    data: data
  })
}


/**
 * 单文件上传
 * @param data
 */
export function fileSingleUpload (data) {
  return request({
    url: '/sysCommon/upload/fileSingleUpload',
    method: 'post',
    data: data
  })
}


/**
 * 单文件上传,支持加密
 * @param data
 */
export function fileSingleEncryptionUpload (data) {
  return request({
    url: '/sysCommon/upload/fileSingleEncryptionUpload',
    method: 'post',
    data: data
  })
}



/**
* 获取大文件拆分分片接口
* @param data
*/
export function getBigFileUploadSplitInfo (data) {
  return request({
    url: '/sysCommon/upload/getBigFileUploadSplitInfo',
    method: 'post',
    data: JSON.stringify(data)
  })
}

/**
 * 大文件分片上传
 * @param data
 */
export function bigFileSliceUpload (data) {
  return request({
    url: '/sysCommon/upload/bigFileSliceUpload',
    method: 'post',
    data: data
  })
}



/**
 * 文件上传，通用方法
 * @param actionUrl
 * @param data
 */
export function uploadFile (actionUrl, data) {
  return request({
    url: actionUrl,
    method: 'post',
    data: data
  })
}

/**
 * 单文件上传,支持加密
 * @param data
 */
export function fileSinglePayCertUploadSm4EncryptionPath (data) {
  return request({
    url: '/sysCommon/upload/fileSinglePayCertUploadSm4EncryptionPath',
    method: 'post',
    data: data
  })
}

