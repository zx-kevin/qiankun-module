## 平台简介

* 本仓库为前端技术栈 [Vue3](https://v3.cn.vuejs.org) + [Element Plus](https://element-plus.org/zh-CN) + [Vite](https://cn.vitejs.dev) + [Qiankun](https://qiankun.umijs.org/) 版本。

<br>

## 前端运行

```bash
# 克隆项目
git clone https://

# 进入项目目录
cd XX

# 安装依赖
npm i

# 启动服务
npm run dev

# 构建测试环境 npm run build:stage
# 构建生产环境 npm run build:prod
# 前端访问地址 http://localhost:90
```

文档地址：http://doc.ruoyi.vip

<br>

## 项目配置

```javascript
//  vite\plugins\index.js

// 添加 vitePlugins 配置
import qiankun from 'vite-plugin-qiankun'
const vitePlugins = [vue(), vueJsx(),
// 这里的 'myMicroAppName' 是子应用名，主应用注册时AppName需保持一致
// 因为我们由路由区分应用，所以这里应该是路由前缀
qiankun('myMicroAppName', {
  useDevMode: true
})];
```

```javascript
// src\hosts.js

// [key] 对应路由前缀
// [value] 对应服务域名

//  default 对应除定义了[key]之外的所有路由前缀
//  优先级： [key] > deafult > 应用路由

//  默认使用当前访问地址域名

export default {
  // default: 'http://test-system.com',

  system: 'http://test-system.com',
}
```

```javascript
//  全局通信
//  微应用中只能修改已存在的一级属性

//  主应用 src\actions.js -> Actions.initialStore 定义全局一级属性

import actions from '@/actions'
actions.setGlobalState({test: 'demo'})
actions.onGlobalStateChange((state, prev) => {
  console.log('onGlobalStateChange', state, prev);
})
```

```javascript
//  vite.config.js
base: VITE_APP_ENV === 'production' ? VITE_BASE_URL || '/' : '/', //  打包路径


// 在对应环境配置文件 配置 VITE_BASE_URL 参数
// 默认 '/' 但是子应用运行会报错: 
// Failed to load module script: Expected a JavaScript module script but the
// server responded with a MIME type of "text/html". Strict MIME type checking
// is enforced for module scripts per HTML spec.

// .env.production
VITE_BASE_URL = 'https://www.jeoho.com/'


```
