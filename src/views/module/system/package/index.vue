<template>
  <!-- 套餐管理 -->
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="套餐名称" prop="packageName">
        <el-input
          clearable
          style="width: 214px"
          v-model="queryParams.packageName"
          placeholder="请输入套餐名称"
        ></el-input>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option
            v-for="(label, value) in statusList"
            :key="value"
            :label="label"
            :value="value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="套餐编码" prop="packageCode">
        <el-input
          v-model="queryParams.packageCode"
          clearable
          style="width: 214px"
          placeholder="请输入套餐编码"
        />
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

    <div class="container">
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
    </div>

    <Dialog
      v-model:visible="dialogStatus"
      :title="optType + '套餐管理'"
      @close="dialogClose"
      @cancel="dialogClose"
      @confirm="dialogConfirm"
      width="525px"
    >
      <template #content>
        <el-form
          ref="packageFormRef"
          :model="data.packageForm"
          :rules="data.packageRules"
          class="packageForm"
        >
          <!-- label-position="top" -->
          <el-form-item label="套餐编码" prop="packageCode">
            <el-input
              v-model="data.packageForm.packageCode"
              placeholder="请输入套餐编码"
            ></el-input>
          </el-form-item>

          <el-form-item label="套餐名称" prop="packageName">
            <el-input
              v-model="data.packageForm.packageName"
              placeholder="请输入套餐名称"
            ></el-input>
          </el-form-item>

          <el-form-item label="菜单权限" prop="type">
            <el-checkbox
              v-model="expand"
              label="展开/折叠"
              @change="handleCheckedTreeExpand($event)"
            />
            <el-checkbox
              v-model="nodeAll"
              label="全选/全不选"
              @change="handleCheckedTreeNodeAll($event)"
            />
            <el-checkbox v-model="checkStrictly" label="父子联动"></el-checkbox>
            <!--  @change="handleCheckedTreeConnect($event)" -->
            <!-- <el-checkbox-group v-model="data.packageForm.type">
             
            </el-checkbox-group> -->

            <el-tree
              class="tree-border"
              :check-strictly="!checkStrictly"
              :data="treeData"
              show-checkbox
              ref="menu"
              node-key="id"
              empty-text="加载中，请稍后"
              :props="treeProps"
            ></el-tree>
          </el-form-item>

          <!-- :check-strictly="!form.menuCheckStrictly" 
        @check-change="handleCheckChange"-->

          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="data.packageForm.status">
              <el-radio label="0">正常</el-radio>
              <el-radio label="1">禁用</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="data.packageForm.remark"
              autosize
              type="textarea"
              placeholder="请输入备注"
            ></el-input>
          </el-form-item>
        </el-form>
      </template>
      <!-- <template #footer>
        <el-button @click="dialogClose(false)"> 取消 </el-button>
      </template> -->
    </Dialog>

    <!-- 抽屉二次确认框 -->
    <Dialog
      v-model:visible="confirmDialog"
      @cancel="confirmCancel"
      @confirm="confirmConfirm"
      @close="confirmClose"
    >
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
<script setup name="package">
import {
  getPackagePageApi, // 查询套餐管理列表
  getPackageDetailApi, // 查询套餐管理详情
  insertPackageApi, // 添加套餐管理
  deletePackageApi, // 删除套餐管理
  updatePackageApi, // 修改套餐管理
  treeselectApi, //查询菜单树
} from '@/api/module/system/package';
import { ElMessage } from 'element-plus';
// import Drawer from "@/components/Drawer";
import Dialog from '@/components/Dialog';
import WebTable from '@/components/WebTable';
const { proxy } = getCurrentInstance();
const router = useRouter();
const tableData = ref([]);
const dialogStatus = ref(false);
const loading = ref(false);
const multiple = ref(true);
let optType = ref(''); // 操作类型
const confirmDialog = ref(false);
const deleteDialog = ref(false);
const currentRow = ref({});
const selectList = ref([]);
const total = ref(0);

const expand = ref(false);
const nodeAll = ref(false);
const checkStrictly = ref(true);

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
});

const statusList = ref({
  0: '正常',
  1: '禁用',
});

const showSearch = ref(true);

const treeData = ref([]);
// (node: Node, resolve: (data: Tree[]) => void) => {
//   if (node.level === 0) {
//     return resolve([{ name: 'Root1' }, { name: 'Root2' }])
//   }
// }

const data = reactive({
  packageForm: {
    status: '0',
    // checkStrictly: true,
  },
  packageRules: {
    packageName: [
      {
        required: true,
        message: '套餐名称不能为空',
        trigger: ['blur', 'change'],
      },
    ],

    packageCode: [
      {
        required: true,
        message: '套餐编码不能为空',
        trigger: ['blur', 'change'],
      },
    ],
    status: [
      {
        required: true,
        message: '状态不能为空',
        trigger: ['blur', 'change'],
      },
    ],
  },
});

const treeProps = {
  children: 'children',
  label: 'label',
  //   disabled: 'disabled',
};
const tableCol = [
  { label: '套餐id', prop: 'packageId', align: 'center' },
  { label: '套餐编码', prop: 'packageCode', align: 'center' },
  { label: '套餐名称', prop: 'packageName', align: 'center' },
  { label: '关联的字段id', prop: 'fieldIds', align: 'center' },
  { label: '关联的审批节点id', prop: 'approNodeIds', align: 'center' },
  { label: '状态', prop: 'status', align: 'center' },
  { label: '创建者', prop: 'createUserId', align: 'center' },
  { label: '创建时间', prop: 'createTime', align: 'center' },
  { label: '更新者', prop: 'updateUserId', align: 'center' },
  { label: '更新时间', prop: 'updateTime', align: 'center' },
  { label: '备注', prop: 'remark', align: 'center' },
];

