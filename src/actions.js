import { initGlobalState } from 'qiankun'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

function emptyAction(...args) {
  // 警告：提示当前使用的是空 Action
  console.warn("Current execute action is empty!");
}

class Actions {

  initialStore = {
    sub: 'main'
  }

  actions = {
    name: '',
    instance: null,
    onGlobalStateChange: emptyAction,
    setGlobalState: emptyAction,
  };

  constructor() {
    if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
      this.actions.instance = initGlobalState(this.initialStore)
      const { onGlobalStateChange, setGlobalState } = this.actions.instance
      this.actions.onGlobalStateChange = onGlobalStateChange
      this.actions.setGlobalState = setGlobalState
    }
  }

  getName() {
    return this.actions.name
  }

  /**
   * 设置 actions
   */
  setActions({ onGlobalStateChange, setGlobalState }) {
    this.actions.onGlobalStateChange = onGlobalStateChange || emptyAction;
    this.actions.setGlobalState = setGlobalState || emptyAction;
  }

  /**
   * 映射
   */
  onGlobalStateChange(...args) {
    return this.actions.onGlobalStateChange(...args);
  }

  /**
   * 映射
   */
  setGlobalState(...args) {
    return this.actions.setGlobalState(...args);
  }
}

const actions = new Actions();
export default actions;