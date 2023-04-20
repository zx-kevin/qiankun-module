<!--
 * @Author: K
 * @Date: 2023-03-02 19:57:57
 * @Descripttion: 决策管理 - 决策集 - 编辑
 * @FilePath: \decision_engine_ui\src\views\module\decision\rule\update.vue
 * @LastEditors: K
 * @LastEditTime: 2023-04-19 09:02:22
-->
<template>
  <div class="decision-ruleset-update" v-loading="loading">
    <el-form ref="formRef" class="form" :model="detail.value" :rules="rules" label-width="80px">
      <el-row :gutter="10">
        <el-col :span="12">
          <el-form-item label="规则名称" prop="decisionName">
            <el-input
              v-model="detail.value.decisionName"
              :disabled="isAdding"
              maxlength="100"
              show-word-limit
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="规则描述" prop="decisionRemark">
            <el-input
              v-model="detail.value.decisionRemark"
              :disabled="isAdding"
              maxlength="200"
              show-word-limit
            ></el-input>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="8">
          <el-form-item label="规则状态" prop="decisionStatus">
            <el-select
              v-model="detail.value.decisionStatus"
              style="width: 100%"
              :disabled="isAdding"
            >
              <el-option
                v-for="item in dictMap.value['sys_normal_disable']"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col> -->
      </el-row>
      <el-row justify="space-around">
        <el-row class="line">
          <el-form-item label="规则版本" prop="versionNo">
            <el-select v-model="currentVersion" :disabled="isAdding">
              <el-option
                v-for="item in versionOptions"
                :key="`version_${item.versionNo}`"
                :label="item.versionNo"
                :value="item.versionNo"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="版本描述" prop="versionRemark" style="flex: 1">
            <el-input
              v-model="detail.value.versionRemark"
              maxlength="200"
              show-word-limit
              style="width: 100%"
            ></el-input>
          </el-form-item>
        </el-row>

        <el-row justify="end" style="margin-left: 10px">
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
    </el-form>

    <ruleset-collection
      v-if="detail.value.decisionNodes"
      ref="rulesetCollectionRef"
      class="ruleset"
      :data="isAdding ? addingDatas : detail.value.decisionNodes"
      :featurePool="isAdding ? addingFeaturePool : detail.value.featurePool"
      :resultCode="isAdding ? addingResultOutputCode : detail.value.resultOutputCode"
    ></ruleset-collection>

    <el-row class="footer" justify="space-between">
      <Plus class="add" @click="handleAddRule" />
      <div>
        <template v-if="status != 1">
          <el-button size="large" @click="handleClose">取消</el-button>
          <el-button type="primary" size="large" @click="handleConfirm">保存</el-button>
        </template>
      </div>
    </el-row>
  </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus';
import RulesetCollection from './components/RulesetCollection/index';
import { getDictSync, getDict } from '@/utils/dict';
import { ruleset2Data } from './utils';
import { featureLink } from '../utils';

import {
  getLibFeatureOptionsApi, //  查询特征库选择框选项
} from '@/api/module/feature';

const router = useRouter();
const { decisionNo } = router.currentRoute.value.params;
const { proxy } = getCurrentInstance();
const rulesetCollectionRef = ref();

import {
  getDecisionDetailApi, //  查询决策详细
  updateDecisionApi, //  修改决策
  addVersionApi, //  新增决策版本
  deleteVersionApi, //  删除版本
  getVersionInfoApi, //  查询决策版本详细
} from '@/api/module/decision/ruleset';

const loading = ref(false);
const formRef = ref();
const detail = reactive({
  value: {},
});
const rules = {
  decisionName: [
    { required: true, message: '请填写规则名称', trigger: ['blur', 'change'] },
    { max: 100, message: '输入长度不能大于100', trigger: ['blur', 'change'] },
  ],
  decisionRemark: [
    { required: true, message: '请填写规则描述', trigger: ['blur', 'change'] },
    { max: 200, message: '输入长度不能大于200', trigger: ['blur', 'change'] },
  ],
};
const versionOptions = computed(() => detail.value?.versionList || []);
const versionRemarkCp = ref('');

const currentVersion = computed({
  get() {
    const latestVersion = (detail.value?.versionList || []).reduce((res, item) => {
      if (!res) return item;
      if (new Date(item.createTime) > new Date(res.createTime)) return item;
      return res;
    }, null);
    return isAdding.value
      ? `V${(Number(latestVersion?.versionNo?.split('V')?.[1]) || 0) + 1}`
      : detail.value.versionNo;
  },
  set(val) {
    if (val === (detail.value?.versionNo ?? '')) return;
    getVersionInfo(versionOptions.value.find((item) => item.versionNo === val)?.['decisionId']);
  },
});

const status = ref(0);
const isAdding = computed(() => status.value === 1);
watch(isAdding, (val) => {
  if (val) {
    versionRemarkCp.value = detail.value.versionRemark;
    detail.value.versionRemark = '';
    rulesetCollectionRef.value.update();
  } else {
    addingDatas.value = [];
    addingFeaturePool.value = [];
    addingResultOutputCode.value = '';
    detail.value.versionRemark = versionRemarkCp.value;
  }
});
const addingDatas = ref([]);
const addingFeaturePool = ref([]);
const addingResultOutputCode = ref('');

