<!--
 * @Author: K
 * @Date: 2023-02-14 15:18:39
 * @Descripttion: 组件 - 规则集
 * @FilePath: \decision_engine_ui\src\components\Ruleset\index.vue
 * @LastEditors: K
 * @LastEditTime: 2023-03-16 16:35:11
-->
<template>
  <div class="rule-set-component">
    <rule-set-item
      ref="itemRef"
      v-for="(item, index) in data"
      :key="`item_${index}`"
      :data="item"
      :options="options"
      :menu="menu"
    ></rule-set-item>
  </div>
</template>

<script setup>
import RuleSetItem from './item.vue';

const itemRef = ref();
const emit = defineEmits(['confirm']);
const props = defineProps({
  data: {
    type: Array,
    require: true,
  },
  options: {
    type: Array,
    default: [],
  },
  menu: {
    type: Array,
    default: () => [
      {
        label: '添加规则',
        icon: 'caidan',
        type: 'addRule',
      },
      {
        label: '添加关系',
        icon: 'caidan',
        type: 'addRelation',
      },
    ],
  },
});
const { data } = toRefs(props);

defineExpose({
  validate,
});

function validate () {
  return new Promise(async (resolve, reject) => {
    const res = await Promise.all([...(itemRef.value ?? []).map((item) => item.validate())]).catch(
      (e) => {
        reject(e);
      },
    );
    resolve(res && res.flat());
  });
}
</script>

<style lang="scss" scoped>
.rule-set-component {
  width: 100%;
  height: 100%;
  padding-bottom: 10px;
  overflow-x: auto;
  padding: 20px 20px 0;

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
