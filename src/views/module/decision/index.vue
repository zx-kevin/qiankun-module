<template>
  <div class="decision-page" v-loading="pageLoading">
    <div class="header">
      <el-row align="middle" justify="space-between">
        <el-select class="type-select" v-model="type" size="large">
          <el-option
            v-for="(item, index) in dictMap.value['decision_type_enum']"
            :key="`type_map_${index}`"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>

        <el-form
          class="search"
          ref="formRef"
          :model="search.value"
          label-width="80px"
          :inline="true"
        >
          <el-form-item label="决策名称">
            <el-input v-model="search.value.decisionName" placeholder="请输入决策名称"></el-input>
          </el-form-item>
          <el-form-item label="决策状态">
            <el-select
              v-model="search.value.decisionStatus"
              placeholder="请选择决策状态"
              style="width: 100%"
            >
              <el-option
                v-for="item in dictMap.value.sys_normal_disable"
                :key="`sys_normal_disable_${item.value}`"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-row>

      <el-row justify="space-between" align="middle" style="margin-top: 20px">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>

        <div class="btns">
          <el-button icon="Refresh" circle @click="handleRefresh"></el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        </div>
      </el-row>
    </div>

    <WebTable
      v-model:page-num="queryParams.pageNum"
      v-model:page-size="queryParams.pageSize"
      :pagination="handleRefresh"
      :total="total"
      :table-data="tableData"
      :table-col="tableCol"
      :table-opt="tableOpt"
      :has-index="true"
      :first-columnFixed="true"
      cellMaxWidth="350"
      v-loading="loading"
    />

    <decision-testing
      ref="testingRef"
      :noVersion="type == 'list'"
      :formatter="testingFormatter"
    ></decision-testing>

    <list-dialog v-model="listVisible" :decisionId="listDecisionId"></list-dialog>

    <list-adding-dialog
      v-model="listAddingVisible"
      :decisionId="listDecisionId"
      :decisionNo="listDecisionNo"
    ></list-adding-dialog>

    <list-import-dialog
      v-model="listImportVisible"
      :decisionId="listDecisionId"
    ></list-import-dialog>
  </div>
</template>

<script setup>
import WebTable from '@/components/WebTable';
import { ElMessageBox, ElMessage, ElSwitch } from 'element-plus';
import DecisionTesting from './components/DecisionTesting';
import { getDictSync } from '@/utils/dict';

import ListDialog from './components/ListDialog';
import ListAddingDialog from './components/ListAddingDialog';
import ListImportDialog from './components/ListImportDialog';

import {
  getDecisionPageApi, // 查询决策分页
  deleteDecisionApi, //  删除决策
  updateDecisionStatusApi, //  修改决策状态
} from '@/api/module/decision/ruleset';

const router = useRouter();
const { type: routerType } = router.currentRoute.value.query;
const { proxy } = getCurrentInstance();

const formRef = ref();
const search = reactive({
  value: {},
});

const type = ref('');
const testingRef = ref();
const pageLoading = ref(false);
const loading = ref(false);
const tableData = ref([]);
const tableCol = computed(() => [
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
    render: (row) => {
      const { decisionNo, decisionStatus } = row;
      return h(ElSwitch, {
        modelValue: decisionStatus == 0,
        onClick: async () => {
          loading.value = true;
          const res = await updateDecisionStatusApi({
            ids: [decisionNo],
            status: decisionStatus == 0 ? '1' : '0',
          })
            .catch(() => {})
            .finally(() => (loading.value = false));
          if (!res || res.code !== 200) return;
          getData();
        },
      });
    },
  },
  // {
  //   label: '决策版本',
  //   prop: 'versionNo',
  //   show: type.value !== 'list',
  // },
]);
const tableOpt = {
  label: '操作',
  list: [
    { title: '添加名单', show: () => type.value === 'list', methods: handleAddDialog },
    { title: '名单库数据', show: () => type.value === 'list', methods: handleListDialog },
    { title: '下载模板', show: () => type.value === 'list', methods: handleListModule },
    { title: '导入名单库数据', show: () => type.value === 'list', methods: handleListImport },
    // { title: '下载模板', show: () => type.value === 'list', methods: handleListDialog },
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
const dictMap = reactive({
  value: {},
});

const listVisible = ref(false);
const listAddingVisible = ref(false);
const listImportVisible = ref(false);
const listDecisionId = ref('');
const listDecisionNo = ref('');

const testingFormatter = computed(() => {
  if (type.value !== 'list') return;

  return ({ decisionResult }) => (decisionResult == 1 ? '未命中' : '命中');
});

watch(type, (val) => {
  getData();
});

async function getDict() {
  dictMap.value = Object.assign(
    {},
    await getDictSync(
      'decision_type_enum', //  决策算法
      'sys_normal_disable', //  系统开关
    ),
  );
}

function handleRefresh() {
  getData(search.value);
}

function handleQuery() {
  queryParams.pageNum = 1;
  getData(search.value);
}

function resetQuery() {
  search.value = {};
  queryParams.pageNum = 1;
  getData();
}

async function getData(opt = {}) {
  loading.value = true;

  const res = await getDecisionPageApi(
    Object.assign({}, queryParams, opt, {
      decisionType: type.value,
    }),
  ).catch(() => {});
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
  router.push(`/decision/${type.value}/create`);
}

function handleUpdate({ decisionNo }) {
  router.push(`/decision/${type.value}/${decisionNo}/update`);
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

onMounted(async () => {
  await getDict();
  type.value = routerType || dictMap.value['decision_type_enum']?.[0].value || '';
});

/**
 * @description: 添加名单数据弹窗
 * @param {*} decisionNo
 * @return {*}
 */
function handleAddDialog({ decisionId, decisionNo }) {
  listDecisionId.value = decisionId;
  listDecisionNo.value = decisionNo;
  listAddingVisible.value = true;
}

/**
 * @description: 名单库数据弹窗
 * @param {*} decisionId
 * @return {*}
 */
function handleListDialog({ decisionId }) {
  listDecisionId.value = decisionId;
  listVisible.value = true;
}

/**
 * @description: 下载名单库模板
 * @param {*} decisionId
 * @return {*}
 */
async function handleListModule({ decisionId, decisionName }) {
  proxy.download(
    '/decision/downloadListTemplate',
    { decisionId },
    `${decisionName}_名单库模板.xlsx`,
    {
      timeout: 0,
    },
  );
}

/**
 * @description: 名单库导入
 * @return {*}
 */
function handleListImport({ decisionId }) {
  listDecisionId.value = decisionId;
  listImportVisible.value = true;
}
</script>

<style lang="scss" scoped>
.decision-page {
  padding: 20px;
  .header {
    margin-bottom: 20px;
    width: 100%;

    .search {
      .el-form-item {
        margin-bottom: 0;
        align-items: center;
        margin-right: 0;
        margin-left: 30px;
      }
    }

    .btns .el-button {
      margin-left: 20px;
    }
  }
}
</style>
