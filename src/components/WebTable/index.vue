<template>
  <div class="web-table">
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="tableData"
      :table-layout="tableLayout"
      :height="tableHeight"
      :border="border"
      :row-key="rowKey"
      :row-class-name="tableRowClassName"
      :span-method="spanMethod"
      @select="select"
      @selection-change="selectionChange"
      @select-all="selectAll"
    >
      <!-- 选择框 -->
      <el-table-column
        v-if="hasSelection"
        class-name="selection"
        type="selection"
        :selectable="selectable"
        :resizable="false"
        :fixed="firstColumnFixed ? 'left' : false"
        :width="selectWidth"
      />
      <!-- 序号 -->
      <el-table-column
        v-if="hasIndex"
        align="left"
        label="序号"
        :resizable="false"
        class-name="index"
        fixed="left"
        :width="indexWidth"
      >
        <template #default="scope">
          {{ setIndex(scope.row.index) }}
        </template>
      </el-table-column>
      <!-- 展开列 -->
      <el-table-column v-if="hasExpand" type="expand" :width="expandWidth">
        <template #default="{ row, column, $index }">
          <slot name="expand" :row="row" :column="column" />
        </template>
      </el-table-column>
      <!-- 动态列 -->
      <el-table-column
        v-for="(col, index) in tableColumns"
        :key="index"
        :prop="col.prop"
        :column-key="col.prop"
        :sortable="col.sortable"
        :label="col.label"
        :align="col.align || 'left'"
        :width="widthArr[index]"
        :filters="col.filters"
        :filter-method="col.filterMethod"
        :fixed="col.fixed"
        :class-name="col.img ? 'img' : ''"
      >
        <template #default="{ row, column, $index }">
          <slot :name="col.prop" :row="row" :column="column" :col="col">
            <dynamic-component
              v-if="col.render"
              :render="col.render"
              :row="row"
            ></dynamic-component>
            <el-image
              v-else-if="col.img"
              :src="userStore.fileBase + row[col.prop]"
              :preview-src-list="[userStore.fileBase + row[col.prop]]"
              preview-teleported
              fit="cover"
              style="width: 56px; height: 56px"
            />
            <dict-tag v-else-if="col.dictTag" :options="col.dictTag" :value="row[col.prop] || ''" />
            <tooltip-text
              v-else-if="col.dict"
              :refName="col.prop"
              :content="selectDictLabel(col.dict, row[col.prop])"
            />
            <tooltip-text v-else :refName="col.prop" :content="row[col.prop]" />
          </slot>
        </template>
      </el-table-column>
      <!-- 操作列 -->
      <el-table-column
        v-if="tableOpt"
        fixed="right"
        :label="tableOpt.label"
        :resizable="false"
        class-name="tableOpt"
        align="left"
        :width="tableOptWidth"
      >
        <template #header>
          <div class="opt-label">
            <span>{{ tableOpt.label }}</span>
            <el-icon><Setting /></el-icon>
          </div>
        </template>
        <template #default="scope">
          <template v-for="(arr, length) in getBtnList(scope)">
            <template v-for="(btn, index) in arr">
              <el-button
                v-if="(length > btnLimit && index < btnLimit - 1) || length <= btnLimit"
                :key="index"
                type="primary"
                link
                @click="btn.methods ? btn.methods(scope.row, btn.params) : () => {}"
              >
                <svg-icon v-if="btn.icon" :icon-class="btn.icon"></svg-icon>
                <template v-else>{{ btn.title }}</template>
              </el-button>
            </template>
            <el-popover
              v-if="length > btnLimit"
              trigger="hover"
              placement="bottom-end"
              popper-class="popper-box"
            >
              <template #reference>
                <div class="more-btn">
                  <el-icon><MoreFilled /></el-icon>
                </div>
              </template>
              <template #default>
                <div class="button-list">
                  <template v-for="(btn, index) in arr">
                    <el-button
                      v-if="index >= btnLimit - 1"
                      :key="index"
                      type="primary"
                      text
                      @click="btn.methods ? btn.methods(scope.row, btn.params) : () => {}"
                    >
                      <tooltip-text :refName="btn.title + index" :content="btn.title" />
                    </el-button>
                  </template>
                </div>
              </template>
            </el-popover>
          </template>
        </template>
      </el-table-column>
      <!-- 空状态 -->
      <template v-slot:empty>
        <el-empty :description="description" :image-size="240" />
      </template>
    </el-table>
    <pagination
      v-if="hasPagination"
      ref="paginationRef"
      v-model:page="page"
      v-model:limit="limit"
      :total="total"
      :layout="layout"
      :page-sizes="pageSizes"
      :pager-count="pagerCount"
      :autoScroll="false"
      :disabled="loading"
      :name="name"
      @pagination="pagination"
    />
  </div>
