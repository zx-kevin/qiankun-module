/*
 * @Author: K
 * @Date: 2023-02-22 14:43:53
 * @Descripttion: 决策树 - 条件节点组件
 * @FilePath: \decision_engine_ui\src\components\WorkFlow\loader\module\default\nodes\node_conditions.jsx
 * @LastEditors: K
 * @LastEditTime: 2023-04-13 10:50:18
 */
import { computed, defineComponent, reactive } from 'vue';
import { ElLoading, ElDialog, ElRow, ElButton } from 'element-plus';
import Ruleset from '@/components/Ruleset';
import Loading from '../../../../mixins/loading';
import Graph from '../../../../mixins/graph';
import { titleCase } from '@/utils/index';
import Menu from '../../../components/menu';

import styles from './node_conditions.module.scss';

import {
  getLibFeatureOptionsApi, //  查询特征库选择框选项
} from '@/api/module/feature';

export default defineComponent({
  mixins: [Loading, Graph],
  data() {
    return {
      node: null,
      dialogVisible: false,

      error: null,
    };
  },
  setup() {
    const instance = getCurrentInstance();
    const dictMap = computed(() => instance.data.dictMap);
    const rule = reactive({
      value: {},
    });
    const ruleFormat = ref([]);
    // 节点数据格式化显示
    const ruleStr = computed(() => {
      if (!dictMap.value || !rule.value || !Object.keys(rule.value).length) return '';
      const result = ref('');
      let conditionCount = 0;
      const featureFormatter = (target, type) => {
        const valueType = target[`${type}FeatureType`];

        if (valueType === 'value') return target[`${type}Value`];
        return target[`${type}FeatureName`];
      };
      // 递归处理
      const formatter = (target, resultStr) => {
        const { nodeType, nodeProps } = target;

        if (nodeType === dictMap.value['conditionNodeEnum']) {
          //  条件节点
          conditionCount++;
          formatter(target.nodeProps.conditionNodes, resultStr);
        } else if (
          [dictMap.value['decisionAndNodeEnum'], dictMap.value['decisionOrNodeEnum']].includes(
            nodeType,
          )
        ) {
          //  并且/或者节点
          const needCollect =
            nodeType === dictMap.value['decisionOrNodeEnum'] &&
            conditionCount > 0 &&
            target.children &&
            target.children.length > 1;
          resultStr.value += `${needCollect ? '(' : ''}${target.children
            .map((item) => {
              const itemResult = ref('');
              formatter(item, itemResult);
              return itemResult.value;
            })
            .join(nodeType === dictMap.value['decisionAndNodeEnum'] ? '\n && ' : '\n || ')}${
            needCollect ? ')' : ''
          }`;
        } else if (nodeType === dictMap.value['decisionArithNodeEnum']) {
          //  条件表达式节点
          resultStr.value = `${featureFormatter(nodeProps, 'left')} ${
            dictMap.value['operator'].find((item) => item.value === nodeProps.operator)?.label ||
            '?'
          } ${featureFormatter(nodeProps, 'right')}`;
        }
      };
      formatter(rule.value, result);
      return result.value;
    });
    const options = computed(() => {
      const type = (rule.value?.children && rule.value.children[0]?.nodeType) || '';
      const count = (rule.value?.children || []).reduce((res, item) => {
        if (item.nodeType === type) res++;
        return res;
      }, 0);
      return [
        {
          label: '添加条件',
          disabled: type === dictMap.value?.['decisionResultNodeEnum'],
          type: 'condition',
        },
        {
          label: '添加结果',
          disabled:
            type === dictMap.value?.['conditionNodeEnum'] ||
            (type === dictMap.value?.['decisionResultNodeEnum'] && count === 1),
          type: 'result',
        },
      ];
    });

    return {
      rule,
      ruleFormat,
      ruleStr,

      options,
    };
  },
  watch: {
    /**
     * @description: 监听规则弹窗状态处理规则数据
     * @param {*} val
     * @return {*}
     */
    dialogVisible(val) {
      if (val) {
        this.ruleFormat = [this.handleFormat(this.rule.value)];
      } else {
        this.ruleFormat = [];
      }
    },
    /**
     * @description: 更新组件大小
     * @return {*}
     */
    ruleStr() {
      this.resize();
    },
  },
  methods: {
    /**
     * @description: 初始化数据
     * @return {*}
     */
    init() {
      this.startLoading();
      const module = {
        nodeType: this.dictMap['conditionNodeEnum'],
        nodeProps: {
          nodeType: this.dictMap['conditionNodeEnum'],
          conditionNodes: {
            nodeType: this.dictMap['decisionAndNodeEnum'],
            children: [],
          },
        },
        children: [],
      };

      this.node.setProp('data', {
        rule: module,
      });
      this.stopLoading();
    },
    /**
     * @description: 节点数据转规则数据
     * @param {*} target
     * @return {*}
     */
    handleFormat(target) {
      const result = {
        type: '',
        value: '',
        children: [],
      };

      if (target.nodeType === this.dictMap['conditionNodeEnum']) {
        //  条件节点
        const { nodeType, children } = target.nodeProps.conditionNodes;
        result['type'] = 'relation';
        result['value'] = nodeType;

        if (children && children.length)
          children.forEach((item) => result.children.push(this.handleFormat(item)));
      } else if (
        [this.dictMap['decisionAndNodeEnum'], this.dictMap['decisionOrNodeEnum']].includes(
          target.nodeType,
        )
      ) {
        //  并且/或者节点
        const { nodeType, children } = target;
        result['type'] = 'relation';
        result['value'] = nodeType;
        if (children && children.length)
          children.forEach((item) => result.children.push(this.handleFormat(item)));
      } else if (target.nodeType === this.dictMap['decisionArithNodeEnum']) {
        console.log('???', target.nodeProps);
        //  表达式节点
        result['type'] = 'line';
        result['value'] = [
          {
            type: 'attribute',
            value: target.nodeProps['leftValue'] || target.nodeProps['leftFeatureCode'],
            valueType: target.nodeProps['leftFeatureType'] === 'value' ? 'constant' : 'variable',
          },
          {
            type: 'condition',
            value: target.nodeProps['operator'],
          },
          {
            type: 'value',
            value: target.nodeProps['rightValue'] || target.nodeProps['rightFeatureCode'],
            valueType: target.nodeProps['rightFeatureType'] === 'value' ? 'constant' : 'variable',
          },
        ];
      }
      return result;
    },
    /**
     * @description: 规则数据转节点数据
     * @return {*}
     */
    async handleRuleset() {
      const vaild = await this.$refs.rulesetRef.validate();
      if (!vaild) return;

      const result = ref([]);
      //  处理特征库参数
      const featureFormatter = (target) => {
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
      //  递归格式化
      const formatter = (target, isRoot) => {
        const module = {
          nodeType: '',
          children: [],
        };
        const { type, value, children } = target;
        if (type === 'relation') {
          if (isRoot) {
            module['nodeType'] = this.dictMap['conditionNodeEnum'];
            module['nodeProps'] = {
              nodeType: this.dictMap['conditionNodeEnum'],
              conditionNodes: {
                nodeType: value,
                children: [],
              },
            };
          } else {
            module['nodeType'] = value;
          }
          if (children && children.length)
            children.forEach((item) => {
              if (isRoot) {
                module.nodeProps.conditionNodes.children.push(formatter(item));
              } else {
                module.children.push(formatter(item));
              }
            });
        } else if (type === 'line') {
          const targetModule = value.reduce((result, item) => {
            result[item.type] = item.value;
            return result;
          }, {});
          const featureForm = featureFormatter(target.value);
          const attributeFeature = target.value.find((item) => item.type === 'attribute')?.feature;
          const valueFeature = target.value.find((item) => item.type === 'value')?.feature;

          module['nodeType'] = this.dictMap['decisionArithNodeEnum'];
          module['nodeProps'] = {
            ...featureForm,
            leftValue: attributeFeature ? '' : targetModule['attribute'],
            operator: targetModule['condition'],
            rightValue: valueFeature ? '' : targetModule['value'],
            nodeType: this.dictMap['decisionArithNodeEnum'],
          };
        }

        return module;
      };

      this.ruleFormat.forEach((item) => result.value.push(formatter(item, true)));
      this.onEvents(
        { type: 'conditions_update' },
        Object.assign(this.attrs, {
          rule: result.value[0],
        }),
      );
      // this.node.setProp('data', {
      //   rule: result.value[0],
      // });
      this.dialogVisible = false;
    },
    /**
     * @description: 打开规则配置弹窗
     * @return {*}
     */
    openRuleset() {
      this.dialogVisible = true;
    },
    /**
     * @description: 菜单点击事件
     * @param {*} type  事件类型
     * @return {*}
     */
    handleMenu(target) {
      this.onEvents(target, this.attrs);
    },
    /**
     * @description: 更新节点大小
     * @return {*}
     */
    async resize() {
      await this.$nextTick();

      const dom = this.$refs.value;
      const { clientWidth, clientHeight } = dom;
      const width = clientWidth + 40 <= 150 ? 180 : clientWidth + 60;
      const height = clientHeight + 40 <= 50 ? 50 : clientHeight + 30;
      // this.node.resize(width, height);
      this.onEvents(
        { type: 'conditions_update' },
        Object.assign(this.attrs, {
          width,
          height,
        }),
      );
    },
  },
  async mounted() {
    this.rule.value = this.attrs?.rule;
    this.error = this.attrs?.error;
    this.node.on('change:data', ({ current }) => {
      this.attrs = current;
      this.rule.value = current.rule;
      this.error = current.error;
    });
    if (!this.rule.value) this.init();
  },
  render() {
    return (
      <div class={[styles['node_conditions'], this.error && styles['is_error']]}>
        <div class={[styles['box'], 'box']}>
          <Menu options={this.options} onSelect={this.handleMenu}></Menu>
          <div class={styles['value_box']} onClick={this.openRuleset}>
            <div ref="value" class={styles['value']}>
              {this.ruleStr ? this.ruleStr : '请配置规则'}
            </div>
          </div>
        </div>
        <p v-show={Boolean(this.error)} class={[styles['error_value'], 'error_value']}>
          {this.error}
        </p>
        <ElDialog
          v-model={this.dialogVisible}
          title="规则配置"
          append-to-body
          align-center
          width="1200"
          destroy-on-close
        >
          <Ruleset
            ref="rulesetRef"
            data={this.ruleFormat}
            options={this.dictMap['featuresOptions']}
          ></Ruleset>

          <ElRow slot="footer" justify="end" style={{ marginTop: '20px' }}>
            <ElButton size="large" onClick={() => (this.dialogVisible = false)}>
              取消
            </ElButton>
            <ElButton size="large" type="primary" onClick={this.handleRuleset}>
              确定
            </ElButton>
          </ElRow>
        </ElDialog>
      </div>
    );
  },
});
