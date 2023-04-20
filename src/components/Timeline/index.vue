<!--
 * @Author: 杰 xuyongfeng@jeoho.com
 * @Date: 2023-02-13 10:47:28
 * @LastEditors: 杰 xuyongfeng@jeoho.com
 * @LastEditTime: 2023-02-13 16:37:44
 * @FilePath: \decision_engine_ui\src\components\Timeline\index.vue
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
-->
<template>
  <div class="">
    <el-timeline>
      <el-timeline-item
        :class="{ noBoder: item.icon ? true : false }"
        v-for="(item, index) in activities"
        :key="index"
        :timestamp="item.timestamp"
        :center="item.center"
        :icon="item.icon || options.icon"
        :type="item.type || options.type"
        :color="item.color || options.color"
        :size="item.size || options.size"
        :placement="item.placement || options.placement"
        :hollow="item.hollow"
      >
        {{ item.content }}
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script lang="ts" setup>
import type { Component, PropType } from 'vue';
import { MoreFilled } from '@element-plus/icons-vue';
interface opt {
  //定义接口
  /**
   * 时间戳
   * @description:  2023/2/13
   * @return {*}
   */
  timestamp?: string;
  /**
   * 是否隐藏时间戳
   * @description:
   * @return {*}
   */
  hideTimestamp?: Boolean;
  /**
   * 是否垂直居中
   * @description:
   * @return {*}
   */
  center?: Boolean;
  /**
   * 时间戳位置
   * @description: top/bottom
   * @return {*}
   */
  placement?: string;
  /**
   * 节点类型
   * @description: primary / success / warning / danger / info
   * @return {*}
   */
  type?: string;
  /**
   * 节点颜色
   * @description:  hsl / hsv / hex / rgb
   * @return {*}
   */
  color?: string;
  /**
   * 节点尺寸
   * @description: normal / large
   * @return {*}
   */
  size?: string;
  /**
   * 自定义图标
   * @description:
   * @return {*}
   */
  icon?: string | Component;
  /**
   * 是否空心点
   * @description:
   * @return {*}
   */
  hollow?: Boolean;
}

let props = defineProps({
  data: {
    type: Array as any,
    default: [
      {
        content: '活动按期开始',
        timestamp: '2018-04-15',
        icon: MoreFilled,
      },
      {
        content: '通过审核',
        timestamp: '2018-04-13',
      },
      {
        content: '创建成功',
        timestamp: '2018-04-11',
      },
    ],
  },
  options: {
    type: Object as PropType<opt>,
    default: {},
  },
});
const optionsData: opt = {
  timestamp: '2018-04-12',
  hideTimestamp: false,
  center: false,
  placement: 'bottom',
  type: 'primary',
  color: 'rgb',
  size: 'large',
  icon: 'el-icon-more',
  hollow: true,
};
const activities = computed(() => {
  return props.data || [];
});

const options = computed(() => {
  return Object.assign({}, ...[optionsData], ...[props.options]);
});
</script>

<style scoped lang="scss">
// .noBoder
:deep(.el-timeline-item__node--normal) {
  width: 15px;
  height: 15px;
  font-size: 15px;
}
:deep(.el-timeline-item__node--large) {
  width: 15px;
  height: 15px;
  font-size: 15px;
}
</style>
