<template>
  <div class="textInput_box" :class="{ error: error }">
    <div class="textInput" v-show="!showInput" @click="showInput = true">
      <tooltip-text :content="value === '' ? '单击编辑' : value" />
    </div>
    <el-input-number
      v-if="inputType === 'Number'"
      v-show="showInput"
      ref="inputRef"
      v-model="value"
      :controls="false"
      v-bind="otherOptions"
      @blur="showInput = false"
    />
    <el-input
      v-else
      v-show="showInput"
      ref="inputRef"
      v-model="value"
      maxlength="30"
      showWordLimit
      clearable
      v-bind="otherOptions"
      @blur="showInput = false"
    />
  </div>
</template>

<script setup>
import bus from '../../bus.js';
const props = defineProps({
  modelValue: {
    type: [String, Number],
  },
  inputType: {
    type: String,
    default: 'input',
  },
  otherOptions: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:modelValue']);
const value = computed({
  get: () => (props.inputType === 'Number' ? Number(props.modelValue) : props.modelValue),
  set: (val) => {
    emit('update:modelValue', val);
    if (val) error.value = false;
  },
});
const inputRef = ref();
const showInput = ref(false);

const error = ref(false);

watch(
  () => showInput.value,
  (newValue, oldValue) => {
    if (newValue) {
      inputRef.value.focus();
    } else {
    }
  },
);

onMounted(() => {
  bus.on('validate', (fn) => {
    error.value = value.value === '' ? true : false;
    fn && fn(!error.value);
  });
});
onBeforeUnmount(() => {
  bus.off('validate');
});
</script>

<style lang="scss" scoped>
.textInput_box {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  color: $--text-color-10;
  font-size: 14px;
  &.error {
    background-color: $--primary-red-4;
  }
}
.textInput {
  width: 100%;
  height: 100%;
  padding: 0 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
