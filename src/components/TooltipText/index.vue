<script setup name="TooltipText">
import { debounce } from '@/utils/index.js';
const { proxy } = getCurrentInstance();
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  // popper类名
  popperClass: {
    type: String,
    default: '',
  },
  // 主题 dark/light
  effect: {
    type: String,
    default: 'dark',
  },
  // text内容
  content: {
    type: [String, Number],
    default: '',
  },
  // tooltip出现的位置
  placement: {
    type: String,
    default: 'bottom',
  },
  // 鼠标是否可进入到 tooltip 中
  enterable: {
    type: Boolean,
    default: true,
  },
  // 出现位置的偏移量
  offset: {
    type: Number,
    default: 0,
  },
  // 定义渐变动画
  transition: {
    type: String,
    default: 'el-fade-in-linear',
  },
  // 是否显示 tooltip 箭头
  showArrow: {
    type: Boolean,
    default: true,
  },
  // popper.js 的参数  参考 https://popper.js.org/documentation.html
  popperOptions: {
    type: Object,
    default: () => {
      return {
        boundariesElement: 'body',
        gpuAcceleration: false,
      };
    },
  },
  className: {
    type: String,
    default: '',
  },
  styleName: {
    type: String,
    default: '',
  },
  refName: {
    type: String,
    default: 'tooltip-text',
  },
});

const tooltipDisabled = ref(true);

const text = computed(() =>
  String(
    props.content === '' || props.content == null || props.content == undefined
      ? '-'
      : props.content,
  ),
);
const onMouseOver = debounce(
  (str) => {
    if (props.disabled) {
      tooltipDisabled.value = props.disabled;
      return;
    }
    if (!proxy.$refs[str]) return;
    let parentWidth = proxy.$refs[str].parentNode.offsetWidth;
    let contentWidth = proxy.$refs[str].offsetWidth;
    if (contentWidth > parentWidth) {
      tooltipDisabled.value = false;
    } else {
      tooltipDisabled.value = true;
    }
  },
  500,
  true,
);
</script>

<template>
  <el-tooltip
    :popper-class="popperClass"
    :effect="effect"
    :content="text"
    :placement="placement"
    :disabled="tooltipDisabled"
    :enterable="enterable"
    :offset="offset"
    :transition="transition"
    :show-arrow="showArrow"
    :popper-options="popperOptions"
  >
    <div class="tooltip-text" :class="props.className" @mouseover="onMouseOver(refName)">
      <span :ref="refName" :class="props.styleName">{{ text }}</span>
    </div>
  </el-tooltip>
</template>

<style>
.tooltip-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
