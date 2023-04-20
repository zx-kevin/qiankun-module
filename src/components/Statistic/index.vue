<template>
  <div class="tic_box">
    <div v-if="$slots.header" class="tic_header">
      <slot name="header"></slot>
    </div>
    <div>
      <el-statistic
        :value="props.value"
        :precision="props.precision"
        :group-separator="props.groupSeparator"
        :decimal-separator="props.decimalSeparator"
      >
        <template #prefix>
          <slot name="prefix"></slot>
        </template>
        <template #suffix>
          <slot name="suffix"></slot>
        </template>
      </el-statistic>
    </div>
    <div v-if="$slots.footer" class="tic_footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
let props = defineProps({
  value: {
    type: Number,
    default: 0,
  },
  precision: {
    type: Number,
    default: 0,
  },
  groupSeparator: {
    default: ',',
  },
  decimalSeparator: {
    default: '.',
  },
});
</script>
<style>
.tic_box {
  --color: #2c303b;
}
</style>
<style scoped lang="scss">
:deep(.el-statistic__content) {
  display: flex;
  align-items: center;
  .el-statistic__prefix {
    display: flex;
    align-items: center;
  }
  .el-statistic__suffix {
    display: flex;
    align-items: center;
    margin-left: 16px;
  }
  --el-statistic-content-font-size: 26px;
  --el-statistic-content-font-weight: 500;
  --el-statistic-content-color: #2c303b;
}
.tic_header {
  font-size: 14px;
  color: #707889;
  margin-bottom: 5px;
}
.tic_footer {
  font-size: 14px;
  color: #707889;
}
</style>
