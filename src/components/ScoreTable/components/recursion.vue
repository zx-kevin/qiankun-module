<template>
  <td class="score_cell" :style="{ 'flex-grow': flexNumber, flex: children ? '' : 1 }">
    <div v-for="(item, index) in data" :key="item.random" class="recursion_for">
      <div
        class="recursion_cont"
        :style="{
          height: recursionSon(item.children, 0) ? recursionSon(item.children, 0) + 'px' : '200px',
          flex: flexNumber,
        }"
      >
        <!-- 输入框 -->
        <cell :item="item" />
        <div class="dropdown">
          <el-dropdown class="dropdown" @command="handleCommand($event, data, item, index)">
            <el-icon class="dropdown_icon"><Operation /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item icon="Bottom" command="addBrother">向下添加</el-dropdown-item>
                <el-dropdown-item
                  v-if="!item.children.length || item.children[0].nodeType === 'result'"
                  icon="Right"
                  command="addSon"
                >
                  向右添加
                </el-dropdown-item>
                <el-dropdown-item v-if="!(!children && index === 0)" icon="Close" command="delect">
                  删除此字段
                </el-dropdown-item>
                <el-dropdown-item icon="DocumentCopy" command="copy">复制此字段</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <recursion
        v-if="item.children.length > 0 && item.children[0].nodeType === 'condition'"
        :data="item.children"
        :children="true"
        :flexNumber="flexNumber + 1"
      />
      <!-- 评分 -->
      <div v-else class="score">
        <textInput v-model="item.children[0].nodeProps.result" inputType="Number" />
      </div>
    </div>
  </td>
</template>

<script setup>
import cell from '@/components/RecursionTable/components/cell';
import textInput from '@/components/RecursionTable/components/textInput';

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  children: {
    type: Boolean,
    default: false,
  },
  flexNumber: {
    type: Number,
    default: 1,
  },
});

props.data.forEach((item) => {
  if (!item.random) item.random = Math.random();
});

function handleCommand (e, list, li, index) {
  switch (e) {
    case 'addSon':
      if (li.children[0].nodeType === 'result') {
        li.children = [
          {
            nodeName: '',
            nodeType: 'condition',
            nodeProps: {
              nodeType: 'condition',
              conditionNodes: {
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
              },
            },
            children: [li.children[0]],
            random: Math.random(),
          },
        ];
      } else {
      }
      break;
    case 'addBrother':
      list.splice(index + 1, 0, {
        nodeName: '',
        nodeType: 'condition',
        nodeProps: {
          nodeType: 'condition',
          conditionNodes: {
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
          },
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
        random: Math.random(),
      });
      break;
    case 'delect':
      let item = getSon(li.children, 'result');
      if (item && props.children && list.length === 1) {
        list.splice(index, 1, item);
      } else {
        list.splice(index, 1);
      }
      break;
    case 'copy':
      let obj = JSON.parse(JSON.stringify(li));
      list.splice(index + 1, 0, obj);
      break;
  }
}

function getSon (arr, field) {
  let son = null;
  arr.forEach((item) => {
    if (item.nodeType == field) {
      son = item;
    } else {
      son = getSon(item.children, field);
    }
  });
  return son;
}

function recursionSon (arr, height) {
  arr.forEach((item) => {
    if (item.children && item.children.length) {
      return (height += recursionSon(item.children, height) - height);
    } else {
      height += 80;
    }
  });
  return height;
}
</script>

<style lang="scss" scoped>
.score_cell {
  // flex: 1;
  width: 100%;
  // border-right: 1px solid $--border-color-default;
  // border-top: 1px solid $--border-color-default;
  // background-color: $--primary-red-4;
}
.recursion_for {
  box-sizing: border-box;
  display: flex;
  min-height: 80px;
  .recursion_cont {
    // flex: 1;
    width: 200px;
    min-width: 200px;
    position: relative;
    border-right: 1px solid $--border-color-default;
    border-top: 1px solid $--border-color-default;
    .dropdown {
      position: absolute;
      top: 0;
      left: 0;
    }
  }
  .score {
    width: 100px;
    min-width: 100px;
    height: 80px;
    position: absolute;
    right: -100px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-top: 1px solid $--border-color-default;
  }
}
</style>
