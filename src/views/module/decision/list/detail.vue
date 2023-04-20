<!--
 * @Author: K
 * @Date: 2023-03-21 16:50:00
 * @Descripttion: 决策管理 - 名单库 - 详情
 * @FilePath: \decision_engine_ui\src\views\module\decision\list\detail.vue
 * @LastEditors: K
 * @LastEditTime: 2023-04-19 09:13:13
-->
<template>
  <div class="decision-list-detail" v-loading="loading">
    <!-- <el-row class="header" :gutter="10" justify="space-between" align="middle">
      <el-select v-model="currentVersion" :disabled="!decisionNo || isAdding" size="large">
        <el-option
          v-for="item in versionOptions"
          :key="`version_${item.versionNo}`"
          :label="item.versionNo"
          :value="item.versionNo"
        ></el-option>
      </el-select>

      <el-row v-if="decisionNo" justify="end" style="margin-left: 10px">
        <template v-if="status === 0">
          <el-popconfirm
            v-if="versionOptions.length > 1"
            title="确定删除该版本？"
            width="200"
            @confirm="handleDelVersion"
          >
            <template #reference>
              <el-button type="danger">删除版本</el-button>
            </template>
          </el-popconfirm>
          <el-button @click="() => (status = 1)">新增版本</el-button>
        </template>
        <el-button v-else @click="() => (status = 0)">取消新增版本</el-button>
      </el-row>
    </el-row> -->

    <el-scrollbar class="main">
      <el-form
        ref="formRef"
        :model="form.value"
        :rules="rules"
        label-width="120px"
        label-position="left"
      >
        <el-form-item label="名单名称" prop="decisionName">
          <el-input
            v-model="form.value.decisionName"
            placeholder="请填写名单名称"
            :disabled="status == 1"
            maxlength="100"
            show-word-limit
          ></el-input>
        </el-form-item>
        <el-form-item label="名单描述" prop="decisionRemark">
          <el-input
            v-model="form.value.decisionRemark"
            placeholder="请填写名单描述"
            :disabled="status == 1"
            maxlength="200"
            show-word-limit
          ></el-input>
        </el-form-item>
        <!-- <el-form-item label="版本描述" prop="versionRemark">
          <el-input
            v-model="form.value.versionRemark"
            placeholder="请填写版本描述"
            maxlength="200"
            show-word-limit
          ></el-input>
        </el-form-item> -->
        <el-form-item label="名单库字段" required>
          <div>
            <el-row>
              <el-switch
                v-model="form.value.matchType"
                active-text="精准匹配"
                inactive-text="模糊匹配"
                active-value="0"
                inactive-value="1"
              ></el-switch>
            </el-row>

            <el-form-item label="" prop="libFields" :rules="rules.libFields">
              <el-row class="features" :gutter="10">
                <el-button
                  v-if="!decisionNo || status == 1"
                  icon="Plus"
                  @click="handleSelector(0)"
                ></el-button>

                <div class="tags">
                  <el-tag
                    v-for="(item, index) in form.value.libFields"
                    :key="`tag_${index}`"
                    :closable="!Boolean(decisionNo) || status == 1"
                    size="large"
                    @close="handleTagClose(0, index)"
                  >
                    {{ item.featureName }}
                  </el-tag>
                </div>
              </el-row>
            </el-form-item>
          </div>
        </el-form-item>
        <el-form-item label="查询匹配字段" required>
          <div>
            <el-row>
              <el-switch
                v-model="form.value.queryType"
                active-text="and"
                inactive-text="or"
                active-value="0"
                inactive-value="1"
              ></el-switch>
            </el-row>

            <el-form-item label="" prop="queryFields" :rules="rules.queryFields">
              <el-row class="features" :gutter="10">
                <el-button icon="Plus" @click="handleSelector(1)"></el-button>

                <div class="tags">
                  <el-tag
                    v-for="(item, index) in form.value.queryFields"
                    :key="`tag_${index}`"
                    closable
                    size="large"
                    @close="handleTagClose(1, index)"
                  >
                    {{ item.featureName }}
                  </el-tag>
                </div>
              </el-row>
            </el-form-item>
          </div>
        </el-form-item>
        <el-form-item label="输出字段" prop="resultOutputCode">
          <el-select
            v-model="form.value.resultOutputCode"
            placeholder="请选择输出字段"
            clearable
            filterable
          >
            <el-option
              v-for="item in dictMap.value['featureOptions']"
              :key="item.featureCode"
              :label="item.featureName"
              :value="item.featureCode"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-scrollbar>

    <el-row class="footer" justify="end">
      <el-button size="large" @click="handleClose">取消</el-button>
      <el-button type="primary" size="large" @click="handleConfirm">保存</el-button>
    </el-row>

    <selector
      v-model="selectorVisible"
      :options="selectorOptions"
      @confirm="handleSelectorConfrim"
    ></selector>
  </div>
