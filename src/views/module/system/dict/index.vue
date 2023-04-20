<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="字典名称" prop="dictName">
        <el-input
          v-model="queryParams.dictName"
          placeholder="请输入字典名称"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="字典类型" prop="dictType">
        <el-input
          v-model="queryParams.dictType"
          placeholder="请输入字典类型"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="字典状态"
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
          v-hasPermi="['system:dict:insert']"
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
          v-hasPermi="['system:dict:update']"
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
          v-hasPermi="['system:dict:delete']"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:dict:export']"
          >导出</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Refresh"
          @click="handleRefreshCache"
          v-hasPermi="['system:dict:delete']"
          >刷新缓存</el-button
        >
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <WebTable
      v-model:page-num="queryParams.pageNum"
      v-model:page-size="queryParams.pageSize"
      :total="total"
      :pagination="getList"
      :table-data="typeList"
      :table-col="tableCol"
      :table-opt="tableOpt"
      :has-selection="true"
      :first-columnFixed="true"
      cellMaxWidth="350"
      v-loading="loading"
      :select="handleSelectionChange"
      :select-all="tableSelectAll"
    >
      <template #dictType="{ row }">
        <router-link :to="'/system/dict-data/index/' + row.dictId" class="link-type">
          <span>{{ row.dictType }}</span>
        </router-link>
      </template>

      <template #status="{ row }">
        <dict-tag :options="sys_normal_disable" :value="row.status" />
      </template>

      <template #createTime="{ row }">
        <span>{{ parseTime(row.createTime) }}</span>
      </template>
    </WebTable>

    <!-- 添加或修改参数配置对话框 -->
    <Dialog :title="title" v-model:visible="open" width="500px" appendToBody>
      <template #content>
        <el-form ref="dictRef" :model="form" :rules="rules" label-width="80px">
          <el-form-item label="字典名称" prop="dictName">
            <el-input v-model="form.dictName" placeholder="请输入字典名称" />
          </el-form-item>
          <el-form-item label="字典类型" prop="dictType">
            <el-input v-model="form.dictType" placeholder="请输入字典类型" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">{{
                dict.label
              }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="备注" prop="remark">
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
  </div>
</template>

<script setup name="Dict">
import useDictStore from '@/store/modules/dict';
import {
  listType,
  getType,
  delType,
  addType,
  updateType,
  refreshCache,
} from '@/api/module/system/dict/type';
import WebTable from '@/components/WebTable';
import Dialog from '@/components/Dialog';

const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict('sys_normal_disable');

const typeList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');
const dateRange = ref([]);

const tableCol = [
  { label: '字典编号', prop: 'dictId', align: 'center' },
  { label: '字典名称', prop: 'dictName', align: 'center' },
  { label: '字典类型', prop: 'dictType', align: 'center' },
  { label: '状态', prop: 'status', align: 'center' },
  { label: '备注', prop: 'remark', align: 'center' },
  { label: '创建时间', prop: 'createTime', align: 'center' },
];

const tableOpt = {
  label: '操作',
  list: [
    //  { title: '详情', show: () => true, methods: handleDetail },
    { title: '修改', show: () => true, methods: handleUpdate },
    { title: '删除', show: () => true, methods: handleDelete },
  ],
};

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    dictName: undefined,
    dictType: undefined,
    status: undefined,
  },
  rules: {
    dictName: [{ required: true, message: '字典名称不能为空', trigger: 'blur' }],
    dictType: [{ required: true, message: '字典类型不能为空', trigger: 'blur' }],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询字典类型列表 */
function getList () {
  loading.value = true;
  listType(proxy.addDateRange(queryParams.value, dateRange.value)).then((response) => {
    typeList.value = response.rows;
    total.value = response.total;
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
    dictId: undefined,
    dictName: undefined,
    dictType: undefined,
    status: '0',
    remark: undefined,
  };
  proxy.resetForm('dictRef');
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
/** 新增按钮操作 */
function handleAdd () {
  reset();
  open.value = true;
  title.value = '添加字典类型';
}
/** 多选框选中数据 */
function handleSelectionChange (selection) {
  ids.value = selection.map((item) => item.dictId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
function tableSelectAll (rows) {
  handleSelectionChange(rows);
}
/** 修改按钮操作 */
function handleUpdate (row) {
  reset();
  const dictId = row.dictId || ids.value;
  getType(dictId).then((response) => {
    form.value = response.data;
    open.value = true;
    title.value = '修改字典类型';
  });
}
/** 提交按钮 */
function submitForm () {
  proxy.$refs['dictRef'].validate((valid) => {
    if (valid) {
      if (form.value.dictId != undefined) {
        updateType(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功');
          open.value = false;
          getList();
        });
      } else {
        addType(form.value).then((response) => {
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
  const dictIds = row.dictId || ids.value;
  proxy.$modal
    .confirm('是否确认删除字典编号为"' + dictIds + '"的数据项？')
    .then(function () {
      return delType(dictIds);
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
    'system/dict/type/export',
    {
      ...queryParams.value,
    },
    `dict_${new Date().getTime()}.xlsx`,
  );
}
/** 刷新缓存按钮操作 */
function handleRefreshCache () {
  refreshCache().then(() => {
    proxy.$modal.msgSuccess('刷新成功');
    useDictStore().cleanDict();
  });
}

getList();
</script>
