<!--
 * @Author: K
 * @Date: 2023-02-23 17:03:36
 * @Descripttion: 规则集组件 元素
 * @FilePath: \decision_engine_ui\src\views\module\decision\rule\components\RulesetCollection\item.vue
 * @LastEditors: K
 * @LastEditTime: 2023-03-20 09:59:23
-->
<template>
  <div class="ruleset-collection-item">
    <el-row class="header" justify="space-between">
      <div class="title">{{ titleFormat }}</div>
      <div v-if="!onlyResult" class="btns">
        <svg-icon
          v-for="(mapItem, mapIndex) in btnMap"
          :key="`btn_${mapIndex}`"
          :icon-class="mapItem.icon"
          :class="`${mapItem.active ? 'active' : ''} ${mapItem.type}`"
          @click="mapItem.active && handler(mapItem.type, subscript)"
        ></svg-icon>
      </div>
    </el-row>

    <div class="main">
      <ruleset-component
        v-if="!onlyResult && rulesetFormatRef"
        ref="rulesetRef"
        :data="[rulesetFormatRef]"
        :options="dictMap.featuresOptions"
      ></ruleset-component>

      <div class="result">
        <el-row v-if="!onlyResult" class="header" justify="space-between">
          <div class="title">输出</div>

          <el-row class="btns">
            <!-- 添加按钮 -->
            <!-- <svg-icon icon-class="tianjia" @click="handleAddResult"></svg-icon> -->
          </el-row>
        </el-row>

        <el-form ref="formRef" :model="resultFormatRef" :rules="rules">
          <el-row v-for="(item, index) in resultFormatRef" :key="`result_${index}`" class="line">
            <el-form-item :prop="`${index}.conditionValue`" :rules="rules.condition">
              <el-select
                class="condition"
                v-model="item.conditionValue"
                @change="onFeatureChange($event, item)"
              >
                <el-option
                  v-for="item in dictMap.featuresOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>

            <div class="operator">=</div>

            <el-form-item class="end" :prop="`${index}.resultValue`" :rules="rules.resultValue">
              <el-input v-model="item.resultValue"></el-input>
            </el-form-item>

            <!-- <value-edit v-model="item.resultValue"></value-edit> -->

            <!-- 删除按钮 -->
            <!-- <svg-icon icon-class="shanchu2" @click="validate"></svg-icon> -->
          </el-row>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RulesetCollectionItem',
};
</script>

<script setup>
import RulesetComponent from '@/components/Ruleset/index';
// import ValueEdit from '@/components/Ruleset/valueEdit';

defineExpose({
  validate,
});

const emit = defineEmits(['handler', 'onFeatureChage']);
const props = defineProps({
  subscript: Number,
  total: Number,
  onlyResult: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    require: true,
  },
  dictMap: {
    type: Object,
    require: true,
  },
  feature: String,
});
const { data, total, subscript, onlyResult, feature, dictMap } = toRefs(props);
const rulesetRef = ref();
const formRef = ref();

const getValue = (field) => {
  let fields = field.split('.');
  let target = resultFormatRef.value;
  fields.forEach((item) => {
    target = target[isNaN(Number(item)) ? item : Number(item)];
  });
  return target;
};
const validateCondition = ({ field }, value, callback) => {
  const valueStr = getValue(field);
  if (!valueStr) {
    callback(new Error('请选择输出类型'));
  } else {
    callback();
  }
};
const validateValue = ({ field }, value, callback) => {
  const valueStr = getValue(field);
  if (!valueStr) {
    callback(new Error('请输入输出值'));
  } else {
    callback();
  }
};
const rules = {
  condition: [{ validator: validateCondition, trigger: 'change' }],
  resultValue: [{ validator: validateValue, trigger: 'change' }],
};

const titleFormat = computed(() => {
  let title = '';
  switch (subscript.value) {
    case 0:
      title = 'IF';
      break;
    case total.value - 1:
      title = 'ELSE';
      break;
    default:
      title = 'ELSE IF';
      break;
  }
  return title;
});
const rulesetFormatRef = computed(() => {
  return data.value?.nodeProps?.conditionNodes?.rulesetFormat ?? null;
});
const resultFormatRef = computed(() => {
  return data.value?.nodeProps?.conditionNodes?.resultFormat ?? [];
});

