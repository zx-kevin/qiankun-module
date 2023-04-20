<template>
  <el-card
    :shadow="shadow"
    :body-style="{ padding: padding }"
    :style="{ marginBottom: marginBottom }"
  >
    <template v-if="title" #header>
      <div class="card-header">
        <span class="title">{{ title }}</span>
        <el-button link type="primary" @click="handleClick">{{ btnText }}</el-button>
      </div>
    </template>
    <slot />
  </el-card>
</template>

<script setup name="Card">
const emit = defineEmits(['handle']);
const props = defineProps({
  title: {
    type: [String, Number],
    default: '',
  },
  btnText: {
    type: [String, Number],
    default: '',
  },
  // handleClick: {
  //   type: Function,
  //   default: () => ({}),
  // },
  padding: {
    type: String,
    default: '0 24px',
  },
  marginBottom: {
    type: String,
    default: '16px',
  },
  shadow: {
    type: String,
    default: 'hover',
  },
});
function handleClick() {
  emit('handle');
}
</script>

<style lang="scss" scoped>
.el-card {
  border: 1px solid $--border-color-shallow;
  border-radius: 2px;
  :deep(.el-card__header) {
    padding: 16px 24px;
    border-bottom: none;
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .title {
      font-size: 16px;
      font-weight: 500;
      color: $--text-color-20;
    }
  }
}
</style>
