<template>
  <div class="cell_box">
    <div class="cell" :class="{ error: error }">
      <el-scrollbar view-style="height:100%">
        <el-tree :data="dataTree" default-expand-all />
      </el-scrollbar>
      <!-- <div v-for="(row, index) in data" :key="index" class="cell_content">
        <span class="cell_title">{{ row.value }}</span>
        <span v-if="!row.children[0].value[0].value" class="cell_empty">双击编辑</span>
        <el-scrollbar v-else view-style="height:100%">
          <div class="cell_children">
            <span v-for="(item, i) in row.children" :key="i">
              {{ item.value[0].feature?.label || item.value[0].featureName || item.value[0].value }}
              {{ item.value[1].value }}
              {{ item.value[2].feature?.label || item.value[2].featureName || item.value[2].value }}
            </span>
          </div>
        </el-scrollbar>
      </div> -->
      <el-icon class="cell_icon" @click="openCompile"><Edit /></el-icon>
    </div>
    <Dialog v-model:visible="visible" title="编辑" width="1020px">
      <template #content>
        <Ruleset ref="rulesetRef" :data="substitute" :options="options" />
        <!-- :menu="[
            {
              label: '添加规则',
              icon: 'caidan',
              type: 'addRule',
            },
          ]" -->
      </template>
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import Dialog from '@/components/Dialog';
import Ruleset from '@/components/Ruleset';
import bus from '../../bus.js';

const props = defineProps({
  item: {
    type: Object,
    default: () => ({}),
  },
});

const options = inject('options');
const operatorDict = inject('operator');

const visible = ref(false);

const rulesetRef = ref();

const { conditionNodes } = toRefs(props.item.nodeProps);

const data = ref(dataTransition([conditionNodes.value]));
const dataTree = ref(dataMapTree(data.value));

const substitute = ref([]);

const error = ref(false);

function openCompile (params) {
  visible.value = true;
  substitute.value = JSON.parse(JSON.stringify(data.value));
}
async function submit () {
  await rulesetRef.value.validate();
  visible.value = false;
  data.value = substitute.value;
  conditionNodes.value = dataRegression(data.value)[0];
  dataTree.value = dataMapTree(data.value);
  error.value = false;
}

function dataRegression (arr) {
  return arr.map((item) => {
    if (item.children && item.children.length) {
      const { value, children } = item;
      return {
        nodeName: '',
        nodeType: value,
        children: dataRegression(children),
      };
    } else {
      const { valueType: leftType, value: leftValue } = item.value[0];
      const { value: operator } = item.value[1];
      const { valueType: rightType, value: rightValue } = item.value[2];
      let left, right;
      if (leftType === 'constant') {
        left = {
          leftFeatureType: 'value',
          leftValue: leftValue,
        };
      } else {
        const { featureValueType, featureCode, featureName, featureType } = item.value[0].feature;
        left = {
          leftValueType: featureValueType,
          leftFeatureCode: featureCode,
          leftFeatureName: featureName,
          leftFeatureType: featureType,
          leftFeature: item.value[0].feature,
        };
      }
      if (rightType === 'constant') {
        right = {
          rightFeatureType: 'value',
          rightValue: rightValue,
        };
      } else {
        const { featureValueType, featureCode, featureName, featureType } = item.value[2].feature;
        right = {
          rightValueType: featureValueType,
          rightFeatureCode: featureCode,
          rightFeatureName: featureName,
          rightFeatureType: featureType,
          rightFeature: item.value[2].feature,
        };
      }
      return {
        nodeName: '',
        nodeType: 'arith',
        nodeProps: {
          ...left,
          operator,
          ...right,
          nodeType: 'arith',
        },
      };
    }
  });
}

function dataTransition (arr) {
  return arr.map((item) => {
    if (item.children && item.children.length) {
      return {
        type: 'relation',
        value: item.nodeType,
        children: dataTransition(item.children),
      };
    } else {
      const {
        leftFeatureType,
        leftValue,
        leftFeatureCode,
        leftFeatureName,
        operator,
        rightFeatureType,
        rightValue,
        rightFeatureCode,
        rightFeatureName,
      } = item.nodeProps;
      const left = { type: 'attribute' };
      if (leftFeatureType === 'value') {
        left.value = leftValue;
        left.valueType = 'constant';
      } else {
        left.value = leftFeatureCode;
        left.valueType = 'variable';
        left.featureName = leftFeatureName;
      }
      const right = { type: 'value' };
      if (rightFeatureType === 'value') {
        right.value = rightValue;
        right.valueType = 'constant';
      } else {
        right.value = rightFeatureCode;
        right.valueType = 'variable';
        right.featureName = rightFeatureName;
      }

      return {
        type: 'line',
        value: [left, { type: 'condition', value: operator }, right],
      };
    }
  });
}

function validate (arr) {
  return arr.every((row) => {
    if (row.children && row.children.length) {
      return validate(row.children);
    } else {
      return row.value.every((item) => item.value);
    }
  });
}

function dataMapTree (arr) {
  return arr.map((item) => {
    if (item.children && item.children.length) {
      const { value, children } = item;
      return {
        label: value,
        children: dataMapTree(children),
      };
    } else {
      const { valueType: leftType, value: leftValue } = item.value[0];
      const { value: operator } = item.value[1];
      const { valueType: rightType, value: rightValue } = item.value[2];
      let left, right;
      if (leftType === 'constant') {
        left = leftValue;
      } else {
        const value = item.value[0];
        left = value.feature ? value.feature.label : value.featureName;
      }
      if (rightType === 'constant') {
        right = rightValue;
      } else {
        const value = item.value[2];
        right = value.feature ? value.feature.label : value.featureName;
      }
      if (left && operator && right) {
        return {
          label: `${left || '-'} ${
            operatorDict.value.filter((item) => item.value === operator)[0].label
          } ${right || '-'}`,
        };
      } else {
        return {
          label: `请选择`,
        };
      }
    }
  });
}

onMounted(() => {
  bus.on('validate', (fn) => {
    error.value = !validate(data.value);
    fn && fn(!error.value);
  });
});
onBeforeUnmount(() => {
  bus.off('validate');
});
</script>

<style lang="scss" scoped>
.cell_box {
  width: 100%;
  height: 100%;
  .cell {
    width: 100%;
    height: 100%;
    padding-left: 16px;
    cursor: pointer;
    position: relative;
    &.error {
      background-color: $--primary-red-4;
    }
    // &:hover {
    //   background-color: $--fill-color-default;
    // }
    .el-tree {
      background-color: transparent;
      :deep(.el-tree-node) {
        & > .el-tree-node__children {
          overflow: revert;
        }
      }
    }
    .cell_icon {
      position: absolute;
      top: 0;
      right: 0;
      color: $--text-color-40;
      font-size: 14px;
    }
    .cell_content {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      color: $--text-color-10;
      font-size: 14px;
      .cell_title {
        font-weight: bold;
      }
      .cell_children {
        white-space: nowrap;
        display: flex;
        flex-direction: column;
      }
      .cell_empty {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: translate(-8px, -10px);
      }
    }
  }
}
</style>
