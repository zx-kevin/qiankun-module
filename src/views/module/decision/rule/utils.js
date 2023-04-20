import { titleCase } from '@/utils/index';

export const ruleset2Data = (
  target,
  featurePool,
  resultOutputCode,
  { expressionNode, resultNode, elseConditionNode },
) => {
  const result = JSON.parse(JSON.stringify(target));
  const { rulesetFormat, resultFormat } = result.nodeProps.conditionNodes;

  //  处理特征库参数
  const handleFeature = (target, type) => {
    const result = {};
    const module = {
      featureCode: '',
      featureName: '',
      featureType: 'value',
      valueType: '',
    };
    const map = {
      left: 'attribute',
      right: 'value',
    };
    const featureModule = {
      attributeFeature: target.find((item) => item.type === 'attribute')?.feature,
      valueFeature: target.find((item) => item.type === 'value')?.feature,
    };

    for (const mapKey in map) {
      const featureItem = featureModule[`${map[mapKey]}Feature`];
      for (const moduleKey in module) {
        result[`${mapKey}${titleCase(moduleKey)}`] = featureItem
          ? featureItem[moduleKey === 'valueType' ? 'featureValueType' : moduleKey]
          : module[moduleKey];
      }
    }

    return result;
  };
  // 添加节点用到的特征库池
  const addFeature = (target) => {
    if (!target) return;
    if (!featurePool.find((item) => item.featureId === target.featureId)) featurePool.push(target);
  };
  // 整理节点数据
  const handleRuleset = (target) => {
    let targetResult = {
      nodeType: '',
      nodeProps: {},
      children: [],
    };

    if (target.type === 'line') {
      const targetModule = target.value.reduce((result, item) => {
        result[item.type] = item.value;
        return result;
      }, {});
      const featureForm = handleFeature(target.value);
      const attributeFeature = target.value.find((item) => item.type === 'attribute')?.feature;
      addFeature(attributeFeature);
      const valueFeature = target.value.find((item) => item.type === 'value')?.feature;
      const nodeProps = {
        ...featureForm,
        leftValue: attributeFeature ? '' : targetModule['attribute'],
        operator: targetModule['condition'],
        rightValue: valueFeature ? '' : targetModule['value'],
        nodeType: expressionNode,
      };
      targetResult.nodeType = expressionNode;
      targetResult.nodeProps = { ...nodeProps };
    } else if (target.onlyResult) {
      targetResult = {
        nodeType: elseConditionNode,
      };
    } else {
      targetResult.nodeType = target.value;
    }

    if (target.children && target.children.length) {
      for (let index = 0; index < target.children.length; index++) {
        const child = target.children[index];
        targetResult.children.push(handleRuleset(child));
      }
    }

    return targetResult;
  };

  const handleResult = (target) => {
    resultOutputCode.value = target.conditionValue;
    const result = {
      nodeType: resultNode,
      nodeProps: {
        nodeType: resultNode,
        result: target.resultValue,
      },
      children: [],
    };

    return result;
  };

  result.nodeProps.conditionNodes = result.onlyResult
    ? {}
    : Object.assign(result.nodeProps.conditionNodes, handleRuleset(rulesetFormat));

  const children = [];
  for (const resultFormatItem of resultFormat) {
    children.push(handleResult(resultFormatItem));
  }
  result.children = [...children];

  delete result.id;
  delete result.onlyResult;
  delete result.nodeProps.conditionNodes.conditionExpr;
  delete result.nodeProps.conditionNodes.rulesetFormat;
  delete result.nodeProps.conditionNodes.resultFormat;
  return result;
};
