<!--
 * @Author: 杰 xuyongfeng@jeoho.com
 * @Date: 2023-02-07 18:12:24
 * @LastEditors: 杰 xuyongfeng@jeoho.com
 * @LastEditTime: 2023-02-17 14:07:31
 * @FilePath: \decision_engine_ui\src\components\DuoJuHe\Chat\chat\messaege\ImageMessage.vue
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
-->
<template>
  <div class="image-message no-select">
    <el-image
      fit="cover"
      :src="base_url + src"
      :lazy="true"
      :style="getImgStyle(base_url + src)"
      :preview-src-list="[base_url + src]"
    >
      <template v-if="!src">
        <div class="image-slot">图片加载失败...</div>
      </template>
      <template #error>
        <div class="image-slot">图片加载失败...</div>
      </template>
      <template #placeholder>
        <div class="image-slot">图片加载中...</div>
      </template>
    </el-image>
  </div>
</template>
<script>
import { imgZoom } from '@/utils/functions';
import useUserStore from '@/store/modules/user.js';
export default {
  name: 'ImageMessage',
  props: {
    src: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      base_url: useUserStore().fileBase,
    };
  },
  mounted() {},
  methods: {
    getImgStyle(url) {
      // console.log('url', url);
      return {
        width: url ? `auto` : '150px',
        height: url ? `100px` : '60px',
      };
      // return imgZoom(url, 200);
    },
  },
};
</script>
<style lang="scss" scoped>
.image-message {
  :deep(.el-image) {
    min-width: 100px;
    border-radius: 5px;
    cursor: pointer;
    background: #f1efef;

    .image-slot {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      font-size: 13px;
      color: #908686;
      background: #efeaea;
    }
  }
}
</style>
