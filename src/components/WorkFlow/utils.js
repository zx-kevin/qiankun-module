/*
 * @Author: K
 * @Date: 2023-02-22 11:21:33
 * @Descripttion: 决策流组件 - 工具类
 * @FilePath: \decision_engine_ui\src\components\WorkFlowNew\utils.js
 * @LastEditors: K
 * @LastEditTime: 2023-03-23 15:40:24
 */
import { Graph, Node, Edge, ObjectExt, StringExt } from '@antv/x6';

export const diffCells = (graph, cells, type, record) => {
  const create = [];
  const update = [];
  const remove = [];

  if (graph) {
    const Ctor = type === 'node' ? Node.create : Edge.create;
    cells.forEach((c) => {
      const cell = graph.getCellById(c.id);
      if (cell) {
        // 这里尝试重新调用一下create，然后通过setProp，直接将新创建的放进去
        const t = Ctor(c);
        const prop = t.getProp();
        t.dispose();
        const recordTarget = record && record[c.id];
        let recordDiff = false;
        if (recordTarget)
          recordDiff =
            recordTarget &&
            recordTarget.new &&
            recordTarget.old &&
            !ObjectExt.isEqual(recordTarget.new, recordTarget.old);
        if (!ObjectExt.isEqual(cell.getProp(), prop) && recordDiff) {
          update.push([cell, prop]);
        }
      } else {
        create.push(Ctor(c));
      }
    });
    const cellIds = new Set(cells.map((c) => c.id));
    const items = type === 'node' ? graph.getNodes() : graph.getEdges();
    items.forEach((cell) => {
      if (!cellIds.has(cell.id)) {
        remove.push(cell.id);
      }
    });
  }

  return {
    create,
    update,
    remove,
  };
};

export const patch = (graph, data) => {
  const { create = [], update = [], remove = [] } = data;
  if (graph) {
    graph.batchUpdate(
      'update',
      () => {
        graph.addCell(create);
        update.forEach(([cell, prop]) => {
          // 直接一次性更新全部的prop可能导致部分属性更新不成功 cell.setProp(prop)
          Object.keys(prop).forEach((key) => cell.setProp(key, prop[key]));
        });
        remove.forEach((item) => graph.removeCell(item));
      },
      data,
    );
  }
};

export const checkId = (metadata) => ({ ...metadata, id: metadata.id || StringExt.uuid() });
