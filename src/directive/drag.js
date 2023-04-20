/**
* v-chatDrag 拖拽  边界判断
* Copyright (c) 2022 吴宇杰
*/
export default {
  mounted (el, binding, vnode, oldVnode) {
    console.log('%cbinding', "color: red;", binding,)
    const oDiv = el // 当前元素
    let minTop = Number(oDiv.getAttribute('drag-top'))
    let minBottom = Number(oDiv.getAttribute('drag-bottom') || 9999)// appHeight - target.offsetHeight + Number(e.clientY) + minTop
    let minLeft = Number(oDiv.getAttribute('drag-left') || 0)
    let minRight = Number(oDiv.getAttribute('drag-right') || 9999)

    const appHeight = document.querySelector('#app').offsetHeight
    // console.log('%cel', "color: red;", el,)
    console.log('%cminTop', "color: red;", minTop,)
    const ifMoveSizeArea = 20
    oDiv.onmousedown = e => {
      let target = oDiv
      while (window.getComputedStyle(target).position !== 'absolute' && target !== document.body) {
        target = target.parentElement
      }

      document.onselectstart = () => {
        return false
      }
      if (!target.getAttribute('init_x')) {
        target.setAttribute('init_x', target.offsetLeft)
        target.setAttribute('init_y', target.offsetTop)
      }

      const initX = parseInt(target.getAttribute('init_x'))
      const initY = parseInt(target.getAttribute('init_y'))

      // 鼠标按下，计算当前元素距离可视区的距离
      const disX = e.clientX - target.offsetLeft
      const disY = e.clientY - target.offsetTop
      console.table({ 'e.clientY': e.clientY, 'target.offsetTop': target.offsetTop, ' e.clientX': e.clientX, ' target.offsetLeft ': target.offsetLeft, "target.offsetHeight": target.offsetHeight, "appHeight": appHeight });
      // console.log('%c数字dis', "color: pink;", disX, disY, appHeight - target.offsetHeight)
      document.onmousemove = e => {
        // 通过事件委托，计算移动的距离
        // 因为浏览器里并不能直接取到并且使用clientX、clientY,所以使用事件委托在内部做完赋值
        const l = e.clientX - disX
        const t = e.clientY - disY
        // console.log('%c距离', "color: blue;", e.clientX, e.clientY, t, minBottom)
        // 计算移动当前元素的位置，并且给该元素样式中的left和top值赋值
        target.style.left = (e.clientX < minLeft ? minLeft - disX : l > minRight ? minRight : l) + 'px'
        target.style.top = (e.clientY < minTop ? minTop - disY : t > minBottom ? minBottom : t) + 'px'
        if (Math.abs(l - initX) > ifMoveSizeArea || Math.abs(t - initY) > ifMoveSizeArea) {
          target.setAttribute('dragged', '')
        } else {
          target.removeAttribute('dragged')
        }
      }
      document.onmouseup = e => {
        document.onmousemove = null
        document.onmouseup = null
        document.onselectstart = null
      }
      // return false不加的话可能导致黏连，拖到一个地方时div粘在鼠标上不下来，相当于onmouseup失效
      return false
    }
  }
}