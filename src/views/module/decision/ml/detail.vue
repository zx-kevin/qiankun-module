<!--
 * @Author: K
 * @Date: 2023-03-21 09:50:53
 * @Descripttion: 决策管理 - 机器学习 - 详情
 * @FilePath: \decision_engine_ui\src\views\module\decision\ml\detail.vue
 * @LastEditors: K
 * @LastEditTime: 2023-04-19 09:05:32
-->
<template>
  <div class="decision-ml-create" v-loading="loading">
    <el-row class="header" :gutter="10" justify="space-between" align="middle">
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
        <template v-else>
          <el-button @click="() => (status = 0)">取消新增版本</el-button>
          <el-button @click="handleConfirm">保存新增版本</el-button>
        </template>
      </el-row>
    </el-row>

    <el-scrollbar class="main">
      <el-form
        ref="formRef"
        :model="form.value"
        :rules="rules"
        label-width="120px"
        label-position="left"
      >
        <el-form-item label="模型名称" prop="decisionName">
          <el-input
            v-model="form.value.decisionName"
            placeholder="请填写模型名称"
            :disabled="isAdding"
          ></el-input>
        </el-form-item>
        <el-form-item label="模型描述" prop="decisionRemark">
          <el-input
            v-model="form.value.decisionRemark"
            placeholder="请填写模型描述"
            :disabled="isAdding"
          ></el-input>
        </el-form-item>
        <el-form-item label="版本描述" prop="versionRemark">
          <el-input v-model="form.value.versionRemark" placeholder="请填写版本描述"></el-input>
        </el-form-item>
        <el-form-item label="模型文件" prop="files">
          <upload-file
            ref="uploadRef"
            v-model="form.value.files"
            :limit="1"
            accept=".pmml"
            action="/decision/uploadPmml"
            style="width: 400px"
          ></upload-file>
        </el-form-item>
        <el-form-item v-if="form.value.fields" label="模型解析字段" required>
          <div class="fields">
            <div class="col">
              <div
                class="item"
                v-for="(item, key) of form.value.fields"
                :key="`field_item_${key}_left`"
                :title="key"
              >
                {{ key }}
              </div>
            </div>

            <div class="col">
              <div
                class="item"
                v-for="(item, key) of form.value.fields"
                :key="`field_item_${key}_center`"
              >
                <svg-icon icon-class="you"></svg-icon>
              </div>
            </div>

            <div class="col">
              <el-form-item
                class="item"
                v-for="(item, key) of form.value.fields"
                :key="`field_item_${key}_right`"
                :prop="`fields.${key}`"
                :rules="rules['fields.value']"
              >
                <el-select
                  v-model="form.value.fields[key]"
                  placeholder="请选择对应特征"
                  clearable
                  filterable
                  size="large"
                >
                  <el-option
                    v-for="item in featureOptionsRef"
                    :key="`feature_option_${item.featureId}`"
                    :label="item.featureName"
                    :value="item.featureCode"
                    :disabled="item.disabled"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="结果输出" prop="resultOutputCode">
          <el-select
            v-model="form.value.resultOutputCode"
            placeholder="请选择结果输出"
            clearable
            filterable
            size="large"
          >
            <el-option
              v-for="item in featureOptionsRef"
              :key="`result_feature_option_${item.featureId}`"
              :label="item.featureName"
              :value="item.featureCode"
              :disabled="item.disabled"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-scrollbar>

    <el-row v-if="status != 1" class="footer" justify="end">
      <el-button size="large" @click="handleClose">取消</el-button>
      <el-button type="primary" size="large" @click="handleConfirm">保存</el-button>
    </el-row>
  </div>
</template>

<script setup>
import UploadFile from '@/components/UploadFile';
import { ElMessage } from 'element-plus';
import { getDictSync } from '@/utils/dict';
import { featureLink } from '../utils';

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

