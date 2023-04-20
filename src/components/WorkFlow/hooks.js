/*
 * @Author: K
 * @Date: 2023-02-22 15:04:34
 * @Descripttion: 决策流组件 - 钩子
 * @FilePath: \decision_engine_ui\src\components\WorkFlowNew\hooks.js
 * @LastEditors: K
 * @LastEditTime: 2023-03-23 15:40:09
 */
import { computed, reactive, shallowRef, watch } from 'vue';
import { diffCells, patch, checkId } from './utils';
import Hierarchy from '@antv/hierarchy';
import { StringExt } from '@antv/x6';

export const useGraphState = (initState = {}) => {
  const nodes = shallowRef(initState.nodes || []);
  const edges = shallowRef(initState.edges || []);
  const graph = shallowRef(initState.graph || null);
  const setGraph = (g) => g && (graph.value = g);
  const record = {};
  const eventName = 'update:state';
  // 注册一个自定义事件，patch完成后触发
  const returnPromise = (execute) => {
    return new Promise((resolve) => {
      if (graph.value) {
        graph.value.once(eventName, resolve);
      }
      execute();
    });
  };
  //  节点位置至中心点
  const center = (id) => {
    graph.value.centerCell(graph.value.getCellById(id));
  };
  // 数据处理
  const formatter = (target) => {
    const treeModule = Hierarchy.mindmap(target, {
      isHorizontal: true,
      direction: 'H',
      getHeight(n) {
        return n.height || 50;
      },
      getWidth(n) {
        return n.width || 180;
      },
      getHGap() {
        return 50;
      },
      getVGap() {
        return 20;
      },
      getSide: () => {
        return 'right';
      },
    });
    const result = {
      nodes: [],
      edges: [],
    };
    const traverse = (target, source) => {
      const { data, children, x, y } = target;
      const ruleChildrenFormatter = {
        rule: Object.assign(
          {},
          data.data?.rule || {},
          (data.data?.rule && {
            children: data.data.rule.children.map((item) => ({ ...item, children: [] })),
          }) ||
            {},
        ),
      };
      const nodeItem = {
        // data: data['data'],
        data: Object.assign({}, data['data'], ruleChildrenFormatter),
        width: (target.width && target.width - target.hgap * 2) || undefined,
        height: (target.height && target.height - target.vgap * 2) || undefined,
        x,
        y,
      };
      if (target.id) {
        if (!record[target.id]) record[target.id] = {};
        if (record[target.id].new)
          record[target.id].old = JSON.parse(JSON.stringify(record[target.id].new));
        record[target.id].new = JSON.parse(JSON.stringify(nodeItem));
      }
      const nodeModule = {
        ...target,
        ...nodeItem,
        shape: data['shape'],
      };
      result.nodes.push(nodeModule);

      if (source)
        result.edges.push({
          id: `${source.id}-${target.id}`,
          source: {
            cell: source.id,
            anchor: 'right',
          },
          target: {
            cell: target.id,
            anchor: 'left',
          },
        });

      if (children && children.length)
        children.forEach((item) => {
          traverse(item, target);
        });
    };
    traverse(treeModule);
    return result;
  };

  const dataRef = reactive({
    value: {},
  });
  const dataHook = {
    getter() {
      return dataRef.value;
    },
    setter(target) {
      return target;
    },
  };
  const setGraphData = (target) => {
    if (graph.value && target) {
      // const targetFormat = dataHook.setter(target);
      // graph.value.fromJSON(targetFormat);

      const setRes = (dataHook.setter && dataHook.setter(target)) || target;
      dataRef.value = setupId(setRes);

      // dataRef.value = target;
    }
  };
  const setupId = (target) => {
    const res = { ...target, id: target.data.id || StringExt.uuid() };
    res['children'] = (target?.['children'] || []).map(setupId);
    return res;
  };
  // 设置数据之前先检查id是否存在，自动创建id，确保diffCells的时候能使用id进行判断
  const setNodes = (_nodes) => returnPromise(() => (nodes.value = _nodes.map(checkId)));
  const setEdges = (_edges) => returnPromise(() => (edges.value = _edges.map(checkId)));

  // const demo = computed(() => JSON.parse(JSON.stringify(dataRef.value)));
  // watch(
  //   demo,
  //   (val, oldVal) => {
  //     console.log('dataRef.value', val);
  //     console.log('dataRef.value.old', oldVal);
  //   },
  //   { deep: true },
  // );

  watch(
    () => formatter(dataRef.value),
    (obj) => {
      if (!obj) return;
      const { nodes, edges } = obj;
      if (nodes) setNodes(nodes);
      if (edges) setEdges(edges);
    },
    // { deep: true },
  );

  // 先使用diffCells拿到变化数据，再使用patch函数更新数据到x6画布
  watch(
    () => ({
      nodes: diffCells(graph.value, nodes.value, 'node', record),
      edges: diffCells(graph.value, edges.value, 'edge', record),
    }),
    ({ nodes, edges }) => {
      patch(graph.value, nodes);
      patch(graph.value, edges);
      if (graph.value) {
        graph.value.trigger(eventName);
      }
    },
  );

  return {
    nodes,
    edges,
    graph,
    setGraph,
    dataHook,
    setGraphData,
    center,
  };
};
