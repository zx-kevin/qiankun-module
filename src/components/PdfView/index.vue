<template>
  <div class="pdf-view">
    <!-- 左侧缩略图 -->
    <div class="left">
      <el-scrollbar>
        <slot name="left">
          <slot name="title">
            <div class="pdf-name">
              <tooltip-text refName="pdf-name" :content="title" />
            </div>
          </slot>
          <div class="pdf-thumbnail">
            <div
              class="item"
              :class="{ active: activeIndex == index }"
              v-for="(page, index) in numPages"
              :key="page"
              @click="toPdf(index)"
            >
              <vue-pdf-embed :source="source" :page="page" />
            </div>
          </div>
        </slot>
      </el-scrollbar>
    </div>
    <div class="main" ref="mainRef">
      <el-scrollbar ref="mainScrollbar" @scroll="scroll">
        <div class="pdf-main" ref="pdfMain">
          <div
            class="item"
            v-for="(page, index) in numPages"
            :key="page"
            :style="{ width: pdfWidth + 'px' }"
          >
            <vue-pdf-embed :source="source" :page="page" @rendered="setPdfLoaction" />
          </div>
        </div>
      </el-scrollbar>
    </div>
    <div v-if="slots.right" class="right">
      <el-scrollbar ref="optScrollbar">
        <slot name="right" />
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup>
import useUserStore from '@/store/modules/user.js';
import VuePdfEmbed from 'vue-pdf-embed';
import { createLoadingTask } from 'vue3-pdfjs/esm'; // 获得总页数

const props = defineProps({
  title: {
    type: [String, Number],
    default: '',
  },
  src: {
    type: String,
    default: '',
  },
  read: {
    type: Boolean,
  },
});

const slots = useSlots();

const emit = defineEmits(['update:read']);

const userStore = useUserStore();

const mainRef = ref();
const mainScrollbar = ref();
const pdfMain = ref();

const source = computed(() => {
  return userStore.fileBase + props.src;
});

const data = reactive({
  numPages: 0, // 总页数
  activeIndex: 0,
  loading: false,
  pdfDefaultWidth: 0, // pdf真实宽度
  pdfLoaction: [],
  zoom: 120,
});
const { numPages, activeIndex, loading, pdfDefaultWidth, pdfLoaction, zoom } = toRefs(data);

const pdfWidth = computed(() => {
  return pdfDefaultWidth.value * (zoom.value / 100) + 80;
});
const isRead = computed({
  get () {
    return props.read;
  },
  set (val) {
    emit('update:read', val);
  },
});

watch(
  () => props.src,
  (newValue, oldValue) => {
    if (newValue) {
      getFile(userStore.fileBase + newValue);
    }
  },
  {
    immediate: true,
  },
);

watch(
  () => zoom.value,
  (newValue, oldValue) => {
    nextTick(() => {
      setPdfLoaction();
    });
  },
);

// 获取pdf文件并展示
function getFile (pdf) {
  loading.value = true;
  const loadingTask = createLoadingTask(pdf);
  loadingTask.promise
    .then((pdf) => {
      numPages.value = pdf.numPages;
      return pdf.getPage(1);
    })
    .then((page) => {
      let viewport = page.getViewport({ scale: 1 });
      pdfDefaultWidth.value = viewport.width; // 获取pdf原宽度（像素）
    })
    .catch((err) => {
      if (err.name == 'MissingPDFException') {
        loading.value = false;
        // this.$emit('status', false);
      }
    });
}

// 监听pdf滚动条
function scroll ({ scrollTop }) {
  setActive(scrollTop);
  setRead(scrollTop);
}
// 设置每个pdf的位置方便滚动条计算
function setPdfLoaction () {
  const pdf = pdfMain.value;
  if (!pdf) return;
  const pdfItem = Array.from(pdf.children); // 转化HTMLCollection对象
  pdfItem.forEach((item, index) => {
    const top = item.offsetTop;
    const bottom = top + item.scrollHeight;
    pdfLoaction.value[index] = { top, bottom };
  });
  setRead(0);
}
// 跳转滚动条到指定的pdf
function toPdf (index) {
  if (loading.value) return;
  mainScrollbar.value.setScrollTop(pdfLoaction.value[index].top);
}
// 设置当前浏览的pdf状态
function setActive (scrollTop) {
  pdfLoaction.value.forEach((item, index) => {
    if (scrollTop >= item.top && scrollTop <= item.bottom) {
      activeIndex.value = index;
    }
  });
}
// 根据阅读状态
function setRead (scrollTop) {
  // 合同拉动到底部时设置为已阅状态
  const el = pdfMain.value;
  const scrollBottom = el.clientHeight + 8;
  const mainHeight = mainRef.value.clientHeight;
  if (mainHeight + scrollTop >= scrollBottom) {
    // 滚动条拉到底部
    isRead.value = true;
    console.log(`lin->到底`);
  }
}

onMounted(() => {
  // ctrl + 滚轮缩放pdf
  window.addEventListener(
    'mousewheel',
    (e) => {
      if (e.ctrlKey === true || e.metaKey) {
        if (e.deltaY > 0) {
          // down
          if (zoom.value > 50) zoom.value -= 5;
        } else {
          // up
          if (zoom.value < 200) zoom.value += 5;
        }
        e.preventDefault();
      }
    },
    { passive: false },
  );
});
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.module.scss';

.pdf-view {
  width: 100%;
  height: calc(100vh - 144px);
  display: flex;
  align-items: stretch;
  .left,
  .right {
    width: 300px;
    height: 100%;
    background-color: #fff;
    box-shadow: 0px 2px 10px 0px rgba(31, 39, 70, 0.1);
    position: relative;
    z-index: 2;
    flex-shrink: 0;
    .el-scrollbar {
      width: 100%;
      height: 100%;
      :deep(.el-scrollbar__wrap) {
        padding: 25px;
        overflow-x: hidden;
        overflow-y: scroll;
      }
    }

    .pdf-name {
      height: 40px;
      line-height: 40px;
      font-weight: bold;
      font-size: 14px;
      color: $--color-primary;
      background-color: #ebf4ff;
      text-align: center;
      padding: 0 16px;
    }

    .pdf-thumbnail {
      .item {
        border: 1px solid #eff1f5;
        border-radius: 8px;
        margin-top: 20px;
        cursor: pointer;

        &.active {
          border-color: $--color-primary;
          overflow: hidden;
        }

        :deep(canvas) {
          border-radius: 8px;
        }
      }
    }
  }
  .main {
    width: calc(100% - 300px);
    height: 100%;
    min-height: 100px;
    position: relative;
    z-index: 1;
    &.hasRight {
      width: calc(100% - 540px);
    }
    .el-scrollbar {
      width: 100%;
      height: 100%;
      :deep(.el-scrollbar__wrap) {
        height: calc(100% + 17px);
        .el-scrollbar__view {
          padding: 20px 0 5px;
        }
      }
    }

    .pdf-main {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-wrap: wrap;
      .item {
        // display: block;
        // display: inline-block;
        margin: 0 auto 20px;
        position: relative;
        z-index: 1;

        :deep(canvas) {
          width: 100% !important;
          height: 100% !important;
        }
      }
      .png-item {
        text-align: center;
        position: relative;
      }
    }
  }
}
</style>
