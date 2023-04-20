<template>
  <div
    class="recursion"
    :class="{ children: children }"
    :style="{
      borderBottom: !children ? '1px solid #DCDFE6' : '',
      marginBottom: !children ? '-1px' : '',
    }"
  >
    <div class="top_recursion_for" v-for="(li, index) in list" :key="li.random">
      <div
        class="recursion_cont"
        :style="{
          flexGrow: li.children && li.children.length ? 0 : 1,
          borderTop: !children ? 'none' : '',
          width: recursionSon(li.children, 0) ? recursionSon(li.children, 0) + 'px' : '200px',
        }"
      >
        <cell
          :item="li"
          :class="!li.children || li.children.length === 0 ? 'top toplast ' + Math.random() : 'top'"
        />
        <el-dropdown class="dropdown" @command="handleCommand($event, list, li, index)">
          <el-icon><Operation /></el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-if="!(li.children && li.children.length)"
                icon="Bottom"
                command="addSon"
              >
                向下添加
              </el-dropdown-item>
              <el-dropdown-item icon="Right" command="addBrother">向右添加</el-dropdown-item>
              <el-dropdown-item v-if="children || index > 0" icon="Close" command="delect">
                删除此字段
              </el-dropdown-item>
              <el-dropdown-item icon="DocumentCopy" command="copy">复制此字段</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <TopRecursion
        v-if="li.children && li.children.length"
        :list="li.children"
        :children="true"
        :conditionNodes="conditionNodes"
      />
    </div>
  </div>
</template>

<script setup name="TopRecursion">
import cell from '../cell';
import bus from '../../bus.js';

const props = defineProps({
  list: {
    type: Array,
    default: () => [],
  },
  children: {
    type: Boolean,
    default: false,
  },
  conditionNodes: {
    type: Object,
    default: () => ({}),
  },
});

props.list.forEach((item) => {
  if (!item.random) item.random = Math.random();
});

function recursionSon (arr, width) {
  arr.forEach((item) => {
    if (item.children && item.children.length) {
      return (width += recursionSon(item.children, width) - width);
    } else {
      width += 200;
    }
  });
  return width;
}

function handleCommand (e, list, li, index) {
  switch (e) {
    case 'addSon':
      if (Array.isArray(li.children)) {
        li.children.push({
          nodeName: '',
          nodeType: 'tableTopCondition',
          nodeProps: {
            nodeType: 'tableTopCondition',
            conditionNodes: JSON.parse(JSON.stringify(props.conditionNodes)),
          },
          children: [],
          random: Math.random(),
        });
      } else {
        li.children = [
          {
            nodeName: '',
            nodeType: 'tableTopCondition',
            nodeProps: {
              nodeType: 'tableTopCondition',
              conditionNodes: JSON.parse(JSON.stringify(props.conditionNodes)),
            },
            children: [],
            random: Math.random(),
          },
        ];
      }
      bus.emit('reCount', {
        type: 'addTop',
      });
      break;
    case 'addBrother':
      list.splice(index + 1, 0, {
        nodeName: '',
        nodeType: 'tableTopCondition',
        nodeProps: {
          nodeType: 'tableTopCondition',
          conditionNodes: JSON.parse(JSON.stringify(props.conditionNodes)),
        },
        children: [],
        random: Math.random(),
      });
      bus.emit('reCount', {
        type: 'addTop',
      });
      break;
    case 'delect':
      list.splice(index, 1);
      bus.emit('reCount', {
        type: 'deleteTop',
      });
      break;
    case 'copy':
      let obj = JSON.parse(JSON.stringify(li));
      obj.random = Math.random();
      list.splice(index + 1, 0, obj);
      bus.emit('reCount', {
        type: 'copyTop',
        data: li,
      });
      break;
  }
}
</script>

<style lang="scss" scoped>
.recursion {
  display: flex;
  flex-grow: 1;

  .top_recursion_for {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;

    flex-shrink: 1;
    .recursion_cont {
      border-top: 1px solid $--border-color-default;
      border-left: 1px solid $--border-color-default;
      position: relative;
      height: 80px;

      .dropdown {
        position: absolute;
        top: 0;
        left: 0;
      }
      .top {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
