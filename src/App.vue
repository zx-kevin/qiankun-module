<template>
  <router-view />
</template>

<script setup>
import useSettingsStore from '@/store/modules/settings';
import { handleThemeStyle } from '@/utils/theme';
import { start } from 'qiankun';
import QiankunLoader from './apps';
import usePermissionStore from '@/store/modules/permission';

const { proxy } = getCurrentInstance();
const { poweredByQiankun } = proxy;

if (!poweredByQiankun) {
  const permissionStore = usePermissionStore();
  const sidebarRouters = computed(() => permissionStore.sidebarRouters);
  QiankunLoader(sidebarRouters);
}

onMounted(() => {
  nextTick(() => {
    // 初始化主题样式
    handleThemeStyle(useSettingsStore().theme);
  });

  if (!poweredByQiankun && !window.qiankunStarted) {
    window.qiankunStarted = true;
    start({
      urlRerouteOnly: true,
      sandbox: {
        experimentalStyleIsolation: true, // 实验性沙箱
      },

      // fetch(url, ...args) {
      //   return window.fetch(url, {
      //     ...args,
      //     //  cookie 携带
      //     // mode: 'cors',
      //     // credentials: 'include',
      //   });
      // }
    });
  }
});
</script>
