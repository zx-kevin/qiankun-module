/* 
    v-decimal 输入框金额限制数字，保留2位小数，不能为0
*/

export default {
  mounted (el, { arg, value }, vnode, oldVnode) {
    const target = el instanceof HTMLInputElement ? el : el.querySelector('input')
    // 添加@input事件
    target.addEventListener('keyup', e => {
      let regStrs = [
        ['^0(\\d+)$', '$1'], // 禁止录入整数部分两位以上，但首位为 0
        ['[^\\d\\.]$', ''], // 禁止录入任何非数字和点
        ['^\\.*', ''], // 禁止录入点开头
        ['\\.(\\d?)\\.+', '.$1'], // 禁止录入两位以上的点
        ['^(\\d+\\.\\d{2}).+', '$1'], // 禁止录入小数点后两位以上
      ]
      regStrs.forEach(item => {
        let reg = new RegExp(item[0])
        e.target.value = e.target.value.replace(reg, item[1])
      })
      e.target.value = e.target.value.replace(/[^\d^\.]+/g, '') // 禁止录入任何非数字和点
      e.target.dispatchEvent(new Event('input'))
    })
    // 添加@blur事件，失去焦点补位
    target.addEventListener('blur', e => {
      const res = e.target.value.replace(/[^\d^\.]+/g, '')
      if (res && (arg === 'zero' || res != 0)) {
        if (value && Number(res) > Number(value)) {
          e.target.value = Number(value).toFixed(2)
        } else {
          e.target.value = Number(res).toFixed(2)
        }
        e.target.dispatchEvent(new Event('input'))
      } else {
        e.target.value = ''
      }
    })
  },
}
