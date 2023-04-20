<template>
  <el-container class="container">
    <el-header class="header">
      <span>群信息</span>
      <el-tooltip content="发送消息" placement="top">
        <el-icon class="icon-send" @click="sendGroup"><ChatDotSquare /></el-icon>
      </el-tooltip>
      <el-icon class="icon-close" @click="$emit('close')"><Close /></el-icon>
    </el-header>

    <el-main class="main lum-scrollbar">
      <div class="list-item flex">
        <p>
          <span>群名称：</span>
          <span class="group-setting-title">{{ detail.groupName }}</span>
        </p>
        <span v-show="detail.isManager" class="more" @click="isShowManager = true">管理 </span>
      </div>

      <div class="list-item">
        <span>群主：</span>
        <!-- <span class="group-boss-name">{{}}</span> -->
        <el-select
          :model-value="detail.groupOwner"
          size="small"
          :disabled="userStore.userId == groupUserId ? false : true"
          @change="groupOwnerChange"
          filterable
        >
          <el-option
            v-for="(item, index) in membersC"
            :key="item.userId"
            :label="item.userName"
            :value="index"
          />
        </el-select>
      </div>

      <!-- <div class="list-item">
        <span>我的群昵称：</span>
        <span v-if="!isEditRemark" class="edit-visit-card">
          <span>
            {{ detail.visitCard }}
            <span v-show="!detail.visitCard" style="font-size: 12px"> 添加群名片 </span>
          </span>
          <el-icon
            class="edit-remark-icon"
            @click="
              isEditRemark = true;
              editRemarkText = detail.visitCard;
            "
            ><Edit
          /></el-icon>
        </span>
        <span v-else>
          <input v-model="editRemarkText" class="edit-input" v-focus @keyup.enter="editRemark" />
          <span class="input-submit" @click="editRemark">确认</span>
        </span>
      </div> -->

      <!-- <div class="list-item flex">
        <span>消息免打扰：</span>
        <el-switch
          v-model="detail.isDisturb"
          inactive-color="#e0d6d6"
          :disabled="disturbDisabled"
          @change="editDisturb"
        />
      </div> -->

      <!-- 预留 -->
      <div class="list-item flex" v-show="detail.isManager">
        <span>全员禁言：</span>
        <el-switch
          v-model="detail.noMessage"
          inactive-color="#e0d6d6"
          :disabled="muteDisabled"
          @change="editMute"
        />
      </div>

      <div class="list-item">
        <span>群成员：</span>
        <span>{{ members.length }} 人</span>
      </div>

      <div class="list-item-tips">群主已开启“新成员入群可查看所有聊天记录”</div>

      <div class="list-item">群简介</div>

      <div class="list-item-tips">
        {{ detail.profile ? detail.profile : '暂无群简介' }}
      </div>

      <div class="list-item flex">
        <span>群公告</span>
        <span v-show="detail.groupNotice" class="more" @click="isShowGroupNotice = true"
          >更多
        </span>
      </div>

      <div class="list-item-tips group-notice">
        <span v-if="detail.groupNotice">
          <!-- <b>#{{ detail.groupNotice }}#</b><br /> -->
          {{ detail.groupNotice }}
        </span>
        <span v-else>暂无群公告</span>
      </div>

      <div class="list-item">
        <!-- <p class="group-invite" @click="addGroupMembers">
          <el-icon><Plus /></el-icon>
          <span>&nbsp;邀请好友</span>
        </p> -->
      </div>

      <div class="list-item">
        <div class="member-box">
          <div class="view-box">
            <i class="iconfont icon-sousuo i-sousuo" />
            <input placeholder="搜索群成员" v-model="keywords" />
          </div>

          <el-row class="row-header">
            <el-col :span="11">昵称</el-col>
            <el-col :span="8">名片</el-col>
            <el-col :span="5">性别</el-col>
          </el-row>

          <template v-if="searchs.length == 0">
            <el-row class="row-items">
              <el-col :span="24">
                <p style="text-align: center">无数据</p>
              </el-col>
            </el-row>
          </template>
          <template v-else>
            <el-row
              v-for="(member, idx) in searchs"
              :key="member.userId"
              class="row-items"
              @click.native="openUserDetail(member.userId)"
              @contextmenu.native="pisMana(idx, member, $event)"
            >
              <el-col :span="11">
                <img
                  style="width: 20px; height: 20px; object-fit: cover"
                  :src="base64ToImageFn(member)"
                  :onerror="userStore.defaultAvatar"
                />
                <span class="nickname">{{ member.userName }}</span>
                <el-tag
                  style="margin-left: 5px"
                  size="small"
                  v-if="member.isMute == 0"
                  class="ml-2"
                  type="danger"
                  >禁言</el-tag
                >
              </el-col>
              <el-col :span="8">
                <span>{{
                  user_type[member.groupUserType] ? user_type[member.groupUserType] : '-'
                }}</span>
              </el-col>
              <el-col :span="5">
                <span>{{ sex[member.sex] ? sex[member.sex] : '未知' }}</span>
              </el-col>
            </el-row>
          </template>
        </div>
      </div>
    </el-main>

    <el-footer class="footer">
      <button v-if="groun_owner" @click="dismiss">解散群组</button>
      <button v-else @click="isShowSignout = true">退出该群组</button>
    </el-footer>

    <!-- 退群提示层 -->
    <div class="signout-box no-select" v-show="isShowSignout">
      <p v-show="signoutStatus == 0">您确认退出当前群组吗？</p>
      <p v-show="signoutStatus == 0">退群后群组信息将不能查看</p>
      <p v-show="signoutStatus == 0" class="signout-btn">
        <button @click="signout">确认</button>
        <button @click="isShowSignout = false">取消</button>
      </p>

      <p v-show="signoutStatus == 1" class="signout-btn mt38">
        <span style="color: #ccc">
          <el-icon><Loading /></el-icon>
          正在退出群组...
        </span>
      </p>

      <p v-show="signoutStatus == 2" class="signout-btn mt38">
        <span style="color: #cccccc">退出群组失败，请3(s)后再试...</span>
      </p>

      <p v-show="signoutStatus == 3" class="signout-btn mt38">
        <span style="color: #339e19">
          <el-icon><CircleCheck /></el-icon> 已成功退出群组...
        </span>
      </p>
    </div>

    <!-- 邀请好友组件 -->
    <transition name="el-fade-in-linear">
      <GroupLaunch
        v-if="inviteFriendBox"
        :group-id="groupId"
        @close="inviteFriendBox = false"
        @invite-success="inviteSuccess"
        @send="$emit('send', $event)"
      />
    </transition>

    <!-- 群管理组件 -->
    <transition name="el-fade-in-linear">
      <GroupManage
        v-if="isShowManager"
        v-model:groupNotice="detail.groupNotice"
        :group-id="groupId"
        @success="
          $emit('success');
          detail.groupName = $event.groupName;
          detail.profile = $event.groupIntroduce;
        "
        @send="$emit('send', $event)"
        @close="isShowManager = false"
        @deleteUser="loadMembers"
      />
    </transition>

    <!-- 群公告组件 -->
    <transition name="el-fade-in-linear">
      <GroupNotice
        v-if="isShowGroupNotice"
        :group-id="groupId"
        :groupNotice="detail.groupNotice"
        @close="isShowGroupNotice = false"
      />
    </transition>
  </el-container>
