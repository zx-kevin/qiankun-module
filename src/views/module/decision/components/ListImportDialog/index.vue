<template>
  <el-dialog title="导入名单库数据" v-model="visible" width="600" align-center>
    <div class="list-import-dialog">
      <upload-file
        ref="uploadRef"
        v-model="form.value.files"
        :limit="1"
        :data="{
          decisionId,
        }"
        accept=".xlsx"
        action="/decision/uploadListData"
        style="width: 560px"
        :onSuccess="handleSuccess"
      ></upload-file>
    </div>
  </el-dialog>
</template>

<script setup>
import UploadFile from '@/components/UploadFile';
import { ElMessage } from 'element-plus';

const emit = defineEmits(['update:modelValue']);
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  decisionId: {
    type: String,
    require: true,
  },
});
const { modelValue, decisionId } = toRefs(props);

const form = reactive({
  value: {},
});

const visible = computed({
  get() {
    return modelValue.value;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});

watch(visible, (val) => {
  if (val) form.value = {};
});

function handleSuccess() {
  ElMessage.success('导入成功');
  visible.value = false;
}
</script>

<style lang="scss" scoped></style>
