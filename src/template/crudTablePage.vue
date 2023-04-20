<!--
 * @Author: yangxiong yangxiong@jeoho.com
 * @Date: 2023-02-13 17:45:18
 * @LastEditors: yangxiong yangxiong@jeoho.com
 * @LastEditTime: 2023-03-30 14:20:16
 * @FilePath: \decision_engine_ui\src\views\module\resource\channel\index.vue
 * @Description: 增删改查 表格 主页面 模板页
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
      <el-form-item label="产品名称" prop="productName">
        <el-input
          clearable
          style="width: 214px"
          v-model="queryParams.productName"
          placeholder="请输入产品名称"
        ></el-input>
      </el-form-item>

      <el-form-item label="状态" prop="productStatus">
        <el-select v-model="queryParams.productStatus" placeholder="请选择状态" clearable>
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
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport">导出</el-button>
      </el-col>
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
        ref="productFormRef"
        :model="data.productForm"
        :rules="data.productRules"
        label-position="top"
        class="productForm"
      >
        <el-form-item label="产品编码" prop="productCode">
          <el-input v-model="data.productForm.productCode" placeholder="请输入产品编码" />
        </el-form-item>

        <el-form-item label="产品名称" prop="productName">
          <el-input v-model="data.productForm.productName" placeholder="请输入产品名称" />
        </el-form-item>

        <el-form-item label="状态" prop="productStatus">
          <el-select v-model="data.productForm.productStatus" placeholder="请选择状态" clearable>
            <el-option
              v-for="(label, value) in statusList"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="产品路由配置" prop="productRoute">
          <el-input
            v-model="data.productForm.productRoute"
            placeholder="请输入产品路由配置"
            type="textarea"
          />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="data.productForm.remark" placeholder="请输入备注" type="textarea" />
        </el-form-item>
      </el-form>

      <slot name="footer">
        <el-button @click="drawerClose()"> 取消 </el-button>
        <el-button type="primary" @click="drawerConfirm"> 确定 </el-button>
      </slot>
    </Drawer>

    <!-- 抽屉二次确认框  @close="confirmClose" -->
    <Dialog
      v-model:visible="confirmDialog"
      :loading="dialogLoading"
      @cancel="confirmCancel"
      @confirm="confirmConfirm"
    >
    </Dialog>

    <!-- 删除二次确认 -->
    <Dialog
      v-model:visible="deleteDialog"
      :loading="dialogLoading"
      @cancel="deleteCancel"
      @confirm="deleteConfirm"
      @close="deleteClose"
    >
    </Dialog>
  </div>
</template>
<script setup>
import {
  getProductPageApi, // 查询组织管理列表
  getProductDetailApi, // 查询组织管理详情
  insertProductApi, // 添加组织管理
  deleteProductApi, // 删除组织管理
  updateProductApi, // 修改组织管理
  getProductOptionsApi, //查询套餐选择框选项
  exportProductApi,
} from '@/api/module/resource/product';
import Drawer from '@/components/Drawer';
import Dialog from '@/components/Dialog';
import WebTable from '@/components/WebTable';
const { proxy } = getCurrentInstance();
const router = useRouter();
// 组织类型 字典
// const { org_type } = proxy.useDict('org_type');
const tableData = ref([]);
const drawerStatus = ref(false);
const loading = ref(false);
const multiple = ref(true);
let optType = ref(''); // 操作类型
const confirmDialog = ref(false);
const deleteDialog = ref(false);
const currentRow = ref({});
const showSearch = ref(true);
const productList = ref({});
const selectList = ref([]);
const total = ref(0);
const dialogLoading = ref(false);

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
});

const statusList = ref({
  0: '正常',
  1: '停用',
});

const tableCol = [
  { label: '产品编码', prop: 'productCode', align: 'center' },
  { label: '产品名称', prop: 'productName', align: 'center' },
  {
    label: '状态',
    prop: 'productStatus',
    align: 'center',
  },
  { label: '产品路由配置', prop: 'productRoute', align: 'center' },
  { label: '备注', prop: 'remark', align: 'center' },
];

const tableOpt = {
  label: '操作',
  list: [
    // { title: '详情', show: () => true, methods: handleDetail },
    { title: '修改', show: () => true, methods: handleUpdate },
    { title: '删除', show: () => true, methods: handleDelete },
  ],
};

