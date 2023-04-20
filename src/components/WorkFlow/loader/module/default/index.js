/*
 * @Author: K
 * @Date: 2023-02-22 13:20:40
 * @Descripttion: 决策流 - 加载模块配置
 * @FilePath: \decision_engine_ui\src\components\WorkFlowNew\loader\module\default\index.js
 * @LastEditors: K
 * @LastEditTime: 2023-03-14 15:40:02
 */
import NodeConditions from './nodes/node_conditions.jsx';
import NodeValue from './nodes/node_value.vue';

export const default_module = {
  nodes: [
    {
      type: 'vue',
      shape: 'node_conditions',
      width: 180,
      height: 50,
      component: NodeConditions,
    },
    {
      type: 'vue',
      shape: 'node_value',
      width: 180,
      height: 50,
      component: NodeValue,
    },
  ],
  events: [
    {
      key: 'node:mouseenter',
      handle({ node }) {
        const depth = node.store.data.depth;
        if (depth === 0) return;
        node.addTools([
          {
            name: 'button-remove',
            args: {
              onClick: ({ view }) => {
                const { graph, cell } = view;
                if (graph.onEvents) graph.onEvents({ type: 'remove' }, cell.data);
              },
            },
          },
        ]);
      },
    },
    {
      key: 'node:mouseleave',
      handle({ node }) {
        if (node.hasTool('button-remove')) {
          node.removeTool('button-remove');
        }
      },
    },
  ],
};
