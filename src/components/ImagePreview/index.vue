<template>
  <el-image
    :src="`${realSrcList[0]}`"
    fit="cover"
    :style="`width:${realWidth};height:${realHeight};`"
    :preview-src-list="realSrcList"
    preview-teleported
  >
    <template #error>
      <div class="image-slot">
        <el-icon><picture-filled /></el-icon>
      </div>
    </template>
  </el-image>
</template>

<script setup>
import useUserStore from '@/store/modules/user.js';
import { isExternal } from '@/utils/validate';

const props = defineProps({
  src: {
    type: String,
    default: '',
  },
  width: {
    type: [Number, String],
    default: '',
  },
  height: {
    type: [Number, String],
    default: '',
  },
});

const userStore = useUserStore();

const suffixList = ['png', 'jpeg', 'bmp', 'jpg'];

const realSrcList = computed(() => {
  if (!props.src) {
    return [];
  }
  let real_src_list = props.src.split(',');
  let srcList = [];
  let omit = '';
  real_src_list.forEach((item) => {
    const imgtype = item.toLowerCase().split('.');
    const suffix = imgtype[imgtype.length - 1];
    if (suffixList.includes(suffix)) {
      item = omit + item;
      omit = '';
      if (isExternal(item)) {
        srcList.push(item);
      } else {
        srcList.push(userStore.fileBase + item);
      }
    } else {
      omit += item + ',';
    }
  });
  return srcList;
});

const realWidth = computed(() =>
  typeof props.width == 'string' ? props.width : `${props.width}px`,
);

const realHeight = computed(() =>
  typeof props.height == 'string' ? props.height : `${props.height}px`,
);
</script>

<style lang="scss" scoped>
.el-image {
  border-radius: 5px;
  :deep(.el-image__inner) {
    transition: all 0.3s;
    cursor: pointer;
    &:hover {
      transform: scale(1.1);
    }
  }
  :deep(.image-slot) {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    color: #909399;
    background: var(--el-fill-color-light);
    color: var(--el-text-color-secondary);
    font-size: 30px;
  }
}
</style>
