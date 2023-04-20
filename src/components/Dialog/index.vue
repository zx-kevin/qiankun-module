<template>
  <!-- dialog 弹窗组件 -->
  <div class="dialog-components">
    <el-dialog
      class="dialog-module"
      v-model="visible"
      :title="props.title"
      :width="width"
      :before-close="beforeClose"
      :modal="props.modal"
      :draggable="props.draggable"
      :align-center="props.alignCenter"
      :append-to-body="props.appendToBody"
      :close-on-click-modal="props.closeOnClickModal"
      :close-on-press-escape="props.closeOnPressEscape"
      :show-close="props.showClose"
      :center="props.center"
      :destroy-on-close="props.destroyOnClose"
      @open="props.open"
      @opened="props.opened"
      @close="close"
      @closed="props.closed"
    >
      <template #header>
        <slot name="title"></slot>
      </template>
      <!-- <el-scrollbar> -->
      <slot name="content">
        <span>您确定继续执行此操作吗?</span>
      </slot>
      <!-- </el-scrollbar> -->
      <!-- 默认展示 footer 如不需要 hasFooter传false -->
      <template #footer>
        <slot name="footer" v-if="props.hasFooter">
          <div class="dialog-footer" v-if="!isSoltFooter">
            <el-button @click="cancel" :disabled="props.loading">{{ props.cancelTip }}</el-button>
            <el-button type="primary" @click="confirm" :loading="props.loading">
              {{ props.confirmTip }}
            </el-button>
          </div>
        </slot>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
const { proxy } = getCurrentInstance();

const emit = defineEmits(['update:visible', 'cancel', 'confirm', 'beforeClose', 'close']);
const props = defineProps({
  title: {
    type: String,
    default: '提示',
  },
  cancelTip: {
    type: String,
    default: '取消',
  },
  confirmTip: {
    type: String,
    default: '确认',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  visible: {
    type: Boolean,
    default: false,
  },
  width: {
    type: [String, Number],
    default: '416px',
  },
  alignCenter: {
    type: Boolean,
    default: true,
  },
  draggable: {
    type: Boolean,
    default: false,
  },
  modal: {
    type: Boolean,
    default: true,
  },
  appendToBody: {
    type: Boolean,
    default: false,
  },

  closeOnClickModal: {
    type: Boolean,
    default: true,
  },
  closeOnPressEscape: {
    type: Boolean,
    default: true,
  },

  showClose: {
    type: Boolean,
    default: true,
  },

  center: {
    type: Boolean,
    default: false,
  },

  destroyOnClose: {
    type: Boolean,
    default: true,
  },
  hasFooter: {
    type: Boolean,
    default: true,
  },
  // props中的方法以参数传(:)过来 而不是以 事件(@)
  open: {
    type: Function,
    default: () => {},
  },
  opened: {
    type: Function,
    default: () => {},
  },
  closed: {
    type: Function,
    default: () => {},
  },
});

let visible = ref(false);
// // 是否使用了 content 插槽
// const isSoltContent = ref(false);
// 是否使用了 footer 插槽
const isSoltFooter = ref(false);
const width = ref('');
watch(
  () => props.visible,
  (value) => {
    visible.value = value;
    // isSoltContent.value = proxy.$slots.content;
    isSoltFooter.value = proxy.$slots.footer;
  },
  {
    immediate: true,
    deep: true,
  },
);

watch(
  () => props.width,
  (value) => {
    let tmpWidth = '';
    switch (value) {
      case 'large':
        tmpWidth = '1020px';
        break;
      case 'default':
        tmpWidth = '612px';
        break;
      case 'small':
        break;
        tmpWidth = '416px';
      default:
        tmpWidth = value;
        break;
    }
    width.value = tmpWidth;
  },
  {
    immediate: true,
    deep: true,
  },
);

function cancel () {
  emit('update:visible', false);
  emit('cancel');
}
function confirm () {
  emit('confirm');
}

async function beforeClose (done) {
  const res = await emit('beforeClose');
  if (!res) done();
}
function close () {
  emit('update:visible', false);
  emit('close');
}
</script>
<!-- scoped -->
<style lang="scss">
.dialog-components {
  :deep(.el-scrollbar) {
    height: calc(80%);

    .el-scrollbar__wrap {
      overflow-x: hidden;
      padding: 20px 0;
      box-sizing: border-box;
    }
  }
}

.dialog-module {
  max-height: 84%;
  border-radius: 8px;

  .el-dialog__body {
    padding: 0 20px;
    max-height: 66vh;

    overflow-y: auto;
    overflow-x: visible;
  }

  .el-dialog__header {
    .el-dialog__title {
      font-family: 'PingFang SC';
      font-style: normal;
      font-weight: 600;
      font-size: 16px;
      line-height: 28px;
      color: #000000;
    }
  }
  .el-dialog__footer {
    padding: 10px 24px 24px 24px;
  }
}
</style>