</template>
<script>
import useUserStore from '@/store/modules/user.js';
import { deepClone } from '@/utils/index.js';

import { disturbGroupUserApi } from '@/api/module/chat/im/chatList';
import {
  getGroupDetailApi,
  updateUserChatGroupVisitCard,
  quitGroupUserApi,
  getGroupUserPageApi,
  deleteGroupApi,
  updateGroupMuteApi,
  updateGroupleaderApi,
  updateGroupUserTypeApi,
  muteGroupUserApi,
} from '@/api/module/chat/im/chatGroup';

//创建群聊组件
import GroupLaunch from '@/components/DuoJuHe/Chat/group/GroupLaunch';
import GroupManage from '@/components/DuoJuHe/Chat/group/GroupManage';
import GroupNotice from '@/components/DuoJuHe/Chat/group/GroupNotice';

export default {
  name: 'GroupPanel',
  components: {
    GroupLaunch,
    GroupManage,
    GroupNotice,
  },
  props: {
    groupId: {
      type: [String, Number],
      default: null,
    },
  },
  setup() {
    const userStore = useUserStore();
    return {
      userStore,
    };
  },
  data() {
    return {
      groupUserId: 0,
      detail: {
        groupAvatar: '',
        groupId: 0,
        groupName: '',
        groupOwner: '',
        profile: '',
        isDisturb: 0,
        noMessage: false,
        visitCard: '',
        isManager: false,
        groupNotice: '',
      },

      keywords: '',
      members: [],

      isEditRemark: false,
      editRemarkText: '',

      inviteFriendBox: false,
      isShowSignout: false,

      signoutStatus: 0,

      //是否消息免打扰
      disturbDisabled: false,

      //是否全员禁言
      muteDisabled: false,

      // 是否显示群管理窗口
      isShowManager: false,

      // 是否显示群公告窗口
      isShowGroupNotice: false,

      sex: {
        0: '男',
        1: '女',
      },
      //  是否是群主
      groun_owner: false,
    };
  },
  watch: {
    groupId: function (value) {
      if (value) {
        this.loadMembers().then((res) => {
          this.loadGroupDetail();
        });
      }
    },
  },
  computed: {
    searchs() {
      return this.keywords === ''
        ? this.members
        : this.members.filter((item) => {
            return item.userName.match(this.keywords) != null;
          });
    },
    user_type() {
      let { chat_user_type } = this.useDict('chat_user_type');
      chat_user_type = toRaw(chat_user_type.value);
      let data = {};
      for (let index = 0; index < chat_user_type.length; index++) {
        data[chat_user_type[index].value] = chat_user_type[index].label;
      }
      return data;
    },
    membersC() {
      return this.members.filter((item) => {
        return item.groupUserType != 2;
      });
    },
  },
  created() {
    if (this.groupId) {
      this.loadMembers().then((res) => {
        this.loadGroupDetail();
      });
    }
  },
  methods: {
    pisMana(idx, item, event) {
      if (this.groun_owner && item.groupUserType == 2) return false;
      if (!this.groun_owner || !this.detail.isManager) return false;
      let menus = [
        {
          label: item.groupUserType == 1 ? '取消管理员' : '设置管理员',
          click: () => {
            updateGroupUserTypeApi({
              groupUserId: item.groupUserId,
              isAdministrators: item.groupUserType,
            }).then((res) => {
              if (res.code == 200) {
                this.loadMembers();
                this.$emit('send', {
                  inviteType: '0',
                  msgType: '4',
                  msgContent: `${useUserStore().name} ${
                    item.groupUserType == 1 ? '取消管理员' : '设置管理员'
                  }【${item.userName}】`,
                });
              }
            });
          },
        },
      ];
      if (item.groupUserType == 0) {
        menus.push({
          label: item.isMute == 0 ? '取消禁言' : '禁言',
          click: () => {
            muteGroupUserApi({
              groupUserId: item.groupUserId,
              isMute: item.isMute == 0 ? 1 : 0,
            }).then((res) => {
              if (res.code == 200) {
                this.loadMembers();
              }
            });
          },
        });
      }
      let items = shallowRef({
        menus: menus,
        event: event,
        zIndex: 3,
      });
      this.contextmenu(event, items.value);
      event.preventDefault();
    },
    base64ToImageFn({ avatar }) {
      // console.log(groupAvtar);
      let src = `data:image/png;base64,${avatar}`;
      // console.log(src);
      return src;
    },
    // 加载群组成员列表
    loadMembers() {
      this.detail.isManager = this.groun_owner = false;
      return new Promise((resolve, reject) => {
        getGroupUserPageApi({
          groupId: this.groupId,
        }).then((res) => {
          this.members = res.data;
          this.members.map((item) => {
            item.isManager = item.groupUserType == 2 ? true : false;
            if (item.groupUserType == 1 && this.userStore.userId == item.userId) {
              this.detail.isManager = true;
            } else if (item.groupUserType == 2 && this.userStore.userId == item.userId) {
              this.detail.isManager = true;
              this.groun_owner = true;
            }
            if (item.groupUserType == 2) {
              this.detail.groupOwner = item.userName || '';
              this.groupUserId = item.userId || '';
            }
            return item;
          });
          let data = deepClone(this.members);
          this.$emit('group-info', {
            membersNum: this.members.length,
            members: data.map((item) => {
              item.avatar = this.base64ToImageFn(item);
              return item;
            }),
          });
          this.$emit('success');
          resolve();
        });
      });
    },

    // 加载群信息
    loadGroupDetail() {
      getGroupDetailApi({
        groupId: this.groupId,
      }).then((res) => {
        let result = res.data;
        this.detail.groupAvatar = this.base64ToImageFn({ avatar: result.groupAvtar });
        this.detail.groupId = result.groupId;
        this.detail.userId = result.createUserId;
        this.detail.groupName = result.groupName;

        this.detail.profile = result.groupIntroduce;
        this.detail.isDisturb = result.isDisturb == 0;
        this.detail.visitCard = result.visitCard || '';
        this.detail.noMessage = result.isMute == 0 ? true : false;
        this.detail.groupNotice = result.groupNotice || '';
        this.$emit('no-message', {
          status: this.detail.isManager ? false : this.detail.noMessage,
        });
      });
    },

    // 设置群免打扰状态
    editDisturb(value) {
      console.log(value);
      this.disturbDisabled = true;
      disturbGroupUserApi({
        listId: 2,
        groupId: this.groupId,
        isDisturb: this.detail.isDisturb ? '1' : '0',
      })
        .then((res) => {
          this.$emit('disturb-change', {
            groupId: this.groupId,
            isDisturb: this.detail.isDisturb ? '1' : '0',
          });
        })
        .catch(() => {
          this.detail.isDisturb = value ? 0 : 1;
        })
        .finally(() => {
          this.disturbDisabled = false;
        });
    },

    // 设置群全员禁言
    editMute(value) {
      console.log(value);
      this.muteDisabled = true;
      updateGroupMuteApi({
        groupId: this.groupId,
        isMute: value ? 0 : 1,
      })
        .then((res) => {
          this.$emit('no-message', {
            groupId: this.groupId,
            status: this.detail.isManager ? false : value,
            events: 'event_system_message',
          });
        })
        .catch(() => {
          this.detail.noMessage = value ? 0 : 1;
        })
        .finally(() => {
          this.muteDisabled = false;
          this.loadMembers().then((res) => {
            this.loadGroupDetail();
          });
        });
    },
    // 更改群主
    groupOwnerChange(val) {
      console.log(val);

      updateGroupleaderApi({ groupUserId: this.members[val].groupUserId }).then((res) => {
        if (res.code == 200) {
          this.detail.groupOwner = this.members[val].userName;
          this.$notify({
            title: '转让成功',
            message: `${this.members[val].userName}成为群主`,
            type: 'success',
          });
          this.loadMembers();
        }
      });
    },
    // 设置用户群名片
    editRemark() {
      if (this.editRemarkText === '') {
        this.isEditRemark = false;
        return;
      }

      if (this.detail.visitCard === this.editRemarkText) {
        this.isEditRemark = false;
        return;
      }

      updateUserChatGroupVisitCard({
        groupId: this.groupId,
        visitCard: this.editRemarkText,
      }).then((res) => {
        this.isEditRemark = false;
        this.detail.visitCard = this.editRemarkText;
      });
    },

    // 查看用户信息
    openUserDetail(userId) {
      return false;
      this.$user(userId);
    },

    // 邀请好友加入群聊
    addGroupMembers() {
      sessionStorage.setItem('invite_group_id', this.detail.groupId);
      this.inviteFriendBox = true;
    },

    // 邀请好友成功之后的回调事件
    inviteSuccess() {
      this.inviteFriendBox = false;
      this.loadMembers();

      this.$notify({
        title: '邀请成功',
        message: `用户已成功加入群组...`,
        type: 'success',
      });
    },

    // 发送群聊
    sendGroup() {
      this.$emit('send-group', this.detail.groupId);
    },

    // 退出群操操作
    signout() {
      let st = {};
      this.members.map((item) => {
        if (item.userId == this.userStore.userId) {
          st = item;
        }
      });
      this.signoutStatus = 1;
      quitGroupUserApi({
        groupId: this.detail.groupId,
      })
        .then((res) => {
          if (res && res.code === 200) {
            this.signoutStatus = 3;
            setTimeout(() => {
              this.signoutStatus = 0;
              this.isShowSignout = false;
              this.$emit('quit-group', {
                inviteType: '1',
                msgType: '4',
                msgContent: `用户【${st.userName}】退出群聊`,
              });
            }, 1000);
          }
        })
        .catch(() => {
          this.signoutStatus = 2;
          setTimeout(() => {
            this.signoutStatus = 0;
          }, 3000);
        });
    },

    /** 解散群组 */
    dismiss() {
      const groupId = this.detail.groupId;
      const groupName = this.detail.groupName;
      this.$confirm('确认解散【' + groupName + '】群组?此操作是不可恢复的！', '警告', {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        type: 'warning',
      })
        .then(function () {
          return deleteGroupApi({ groupId: groupId });
        })
        .then((res) => {
          if (res && res.code === 200) {
            this.signoutStatus = 3;
            setTimeout(() => {
              this.signoutStatus = 0;
              this.isShowSignout = false;
              this.$emit('quit-group', {
                inviteType: '1',
                msgType: '4',
                msgContent: `用户【${this.detail.groupOwner}】解散了群组`,
              });
            }, 1500);
          }
        })
        .catch(function () {});
    },
  },
};
</script>
<style lang="scss" scoped>
.container {
  height: 100%;

  .header {
    height: 60px;
    line-height: 60px;
    padding: 0;
    text-align: center;
    box-shadow: -1px 0px 5px 0px #cccccc45;
    position: relative;

    span {
      font-size: 16px;
      font-weight: 400;
    }

    .icon-send {
      position: absolute;
      left: 15px;
      top: 22px;
      font-size: 18px;
      cursor: pointer;
    }

    .icon-close {
      position: absolute;
      right: 15px;
      top: 22px;
      font-size: 18px;
      cursor: pointer;
    }
  }

  .main {
    padding: 0;
  }
}

