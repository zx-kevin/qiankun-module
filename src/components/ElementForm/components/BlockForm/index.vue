<script setup>
const props = defineProps({
  model: {
    type: Object,
    default: () => ({}),
  },
  rules: {
    type: Object,
    default: {},
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String,
    default: 'large',
  },
});

const ruleFormRef = ref();

// 表单校验方法
const validate = (fn) => {
  return ruleFormRef.value?.validate((valid, fields) => {
    fn(valid, fields);
    if (!valid) {
      Object.keys(fields).forEach((key, i) => {
        const propName = fields[key][0].field;
        if (i == 0) {
          ruleFormRef.value?.scrollToField(propName);
        }
      });
    }
  });
};

// 验证具体的某个字段
const validateField = (params, fn) => {
  return ruleFormRef.value?.validateField(params, (valid, fields) => {
    fn && fn(valid, fields);
  });
};

// 表单重置方法
const resetForm = () => {
  ruleFormRef.value?.resetFields();
};

defineExpose({
  validate,
  validateField,
  resetForm,
});
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="model"
    :rules="rules"
    :disabled="disabled"
    label-position="top"
    :size="size"
  >
    <slot />
  </el-form>
</template>
