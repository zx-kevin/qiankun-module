<!--
 * @Author: yangxiong yangxiong@jeoho.com
 * @Date: 2023-02-02 15:21:04
 * @LastEditors: yangxiong yangxiong@jeoho.com
 * @LastEditTime: 2023-02-23 09:56:12
 * @FilePath: \decision_engine_ui\src\components\Drawer\index.vue
 * @Description: 抽屉组件
-->
<template>
  <div class="drawer-component">
    <el-drawer
      ref="drawer"
      v-model="drawerVisible"
      :title="props.title"
      :modal="props.modal"
      :direction="props.direction"
      :append-to-body="props.appendToBody"
      :close-on-click-modal="props.closeOnClickModal"
      :close-on-press-escape="props.closeOnPressEscape"
      :open-delay="props.openDelay"
      :close-delay="props.closeDelay"
      :destroy-on-close="props.destroyOnClose"
      :show-close="props.showClose"
      :size="props.size"
      :with-header="props.withHeader"
      :z-index="props.zIndex"
      :before-close="beforeDrawerClose"
      @open="open"
      @opened="opened"
      @close="close"
      @closed="closed"
    >
      <!-- :modal-class="props.modalClass"-->
      <template #header>
        <span class="el-drawer__title">
          <slot name="title">
            <span>{{ proxy.title }}</span>
          </slot>
        </span>
      </template>

      <el-scrollbar class="scrollbar" :style="scrollStyle" ref="scollbar">
        <slot />
      </el-scrollbar>

      <template #footer v-if="isSlotFooter">
        <!-- <div ref="footer" class="el-drawer__footer" v-if="isSlotFooter"> -->
        <slot name="footer"> </slot>
        <!-- </div> -->
      </template>
    </el-drawer>
  </div>
</template>
<script setup name="drawer">
const { proxy } = getCurrentInstance();
const emit = defineEmits(['open', 'opened', 'beforeClose', 'close', 'closed', 'update:visible']);
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },

  title: {
    type: String,
    default: '提示',
  },
  direction: {
    type: String,
    default: 'rtl',
  },
  appendToBody: {
    type: Boolean,
    default: false,
  },
  closeOnClickModal: {
    type: Boolean,
    default: false,
  },
  closeOnPressEscape: {
    type: Boolean,
    default: true,
  },
  openDelay: {
    type: Number,
    default: 0,
  },
  closeDelay: {
    type: Number,
    default: 0,
  },
  destroyOnClose: {
    type: Boolean,
    default: false,
  },
  modal: {
    type: Boolean,
    default: true,
  },
  showClose: {
    type: Boolean,
    default: true,
  },
  size: {
    type: [Number, String],
    default: '436px',
  },
  withHeader: {
    type: Boolean,
    default: true,
  },
  // modalClass: {
  //   type: String,
  //   default: '',
  // },
  zIndex: {
    type: Number,
    default: 99,
  },
});

const isSlotFooter = ref(undefined);
const scrollStyle = ref({});
// const drawerVisible = ref(false);

const drawerVisible = computed({
  set: (val) => {
    emit('update:visible', val); //在beforClose 中关闭?
  },
  get: () => {
    return props.visible;
  },
});

watch(
  () => drawerVisible,
  (val) => {
    if (val.value) {
      proxy.$nextTick(() => {
        isSlotFooter.value = proxy.$slots.footer;
        // setScrollStyle();
      });
    }
  },
  { immediate: true, deep: true },
);

async function beforeDrawerClose (done) {
  // emit('update:visible', drawerVisible.value);
  const res = await emit('beforeClose');
  if (!res) done();
}

// function beforeClose () {
//   emit('beforeClose');
// }

function handleClose () {
  proxy.$refs.drawer.handleClose();
}

function open () {
  emit('open');
}

function opened () {
  emit('opened');
}

function close () {
  emit('close');
}

function closed () {
  emit('closed');
}

// function getFooterHeight () {
//   let height = 62;
//   if (isSlotFooter.value) {
//     const footer = proxy.$refs.footer;
//     // const footer = proxy.$refs.drawer.$el.querySelector('.el-drawer__footer');
//     height = footer?.clientHeight;
//     console.log(footer, height, 'xx');
//   }

//   return height;
// }

// function setScrollStyle () {
//   // const height = getFooterHeight();
//   // scrollStyle.value = { height: `calc(100% - ${height}px)` };
// }
</script>
<style lang="scss" scoped>
// .drawer-component {
//   :deep(.el-drawer) {
//     :deep(.el-drawer__header) {
//       margin-bottom: 20px !important;
//     }
//   }
// }
:deep(.el-drawer__header) {
  margin-bottom: 20px !important;
}
.el-drawer__title {
  font-family: 'PingFang SC';
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 28px;
  color: #000000;
}
</style>
