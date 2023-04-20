<template>
  <LayoutContainer>
    <el-form
      class="app-container"
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      label-position="left"
    >
      <el-row :gutter="10">
        <el-col :span="12">
          <el-form-item label="规则名称" prop="decisionName">
            <el-input
              v-model="form.decisionName"
              maxlength="100"
              showWordLimit
              :disabled="status === 1"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="规则描述" prop="decisionRemark">
            <el-input
              v-model="form.decisionRemark"
              maxlength="200"
              showWordLimit
              :disabled="status === 1"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="24">
          <el-form-item label="版本描述" prop="versionRemark">
            <el-input v-model="form.versionRemark" maxlength="200" showWordLimit />
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 版本 -->
      <el-row v-if="decisionNo" justify="space-between">
        <el-row class="line">
          <el-form-item label="规则版本" prop="versionNo">
            <el-select
              v-model="form.versionNo"
              :disabled="status === 1"
              @change="handleVersionChange"
            >
              <el-option
                v-for="item in versionOptions"
                :key="`version_${item.versionNo}`"
                :label="item.versionNo"
                :value="item.versionNo"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-row>

        <el-row justify="end" style="margin-left: 10px">
          <template v-if="status !== 1">
            <el-popconfirm title="确定删除该版本？" width="200" @confirm="handleDelVersion">
              <template #reference>
                <el-button type="danger" :disabled="versionOptions.length < 2">删除版本</el-button>
              </template>
            </el-popconfirm>
            <el-button @click="() => (status = 1)">新增版本</el-button>
          </template>
          <template v-else>
            <el-button @click="() => (status = 0)">取消新增版本</el-button>
            <el-button type="primary" @click="handleSave">保存新增版本</el-button>
          </template>
        </el-row>
      </el-row>
      <el-row v-else class="line">
        <el-form-item label="规则版本" prop="versionNo">
          <el-select model-value="1" disabled @change="handleVersionChange">
            <el-option label="V1" value="1" />
          </el-select>
        </el-form-item>
      </el-row>

      <div class="ruleset-collection-item">
        <el-row class="header" justify="space-between">
          <div class="title">输入</div>
        </el-row>
        <div class="main">
          <ScoreTable
            ref="scoreTableRef"
            :data="form.decisionNodes"
            :computeMode="form.fieldsScore.computeMode"
          />
          <div class="result">
            <el-row class="header" justify="space-between">
              <div class="title">计算方式</div>
            </el-row>

            <el-row class="line">
              <el-form-item prop="fieldsScore.computeMode" label-width="0">
                <el-select class="condition" v-model="form.fieldsScore.computeMode">
                  <el-option label="求和" value="1" />
                  <el-option label="加权求和" value="2" />
                </el-select>
                <div class="operator">-</div>
                <div class="alert">
                  <el-alert
                    title="计算方式为求和权重总和为0，加权求和权重总和为100"
                    type="info"
                    show-icon
                    :closable="false"
                  />
                </div>
              </el-form-item>
            </el-row>
          </div>
          <div class="result">
            <el-row class="header" justify="space-between">
              <div class="title">输出</div>
            </el-row>

            <el-row class="line">
              <el-form-item prop="resultOutputCode" label-width="0">
                <el-select class="condition" v-model="form.resultOutputCode">
                  <el-option
                    v-for="item in featuresOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
                <div class="operator">=</div>

                <div class="end">
                  <el-input value="决策结果" disabled class="end"></el-input>
                </div>
              </el-form-item>
            </el-row>
          </div>
        </div>
      </div>
    </el-form>

    <template v-if="status !== 1" #footer>
      <el-button size="large" @click="handleClose">取消</el-button>
      <el-button type="primary" size="large" @click="handleSave">保存</el-button>
    </template>
  </LayoutContainer>
</template>

