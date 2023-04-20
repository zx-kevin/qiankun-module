import { StringExt } from '@/components/WorkFlow';
import { reactive } from 'vue';

/**
 * @description: 决策树组件数据转化
 * @param {*} target
 * @param {*} dictMap
 * @return {*}
 */
export function handleSetter(target, dictMap) {
  let result = {};
  if (!target) return result;

  const format = (node) => {
    const module = {
      shape: '',
      data: {},
      children: [],
    };
    const { nodeType, children, id, nodeProps, size, error } = node;
    const idVal = id || StringExt.uuid();
    module.data['id'] = idVal;
    module.data['error'] = error || '';
    module.data['size'] = size;
    if (size?.width) module['width'] = size.width;
    if (size?.height) module['height'] = size.height;
    node['id'] = idVal;

    if (nodeType === dictMap['conditionNodeEnum']) {
      //  条件节点
      module.shape = 'node_conditions';
      module.data['rule'] = Object.assign({}, node, { error: undefined });

      if (children && children.length)
        children.forEach((item) => {
          module.children.push(format(item));
        });
    } else if (nodeType === dictMap['decisionResultNodeEnum']) {
      // 结果节点
      module.shape = 'node_value';
      module.data['value'] = nodeProps.result;
    }
    return module;
  };
  result = { ...format(target) };
  return result;
}

/**
 * @description: 决策数据校验
 * @param {*} target
 * @param {*} opt
 * @param {*} dictMap
 * @return {*}
 */
export function decisionValidate(target, opt = {}, dictMap) {
  return new Promise(async (resovle, reject) => {
    let errStr = '';
    const errList = [];
    const { nodeType, children, nodeProps } = target;
    if (nodeType === dictMap['conditionNodeEnum']) {
      //  条件节点
      const childTypes = (children || []).reduce((res, item) => {
        res.add(item.nodeType);
        return res;
      }, new Set());
      if (childTypes.size > 1) {
        errStr = '子节点类型冲突';
      } else if (!nodeProps.conditionNodes.children || !nodeProps.conditionNodes.children.length) {
        errStr = '请配置规则';
      } else if (childTypes.size === 0) {
        errStr = '请添加子节点';
      }

      if (!opt?.single) {
        for (const item of children) {
          await decisionValidate(item, opt, dictMap).catch((e) => {
            errList.push(...(e || []));
          });
        }
      }
    } else if (nodeType === dictMap['decisionResultNodeEnum']) {
      //  结果节点
      if (children && children.length) {
        errStr = '结果节点后不能添加子节点';
      } else if (!nodeProps.result) {
        errStr = '结果节点的值不能为空';
      }
    }
    if (errStr) {
      target['error'] = errStr;
      errList.push(target.id);
    } else if (!errStr && target['error']) {
      target['error'] = '';
    }
    if (errStr || errList.length) {
      reject(errList);
    } else {
      resovle();
    }
  });
}
