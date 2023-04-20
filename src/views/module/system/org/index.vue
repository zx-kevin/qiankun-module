<template>
  <!-- 组织管理 -->
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="实名状态" prop="authStatus">
        <el-select v-model="queryParams.authStatus" placeholder="请选择实名状态" clearable>
          <el-option
            v-for="(label, value) in authStatusList"
            :key="value"
            :label="label"
            :value="value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="组织名称" prop="orgName">
        <el-input
          v-model.trim="queryParams.orgName"
          style="width: 214px"
          clearable
          placeholder="请输入组织名称"
        />
      </el-form-item>

      <el-form-item label="组织类型" prop="orgType">
        <el-select v-model="queryParams.orgType" placeholder="请选择组织类型" clearable>
          <el-option
            v-for="(item, key) in org_type"
            :key="key"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="组织状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择组织状态" clearable>
          <el-option
            v-for="(label, value) in statusList"
            :key="value"
            :label="label"
            :value="value"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 批量操作 -->

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="!(selectList && selectList.length > 0)"
          @click="handleDelete"
          >删除</el-button
        >
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport">导出</el-button>
      </el-col> -->
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <WebTable
      v-model:page-num="queryParams.pageNum"
      v-model:page-size="queryParams.pageSize"
      :total="total"
      :pagination="getList"
      :table-data="tableData"
      :table-col="tableCol"
      :table-opt="tableOpt"
      :has-selection="true"
      :has-index="true"
      :first-columnFixed="true"
      cellMaxWidth="350"
      v-loading="loading"
      :select="tableSelect"
      :select-all="tableSelectAll"
    />
    <Drawer
      ref="drawerRef"
      v-model:visible="drawerStatus"
      :title="optType + '组织管理'"
      @close="drawerClose"
    >
      <el-form
        ref="orgFormRef"
        :model="data.orgForm"
        :rules="data.orgRules"
        label-position="top"
        class="orgForm"
      >
        <el-form-item label="超级管理员" prop="adminPeopleId">
          <el-select
            v-model="data.orgForm.adminPeopleId"
            placeholder="请选择超级管理员"
            filterable
            clearable
          >
            <el-option
              v-for="(item, key) in peopleOptions"
              :key="item.peopleId"
              :label="item.nickName"
              :value="item.peopleId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="套餐类型" prop="packageIds">
          <el-select
            v-model="data.orgForm.packageIds"
            multiple
            placeholder="请选择套餐类型"
            clearable
          >
            <el-option
              v-for="(item, key) in packageList"
              :key="item.packageId"
              :label="item.packageName"
              :value="item.packageId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="社会统一信用代码" prop="orgNo">
          <el-input v-model.trim="data.orgForm.orgNo" placeholder="请输入社会统一信用代码" />
        </el-form-item>

        <el-form-item label="实名状态" prop="authStatus">
          <el-select v-model="data.orgForm.authStatus" placeholder="请选择实名状态" clearable>
            <el-option
              v-for="(label, value) in authStatusList"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="组织名称" prop="orgName">
          <el-input v-model.trim="data.orgForm.orgName" placeholder="请输入组织名称" />
        </el-form-item>

        <el-form-item label="组织类型" prop="orgType">
          <el-select v-model="data.orgForm.orgType" placeholder="请选择组织类型" clearable>
            <el-option
              v-for="(item, key) in org_type"
              :key="key"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="组织状态" prop="status">
          <el-select v-model="data.orgForm.status" placeholder="请选择组织状态" clearable>
            <el-option
              v-for="(label, value) in statusList"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="data.orgForm.remark"
            autosize
            type="textarea"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="drawerClose()"> 取消 </el-button>
        <el-button type="primary" @click="drawerConfirm"> 确定 </el-button>
      </template>
    </Drawer>

    <!-- 抽屉二次确认框  @close="confirmClose" -->
    <Dialog v-model:visible="confirmDialog" @cancel="confirmCancel" @confirm="confirmConfirm">
    </Dialog>

    <!-- 删除二次确认 -->
    <Dialog
      v-model:visible="deleteDialog"
      @cancel="deleteCancel"
      @confirm="deleteConfirm"
      @close="deleteClose"
    >
    </Dialog>
  </div>
