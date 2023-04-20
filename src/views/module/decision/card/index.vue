<!--
 * @Author: K
 * @Date: 2023-03-14 14:33:40
 * @Descripttion: 决策管理 - 评分卡
 * @FilePath: \decision_engine_ui\src\views\module\decision\card\index.vue
 * @LastEditors: K
 * @LastEditTime: 2023-03-14 14:42:35
-->

<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">添加</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <WebTable
      v-model:page-num="queryParams.pageNum"
      v-model:page-size="queryParams.pageSize"
      :pagination="getList"
      :total="total"
      :table-data="tableData"
      :table-col="tableCol"
      :table-opt="tableOpt"
      :has-index="true"
      :first-columnFixed="true"
      :loading="loading"
      cellMaxWidth="350"
      name="DecisionCard"
    />

    <decision-testing ref="testingRef"></decision-testing>
  </div>
</template>

<script setup>
import WebTable from '@/components/WebTable';
import DecisionTesting from '../components/DecisionTesting';

import {
  getDecisionPageApi, // 查询决策分页
  deleteDecisionApi, //  删除决策
} from '@/api/module/decision/ruleset';

const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict('sys_normal_disable');

const router = useRouter();

const testingRef = ref();
const showSearch = ref(false);

const loading = ref(false);

const table = reactive({
  tableData: [],
  tableCol: [
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
      dict: sys_normal_disable,
    },
    {
      label: '决策版本',
      prop: 'versionNo',
    },
  ],
  tableOpt: {
    label: '操作',
    list: [
      { title: '调试', show: () => true, methods: handleTest },
      { title: '编辑', show: () => true, methods: handleUpdate },
      { title: '删除', show: () => true, methods: handleDelete },
    ],
  },
});
const { tableData, tableCol, tableOpt } = toRefs(table);

const total = ref(0);
const data = reactive({
  queryParams: {
    decisionType: 'score',
    pageNum: 1,
    pageSize: localStorage.getItem('DecisionCardPageSize')
      ? Number(localStorage.getItem('DecisionCardPageSize'))
      : 10,
  },
});
const { queryParams } = toRefs(data);

// 获取列表
function getList() {
  loading.value = true;
  getDecisionPageApi(queryParams.value)
    .then((res) => {
      if (res.code == 200) {
        tableData.value = res.rows;
        total.value = res.total;
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

function handleAdd() {
  router.push('/decision/card/create');
}

function handleUpdate({ decisionNo }) {
  router.push(`/decision/card/${decisionNo}/update`);
}

// 删除
function handleDelete({ decisionNo }) {
  proxy.$confirm(`您确定删除吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    beforeClose: (action, ctx, close) => {
      if (action !== 'confirm') {
        !ctx.confirmButtonLoading && close();
        return;
      }
      ctx.confirmButtonLoading = true;
      deleteDecisionApi(decisionNo)
        .then((res) => {
          if (res.code == 200) {
            proxy.$message({
              message: res.msg,
              type: 'success',
            });
            close();
            getList();
          }
        })
        .finally(() => {
          ctx.confirmButtonLoading = false;
        });
    },
  });
}

function handleTest({ decisionNo }) {
  testingRef.value.open({
    decisionNo,
  });
}

getList();
</script>

<style lang="scss" scoped>
.decision-card {
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
