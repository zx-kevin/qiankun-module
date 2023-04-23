import {
  registerMicroApps,
  runAfterFirstMounted,
  addGlobalUncaughtErrorHandler,
  start,
  setDefaultMountApp,
} from 'qiankun'
import { watch } from 'vue'

import router from '@/router'
import hosts from '@/hosts'
import actions from '@/actions'

const initState = {
  routes: []
}

const listener = {
  beforeLoad: [
    (app) => {
      console.log('[LifeCycle] before load %c%s', 'color: green;', app.name)
      return Promise.resolve()
    }
  ],
  beforeMount: [
    (app) => {
      console.log('[LifeCycle] before mount %c%s', 'color: green;', app.name)
      return Promise.resolve()
    }
  ],
  afterUnmount: [
    (app) => {
      console.log('[LifeCycle] after unmount %c%s', 'color: green;', app.name)
      return Promise.resolve()
    }
  ]
}

function loader(routes = []) {
  initState.routes = routes
  const routesRef = shallowRef(initState.routes || []);

  watch(routesRef, ref => handleStart(routerHandler(ref)), { immediate: true })

}

function routerHandler(routes = []) {
  if (!routes.length) return

  const result = []
  for (const item of routes) {
    const { path, name, children, hidden } = item
    if (!path || hidden) continue
    if (path === '/' && children && children.length) {
      result.push(...routerHandler(children))
      continue
    }

    const pathStr = path.split('/').find(str => str)
    const host = hosts[pathStr] || hosts.default || window.location.protocol + '//' + window.location.host

    if (host) {
      result.push({
        name: pathStr,
        entry: `${host}/${pathStr}`,
        container: '#sub-container',
        activeRule: `/${pathStr}`,
      })
    }
  }

  return result
}

function handleStart(apps = []) {
  if (!apps || !apps.length) return

  console.log('qiankun apps', apps);
  registerMicroApps(apps.map(item => ({ ...item, props: item.props })), listener)

  runAfterFirstMounted(() => {
    console.log('子应用加载完毕')
  })

  addGlobalUncaughtErrorHandler((event) => {
    const { message } = event
    message && console.log('微应用加载失败_' + message)
  })
}

export default loader