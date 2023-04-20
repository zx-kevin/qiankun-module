<!--
 * @Author: yangxiong yangxiong@jeoho.com
 * @Date: 2023-02-02 14:19:10
 * @LastEditors: yangxiong yangxiong@jeoho.com
 * @LastEditTime: 2023-04-03 11:07:44
 * @FilePath: \decision_engine_ui\src\views\module\system\people\index.vue
 * @Description: 账号管理 主页面
-->
<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="用户账号" prop="userName">
        <el-input
          v-model="queryParams.userName"
          clearable
          style="width: 214px"
          placeholder="请输入用户账号"
        />
      </el-form-item>

      <el-form-item label="用户昵称" prop="nickName">
        <el-input
          v-model="queryParams.nickName"
          clearable
          style="width: 214px"
          placeholder="请输入用户昵称"
        />
      </el-form-item>
      <el-form-item label="用户性别" prop="sex">
        <el-select v-model="queryParams.sex" placeholder="请选择用户性别" clearable>
          <el-option v-for="(label, value) in sexList" :key="value" :label="label" :value="value" />
        </el-select>
      </el-form-item>

      <el-form-item label="手机号码" prop="phonenumber">
        <el-input
          v-model="queryParams.phonenumber"
          clearable
          style="width: 214px"
          placeholder="请输入手机号码"
        />
      </el-form-item>

      <el-form-item label="用户邮箱" prop="email">
        <el-input
          v-model="queryParams.email"
          clearable
          style="width: 214px"
          placeholder="请输入用户邮箱"
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
        <el-button
          type="primary"
          plain
          icon="Plus"
          v-hasPermi="['system:people:manage']"
          @click="handleAdd"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="!(selectList && selectList.length > 0)"
          v-hasPermi="['system:people:manage']"
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
      >
        <template #sex="{ row, col }">
          <!-- {{row.sex}} -->
          <tooltip-text :refName="col.prop" :content="sexList[row.sex]" />
        </template>
      </WebTable>
    </div>

    <Drawer
      ref="drawerRef"
      v-model:visible="drawerStatus"
      :title="optType + '个体管理'"
      @close="drawerClose"
    >
      <el-form
        ref="peopleFormRef"
        :model="data.peopleForm"
        :rules="data.peopleRules"
        label-position="top"
        class="peopleForm"
      >
        <el-form-item label="用户账号" prop="userName">
          <el-input v-model.trim="data.peopleForm.userName" placeholder="请输入用户账号" />
        </el-form-item>

        <el-form-item label="用户昵称" prop="nickName">
          <el-input v-model.trim="data.peopleForm.nickName" placeholder="请输入用户昵称" />
        </el-form-item>
        <el-form-item label="用户性别" prop="sex">
          <el-select v-model="data.peopleForm.sex" placeholder="请选择用户性别" clearable>
            <el-option
              v-for="(label, value) in sexList"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="身份证号码" prop="idcard">
          <el-input
            v-model.trim="data.peopleForm.idcard"
            clearable
            placeholder="请输入身份证号码"
          />
        </el-form-item>

        <el-form-item label="手机号码" prop="phonenumber">
          <el-input v-model.trim="data.peopleForm.phonenumber" placeholder="请输入手机号码" />
        </el-form-item>

        <el-form-item label="用户邮箱" prop="email">
          <el-input v-model.trim="data.peopleForm.email" placeholder="请输入用户邮箱" />
        </el-form-item>

        <el-form-item label="帐号状态" prop="status">
          <el-select v-model="data.peopleForm.status" placeholder="请选择帐号状态" clearable>
            <el-option
              v-for="(label, value) in statusList"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="删除标志" prop="delFlag">
          <el-select v-model="data.peopleForm.delFlag" placeholder="请选择删除标志" clearable>
            <el-option
              v-for="(label, value) in delFlagList"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item> -->

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="data.peopleForm.remark"
            autosize
            type="textarea"
            placeholder="请输入备注"
          />
        </el-form-item>
        <!--   -->
        <el-form-item label="头像地址" prop="avatar">
          <UploadFile
            v-model="data.peopleForm.avatar"
            :limit="1"
            accept=".jpg,.png"
            :on-success="handleUploadSuccess"
            :delFile="handleUploadDelFile"
          >
          </UploadFile>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="drawerClose()"> 取消 </el-button>
        <el-button type="primary" @click="drawerConfirm"> 确定 </el-button>
      </template>
    </Drawer>

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

    <!-- 修改密码弹窗 -->
    <Dialog
      v-model:visible="passwordDialog"
      @cancel="passwordCancel"
      @confirm="passwordConfirm"
      @close="passwordClose"
    >
      <template #content>
        <el-form
          ref="passwordFormRef"
          :model="data.passwordForm"
          :rules="data.passwordRules"
          label-position="top"
          class="passwordForm"
        >
          <el-form-item label="密码" prop="password">
            <el-input
              v-model.trim="data.passwordForm.password"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>
        </el-form>
      </template>
    </Dialog>
  </div>
