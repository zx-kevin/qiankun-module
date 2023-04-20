表达式节点
<!--
 * @Author: K
 * @Date: 2023-03-13 16:36:03
 * @Descripttion: 决策管理 - 决策树 - 更新
 * @FilePath: \decision_engine_ui\src\views\module\decision\tree\update.vue
 * @LastEditors: K
 * @LastEditTime: 2023-04-19 09:04:18
-->
<template>
  <div class="decision-tree-update" v-loading="loading">
    <el-form ref="formRef" class="form" :rules="rules" :model="detail.value" label-width="80px">
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
      <el-row justify="space-between">
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

    <div class="main">
      <Graph ref="graphRef" snapline @events="onGraphEvents"></Graph>
    </div>

    <el-row class="footer" justify="space-between" align="middle">
      <el-form ref="resultFormRef" :model="resultForm" :rules="resultRules" label-width="0">
        <el-row :gutter="10" align="middle">
          <el-col :span="10">
            <el-form-item prop="result">
              <el-select v-model="resultForm.result" placeholder="请选择结果输出">
                <el-option
                  v-for="(item, index) in dictMap['featuresOptions']"
                  :key="`result_feature_${index}`"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="1">=</el-col>

          <el-col :span="10">
            <el-input placeholder="结果输出" disabled></el-input>
          </el-col>
        </el-row>
      </el-form>
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
import { getDictSync, getDict } from '@/utils/dict';
import { Graph, useGraphState, StringExt } from '@/components/WorkFlow';
import { ElMessage, ElMessageBox } from 'element-plus';
import { decisionValidate, handleSetter } from './utils';
import { featureLink } from '../utils';

import {
  getDecisionDetailApi, //  查询决策详细
  updateDecisionApi, //  修改决策
  addVersionApi, //  新增决策版本
  deleteVersionApi, //  删除版本
  getVersionInfoApi, //  查询决策版本详细
} from '@/api/module/decision/ruleset';
import {
  getLibFeatureOptionsApi, //  查询特征库选择框选项
} from '@/api/module/feature';

const router = useRouter();
const { decisionNo } = router.currentRoute.value.params;
const { proxy } = getCurrentInstance();
const { setGraph, setGraphData, dataHook, center } = useGraphState();

const dictMap = reactive({
  value: {},
});

const loading = ref(false);
const graphRef = ref();
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
const decisionData = reactive({
  value: {},
});
watch(
  () => decisionData.value,
  (obj) => setGraphData(decisionData.value),
  { deep: true },
);
const resultFormRef = ref();
const resultForm = reactive({
  result: '',
});
const resultRules = {
  result: { required: true, message: '请选择结果输出', trigger: ['blur', 'change'] },
};
const versionRemarkCp = ref('');

dataHook.setter = (target) => handleSetter(target, dictMap);
const versionOptions = computed(() => detail.value?.versionList || []);
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
const addingDatas = reactive({
  value: {},
});

watch(
  () => addingDatas.value,
  (obj) => isAdding.value && setGraphData(addingDatas.value),
  { deep: true },
);
const isAdding = computed(() => status.value === 1);
function initAddingData() {
  const module = {
    ...conditionNodeModule(),
    children: [],
  };
  addingDatas.value = { ...module };
}
watch(isAdding, (val) => {
  if (val) {
    versionRemarkCp.value = detail.value.versionRemark;
    detail.value.versionRemark = '';
    resultForm.result = '';
    setTimeout(() => resultFormRef.value.clearValidate());
    initAddingData();
    setGraphData(addingDatas.value);
  } else {
    addingDatas.value = {};
    resultForm.result = detail.value.resultOutputCode;
    setGraphData(decisionData.value);
    detail.value.versionRemark = versionRemarkCp.value;
  }
});

onMounted(async () => {
  await getDicts();
  init(decisionNo);
  setGraph(graphRef.value.graph);
  graphRef.value.graph.centerContent();
});

