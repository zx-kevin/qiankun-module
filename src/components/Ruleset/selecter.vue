<!--
 * @Author: K
 * @Date: 2023-02-14 16:35:28
 * @Descripttion: 组件 - 规则集 - 选择
 * @FilePath: \decision_engine_ui\src\components\Ruleset\selecter.vue
 * @LastEditors: K
 * @LastEditTime: 2023-04-12 15:33:35
-->
<template>
  <div class="rule-set-component-select">
    <el-dropdown v-if="icon">
      <svg-icon icon-class="caidan" />
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="(item, index) in menu"
            :key="`menu_${index}`"
            @click="onSelect(item)"
          >
            <div class="dropdown-item">
              <svg-icon :icon-class="item.icon" />
              {{ item.label }}
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-select
      v-model="dataFormat"
      size="large"
      filterable
      default-first-option
      :allow-create="type === 'value'"
      placeholder="请选择"
      no-data-text="无数据"
    >
      <el-option
        v-for="(item, index) in map"
        :key="`option__${index}`"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </div>
</template>

<script setup>
import SvgIcon from '@/components/SvgIcon';
import { ElOption, ElDropdown, ElDropdownMenu, ElDropdownItem, ElSelect } from 'element-plus';

const emit = defineEmits(['addRule', 'addRelation', 'update:data']);
const props = defineProps({
  data: Object,
  map: Array,
  icon: Boolean,
  type: String,
  menu: Array,
});
const { data } = toRefs(props);
let dataFormat = computed({
  get() {
    return data.value?.value;
  },
  set(val) {
    data.value.value = val;
  },
});

const onSelect = (target) => {
  emit(target.type);
};
</script>

<style lang="scss" scoped>
.rule-set-component-select {
  border-radius: 5px;
  display: flex;
  align-items: center;
  // padding: 1px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #dcdfe6;

  .svg-icon {
    width: 35px;
    height: 35px;
    padding: 0 10px;
    background-color: #e6ece8;

    &:focus {
      outline: none;
    }
  }

  .el-select {
    flex: 1;
    width: 150px;

    :deep(.select-trigger) {
      .el-input {
        &.is-focus .el-input__inner {
          box-shadow: none !important;
        }
        .el-input__wrapper {
          border-radius: 0;
          box-shadow: none !important;

          .el-input__inner {
            box-shadow: none;
            height: 35px;
            line-height: 35px;

            &:focus {
              box-shadow: none !important;
            }
          }
        }
      }
    }
  }
}

.dropdown-item {
  color: #606266;

  .svg-icon {
    margin-right: 5px;
  }
}
</style>
