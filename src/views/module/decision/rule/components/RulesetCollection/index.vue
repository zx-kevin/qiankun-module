<!--
 * @Author: K
 * @Date: 2023-02-23 11:13:51
 * @Descripttion: 规则集组件
 * @FilePath: \decision_engine_ui\src\views\module\decision\ruleSetNew\components\RulesetCollection\index.vue
 * @LastEditors: K
 * @LastEditTime: 2023-03-13 14:54:47
-->
<template>
  <div class="ruleset-collection">
    <ruleset-item
      v-for="(item, index) in data"
      ref="itemRef"
      :key="`item_${item.id || item.nodeId}`"
      :data="data[index]"
      :feature="currentFeature"
      :subscript="index"
      :total="data.length"
      :only-result="item.onlyResult"
      :dictMap="dictMap"
      @handler="handler"
      @onFeatureChage="handleFeatureChange"
    ></ruleset-item>
  </div>
</template>

<script>
export default {
  name: 'RulesetCollection',
};
</script>

<script setup>
import RulesetItem from './item.vue';
import { randomId } from '@/utils/index';
import { getDict } from '@/utils/dict';

import {
  getLibFeatureOptionsApi, //  查询特征库选择框选项
} from '@/api/module/feature';
import { ElLoading } from 'element-plus';
import { async } from '@antv/x6/lib/registry/marker/async';

defineExpose({ add: handleAdd, update: dataFormat, validate });

const props = defineProps({
  //  节点数据
  data: {
    type: Array,
    require: true,
  },
  //  节点使用的特征库
  featurePool: {
    type: Array,
    default: () => [],
  },
  resultCode: String, //  结果特征库
});
const { data, featurePool, resultCode } = toRefs(props);
const itemRef = ref();

function validate() {
  return new Promise(async (resolve, reject) => {
    const res = await Promise.all([...(itemRef.value ?? []).map((item) => item.validate())]).catch(
      (e) => {
        reject(e);
      },
    );
    resolve(res && res.flat());
  });
}

function handler(type, index) {
  const target = data.value.splice(index, 1);
  if (type === 'del') return;
  data.value.splice(type === 'moveUp' ? index - 1 : index + 1, 0, target[0]);
}

function handleAdd() {
  data.value.splice(data.value.length - 1, 0, getDecisionNode());
}

const currentFeature = computed(() => {
  return data.value[0]?.nodeProps?.conditionNodes?.resultFormat?.[0]?.conditionValue || '';
});

// 同步修改特征值
function handleFeatureChange(val) {
  data.value.forEach(
    (item) => (item.nodeProps.conditionNodes.resultFormat[0].conditionValue = val),
  );
}

const dictMap = reactive({});
function getDictMap() {
  return new Promise(async (resolve) => {
    dictMap['decisionNodeEnum'] = await getDict('decision_flow_node_type_enum', '条件节点');
    dictMap['elseConditionNode'] = await getDict('decision_node_enum', '其它节点');
    dictMap['decisionAndNodeEnum'] = await getDict('condition_node_enum', '并且节点');
    dictMap['decisionOrNodeEnum'] = await getDict('condition_node_enum', '或者节点');

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

    resolve();
  });
}

function handleRuleset(target) {
  const result = {
    children: [],
  };

  if ([dictMap['decisionAndNodeEnum'], dictMap['decisionOrNodeEnum']].includes(target.nodeType)) {
    result['type'] = 'relation';
    result['value'] = target.nodeType;
  } else {
    const { nodeProps } = target;
    result['type'] = 'line';
    result['value'] = [
      {
        type: 'attribute',
        value: nodeProps['leftValue'] || nodeProps['leftFeatureCode'],
        valueType: nodeProps['leftFeatureType'] === 'value' ? 'constant' : 'variable',
        feature:
          nodeProps['leftFeatureType'] === 'value'
            ? null
            : featurePool.value.find((item) => item.featureCode === nodeProps['leftFeatureCode']),
      },
      {
        type: 'condition',
        value: nodeProps['operator'],
      },
      {
        type: 'value',
        value: nodeProps['rightValue'] || nodeProps['rightValueleftFeatureCode'],
        valueType: nodeProps['rightFeatureType'] === 'value' ? 'constant' : 'variable',
        feature:
          nodeProps['rightFeatureType'] === 'value'
            ? null
            : featurePool.value.find((item) => item.featureCode === nodeProps['rightFeatureCode']),
      },
    ];
  }

  if (target.children && target.children.length)
    target.children.forEach((item) => result.children.push(handleRuleset(item)));

  return result;
}

function handleResult(target, featureCode) {
  const result = [];

  target.forEach((item) => {
    result.push({
      conditionValue: featureCode || '',
      resultType: 'constant',
      resultValue: item.nodeProps.result,
    });
  });

  return result;
}

/**
 * @description: 获取一个默认条件节点
 * @return {*}
 */
function getDecisionNode() {
  return {
    id: randomId(10),
    nodeType: dictMap['decisionNodeEnum'],
    nodeProps: {
      nodeType: dictMap['decisionNodeEnum'],
      conditionNodes: {
        rulesetFormat: {
          type: 'relation',
          value: dictMap['decisionAndNodeEnum'],
          children: [],
        },
        resultFormat: [
          {
            conditionValue: currentFeature.value,
            resultType: 'constant',
            resultValue: '',
          },
        ],
      },
    },
    children: [],
  };
}

//  数据处理
async function dataFormat() {
  const loadingInstance = ElLoading.service();
  await getDictMap();

  if (data.value && !data.value.length) {
    data.value.push(
      ...[
        getDecisionNode(),
        {
          onlyResult: true,
          id: randomId(10),
          nodeType: dictMap['elseConditionNode'],
          nodeProps: {
            nodeType: dictMap['elseConditionNode'],
            conditionNodes: {
              rulesetFormat: {
                type: 'relation',
                value: dictMap['decisionAndNodeEnum'],
                children: [],
              },
              resultFormat: [
                {
                  conditionValue: currentFeature.value,
                  resultType: 'constant',
                  resultValue: '',
                },
              ],
            },
          },
          children: [],
        },
      ],
    );
  } else {
    data.value.forEach((item) => {
      item['id'] = item.nodeId;
      item['onlyResult'] = item.nodeType === dictMap['elseConditionNode'];

      item.nodeProps.conditionNodes['rulesetFormat'] =
        !item['onlyResult'] && handleRuleset(item.nodeProps.conditionNodes);
      item.nodeProps.conditionNodes['resultFormat'] = handleResult(item.children, resultCode.value);
    });
  }

  loadingInstance.close();
}

onMounted(() => dataFormat());
</script>

<style lang="scss" scoped>
.ruleset-collection {
  height: 100%;
  overflow-y: auto;

  &::-webkit-scrollbar-track-piece {
    background: #fff;
  }

  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #b3bccc;
    border-radius: 50px;
  }
}
</style>