const status = ref(0);
const isAdding = computed(() => status.value === 1);
watch(isAdding, (val) => {
  if (val) {
    formCp.value = JSON.parse(JSON.stringify(form.value));
    form.value = {
      decisionName: formCp.value.decisionName,
      decisionRemark: formCp.value.decisionRemark,
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
    const latestVersion = (formCp.value?.versionList || []).reduce((res, item) => {
      if (!res) return item;
      if (new Date(item.createTime) > new Date(res.createTime)) return item;
      return res;
    }, null);
    return !decisionNo
      ? 'V1'
      : isAdding.value
      ? `V${(Number(latestVersion?.versionNo?.split('V')?.[1]) || 0) + 1}`
      : form.value.versionNo;
  },
  set(val) {
    if (val === (form.value?.versionNo ?? '')) return;
    getVersionInfo(versionOptions.value.find((item) => item.versionNo === val)?.['decisionId']);
  },
});

/**
 * @description: 校验 - 模型解析字段
 * @param {*} field
 * @param {*} value
 * @param {*} callback
 * @return {*}
 */
const checkFieldsValue = ({ field }, value, callback) => {
  const val = field.split('.').reduce((res, item) => {
    return res ? res[item] : null;
  }, form.value);
  callback(!val ? new Error('请选择对应特征') : undefined);
};
/**
 * @description: 校验 - 模型文件
 * @param {*} rule
 * @param {*} value
 * @param {*} callback
 * @return {*}
 */
const checkFile = (rule, value, callback) => {
  const listRef = uploadRef.value?.fileList?.[0]?.fields || [];
  callback(
    !Object.keys(form.value.fields || {}).length && !listRef.length
      ? new Error('模型解析失败，请重新上传模型文件')
      : undefined,
  );
};
const rules = {
  decisionName: [
    { required: true, message: '请填写模型名称', trigger: ['blur', 'change'] },
    { max: 100, message: '输入长度不能大于100', trigger: ['blur', 'change'] },
  ],
  decisionRemark: [
    { required: true, message: '请填写模型描述', trigger: ['blur', 'change'] },
    { max: 200, message: '输入长度不能大于200', trigger: ['blur', 'change'] },
  ],
  files: [
    { required: true, message: '请上传模型文件', trigger: ['blur', 'change'] },
    { validator: checkFile, trigger: ['blur', 'change'] },
  ],
  'fields.value': [{ validator: checkFieldsValue, trigger: ['blur', 'change'] }],
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
  const target = (dictMap.value?.featureOptions || []).filter(
    (item) => item.featureValueType === 'number',
  );

  return target.map((item) => ({
    ...item,
    disabled: [
      ...Object.values(form.value.fields || {}),
      ...((form.value.resultOutputCode && [form.value.resultOutputCode]) || []),
    ].includes(item.featureCode),
  }));
});

watch(
  () => form.value.files,
  (val) => {
    form.value['fieldsMl'] = {
      mlPath: uploadRef.value?.fileList?.[0]?.url || val || '',
      fileName: uploadRef.value?.fileList?.[0]?.name || val?.slice(val.lastIndexOf('/') + 1) || '',
    };
    if (!val) {
      form.value['fields'] = null;
    } else {
      const listRef = uploadRef.value?.fileList?.[0]?.fields || [];
      if (listRef.length)
        form.value['fields'] = listRef.reduce((res, item) => {
          res[item] = '';
          return res;
        }, {});
    }
  },
);

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
      type: 'ml',
    },
  });
}

async function handleConfirm() {
  const valid = await formRef.value.validate();
  if (!valid) return;

  // loading.value = true;
  form.value.fieldsMl.modelFields = Object.keys(form.value.fields).reduce((res, key) => {
    const featureItem = featureOptionsRef.value.find(
      (item) => item.featureCode === form.value.fields[key],
    );
    res.push({
      ...featureItem,
      mlFeature: key,
    });
    return res;
  }, []);
  const featurePool = featureOptionsRef.value.filter(
    (item) => item.disabled && item.featureCode !== form.value.resultOutputCode,
  );
  const links = [];
  const poolMaps = featurePool.map((item) => item.featureCode);
  featurePool.forEach((item) => {
    links.push(
      ...featureLink(item, dictMap.value.featureOptions).filter(
        (fil) => !poolMaps.includes(fil.featureCode),
      ),
    );
  });
  featurePool.push(...links);

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
        decisionType: 'ml',
        featurePool,
      },
      {
        fields: undefined,
        files: undefined,
      },
    ),
  )
    .catch(() => {})
    .finally(() => (loading.value = false));
  if (!res || res.code !== 200) return;

  ElMessage.success('操作成功');
  if (!decisionNo) {
    handleClose();
    return;
  }
  updateFormValue(res);
  status.value = 0;
}

function updateFormValue(res) {
  form.value = res.data;
  form.value.files = res.data.fieldsMl.mlPath;
  form.value.fields = res.data.fieldsMl.modelFields.reduce((res, item) => {
    res[item.mlFeature] = item.featureCode;
    return res;
  }, {});
  formCp.value = JSON.parse(JSON.stringify(form.value));
}
</script>

<style lang="scss" scoped>
.decision-ml-create {
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

    .fields {
      display: flex;

      .col {
        margin-left: 20px;

        &:first-of-type {
          .item {
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        .item {
          line-height: 40px;
          margin-bottom: 20px;
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
