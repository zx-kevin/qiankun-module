<!--
 * @Author: K
 * @Date: 2023-02-27 11:53:18
 * @Descripttion:  规则树 页面
 * @FilePath: \decision_engine_ui\src\views\module\decision\tree\index.vue
 * @LastEditors: K
 * @LastEditTime: 2023-03-17 16:31:05
-->

<template>
  <div class="decision-tree" v-loading="pageLoading">
    <el-row class="header" :gutter="10" justify="end">
      <el-button type="primary" :icon="Plus" size="large" @click="handleAdd">添加</el-button>
    </el-row>
    <WebTable
      v-model:page-num="queryParams.pageNum"
      v-model:page-size="queryParams.pageSize"
      :pagination="getData"
      :total="total"
      :table-data="tableData"
      :table-col="tableCol"
      :table-opt="tableOpt"
      :has-index="true"
      :first-columnFixed="true"
      cellMaxWidth="350"
      v-loading="loading"
    />

    <decision-testing ref="testingRef"></decision-testing>
  </div>
</template>

<script setup>
import { Plus } from '@element-plus/icons-vue';
import WebTable from '@/components/WebTable';
import { ElMessageBox, ElMessage } from 'element-plus';
import DecisionTesting from '../components/DecisionTesting';

import {
  getDecisionPageApi, // 查询决策分页
  deleteDecisionApi, //  删除决策
} from '@/api/module/decision/ruleset';

const router = useRouter();

const testingRef = ref();
const pageLoading = ref(false);
const loading = ref(false);
const tableData = ref([]);
const tableCol = [
  {
    label: '决策名称',
    prop: 'decisionName',
  },
  {
    label: '备注说明',
    prop: 'decisionRemark',
  },
  {
    label: '决策状态',
    prop: 'decisionStatus',
  },
  {
    label: '决策版本',
    prop: 'versionNo',
  },
];
const tableOpt = {
  label: '操作',
  list: [
    { title: '调试', show: () => true, methods: handleTest },
    { title: '编辑', show: () => true, methods: handleUpdate },
    { title: '删除', show: () => true, methods: handleDelete },
  ],
};
const total = ref(0);
const queryParams = reactive({
  decisionType: 'tree',
  pageNum: 1,
  pageSize: 10,
});

async function getData() {
  loading.value = true;

  const res = await getDecisionPageApi(queryParams).catch(() => {});
  loading.value = false;
  if (!res) return;

  const { code, rows, total: resTotal } = res;
  if (code !== 200) return;
  tableData.value = rows;
  total.value = resTotal;
}

const detailVisible = ref(false);
const detailData = reactive({
  value: {},
});

function handleAdd() {
  router.push('/decision/tree/create');
}

function handleUpdate({ decisionNo }) {
  router.push(`/decision/tree/${decisionNo}/update`);
}

function handleDelete({ decisionNo }) {
  ElMessageBox.confirm('确定删除该决策？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    pageLoading.value = true;
    const res = await deleteDecisionApi(decisionNo)
      .catch(() => {})
      .finally(() => (pageLoading.value = false));
    if (!res || res.code !== 200) return;

    ElMessage.success('操作成功');
    getData();
  });
}

function handleTest({ decisionNo }) {
  testingRef.value.open({
    decisionNo,
  });
}

onMounted(() => {
  getData();
});
</script>

<style lang="scss" scoped>
.decision-tree {
  padding: 20px;

  .header {
    margin-bottom: 20px;
    width: 100%;

    .el-button {
      margin-left: 20px;
    }
  }
}
</style>
