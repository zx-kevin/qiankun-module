<script setup>
import BlockItem from '../BlockItem';
import Row from '../Row';
import { validEmail } from '@/utils/validate.js';

const props = defineProps({
  model: {
    type: Object,
    default: () => ({}),
  },
  config: {
    require: true,
    type: Array,
    default: () => [],
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
  autoRules: {
    type: Boolean,
    default: false,
  },
});

const typeRules = {
  mail: {
    validator: (rule, value, callback) => {
      if (validEmail(value)) {
        callback();
      } else {
        callback(new Error('请输入正确的邮箱'));
      }
    },
  },
};

function getRules (item) {
  if (props.autoRules) {
    // item.type;
    return [{ required: true, message: `${item.label}不能为空`, trigger: 'blur' }];
  }
  if (item.rules) {
    return false;
  }
}
</script>

<template>
  <Row :config="config" :data="model" :gutter="gutter" :colOptions="colOptions">
    <template #default="{ item }">
      <el-form-item :label="item.label" :prop="item.prop">
        <BlockItem :item="item" :model="model" />
      </el-form-item>
    </template>
    <template #other>
      <slot />
    </template>
  </Row>
</template>
