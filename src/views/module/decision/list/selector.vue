<template>
  <ElDialog v-model="visible" title="特征库选择" align-center>
    <ElRow justify="space-between">
      <el-checkbox
        v-model="checkAll"
        :indeterminate="isIndeterminate"
        @change="handleCheckAllChange"
        >全选</el-checkbox
      >

      <ElInput v-model="searchValue" placeholder="快速搜索" :style="{ width: '200px' }" />
    </ElRow>
    <ElScrollbar :style="{ marginTop: '20px', height: '300px' }">
      <el-checkbox-group v-model="checkedList">
        <ElRow class="list">
          <ElCol :span="6" v-for="(item, index) in optionsFormatter" :key="`option_${index}`">
            <ElCheckbox :label="item.featureCode" size="large">
              <div class="value" :title="item.featureName">
                {{ item.featureName }}
              </div>
            </ElCheckbox>
          </ElCol>
        </ElRow>
      </el-checkbox-group>
    </ElScrollbar>

    <ElRow justify="end" :style="{ marginTop: '20px' }">
      <ElButton size="large" @click="handleClose"> 取消 </ElButton>
      <ElButton size="large" type="primary" @click="handleConfirm"> 确定 </ElButton>
    </ElRow>
  </ElDialog>
</template>

<script setup>
import { computed } from 'vue';
import { ElCol, ElDialog, ElInput, ElRow, ElScrollbar } from 'element-plus';
import { reactive } from '@vue/reactivity';

const emit = defineEmits(['update:modelValue', 'confirm']);
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  options: {
    type: Array,
    default: () => [],
  },
});
let { modelValue, options } = toRefs(props);

const visible = computed({
  get() {
    return modelValue.value;
  },
  set(val) {
    emit('update:modelValue', val);
    searchValue.value = '';
    checkedList.value = [];
  },
});

const searchValue = ref('');
const optionsFormatter = computed(() => {
  return searchValue.value
    ? options.value.filter((item) => item.featureName.indexOf(searchValue.value) !== -1)
    : options.value;
});
const checkedList = ref([]);

watch(
  modelValue,
  (val) => {
    if (val)
      checkedList.value = optionsFormatter.value
        .filter((item) => item.checked)
        .map((item) => item.featureCode);
  },
  { immediate: true },
);

const checkAll = computed(() => {
  return checkedList.value.length === optionsFormatter.value.length;
});
const isIndeterminate = computed(() => {
  return checkedList.value.length > 0 && checkedList.value.length < optionsFormatter.value.length;
});

function handleCheckAllChange(val) {
  checkedList.value = val ? optionsFormatter.value.map((item) => item.featureCode) : [];
  isIndeterminate.value = false;
}

function handleConfirm() {
  emit(
    'confirm',
    optionsFormatter.value.filter((item) => checkedList.value.includes(item.featureCode)),
  );
}

function handleClose() {
  visible.value = false;
}
</script>

<style lang="scss" scoped>
.list .el-checkbox {
  width: 100%;

  :deep(.el-checkbox__label) {
    flex: 1;
    overflow: hidden;
    .value {
      width: 100%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}
</style>
