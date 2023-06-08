import router from './router';
import { ElMessage } from 'element-plus';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { getToken } from '@/utils/auth';
import { isHttp } from '@/utils/validate';
import { isRelogin } from '@/utils/request';
import useUserStore from '@/store/modules/user';
import useSettingsStore from '@/store/modules/settings';
import usePermissionStore from '@/store/modules/permission';

import useAppStore from '@/store/modules/app.js';

import PortalView from '@/layout/portalView';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import hosts, { getHost } from '@/hosts';

NProgress.configure({ showSpinner: false });

const whiteList = ['/login', '/auth-redirect', '/bind', '/register'];

router.beforeEach((to, from, next) => {
  NProgress.start();
  if (to.name === from.name) {
    to.params = { ...from.params, ...to.params };
    to.query = { ...from.query, ...to.query };
  }
  if (getToken()) {
    to.meta.title && useSettingsStore().setTitle(to.meta.title);
    /* has token*/
    if (to.path === '/login') {
      next({ path: '/' });
      NProgress.done();
    } else {
      if (useUserStore().roles.length === 0) {
        isRelogin.show = true;
        // 判断当前用户是否已拉取完user_info信息
        useUserStore()
          .getInfo()
          .then(() => {
            isRelogin.show = false;
            usePermissionStore()
              .generateRoutes()
              .then((accessRoutes) => {
                // 根据roles权限生成可访问的路由表
                routeNameHandler(accessRoutes);
                accessRoutes.forEach((route) => {
                  //  路由通配调整
                  const translateRoutes = handlePathMatch(route);
                  translateRoutes.forEach((item) => {
                    if (!isHttp(item.path)) {
                      router.addRoute(item); // 动态添加可访问路由表
                    }
                  });
                });
                next({ ...to, replace: true }); // hack方法 确保addRoutes已完成
              });
            useUserStore().getFileDomain();
          })
          .catch((err) => {
            useUserStore()
              .logOut()
              .then(() => {
                ElMessage.error(err);
                next({ path: '/' });
              });
          });
      } else {
        next();
      }
    }
  } else {
    // 没有token
    if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单，直接进入
      next();
    } else {
      next(`/login?redirect=${to.fullPath}`); // 否则全部重定向到登录页
      NProgress.done();
    }
  }
});

router.afterEach(() => {
  NProgress.done();
});

const hostKeys = Object.keys(hosts);

/**
 * @description: 路由名字处理
 * @param {*} routes
 * @param {*} name
 * @return {*}
 */
function routeNameHandler(routes = [], name = '') {
  for (const item of routes) {
    if (name) item.name = `${name}-${item.name}`;
    routeNameHandler(item.children, item.name);
  }
}

/**
 * @description: 路由处理
 * @param {*} route 目标路由
 * @param {*} url   父路由路径
 * @return {*}  路由数组
 */
const handlePathMatch = (route, url = '') => {
  const { path, children, component } = route;
  const result = [];
  if (!route) return result;

  const urlSplit = (target) =>
    `/${target
      .split('/')
      .filter((str) => str)
      .join('/')}`; //  url 处理 / 重复

  if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
    //  父应用根据 hosts 配置 调整对应路由指向 pathMatch(.*)*
    const isHost =
      (path !== '/' && hostKeys.includes(pathSplit(path))) ||
      (path === '/' &&
        (children || []).filter((child) => hostKeys.includes(pathSplit(child.path))).length); //  判断匹配 hosts 配置
    const targetChildren = (children || []).filter((child) =>
      path == '/' ? hostKeys.includes(pathSplit(child.path)) : true,
    );
    for (const item of targetChildren) {
      if (!item.children) item.children = [];
      item.props = true;
      if (!isHost) item.children.push({ path: '/:pathMatch(.*)*', redirect: { name: item.name } });
      item.path = isHost
        ? item.path + `${item.path.slice(-1) !== '/' ? '/' : ''}` + ':pathMatch(.*)*'
        : item.path;
    }

    return [route];
  } else {
    // 子应用跳过 layout 布局 直接加载页面
    if (children && children.length) {
      for (const child of children) {
        result.push(...handlePathMatch(child, urlSplit(url + '/' + path)));
      }
    } else {
      result.push({ ...route, path: urlSplit(url + '/' + path), props: true });
    }
  }

  return result;
};

const pathSplit = (url) => url.split('/').filter((str) => str)[0] || '';
