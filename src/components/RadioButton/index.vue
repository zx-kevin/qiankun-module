<!--
 * @Author: yangxiong yangxiong@jeoho.com
 * @Date: 2023-03-01 09:36:23
 * @LastEditors: yangxiong yangxiong@jeoho.com
 * @LastEditTime: 2023-03-02 17:17:31
 * @FilePath: \decision_engine_ui\src\views\module\tool\element\form\radio\index.vue
 * @Description: 单选按钮
-->
<template>
  <div class="other-radio">
    <el-radio-group v-model="radioData">
      <el-radio-button
        v-for="(item, index) in radioList"
        :label="item.value"
        @mouseenter="mouseenter(index)"
        @mouseleave="mouseleave()"
      >
        <div class="radio-content">
          <span>{{ item.label }}</span>
          <div class="check">
            <svg-icon
              v-if="radioData == item.value"
              :icon-class="'gou'"
              style="color: #fff"
            ></svg-icon>
            <svg-icon
              v-else-if="isHover[index]"
              :icon-class="'gou'"
              style="color: #2659f6"
            ></svg-icon>
          </div>
        </div>
      </el-radio-button>
    </el-radio-group>
  </div>
</template>
<script setup name="RadioButton">
const isHover = ref({}); //是否hover的元素
const emit = defineEmits(['update:modelValue']);
const props = defineProps({
  radioList: {
    type: Array,
    default: [],
  },
  modelValue: {
    type: String,
    default: '',
  },
});

const radioData = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val);
  },
});

onMounted(() => {
  props.radioList.forEach((item, index) => {
    isHover.value[index] = false;
  });
});

function mouseenter (index) {
  isHover.value[index] = true;
}

function mouseleave () {
  for (const key in isHover.value) {
    isHover.value[key] = false;
  }
}
</script>
<style lang="scss" scoped>
// 其他单选样式
.other-radio {
  :deep(.el-radio-button) {
    .el-radio-button__inner {
      margin-left: 0;
      border-radius: 4px !important;
      border: 1px solid $--border-color-default;
    }
  }
  .el-radio-button:not(:first-child) {
    margin-left: 15px;
  }
  .content {
    position: relative;
  }
  .check {
    width: 12px;
    height: 12px;
    position: absolute;
    bottom: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-top: 1px solid $--border-color-default;
    border-left: 1px solid $--border-color-default;
    .svg-icon {
      width: 9px;
      height: 12px;
    }
  }

  :deep(.el-radio-button__inner:hover) {
    border: 1px solid $--primary-blue-default;

    .check {
      border-top: 1px solid $--primary-blue-default;
      border-left: 1px solid $--primary-blue-default;
    }
  }
  //   .el-radio-button__original-radio:checked + .el-radio-button__inner {
  //   }
}
:deep(.el-radio-button.is-active) {
  .el-radio-button__inner {
    color: $--primary-blue-default;
    background-color: #fff;
    box-shadow: none;
    border: 1px solid $--primary-blue-default;
  }
  .check {
    background-color: $--primary-blue-default;
    border-top: 1px solid $--primary-blue-default;
    border-left: 1px solid $--primary-blue-default;
  }
}
</style>
