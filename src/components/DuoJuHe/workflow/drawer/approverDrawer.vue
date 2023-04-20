<template>
  <el-drawer
    :append-to-body="true"
    :title="(approverConfig.nodeName ? approverConfig.nodeName : '审核人') + '设置'"
    :visible.sync="approverDrawer"
    direction="rtl"
    class="set_promoter"
    size="550px"
    :before-close="saveApprover"
  >
    <el-tabs v-model="activeName" style="padding: 0 5px 0 10px">
      <el-tab-pane label="审批人设置" name="setApprover">
        <!--beg-->
        <div class="demo-drawer__content">
          <div class="drawer_content">
            <div class="approver_content">
              <el-radio-group
                style="display: block"
                v-model="approverConfig.settype"
                class="clear"
                @change="changeType"
              >
                <el-radio :label="1">指定成员</el-radio>
                <el-radio :label="2">指定岗位</el-radio>
                <el-radio :label="3">指定部门</el-radio>
                <el-radio :label="4">指定角色</el-radio>
                <el-radio :label="5">发起人自己</el-radio>
                <!--  <el-radio :label="6">发起人自选</el-radio>-->
              </el-radio-group>
            </div>

            <div class="approver_self_select" v-if="approverConfig.settype == 1">
              <el-button type="primary" @click="addApprover" v-if="approverConfig.settype == 1"
                >添加/修改成员</el-button
              >
              <p class="selected_list" v-if="approverConfig.settype == 1">
                <span v-for="(item, index) in approverConfig.nodeUserList" :key="index"
                  >{{ item.name }}
                  <img
                    src="@/assets/images/dialog/add-close1.png"
                    @click="$func.removeEle(approverConfig.nodeUserList, item, 'targetId')"
                  />
                </span>
                <a
                  v-if="approverConfig.nodeUserList.length != 0"
                  @click="approverConfig.nodeUserList = []"
                  >清除</a
                >
              </p>
            </div>

            <div class="approver_self" v-if="approverConfig.settype == 5">
              <p>该审批节点设置“发起人自己”后，审批人默认为发起人</p>
            </div>

            <div class="approver_self_select" v-show="approverConfig.settype == 2">
              <el-button type="primary" @click="addPostApprover">添加/修改岗位</el-button>
              <p class="selected_list">
                <span v-for="(item, index) in approverConfig.nodeUserList" :key="index"
                  >{{ item.name }}
                  <img
                    src="@/assets/images/dialog/add-close1.png"
                    @click="$func.removeEle(approverConfig.nodeUserList, item, 'targetId')"
                  />
                </span>
                <a
                  v-if="approverConfig.nodeUserList && approverConfig.nodeUserList.length != 0"
                  @click="approverConfig.nodeUserList = []"
                  >清除</a
                >
              </p>
            </div>

            <div class="approver_self_select" v-show="approverConfig.settype == 3">
              <el-button type="primary" @click="addDeptApprover">添加/修改部门</el-button>
              <p class="selected_list">
                <span v-for="(item, index) in approverConfig.nodeUserList" :key="index"
                  >{{ item.name }}
                  <img
                    src="@/assets/images/dialog/add-close1.png"
                    @click="$func.removeEle(approverConfig.nodeUserList, item, 'targetId')"
                  />
                </span>
                <a
                  v-if="approverConfig.nodeUserList && approverConfig.nodeUserList.length != 0"
                  @click="approverConfig.nodeUserList = []"
                  >清除</a
                >
              </p>
            </div>

            <div class="approver_self_select" v-show="approverConfig.settype == 4">
              <el-button type="primary" @click="addRoleApprover">添加/修改角色</el-button>
              <p class="selected_list">
                <span v-for="(item, index) in approverConfig.nodeUserList" :key="index"
                  >{{ item.name }}
                  <img
                    src="@/assets/images/dialog/add-close1.png"
                    @click="$func.removeEle(approverConfig.nodeUserList, item, 'targetId')"
                  />
                </span>
                <a
                  v-if="approverConfig.nodeUserList && approverConfig.nodeUserList.length != 0"
                  @click="approverConfig.nodeUserList = []"
                  >清除</a
                >
              </p>
            </div>

            <div
              class="approver_some"
              v-if="
                (approverConfig.settype == 1 && approverConfig.nodeUserList.length > 1) ||
                approverConfig.settype == 2 ||
                approverConfig.settype == 3 ||
                approverConfig.settype == 4
              "
            >
              <p>多人审批时采用的审批方式</p>
              <el-radio-group
                style="width: 100%"
                v-model="approverConfig.examineMode"
                class="clear"
              >
                <el-radio :label="1">依次审批</el-radio>
                <br />
                <el-radio :label="2" v-if="approverConfig.settype != 5"
                  >会签(通过率达到:%)</el-radio
                >

                <el-input-number
                  @change="handleNumberChange"
                  v-model="signRate"
                  size="default"
                  style="width: 100px"
                  :precision="0"
                  :step="1"
                  controls-position="right"
                  :min="1"
                  :max="100"
                ></el-input-number>

                <br />
                <el-radio :label="3" v-if="approverConfig.settype != 5"
                  >或签(一名审批人同意或拒绝即可)</el-radio
                >
              </el-radio-group>
            </div>
          </div>
          <div class="demo-drawer__footer clear">
            <el-button type="primary" @click="saveApprover">确 定</el-button>
            <el-button @click="closeDrawer">取 消</el-button>
          </div>
          <employees-dialog
            :visible.sync="approverVisible"
            :data.sync="checkedList"
            @change="sureApprover"
          />
          <role-dialog
            :visible.sync="approverRoleVisible"
            :data.sync="checkedRoleList"
            @change="sureRoleApprover"
          />

          <post-dialog
            :visible.sync="approverPostVisible"
            :data.sync="checkedPostList"
            @change="surePostApprover"
          />

          <dept-dialog
            :visible.sync="approverDeptVisible"
            :data.sync="checkedDeptList"
            @change="sureDeptApprover"
          />
        </div>
        <!-- end-->
      </el-tab-pane>
    </el-tabs>
  </el-drawer>
