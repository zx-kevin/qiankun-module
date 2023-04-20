<template>
  <div class="layout-container">
    <header v-if="slots.header" class="layout-header">
      <slot name="header" />
    </header>
    <main class="layout-main">
      <el-scrollbar view-style="height:100%">
        <slot />
      </el-scrollbar>
    </main>
    <footer v-if="slots.footer" class="layout-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script name="LayoutContainer" setup>
const slots = useSlots();
const mainHeight = computed(() => {
  let sum = 0;
  if (slots.header) sum += 50;
  if (slots.footer) sum += 60;
  return sum + 'px';
});
</script>

<style lang="scss" scoped>
.layout-container {
  width: 100%;
  height: calc(100vh - 84px);
  .layout-header {
    height: 50px;
    background-color: #fff;
    box-shadow: 0 2px 10px 0 rgb(31 39 70 / 10%);
  }
  .layout-main {
    height: calc(100% - v-bind(mainHeight));
    background-color: $--background-color-default;
  }
  .layout-footer {
    height: 60px;
    background-color: #fff;
    box-shadow: 0 2px 10px 0 rgb(31 39 70 / 10%);
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}
</style>
