/*
 * @Author: 杰 xuyongfeng@jeoho.com
 * @Date: 2023-02-01 15:01:35
 * @LastEditors: K
 * @LastEditTime: 2023-04-23 11:09:51
 * @FilePath: \demo-ui\vite.config.js
 * @Description:
 *
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved.
 */
import { defineConfig, loadEnv } from 'vite';
import path from 'path';
import createVitePlugins from './vite/plugins';

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd());
  const { VITE_APP_ENV, VITE_BASE_URL } = env;
  return {
    // 部署生产环境和开发环境下的URL。
    // 默认情况下，vite 会假设你的应用是被部署在一个域名的根路径上
    // 例如 https://www.jeoho.com/。则设置 baseUrl 为 https://www.jeoho.com/。
    base: VITE_APP_ENV === 'production' ? VITE_BASE_URL || '/' : '/',
    plugins: createVitePlugins(env, command === 'build'),
    resolve: {
      // https://cn.vitejs.dev/config/#resolve-alias
      alias: {
        // 设置路径
        '~': path.resolve(__dirname, './'),
        // 设置别名
        '@': path.resolve(__dirname, './src'),
      },
      // https://cn.vitejs.dev/config/#resolve-extensions
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    },
    // vite 相关配置
    server: {
      https: true,
      port: 90,
      host: true,
      open: true,
      proxy: {
        // https://cn.vitejs.dev/config/#server-proxy
        '/api': {
          // target: 'http://192.168.101.44:7000',
          target: 'https://dev-decision-engine.jeoho.com/api',
          // target: `http://192.168.101.141:7000`,  //玉胜
          // target: `http://192.168.101.52:7000`, //小玲
          // target: `http://192.168.101.31:7000`,  //秦朋
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api/, ''),
          ws: true, //websocket支持/
        },
        '^/rtc': {
          target: 'https://dev-decision-engine-srs.jeoho.com/',
          changeOrigin: true,
          ws: true,
        },
      },
    },
    //fix:error:stdin>:7356:1: warning: "@charset" must be the first rule in the file
    css: {
      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove();
                }
              },
            },
          },
          //  样式隔离 自定义命名空间 与 index.html 类名对应
          require('postcss-plugin-namespace')('.qiankun-demo', {
            ignore: [
              'html', 'body', /^.el-/, ':root', /^\*/, 'label', 'button', 'input', 'select', 'textarea',
            ]
          }),
        ],
      },
      preprocessorOptions: {
        scss: {
          // 引入 scss变量 这样就可以在全局中使用
          additionalData: `@import "./src/assets/styles/variable/index.scss";`,
        },
      },
    },
  };
});