async function getDicts() {
  dictMap.value = Object.assign(
    {},
    await getDictSync(
      'sys_normal_disable', //  系统开关
    ),
  );

  dictMap['conditionNodeEnum'] =
    (await getDict('decision_flow_node_type_enum', '条件节点').catch(() => {})) || '';
  dictMap['decisionResultNodeEnum'] =
    (await getDict('decision_node_enum', '结果节点').catch(() => {})) || '';
  dictMap['decisionAndNodeEnum'] =
    (await getDict('condition_node_enum', '并且节点').catch(() => {})) || '';
  dictMap['decisionOrNodeEnum'] =
    (await getDict('condition_node_enum', '或者节点').catch(() => {})) || '';
  dictMap['decisionArithNodeEnum'] =
    (await getDict('condition_node_enum', '条件表达式节点').catch(() => {})) || '';

  const res = await getLibFeatureOptionsApi().catch(() => {});
  dictMap['featuresOptions'] =
    !res || res.code !== 200
      ? []
      : res.data.map((item) => ({
          ...item,
          key: item.featureId,
          label: item.featureName,
          value: item.featureCode,
        }));
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
  resultForm.result = res.data.resultOutputCode;
  decisionData.value = res.data.decisionNodes[0];
  decisionData.value.nodeProps.conditionExpr = '';
}

