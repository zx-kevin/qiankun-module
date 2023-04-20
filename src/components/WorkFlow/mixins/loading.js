/*
 * @Author: K
 * @Date: 2023-03-06 17:08:05
 * @Descripttion: mixin - 加载效果
 * @FilePath: \decision_engine_ui\src\components\WorkFlowNew\mixins\loading.js
 * @LastEditors: K
 * @LastEditTime: 2023-03-06 19:00:51
 */
import { ElLoading } from 'element-plus';

const Loading = {
  data() { 
    return {
      _loadingInstance: null
    }
  },
  methods: {
    startLoading() {
      this._loadingInstance = ElLoading.service({
        target: this.$el
      })
    },
    stopLoading() {
      if (this._loadingInstance) this._loadingInstance.close()
    }
  },
};

export default Loading;