</template>
<script setup name="org">
import {
  getOrgPageApi, // 查询组织管理列表
  getOrgDetailApi, // 查询组织管理详情
  insertOrgApi, // 添加组织管理
  deleteOrgApi, // 删除组织管理
  updateOrgApi, // 修改组织管理
  getPackageOptionsApi, //查询套餐选择框选项
  getPeopleOptionsApi, // 查询个体选择框选项
} from '@/api/module/system/org';
import Drawer from '@/components/Drawer';
import Dialog from '@/components/Dialog';
import WebTable from '@/components/WebTable';
const { proxy } = getCurrentInstance();
const router = useRouter();
// 组织类型 字典
const { org_type } = proxy.useDict('org_type');
const tableData = ref([]);
const drawerStatus = ref(false);
const loading = ref(false);
const multiple = ref(true);
let optType = ref(''); // 操作类型
const confirmDialog = ref(false);
const deleteDialog = ref(false);
const currentRow = ref({});
const showSearch = ref(true);
const packageList = ref({});
const orgTypeList = ref({});
const selectList = ref([]);
const total = ref(0);
const peopleOptions = ref([]);

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  authStatus: null,
  delFlag: null,
  orgName: null,
  orgNo: null,
  orgType: null,
  remark: null,
  status: null,
});

// 实名状态 下拉列表
const authStatusList = ref({
  0: '已实名',
  1: '实名中',
  2: '实名失败',
});

// 组织状态 下拉列表
const statusList = ref({
  0: '正常',
  1: '停用',
});

const tableCol = [
  // { label: '角色编号', prop: 'roleId', align: 'center' },
  // { label: '超级管理员', prop: 'adminPeopleId', align: 'center' },
  // { label: '套餐类型', prop: 'packagesStr', align: 'center' },
  { label: '实名状态', prop: 'authStatus', align: 'center' },
  { label: '社会统一信用代码', prop: 'orgNo', align: 'center' },
  // { label: '删除标志', prop: 'delFlag', align: 'center' }, //对 的列表方式
  { label: '组织名称', prop: 'orgName', align: 'center' },
  { label: '组织类型', prop: 'orgType', align: 'center' },
  { label: '组织状态', prop: 'status', align: 'center' },
  { label: '备注', prop: 'remark', align: 'center' },
];

const tableOpt = {
  label: '操作',
  list: [
    { title: '详情', show: () => true, methods: handleDetail },
    { title: '修改', show: () => true, methods: handleUpdate },
    { title: '删除', show: () => true, methods: handleDelete },
  ],
};

const data = reactive({
  orgForm: {
    authStatus: '',
    delFlag: '',
    orgName: '',
    orgType: '',
    remark: '',
    status: '',
    packageCodes: [],
    adminPeopleId: '',
  },
  orgRules: {
    adminPeopleId: [
      {
        required: true,
        message: '超级管理员不能为空',
        trigger: ['blur', 'change'],
      },
    ],

    packageIds: [
      {
        required: true,
        message: '套餐类型不能为空',
        trigger: ['blur', 'change'],
      },
    ],

    packageCodes: [
      {
        required: true,
        message: '套餐类型不能为空',
        trigger: ['blur', 'change'],
      },
    ],

    authStatus: [
      {
        required: true,
        message: '实名状态不能为空',
        trigger: ['blur', 'change'],
      },
    ],
    delFlag: [
      {
        required: true,
        message: '删除标志不能为空',
        trigger: ['blur', 'change'],
      },
    ],
    orgName: [
      {
        required: true,
        message: '组织名称不能为空',
        trigger: ['blur', 'change'],
      },
    ],
    orgNo: [
      {
        required: true,
        message: '社会统一信用代码不能为空',
        trigger: ['blur', 'change'],
      },
    ],
    orgType: [
      {
        required: true,
        message: '组织类型不能为空',
        trigger: ['blur', 'change'],
      },
    ],
    // remark: [{ required: true, message: '备注不能为空', trigger: ['blur', 'change'] }],
    status: [
      {
        required: true,
        message: '组织状态不能为空',
        trigger: ['blur', 'change'],
      },
    ],
  },
});

watch(
  org_type,
  (val) => {
    if (val) {
      val.forEach((item) => {
        orgTypeList.value[item.value] = item.label;
      });
    }
  },
  { immediate: true },
);

onMounted(() => {
  getList();
  getPackageOptions();
});

/** 搜索按钮操作 */
function handleQuery () {
  queryParams.value.pageNum = 1;
  getList();
}

function resetQuery () {
  let pageSize = queryParams.value.pageSize; //保留原有的pageSize
  queryParams.value = {
    pageNum: 1,
    pageSize: pageSize,
  };
  getList();
}

