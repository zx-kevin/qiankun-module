<!--
 * @Author: K
 * @Date: 2023-02-27 14:15:21
 * @Descripttion: 决策管理 - 决策树 - 添加
 * @FilePath: \decision_engine_ui\src\views\module\decision\tree\create.vue
 * @LastEditors: K
 * @LastEditTime: 2023-04-19 09:10:29
-->
<template>
  <div class="decision-tree-create" v-loading="loading">
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
        <el-button size="large" @click="handleClose">取消</el-button>
        <el-button type="primary" size="large" @click="handleSave">保存</el-button>
      </div>
    </el-row>
  </div>
</template>

<script setup>
import { Graph, useGraphState, StringExt } from '@/components/WorkFlow';
import { getDict } from '@/utils/dict';
import { ElMessage, ElMessageBox } from 'element-plus';
import { decisionValidate, handleSetter } from './utils';
import { featureLink } from '../utils';
import {
  insertDecisionApi, //  新增决策
} from '@/api/module/decision/ruleset';
import {
  getLibFeatureOptionsApi, //  查询特征库选择框选项
} from '@/api/module/feature';

const { setGraph, setGraphData, dataHook, center } = useGraphState();

const { proxy } = getCurrentInstance();
const loading = ref(false);
const dictMap = reactive({});
const graphRef = ref();
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
const resultFormRef = ref();
const resultForm = reactive({
  result: '',
});
const resultRules = {
  result: { required: true, message: '请选择结果输出', trigger: ['blur', 'change'] },
};

const decisionData = reactive({
  value: {},
});

dataHook.setter = (target) => handleSetter(target, dictMap);

watch(
  () => decisionData.value,
  (obj) => setGraphData(decisionData.value),
  { deep: true },
);

onMounted(async () => {
  await setupDict();
  init();
  setGraph(graphRef.value.graph);
  graphRef.value.graph.centerContent();
});

function handleClose() {
  proxy.$tab.closeOpenPage({
    path: '/decision',
    query: {
      type: 'tree',
    },
  });
}

/**
 * @description: 字典数据
 * @return {*}
 */
async function setupDict() {
  dictMap['conditionNodeEnum'] =
    (await getDict('decision_flow_node_type_enum', '条件节点').catch(() => {})) || '';
  dictMap['decisionAndNodeEnum'] =
    (await getDict('condition_node_enum', '并且节点').catch(() => {})) || '';
  dictMap['decisionResultNodeEnum'] =
    (await getDict('decision_node_enum', '结果节点').catch(() => {})) || '';
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

function init() {
  const module = {
    ...conditionNodeModule(),
    id: StringExt.uuid(),
    children: [],
  };
  decisionData.value = { ...module };
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
function finder(id, opt = { parent: false }, target = decisionData.value) {
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
 * @description: 保存
 * @return {*}
 */
async function handleSave() {
  const target = JSON.parse(JSON.stringify(decisionData.value));
  const valid = await Promise.all([
    formRef.value.validate(),
    resultFormRef.value.validate(),
    decisionValidate(target, null, dictMap).catch((e) => {
      if (e && e.length) center(e[0]);
      throw new Error();
    }),
  ]).catch(() => {});

  decisionData.value = target;
  if (!valid) return;

  const confirm = await ElMessageBox.confirm('您确定提交吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).catch(() => {});
  if (!confirm) return;

  loading.value = true;
  const featurePool = featurePoolHandler(decisionData.value).reduce((res, item) => {
    if (!res.find((i) => i.featureCode === item.featureCode)) res.push(item);
    return res;
  }, []);

  const res = await insertDecisionApi({
    ...form,
    decisionType: 'tree',
    featurePool,
    decisionNodes: [decisionData.value],
    resultOutputCode: resultForm.result,
  })
    .catch(() => {})
    .finally(() => (loading.value = false));
  if (!res || res.code !== 200) return;
  ElMessage.success('操作成功');
  handleClose();
}
</script>

<style lang="scss" scoped>
.decision-tree-create {
  height: 100%;
  display: flex;
  flex-direction: column;

  .search {
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
}
</style>
