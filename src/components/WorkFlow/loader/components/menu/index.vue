<!--
 * @Author: K
 * @Date: 2023-03-09 17:35:24
 * @Descripttion: 决策流组件 - 节点菜单组件
 * @FilePath: \decision_engine_ui\src\components\WorkFlowNew\loader\components\menu\index.vue
 * @LastEditors: K
 * @LastEditTime: 2023-03-14 15:58:46
-->
<template>
  <el-dropdown class="workflow-componet-menu" :style="{ height: `${height}px` }">
    <svg-icon icon-class="caidan" />
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="(item, index) in options"
          :key="`option_${index}`"
          :disabled="item.disabled"
          @click.stop="onSelect(item)"
        >
          {{ item.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus';
import SvgIcon from '@/components/SvgIcon';

const emit = defineEmits(['select']);
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  options: {
    type: Array,
    default: () => [],
  },
});
const { visible, options } = toRefs(props);
const height = ref(0);

onMounted(() => {
  const { proxy } = getCurrentInstance();
  const dom = proxy.$el;
  const { parentNode } = dom;

  height.value = parentNode.clientHeight;
});

function onSelect(target) {
  emit('select', target);
}
</script>

<style lang="scss" scoped>
.workflow-componet-menu {
  background-color: #fff;
  width: 30px;
  height: 20px;
  max-height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 0px 10px -5px rgba(0, 0, 0, 0.5);
  z-index: 0;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
  flex-shrink: 0;

  .svg-icon {
    width: calc(100% - 12px);
    height: calc(100% - 5px);
    color: rgba(0, 0, 0, 0.6);
  }
}
</style>