function handleClose() {
  proxy.$tab.closeOpenPage({
    path: '/decision',
    query: {
      type: 'tree',
    },
  });
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
  resultForm.result = res.data.resultOutputCode;
  decisionData.value = res.data.decisionNodes[0];
  decisionData.value.nodeProps.conditionExpr = '';
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

function onGraphEvents({ type }, attrs) {
  switch (type) {
    case 'remove':
      handleNodeRemove(attrs);
      break;
    case 'condition':
      handleAddCondition(attrs);
      break;
    case 'result':
      handleAddResult(attrs);
      break;
    case 'conditions_update':
      handleNodeUpdate(attrs);
      break;
    case 'value_update':
      handleNodeValueUpdate(attrs);
      break;
  }
}

/**
 * @description: 初始化数据
 * @return {*}
 */
const conditionNodeModule = () => ({
  nodeType: dictMap['conditionNodeEnum'],
  nodeProps: {
    nodeType: dictMap['conditionNodeEnum'],
    conditionNodes: {
      nodeType: dictMap['decisionAndNodeEnum'],
      children: [],
    },
  },
  children: [],
});
const resultNodeModule = () => ({
  nodeType: dictMap['decisionResultNodeEnum'],
  nodeProps: {
    nodeType: dictMap['decisionResultNodeEnum'],
    result: '',
  },
  children: [],
});

/**
 * @description: 遍历寻找目标ID节点
 * @param {*} id
 * @param {*} target
 * @return {*}
 */
function finder(
  id,
  opt = { parent: false },
  target = isAdding.value ? addingDatas.value : decisionData.value,
) {
  if (!opt.parent && target.id === id) return target;
  if (opt.parent && target.children.find((item) => item.id === id)) return target;
  return (target?.children || []).reduce((res, item) => res || finder(id, opt, item), null);
}

function checkNode(target, opt) {
  if (!target) return;
  if (target.error) decisionValidate(target, opt, dictMap);
}

/**
 * @description: 添加条件节点
 * @param {*} node  发起节点
 * @return {*}
 */
function handleAddCondition({ rule, error }) {
  const target = finder(rule.id);
  if (!target) return;
  const res = { ...conditionNodeModule() };
  if (!target.children) target.children = [];
  target.children.push(res);
  checkNode(target);
}

/**
 * @description: 添加结果节点
 * @param {*} id
 * @return {*}
 */
function handleAddResult({ id }) {
  const target = finder(id);
  if (!target) return;
  const res = { ...resultNodeModule() };
  if (!target.children) target.children = [];
  target.children.push(res);
  checkNode(target, { single: true });
}

/**
 * @description: 条件节点数据更新
 * @param {*} id
 * @param {*} rule
 * @return {*}
 */
function handleNodeUpdate({ id, rule, width, height, error }) {
  let target = finder(id);
  if (!target) return;
  if (rule) target['nodeProps'] = rule['nodeProps'];
  target['size'] = {
    width,
    height,
  };
  checkNode(target);
}

/**
 * @description: 结果节点数据更新
 * @param {*} id
 * @param {*} value
 * @return {*}
 */
function handleNodeValueUpdate({ id, value }) {
  const target = finder(id);
  if (!target) return;
  target.nodeProps.result = value;
  checkNode(target);
}

/**
 * @description: 节点删除
 * @param {*} id  目标节点ID
 * @return {*}
 */
function handleNodeRemove({ id }) {
  const target = finder(id, { parent: true });
  if (!target) return;
  const index = target.children?.findIndex((item) => item.id === id);
  if (index !== -1) target.children.splice(index, 1);
  checkNode(target);
}

const featurePoolHandler = (target) => {
  const result = [];
  const { nodeType, nodeProps, children } = target;
  if (nodeType === dictMap['conditionNodeEnum']) {
    //  条件节点
    (nodeProps.conditionNodes.children ?? []).forEach((item) =>
      result.push(...featurePoolHandler(item)),
    );
    (children ?? []).forEach((item) => result.push(...featurePoolHandler(item)));
  } else if ([dictMap['decisionAndNodeEnum'], dictMap['decisionOrNodeEnum']].includes(nodeType)) {
    //  并且/或者节点
    (children ?? []).forEach((item) => result.push(...featurePoolHandler(item)));
  } else if (nodeType === dictMap['decisionArithNodeEnum']) {
    //  表达式节点
    ['left', 'right'].forEach((key) => {
      if (nodeProps[`${key}FeatureType`] === 'value') return;
      const add = dictMap['featuresOptions'].find(
        (item) => item.value === nodeProps[`${key}FeatureCode`],
      );
      if (!add || result.find((item) => item.value === add.value)) return;
      result.push(add);
      result.push(...featureLink(add, dictMap['featuresOptions'] || []));
    });
  }

  return result;
};

/**
 * @description: 提交
 * @return {*}
 */
async function handleConfirm() {
  const target = JSON.parse(
    JSON.stringify(!isAdding.value ? decisionData.value : addingDatas.value),
  );
  const valid = await Promise.all([
    formRef.value.validate(),
    resultFormRef.value.validate(),
    decisionValidate(target, null, dictMap).catch((e) => {
      if (e && e.length) center(e[0]);
      throw new Error();
    }),
  ]).catch(() => {});

  if (!isAdding.value) {
    decisionData.value = target;
  } else {
    addingDatas.value = target;
  }
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
  const featurePool = featurePoolHandler(decisionData.value).reduce((res, item) => {
    if (!res.find((i) => i.featureCode === item.featureCode)) res.push(item);
    return res;
  }, []);

  const res = await (!isAdding.value ? updateDecisionApi : addVersionApi)({
    ...detail.value,
    decisionId: !isAdding.value ? detail.value.decisionId : '',
    decisionType: 'tree',
    featurePool,
    decisionNodes: [!isAdding.value ? decisionData.value : addingDatas.value],
    resultOutputCode: resultForm.result,
  })
    .catch(() => {})
    .finally(() => (loading.value = false));
  if (!res || res.code !== 200) return;
  ElMessage.success('操作成功');
  detail.value = res.data;
  resultForm.result = res.data.resultOutputCode;
  decisionData.value = res.data.decisionNodes[0];
  decisionData.value.nodeProps.conditionExpr = '';
  status.value = 0;
}
</script>

<style lang="scss" scoped>
.decision-tree-update {
  display: flex;
  flex-direction: column;
  height: 100%;

  .form {
    padding: 20px 20px 0;
  }

  .main {
    flex: 1;
    padding: 0 20px;
  }

  .footer {
    margin-top: 20px;
    box-shadow: var(--el-box-shadow-lighter);
    padding: 10px 20px 15px;

    .el-form-item {
      margin-bottom: 0;
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
    line-height: 32px;
    margin-left: 10px;
    margin-bottom: 18px;
    overflow: hidden;
    flex: 1;
    text-overflow: ellipsis;
  }
}
</style>
