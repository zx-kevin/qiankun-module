import { createApp } from 'vue';
import { name } from '../package.json'

import Cookies from 'js-cookie';

import JeohoUi from 'jeoho-ui';
import 'jeoho-ui/ui/es/style.css';

import '@/assets/styles/index.scss'; // global css
import '@/assets/styles/font_icon.css';
// 引入自定义全局css
import '@/assets/styles/chat/global.scss';

import App from './App';
import store from './store';
import router from './router';
import directive from './directive'; // directive

// 注册指令
import plugins from './plugins'; // plugins
import { download } from '@/utils/request';

// svg图标
import '@/assets/icons/iconfont.js';

import './permission'; // permission control

import { useDict } from '@/utils/dict';

import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import actions from './actions';

if (window.__POWERED_BY_QIANKUN__) {
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}

const poweredByQiankun = qiankunWindow.__POWERED_BY_QIANKUN__

let app

function render(props = {}) {

  const { container, setGlobalState, onGlobalStateChange } = props
  app = createApp(App);

  if (poweredByQiankun) {
    actions.setActions(props)
    actions.onGlobalStateChange((state, prev) => {
      console.log('sub onGlobalStateChange', state, prev);
    })
  } else {
    actions.onGlobalStateChange((state, prev) => {
      console.log('main onGlobalStateChange', state, prev);
    })
  }

  // 全局方法挂载
  app.config.globalProperties.useDict = useDict;
  app.config.globalProperties.download = download;

  app.use(router);
  app.use(store);
  app.use(plugins);

  directive(app);

  app.use(JeohoUi, {
    size: Cookies.get('size') || 'default',
  })

  app.mount(container ? container.querySelector('#app') : '#app')
}

renderWithQiankun({
  mount(props) {
    console.log(`[${name}] props`, props);
    console.log(`[${name}] %c%s`, 'color: green;', 'mount');
    render(props)
  },
  bootstrap() {
    console.log(`[${name}] %c%s`, 'color: green;', 'bootstrap');
  },
  update() {
    console.log(`[${name}] %c%s`, 'color: green;', 'update');
  },
  unmount(props) {
    console.log(`[${name}] %c%s`, 'color: green;', 'unmount');
    app.unmount()
    app._container.innerHTML = ''
    app = null
  }
})

if (!poweredByQiankun) render()
