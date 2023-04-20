<template>
  <div class="dec">
    <el-scrollbar max-height="470" class="dec_box" wrap-class="dec_wrap">
      <div class="dec_top">
        <!-- 空白表头 -->
        <div class="dec_table_header" :style="{ width: connectWidth + 'px' }"></div>
        <!-- 横向表头 -->
        <div class="dec_table_comm">
          <TopRecursion :list="topList" :conditionNodes="conditionNodes" :key="updateKey" />
        </div>
      </div>

      <div class="dec_cont">
        <!-- 竖向表头 -->
        <div ref="leftColumnRef" class="left-column">
          <LeftRecursion :list="leftList" :conditionNodes="conditionNodes" :key="updateKey" />
        </div>

        <tbody>
          <tr class="table__row" v-for="(arr, index) in resultList" :key="index">
            <td class="table__cell" v-for="(item, i) in arr" :key="i">
              <textInput v-model="item.nodeProps.result" />
            </td>
          </tr>
        </tbody>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup>
import TopRecursion from './components/TopRecursion';
import LeftRecursion from './components/LeftRecursion';
import textInput from './components/textInput';
import bus from './bus.js';

defineExpose({ init, update, validate });

const props = defineProps({
  data: {
    type: Object,
  },
  loading: {
    type: Boolean,
    default: true,
  },
});

const { leftDecisionNodes: leftList, topDecisionNodes: topList, resultList } = toRefs(props.data);

const leftColumnRef = ref();

const connectWidth = ref(200);

const lastData = reactive({
  leftLast: [],
  leftLastobj: [],
  topLast: [],
  TopLastobj: [],
});

const { leftLast, leftLastobj, topLast, TopLastobj } = toRefs(lastData);

const conditionNodes = {
  nodeName: '',
  nodeType: 'and',
  children: [
    {
      nodeName: '',
      nodeType: 'arith',
      nodeProps: {
        leftFeatureType: '',
        leftValue: '',

        leftFeatureCode: '',
        leftFeatureName: '',
        leftValueType: '',

        operator: '',

        rightFeatureType: 'value',
        rightValue: '',

        rightFeatureCode: '',
        rightFeatureName: '',
        rightValueType: '',

        nodeType: 'arith',
      },
    },
  ],
};
const resultTemplate = {
  nodeName: '',
  nodeType: 'result',
  nodeProps: {
    nodeType: 'result',
    result: '0',
  },
};

function init () {
  leftList.value = [
    {
      nodeName: '',
      nodeType: 'tableLeftCondition',
      nodeProps: {
        nodeType: 'tableLeftCondition',
        conditionNodes: JSON.parse(JSON.stringify(conditionNodes)),
      },
      children: [],
      random: Math.random(),
    },
  ];
  topList.value = [
    {
      nodeName: '',
      nodeType: 'tableTopCondition',
      nodeProps: {
        nodeType: 'tableTopCondition',
        conditionNodes: JSON.parse(JSON.stringify(conditionNodes)),
      },
      children: [],
      random: Math.random(),
    },
  ];
  resultList.value = [[JSON.parse(JSON.stringify(resultTemplate))]];
  getLast();
}

const updateKey = ref(0);

function update () {
  updateKey.value++;
}

function getLast () {
  leftLastobj.value = [];
  TopLastobj.value = [];
  getleftLast().then((res) => {
    leftLast.value = res;
  });
  gettopLast().then((res) => {
    topLast.value = res;
  });
  getLastObj(leftLastobj.value, leftList.value);
  getLastObj(TopLastobj.value, topList.value);
}

function addTop () {
  gettopLast().then((res) => {
    getLast();
    if (res.length === topLast.value.length) {
      topLast.value = res;
      return;
    }
    for (let i = 0; i < res.length; i++) {
      if (topLast.value[i] != res[i]) {
        resultList.value.forEach((value) => {
          value.splice(
            i,
            JSON.parse(JSON.stringify(resultTemplate)),
            JSON.parse(JSON.stringify(resultTemplate)),
          );
        });
        topLast.value = res;
        return;
      }
    }
  });
}
function addLeft () {
  getleftLast().then((res) => {
    getLast();
    if (res.length == leftLast.value.length) {
      leftLast.value = res;
      return;
    }
    for (let i = 0; i < res.length; i++) {
      if (leftLast.value[i] != res[i]) {
        gettopLast().then((res) => {
          let arr = [];
          res.forEach((value) => {
            arr.push(JSON.parse(JSON.stringify(resultTemplate)));
          });
          resultList.value.splice(i, 0, arr);
        });
        leftLast.value = res;
        return;
      }
    }
  });
}