<script setup>
import LayoutContainer from '@/components/LayoutContainer';
import ScoreTable from '@/components/ScoreTable';
import {
  insertDecisionApi, // 新增决策
  updateDecisionApi, // 修改决策
  addVersionApi, // 新增决策版本
  getDecisionDetailApi, // 查询决策详细
  deleteVersionApi, // 删除版本
  getVersionInfoApi, // 查询决策版本详细
} from '@/api/module/decision/ruleset';
import {
  getLibFeatureOptionsApi, //  查询特征库选择框选项
} from '@/api/module/feature';

const router = useRouter();
const { decisionNo } = router.currentRoute.value.params;

const { proxy } = getCurrentInstance();
const { operator } = proxy.useDict('operator');

const loading = ref(true);
const formRef = ref();
const scoreTableRef = ref();
// 特征库变量选项
const featuresOptions = ref([]);

const data = reactive({
  form: {
    fieldsScore: {
      computeMode: '1',
    },
    decisionNodes: [],
  },
  rules: {
    decisionName: { required: true, message: '请填写规则名称', trigger: 'blur' },
    decisionRemark: { required: true, message: '请填写规则描述', trigger: 'blur' },
    'fieldsScore.computeMode': { required: true, message: '请选择计算方式', trigger: 'change' },
    resultOutputCode: { required: true, message: '请选择输出', trigger: 'change' },
  },
});

const { form, rules } = toRefs(data);

const decisionNodesCopy = ref([]);

const computeModeCopy = ref('');
const resultOutputCodeCopy = ref('');

const versionNoCopy = ref('');

const versionRemarkCopy = ref('');

const versionOptions = ref([]);

const status = ref(0); // 0新增，1取消新增，2空状态
watch(
  () => status.value,
  (newValue, oldValue) => {
    if (newValue === 0) {
      form.value.versionNo = versionNoCopy.value;
      form.value.fieldsScore.computeMode = computeModeCopy.value;
      computeModeCopy.value = '';
      form.value.resultOutputCode = resultOutputCodeCopy.value;
      resultOutputCodeCopy.value = '';

      form.value.versionRemark = versionRemarkCopy.value;
      versionRemarkCopy.value = '';
      form.value.decisionNodes = JSON.parse(JSON.stringify(decisionNodesCopy.value));
      scoreTableRef.value.update();
    }
    if (newValue === 1) {
      let max = 1;
      versionOptions.value.forEach((item) => {
        if (max <= item.versionNo.substring(1)) {
          max = +item.versionNo.substring(1) + 1;
        }
      });
      versionNoCopy.value = form.value.versionNo;
      form.value.versionNo = `V${max}`;
      computeModeCopy.value = form.value.fieldsScore.computeMode;
      form.value.fieldsScore.computeMode = '1';
      resultOutputCodeCopy.value = form.value.resultOutputCode;
      form.value.resultOutputCode = '';

      versionRemarkCopy.value = form.value.versionRemark;
      form.value.versionRemark = '';
      decisionNodesCopy.value = JSON.parse(JSON.stringify(form.value.decisionNodes));
      scoreTableRef.value.init();
    }
  },
);

function handleClose () {
  // router.push('/decision');
  proxy.$tab.closeOpenPage({
    path: '/decision',
    query: {
      type: 'score',
    },
  });
}

