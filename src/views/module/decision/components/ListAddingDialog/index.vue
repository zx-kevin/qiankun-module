<!--
 * @Author: K
 * @Date: 2023-04-07 14:14:34
 * @Descripttion: 添加名单数据弹窗
 * @FilePath: \decision_engine_ui\src\views\module\decision\components\ListAddingDialog\index.vue
 * @LastEditors: K
 * @LastEditTime: 2023-04-17 09:13:22
-->
<template>
  <el-dialog title="添加名单数据" v-model="visible" width="600" align-center>
    <div class="list-adding-dialog" v-loading="loading">
      <div class="titles">
        <div
          v-for="(item, index) in fields"
          :key="`field_title_${index}`"
          class="item"
          :title="item.featureName"
        >
          {{ item.featureName }}
        </div>
      </div>

      <div class="values">
        <div v-for="(item, index) in fields" :key="`field_value_${index}`" class="item">
          <el-input
            v-model="form.value[item.featureCode]"
            :placeholder="`请输入${item.featureName}`"
            maxlength="50"
            show-word-limit
          ></el-input>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus';

import {
  getDecisionDetailApi, //  查询决策详细
  addListDataApi, //  新增名单库数据
} from '@/api/module/decision/ruleset';

const emit = defineEmits(['update:modelValue']);
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  decisionNo: {
    type: String,
    require: true,
  },
  decisionId: {
    type: String,
    require: true,
  },
});
const { modelValue, decisionNo, decisionId } = toRefs(props);

const loading = ref(false);
const fields = ref([]);
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

watch(
  visible,
  (val) => {
    if (val) {
      getDetail();
    } else {
      fields.value = [];
      form.value = {};
    }
  },
  { immediate: true },
);

async function getDetail() {
  if (!decisionNo.value) return;

  loading.value = true;
  const res = await getDecisionDetailApi(decisionNo.value)
    .catch(() => {})
    .finally(() => (loading.value = false));
  if (!res || res.code !== 200) return;

  fields.value = res.data.fieldsList.libFields;
}

async function handleConfirm() {
  loading.value = true;
  const res = await addListDataApi({ decisionId: decisionId.value, ...form.value })
    .catch(() => {})
    .finally(() => (loading.value = false));
  if (!res || res.code !== 200) return;

  ElMessage.success('操作成功');
  visible.value = false;
}
</script>

<style lang="scss" scoped>
.list-adding-dialog {
  display: flex;

  .titles {
    max-width: 100px;
    .item {
      line-height: 32px;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: keep-all;

      &:not(:last-of-type) {
        margin-bottom: 10px;
      }
    }
  }

  .values {
    flex: 1;
    margin-left: 10px;

    .item {
      &:not(:last-of-type) {
        margin-bottom: 10px;
      }
    }
  }
}
</style>