</template>

<script setup>
import UploadFile from '@/components/UploadFile';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getDictSync } from '@/utils/dict';
import selector from './selector';

import {
  getLibFeatureOptionsApi, //  查询特征库选择框选项
} from '@/api/module/feature';
import {
  insertDecisionApi, // 新增决策
  updateDecisionApi, // 修改决策
  getDecisionDetailApi, // 查询决策详细
  deleteVersionApi, //  删除版本
  addVersionApi, //  新增决策版本
  getVersionInfoApi, //  查询决策版本详细
} from '@/api/module/decision/ruleset';

const router = useRouter();
const { decisionNo } = router.currentRoute.value.params;
const { proxy } = getCurrentInstance();

const loading = ref(false);

const formRef = ref();
const form = reactive({
  value: {},
});
const formCp = reactive({
  value: {},
});
const selectorVisible = ref(false);
const selectorType = ref(0);
const selectorOptions = computed(() => {
  let result = ref([]);
  watchEffect(() => {
    if (selectorType.value === 0) {
      result.value = (dictMap.value?.['featureOptions'] || []).map((item) => ({
        ...item,
        checked: Boolean(
          form.value.libFields?.find((i) => i.featureCode === item.featureCode) || false,
        ),
      }));
    } else {
      result.value = (form.value.libFields || []).map((item) => ({
        ...item,
        checked: Boolean(
          form.value.queryFields?.find((i) => i.featureCode === item.featureCode) || false,
        ),
      }));
    }
  });
  return result.value;
});

const status = ref(0);
const isAdding = computed(() => status.value === 1);
watch(isAdding, (val) => {
  if (val) {
    formCp.value = JSON.parse(JSON.stringify(form.value));
    form.value = {
      decisionName: form.value.decisionName,
      decisionRemark: form.value.decisionRemark,
    };
  } else {
    form.value = JSON.parse(JSON.stringify(formCp.value));
  }
  setTimeout(() => formRef.value.clearValidate());
});
const addingForm = reactive({
  value: {},
});
const versionOptions = computed(() => form.value?.versionList || []);
const currentVersion = computed({
  get() {
    return !decisionNo
      ? 'V1'
      : isAdding.value
      ? `V${(Number((formCp.value.versionList || [])?.[0]?.versionNo?.split('V')?.[1]) || 0) + 1}`
      : form.value.versionNo;
  },
  set(val) {
    if (val === (form.value?.versionNo ?? '')) return;
    getVersionInfo(versionOptions.value.find((item) => item.versionNo === val)?.['decisionId']);
  },
});

const checkLibFields = ({ field }, value, callback) => {
  callback(!value || !value.length ? new Error('请选择名单库字段') : undefined);
};
const checkQueryFields = ({ field }, value, callback) => {
  callback(!value || !value.length ? new Error('请选择匹配字段') : undefined);
};
const rules = {
  decisionName: [
    { required: true, message: '请填写名单名称', trigger: ['blur', 'change'] },
    { max: 100, message: '输入长度不能大于100', trigger: ['blur', 'change'] },
  ],
  decisionRemark: [
    { required: true, message: '请填写名单描述', trigger: ['blur', 'change'] },
    { max: 200, message: '输入长度不能大于200', trigger: ['blur', 'change'] },
  ],
  libFields: [{ validator: checkLibFields, trigger: 'change' }],
  queryFields: [{ validator: checkQueryFields, trigger: 'change' }],
  resultOutputCode: [{ required: true, message: '请选择结果输出', trigger: ['blur', 'change'] }],
};
const uploadRef = ref();

const dictMap = reactive({
  value: {},
});

/**
 * @description: 动态更新特征选项禁用状态
 * @param {*} computed
 * @return {*}
 */
const featureOptionsRef = computed(() => {
  const target = dictMap.value?.featureOptions || [];

  return target.map((item) => ({
    ...item,
    disabled: [
      ...Object.values(form.value.fields || {}),
      ...((form.value.resultOutputCode && [form.value.resultOutputCode]) || []),
    ].includes(item.featureCode),
  }));
});

onMounted(() => {
  handleDict();
  getDetail();
});

async function handleDict() {
  const featureOptionsRes = await getLibFeatureOptionsApi().catch(() => {});
  dictMap.value['featureOptions'] =
    (featureOptionsRes && featureOptionsRes.code === 200 && featureOptionsRes.data) || [];
}