</template>
<script>
import employeesDialog from '../../Common/dialog/employeesDialog.vue';
import roleDialog from '../../Common/dialog/roleDialog.vue';
import deptDialog from '../../Common/dialog/deptDialog.vue';
import postDialog from '../../Common/dialog/postDialog.vue';

import { mapState } from 'pinia';
import workflow from '@/store/modules/workflow.js';
export default {
  components: { employeesDialog, roleDialog, deptDialog, postDialog },
  props: ['pId'],
  data() {
    return {
      activeName: 'setApprover',
      signRate: 100,
      approverConfig: {
        countersignRate: 100,
        nodeUserList: [],
      },
      approverVisible: false,
      approverRoleVisible: false,
      approverEmplyessList: [],
      checkedRoleList: [],
      approverPostVisible: false,
      checkedPostList: [],
      checkedList: [],
      approverDeptVisible: false,
      checkedDeptList: [],
    };
  },
  computed: {
    ...mapState({
      approverConfig1: (state) => state.workflow.approverConfig1,
      approverDrawer: (state) => state.workflow.approverDrawer,
    }),
  },
  watch: {
    approverConfig1(val) {
      this.approverConfig = val.value;
      //this.approverConfig.countersignRate = 100;
    },
  },
  methods: {
    handleNumberChange(value) {
      console.log(value);
      this.signRate = value;
      this.approverConfig.countersignRate = value;
    },
    changeType() {
      this.approverConfig.nodeUserList = [];
      this.approverConfig.examineMode = 1;
      //this.approverConfig.countersignRate = 100;
      this.approverConfig.noHanderAction = 2;
    },
    addApprover() {
      this.approverVisible = true;
      this.checkedList = this.approverConfig.nodeUserList;
    },
    addRoleApprover() {
      this.approverRoleVisible = true;
      this.checkedRoleList = this.approverConfig.nodeUserList;
    },

    addDeptApprover() {
      this.approverDeptVisible = true;
      this.checkedDeptList = this.approverConfig.nodeUserList;
    },

    addPostApprover() {
      this.approverPostVisible = true;
      this.checkedPostList = this.approverConfig.nodeUserList;
    },

    sureApprover(data) {
      this.approverConfig.nodeUserList = data;
      this.approverVisible = false;
    },
    sureRoleApprover(data) {
      this.approverConfig.nodeUserList = data;
      this.approverRoleVisible = false;
    },

    surePostApprover(data) {
      this.approverConfig.nodeUserList = data;
      this.approverPostVisible = false;
    },

    sureDeptApprover(data) {
      this.approverConfig.nodeUserList = data;
      this.approverDeptVisible = false;
    },

    saveApprover() {
      this.approverConfig.countersignRate = this.signRate;
      this.approverConfig.error = !this.$func.setApproverStr(this.approverConfig);
      workflow().setApproverConfig({
        value: this.approverConfig,
        flag: true,
        id: this.approverConfig1.id,
      });
      this.$emit('update:nodeConfig', this.approverConfig);
      this.closeDrawer();
    },
    closeDrawer() {
      workflow().setApprover(false);
    },
  },
};
</script>
<style scoped src="@/assets/styles/workflow/override-element-ui.css"></style>
<style lang="scss">
.el-drawer__header {
  margin-bottom: 0;
  padding: 20px 0 5px 10px;
  font-size: 16px;
}

.set_promoter {
  .approver_content {
    padding-bottom: 10px;
    border-bottom: 1px solid #f2f2f2;
  }
  .approver_self_select .el-button,
  .approver_content .el-button {
    margin-bottom: 20px;
  }
  .approver_content .el-radio,
  .approver_some .el-radio,
  .approver_self_select .el-radio {
    width: 27%;
    margin-bottom: 20px;
  }
  .approver_manager p {
    line-height: 32px;
  }
  .approver_manager select {
    width: 420px;
    height: 32px;
    background: rgba(255, 255, 255, 1);
    border-radius: 4px;
    border: 1px solid rgba(217, 217, 217, 1);
  }
  .approver_manager p.tip {
    margin: 10px 0 22px 0;
    font-size: 12px;
    line-height: 16px;
    color: #f8642d;
  }
  .approver_self {
    padding: 28px 20px;
  }
  .approver_self_select,
  .approver_manager,
  .approver_content,
  .approver_some {
    padding: 20px 20px 0;
  }
  .approver_manager p:first-of-type,
  .approver_some p {
    line-height: 19px;
    font-size: 14px;
    margin-bottom: 14px;
  }
  .approver_self_select h3 {
    margin: 5px 0 20px;
    font-size: 14px;
    font-weight: bold;
    line-height: 19px;
  }
}

.form-auth-table {
  font-size: 14px;
  .auth-table-header {
    background: #fafafa;
    line-height: 40px;
  }
  .row {
    display: flex;
    align-items: center;
    line-height: 32px;
    padding: 8px 12px;
    border-bottom: 1px solid #efefef;
    &:hover {
      background: #f5f7fa;
    }
    .label {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      .required {
        color: #f2725e;
      }
    }
    .radio-group {
      flex: 2;
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