</template>
<script setup name="people">
import {
  getPeoplePageApi, // 查询个体管理列表
  getPeopleDetailApi, // 查询个体管理详情
  insertPeopleApi, // 添加个体管理
  deletePeopleApi, // 删除个体管理
  updatePeopleApi, // 修改个体管理
  updatePasswordApi, //修改密码
} from '@/api/module/system/people';
import Drawer from '@/components/Drawer';
import Dialog from '@/components/Dialog';
import useUserStore from '@/store/modules/user';
import WebTable from '@/components/WebTable';
import UploadFile from '@/components/UploadFile';
import { validIdcard } from '@/utils/validate.js'
const { proxy } = getCurrentInstance();
const router = useRouter();
const userStore = useUserStore();

const uploadFileUrl = ref(import.meta.env.VITE_APP_BASE_API + '/common/upload'); // 上传文件服务器地址
const { sys_user_sex } = proxy.useDict('sys_user_sex');

const tableData = ref([]);
const drawerStatus = ref(false);
const loading = ref(false);
const multiple = ref(true);
let optType = ref(''); // 操作类型
const confirmDialog = ref(false);
const deleteDialog = ref(false);
const currentRow = ref({});
const showSearch = ref(true);
const selectList = ref([]);
const total = ref(0);
const passwordDialog = ref(false);

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
});

// 用户性别 下拉列表
const sexList = ref({
  0: '男',
  1: '女',
  2: '未知',
});

// 删除标志 下拉列表
const delFlagList = ref({
  0: '存在',
  2: '删除',
});

// 账号状态 下拉列表
const statusList = ref({
  0: '正常',
  1: '停用',
});
// const { contract_status } = proxy.useDict('contract_status');

// const contract_status_filters = computed(() =>
//   contract_status.value.map((item) => ({ text: item.label, value: item.value })),
// );

const tableCol = [
  { label: '用户账号', prop: 'userName', align: 'center' },
  // { label: '密码', prop: 'password', align: 'center' },
  { label: '用户昵称', prop: 'nickName', align: 'center' },
  {
    label: '用户性别',
    prop: 'sex',
    align: 'center',
    // dictTag: contract_status,
    // filters: contract_status_filters,
    // dict: sys_user_sex,
  },
  { label: '身份证号码', prop: 'idcard', align: 'center' },
  { label: '手机号码', prop: 'phonenumber', align: 'center' },
  { label: '用户邮箱', prop: 'email', align: 'center' },
  { label: '个体id', prop: 'peopleId', align: 'center' },
  { label: '帐号状态', prop: 'status', align: 'center' },
  { label: '头像', prop: 'avatar', img: true, align: 'center' },
  // { label: '删除标志', prop: 'delFlag', align: 'center' },
  { label: '最后登录时间', prop: 'loginDate', align: 'center' },
  { label: '最后登录IP', prop: 'loginIp', align: 'center' },
  { label: '备注', prop: 'remark', align: 'center' },
];

