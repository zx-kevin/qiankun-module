/**
 * v-number
 * 只能输入正整数
 * @returns {string | number} 返回空字符或数字
 */

export default {
  mounted(el, binding, vnode, oldVnode) {
    const target = el instanceof HTMLInputElement ? el : el.querySelector('input');
    // 添加@input事件
    target.addEventListener('keyup', (e) => {
      // 只保留数字
      target.value = target.value.replace(/[\D]/g, '');
      e.target.dispatchEvent(new Event('input'));
    });
  },
};