.list-item {
  position: relative;
  padding: 16px 16px 0;
  min-height: 18px;
  font-size: 14px;

  &.flex {
    display: flex;
    justify-content: space-between;
  }

  .edit-visit-card {
    position: initial;
    color: #a29f9f;
  }

  .edit-remark-icon {
    margin-left: 5px;
    color: rgb(169, 184, 187);
    position: absolute;
    top: 20px;
    cursor: pointer;
  }

  .edit-input {
    width: 46%;
    height: 25px;
    line-height: 25px;
    border: 1px solid #92cbff;
    padding-left: 5px;
    border-radius: 3px;
  }

  .input-submit {
    width: 55px;
    text-align: center;
    height: 25px;
    line-height: 25px;
    background-color: #008cee;
    border-radius: 2px;
    display: inline-block;
    color: #fff !important;
    font-size: 12px;
    margin-left: 10px;
    cursor: pointer;
  }

  .group-setting-title {
    max-width: 250px;
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    vertical-align: bottom;
  }

  .group-boss-name {
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-wrap: normal;
    max-width: 180px;
    position: relative;
    top: 4px;
  }

  .group-invite {
    height: 30px;
    line-height: 30px;
    text-align: center;
    color: #877272;
    cursor: pointer;
    border-radius: 2px;
    border: 1px dashed #d9bbbb;
    font-size: 13px;
    transition: all 0.5s ease-in-out;

    &:hover {
      color: #ff5722;
      border-color: #ff5722;
      transform: scale(1.01);
    }
  }

  .more {
    color: #409eff;
    cursor: pointer;
    font-size: 12px;
  }
}