/**
 * @description: 添加规则
 * @return {*}
 */
function handleAddRule() {
  rulesetCollectionRef.value.add();
}

/**
 * @description: 删除版本
 * @return {*}
 */
async function handleDelVersion() {
  loading.value = true;
  const res = await deleteVersionApi(detail.value.decisionId)
    .catch(() => {})
    .finally(() => (loading.value = false));
  if (!res || res.code !== 200) return;
  ElMessage.success('操作成功');
  if (versionOptions.value.length > 1) {
    getVersionInfo(
      versionOptions.value.filter((item) => item.decisionId !== detail.value.decisionId)[0]
        .decisionId,
    );
  } else {
    handleClose();
  }
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

  detail.value = res.data;
  rulesetCollectionRef.value.update();
}

/**
 * @description: 关闭当前页面
 * @return {*}
 */
function handleClose() {
  proxy.$tab.closeOpenPage({
    path: '/decision',
    query: {
      type: 'rule',
    },
  });
}

async function dataFormatter() {
  const dataFormat = [];
  const featurePool = [];
  let resultOutputCode = ref('');

  (!isAdding.value ? detail.value.decisionNodes : addingDatas.value).forEach((item) => {
    dataFormat.push(ruleset2Data(item, featurePool, resultOutputCode, dictMap.value));
  });

  const linkFeatures = dictMap.value.featuresTypeEnum
    .filter((item) => ['接口', 'SQL', '衍生'].includes(item.label))
    .map((item) => item.value);

  featurePool
    .filter((item) => linkFeatures.includes(item.featureType))
    .forEach((item) => {
      const links = featureLink(item, dictMap.value.featureOptions || []);
      featurePool.push(
        ...links.filter((res) => !featurePool.find((pool) => pool.featureCode === res.featureCode)),
      );
    });

  return {
    decisionId: !isAdding.value ? detail.value.decisionId : '',
    featurePool,
    resultOutputCode: resultOutputCode.value,
    decisionNodes: [...dataFormat],
  };
}

/**
 * @description: 保存提交
 * @return {*}
 */
async function handleConfirm() {
  const valid = await Promise.all([
    formRef.value.validate(),
    rulesetCollectionRef.value.validate(),
  ]);
  if (!valid) return;

  const confirm = await ElMessageBox.alert(
    '您确定提交吗？提交之后可继续在当前页面进行操作',
    '提示',
    {
      confirmButtonText: '确定',
      showCancelButton: true,
      cancelButtonText: '取消',
    },
  ).catch(() => {});
  if (!confirm) return;

  loading.value = true;
  const dataResult = await dataFormatter();

  let res = await (!isAdding.value ? updateDecisionApi : addVersionApi)({
    ...detail.value,
    ...dataResult,
  })
    .catch(() => {})
    .finally(() => (loading.value = false));
  if (!res || res.code !== 200) return;

  ElMessage.success('操作成功');
  detail.value = res.data;
  versionRemarkCp.value = res.data.versionRemark;
  status.value = 0;
  rulesetCollectionRef.value.update();
}

/**
 * @description: 初始获取决策信息
 * @param {*} target
 * @return {*}
 */
async function init(target) {
  loading.value = true;
  const res = await getDecisionDetailApi(target)
    .catch(() => {})
    .finally(() => (loading.value = false));

  if (!res || res.code !== 200) return;
  detail.value = res.data;
}

const dictMap = reactive({
  value: {},
});
async function getDicts() {
  dictMap.value = Object.assign(
    {},
    await getDictSync(
      'sys_normal_disable', //  系统开关
    ),
    {
      expressionNode: await getDict('condition_node_enum', '条件表达式节点'),
      resultNode: await getDict('decision_node_enum', '结果节点'),
      elseConditionNode: await getDict('decision_node_enum', '其它节点'),
      featuresTypeEnum: (await getDictSync('features_type_enum'))?.['features_type_enum'] || [],
      featureOptions:
        (await getLibFeatureOptionsApi().catch(() => {}))?.data?.map((item) => ({
          ...item,
          key: item.featureId,
          label: item.featureName,
          value: item.featureCode,
        })) || [],
    },
  );
}

onMounted(() => {
  getDicts();
  init(decisionNo);
});
</script>

<style lang="scss" scoped>
.decision-ruleset-update {
  display: flex;
  flex-direction: column;
  height: 100%;

  .form {
    padding: 20px 20px 0;
  }

  .ruleset {
    flex: 1;
    padding: 0 20px 20px;
  }

  .footer {
    margin-top: 20px;
    box-shadow: var(--el-box-shadow-lighter);
    padding: 10px 20px;

    .add {
      border-radius: 50%;
      background-color: #409eff;
      color: #fff;
      width: 30px;
      height: 30px;
      padding: 5px;
      cursor: pointer;
      position: relative;
      top: 50%;
      transform: translate(0, -50%);
    }
  }

  .line {
    display: flex;
    align-items: center;
    width: 100%;
    flex: 1;
    overflow: hidden;
  }

  .tips {
    color: #677999;
    font-size: 14px;
    margin-left: 10px;
    margin-bottom: 18px;
    overflow: hidden;
    flex: 1;
    text-overflow: ellipsis;
  }
}
</style>