// 提交
function handleSave () {
  formRef.value.validate(async (valid) => {
    if (valid) {
      await scoreTableRef.value.validate();
      proxy.$confirm(
        `您确定提交吗？${decisionNo ? '提交后可继续在当前页面进行操作' : ''}`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          beforeClose: async (action, ctx, close) => {
            if (action !== 'confirm') {
              !ctx.confirmButtonLoading && close();
              return;
            }
            ctx.confirmButtonLoading = true;
            const obj = {};
            getFeaturePool(form.value.decisionNodes, obj);
            try {
              let res, isClose;
              const params = {
                ...form.value,
                decisionType: 'score',
                featurePool: Object.values(obj).filter((item) => item),
              };
              if (decisionNo) {
                isClose = false;
                if (status.value !== 1) {
                  res = await updateDecisionApi(params);
                } else {
                  delete params.decisionId;
                  res = await addVersionApi(params);
                }
              } else {
                delete params.decisionId;
                isClose = true;
                res = await insertDecisionApi(params);
              }
              if (res.code === 200) {
                proxy.$message({
                  message: res.msg,
                  type: 'success',
                });
                close();
                status.value = 2;
                dataUpdate(res.data);
                if (isClose) handleClose();
              }
              ctx.confirmButtonLoading = false;
            } catch (error) {
              ctx.confirmButtonLoading = false;
            }
          },
        },
      );
    } else {
      scoreTableRef.value.validate();
    }
  });
}

const typeMap = {
  gen: 'useFeatureCode',
  sql: 'sqlVariabel',
  api: 'sourceVariable',
};

function getFeaturePool (arr, obj) {
  arr.forEach((item) => {
    if (item.children && item.children.length) {
      getFeaturePool(item.children, obj);
    }
    if (item.nodeType === 'condition') {
      recursionInner(item.nodeProps.conditionNodes.children, obj);
    }
  });
}
function recursionInner (arr, obj) {
  arr.forEach((item) => {
    if (item.children && item.children.length) {
      recursionInner(item.children, obj);
    } else {
      if (item.nodeProps.leftFeatureType !== 'value') {
        const key = typeMap[item.nodeProps.leftFeature.featureType];
        if (key) {
          const arr = JSON.parse(item.nodeProps.leftFeature[key]);
          const newArr = featuresOptions.value.filter((i) => arr.includes(i.featureCode));
          newArr.forEach((e) => {
            obj[e.featureCode] = e;
          });
        }
        obj[item.nodeProps.leftFeatureCode] = item.nodeProps.leftFeature;
      }
      if (item.nodeProps.rightFeatureType !== 'value') {
        const key = typeMap[item.nodeProps.rightFeature.featureType];
        if (key) {
          const arr = JSON.parse(item.nodeProps.rightFeature[key]);
          const newArr = featuresOptions.value.filter((i) => arr.includes(i.featureCode));
          newArr.forEach((e) => {
            obj[e.featureCode] = e;
          });
        }
        obj[item.nodeProps.rightFeatureCode] = item.nodeProps.rightFeature;
      }
    }
  });
}

function setFeaturePool (arr, featurePool) {
  arr.forEach((item) => {
    if (item.children && item.children.length) {
      setFeaturePool(item.children, featurePool);
    }
    if (item.nodeType === 'condition') {
      setRecursionInner(item.nodeProps.conditionNodes.children, featurePool);
    }
  });
}
function setRecursionInner (arr, featurePool) {
  arr.forEach((item) => {
    if (item.children && item.children.length) {
      setRecursionInner(item.children, featurePool);
    } else {
      if (item.leftFeatureType !== 'value') {
        item.nodeProps.leftFeature = featurePool.filter(
          (value) => value.featureCode === item.nodeProps.leftFeatureCode,
        )[0];
      }
      if (item.rightFeatureType !== 'value') {
        item.nodeProps.rightFeature = featurePool.filter(
          (value) => value.featureCode === item.nodeProps.rightFeatureCode,
        )[0];
      }
    }
  });
}

// 赋值数据
function dataUpdate (res) {
  const {
    decisionName,
    decisionRemark,
    resultOutputCode,
    versionRemark,
    fieldsScore,
    versionNo,
    versionList,
    decisionId,
    decisionNo,
    decisionNodes,
    featurePool,
  } = res;
  setFeaturePool(decisionNodes, featurePool);
  form.value = {
    decisionName,
    decisionRemark,
    resultOutputCode,
    versionRemark,
    fieldsScore,
    versionNo,
    decisionId,
    decisionNo,
    decisionNodes,
  };
  versionOptions.value = versionList.map((item) => ({
    versionNo: item.versionNo,
    decisionId: item.decisionId,
  }));
  scoreTableRef.value.update();
}

