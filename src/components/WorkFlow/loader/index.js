/*
 * @Author: K
 * @Date: 2023-02-22 13:19:27
 * @Descripttion: 决策流组件 - 加载配置
 * @FilePath: \decision_engine_ui\src\components\WorkFlowNew\loader\index.js
 * @LastEditors: K
 * @LastEditTime: 2023-03-15 10:27:25
 */
import { Graph } from '@antv/x6';
import { register, shapeMaps, getTeleport } from '@antv/x6-vue-shape';
import { render, h, Fragment } from 'vue';

import * as module from './module/index';

function load(graph, type) {
  if (!graph || !type) return;

  const target = module[`${type}_module`];
  Object.keys(target).forEach((key) => {
    switch (key) {
      case 'nodes':
        load_nodes(graph, target[key]);
        break;
      case 'events':
        load_events(graph, target[key]);
        break;
    }
  });
}

export default { load };

function load_nodes(graph, nodes) {
  const vueNodes = nodes.filter((item) => item.type === 'vue' && !shapeMaps[item.shape]);
  vueNodes.forEach(register);
  if (vueNodes.length) {
    const teleport = getTeleport();
    const { container } = graph;
    render(h(teleport), container);
  }

  nodes
    .filter((item) => item.type !== 'vue')
    .forEach((item) => Graph.registerNode(item.key, item, true));
}

function load_events(graph, events) {
  events.forEach((item) => {
    graph.on(item.key, item.handle);
  });
}
