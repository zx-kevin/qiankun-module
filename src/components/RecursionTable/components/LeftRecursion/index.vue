<template>
  <div class="recursion" :class="{ children: children }">
    <div class="left_recursion_for" v-for="(li, index) in list" :key="li.random">
      <div
        class="recursion_cont"
        :class="{ recursion_cont_none_children: !li.children || li.children.length === 0 }"
        :style="{
          flexGrow: li.children && li.children.length ? 0 : 1,
          height: recursionSon(li.children, 0) ? recursionSon(li.children, 0) + 'px' : '80px',
        }"
      >
        <cell
          :item="li"
          :class="
            !li.children || li.children.length === 0 ? 'left leftlast ' + Math.random() : 'left'
          "
        />
        <el-dropdown class="dropdown" @command="handleCommand($event, list, li, index)">
          <el-icon class="dropdown_icon"><Operation /></el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item icon="Bottom" command="addBrother">向下添加</el-dropdown-item>
              <el-dropdown-item
                v-if="!(li.children && li.children.length)"
                icon="Right"
                command="addSon"
              >
                向右添加
              </el-dropdown-item>
              <el-dropdown-item v-if="children || index > 0" icon="Close" command="delect">
                删除此字段
              </el-dropdown-item>
              <el-dropdown-item icon="DocumentCopy" command="copy">复制此字段</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <LeftRecursion
        ref="LeftRecursionRef"
        v-if="li.children && li.children.length"
        :list="li.children"
        :children="true"
        :conditionNodes="conditionNodes"
      />
    </div>
  </div>
</template>

<script setup name="LeftRecursion">
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

const LeftRecursionRef = ref();

function handleCommand (e, list, li, index) {
  switch (e) {
    case 'addSon':
      if (Array.isArray(li.children)) {
        li.children.push({
          nodeName: '',
          nodeType: 'tableLeftCondition',
          nodeProps: {
            nodeType: 'tableLeftCondition',
            conditionNodes: JSON.parse(JSON.stringify(props.conditionNodes)),
          },
          children: [],
          random: Math.random(),
        });
      } else {
        li.children = [
          {
            nodeName: '',
            nodeType: 'tableLeftCondition',
            nodeProps: {
              nodeType: 'tableLeftCondition',
              conditionNodes: JSON.parse(JSON.stringify(props.conditionNodes)),
            },
            children: [],
            random: Math.random(),
          },
        ];
      }
      bus.emit('reCount', {
        type: 'addLeft',
      });
      break;
    case 'addBrother':
      list.splice(index + 1, 0, {
        nodeName: '',
        nodeType: 'tableLeftCondition',
        nodeProps: {
          nodeType: 'tableLeftCondition',
          conditionNodes: JSON.parse(JSON.stringify(props.conditionNodes)),
        },
        children: [],
        random: Math.random(),
      });
      bus.emit('reCount', {
        type: 'addLeft',
      });
      break;
    case 'delect':
      list.splice(index, 1);
      bus.emit('reCount', {
        type: 'deleteLeft',
      });
      break;
    case 'copy':
      let obj = JSON.parse(JSON.stringify(li));
      obj.random = Math.random();
      list.splice(index + 1, 0, obj);
      bus.emit('reCount', {
        type: 'copyLeft',
        data: li,
      });
      break;
  }
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
.recursion {
  display: flex;
  flex-direction: column;
  .left_recursion_for {
    display: flex;
    flex-direction: row;
    box-sizing: border-box;

    .recursion_cont {
      position: relative;
      box-sizing: border-box;
      display: flex;
      border-right: 1px solid $--border-color-default;
      border-top: 1px solid $--border-color-default;
      width: 200px;

      .left {
        width: 100%;
      }
      .dropdown {
        position: absolute;
        top: 0;
        left: 0;
        .dropdown_icon {
          color: $--text-color-40;
          font-size: 14px;
        }
      }
      &.recursion_cont_none_children {
        border-right: none;
      }
    }
  }
  &.children {
    flex-grow: 1;
  }
}
</style>
