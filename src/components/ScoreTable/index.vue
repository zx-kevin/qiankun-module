<template>
  <div class="score_table">
    <el-scrollbar max-height="470" class="score_box" wrap-class="score_wrap">
      <thead class="score_table_header">
        <tr style="display: flex">
          <th class="score_table_cell">维度</th>
          <th class="score_table_cell w100">权重</th>
          <th class="score_table_cell" v-for="value in condition" :key="value">条件{{ value }}</th>
          <th class="score_table_cell w100">评分</th>
        </tr>
      </thead>
      <div class="score_table_body">
        <tbody :key="updateKey">
          <tr v-for="(value, index) in data" :key="index" class="score_table_row">
            <!-- 维度 -->
            <td class="score_table_cell">
              <div class="dropdown">
                <el-dropdown class="dropdown" @command="handleCommand($event, data, value, index)">
                  <el-icon class="dropdown_icon"><Operation /></el-icon>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item icon="Bottom" command="addBrother"
                        >向下添加</el-dropdown-item
                      >
                      <el-dropdown-item v-if="!value.children.length" icon="Right" command="addSon">
                        向右添加
                      </el-dropdown-item>
                      <el-dropdown-item v-if="index != 0" icon="Close" command="delect">
                        删除此字段
                      </el-dropdown-item>
                      <el-dropdown-item icon="DocumentCopy" command="copy"
                        >复制此字段</el-dropdown-item
                      >
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
              <textInput v-model="value.nodeName" />
            </td>
            <!-- 权重 -->
            <td class="score_table_cell weight">
              <textInput v-model="value.weight" inputType="Number" :otherOptions="otherOptions" />
            </td>
            <!-- 条件加评分 -->
            <recursion :data="value.children" />
          </tr>
        </tbody>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup>
import recursion from './components/recursion';
import textInput from '@/components/RecursionTable/components/textInput';
import bus from '@/components/RecursionTable/bus.js';

defineExpose({ init, update, validate });

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  computeMode: {
    type: String,
  },
});

const { proxy } = getCurrentInstance();

const otherOptions = reactive({
  precision: 0,
  min: 0,
  max: 100,
});

const max = ref(0);
const condition = computed(() => {
  max.value = 0;
  each(props.data, 1);
  return max.value && max.value - 1;
});

const conditionNodes = {
  nodeName: '',
  nodeType: 'and',
  children: [
    {
      nodeName: '',
      nodeType: 'arith',
      nodeProps: {
        leftFeatureType: '',
        leftValue: '',

        leftFeatureCode: '',
        leftFeatureName: '',
        leftValueType: '',

        operator: '',

        rightFeatureType: 'value',
        rightValue: '',

        rightFeatureCode: '',
        rightFeatureName: '',
        rightValueType: '',

        nodeType: 'arith',
      },
    },
  ],
};

const updateKey = ref(0);

watch(
  () => props.computeMode,
  (newValue, oldValue) => {
    if (newValue === '1') {
      otherOptions.max = 0;
      props.data.forEach((item) => {
        item.weight = 0;
      });
    } else {
      otherOptions.max = 100;
    }
  },
  {
    immediate: true,
  },
);

function init () {
  updateKey.value++;
  props.data.length = 0;
  props.data.push({
    nodeName: '',
    nodeType: 'dimension',
    weight: '0',
    children: [
      {
        nodeName: '',
        nodeType: 'condition',
        nodeProps: {
          nodeType: 'condition',
          conditionNodes: JSON.parse(JSON.stringify(conditionNodes)),
        },
        children: [
          {
            nodeName: '',
            nodeType: 'result',
            nodeProps: {
              nodeType: 'result',
              result: '1',
            },
            children: [],
          },
        ],
      },
    ],
  });
}

function update () {
  updateKey.value++;
}

function validate (fn) {
  const arr = [];
  arr.push(weightValidate(props.data));
  bus.emit('validate', (v) => arr.push(v));
  const valid = arr.every((item) => item);
  fn && fn(valid);
  return new Promise((resolve, reject) => {
    if (valid) {
      resolve(valid);
    } else {
      reject(valid);
    }
  });
}

// 权重校验
function weightValidate (arr) {
  const total = arr.reduce((total, item) => {
    return total + Number(item.weight);
  }, 0);
  if (props.computeMode === '1') {
    if (total > 0) {
      proxy.$message({
        message: '计算方式为求和，权重总和为0',
        type: 'error',
      });
      return false;
    } else {
      return true;
    }
  } else {
    if (total != 100) {
      proxy.$message({
        message: '计算方式为加权求和，权重总和为100',
        type: 'error',
      });
      return false;
    } else {
      return true;
    }
  }
}

function each (data, floor) {
  data.forEach((e) => {
    e.floor = floor;
    if (floor > max.value && e.nodeType !== 'result') {
      max.value = floor;
    }
    if (e.children.length > 0) {
      each(e.children, floor + 1);
    }
  });
}

function handleCommand (e, list, li, index) {
  switch (e) {
    case 'addSon':
      li.children.push({
        nodeName: '',
        nodeType: 'condition',
        nodeProps: {
          nodeType: 'condition',
          conditionNodes: JSON.parse(JSON.stringify(conditionNodes)),
        },
        children: [
          {
            nodeName: '',
            nodeType: 'result',
            nodeProps: {
              nodeType: 'result',
              result: '1',
            },
            children: [],
          },
        ],
      });
      break;
    case 'addBrother':
      list.splice(index + 1, 0, {
        nodeName: '',
        nodeType: 'dimension',
        weight: '0',
        children: [
          {
            nodeName: '',
            nodeType: 'condition',
            nodeProps: {
              nodeType: 'condition',
              conditionNodes: JSON.parse(JSON.stringify(conditionNodes)),
            },
            children: [
              {
                nodeName: '',
                nodeType: 'result',
                nodeProps: {
                  nodeType: 'result',
                  result: '1',
                },
                children: [],
              },
            ],
          },
        ],
      });
      break;
    case 'delect':
      list.splice(index, 1);
      break;
    case 'copy':
      let obj = JSON.parse(JSON.stringify(li));
      list.splice(index + 1, 0, obj);
      break;
  }
}
</script>

<style lang="scss" scoped>
.score_table {
  padding: 20px;
  font-size: 14px;

  .score_box {
    display: flex;
    :deep(.score_wrap) {
      border: 1px solid $--border-color-default;
    }
  }
  .score_table_header {
    display: flex;
    .score_table_cell {
      width: 200px;
      height: 56px;
      line-height: 56px;
      color: $--text-color-10;
      background-color: $--fill-color-shallow;
      border-right: 1px solid $--border-color-default;
      &:last-child {
        border-right: none;
      }
      &.w100 {
        width: 100px;
      }
      &.w200 {
        width: 200px;
      }
    }
  }
  .score_table_body {
    display: flex;
    .score_table_row {
      min-height: 80px;
      display: flex;
      position: relative;
      .score_table_cell {
        width: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        border-right: 1px solid $--border-color-default;
        border-top: 1px solid $--border-color-default;
        .dropdown {
          position: absolute;
          top: 0;
          left: 0;
          .dropdown_icon {
            color: $--text-color-40;
            font-size: 14px;
          }
        }
        &.weight {
          width: 100px;
          min-width: 100px;
          flex-shrink: 0;
        }
      }
    }
  }
}
</style>