//  动态更新选中特征库对象
watch(
  () => data.value?.nodeProps?.conditionNodes?.resultFormat?.[0]?.conditionValue || '',
  (val) => {
    data.value.nodeProps.conditionNodes.resultFormat[0]['feature'] =
      dictMap.value.featuresOptions.find((item) => item.value === val);
  },
);

//  操作按钮
const btnMap = ref([
  {
    type: 'moveUp',
    active: false,
    icon: 'shangyi',
  },
  {
    type: 'moveDown',
    active: false,
    icon: 'xiayi',
  },
  {
    type: 'del',
    active: false,
    icon: 'shanchu2',
  },
]);
watchEffect(() => {
  if (props.total <= 2) {
    btnMap.value.map((item) => (item.active = false));
  } else {
    if (props.subscript === 0) {
      btnMap.value[0].active = false;
      btnMap.value[1].active = props.total === 2 ? false : true;
    } else if (props.subscript === props.total - 2) {
      btnMap.value[0].active = true;
      btnMap.value[1].active = false;
    } else {
      btnMap.value[0].active = true;
      btnMap.value[1].active = true;
    }

    if (props.total > 2) btnMap.value[2].active = true;
  }
});

// 按钮操作处理
function handler(type, index) {
  emit('handler', type, index);
}

const resultTypeOptions = [
  {
    label: '常量',
    value: 'constant',
  },
  {
    label: '变量',
    value: 'variable',
  },
];

//  添加输出结果
function handleAddResult() {
  resultFormatRef.value.push({
    conditionValue: feature.value || '',
    resultType: 'constant',
    resultValue: '',
  });
}

function onFeatureChange(val, target) {
  emit('onFeatureChage', val);
}

function validate() {
  return new Promise(async (resolve, reject) => {
    const res = await Promise.all([
      rulesetRef.value && rulesetRef.value.validate(),
      formRef.value.validate(),
    ]).catch((e) => {
      reject(e);
    });
    if (!res) return;
    resolve(res && res.flat());
  });
}
</script>

<style lang="scss" scoped>
.ruleset-collection-item {
  box-shadow: var(--el-box-shadow-lighter);
  display: flex;
  flex-direction: column;
  margin: 5px 0 30px;
  border-radius: 5px;
  overflow: hidden;
  .header {
    padding: 10px;
    box-shadow: var(--el-box-shadow-lighter);

    .title {
      font-size: 20px;
      color: rgba(0, 0, 0, 0.5);
    }

    .btns {
      .svg-icon {
        margin-left: 10px;
        background-color: #c8c9cc;
        border-radius: 50%;
        padding: 5px;
        width: 25px;
        height: 25px;
        color: #fff;

        &.active {
          background-color: #909399;
          cursor: pointer;
        }

        &.del {
          background-color: #fab6b6;

          &.active {
            background-color: #f56c6c;
          }
        }
      }
    }
  }

  .main {
    .result {
      .header {
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
        .title {
          font-size: 15px;
          color: rgba(0, 0, 0, 0.5);
          font-weight: bold;
          line-height: 25px;
        }

        .btns .svg-icon {
          background-color: #fff;
          border: 1px solid #c8c9cc;
          color: #c8c9cc;
          cursor: pointer;
        }
      }

      .line {
        width: 100%;
        padding: 20px 10px 0;
        align-items: center;

        :deep(.condition) {
          width: 250px;

          .el-input__wrapper {
            height: 35px;
          }
        }

        .operator {
          color: rgba(0, 0, 0, 0.5);
          margin: 0 10px 18px;
        }

        .end {
          width: 250px;
          display: flex;
          border-radius: 6px;

          :deep(.el-input__wrapper) {
            height: 35px;
          }
        }

        .svg-icon {
          margin-left: 20px;
          margin-bottom: 18px;
          background-color: #fff;
          border: 1px solid #c8c9cc;
          color: #000;
          cursor: pointer;
          border-radius: 50%;
          padding: 5px;
          width: 25px;
          height: 25px;
        }
      }
    }
  }
}
</style>
