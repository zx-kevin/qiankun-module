<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" v-show="showSearch" :inline="true">
      <el-form-item label="角色名称" prop="roleName">
        <el-input
          v-model="queryParams.roleName"
          placeholder="请输入角色名称"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="权限字符" prop="roleKey">
        <el-input
          v-model="queryParams.roleKey"
          placeholder="请输入权限字符"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="角色状态"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" style="width: 308px">
        <el-date-picker
          v-model="dateRange"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
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
          v-hasPermi="['system:role:insert']"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:role:update']"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:role:delete']"
          >删除</el-button
        >
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:role:export']"
          >导出</el-button
        >
      </el-col> -->
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 表格数据 -->
    <WebTable
      v-model:page-num="queryParams.pageNum"
      v-model:page-size="queryParams.pageSize"
      :total="total"
      :pagination="getList"
      :table-data="roleList"
      :table-col="tableCol"
      :table-opt="tableOpt"
      :has-selection="true"
      :has-index="true"
      :first-columnFixed="true"
      cellMaxWidth="350"
      v-loading="loading"
      :select="handleSelectionChange"
      :select-all="tableSelectAll"
    >
      <template #deptName="{ row }">
        <el-switch
          v-model="row.status"
          active-value="0"
          inactive-value="1"
          @click="handleStatusChange(row)"
        ></el-switch>
      </template>
    </WebTable>

    <!-- 添加或修改角色配置对话框 -->
    <Dialog :title="title" v-model:visible="open" width="500px" :appendToBody="true">
      <template #content>
        <el-form ref="roleRef" :model="form" :rules="rules" label-width="100px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="form.roleName" placeholder="请输入角色名称" />
          </el-form-item>
          <el-form-item prop="roleKey">
            <template #label>
              <span>
                <el-tooltip
                  content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasRole('admin')`)"
                  placement="top"
                >
                  <el-icon><question-filled /></el-icon>
                </el-tooltip>
                权限字符
              </span>
            </template>
            <el-input v-model="form.roleKey" placeholder="请输入权限字符" />
          </el-form-item>
          <el-form-item label="角色顺序" prop="roleSort">
            <el-input-number v-model="form.roleSort" controls-position="right" :min="0" />
          </el-form-item>
          <el-form-item label="状态">
            <el-radio-group v-model="form.status">
              <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">{{
                dict.label
              }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="菜单权限">
            <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')"
              >展开/折叠</el-checkbox
            >
            <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')"
              >全选/全不选</el-checkbox
            >
            <el-checkbox
              v-model="form.menuCheckStrictly"
              @change="handleCheckedTreeConnect($event, 'menu')"
              >父子联动</el-checkbox
            >
            <el-tree
              class="tree-border"
              :data="menuOptions"
              show-checkbox
              ref="menuRef"
              node-key="id"
              :check-strictly="!form.menuCheckStrictly"
              empty-text="加载中，请稍候"
              :props="{ label: 'label', children: 'children' }"
            ></el-tree>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-form>
      </template>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </Dialog>

    <!-- 分配角色数据权限对话框 -->
    <Dialog :title="title" v-model:visible="openDataScope" width="500px" :appendToBody="true">
      <template #content>
        <el-form :model="form" label-width="80px">
          <el-form-item label="角色名称">
            <el-input v-model="form.roleName" :disabled="true" />
          </el-form-item>
          <el-form-item label="权限字符">
            <el-input v-model="form.roleKey" :disabled="true" />
          </el-form-item>
          <el-form-item label="权限范围">
            <el-select v-model="form.dataScope" @change="dataScopeSelectChange">
              <el-option
                v-for="item in dataScopeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="数据权限" v-show="form.dataScope == 2">
            <el-checkbox v-model="deptExpand" @change="handleCheckedTreeExpand($event, 'dept')"
              >展开/折叠</el-checkbox
            >
            <el-checkbox v-model="deptNodeAll" @change="handleCheckedTreeNodeAll($event, 'dept')"
              >全选/全不选</el-checkbox
            >
            <el-checkbox
              v-model="form.deptCheckStrictly"
              @change="handleCheckedTreeConnect($event, 'dept')"
              >父子联动</el-checkbox
            >
            <el-tree
              class="tree-border"
              :data="deptOptions"
              show-checkbox
              default-expand-all
              ref="deptRef"
              node-key="id"
              :check-strictly="!form.deptCheckStrictly"
              empty-text="加载中，请稍候"
              :props="{ label: 'label', children: 'children' }"
            ></el-tree>
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitDataScope">确 定</el-button>
          <el-button @click="cancelDataScope">取 消</el-button>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup name="Role">
import WebTable from '@/components/WebTable';
import Dialog from '@/components/Dialog';
import {
  addRole,
  changeRoleStatus,
  dataScope,
  delRole,
  getRole,
  listRole,
  updateRole,
} from '@/api/module/system/role';
import { roleMenuTreeselect, treeselect as menuTreeselect } from '@/api/module/system/menu';
import { getDeptTree, roleDeptTree } from '@/api/module/system/dept';

const router = useRouter();
const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict('sys_normal_disable');

const roleList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');
const dateRange = ref([]);
const menuOptions = ref([]);
const menuExpand = ref(false);
const menuNodeAll = ref(false);
const deptExpand = ref(true);
const deptNodeAll = ref(false);
const deptOptions = ref([]);
const openDataScope = ref(false);
const menuRef = ref(null);
const deptRef = ref(null);

/** 数据范围选项*/
const dataScopeOptions = ref([
  // { value: '0', label: '全部数据权限' },
  { value: '1', label: '机构数据权限' },
  { value: '2', label: '自定义数据权限' },
  { value: '3', label: '本部门及以下数据权限' },
  { value: '4', label: '本部门数据权限' },
  { value: '5', label: '仅本人数据权限' },
]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    roleName: undefined,
    roleKey: undefined,
    status: undefined,
  },
  rules: {
    roleName: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
    roleKey: [{ required: true, message: '权限字符不能为空', trigger: 'blur' }],
    roleSort: [{ required: true, message: '角色顺序不能为空', trigger: 'blur' }],
  },
});

const { queryParams, form, rules } = toRefs(data);

const tableCol = [
  { label: '角色编号', prop: 'roleId', align: 'center' },
  { label: '角色名称', prop: 'roleName', align: 'center' },
  { label: '权限字符', prop: 'roleKey', align: 'center' },
  { label: '显示顺序', prop: 'roleSort', align: 'center' },
  { label: '状态', prop: 'deptName', align: 'center' }, //状态插槽
  { label: '创建时间', prop: 'createTime', align: 'center' },
];

const tableOpt = {
  label: '操作',
  list: [
    { title: '修改', show: (row) => optVerify(row.row), methods: handleUpdate }, //v-if="scope.row.userId !== 1"
    { title: '删除', show: (row) => optVerify(row.row), methods: handleDelete },
    { title: '数据权限', show: (row) => optVerify(row.row), methods: handleDataScope },
    { title: '分配用户', show: (row) => optVerify(row.row), methods: handleAuthUser },
  ],
};

function optVerify (row) {
  var reg = RegExp(/_admin/);
  let verify = false;
  verify = row.roleKey === 'admin' || reg.test(row.roleKey) ? false : true;
  return verify;
}

/** 查询角色列表 */
function getList () {
  loading.value = true;
  listRole(proxy.addDateRange(queryParams.value, dateRange.value)).then((response) => {
    roleList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
/** 搜索按钮操作 */
function handleQuery () {
  queryParams.value.pageNum = 1;
  getList();
}
/** 重置按钮操作 */
function resetQuery () {
  dateRange.value = [];
  proxy.resetForm('queryRef');
  handleQuery();
}
/** 删除按钮操作 */
function handleDelete (row) {
  const roleIds = row.roleId || ids.value;
  proxy.$modal
    .confirm('是否确认删除角色编号为"' + roleIds + '"的数据项?')
    .then(function () {
      return delRole(roleIds);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess('删除成功');
    })
    .catch(() => {});
}
/** 导出按钮操作 */
function handleExport () {
  proxy.download(
    'system/role/export',
    {
      ...queryParams.value,
    },
    `role_${new Date().getTime()}.xlsx`,
  );
}
/** 多选框选中数据 */
function handleSelectionChange (selection) {
  ids.value = selection.map((item) => item.roleId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
/** 角色状态修改 */
function handleStatusChange (row) {
  proxy.$nextTick(() => {
    let text = row.status === '0' ? '启用' : '停用';
    proxy.$modal
      .confirm('确认要"' + text + '""' + row.roleName + '"角色吗?')
      .then(function () {
        return changeRoleStatus(row.roleId, row.status, row.roleKey);
      })
      .then(() => {
        proxy.$modal.msgSuccess(text + '成功');
      })
      .catch(function () {
        row.status = row.status === '0' ? '1' : '0';
      });
  });
}
/** 更多操作 */
function handleCommand (command, row) {
  switch (command) {
    case 'handleDataScope':
      handleDataScope(row);
      break;
    case 'handleAuthUser':
      handleAuthUser(row);
      break;
    default:
      break;
  }
}
/** 分配用户 */
function handleAuthUser (row) {
  router.push('/system/role-auth/user/' + row.roleId);
}
/** 查询菜单树结构 */
async function getMenuTreeselect () {
  await menuTreeselect().then((response) => {
    menuOptions.value = response.data;
  });
}
/** 所有部门节点数据 */
function getDeptAllCheckedKeys () {
  // 目前被选中的部门节点
  let checkedKeys = deptRef.value.getCheckedKeys();
  // 半选中的部门节点
  let halfCheckedKeys = deptRef.value.getHalfCheckedKeys();
  checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
  return checkedKeys;
}
/** 重置新增的表单以及其他数据  */
function reset () {
  if (menuRef.value != undefined) {
    menuRef.value.setCheckedKeys([]);
  }
  menuExpand.value = false;
  menuNodeAll.value = false;
  deptExpand.value = true;
  deptNodeAll.value = false;
  form.value = {
    roleId: undefined,
    roleName: undefined,
    roleKey: undefined,
    roleSort: 0,
    status: '0',
    menuIds: [],
    deptIds: [],
    menuCheckStrictly: true,
    deptCheckStrictly: true,
    remark: undefined,
  };
  dataScopeOptions.value = [
    // { value: '0', label: '全部数据权限' },
    { value: '1', label: '机构数据权限' },
    { value: '2', label: '自定义数据权限' },
    { value: '3', label: '本部门及以下数据权限' },
    { value: '4', label: '本部门数据权限' },
    { value: '5', label: '仅本人数据权限' },
  ];
  proxy.resetForm('roleRef');
}
/** 添加角色 */
async function handleAdd () {
  reset();
  await getMenuTreeselect();
  open.value = true;
  title.value = '添加角色';
}
/** 修改角色 */
async function handleUpdate (row) {
  reset();
  title.value = '修改角色';
  open.value = true;
  const roleId = row.roleId || ids.value;

  //获取部门树
  await getMenuTreeselect();
  getRole(roleId).then((response) => {
    form.value = response.data;
    form.value.roleSort = Number(form.value.roleSort);
    //获取角色部门树
    roleMenuTreeselect(roleId).then((response) => {
      //部门树选中
      response.data.forEach((menu) => {
        menuRef.value.setChecked(menu.menuId, true, false);
      });
    });
  });
}

/** 树权限（展开/折叠）*/
function handleCheckedTreeExpand (value, type) {
  if (type == 'menu') {
    let treeList = menuOptions.value;
    for (let i = 0; i < treeList.length; i++) {
      menuRef.value.store.nodesMap[treeList[i].id].expanded = value;
    }
  } else if (type == 'dept') {
    let treeList = deptOptions.value;
    for (let i = 0; i < treeList.length; i++) {
      deptRef.value.store.nodesMap[treeList[i].id].expanded = value;
    }
  }
}
/** 树权限（全选/全不选） */
function handleCheckedTreeNodeAll (value, type) {
  if (type == 'menu') {
    menuRef.value.setCheckedNodes(value ? menuOptions.value : []);
  } else if (type == 'dept') {
    deptRef.value.setCheckedNodes(value ? deptOptions.value : []);
  }
}
/** 树权限（父子联动） */
function handleCheckedTreeConnect (value, type) {
  if (type == 'menu') {
    form.value.menuCheckStrictly = value ? true : false;
  } else if (type == 'dept') {
    form.value.deptCheckStrictly = value ? true : false;
  }
}
/** 所有菜单节点数据 */
function getMenuAllCheckedKeys () {
  // 目前被选中的菜单节点
  let checkedKeys = menuRef.value.getCheckedKeys();
  // 半选中的菜单节点
  let halfCheckedKeys = menuRef.value.getHalfCheckedKeys();
  checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
  return checkedKeys;
}
/** 提交按钮 */
function submitForm () {
  proxy.$refs['roleRef'].validate((valid) => {
    if (valid) {
      if (form.value.roleId != undefined) {
        form.value.menuIds = getMenuAllCheckedKeys();
        updateRole(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功');
          open.value = false;
          getList();
        });
      } else {
        form.value.menuIds = getMenuAllCheckedKeys();
        addRole(form.value).then((response) => {
          proxy.$modal.msgSuccess('新增成功');
          open.value = false;
          getList();
        });
      }
    }
  });
}
/** 取消按钮 */
function cancel () {
  open.value = false;
  reset();
}
/** 选择角色权限范围触发 */
function dataScopeSelectChange (value) {
  if (value !== '2') {
    deptRef.value.setCheckedKeys([]);
  }
}
/** 分配数据权限操作 */
function handleDataScope (row) {
  reset();
  title.value = '分配数据权限';
  getRole(row.roleId).then((response) => {
    form.value = response.data;
    if (response.data.roleKey == 'admin') {
      dataScopeOptions.value.unshift({ value: '0', label: '全部数据权限' });
    }
    openDataScope.value = true;
    getDeptTree().then((response) => {
      deptOptions.value = response.data;
      roleDeptTree(row.roleId).then((response) => {
        let roleDeptList = response.data;
        let checkedKeys = [];
        roleDeptList.forEach((dept) => {
          checkedKeys.push(dept.deptId);
        });
        if (deptRef.value) {
          deptRef.value.setCheckedKeys(checkedKeys);
        }
      });
    });
  });
}
/** 提交按钮（数据权限） */
function submitDataScope () {
  if (form.value.roleId != undefined) {
    form.value.deptIds = getDeptAllCheckedKeys();
    dataScope(form.value).then((response) => {
      proxy.$modal.msgSuccess('修改成功');
      openDataScope.value = false;
      getList();
    });
  }
}
/** 取消按钮（数据权限）*/
function cancelDataScope () {
  openDataScope.value = false;
  reset();
}

// function tableSelect (rows) {
//   selectList.value = rows;
// }

function tableSelectAll (rows) {
  handleSelectionChange(rows);
}

getList();
</script>
