/*
 * @Author: K
 * @Date: 2023-03-02 11:11:46
 * @Descripttion: 组件 - 规则集 - 常量/变量编辑组件
 * @FilePath: \decision_engine_ui\src\components\Ruleset\valueEdit.jsx
 * @LastEditors: K
 * @LastEditTime: 2023-04-13 10:18:23
 */
import { defineEmits } from 'vue';
import { ElSelect, ElOption, ElInput, ElDatePicker } from 'element-plus';
import styles from './valueEdit.module.scss';

import {
  getLibFeatureOptionsApi, //  查询特征库选择框选项
} from '@/api/module/feature';

export default defineComponent({
  name: 'ValueEdit',
  props: {
    modelValue: {
      type: String,
      require: true,
    },
    type: {
      type: String,
      default: 'constant',
    },
    options: {
      type: Array,
      default: [],
    },
    current: {
      type: Object,
      require: true,
    },
    line: {
      type: Array,
      default: [],
    },
  },
  emits: ['update:modelValue', 'update:type', 'updated'],
  data() {
    return {
      // resultType: 'constant',
      resultTypeOptions: [
        {
          label: '常量',
          value: 'constant',
        },
        {
          label: '变量',
          value: 'variable',
        },
      ],
    };
  },
  computed: {
    dataRef: {
      get() {
        return this.modelValue;
      },
      set(val) {
        this.$emit('update:modelValue', val);
      },
    },
    resultType: {
      get() {
        return this.type;
      },
      set(val) {
        this.$emit('update:type', val);
      },
    },
    attributeType() {
      return (
        (this.current.type === 'value' &&
          this.line.find((item) => item.type === 'attribute')?.feature?.featureValueType) ||
        ''
      );
    },
  },
  watch: {
    resultType() {
      this.dataRef = '';
    },
    dataRef(val) {
      this.$emit('updated', {
        value: val,
        feature:
          this.resultType === 'variable' && val
            ? this.options.find((item) => item.value === val)
            : null,
      });
    },
  },
  render() {
    return (
      <div class={styles['vlaue-edit-component']}>
        <ElSelect
          class={['option', styles['option']]}
          modelValue={this.resultType}
          onChange={(val) => (this.resultType = val)}
        >
          {this.resultTypeOptions.map(({ label, value }) => (
            <ElOption label={label} value={value}></ElOption>
          ))}
        </ElSelect>

        {this.resultType === 'constant' ? (
          this.attributeType === 'time' ? (
            <ElDatePicker
              class={['value', styles['value']]}
              v-model={this.dataRef}
              value-format="YYYY-MM-DD HH:mm:ss"
              type="datetime"
              placeholder="请选择日期时间"
            ></ElDatePicker>
          ) : (
            <ElInput
              class={['value', styles['value']]}
              modelValue={this.dataRef}
              onInput={(val) => (this.dataRef = val)}
            ></ElInput>
          )
        ) : (
          <ElSelect
            class={['value', styles['value']]}
            modelValue={this.dataRef}
            onChange={(val) => (this.dataRef = val)}
            filterable
            placeholder="请选择"
            no-data-text="无数据"
            no-match-text="无匹配数据"
          >
            {this.options.map(({ label, value }) => (
              <ElOption label={label} value={value}></ElOption>
            ))}
          </ElSelect>
        )}
      </div>
    );
  },
});
