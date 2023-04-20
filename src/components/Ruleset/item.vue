<!--
 * @Author: K
 * @Date: 2023-02-14 15:35:25
 * @Descripttion: 组件 - 规则集 - 模板块
 * @FilePath: \decision_engine_ui\src\components\Ruleset\item.vue
 * @LastEditors: K
 * @LastEditTime: 2023-04-13 10:16:03
-->
<template>
  <el-form
    ref="form"
    :model="data"
    :rules="rules"
    v-if="data"
    class="rule-set-component-item"
    :class="{
      blue: data.value == getDict(decisionNodeDict, '并且节点'),
      green: data.value == getDict(decisionNodeDict, '或者节点'),
    }"
  >
    <div class="left">
      <el-form-item prop="type">
        <selecter
          icon
          :data="data"
          :map="decisionNodeDict"
          :menu="menu"
          @addRule="onAddRule"
          @addRelation="onAddRelation"
        ></selecter>
      </el-form-item>
    </div>
    <div class="right">
      <div
        class="line"
        :class="{ lineTop32: line.type !== 'line' }"
        v-for="(line, index) in data.children"
        :key="`line_${index}}`"
      >
        <template v-if="line.type === 'line'">
          <el-form-item
            v-for="(item, itemIndex) in line.value"
            :key="`children_${itemIndex}`"
            :prop="`children.${index}.value.${itemIndex}.${item.type}`"
            :rules="rules[item.type]"
          >
            <value-edit
              v-if="['attribute', 'value'].includes(item.type)"
              class="item"
              v-model="item.value"
              v-model:type="item.valueType"
              :options="options"
              :current="item"
              :line="line.value"
              @updated="onValueEditUpdated($event, item, line.value)"
            ></value-edit>
            <selecter
              v-else
              class="item condition"
              :data="item"
              :map="operatorDictFormatter(line.value)"
              :type="item.type"
              :menu="menu"
            ></selecter>
            <p v-if="item.type === 'value'" class="tip">{{ valueTipFormatter(line.value) }}</p>
          </el-form-item>
        </template>
        <rule-set-item
          v-else
          ref="ruleSetItemRef"
          :data="line"
          :options="options"
          :menu="menu"
        ></rule-set-item>
        <svg-icon
          v-if="data.children.length > 1"
          icon-class="shanchu"
          @click="onDel(data.children, index)"
        />
        <!-- <div @click="validate">123</div> -->
      </div>
    </div>
  </el-form>
</template>

<script>
export default {
  name: 'RuleSetItem',
};
</script>

<script setup>
import selecter from './selecter.vue';
import SvgIcon from '@/components/SvgIcon';
import { getDictSync } from '@/utils/dict';
import { ElInput, ElOption, ElSelect, ElForm, ElFormItem } from 'element-plus';
import valueEdit from './valueEdit.jsx';

defineExpose({
  validate,
});

const ruleSetItemRef = ref();
const form = ref();
const props = defineProps({
  data: {
    type: Object,
    require: true,
  },
  options: {
    type: Array,
    default: [],
  },
  menu: Array,
});
const { data, options } = toRefs(props);

/**
 * @description: 获取节点对象
 * @param {*} field 字段
 * @return {*}
 */
const getSelectTarget = (field, getParent = false) => {
  let fields = field.split('.');
  fields = fields.slice(0, getParent ? -2 : -1);
  let target = data.value;
  fields.forEach((item) => {
    target = target[isNaN(Number(item)) ? item : Number(item)];
  });
  return target;
};
const validateType = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请选择节点类型'));
  } else {
    callback();
  }
};
const validateNode = ({ field }, value, callback) => {
  const { value: result, valueType } = getSelectTarget(field);
  if (!result) {
    callback(new Error(`请${valueType === 'variable' ? '选择' : '输入'}节点数据`));
  } else {
    callback();
  }
};
const validateValue = ({ field }, value, callback) => {
  const { value: result, valueType } = getSelectTarget(field);
  const attributeItem = getSelectTarget(field, true).find((item) => item.type === 'attribute');
  const featureType = (attributeItem && attributeItem.feature?.featureValueType) || '';

  if (!result) {
    callback(new Error(`请${valueType === 'variable' ? '选择' : '输入'}节点数据`));
  } else {
    const validate =
      operatorFormatterMap[
        attributeItem.valueType === 'variable'
          ? dictMap.value['value_type_enum']?.find((item) => item.value === featureType)?.label
          : '数值'
      ]?.validate;
    callback((validate && validate(result)) || undefined);
  }
};
const validateCondision = ({ field }, value, callback) => {
  const { value: result } = getSelectTarget(field);
  if (!result) {
    callback(new Error('请选择比较类型'));
  } else {
    callback();
  }
};
const rules = {
  type: [{ validator: validateType, trigger: 'change' }],
  attribute: [{ validator: validateNode, trigger: 'change' }],
  condition: [{ validator: validateCondision, trigger: 'change' }],
  value: [{ validator: validateValue, trigger: 'change' }],
};

