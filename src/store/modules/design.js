/*
 * @Author: yangxiong yangxiong@jeoho.com
 * @Date: 2023-03-06 16:57:27
 * @LastEditors: yangxiong yangxiong@jeoho.com
 * @LastEditTime: 2023-04-07 18:04:29
 * @FilePath: \decision_engine_ui\src\store\modules\processDesign.js
 * @Description: 审批流 store
 */
const useDesignStore = defineStore('Design', {
  state: () => ({
    nodeMap: new Map(),
    isEdit: null,
    selectedNode: {},
    selectFormItem: null,
    design: {},
    flowId: '',
    featureOptions: [],
  }),
  actions: {
    setFeatureOptions(val) {
      this.featureOptions = val;
    },
  },

  mutations: {
    selectedNode(state, val) {
      state.selectedNode = val;
    },
    loadForm(state, val) {
      state.design = val;
    },
    setIsEdit(state, val) {
      state.isEdit = val;
    },
  },
});

export default useDesignStore;
