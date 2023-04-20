<script setup>
const props = defineProps({
  config: {
    require: true,
    type: Array,
    default: () => [],
  },
  data: {
    type: Object,
    default: () => ({}),
  },
  gutter: {
    type: Number,
    default: 20,
  },
  colOptions: {
    type: Object,
    default: () => ({
      xs: 24,
      sm: 12,
      md: 8,
      lg: 6,
      xl: 6,
    }),
  },
});
</script>

<template>
  <el-row :gutter="colOptions.span === 24 ? 0 : gutter">
    <template v-for="(item, index) in config">
      <el-col v-if="item.control ? item.control(data) : true" :key="index" v-bind="colOptions">
        <slot :item="item" :index="index" />
      </el-col>
    </template>
    <slot name="other" />
  </el-row>
</template>
