<template>
  <el-drawer
    :append-to-body="true"
    title="抄送人设置"
    :visible.sync="copyerDrawer"
    direction="rtl"
    class="set_copyer"
    size="550px"
    :before-close="saveCopyer"
  >
    <div class="demo-drawer__content">
      <div class="copyer_content drawer_content">
        <p class="tip">当审批单到此节点时会抄送审批记录给选中成员</p>

        <el-button type="primary" @click="addCopyer">添加成员</el-button>
        <p class="selected_list">
          <span v-for="(item, index) in copyerConfig.nodeUserList" :key="index"
            >{{ item.name }}
            <img
              src="@/assets/images/dialog/add-close1.png"
              @click="$func.removeEle(copyerConfig.nodeUserList, item, 'targetId')"
            />
          </span>
          <a
            v-if="copyerConfig.nodeUserList && copyerConfig.nodeUserList.length != 0"
            @click="copyerConfig.nodeUserList = []"
            >清除</a
          >
        </p>
      </div>
      <div class="demo-drawer__footer clear">
        <el-button type="primary" @click="saveCopyer">确 定</el-button>
        <el-button @click="closeDrawer">取 消</el-button>
      </div>

      <employees-role-dialog
        :visible.sync="copyerVisible"
        :data.sync="checkedList"
        @change="sureCopyer"
      />
    </div>
  </el-drawer>
</template>
<script>
import employeesRoleDialog from '../../Common/dialog/employeesRoleDialog.vue';
import { mapState } from 'pinia';
import workflow from '@/store/modules/workflow.js';
export default {
  components: {
    employeesRoleDialog,
  },
  data() {
    return {
      copyerConfig: {},
      ccSelfSelectFlag: [],
      copyerVisible: false,
      checkedList: [],
    };
  },
  computed: {
    ...mapState(workflow, ['copyerDrawer', 'copyerConfig1']),
  },
  watch: {
    copyerConfig1(val) {
      this.copyerConfig = val.value;
      this.ccSelfSelectFlag =
        this.copyerConfig.ccSelfSelectFlag == 0 ? [] : [this.copyerConfig.ccSelfSelectFlag];
    },
  },
  methods: {
    addCopyer() {
      this.copyerVisible = true;
      this.checkedList = this.copyerConfig.nodeUserList;
    },
    sureCopyer(data) {
      this.copyerConfig.nodeUserList = data;
      this.copyerVisible = false;
    },
    saveCopyer() {
      this.copyerConfig.ccSelfSelectFlag = this.ccSelfSelectFlag.length == 0 ? 0 : 1;
      this.copyerConfig.error = !this.$func.copyerStr(this.copyerConfig);
      workflow().setCopyerConfig({
        value: this.copyerConfig,
        flag: true,
        id: this.copyerConfig1.id,
      });
      this.closeDrawer();
    },
    closeDrawer() {
      //this.setCopyer(false)
      workflow().setCopyer(false);
    },
  },
};
</script>
<style scoped src="@/assets/styles/workflow/override-element-ui.css"></style>
<style lang="scss">
.set_copyer {
  .copyer_content {
    padding: 20px 20px 0;
    .el-button {
      margin-bottom: 20px;
    }
    .el-checkbox {
      margin-bottom: 20px;
    }
  }
}

p.tip {
  margin: 5px 0 20px 0;
  width: 510px;
  text-indent: 17px;
  line-height: 45px;
  background: rgba(241, 249, 255, 1);
  border: 1px solid rgba(64, 163, 247, 1);
  color: #46a6fe;
  font-size: 14px;
}
</style>
