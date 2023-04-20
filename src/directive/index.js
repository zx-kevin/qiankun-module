/*
 * @Author: 杰 xuyongfeng@jeoho.com
 * @Date: 2023-02-01 15:01:35
 * @LastEditors: 杰 xuyongfeng@jeoho.com
 * @LastEditTime: 2023-02-17 17:52:38
 * @FilePath: \decision_engine_ui\src\directive\index.js
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
 */
import hasRole from './permission/hasRole';
import hasPermi from './permission/hasPermi';
import copyText from './common/copyText';
import number from './number';
import decimal from './decimal';
import chatDrag from './drag'
export default function directive (app) {
  // 自定义粘贴指令
  app.directive('paste', {
    mounted (el, binding, vnode) {
      el.addEventListener('paste', function (event) {
        //这里直接监听元素的粘贴事件
        binding.value(event)
      })
    },
  })
  // 自定义拖拽指令
  app.directive('drag', {
    mounted (el, binding, vnode) {
      // 因为拖拽还包括拖动时的经过事件，离开事件，和进入事件，放下事件，
      // 浏览器对于拖拽的默认事件的处理是打开拖进来的资源，
      // 所以要先对这三个事件进行默认事件的禁止
      el.addEventListener('dragenter', function (event) {
        event.stopPropagation()
        event.preventDefault()
      })
      el.addEventListener('dragover', function (event) {
        event.stopPropagation()
        event.preventDefault()
      })
      el.addEventListener('dragleave', function (event) {
        event.stopPropagation()
        event.preventDefault()
      })
      el.addEventListener('drop', function (event) {
        // 这里阻止默认事件，并绑定事件的对象，用来在组件上返回事件对象
        event.stopPropagation()
        event.preventDefault()
        binding.value(event)
      })
    },
  })
  // 自定义聚焦指令
  app.directive('focus', {
    inserted (el) {
      el.focus()
    },
  })
  app.directive('hasRole', hasRole);
  app.directive('hasPermi', hasPermi);
  app.directive('copyText', copyText);
  app.directive('number', number);
  app.directive('decimal', decimal);
  app.directive('chatDrag', chatDrag);
}
