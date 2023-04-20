<template>
  <div
    class="arbit-progress"
    :style="{
      width:
        props.direction == 'horizontal' &&
        props.stepList[props.stepList.length - 1]?.description == 'horizontal'
          ? 'calc(100% - 210px)'
          : 'calc(100% - 100px)',
    }"
  >
    <el-steps :active="props.active" :direction="props.direction">
      <el-step
        v-for="(item, index) in props.stepList"
        :title="item?.title"
        :icon="item?.icon"
        :status="item.status || ''"
        :description="item.description || ''"
        :style-obj="styleObj"
      >
        <template #icon>
          <img
            v-if="props.active > index"
            style="width: 24px"
            src="@/assets/images/checked.png"
            alt=""
          />
          <div v-else-if="props.active == index" class="circlebox">
            <!-- {{ index + 1 }} -->
            <img style="width: 24px" src="@/assets/images/gougou.png" alt="" />
          </div>
          <div v-else class="circlebox" :class="props.active + 1 <= index ? 'is-wait' : ''">
            {{ index + 1 }}
          </div>
        </template>
      </el-step>
    </el-steps>
  </div>
</template>

<script lang="ts" setup>
interface stepType {
  title: String;
  icon: Object;
  [key: string]: any;
}
// const emit = defineEmits(['upload:active']);
const props = defineProps({
  active: {
    type: Number,
    default: 0,
    required: true,
  },
  stepList: {
    type: Array as () => stepType[],
    required: true,
  },
  // 方向 vertical/horizontal
  direction: {
    type: String,
    default: 'horizontal',
    validator: (val) => ['vertical', 'horizontal'].includes(val as string),
  },
});

const styleObj = computed(() => {
  return {
    stepList_length: props.stepList.length,
  };
});
</script>

<style scoped lang="scss">
.el-step__head.is-finish {
  border-color: $--border-color-default;
  // border: 1px dashed;
}
.arbit-progress {
  padding-bottom: 20px;
  height: 100%;
  :deep(.el-step__title.is-finish),
  :deep(.el-step__title) {
    color: $--text-color-10;
  }
  :deep(.el-step__description) {
    color: $--text-color-70;
    font-size: 14px;
  }
}

// 横向布局
.arbit-progress :deep(.el-steps--horizontal) {
  position: relative;
  // 虚线
  .el-step__line {
    background: url('@/assets/images/dashed.png');
    background-size: contain;
    position: relative;
    margin-right: 20px;
    &::after {
      content: '';
      right: -20px;
      position: absolute;
      top: 0;
      width: 12px;
      height: 12px;
      border: 2px solid $--border-color-default;
      border-bottom: 0;
      border-left: 0;
      transform: translate(-50%, -50%) rotate(45deg);
    }
  }
  .el-step__head {
    border-color: transparent;
  }

  // 内容定位
  .el-step__main {
    width: calc(100% - 50px);
    position: absolute;
    top: -5px;
    left: 41px;
    .el-step__title {
      width: fit-content;
      background: #fff;
      padding-right: 20px;
    }
  }

  :deep(.el-step__icon.is-text) {
    border: 0;
  }
  :deep(.el-step__title) {
    font-size: 12px;
  }
  :deep(.el-step__title.is-finish),
  :deep(.el-step__title.is-process),
  :deep(.el-step__title.is-wait),
  :deep(.el-step__description.is-wait) {
    color: inherit;
    font-weight: initial;
  }
  :deep(.el-step__description.is-finish),
  :deep(.el-step__description.is-wait),
  :deep(.el-step.is-center) .el-step__description {
    color: #9da0a7;
  }
  :deep(.el-step__head) {
    .el-step__icon {
      width: 35px;
    }
    .el-step__line {
      background: $--primary-blue-default;
      height: 1px;
      overflow: hidden;
    }
    &.is-wait {
      .el-step__line {
        background: url('~@/assets/images/dashed.png');
        background-size: contain;
      }
    }
  }
}
// 纵向布局
.arbit-progress :deep(.el-steps--vertical) {
  position: relative;
  // 虚线
  .el-step__line {
    background: url('@/assets/images/dashed-vertical.png');
    background-size: cover;
    // position: relative;
    margin-bottom: 20px;
    margin-top: 30px;
    &::after {
      content: '';
      right: -4px;
      position: absolute;
      bottom: -15px;
      width: 10px;
      height: 10px;
      border: 1px solid $--text-color-70;
      border-top: 0;
      border-left: 0;
      transform: translate(0, -50%) rotate(45deg);
    }
  }
  .el-step__head {
    border-color: transparent;
  }

  :deep(.el-step__icon.is-text) {
    border: 0;
  }
  :deep(.el-step__title) {
    font-size: 12px;
  }
  :deep(.el-step__title.is-finish),
  :deep(.el-step__title.is-process),
  :deep(.el-step__title.is-wait),
  :deep(.el-step__description.is-wait) {
    color: inherit;
    font-weight: initial;
  }
  :deep(.el-step__description.is-finish),
  :deep(.el-step__description.is-wait),
  :deep(.el-step.is-center) .el-step__description {
    color: #9da0a7;
  }
  :deep(.el-step__head) {
    .el-step__icon {
      width: 35px;
    }
    .el-step__line {
      background: $--primary-blue-default;
      height: 1px;
      overflow: hidden;
    }
    &.is-wait {
      .el-step__line {
        background: url('~@/assets/images/dashed.png');
        background-size: contain;
      }
    }
  }
}

.circlebox {
  width: 24px;
  height: 24px;
  border: 2px solid $--primary-blue-default;
  border-radius: 50%;
  background: $--primary-blue-default;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  &.is-wait {
    border: 2px solid #c9ccd6;
    background: #c9ccd6;
  }
}
</style>