onMounted(() => init());

const dictMap = reactive({
  value: {},
});
const decisionNodeDict = ref([]); //  字典 - 条件节点
const operatorDict = ref([]); //  字典 - 运算符
//  初始化数据
async function init() {
  const { operator, condition_node_enum, value_type_enum } = await getDictSync(
    'operator',
    'condition_node_enum',
    'value_type_enum',
  );
  decisionNodeDict.value = condition_node_enum.filter(({ label }) =>
    ['并且节点', '或者节点'].includes(label),
  );
  operatorDict.value = operator;
  dictMap.value['value_type_enum'] = value_type_enum;

  setDefaultChildre();
  setFeatureData(data.value);
}

/**
 * @description: 特征类型匹配操作符
 * @return {*}
 */
const operatorFormatterMap = {
  字符串: {
    type: ['等于', '等于(不分大小写)', '不等于', '不等于(不分大小写)', '包含', '不包含'],
  },
  对象: {
    type: ['等于', '等于(不分大小写)', '不等于', '不等于(不分大小写)', '包含', '不包含'],
  },
  数组: {
    type: ['等于', '等于(不分大小写)', '不等于', '不等于(不分大小写)', '包含', '不包含'],
    tip: '逗号分割数据 如:输入 1,2,3 表示[1,2,3]',
  },
  数值: {
    type: ['大于', '大于等于', '等于', '小于', '小于等于', '不等于'],
    validate: (value) => {
      if (!/^\d+(\.\d+)?$/.test(value)) {
        return new Error('只能输入数字');
      }
      return null;
    },
  },
  布尔值: {
    type: ['等于', '不等于'],
    validate: (value) => {
      if (String(value) !== 'true' && String(value) !== 'false') {
        return new Error('只能输入true/false');
      }
      return null;
    },
  },
  时间值: {
    type: ['大于', '小于'],
  },
};
/**
 * @description: 根据特征类型匹配操作符字典 常量默认数值类型
 * @param {*} list
 * @return {*}
 */
const operatorDictFormatter = (list) => {
  const res = ref([]);
  watchEffect(() => {
    const target = list.find((item) => item.type === 'attribute');
    if (!target) return;

    const targetType =
      target.valueType === 'constant'
        ? '数值'
        : dictMap.value['value_type_enum']?.find(
            (item) => item.value === target.feature?.featureValueType,
          )?.label || '';
    if (!targetType) return;

    res.value = operatorDict.value.filter((item) =>
      operatorFormatterMap[targetType].type.includes(item.label),
    );
  });
  return res.value;
};

/**
 * @description: 根据特征类型动态匹配提示
 * @param {*} list
 * @return {*}
 */
const valueTipFormatter = (list) => {
  const res = ref('');
  watchEffect(() => {
    const target = list.find((item) => item.type === 'attribute');
    if (!target) return;
    const targetType =
      target.valueType === 'constant'
        ? '数值'
        : dictMap.value['value_type_enum']?.find(
            (item) => item.value === target.feature?.featureValueType,
          )?.label || '';
    if (!targetType) return;

    res.value = operatorFormatterMap[targetType].tip || '';
  });
  return res.value;
};

watch(data, (dataVal) => {
  if (!dataVal) return;
  setDefaultChildre();
});

// 初始化默认值
function setDefaultChildre() {
  if (!data.value) return;

  if (!data.value.children) data.value.children = [];
  if (!data.value.children.length) addRule(data.value.children);
}

//  初始赋值特征库数据
function setFeatureData(target) {
  if (!target) return;
  const { type, value, children, valueType, feature } = target;
  if (type === 'relation' && children && children.length) {
    children.forEach((item) => setFeatureData(item));
  } else if (type === 'line' && value && value.length) {
    value.forEach((item) => setFeatureData(item));
  } else if (['attribute', 'value'].includes(type) && valueType === 'variable' && !feature) {
    target['feature'] = options.value?.find((item) => item.value === value) || null;
  }
}