.list-item-tips {
  font-size: 12px;
  color: #b1b1b1;
  margin-top: 5px;
  padding-left: 16px;
  padding-right: 16px;
  font-weight: 300;
  overflow: hidden;
  word-break: break-word;
}

.group-notice {
  line-height: 22px;
}

.member-box {
  min-height: 180px;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ecebeb;
  border-radius: 3px;

  .view-box {
    width: 100%;
    height: 30px;
    margin-top: 20px;
    margin-bottom: 15px;
    position: relative;

    input {
      width: calc(100% - 40px);
      height: 30px;
      line-height: 28px;
      border-radius: 3px;
      border: 1px solid #f1e9e9;
      color: #b3b0b0;
      font-size: 13px;
      padding: 0 10px 0 30px;

      &::-webkit-input-placeholder {
        color: #ccc9c9;
        font-size: 13px;
      }
    }

    .i-sousuo {
      color: rgb(179, 176, 176);
      position: absolute;
      left: 10px;
      top: 9px;
    }

    span {
      position: relative;

      i {
        font-size: 24px;
        top: -3px;
        left: 10px;
        position: absolute;
        color: #ccc;
      }
    }
  }

  .row-header {
    width: 100%;
    height: 30px;
    margin-bottom: 10px;
    border-bottom: 1px solid #e0dddd;

    div {
      height: 30px;
      line-height: 30px;

      &:nth-child(2) {
        text-align: center;
      }

      &:nth-child(3) {
        text-align: right;
      }
    }
  }

  .row-items {
    width: 100%;
    height: 30px;
    margin-bottom: 3px;
    font-size: 12px;
    cursor: pointer;

    &:hover {
      background: #f6f6f6;
    }

    div {
      height: 30px;
      line-height: 30px;

      &:nth-child(2) {
        text-align: center;
      }

      &:nth-child(3) {
        text-align: right;
      }
    }

    img {
      display: inline-block;
      border-radius: 50%;
      position: relative;
      top: 4px;
    }

    .nickname {
      margin-left: 5px;

      &:hover {
        color: #3685d6;
      }
    }
  }
}

