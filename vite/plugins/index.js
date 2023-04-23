import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

import createAutoImport from './auto-import';
import createSvgIcon from './svg-icon';
import createCompression from './compression';
import createSetupExtend from './setup-extend';
// 核心方式
// https://cn.vitejs.dev/config/server-options.html#server-https
import basicSsl from '@vitejs/plugin-basic-ssl'

import qiankun from 'vite-plugin-qiankun'

export default function createVitePlugins(viteEnv, isBuild = false) {
  const vitePlugins = [vue(), vueJsx(),
  qiankun('decision', {
    useDevMode: true
  })];
  vitePlugins.push(createAutoImport());
  vitePlugins.push(createSetupExtend());
  !isBuild && vitePlugins.push(basicSsl());
  // vitePlugins.push(createSvgIcon(isBuild))
  isBuild && vitePlugins.push(...createCompression(viteEnv));
  return vitePlugins;
}