const addRule = (target) => {
  target.push({
    type: 'line',
    value: [
      {
        type: 'attribute',
        value: '',
        valueType: 'variable',
      },
      {
        type: 'condition',
        value: '',
      },
      {
        type: 'value',
        value: '',
        valueType: 'constant',
      },
    ],
  });
};

const addRelation = (target) => {
  target.push(
    reactive({
      type: 'relation',
      value: getDict(decisionNodeDict.value, '并且节点'),
    }),
  );
};

const onAddRule = () => {
  addRule(data.value.children);
};

const onAddRelation = () => {
  addRelation(data.value.children);
};

const onDel = (target, index) => {
  if (target.length === 1) return;
  target.splice(index, 1);
};

function getDict(dict, label) {
  return dict?.find((item) => item.label === label)?.value ?? '';
}

function onValueEditUpdated({ value, feature }, target, list) {
  target['feature'] = feature;
  if (target.type === 'attribute')
    list.filter((item) => item.type !== 'attribute').forEach((item) => (item.value = ''));
}

/**
 * @description: 表单校验
 * @return {*}
 */
function validate() {
  return new Promise(async (resolve, reject) => {
    const res = await Promise.all([
      form.value.validate(),
      ...(ruleSetItemRef.value ?? []).map((item) => item.validate()),
    ]).catch((e) => {
      reject(e);
    });
    if (!res) return;
    resolve(res && res.flat());
  });
}
</script>

<style lang="scss" scoped>
.rule-set-component-item {
  display: flex;

  &:not(:last-of-type) {
    margin-bottom: 20px;
  }
  .left {
    position: relative;
    padding-right: 20px;
    margin-top: 15px;

    &::after {
      content: '';
      display: block;
      position: absolute;
      right: 0;
      top: 17px;
      width: 20px;
      height: 0;
      border-bottom: 1px dashed #dcdfe6;
    }
  }

  .right {
    flex: 1;
    border: 1px dashed #dcdfe6;
    border-radius: 10px;
    padding-right: 15px;
    margin-bottom: 18px;

    .is-error {
      :deep(.item) {
        border-color: var(--el-color-danger);
      }
    }

    .line {
      display: flex;
      align-items: center;
      padding-left: 30px;
      position: relative;

      &:first-of-type {
        margin-top: 15px;
      }

      &::after {
        content: '';
        display: block;
        position: absolute;
        left: 0;
        top: 16px;
        width: 30px;
        height: 0;
        border-bottom: 1px dashed #dcdfe6;
      }

      &.lineTop32::after {
        top: 32px;
      }

      .el-input {
        width: 150px;

        :deep(.el-input__inner) {
          height: 35px;
          line-height: 35px;
        }
      }

      .item {
        margin-right: 10px;
        border-radius: 6px;

        &:first-of-type {
          width: 250px;
        }

        &.condition {
          width: 100px;
        }
      }

      & > .svg-icon {
        color: #d81e06;
        width: 25px;
        height: 25px;
        cursor: pointer;
        margin-left: 10px;
        margin-bottom: 18px;
      }

      .tip {
        position: absolute;
        left: 0;
        top: 100%;
        line-height: 1;
        font-size: 12px;
        color: #c8c9cc;
        padding-top: 2px;
      }

      .el-form-item.is-error .tip {
        display: none;
      }
    }
  }

  &.blue {
    & > .left {
      :deep(.el-dropdown) {
        .svg-icon {
          color: #5b9afb;
        }
      }
    }
    & > .right {
      border-color: #5b9afb;
    }
  }

  &.green {
    & > .left {
      :deep(.el-dropdown) {
        .svg-icon {
          color: #83bc59;
        }
      }
    }
    & > .right {
      border-color: #83bc59;
    }
  }
}

.vlaue-edit-component {
  width: 250px;
  display: flex;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;

  :deep(.option) {
    width: 90px;
    border-right: 1px solid #dcdfe6;

    .el-input__wrapper {
      box-shadow: none !important;
      height: 35px;
    }
  }

  :deep(.value) {
    flex: 1;

    .el-input__wrapper {
      box-shadow: none !important;
      height: 35px;
    }
  }
}
</style>