.signout-box {
  width: 100%;
  height: 100px;
  background: #ffffff;
  position: absolute;
  z-index: 2;
  bottom: 0;
  box-shadow: -1px -3px 11px 0px #cccccc82;
  -webkit-animation: showFooter 0.35s ease-in-out;
  -moz-animation: showFooter 0.35s ease-in-out;
  animation: showFooter 0.35s ease-in-out;

  p {
    &:first-child {
      text-align: center;
      height: 35px;
      line-height: 35px;
    }

    &:nth-child(2) {
      text-align: center;
      font-size: 12px;
      color: #cccccc;
    }
  }

  .mt38 {
    margin-top: 38px;
  }
}

.signout-btn {
  text-align: center;
  margin-top: 10px;

  button {
    height: 30px;
    width: 90px;
    line-height: 30px;
    background: #007fbb;
    border-radius: 3px;
    cursor: pointer;
    font-size: 14px;

    &:first-child {
      background: #ff3333;
      color: white;
    }

    &:last-child {
      background: #f1eded;
    }
  }
}

.container .footer {
  height: 60px;
  padding: 0;
  line-height: 60px;
  text-align: center;
  background-color: #f8f8f8;

  button {
    width: 180px;
    height: 35px;
    line-height: 35px;
    background: #ed3c3b;
    border-radius: 3px;
    color: white;
    cursor: pointer;
    font-size: 12px;
    margin: auto auto;

    &:active {
      background: #f5b8b8;
    }
  }
}

@keyframes showFooter {
  0% {
    transform: translateY(75px);
  }

  to {
    transform: translateY(0);
  }
}

@-webkit-keyframes showFooter {
  0% {
    -webkit-transform: translateY(75px);
  }

  to {
    -webkit-transform: translateY(0);
  }
}
</style>
