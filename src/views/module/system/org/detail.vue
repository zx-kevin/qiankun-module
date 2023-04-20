<template>
  <!-- 组织管理 -- 详情 -->
  <div class="org-dateil">
    <div class="dateil-box">
      <div class="title">信息</div>
      <div class="content">
        <div class="dateil-item" v-for="(label, key) in formList">
          <div class="item-label">{{ label }}</div>
          <div class="item-content">
            <tooltip-text
              id="tooltip-text-box"
              :content="data.orgForm[key] ? data.orgForm[key] : '-'"
            >
              <div class="name">
                {{ data.orgForm[key] }}
              </div>
            </tooltip-text>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script name="orGDetail" setup>
import {
  getOrgDetailApi, // 组织管理详情
} from '@/api/module/system/org';
const router = useRouter();
const { proxy } = getCurrentInstance();
const orgId = router.currentRoute.value.params.orgId;
// const props = defineProps({
//   orgTypeList: {
//     type: Object,
//     default: {},
//   },
// });
const { org_type } = proxy.useDict('org_type');
// 实名状态 下拉列表
const authStatusList = ref({
  0: '已实名',
  1: '实名中',
  2: '实名失败',
});

// 删除标志 下拉列表
const delFlagList = ref({
  0: '存在',
  1: '删除',
});

// 组织类型 下拉列表
const orgTypeList = ref({});

// 组织状态 下拉列表
const statusList = ref({
  0: '正常',
  1: '停用',
});

const formList = ref({
  adminPeopleId: '超级管理员id',
  packagesStr: '套餐类型',
  authStatusLabel: '实名状态',
  delFlagLabel: '删除标志',
  orgName: '组织名称',
  orgTypeLabel: '组织类型',
  statusLabel: '组织状态',
  remark: '备注',
  orgNo: '社会统一信用代码',
});

const data = reactive({
  orgForm: {
    authStatus: '',
    delFlag: '',
    orgName: '',
    orgType: '',
    remark: '',
    status: '',
  },
});

watch(
  org_type,
  (val) => {
    if (val) {
      val.forEach((item) => {
        orgTypeList.value[item.value] = item.label;
      });
    }
  },
  { immediate: true },
);

onMounted(() => {
  getOrgDetail();
});
function getOrgDetail () {
  getOrgDetailApi({ orgId: orgId }).then((res) => {
    if (res.code == 200) {
      let resData = res.data;
      let tmp = [];
      resData.authStatusLabel = authStatusList.value[resData.authStatus];
      resData.delFlagLabel = delFlagList.value[resData.delFlag];
      resData.orgTypeLabel = orgTypeList.value[resData.orgType];
      resData.statusLabel = statusList.value[resData.status];
      resData.packages.forEach((item) => {
        tmp.push(item.packageName);
      });

      resData.packagesStr = tmp.join(',');
      data.orgForm = resData;
    }
  });
}
</script>

<style lang="scss" scoped>
.org-dateil {
  width: 100%;
  min-height: calc(100vh - 84px);
  padding: 20px;
  background-color: #ebeff6;
}

.dateil-box {
  padding: 30px 15px 30px 30px;
  background-color: #fff;
  border-radius: 4px;
  .title {
    font-size: 16px;
    font-family: PingFangSC-Semibold, PingFang SC;
    font-weight: 700;
    color: #1f2746;
    display: flex;
    align-items: center;
    position: relative;
    padding-left: 6px;
  }
  .title::before {
    content: '';
    display: block;
    position: absolute;
    width: 2px;
    height: 15px;
    background: #006eff;
    left: 0;
    top: 0;
    bottom: 0;
    margin: auto;
  }
}

.content {
  display: flex;
  flex-wrap: wrap;
}
.dateil-item {
  width: calc(20% - 15px);
  margin-right: 15px;
  margin-top: 20px;
  .item-label {
    line-height: 20px;
    margin-bottom: 10px;
    color: #9da0a7;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
  }
  .item-content {
    width: 100%;
    height: 46px;
    display: flex;
    align-items: center;
    padding: 10px 20px 10px 10px;
    font-weight: 700;
    color: #1f2746;
    border-radius: 4px;
    font-size: 14px;
    font-family: PingFangSC-Medium, PingFang SC;
    background: #f5f6f9;
  }
}
</style>
