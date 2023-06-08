const env = process.env.NODE_ENV

const map = {
  // default: 'http://test-system.com',

  system: 'https://cross-dev.jeoho.com',  //  系统模块
}

export function getHost(key = 'default') {
  if (!map[key]) return
  return (typeof map[key] === 'string' ? map[key] : map[key][env]) || window.location.protocol + '//' + window.location.host
}

export default map