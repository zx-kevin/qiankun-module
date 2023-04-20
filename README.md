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
// src\hosts.js

// [key] 对应路由前缀
// [value] 对应服务端口

//  default 对应除定义了[key]之外的所有路由前缀
//  优先级： [key] > deafult > 应用路由

export default {
  // default: '92',

  decision: '92',
  'feature-lib': '92',
  flow: '92',
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