<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="公告标题" prop="noticeTitle">
        <el-input
          v-model="queryParams.noticeTitle"
          placeholder="请输入公告标题"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="操作人员" prop="createBy">
        <el-input
          v-model="queryParams.createBy"
          placeholder="请输入操作人员"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="类型" prop="noticeType">
        <el-select v-model="queryParams.noticeType" placeholder="公告类型" clearable>
          <el-option
            v-for="dict in sys_notice_type"
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
          v-hasPermi="['system:notice:insert']"
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
          v-hasPermi="['system:notice:update']"
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
          v-hasPermi="['system:notice:delete']"
          >删除</el-button
        >
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <WebTable
      v-model:page-num="queryParams.pageNum"
      v-model:page-size="queryParams.pageSize"
      :total="total"
      :pagination="getList"
      :table-data="noticeList"
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
      <template #noticeType="{ row }">
        <dict-tag :options="sys_notice_type" :value="row.noticeType" />
      </template>

      <template #status="{ row }">
        <dict-tag :options="sys_notice_status" :value="row.status" />
      </template>

      <template #createTime="{ row }">
        <span>{{ parseTime(row.createTime, '{y}-{m}-{d}') }}</span>
      </template>
    </WebTable>


    <!-- 添加或修改公告对话框 -->
    <Dialog :title="title" v-model:visible="open" width="780px" appendToBody>
      <template #content>
        <el-form ref="noticeRef" :model="form" :rules="rules" label-width="80px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="公告标题" prop="noticeTitle">
                <el-input v-model="form.noticeTitle" placeholder="请输入公告标题" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="公告类型" prop="noticeType">
                <el-select v-model="form.noticeType" placeholder="请选择">
                  <el-option
                    v-for="dict in sys_notice_type"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="状态">
                <el-radio-group v-model="form.status">
                  <el-radio
                    v-for="dict in sys_notice_status"
                    :key="dict.value"
                    :label="dict.value"
                    >{{ dict.label }}</el-radio
                  >
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="内容">
                <el-input
                  :rows="6"
                  type="textarea"
                  placeholder="请输入内容"
                  v-model="form.noticeContent"
                />
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

<script setup name="Notice">
import {
  listNotice,
  getNotice,
  delNotice,
  addNotice,
  updateNotice,
} from '@/api/module/system/notice';
import WebTable from '@/components/WebTable';
import Dialog from '@/components/Dialog';

const { proxy } = getCurrentInstance();
const { sys_notice_status, sys_notice_type } = proxy.useDict(
  'sys_notice_status',
  'sys_notice_type',
);

const noticeList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');

const tableCol = [
  { label: '序号', prop: 'noticeId', align: 'center' },
  { label: '公告标题', prop: 'noticeTitle', align: 'center' },
  { label: '公告类型', prop: 'noticeType', align: 'center' },
  { label: '状态', prop: 'status', align: 'center' },
  { label: '创建者', prop: 'createBy', align: 'center' },
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
    noticeTitle: undefined,
    createBy: undefined,
    status: undefined,
  },
  rules: {
    noticeTitle: [{ required: true, message: '公告标题不能为空', trigger: 'blur' }],
    noticeType: [{ required: true, message: '公告类型不能为空', trigger: 'change' }],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询公告列表 */
function getList () {
  loading.value = true;
  listNotice(queryParams.value).then((response) => {
    noticeList.value = response.rows;
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
    noticeId: undefined,
    noticeTitle: undefined,
    noticeType: undefined,
    noticeContent: undefined,
    status: '0',
  };
  proxy.resetForm('noticeRef');
}
/** 搜索按钮操作 */
function handleQuery () {
  queryParams.value.pageNum = 1;
  getList();
}
/** 重置按钮操作 */
function resetQuery () {
  proxy.resetForm('queryRef');
  handleQuery();
}
/** 多选框选中数据 */
function handleSelectionChange (selection) {
  ids.value = selection.map((item) => item.noticeId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
function tableSelectAll (rows) {
  handleSelectionChange(rows);
}
/** 新增按钮操作 */
function handleAdd () {
  reset();
  open.value = true;
  title.value = '添加公告';
}
/**修改按钮操作 */
function handleUpdate (row) {
  reset();
  const noticeId = row.noticeId || ids.value;
  getNotice(noticeId).then((response) => {
    form.value = response.data;
    open.value = true;
    title.value = '修改公告';
  });
}
/** 提交按钮 */
function submitForm () {
  proxy.$refs['noticeRef'].validate((valid) => {
    if (valid) {
      if (form.value.noticeId != undefined) {
        updateNotice(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功');
          open.value = false;
          getList();
        });
      } else {
        addNotice(form.value).then((response) => {
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
  const noticeIds = row.noticeId || ids.value;
  proxy.$modal
    .confirm('是否确认删除公告编号为"' + noticeIds + '"的数据项？')
    .then(function () {
      return delNotice(noticeIds);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess('删除成功');
    })
    .catch(() => {});
}

getList();
</script>