const tableOpt = {
  label: '操作',
  list: [
    { title: '修改', show: () => true, methods: handleUpdate },
    { title: '删除', show: () => true, methods: handleDelete },
  ],
};

onMounted(() => {
  getList();
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
  getPackagePageApi(queryParams.value).then((res) => {
    loading.value = false;
    if (res.code == 200) {
      tableData.value = res.rows;
      total.value = res.total;
    }
  });
}

/** 导出按钮操作 */
function handleExport () {
  proxy.download(
    '/system/package/exportPackage',
    {
      ...queryParams.value,
    },
    `套餐管理_${new Date().getTime()}.xlsx`,
  );
}

// 全选/全不选
function handleCheckedTreeNodeAll (value) {
  proxy.$refs.menu.setCheckedNodes(value ? treeData.value : []);
}

// 树权限（展开/折叠）
function handleCheckedTreeExpand (value) {
  let treeList = treeData.value;
  for (let i = 0; i < treeList.length; i++) {
    proxy.$refs.menu.store.nodesMap[treeList[i].id].expanded = value;
  }
}

// function handleCheckedTreeConnect (value) {
//   data.packageForm.checkStrictly = value ? true : false;
//   // checkStrictly;
//   console.log(data.packageForm.type, ';pp', value);
// }

// 所有菜单节点数据
function getMenuAllCheckedKeys () {
  // 目前被选中的菜单节点
  let checkedKeys = proxy.$refs.menu.getCheckedKeys();
  // 半选中的菜单节点
  let halfCheckedKeys = proxy.$refs.menu.getHalfCheckedKeys();
  checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);

  console.log(checkedKeys, halfCheckedKeys, proxy.$refs.menu.getCheckedKeys(), ';;;;;;...');
  return checkedKeys;
}

// 获取菜单数
async function getTreeselect () {
  let resData = undefined;
  await treeselectApi().then((res) => {
    resData = res;
    if (res.code == 200) {
      treeData.value = res.data;
    }
  });
  return resData;
}

// function handleCheckChange (params, a, b) {
//   //   console.log(params, ';;', a, b);
//   getMenuAllCheckedKeys();
// }

function handleSizeChange (value) {
  queryParams.value.pageSize = value;
  getList();
}

function handleCurrentChange (value) {
  queryParams.value.pageNum = value;
  getList();
}

/** 多选框选中数据 */
function handleSelectionChange (selection) {
  console.log(
    selection.value,
    'selectionselection',
    selection.map((item) => item.packageId),
  );
}

function handleDetail (row) {
  optType.value = '详情';
  //   router.push(`/system/org/detail/${row.orgId}`);
}

async function handleUpdate (row) {
  optType.value = '修改';
  await getTreeselect();
  await getPackageDetail(row);
}

// 查询修改详情接口
async function getPackageDetail (row) {
  dialogStatus.value = true;
  await getPackageDetailApi({ packageId: row.packageId }).then((res) => {
    if (res.code == 200) {
      data.packageForm = res.data;

      data.packageForm.menuIds = res.data.menuIds.split(',');
      data.packageForm.menuIds.forEach((v) => {
        proxy.$refs.menu.setChecked(v, true, false);
      });
    }
  });
}
function handleDelete (row) {
  deleteDialog.value = true;
  currentRow.value = row;
}

async function handleAdd () {
  let res = {};
  optType.value = '添加';
  res = await getTreeselect();
  if (res.code == 200) {
    dialogStatus.value = true;
  }
}

function dialogClose () {
  nodeAll.value = false;
  dialogStatus.value = false;
  optType.value = '';
  proxy.$refs.packageFormRef?.resetFields();
  data.packageForm = { status: '0' };
  // , checkStrictly: true
}

function dialogConfirm (optType) {
  let menuIds = getMenuAllCheckedKeys();
  if (menuIds.length <= 0) {
    ElMessage({
      message: '请设置菜单权限',
      type: 'error',
    });

    return;
  }
  proxy.$refs.packageFormRef.validate((valid, fields) => {
    if (valid) {
      data.packageForm.menuIds = menuIds.join(',');
      confirmDialog.value = true;
    }
  });
}

function confirmClose () {
  // data.packageForm = {};
  // proxy.$refs.packageFormRef?.clearValidate();
}

function confirmCancel () {
  confirmDialog.value = false;
}

function confirmConfirm () {
  if (optType.value == '添加') {
    insertPackageApi(data.packageForm).then((res) => {
      confirmDialog.value = false;
      if (res.code == 200) {
        getList();
        dialogClose();
        proxy.$message.success('操作成功');
      }
    });
  } else if (optType.value == '修改') {
    updatePackageApi(data.packageForm).then((res) => {
      confirmDialog.value = false;
      if (res.code == 200) {
        getList();
        dialogClose();
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
  let packageIds = [];
  if (currentRow.value.packageId) {
    packageIds.push(currentRow.value.packageId);
  } else {
    selectList.value?.forEach((item) => {
      packageIds.push(item.packageId);
    });
  }

  deletePackageApi({ packageIds: packageIds.join(',') }).then((res) => {
    if (res.code == 200) {
      deleteDialog.value = false;
      getList();
      proxy.$message.success('操作成功');
    }
  });
}
</script>
<style lang="scss" scoped>
// .aa {
//   box-shadow: $--lower-layers-up;
// }
.packageForm {
  .el-select {
    width: 100%;
  }
}

.pagination {
  float: right;
  margin-top: 10px;
}

.footer {
  display: flex;
  justify-content: end;
}
</style>
