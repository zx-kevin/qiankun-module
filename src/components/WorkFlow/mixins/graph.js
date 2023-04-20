/*
 * @Author: K
 * @Date: 2023-03-09 20:11:20
 * @Descripttion: mixin - graph参数
 * @FilePath: \decision_engine_ui\src\components\WorkFlowNew\mixins\graph.js
 * @LastEditors: K
 * @LastEditTime: 2023-03-22 15:09:05
 */

const graph = {
  inject: ['getNode'],
  data() {
    return {
      node: null,
      graph: null,
      attrs: null,
      dictMap: null,
    };
  },
  mounted() {
    this.node = this.getNode();
    const { data, model } = this.node;
    this.graph = model.graph;
    this.dictMap = model.graph.dictMap;
    this.attrs = data;
  },
  methods: {
    onEvents() {
      if (this.graph && this.graph.onEvents) this.graph.onEvents(...arguments);
    },
  },
};

export default graph;
