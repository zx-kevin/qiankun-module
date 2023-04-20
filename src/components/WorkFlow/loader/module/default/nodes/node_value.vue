<!--
 * @Author: K
 * @Date: 2023-03-10 11:35:58
 * @Descripttion: 决策树 - 结果节点组件
 * @FilePath: \decision_engine_ui\src\components\WorkFlowNew\loader\module\default\nodes\node_value.vue
 * @LastEditors: K
 * @LastEditTime: 2023-03-22 16:36:36
-->
<template>
  <div class="node-value">
    <div class="box" :class="{ is_erroe: error }">
      <el-input ref="inputRef" v-model="value" :title="value" :readonly="!editing" @blur="onBlur"></el-input>
      <svg-icon v-show="!editing" @click.stop="handleEdit" icon-class="bianji" />
    </div>
    <p class="err_value" v-show="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ElInput } from 'element-plus';
import SvgIcon from '@/components/SvgIcon';
import Graph from '../../../../mixins/graph';

const getNode = inject('getNode');

const inputRef = ref();
const node = ref(null);
const graph = ref(null);
const attrs = reactive({
  value: {},
});
const value = ref('');
const error = ref('');
const editing = ref(false);

onMounted(() => {
  node.value = getNode();
  node.value.on('change:data', ({ current }) => {
    attrs.value = current;
    value.value = current.value;
    error.value = current.error;
  });
  const { data, model } = node.value;
  graph.value = model.graph;
  attrs.value = data;
  value.value = data.value;
  error.value = data.error;
});

// watch(value, (val) => {
//   console.log('watch', val);
// });

function onEvents() {
  if (graph.value && graph.value.onEvents) graph.value.onEvents(...arguments);
}

function handleEdit() {
  editing.value = true;
  inputRef.value.focus();
}

function onBlur() {
  editing.value = false;

  onEvents({ type: 'value_update' }, { id: attrs.value.id, value: value.value });
}
</script>

<style lang="scss" scoped>
.node-value {
  width: 100%;
  height: 100%;

  .box {
    width: 100%;
    height: 100%;
    box-shadow: 0px 0px 10px -5px rgba(0, 0, 0, 0.5);
    background-color: #fff;
    display: flex;
    align-items: center;
    border-radius: 5px;

    &.is_erroe {
      box-shadow: none;
      border: 1px solid red;
      position: relative;
    }
  }

  :deep(.el-input) {
    flex: 1;
    overflow-x: hidden;
    height: 100%;

    .el-input__wrapper {
      box-shadow: none;

      .el-input__inner {
        text-overflow: ellipsis;
      }
    }
  }

  .err_value {
    position: absolute;
    bottom: -20px;
    left: 0;
    line-height: 15px;
    font-size: 14px;
    color: red;
  }

  .svg-icon {
    width: 30px;
    height: 100%;
    padding: 0 5px;
    cursor: pointer;
  }
}
</style>
