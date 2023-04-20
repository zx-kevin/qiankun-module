<!--
 * @Author: K
 * @Date: 2023-04-07 11:11:10
 * @Descripttion: 名单库数据弹窗
 * @FilePath: \decision_engine_ui\src\views\module\decision\components\ListDialog\index.vue
 * @LastEditors: K
 * @LastEditTime: 2023-04-18 09:03:41
-->
<template>
  <el-dialog title="名单库数据" v-model="visible" width="1000" align-center>
    <div class="list-dialog">
      <el-row justify="end" style="margin-bottom: 20px">
        <el-button :disabled="!selectionList.length" @click="handleDel">删除</el-button>
      </el-row>
      <el-table
        :data="tableData"
        style="width: 100%"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <template v-slot:empty>
          <el-empty description="暂无数据" :image-size="240" />
        </template>

        <el-table-column type="selection" width="55" />

        <el-table-column
          v-for="(item, index) in tableCol"
          :key="`table_col_${index}`"
          :label="item.featureName"
          :prop="item.featureCode"
          show-overflow-tooltip
        >
        </el-table-column>
        <el-table-column label="创建时间" prop="create_time"> </el-table-column>
      </el-table>

      <pagination
        ref="paginationRef"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        :autoScroll="false"
        :disabled="loading"
        @pagination="getTableData"
      />
    </div>
  </el-dialog>
</template>

<script setup>
import WebTable from '@/components/WebTable';
import { ElMessage, ElMessageBox } from 'element-plus';

import {
  queryListDataApi, //  查询名单库数据列表
  deleteListDataApi, //  删除名单库数据
} from '@/api/module/decision/ruleset';

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

const loading = ref(false);
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
});
const total = ref(0);
const tableData = ref([]);
const tableCol = ref([]);
const selectionList = ref([]);

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
      getTableData();
    } else {
      tableData.value = [];
      tableCol.value = [];
      total.value = 0;
    }
  },
  { immediate: true },
);

async function getTableData() {
  if (!decisionId.value) return;

  loading.value = true;
  const res = await queryListDataApi({ ...queryParams, decisionId: decisionId.value })
    .catch(() => {})
    .finally(() => (loading.value = false));
  if (!res || res.code !== 200) return;

  tableCol.value = res.data.libFields;
  tableData.value = res.data.list;
  total.value = Number(res.data.total);
}

function handleSelectionChange(val) {
  selectionList.value = val;
}

async function handleDel() {
  const confirm = await ElMessageBox.confirm('您确定删除吗？', '提示', {
    confirmButtonText: '确定',
    showCancelButton: true,
    cancelButtonText: '取消',
  }).catch(() => {});
  if (!confirm) return;

  loading.value = true;
  const res = await deleteListDataApi({
    decisionId: decisionId.value,
    ids: selectionList.value.map((item) => item.id),
  })
    .catch(() => {})
    .finally(() => (loading.value = false));
  if (!res || res.code !== 200) return;

  ElMessage.success('操作成功');
  selectionList.value = [];
  tableData.value = [];
  total.value = 0;
  getTableData();
}
</script>

<style lang="scss" scoped>
.list-dialog {
  height: 60vh;
  display: flex;
  flex-direction: column;

  .el-table {
    flex: 1;

    :deep(.el-table__row .cell) {
      word-break: keep-all;
    }
  }
}
</style>
