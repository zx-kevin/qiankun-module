<!--
 * @Author: yangxiong yangxiong@jeoho.com
 * @Date: 2023-03-09 09:13:44
 * @LastEditors: yangxiong yangxiong@jeoho.com
 * @LastEditTime: 2023-03-24 14:44:39
 * @FilePath: \decision_engine_ui\src\views\module\system\dept\index.vue
 * @Description: 部门管理 主页面
-->
<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="部门名称" prop="deptName">
        <el-input
          v-model="queryParams.deptName"
          placeholder="请输入部门名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="部门状态" clearable>
          <el-option
            v-for="dict in sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['system:dept:insert']"
          >新增</el-button
        >
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button type="info" plain icon="Sort" @click="toggleExpandAll">展开/折叠</el-button>
      </el-col> -->
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <div class="container">
      <!-- :has-index="true" :has-selection="true" :first-columnFixed="true"-->
      <WebTable
        v-if="refreshTable"
        v-model:page-num="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :table-data="deptList"
        :table-col="tableCol"
        :table-opt="tableOpt"
        :has-index="false"
        row-key="deptId"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        cellMaxWidth="350"
        v-loading="loading"
      >
        <template #status="{ row }">
          <dict-tag :options="sys_normal_disable" :value="row.status" />
        </template>
      </WebTable>
    </div>

    <!-- 添加或修改部门对话框 -->
    <Dialog :title="title" v-model:visible="open" width="600px" appendToBody>
      <template #content>
        <el-form ref="deptRef" :model="form" :rules="rules" label-width="80px">
          <el-row>
            <el-col :span="24" v-if="form.parentId !== '0' && form.parentId !== 0">
              <el-form-item label="上级部门" prop="parentId">
                <el-tree-select
                  v-model="form.parentId"
                  :data="deptList"
                  :props="{ value: 'deptId', label: 'deptName', children: 'children' }"
                  value-key="deptId"
                  filterable
                  clearable
                  placeholder="选择上级部门"
                  check-strictly
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="部门名称" prop="deptName">
                <el-input
                  v-model="form.deptName"
                  :disabled="title == '修改部门' && form.parentId == '0'"
                  placeholder="请输入部门名称"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="显示排序" prop="orderNum">
                <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="负责人" prop="leaderUserId">
                <el-select
                  v-model="form.leaderUserId"
                  filterable
                  placeholder="请输入负责人"
                  :disabled="title == '修改部门' && form.parentId == '0'"
                >
                  <el-option
                    v-for="item in peopleList"
                    :key="item.userId"
                    :label="item.people.nickName"
                    :value="item.userId"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <!-- <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
            </el-form-item>
          </el-col> -->
            <el-col :span="12">
              <el-form-item label="部门状态">
                <el-radio-group v-model="form.status">
                  <el-radio
                    v-for="dict in sys_normal_disable"
                    :key="dict.value"
                    :label="dict.value"
                    >{{ dict.label }}</el-radio
                  >
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </template>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup name="Dept">
import {
  listDept,
  getDept,
  delDept,
  addDept,
  updateDept,
  listDeptExcludeChild,
  getPeopleOptionsApi, //查询个体选择框选项
  getUserOptionsApi, //查询用户选择框选项
} from '@/api/module/system/dept';
import WebTable from '@/components/WebTable';
import Dialog from '@/components/Dialog';

const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict('sys_normal_disable');

const deptList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const title = ref('');
const deptOptions = ref([]);
const isExpandAll = ref(true);
const refreshTable = ref(true);
const peopleList = ref([]);

const tableCol = [
  { label: '部门名称', prop: 'deptName', align: 'center' },
  { label: '排序', prop: 'orderNum', align: 'center' },
  { label: '状态', prop: 'status', align: 'center' },
  { label: '创建时间', prop: 'createTime', align: 'center' },
];

const tableOpt = {
  label: '操作',
  list: [
    // { title: '详情', show: () => true, methods: handleUpdate },
    { title: '修改', show: () => true, methods: handleUpdate },
    { title: '删除', show: () => true, methods: handleDelete },
  ],
};

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 0,
    pageSize: 1,
    deptName: undefined,
    status: undefined,
  },
  rules: {
    parentId: [{ required: true, message: '上级部门不能为空', trigger: 'blur' }],
    deptName: [{ required: true, message: '部门名称不能为空', trigger: 'blur' }],
    orderNum: [{ required: true, message: '显示排序不能为空', trigger: 'blur' }],
    email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }],
    phone: [
      { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: '请输入正确的手机号码', trigger: 'blur' },
    ],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询部门列表 */
function getList () {
  loading.value = true;
  listDept(queryParams.value).then((response) => {
    deptList.value = proxy.handleTree(response.data, 'deptId');
    // deptList.value = response.data;
    loading.value = false;
  });
}
/** 取消按钮 */
function cancel () {
  open.value = false;
  reset();
}
/** 表单重置 */
function reset () {
  form.value = {
    deptId: undefined,
    parentId: undefined,
    deptName: undefined,
    orderNum: 0,
    leaderUserId: undefined,
    phone: undefined,
    email: undefined,
    status: '0',
  };
  proxy.resetForm('deptRef');
}
/** 搜索按钮操作 */
function handleQuery () {
  getList();
}
/** 重置按钮操作 */
function resetQuery () {
  proxy.resetForm('queryRef');
  handleQuery();
}
/** 新增按钮操作 */
function handleAdd (row) {
  reset();
  listDept().then((response) => {
    deptOptions.value = proxy.handleTree(response.data, 'deptId');
  });
  getPeopleOptions();
  if (row.deptId != undefined) {
    form.value.parentId = row.deptId;
    open.value = true;
    title.value = '修改部门';
    handleUpdate(row);
  } else {
    open.value = true;
    title.value = '新增部门';
  }
}

function getPeopleOptions () {
  getUserOptionsApi({ leaderUserId: form.value.leaderUserId }).then((res) => {
    if (res.code == 200) {
      peopleList.value = res.data;
    }
  });
}

/** 展开/折叠操作 */
function toggleExpandAll () {
  refreshTable.value = false;
  isExpandAll.value = !isExpandAll.value;
  nextTick(() => {
    refreshTable.value = true;
  });
}
/** 修改按钮操作 */
function handleUpdate (row) {
  reset();
  listDeptExcludeChild(row.deptId).then((response) => {
    deptOptions.value = proxy.handleTree(response.data, 'deptId');
  });
  getDept(row.deptId).then((response) => {
    form.value = response.data;
    open.value = true;
    title.value = '修改部门';
    getPeopleOptions();
  });
}
/** 提交按钮 */
function submitForm () {
  proxy.$refs['deptRef'].validate((valid) => {
    if (valid) {
      if (form.value.deptId != undefined) {
        updateDept(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功');
          open.value = false;
          getList();
        });
      } else {
        addDept(form.value).then((response) => {
          proxy.$modal.msgSuccess('新增成功');
          open.value = false;
          getList();
        });
      }
    }
  });
}
/** 删除按钮操作 */
function handleDelete (row) {
  proxy.$modal
    .confirm('是否确认删除名称为"' + row.deptName + '"的数据项?')
    .then(function () {
      return delDept(row.deptId);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess('删除成功');
    })
    .catch(() => {});
}

getList();
</script>

<style lang="scss" scoped>
.app-container {
  :deep(.web-table) {
    .el-table {
      .el-table__cell .cell {
        display: flex;
        align-items: center;
      }
    }
  }
}
</style>