// 版本切换
function handleVersionChange (val) {
  if (val === form.versionNo) return;
  getVersionInfo(versionOptions.value.find((item) => item.versionNo === val)?.['decisionId']);
}

// 删除版本
function handleDelVersion () {
  loading.value = true;
  deleteVersionApi(form.value.decisionId)
    .then((res) => {
      if (res.code === 200) {
        proxy.$message({
          message: res.msg,
          type: 'success',
        });
        if (versionOptions.value.length > 1) {
          getVersionInfo(
            versionOptions.value.filter((item) => item.decisionId !== form.value.decisionId)[0]
              .decisionId,
          );
        } else {
          handleClose();
        }
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

// 获取版本详情
function getVersionInfo (target) {
  if (!target) return;
  loading.value = true;
  getVersionInfoApi(target)
    .then((res) => {
      if (res.code === 200) {
        dataUpdate(res.data);
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

// 获取详情
async function getData () {
  try {
    const res = await getLibFeatureOptionsApi();
    if (res.code === 200) {
      featuresOptions.value = res.data.map((item) => ({
        ...item,
        key: item.featureId,
        label: item.featureName,
        value: item.featureCode,
      }));
    }
    if (decisionNo) {
      const res = await getDecisionDetailApi(decisionNo);
      if (res.code == 200) {
        dataUpdate(res.data);
      }
    } else {
      scoreTableRef.value.init();
    }
    loading.value = false;
  } catch (error) {
    loading.value = false;
  }
}

getData();

provide('options', featuresOptions);
provide('operator', operator);
</script>

<style lang="scss" scoped>
.ruleset-collection-item {
  box-shadow: var(--el-box-shadow-lighter);
  display: flex;
  flex-direction: column;
  border-radius: 5px;
  overflow: hidden;
  background-color: #fff;
  .header {
    padding: 10px;
    box-shadow: var(--el-box-shadow-lighter);

    .title {
      font-size: 20px;
      color: rgba(0, 0, 0, 0.5);
    }

    .btns {
      .svg-icon {
        margin-left: 10px;
        background-color: #c8c9cc;
        border-radius: 50%;
        padding: 5px;
        width: 25px;
        height: 25px;
        color: #fff;

        &.active {
          background-color: #909399;
          cursor: pointer;
        }

        &.del {
          background-color: #fab6b6;

          &.active {
            background-color: #f56c6c;
          }
        }
      }
    }
  }

  .main {
    width: 100%;
    .result {
      // padding-bottom: 20px;
      .header {
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
        .title {
          font-size: 15px;
          color: rgba(0, 0, 0, 0.5);
          font-weight: bold;
          line-height: 25px;
        }

        .btns .svg-icon {
          background-color: #fff;
          border: 1px solid #c8c9cc;
          color: #c8c9cc;
          cursor: pointer;
        }
      }

      .line {
        width: 100%;
        padding: 20px 10px 0;
        align-items: center;

        :deep(.condition) {
          width: 250px;

          .el-input__wrapper {
            height: 35px;
          }
        }

        .operator {
          color: rgba(0, 0, 0, 0.5);
          margin: 0 10px;
        }

        .end {
          width: 250px;
          display: flex;
          border: 1px solid #dcdfe6;
          border-radius: 4px;
          overflow: hidden;

          :deep(.el-input__wrapper) {
            box-shadow: none !important;
            height: 35px;
          }
        }
        .alert {
          display: flex;
          height: 35px;
        }

        .svg-icon {
          margin-left: 20px;
          background-color: #fff;
          border: 1px solid #c8c9cc;
          color: #000;
          cursor: pointer;
          border-radius: 50%;
          padding: 5px;
          width: 25px;
          height: 25px;
        }
      }
    }
  }
}
</style>
