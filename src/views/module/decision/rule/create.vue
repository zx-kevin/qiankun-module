<!--
 * @Author: K
 * @Date: 2023-02-22 18:21:15
 * @Descripttion: 决策管理 - 决策集 - 添加
 * @FilePath: \decision_engine_ui\src\views\module\decision\rule\create.vue
 * @LastEditors: K
 * @LastEditTime: 2023-04-19 09:08:46
-->
<template>
  <div class="decision-ruleset-create" v-loading="loading">
    <el-form
      class="search"
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      label-position="left"
    >
      <el-row :gutter="10">
        <el-col :span="12">
          <el-form-item label="规则名称" prop="decisionName">
            <el-input v-model="form.decisionName" maxlength="100" show-word-limit />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="规则描述" prop="decisionRemark">
            <el-input v-model="form.decisionRemark" maxlength="200" show-word-limit />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="12">
          <el-form-item label="规则版本">
            <el-select model-value="V1" disabled style="width: 100%">
              <el-option label="v1" value="v1"> </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="版本描述" prop="versionRemark">
            <el-input v-model="form.versionRemark" maxlength="200" show-word-limit />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <ruleset-collection
      ref="rulesetCollectionRef"
      class="ruleset"
      :data="rulesetData"
    ></ruleset-collection>

    <el-row class="footer" justify="space-between">
      <Plus class="add" @click="handleAddRule" />

      <div>
        <el-button size="large" @click="handleClose">取消</el-button>
        <el-button type="primary" size="large" @click="handleSave">保存</el-button>
      </div>
    </el-row>
  </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus';
import RulesetCollection from './components/RulesetCollection/index';
import { getDict, getDictSync } from '@/utils/dict';
import { ruleset2Data } from './utils';
import { featureLink } from '../utils';

import {
  insertDecisionApi, //  新增决策
} from '@/api/module/decision/ruleset';

import {
  getLibFeatureOptionsApi, //  查询特征库选择框选项
} from '@/api/module/feature';

const router = useRouter();
const { proxy } = getCurrentInstance();

const loading = ref(false);
const formRef = ref();
const form = reactive({});
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
const rulesetData = ref([]);
const rulesetCollectionRef = ref();
const dictMap = reactive({
  value: {},
});

onMounted(() => handleDict());

async function handleDict() {
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

function handleAddRule() {
  rulesetCollectionRef.value.add();
}

function handleClose() {
  proxy.$tab.closeOpenPage({
    path: '/decision',
    query: {
      type: 'rule',
    },
  });
}

async function handleSave() {
  const valid = await Promise.all([
    formRef.value.validate(),
    rulesetCollectionRef.value.validate(),
  ]);
  if (!valid) return;

  const confirm = await ElMessageBox.confirm('您确定提交吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).catch(() => {});
  if (!confirm) return;

  loading.value = true;
  const dataFormat = [];
  const featurePool = [];
  let resultOutputCode = ref('');

  rulesetData.value.forEach((item) => {
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

  const res = await insertDecisionApi({
    ...form,
    resultOutputCode: resultOutputCode.value,
    featurePool,
    decisionType: 'rule',
    decisionNodes: [...dataFormat],
  })
    .catch(() => {})
    .finally(() => (loading.value = false));
  if (!res || res.code !== 200) return;

  ElMessage.success('操作成功');
  handleClose();
}
</script>

<style lang="scss" scoped>
.decision-ruleset-create {
  height: 100%;
  display: flex;
  flex-direction: column;

  .search {
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
}
</style>
