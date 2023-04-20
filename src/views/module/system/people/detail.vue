<template>
  <!-- 个体管理 -- 详情 -->
  <div class="people-dateil">
    <div class="dateil-box">
      <div class="title">信息</div>
      <div class="content">
        <div class="dateil-item" v-for="(label, key) in formList">
          <div class="item-label">{{ label }}</div>
          <div class="item-content">
            <tooltip-text
              id="tooltip-text-box"
              :content="data.peopleForm[key] ? data.peopleForm[key] : '-'"
            >
              <div class="name">
                {{ data.peopleForm[key] }}
              </div>
            </tooltip-text>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script name="peopleDetail" setup>
import {
  getPeopleDetailApi, // 个体管理详情
} from '@/api/module/system/people';
const router = useRouter();
const { proxy } = getCurrentInstance();
const peopleId = router.currentRoute.value.params.peopleId;
const { org_type } = proxy.useDict('org_type');
// 用户性别 下拉列表
const sexList = ref({
  0: '男',
  1: '女',
  2: '未知',
});

// 删除标志 下拉列表
const delFlagList = ref({
  0: '存在',
  2: '删除',
});

// 账号状态 下拉列表
const statusList = ref({
  0: '正常',
  1: '停用',
});

const formList = ref({
  avatar: '头像地址',
  delFlagLabel: '删除标志',
  email: '用户邮箱',
  loginDate: '最后登录时间',
  loginIp: '最后登录IP',
  nickName: '用户昵称',
  // password: "密码",
  peopleId: '个体id',
  phonenumber: '手机号码',
  remark: '备注',
  sex: '用户性别',
  status: '帐号状态',
  userName: '用户账号',
});

const data = reactive({
  peopleForm: {},
});

onMounted(() => {
  getPeopleDetail();
});
function getPeopleDetail () {
  getPeopleDetailApi({ peopleId: peopleId }).then((res) => {
    if (res.code == 200) {
      let resData = res.data;

      resData.sex = sexList.value[resData.sex];
      resData.delFlag = delFlagList.value[resData.delFlag];
      resData.status = statusList.value[resData.status];
      data.peopleForm = res.data;
    }
  });
}
</script>

<style lang="scss" scoped>
.people-dateil {
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