const data = reactive({
  productForm: {
    productCode: '',
    productName: '',
    productRoute: '',
    productStatus: '',
    remark: '',
  },
  productRules: {
    productCode: [
      {
        required: true,
        message: '产品编码不能为空',
        trigger: ['blur', 'change'],
      },
    ],

    productName: [
      {
        required: true,
        message: '产品名称不能为空',
        trigger: ['blur', 'change'],
      },
    ],
    productRoute: [
      {
        required: true,
        message: '产品路由配置不能为空',
        trigger: ['blur', 'change'],
      },
    ],
    productStatus: [
      {
        required: true,
        message: '状态不能为空',
        trigger: ['blur', 'change'],
      },
    ],
    // remark: [
    //   {
    //     required: true,
    //     message: '备注不能为空',
    //     trigger: ['blur', 'change'],
    //   },
    // ],
  },
});

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
  getProductPageApi(queryParams.value).then((res) => {
    if (res.code == 200) {
      loading.value = false;
      tableData.value = res.rows;
      total.value = res.total;
    }
  });
}

/** 导出按钮操作 */
function handleExport () {
  proxy.download(
    '/resource/product/exportProduct',
    {
      ...queryParams.value,
    },
    `资源产品_${new Date().getTime()}.xlsx`,
  );
}

async function getProductOptions () {
  let resCode = undefined;
  await getProductOptionsApi().then((res) => {
    if (res.code == 200) {
      productList.value = res.data;
    }
    resCode = res.code;
  });
  return resCode;
}

function handleDetail (row) {
  optType.value = '详情';
  router.push(`/system/org/detail/${row.orgId}`);
}

async function handleUpdate (row) {
  let resCode = undefined;
  resCode = await getOrgDetail(row);
  resCode == 200 ? (optType.value = '修改') : '';
}
async function getOrgDetail (row) {
  let resCode = undefined;
  await getProductDetailApi({ productId: row.productId }).then((res) => {
    if (res.code == 200) {
      drawerStatus.value = true;
      data.productForm = res.data;
    }
    resCode = res.code;
  });
  return resCode;
}
function handleDelete (row) {
  deleteDialog.value = true;
  currentRow.value = row;
}

async function handleAdd () {
  drawerStatus.value = true;
  optType.value = '添加';
}

function drawerClose () {
  optType.value = '';
  data.productForm = {};
  proxy.$refs.productFormRef?.resetFields();
  drawerStatus.value = false;
}

function drawerConfirm (optType) {
  proxy.$refs.productFormRef.validate((valid, fields) => {
    if (valid) {
      confirmDialog.value = true;
    }
  });
}

function confirmClose () {
  confirmDialog.value = false;
}

function confirmCancel () {
  confirmDialog.value = false;
}

function confirmConfirm () {
  console.log(optType.value, ';[[]]');
  dialogLoading.value = true;
  if (optType.value == '添加') {
    insertProductApi(data.productForm)
      .then((res) => {
        dialogLoading.value = false;
        if (res.code == 200) {
          confirmDialog.value = false;
          getList();
          proxy.$message.success('操作成功');
          drawerClose();
        }
      })
      .catch((err) => {
        dialogLoading.value = false;
      });
  } else if (optType.value == '修改') {
    updateProductApi(data.productForm)
      .then((res) => {
        dialogLoading.value = false;
        if (res.code == 200) {
          confirmDialog.value = false;
          getList();
          proxy.$message.success('操作成功');
          drawerClose();
        }
      })
      .catch((err) => {
        dialogLoading.value = false;
      });
  } else {
    dialogLoading.value = false;
  }
}

function tableSelect (rows) {
  selectList.value = rows;
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

function deleteConfirm () {
  let productIds = [];

  if (currentRow.value.productId) {
    productIds.push(currentRow.value.productId);
  } else {
    selectList.value?.forEach((item) => {
      productIds.push(item.productId);
    });
  }
  dialogLoading.value = true;
  deleteProductApi(productIds)
    .then((res) => {
      dialogLoading.value = false;
      if (res.code == 200) {
        proxy.$message.success('操作成功');
        deleteDialog.value = false;
        getList();
      }
    })
    .catch((err) => {
      dialogLoading.value = false;
    });
}
</script>
<style lang="scss" scoped>
.productForm {
  .el-select {
    width: 100%;
  }
}
</style>
