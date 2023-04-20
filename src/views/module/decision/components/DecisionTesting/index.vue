<template>
  <el-dialog title="决策测试" v-model="dialogVisible" width="600" align-center>
    <div v-if="!noVersion && detail.value.versionList" class="versions">
      <el-select v-model="currentVersion" placeholder="请选择决策版本">
        <el-option
          v-for="item in detail.value.versionList"
          :key="item.versionId"
          :label="item.versionNo"
          :value="item.decisionId"
        >
        </el-option>
      </el-select>
    </div>
    <div class="decision-testing" v-loading="loading">
      <el-form
        v-if="featurePoolFormatter.length"
        class="features"
        ref="formRef"
        :model="form.value"
        label-width="0"
      >
        <el-form-item
          v-for="(item, index) in featurePoolFormatter"
          class="item line"
          :key="`feature_item${index}`"
        >
          <p class="name" :title="item.featureName">{{ item.featureName }}</p>
          <el-icon><ArrowRightBold /> </el-icon>
          <el-form-item class="value_box" :prop="item.featureCode" :rules="rules.value">
            <el-date-picker
              v-if="item.featureValueType === 'time'"
              class="value"
              v-model="form.value[item.featureCode]"
              value-format="YYYY-MM-DD HH:mm:ss"
              type="datetime"
              placeholder="请选择日期时间"
            ></el-date-picker>
            <el-input
              v-else
              class="value"
              v-model="form.value[item.featureCode]"
              maxlength="200"
              show-word-limit
            ></el-input>
            <p class="tip">{{ featureTipFormatter(item) }}</p>
          </el-form-item>
        </el-form-item>
      </el-form>

      <div v-if="result" class="result line">
        <p class="name">结果：</p>
        <el-icon><ArrowRightBold /> </el-icon>
        <p class="value">{{ result }}</p>
      </div>
    </div>
    <template #footer>
      <el-button type="success" :icon="CaretRight" @click="handleTest">调试</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { CaretRight, ArrowRightBold } from '@element-plus/icons-vue';
import { getDictSync } from '@/utils/dict';

import {
  getDecisionDetailApi, //  查询决策详细
  getVersionInfoApi, //  查询决策版本详细
  testDecisionApi, //  决策测试
} from '@/api/module/decision/ruleset';

defineExpose({ open, close });

const props = defineProps({
  formatter: Function,
  noVersion: Boolean,
});
const { formatter } = toRefs(props);

const loading = ref(false);
const dialogVisible = ref(false);
const detail = reactive({
  value: {},
});
const formRef = ref();
const form = reactive({
  value: {},
});
const result = ref('');
const currentVersion = computed({
  get() {
    return detail.value.decisionId;
  },
  set(val) {
    getVersionInfo(val);
  },
});
const dictMap = reactive({
  value: {},
});

const featurePoolFormatter = computed(() => {
  return (detail.value.featurePool || []).filter(
    (item) => !['sql', 'api', 'gen'].includes(item.featureType),
  );
});

const validateValue = ({ field }, value, callback) => {
  const valueType =
    detail.value.featurePool?.find((item) => item.featureCode === field)?.featureValueType || '';
  const label =
    dictMap.value.value_type_enum?.find((item) => item.value === valueType)?.label || '';
  callback((tipsMap[label]?.validate && tipsMap[label]?.validate(form.value[field])) || undefined);
};
const rules = {
  value: [{ validator: validateValue, trigger: 'change' }],
};

const tipsMap = {
  数组: { tip: '逗号分割数据 如:输入 1,2,3 表示[1,2,3]' },
  数值: {
    validate: (value) => {
      if (!value) return null;
      if (!/^\d+(\.\d+)?$/.test(value)) {
        return new Error('只能输入数字');
      }
      return null;
    },
  },
  布尔值: {
    validate: (value) => {
      if (!value) return null;
      if (String(value) != 'true' && String(value) != 'false') {
        return new Error('只能输入true/false');
      }
      return null;
    },
  },
};

const featureTipFormatter = ({ featureValueType }) => {
  const res = ref('');

  watchEffect(() => {
    if (!featureValueType) {
      res.value = '';
      return;
    }

    const label =
      dictMap.value.value_type_enum?.find((item) => item.value === featureValueType)?.label || '';
    if (!label) {
      res.value = '';
      return;
    }

    res.value = tipsMap[label]?.tip || '';
  });

  return res.value;
};

watch(dialogVisible, (val) => {
  if (!val) {
    detail.value = {};
    form.value = {};
    result.value = '';
  } else {
    if (detail.value.decisionNo) getDetail();
  }
});

onMounted(async () => {
  dictMap.value = await getDictSync('value_type_enum');
});

function open(attrs = {}) {
  dialogVisible.value = true;
  detail.value = attrs;
}

function close(attrs = {}) {
  dialogVisible.value = false;
}

async function getDetail() {
  loading.value = true;
  const res = await getDecisionDetailApi(detail.value.decisionNo)
    .catch(() => {})
    .finally(() => (loading.value = false));
  if (!res || res.code !== 200) return;

  detail.value = res.data;
}

/**
 * @description: 获取版本详情
 * @param {*} target  决策ID
 * @return {*}
 */
async function getVersionInfo(target) {
  if (!target) return;
  result.value = '';
  loading.value = true;
  const res = await getVersionInfoApi(target)
    .catch(() => {})
    .finally(() => (loading.value = false));
  if (!res || res.code !== 200) return;

  detail.value = res.data;
}

async function handleTest() {
  if (formRef.value) {
    const valid = await formRef.value.validate();
    if (!valid) return;
  }

  loading.value = true;
  const res = await testDecisionApi({
    decisionId: detail.value.decisionId,
    input: (detail.value.featurePool || []).reduce((res, item) => {
      res[item.featureCode] = form.value[item.featureCode] || '';
      return res;
    }, {}),
  })
    .catch(() => {})
    .finally(() => (loading.value = false));

  if (!res || res.code !== 200) return;
  result.value =
    (formatter.value && formatter.value(res.data)) || JSON.stringify(res.data, null, 4);
}
</script>

<style lang="scss" scoped>
.decision-testing {
  .features {
    margin-top: 20px;
    max-height: 300px;
    overflow-y: auto;
  }

  .result {
    margin-top: 50px;
    border: 1px solid #dcdfe6;
    padding: 10px;
    border-radius: 6px;

    .name {
      width: 70px !important;
    }
  }

  .line {
    display: flex;
    justify-content: space-between;

    .name {
      width: 80px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .el-icon {
      margin: 0 20px;
      height: 20px;
    }

    .value {
      flex: 1;
      white-space: pre;
    }

    .value_box {
      flex: 1;
      position: relative;

      :deep(.value) {
        width: 100%;
      }

      .tip {
        position: absolute;
        left: 0;
        top: 100%;
        padding-top: 2px;
        font-size: 12px;
        color: #c8c9cc;
        line-height: 15px;
      }
    }
  }
}
</style>
