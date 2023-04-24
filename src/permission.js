import router from './router'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { isHttp } from '@/utils/validate'
import { isRelogin } from '@/utils/request'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'

import useAppStore from '@/store/modules/app.js';
import { getDomainApi } from '@/api/module/chat/im/chatGroup.js';

import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import hosts from '@/hosts'

NProgress.configure({ showSpinner: false });

const whiteList = ['/login', '/auth-redirect', '/bind', '/register'];

router.beforeEach((to, from, next) => {
  NProgress.start()
  if (getToken()) {
    to.meta.title && useSettingsStore().setTitle(to.meta.title)
    /* has token*/
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      if (useUserStore().roles.length === 0) {
        isRelogin.show = true
        // 判断当前用户是否已拉取完user_info信息
        useUserStore().getInfo().then(() => {
          isRelogin.show = false
          usePermissionStore().generateRoutes().then(accessRoutes => {
            // 根据roles权限生成可访问的路由表
            accessRoutes.forEach(route => {
              //  路由通配调整
              if (!qiankunWindow.__POWERED_BY_QIANKUN__) handlePathMatch(route)
              if (!isHttp(route.path)) {
                router.addRoute(route) // 动态添加可访问路由表
              }
            })
            next({ ...to, replace: true }) // hack方法 确保addRoutes已完成
          })
          useUserStore().getFileDomain()
          getDomainApi().then((res) => {
            // let { chatDomain, videoDomain } = res.data;
            useAppStore().changeDomain(res.data);
          });
        }).catch(err => {
          useUserStore().logOut().then(() => {
            ElMessage.error(err)
            next({ path: '/' })
          })
        })
      } else {
        next()
      }
    }
  } else {
    // 没有token
    if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单，直接进入
      next()
    } else {
      next(`/login?redirect=${to.fullPath}`) // 否则全部重定向到登录页
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})

const hostKeys = Object.keys(hosts)
const handlePathMatch = (route) => {
  const { path, children } = route
  if (path !== '/' && !hostKeys.includes(pathSplit(path)) || path === '/' && !(children || []).filter(child => hostKeys.includes(pathSplit(child.path))).length) return

  const targetChildren = (children || []).filter(child => path == '/' ? hostKeys.includes(pathSplit(child.path)) : true)
  for (const item of targetChildren) {
    item.path = item.path + `${item.path.slice(-1) !== '/' ? '/' : ''}` + ':pathMatch(.*)*'
  }
}

const pathSplit = (url) => url.split('/').filter(str => str)[0] || ''