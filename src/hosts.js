const env = process.env.NODE_ENV

const map = {
  // default: 'http://test-system.com',

  system: 'https://localhost:93',
  // system: 'http://test-system.com',
}

export function getHost(key = 'default') {
  if (!map[key]) return
  return (typeof map[key] === 'string' ? map[key] : map[key][env]) || window.location.protocol + '//' + window.location.host
}

export default map