const tableOpt = {
  label: '操作',
  list: [
    // { title: '详情', show: () => true, methods: handleDetail },
    { title: '修改', show: () => true, methods: handleUpdate },
    { title: '删除', show: () => true, methods: handleDelete },
    { title: '修改密码', show: () => true, methods: upPassword },
  ],
};

const data = reactive({
  peopleForm: {},
  peopleRules: {
    delFlag: [
      {
        required: true,
        message: '删除标志不能为空',
        trigger: ['blur', 'change'],
      },
    ],
    email: [
      {
        required: true,
        message: '用户邮箱不能为空',
        trigger: ['blur', 'change'],
      },
      {
        validator: validateEmail,
        message: '请输入正确的邮箱',
      },
    ],

    nickName: [
      {
        required: true,
        message: '用户昵称不能为空',
        trigger: ['blur', 'change'],
      },
    ],

    idcard: [
      {
        required: true,
        message: '身份证号码不能为空',
        trigger: ['blur', 'change'],
      },
      {
        validator: validateIdcard,
        message: '请输入正确的身份证号码',
        trigger: ['blur', 'change'],
      },
    ],

    userName: [
      {
        required: true,
        message: '用户账号不能为空',
        trigger: ['blur', 'change'],
      },
    ],

    phonenumber: [
      {
        required: true,
        message: '手机号码不能为空',
        trigger: ['blur', 'change'],
      },

      {
        validator: validatePhone,
        message: '请输入正确的手机号码',
      },
    ],

    // remark: [
    //   {
    //     required: true,
    //     message: "备注不能为空",
    //     trigger: ["blur", "change"],
    //   },
    // ],
    sex: [
      {
        required: true,
        message: '用户性别不能为空',
        trigger: ['blur', 'change'],
      },
    ],

    status: [
      {
        required: true,
        message: '帐号状态不能为空',
        trigger: ['blur', 'change'],
      },
    ],

    // avatar: [
    //   {
    //     required: true,
    //     message: '头像地址不能为空',
    //     trigger: ['blur', 'change'],
    //   },
    // ],
  },

  passwordForm: {},
  passwordRules: {
    password: [
      {
        required: true,
        message: '新密码不能为空',
        trigger: ['blur', 'change'],
      },
      {
        validator: validPassword,
        message: '新密码需至少包含数字、字母、符号中的2种，长度在6-20之间',
        trigger: 'blur',
      },
    ],
  },
});