</template>

<script setup>
import useSettingsStore from '@/store/modules/settings';
import useUserStore from '@/store/modules/user.js';
import { debounce } from '@/utils/index.js';

const props = defineProps({
  name: {
    type: String,
    default: '',
  },
  tableCol: {
    type: Array,
    default: () => [],
  },
  tableOpt: {
    type: [Object, Boolean],
    default: () => {},
  },
  tableData: {
    type: Array,
    default: () => [],
  },
  tableLayout: {
    type: String,
    default: 'fixed', // fixed、auto
  },
  /* 首列浮动 */
  firstColumnFixed: {
    type: Boolean,
    default: false,
  },
  /* 展开行 */
  hasExpand: {
    type: Boolean,
    default: false,
  },
  /* 表格边框 */
  border: {
    type: Boolean,
    default: false,
  },
  /* 表格高度 */
  height: {
    type: [Number, String],
    default: '',
  },
  /* 表格最大高度 */
  maxHeight: {
    type: [Number, String],
    default: '',
  },
  /* 开启勾选 */
  hasSelection: {
    type: Boolean,
    default: false,
  },
  /* 开启序号 */
  hasIndex: {
    type: Boolean,
    default: true,
  },
  /* 开启分页 */
  hasPagination: {
    type: Boolean,
    default: true,
  },
  /* 表格行勾选回调 */
  select: {
    type: Function,
    default: () => {},
  },
  /* 表格全选回调 */
  selectAll: {
    type: Function,
    default: () => {},
  },
  /* 设置行勾选是否可用 */
  selectable: {
    type: Function,
    default: () => true,
  },
  /* 合并行或列的计算方法	 */
  spanMethod: {
    type: Function,
    default: () => {},
  },
  rowKey: {
    type: String,
    default: 'id',
  },
  /* 空数据描述 */
  description: {
    type: String,
    default: '暂无数据',
  },
  total: {
    type: Number,
    default: 0,
  },
  layout: {
    type: String,
  },
  pageNum: {
    type: Number,
  },
  pageSize: {
    type: Number,
  },
  pageSizes: {
    type: Array,
  },
  pagerCount: {
    type: Number,
  },
  /* 翻页方法 */
  pagination: {
    type: Function,
    default: () => {},
  },
  /* 单元格最大宽度 */
  cellMaxWidth: {
    type: [Number, String],
    default: 300,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const { proxy } = getCurrentInstance();

const userStore = useUserStore();

const settingsStore = useSettingsStore();

const tableRef = ref(null);
const paginationRef = ref(null);
// 勾选框宽度
const selectWidth = 38;
// 序号列宽度
const indexWidth = 52;
// 展开列宽度
const expandWidth = 48;
// 表格高度
const tableHeight = ref();

const emit = defineEmits(['update:pageNum', 'update:pageSize', 'btnCallBack']);

const dynamicComponent = defineComponent({
  props: ['render', 'row'],
  render() {
    return this.render(this.row);
  },
});

const tableColumns = computed({
  get: () =>
    props.tableCol.filter((column) => {
      // 根据权限配置，跳过特定字段
      // if (column.role && column.role instanceof Array && column.role.length > 0) {
      //   const hasRole = column.role.some(role => role === this.registerType)
      //   if (!hasRole) {
      //     return false
      //   }
      // }
      const { show } = column;
      return show == undefined || show;
    }),
});
const btnLimit = computed({
  get: () => props.tableOpt.btnLimit || 4,
});
const page = computed({
  get: () => props.pageNum,
  set: (val) => {
    emit('update:pageNum', val);
  },
});
const limit = computed({
  get: () => props.pageSize,
  set: (val) => {
    emit('update:pageSize', val);
  },
});

/* 设置行key */
function rowKey(row) {
  return row[props.rowKey] || row.index;
}

const selectionList = ref([]);
/* 添加行索引 */
function tableRowClassName({ row, rowIndex }) {
  row.index = rowIndex;
  // 勾选中的行添加高亮类
  if (selectionList.value.includes(rowIndex)) {
    return 'selection-row';
  }
}
/* 当选择项发生变化时会触发该事件	 */
function selectionChange(selection) {
  selectionList.value = selection.map((item) => item.index);
}

/* 计算序号 */
function setIndex(index) {
  return index + 1 + (page.value - 1) * limit.value;
}

// 操作列宽度
const tableOptWidth = ref(0);
const tableOptList = reactive({});
/* 计算按钮展示条件后返回展示的按钮列表 */
function getBtnList(scope) {
  const arr = props.tableOpt.list.filter((btn) => {
    // 判断权限
    // if (btn.role && btn.role instanceof Array && btn.role.length > 0) {
    //   const hasRole = btn.role.some((role) => {
    //     return role === this.registerType;
    //   });
    //   if (!hasRole) {
    //     return false;
    //   }
    // }
    // 判断按钮展示条件
    return btn.show && btn.show(scope);
  });
  tableOptList[scope.$index + 1] = arr;
  return {
    [arr.length]: arr,
  };
}
/* 自适应按钮宽度 */
function getBtnWidth(objList) {
  const widthList = Object.values(objList).map((arr) => {
    const newArr = arr.filter(
      (item, index) =>
        (arr.length > btnLimit.value && index < btnLimit.value - 1) || arr.length <= btnLimit.value,
    );
    let extra = null;
    if (arr.length > btnLimit.value) {
      extra = 36;
    } else {
      extra = 14;
    }
    return (
      newArr.reduce((width, btn) => {
        let flexWidth = getTextWidth({ text: btn.title, extra: 18 });
        return (width += flexWidth);
      }, 0) + extra
    );
  });
  const max = Math.max(...widthList);
  if (max > 80) {
    tableOptWidth.value = max;
  } else {
    tableOptWidth.value = 80;
  }
  return max;
}
watch(
  () => tableOptList,
  debounce(
    (newValue, oldValue) => {
      getBtnWidth(tableOptList);
      correctionColumn();
    },
    300,
    false,
  ),
  { deep: true },
);

const dynamicColumn = reactive({
  widthArr: [],
  originalWidthArr: [],
});
const { widthArr, originalWidthArr } = toRefs(dynamicColumn);
/* 自适应表格列宽 */
function flexColumnWidth(tableColumns, tableData) {
  if (
    !tableColumns ||
    !tableColumns.length ||
    tableColumns.length === 0 ||
    tableColumns === undefined
  ) {
    return;
  }
  const widthArr = tableColumns.map((item) => {
    if (item.width) {
      return item.width;
    } else {
      let max = 0;
      let text = '';
      // 从数据里面判断出最大值
      tableData.forEach((row) => {
        if (row[item.prop] && row[item.prop].length > max) {
          max = row[item.prop].length;
          text = row[item.prop];
        }
      });
      let textExtra = 24;
      // 字典
      if (item.dict && item.dict[text]) {
        text = item.dict[text].label || text;
        textExtra = 10;
      }
      // tag字典
      if (item.dictTag && item.dictTag[text]) {
        text = item.dictTag[text].label || text;
        textExtra += 30;
      }
      let textWidth = getTextWidth({
        text: text,
        extra: textExtra,
        max: props.cellMaxWidth,
      });
      // 图片
      if (item.img) textWidth = 100;
      let labelExtra = 24;
      // 排序图标
      if (item.sortable) {
        labelExtra += 24;
      }
      // 过滤图标
      if (item.filters) {
        labelExtra += 14;
      }
      const labelWidth = getTextWidth({
        text: item.label,
        extra: labelExtra,
        max: props.cellMaxWidth,
      });
      // 判断内容长度是否大过标题
      if (textWidth > labelWidth) {
        return textWidth;
      } else {
        return labelWidth;
      }
    }
  });
  originalWidthArr.value = widthArr;
  correctionColumn();
}
/* 校正表格宽度（列宽总和小于表格宽度时，将差值分配给动态列宽） */
function correctionColumn() {
  if (!(tableRef.value && tableRef.value.$el)) return;
  let tableWidth = tableRef.value.$el.clientWidth;
  if (tableWidth === 0) {
    return;
  }
  const widthSum = originalWidthArr.value.reduce((sum, w) => sum + w, 0);
  if (props.hasSelection) {
    tableWidth -= selectWidth;
  }
  if (props.hasIndex) {
    tableWidth -= indexWidth;
  }
  if (props.tableCol) {
    tableWidth -= tableOptWidth.value;
  } else {
  }
  if (props.hasExpand) {
    tableWidth -= expandWidth;
  }
  if (widthSum < tableWidth) {
    const surplus = tableWidth - widthSum;
    const average = surplus / originalWidthArr.value.length;
    // 因为表格宽度只会取整数，所有使用Math.floor向取整，再算出误差加在最后一个
    widthArr.value = originalWidthArr.value.map((width) => (width += Math.floor(average))); // 当数据少的时候每次刷新都会重新平均一下宽度，导致向左移动
    const deviation = tableWidth - widthArr.value.reduce((sum, w) => sum + w, 0);
    widthArr.value[widthArr.value.length - 1] += deviation;
  } else {
    widthArr.value = originalWidthArr.value;
  }
}

/* 文字宽度 */
function getTextWidth({ text, extra = 0, min, max }) {
  let flexWidth = 0;
  if (text) {
    for (const char of text) {
      if ((char >= 'A' && char <= 'Z') || (char >= 'a' && char <= 'z')) {
        // 如果是英文字符，为字符分配8个单位宽度
        flexWidth += 8;
      } else if (char >= '\u4e00' && char <= '\u9fa5') {
        // 如果是中文字符，为字符分配14个单位宽度
        flexWidth += 14;
      } else {
        // 其他种类字符，为字符分配8个单位宽度
        flexWidth += 8;
      }
    }
    flexWidth += extra;
  }
  if (min && flexWidth < min) {
    // 设置最小宽度
    flexWidth = min;
  }
  if (max && flexWidth > max) {
    // 设置最大宽度
    flexWidth = max;
  }
  return Number(flexWidth);
}

/* 自适应表格高度 */
function getTableHeight() {
  if (!(proxy.$parent && proxy.$parent.$el)) return;
  let parentEl = proxy.$parent.$el;
  if (parentEl.nodeType !== 1) parentEl = parentEl.nextElementSibling;
  // 获取父组件内边距
  const style = window.getComputedStyle
    ? window.getComputedStyle(parentEl, null)
    : parentEl.currentStyle;
  const paddingBottom = parseFloat(style.paddingBottom);
  // 可视区域高度
  let viewHeight = window.innerHeight || document.documentElement?.clientHeight;
  viewHeight -= 50; // nav = 50

  // 表格对象顶部位置
  let offsetTop = tableRef.value.$el.getBoundingClientRect().top;
  offsetTop -= 50; // nav = 50

  // 翻页组件高度
  let paginationHeight = 0;
  if (props.hasPagination) {
    let paginationEl = paginationRef.value?.$el;
    paginationHeight = paginationEl?.clientHeight;
  }
  // .web-table高度
  let boxHeight = viewHeight - offsetTop - paddingBottom - paginationHeight;
  tableHeight.value = boxHeight;

  // 校正表格高度（父盒子总宽度大于可视区域高度，将大于值减掉）
  nextTick(() => {
    let parentHeight = parentEl.offsetHeight;
    // 是的开启tagsView
    if (settingsStore.tagsView) parentHeight += 34;
    if (parentHeight > viewHeight) {
      tableHeight.value -= parentHeight - viewHeight;
    }
  });
}
watch(
  () => settingsStore.tagsView,
  (newValue, oldValue) => {
    getTableHeight();
  },
);

// 浏览器大小变化
const debounceResize = debounce(
  () => {
    correctionColumn();
    getTableHeight();
  },
  300,
  false,
);
onMounted(() => {
  // 获取表格高度
  getTableHeight();
  // 获取表格宽度
  flexColumnWidth(tableColumns.value, props.tableData);
  // 侦听表格数据变化
  watch(
    () => props.tableData,
    debounce((newValue, oldValue) => flexColumnWidth(tableColumns.value, newValue), 300, true),
    { deep: true },
  );
  // 监听浏览器高度变化
  window.addEventListener('resize', debounceResize);
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', debounceResize);
});
</script>

<style scoped lang="scss">
.web-table {
  width: 100%;
  :deep(.el-table) {
    width: 100%;
    .el-scrollbar__view {
      height: 100%;
    }
    // 表头
    --el-table-header-bg-color: #f7f8fa;
    --el-table-header-text-color: #00001c;
    // 表体
    --el-table-text-color: #2c303b;
    // 鼠标移入颜色
    --el-table-row-hover-bg-color: #f0f2f5;
    // 选中颜色
    .selection-row {
      --el-table-tr-bg-color: #e9eefe;
    }
    // 固定列滚动后表头背景颜色变白色问题
    thead {
      .el-table-fixed-column--right,
      .el-table-fixed-column--left {
        background-color: #f7f8fa;
      }
    }
    // 背景颜色变化动画关闭
    .el-table__cell {
      transition: none;
    }

    .el-table__cell {
      padding: 16px 0;
      // 通用表格子级
      &.img {
        padding: 0;
        .cell {
          display: flex;
          justify-content: center;
        }
      }

      .cell {
        white-space: nowrap;
      }
    }

    .selection {
      .cell {
        display: flex;
      }
    }
  }
}
// 固定列选中不高亮问题
:deep(.el-table__body-wrapper) {
  .selection,
  .index,
  .tableOpt {
    background: inherit;
  }
}
// 更多按钮
.more-btn {
  display: inline-block;
  margin-left: 12px;
  vertical-align: middle;
  cursor: pointer;
  .el-icon {
    font-size: 10px;
    color: var(--el-color-primary);
  }
}
// 按钮超出三个
.button-list {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  .el-button {
    width: 100%;
    margin: 0;
    border: none;
    --el-font-size-base: 12px;
    :deep(span) {
      width: 100%;
    }
  }
}
// 操作按钮表头
.opt-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  span {
    margin-right: 10px;
  }
}
</style>
