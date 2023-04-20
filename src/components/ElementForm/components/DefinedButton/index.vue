<template>
  <div class="button-container">
    <div class="header">
      <div class="label">{{ label }}</div>
      <div class="index">{{ index + 1 }}</div>
    </div>
    <div class="opt">
      <div v-if="isClear" class="clear" @click="handleClear(index)">
        <el-icon><Refresh /></el-icon>
        <span>一键清扫</span>
      </div>
      <template v-if="isDelete">
        <el-divider direction="vertical" />
        <div class="delete" @click="handleDelete(index)">
          <el-icon><Delete /></el-icon>
          <span>删除</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  label: {
    type: String,
  },
  index: {
    type: Number,
  },
  isClear: {
    type: Boolean,
    default: true,
  },
  isDelete: {
    type: Boolean,
    default: true,
  },
});
const emit = defineEmits(['clear', 'delete']);

function handleClear (index) {
  emit('clear', index);
}
function handleDelete (index) {
  emit('delete', index);
}
</script>

<style lang="scss" scoped>
.button-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  .header {
    display: flex;
    align-items: center;
    .label {
      margin-right: 6px;
    }
    .index {
      height: 20px;
      line-height: 20px;
      background-color: $--primary-blue-default;
      font-size: 12px;
      color: #fff;
      border-radius: 3px;
      text-align: center;
      padding: 0 6px;
    }
  }

  .opt {
    display: flex;
    align-items: center;
    .clear,
    .delete {
      display: flex;
      color: #677999;
      display: flex;
      align-items: center;
      cursor: pointer;
      > .el-icon {
        width: 20px;
        height: 20px;
        margin-right: 5px;
      }

      > span {
        color: #677999;
        font-size: 14px;
      }
    }
  }
}
</style>