function getList () {
  loading.value = true;
  selectList.value = [];
  getOrgPageApi(queryParams.value).then((res) => {
    if (res.code == 200) {
      loading.value = false;
      res.rows.forEach((item) => {
        let tmp = [];
        item.authStatus = authStatusList.value[item.authStatus];
        item.orgType = orgTypeList.value[item.orgType];
        item.status = statusList.value[item.status];
        // item.packages.forEach((item) => {
        //   tmp.push(item.packageName);
        // });

        // item.packagesStr = tmp.join(',');
      });
      tableData.value = res.rows;
      total.value = res.total;
    }
  });
}

/** 导出按钮操作 */
function handleExport () {
  proxy.download(
    '/system/org/exportOrg',
    {
      ...queryParams.value,
    },
    `组织管理_${new Date().getTime()}.xlsx`,
  );
}

async function getPackageOptions () {
  let resCode = undefined;
  await getPackageOptionsApi().then((res) => {
    if (res.code == 200) {
      packageList.value = res.data;
    }
    resCode = res.code;
  });
  return resCode;
}

function handleSizeChange (value) {
  queryParams.value.pageSize = value;
  getList();
}

function handleCurrentChange (value) {
  queryParams.value.pageNum = value;
  getList();
}

function handleDetail (row) {
  optType.value = '详情';
  router.push(`/system/org/detail/${row.orgId}`);
}

async function handleUpdate (row) {
  getOrgDetail(row);
  // resCode = await getPackageOptions();
}
function getOrgDetail (row) {
  getPeopleOptions();
  getOrgDetailApi({ orgId: row.orgId }).then((res) => {
    if (res.code == 200) {
      optType.value = '修改';
      data.orgForm = res.data;
      drawerStatus.value = true;
    }
  });
}
function handleDelete (row) {
  deleteDialog.value = true;
  currentRow.value = row;
}

function handleAdd () {
  optType.value = '添加';
  drawerStatus.value = true;
  getPeopleOptions();
}

function getPeopleOptions () {
  getPeopleOptionsApi().then((res) => {
    if (res.code == 200) {
      peopleOptions.value = res.data;
    }
  });
}

function drawerClose () {
  optType.value = '';
  data.orgForm = {
    authStatus: '',
    delFlag: '',
    orgName: '',
    orgType: '',
    remark: '',
    status: '',
    packageCodes: [],
    adminPeopleId: '',
  };
  proxy.$refs.orgFormRef?.resetFields();
  drawerStatus.value = false;
}

function drawerConfirm (optType) {
  proxy.$refs.orgFormRef.validate((valid, fields) => {
    if (valid) {
      confirmDialog.value = true;
    }
  });
}

function confirmClose () {
  // data.orgForm = {};
  confirmDialog.value = false;
}

function confirmCancel () {
  confirmDialog.value = false;
}

function confirmConfirm () {
  console.log(optType.value, ';[[]]');
  if (optType.value == '添加') {
    insertOrgApi(data.orgForm).then((res) => {
      confirmDialog.value = false;
      if (res.code == 200) {
        getList();
        drawerClose();
        proxy.$message.success('操作成功');
      }
    });
  } else if (optType.value == '修改') {
    updateOrgApi(data.orgForm).then((res) => {
      confirmDialog.value = false;
      if (res.code == 200) {
        getList();
        drawerClose();
        proxy.$message.success('操作成功');
      }
    });
  }
}

function tableSelect (rows) {
  selectList.value = rows;
  // console.log(rows, selectList.value, 'select');
}

function tableSelectAll (rows) {
  tableSelect(rows);
}

function deleteClose () {
  currentRow.value = {};
}

function deleteCancel () {
  deleteDialog.value = false;
  currentRow.value = {};
}

// 删除确定回调
function deleteConfirm () {
  let orgIds = [];
  if (currentRow.value.orgId) {
    orgIds.push(currentRow.value.orgId);
  } else {
    selectList.value?.forEach((item) => {
      orgIds.push(item.orgId);
    });
  }

  deleteOrgApi({ orgIds: orgIds.join(',') }).then((res) => {
    if (res.code == 200) {
      deleteDialog.value = false;
      proxy.$message.success('操作成功');
      getList();
    }
  });
}
</script>
<style lang="scss" scoped>
.orgForm {
  .el-select {
    width: 100%;
  }
}
</style>