async function getDetail() {
  if (!decisionNo) return;

  loading.value = true;
  const res = await getDecisionDetailApi(decisionNo)
    .catch(() => {})
    .finally(() => (loading.value = false));
  if (!res || res.code !== 200) return;

  updateFormValue(res);
}

function handleSelector(type) {
  selectorType.value = type;
  selectorVisible.value = true;
}

function handleSelectorConfrim(res) {
  if (selectorType.value === 0) {
    form.value.libFields = res;
  } else {
    form.value.queryFields = res;
  }

  if (selectorType.value === 0) {
    const libFieldsList = form.value.libFields.map((item) => item.featureCode);
    form.value.queryFields = (form.value.queryFields || []).filter((item) =>
      libFieldsList.includes(item.featureCode),
    );
    formRef.value.validateField('queryFields');
  }
  selectorVisible.value = false;
  formRef.value.validateField(selectorType.value === 0 ? 'libFields' : 'queryFields');
}

function handleTagClose(type, index) {
  (form.value[`${type === 0 ? 'libFields' : 'queryFields'}`] || []).splice(index, 1);
  if (type === 0) {
    const libFieldsList = form.value.libFields.map((item) => item.featureCode);
    form.value.queryFields = form.value.queryFields.filter((item) => libFieldsList.includes(item));
    formRef.value.validateField('queryFields');
  }
  formRef.value.validateField(type === 0 ? 'libFields' : 'queryFields');
}

/**
 * @description: 获取版本详情
 * @param {*} target  决策ID
 * @return {*}
 */
async function getVersionInfo(target) {
  if (!target) return;
  loading.value = true;
  const res = await getVersionInfoApi(target)
    .catch(() => {})
    .finally(() => (loading.value = false));
  if (!res || res.code !== 200) return;

  updateFormValue(res);
}

/**
 * @description: 删除版本
 * @return {*}
 */
async function handleDelVersion() {
  loading.value = true;
  const res = await deleteVersionApi(form.value.decisionId)
    .catch(() => {})
    .finally(() => (loading.value = false));
  if (!res || res.code !== 200) return;
  ElMessage.success('操作成功');
  if (versionOptions.value.length > 1) {
    getVersionInfo(
      versionOptions.value.filter((item) => item.decisionId !== form.value.decisionId)[0]
        .decisionId,
    );
  } else {
    handleClose();
  }
}

function handleClose() {
  proxy.$tab.closeOpenPage({
    path: '/decision',
    query: {
      type: 'list',
    },
  });
}

async function handleConfirm() {
  const valid = await formRef.value.validate();
  if (!valid) return;

  const confirm = await ElMessageBox.confirm('您确定提交吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).catch(() => {});
  if (!confirm) return;

  loading.value = true;
  const { queryType, matchType, libFields, queryFields } = form.value;

  const res = await (!decisionNo
    ? insertDecisionApi
    : !isAdding.value
    ? updateDecisionApi
    : addVersionApi)(
    Object.assign(
      {},
      {
        decisionNo,
        ...form.value,
        decisionId: !isAdding.value ? form.value.decisionId : '',
        decisionType: 'list',
        fieldsList: {
          queryType: queryType || '1',
          matchType: matchType || '1',
          libFields,
          queryFields,
        },
      },
      {
        queryType: undefined,
        matchType: undefined,
        libFields: undefined,
        queryFields: undefined,
      },
    ),
  )
    .catch(() => {})
    .finally(() => (loading.value = false));
  if (!res || res.code !== 200) return;

  ElMessage.success('操作成功');
  updateFormValue(res);
  formCp.value = JSON.parse(JSON.stringify(form.value));
  status.value = 0;
  handleClose();
}

function updateFormValue(res) {
  const { fieldsList } = res.data;
  const { matchType, queryType, libFields, queryFields } = fieldsList;
  form.value = { ...res.data, matchType, queryType, libFields, queryFields };
}
</script>

<style lang="scss" scoped>
.decision-list-detail {
  display: flex;
  flex-direction: column;
  height: 100%;

  .header {
    padding: 20px 20px 0;
  }

  .main {
    flex: 1;
    padding: 20px;
    overflow-y: auto;

    :deep(.el-form-item) {
      .el-form-item__label {
        font-weight: bold;
      }
    }

    .features {
      margin-top: 10px;

      .tags {
        flex: 1;
        margin-left: 10px;

        .el-tag {
          margin-right: 10px;
        }
      }
    }
  }

  .footer {
    box-shadow: var(--el-box-shadow-lighter);
    padding: 10px 20px;
  }
}
</style>
