/*
 * @Author: yangxiong yangxiong@jeoho.com
 * @Date: 2023-03-06 16:57:27
 * @LastEditors: yangxiong yangxiong@jeoho.com
 * @LastEditTime: 2023-04-07 16:56:54
 * @FilePath: \decision_engine_ui\src\store\modules\processDesign.js
 * @Description: 决策流 store
 */
const useFlowStore = defineStore('flow', {
  state: () => ({
    nodeMap: new Map(),
    isEdit: null,
    selectedNode: {},
    selectFormItem: null,
    design: {},
    flowNo: '',
    dictMap: [], //决策类型
    operatorDict: [],
    optionType: null, // 操作类型
    shuntRatioTotal: 0,
    featureOptions: [],
    conditionNodeEnum: [],
  }),

  actions: {
    setOptionType(val) {
      this.optionType = val;
    },
    setOperatorDict(val) {
      this.operatorDict = val;
    },
    setFeatureOptions(val) {
      this.featureOptions = val;
    },
    setConditionNodeEnum(val) {
      this.conditionNodeEnum = val;
    },
  },
  // flowStore.setA('bbbb')

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

export default useFlowStore;