function copyTop (data) {
  let arr = []; //总对象
  let copearr = []; // 插入的索引
  let datalist = []; // 取出的对象
  let datalistarr = []; // 取出的对象 在总对象索引
  let temparr = []; //临时储存即将插入的内容
  getLastObj(arr, topList.value);
  arr.forEach((value, index) => {
    let is = true;
    TopLastobj.value.forEach((item) => {
      if (item == value) {
        is = false;
      }
    });
    if (is) {
      copearr.push(index);
    }
  });
  getLastObj(datalist, [data]);
  datalist.forEach((value) => {
    arr.forEach((item, index) => {
      if (item == value) {
        datalistarr.push(index);
      }
    });
  });
  resultList.value.forEach((item) => {
    copearr.forEach((value, index) => {
      item.splice(value, 0, JSON.parse(JSON.stringify(item[datalistarr[index]])));
    });
  });
  TopLastobj.value = arr;

  getLast();
}
function copyLeft (data) {
  let arr = []; //总对象
  let copearr = []; // 插入的索引
  let datalist = []; // 取出的对象
  let datalistarr = []; // 取出的对象 在总对象索引
  let temparr = []; //临时储存即将插入的内容
  getLastObj(arr, leftList.value);
  arr.forEach((value, index) => {
    let is = true;
    leftLastobj.value.forEach((item) => {
      if (item == value) {
        is = false;
      }
    });
    if (is) {
      copearr.push(index);
    }
  });
  getLastObj(datalist, [data]);
  datalist.forEach((value) => {
    arr.forEach((item, index) => {
      if (item == value) {
        datalistarr.push(index);
      }
    });
  });

  datalistarr.forEach((value) => {
    temparr.push(resultList.value[value]);
  });
  resultList.value.splice(copearr[0], 0, ...JSON.parse(JSON.stringify(temparr)));
  leftLastobj.value = arr;
  getLast();
}

function deleteTop () {
  let arr = [];
  let delectarr = [];
  getLastObj(arr, topList.value);
  if (arr.length == TopLastobj.value.length) {
    TopLastobj.value = arr;
    getLast();
    return;
  }

  TopLastobj.value.forEach((value, index) => {
    let is = true;
    arr.forEach((item) => {
      if (item == value) {
        is = false;
      }
    });
    if (is) {
      delectarr.push(index);
    }
  });
  TopLastobj.value = arr;

  delectarr.forEach((value) => {
    resultList.value.forEach((item) => {
      item[value] = null;
    });
  });
  resultList.value = resultList.value.map((value) => value.filter((item) => item !== null));
  getLast();
}
function deleteLeft () {
  let arr = [];
  let delectarr = [];
  getLastObj(arr, leftList.value);
  if (arr.length == leftLastobj.value.length) {
    leftLastobj.value = arr;
    getLast();
    return;
  }
  leftLastobj.value.forEach((value, index) => {
    let is = true;
    arr.forEach((item) => {
      if (item == value) {
        is = false;
      }
    });
    if (is) {
      delectarr.push(index);
    }
  });
  leftLastobj.value = arr;

  delectarr.forEach((value) => {
    delete resultList.value[value];
  });
  resultList.value = resultList.value.filter((value) => value);
  getLast();
}

function getLastObj (arr, obj) {
  if (!Array.isArray(obj)) {
    return;
  }
  obj.forEach((value) => {
    if (value.children.length > 0) {
      getLastObj(arr, value.children);
    } else {
      arr.push(value);
    }
  });
}

async function getleftLast () {
  let arr = [];
  await nextTick(() => {
    arr = document.querySelectorAll('.leftlast');
  });
  return arr;
}
async function gettopLast () {
  let arr = [];
  await nextTick(() => {
    arr = document.querySelectorAll('.toplast');
  });
  return arr;
}

function validate (fn) {
  const arr = [];
  bus.emit('validate', (v) => arr.push(v));
  const valid = arr.every((item) => item);
  fn && fn(valid);
  return new Promise((resolve, reject) => {
    if (valid) {
      resolve(valid);
    } else {
      reject(valid);
    }
  });
}

onMounted(() => {
  bus.on('reCount', ({ type, data }) => {
    switch (type) {
      case 'addLeft':
        addLeft();
        break;
      case 'addTop':
        addTop();
        break;
      case 'deleteLeft':
        deleteLeft();
        break;
      case 'deleteTop':
        deleteTop();
        break;
      case 'copyLeft':
        copyLeft(data);
        break;
      case 'copyTop':
        copyTop(data);
        break;
    }
  });
  watch(
    () => leftList.value,
    (newValue, oldValue) => {
      nextTick(() => {
        connectWidth.value = leftColumnRef.value.offsetWidth;
      });
    },
    {
      immediate: true,
      deep: true,
    },
  );
  watch(
    () => props.loading,
    (newValue, oldValue) => {
      if (!newValue) getLast();
    },
  );
});
onBeforeUnmount(() => {
  bus.off('reCount');
});
</script>

<style lang="scss" scoped>
.dec {
  width: 100%;
  height: 100%;
  .dec_box {
    display: flex;
    :deep(.dec_wrap) {
      border: 1px solid $--border-color-default;
    }
    .dec_top {
      display: flex;

      .dec_table_header {
        width: 200px;
        flex-shrink: 0;
        &:hover {
          background-color: $--fill-color-default;
        }
      }
    }
    .dec_cont {
      display: flex;
    }
  }
}
.table__row {
  height: 80px;
  display: flex;
  border-top: 1px solid $--border-color-default;
  box-sizing: border-box;
}
.table__cell {
  width: 200px;
  height: 80px;
  text-align: center;
  line-height: 80px;
  border-left: 1px solid $--border-color-default;
  color: $--text-color-20;
  &:hover {
    background-color: $--fill-color-default;
  }
}
</style>