onMounted(() => {
  getList();
  // setTimeout(() => {
  //   console.log(sys_user_sex.value, '--------------;ppp');
  // }, 1000);

  // console.log(proxy.selectDictLabel(sys_user_sex, 'sex'));
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
  getPeoplePageApi(queryParams.value).then((res) => {
    if (res.code == 200) {
      loading.value = false;
      res.rows.forEach((item) => {
        // item.sex = sexList.value[item.sex];
        item.delFlag = delFlagList.value[item.delFlag];
        item.status = statusList.value[item.status];
      });
      tableData.value = res.rows;
      total.value = res.total;
    }
  });
}

// 上传成功
function handleUploadSuccess (res, file) {
  // if (res.code === 200) {
  //   const { templateVars } = res.data;
  //   templateDetail.value = {
  //     templateVars,
  //     sum: JSON.parse(templateVars).length,
  //   };
  //   formRef.value.validateField('templateDocPath');
  // }
}

// 上传删除
function handleUploadDelFile (index) {
  data.peopleForm.avatar = '';
  // formRef.value.validateField('templateDocPath');
}

/** 导出按钮操作 */
function handleExport () {
  proxy.download(
    '/system/people/exportPeople',
    {
      ...queryParams.value,
    },
    `个体管理_${new Date().getTime()}.xlsx`,
  );
}

function handleSizeChange (value) {
  queryParams.value.pageSize = value;
  getList();
}

function handleCurrentChange (value) {
  queryParams.value.pageNum = value;
  getList();
}

function upPassword (row) {
  passwordDialog.value = true;
  currentRow.value = row;
}

function handleDetail (row) {
  optType.value = '详情';
  router.push(`/system/people/detail/${row.peopleId}`);
}

function handleUpdate (row) {
  optType.value = '修改';
  getPeopleDetail(row);
}
function getPeopleDetail (row) {
  getPeopleDetailApi({ peopleId: row.peopleId }).then((res) => {
    if (res.code == 200) {
      optType.value = '修改';
      data.peopleForm = res.data;
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
}

function drawerClose () {
  optType.value = '';
  proxy.$refs.peopleFormRef?.resetFields();
  data.peopleForm = {};
  drawerStatus.value = false;
}

function drawerConfirm (optType) {
  proxy.$refs.peopleFormRef.validate((valid, fields) => {
    if (valid) {
      confirmDialog.value = true;
    }
  });
}

function confirmClose () {
  // data.peopleForm = {};
}

function confirmCancel () {
  confirmDialog.value = false;
}

function confirmConfirm () {
  if (optType.value == '添加') {
    insertPeopleApi(data.peopleForm).then((res) => {
      confirmDialog.value = false;
      if (res.code == 200) {
        getList();
        drawerClose();
        proxy.$message.success('操作成功');
      }
    });
  } else if (optType.value == '修改') {
    updatePeopleApi(data.peopleForm).then((res) => {
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
}

function tableSelectAll (rows) {
  tableSelect(rows);
}

function passwordClose () {
  currentRow.value = {};
}

function passwordCancel () {
  passwordDialog.value = false;
  currentRow.value = {};
}

// 删除确定回调
function passwordConfirm () {
  proxy.$refs?.passwordFormRef.validate((valid, fields) => {
    if (valid) {
      let params = {
        peopleId: currentRow.value.peopleId,
        password: data.passwordForm.password,
      };
      updatePasswordApi(params).then((res) => {
        if (res.code == 200) {
          proxy.$message.success('操作成功');
          passwordDialog.value = false;
          // userStore.logOut().then(() => {
          //   location.href = '/index';
          // });
        }
      });
    }
  });
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
  let peopleIds = [];

  if (currentRow.value.peopleId) {
    peopleIds.push(currentRow.value.peopleId);
  } else {
    selectList.value?.forEach((item) => {
      peopleIds.push(item.peopleId);
    });
  }

  deletePeopleApi({ peopleIds: peopleIds.join(',') }).then((res) => {
    if (res.code == 200) {
      deleteDialog.value = false;
      getList();
      proxy.$message.success('操作成功');
    }
  });
}

// 验证身份证号
function validateIdcard (rule, value, callback) {
  if (!validIdcard(value)) {
    callback(new Error(rule.message));
  } else {
    callback();
  }
}

function validPassword (rule, value, callback) {
  const reg = /((?=.*\d)(?=.*\D)|(?=.*[a-zA-Z])(?=.*[^a-zA-Z]))(?!^.*[\u4E00-\u9FA5].*$)^\S{6,20}$/;
  if (!reg.test(value)) {
    callback(new Error(rule.message));
    return;
  }
  callback();
}

function validateEmail (rule, value, callback) {
  const reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;

  if (!reg.test(value)) {
    callback(new Error(rule.message));
    return;
  }
  callback();
}

function validatePhone (rule, value, callback) {
  const reg = /^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/;

  if (!reg.test(value)) {
    callback(new Error(rule.message));
    return;
  }
  callback();
}
</script>
<style lang="scss" scoped>
.peopleForm {
  .el-select {
    width: 100%;
  }
}

.upload-demo {
  .el-upload-dragger {
    width: 325px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
}

.pagination {
  float: right;
  margin-top: 10px;
}
</style>
