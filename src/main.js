import { createApp } from 'vue';
import { name } from '../package.json'

import Cookies from 'js-cookie';

import ElementPlus from 'element-plus';
import locale from 'element-plus/dist/locale/zh-cn.mjs'; // 中文语言
import { ClickOutside as vClickOutside } from 'element-plus';
import 'element-plus/theme-chalk/index.css';

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
// import 'virtual:svg-icons-register';
import SvgIcon from '@/components/SvgIcon';
import '@/assets/icons/iconfont.js';
import elementIcons from '@/components/SvgIcon/svgicon';

import './permission'; // permission control

import { useDict } from '@/utils/dict';
import {
  parseTime,
  resetForm,
  addDateRange,
  handleTree,
  selectDictLabel,
  selectDictLabels,
} from '@/utils/jeoho';

// 分页组件
import Pagination from '@/components/Pagination';
// 自定义表格工具组件
import RightToolbar from '@/components/RightToolbar';
// 文件上传组件
import FileUpload from '@/components/FileUpload';
// 图片上传组件
import ImageUpload from '@/components/ImageUpload';
// 图片预览组件
import ImagePreview from '@/components/ImagePreview';
// 自定义树选择组件
import TreeSelect from '@/components/TreeSelect';
// 字典标签组件
import DictTag from '@/components/DictTag';
// 富文本组件
import Editor from '@/components/Editor';
// 文字提示组件
import TooltipText from '@/components/TooltipText';
// 卡片盒子组件
import Card from '@/components/Card';
// 聊天消息组件
import {
  AudioMessage,
  CodeMessage,
  ForwardMessage,
  ImageMessage,
  TextMessage,
  VideoMessage,
  VoiceMessage,
  SystemTextMessage,
  FileMessage,
  InviteMessage,
  RevokeMessage,
  VisitCardMessage,
  ReplyMessage,
  VoteMessage,
  LoginMessage,
} from '@/components/DuoJuHe/Chat/chat/messaege';
import { menusEvent, directive as menusdirective } from 'vue3-menus';

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
  app.config.globalProperties.parseTime = parseTime;
  app.config.globalProperties.resetForm = resetForm;
  app.config.globalProperties.handleTree = handleTree;
  app.config.globalProperties.addDateRange = addDateRange;
  app.config.globalProperties.selectDictLabel = selectDictLabel;
  app.config.globalProperties.selectDictLabels = selectDictLabels;
  app.config.globalProperties.contextmenu = menusEvent; // 只绑定方法
  app.config.globalProperties.poweredByQiankun = poweredByQiankun;
  app.config.globalProperties.onGlobalStateChange = actions.onGlobalStateChange;
  app.config.globalProperties.setGlobalState = actions.setGlobalState;


  // app.directive('menus', menusdirective); // 只注册指令
  // 全局组件挂载
  app.component('DictTag', DictTag);
  app.component('Pagination', Pagination);
  app.component('TreeSelect', TreeSelect);
  app.component('FileUpload', FileUpload);
  app.component('ImageUpload', ImageUpload);
  app.component('ImagePreview', ImagePreview);
  app.component('RightToolbar', RightToolbar);
  app.component('Editor', Editor);
  app.component('TooltipText', TooltipText);
  app.component('Card', Card);
  app.component(AudioMessage.name, AudioMessage);
  app.component(CodeMessage.name, CodeMessage);
  app.component(ForwardMessage.name, ForwardMessage);
  app.component(ImageMessage.name, ImageMessage);
  app.component(TextMessage.name, TextMessage);
  app.component(VideoMessage.name, VideoMessage);
  app.component(VoiceMessage.name, VoiceMessage);
  app.component(SystemTextMessage.name, SystemTextMessage);
  app.component(FileMessage.name, FileMessage);
  app.component(InviteMessage.name, InviteMessage);
  app.component(RevokeMessage.name, RevokeMessage);
  app.component(VisitCardMessage.name, VisitCardMessage);
  app.component(ReplyMessage.name, ReplyMessage);
  app.component(VoteMessage.name, VoteMessage);
  app.component(LoginMessage.name, LoginMessage);

  app.use(router);
  app.use(store);
  app.use(plugins);
  app.use(elementIcons);
  app.component('svg-icon', SvgIcon);

  directive(app);

  // 使用element-plus 并且设置全局的大小
  app.use(ElementPlus, {
    locale: locale,
    // 支持 large、default、small
    size: Cookies.get('size') || 'default',
  });

  app.directive('outside', vClickOutside);
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
