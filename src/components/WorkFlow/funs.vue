<template>
  <div class="work-flow-funs">
    <div class="item" v-for="(item, index) in map" :key="`fun_${index}`">
      <svg-icon
        :icon-class="item.icon"
        :title="item.label"
        @click="item.fn && item.fn()"
      ></svg-icon>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  graph: {
    type: Object,
    require: true,
  },
});
const { graph } = toRefs(props);

const map = [
  {
    icon: 'dingwei',
    lable: '居中定位',
    fn: () => {
      graph.value.zoomToFit({ maxScale: 1 });
      graph.value.centerContent({
        animation: {},
      });
    },
  },
];
</script>

<style lang="scss" scoped>
.work-flow-funs {
  position: absolute;
  right: 15px;
  bottom: 15px;

  .item {
    padding: 8px;
    border-radius: 5px;

    &:hover {
      box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.12);
    }

    .svg-icon {
      font-size: 25px;
    }
  }
}
</style>
