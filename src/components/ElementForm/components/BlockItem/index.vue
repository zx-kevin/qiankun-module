<script setup>
import UploadFile from '@/components/UploadFile';

const props = defineProps({
  model: {
    require: true,
    type: Object,
    default: () => {},
  },
  item: {
    require: true,
    type: Object,
    default: () => {},
  },
});

const emailList = [
  { value: '@gmail.com' },
  { value: '@yahoo.com' },
  { value: '@msn.com' },
  { value: '@hotmail.com' },
  { value: '@aol.com' },
  { value: '@ask.com' },
  { value: '@live.com' },
  { value: '@qq.com' },
  { value: '@0355.net' },
  { value: '@163.com' },
  { value: '@163.net' },
  { value: '@263.net' },
  { value: '@3721.net' },
  { value: '@yeah.net' },
  { value: '@googlemail.com' },
  { value: '@mail.com' },
];
// 邮箱自动填充后缀名
function querySearchEmail (queryString, cb) {
  let results = [];
  let queryList = emailList.map((item) => ({
    value: queryString.split('@')[0] + item.value,
  }));
  results = queryString ? queryList.filter(createFilter(queryString)) : queryList;
  cb(results);
}
// 邮箱填写过滤
function createFilter (queryString) {
  return (item) => {
    return item.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0;
  };
}
</script>

<template>
  <!-- 输入框 -->
  <template v-if="item.type === 'input'">
    <el-input
      v-model.trim="model[item.prop]"
      :placeholder="`请输入${item.label}`"
      :disabled="item.disabled"
      clearable
      v-bind="item.otherOptions"
      @input="item.input && item.input($event, model)"
    />
  </template>
  <!-- 金额输入框 -->
  <template v-else-if="item.type === 'money'">
    <el-input
      v-model="model[item.prop]"
      v-decimal
      :placeholder="`请输入${item.label}`"
      :disabled="item.disabled"
      clearable
      v-bind="item.otherOptions"
    />
  </template>
  <!-- 字符串数字输入框 -->
  <template v-else-if="item.type === 'number'">
    <el-input
      v-model="model[item.prop]"
      :placeholder="`请输入${item.label}`"
      :disabled="item.disabled"
      :formatter="(value) => value.replace(/[\D]/g, '')"
      v-bind="item.otherOptions"
    />
  </template>
  <!-- 邮箱 -->
  <template v-else-if="item.type === 'mail'">
    <el-autocomplete
      v-model="model[item.prop]"
      :placeholder="`请输入${item.label}`"
      :disabled="item.disabled"
      :fetch-suggestions="querySearchEmail"
      clearable
      v-bind="item.otherOptions"
      style="width: 100%"
    />
  </template>
  <!-- 下拉单选 -->
  <template v-else-if="item.type === 'select'">
    <el-select
      v-model="model[item.prop]"
      :placeholder="`请选择${item.label}`"
      :disabled="item.disabled"
      clearable
      v-bind="item.otherOptions"
      style="width: 100%"
      @change="item.change && item.change($event, model)"
    >
      <el-option
        v-for="option in item.options"
        :key="option.value"
        :value="option.value"
        :label="option.label"
      >
      </el-option>
    </el-select>
  </template>
  <!-- 日期 -->
  <template v-else-if="item.type === 'datepicker'">
    <el-date-picker
      v-model="model[item.prop]"
      :placeholder="`请选择${item.label}`"
      :disabled="item.disabled"
      unlink-panels
      value-format="YYYY-MM-DD"
      v-bind="item.otherOptions"
      style="width: 100%"
    ></el-date-picker>
  </template>
  <!-- 文件上传 -->
  <template v-else-if="item.type === 'upload'">
    <UploadFile
      v-model="model[item.prop]"
      :disabled="item.disabled"
      size="small"
      v-bind="item.otherOptions"
    />
  </template>
  <template v-else-if="item.type === 'button'">
    <el-button type="primary" v-bind="item.otherOptions" @click="item.handleClick">
      {{ item.content }}
    </el-button>
  </template>
</template>
