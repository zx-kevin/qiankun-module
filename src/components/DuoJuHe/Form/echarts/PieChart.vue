<template>
  <div :class="className" :style="{ height: height, width: width }" />
</template>

<script>
import { nextTick } from 'vue';
import echarts from 'echarts';
import 'echarts/theme/macarons'; // echarts theme
import resize from './mixins/resize';

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart',
    },
    width: {
      type: String,
      default: '100%',
    },
    height: {
      type: String,
      default: '300px',
    },
    chartOption: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      chart: null,
    };
  },
  setup() {},
  watch: {
    chartOption: {
      deep: true,
      handler(val) {
        this.setOptions(val);
      },
    },
  },
  mounted() {
    nextTick(() => {
      this.initChart();
    });
  },
  beforeDestroy() {
    if (!this.chart) {
      return;
    }
    this.chart.dispose();
    this.chart = null;
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons');
      this.setOptions(this.chartOption);
    },
    setOptions(chartOption) {
      this.chart.setOption(chartOption);
    },
  },
};
</script>
