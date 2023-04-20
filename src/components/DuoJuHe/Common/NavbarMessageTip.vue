<template>
  <div>
    <el-badge :value="unreadMessageTotalNum" class="myItemBadge">
      <el-dropdown trigger="click">
        <div>
          <svg-icon :icon-class="'tiplingdang'" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-if="authChatMessage()"
            ><router-link to="/chat/message"
              ><svg-icon :icon-class="'chatMsg'" /><span style="padding-left: 10px"
                >多聊信息（{{ chatMessageUnreadNum }}）</span
              ></router-link
            ></el-dropdown-item
          >
          <el-dropdown-item v-if="authFriendsApply()"
            ><router-link to="/imChatAdmin/myChatFriendsApplyList"
              ><svg-icon :icon-class="'peoples'" /><span style="padding-left: 10px"
                >好友申请（{{ friendApplyUnreadNum }}）</span
              ></router-link
            ></el-dropdown-item
          >
          <el-dropdown-item v-if="authSystemMessage()"
            ><router-link to="/systemAdmin/systemMessageAdmin"
              ><svg-icon :icon-class="'systemMsg'" /><span style="padding-left: 10px"
                >系统消息（{{ sysMessageUnreadNum }}）</span
              ></router-link
            ></el-dropdown-item
          >
        </el-dropdown-menu>
      </el-dropdown>
    </el-badge>
  </div>
</template>

<script>
import { queryCountUntreatedSystemMessage } from '@/api/system/systemMessage';
import { mapState } from 'pinia';
import notify from '@/store/modules/notify.js';
const title = document.title;
export default {
  name: 'NavbarMessageTip',
  data() {
    return {
      unreadMessageTotalNum: 0,
      sysMessageUnreadNum: 0,
      chatMessageUnreadNum: 0,
      friendApplyUnreadNum: 0,
      initChatMessageUnreadNum: -1,
      // 消息未读数计时器
      interval: null,
    };
  },
  computed: {
    ...mapState(notify, ['systemMessageNum', 'friendApplyNum', 'unreadNum']),
  },
  watch: {
    //系统消息
    systemMessageNum(value) {
      if (!this.authChatMessage) {
        return;
      }
      this.sysMessageUnreadNum = value;
      this.unreadMessageTotalNum = value + this.chatMessageUnreadNum + this.friendApplyUnreadNum;
      clearInterval(this.interval);
      if (value > this.sysMessageUnreadNum) {
        //开启右下角弹窗提示
        let title = '系统消息';
        let message = '您有一条新的系统消息，请及时查看...';
        let url = '/systemAdmin/systemMessageAdmin';
        this.bottomRightMessage(title, message, url);
      } else {
        document.title = title;
      }
    },

    //好友申请
    friendApplyNum(value) {
      if (!this.authFriendsApply) {
        return;
      }
      this.friendApplyUnreadNum = value;
      this.unreadMessageTotalNum = value + this.chatMessageUnreadNum + this.sysMessageUnreadNum;
      clearInterval(this.interval);
      if (value > this.friendApplyUnreadNum) {
        //开启右下角弹窗提示
        let title = '好友申请';
        let message = '您有一条新的好友申请消息,请注意查收...';
        let url = '/imChatAdmin/myChatFriendsApplyList';
        this.bottomRightMessage(title, message, url);
      } else {
        document.title = title;
      }
    },

    //多聊消息
    unreadNum(value) {
      if (!this.authChatMessage) {
        return;
      }
      let oldInitChatMessageUnreadNum = this.initChatMessageUnreadNum;
      this.initChatMessageUnreadNum = value;
      this.chatMessageUnreadNum = value;
      this.unreadMessageTotalNum = value + this.sysMessageUnreadNum + this.friendApplyUnreadNum;
      clearInterval(this.interval);
      if (value > oldInitChatMessageUnreadNum && oldInitChatMessageUnreadNum >= 0) {
        //开启右下角弹窗提示
        let title = '多聊信息';
        let message = '您有一条新的多聊信息，请及时查看...';
        let url = '/chat/message';
        this.bottomRightMessage(title, message, url);
      } else {
        document.title = title;
      }
    },
  },
  destroyed() {
    document.title = title;
    clearInterval(this.interval);
  },
  created() {
    this.queryCountUntreatedSystemMessage();
  },
  methods: {
    //好友申请权限
    authFriendsApply() {
      return this.$auth.hasPermi('myChatFriendsApplyList');
    },
    //多聊信息权限
    authChatMessage() {
      return this.$auth.hasPermi('myImChatList');
    },
    //系统消息权限
    authSystemMessage() {
      return this.$auth.hasPermi('systemMessageAdmin');
    },

    /** 查询未读消息 */
    queryCountUntreatedSystemMessage() {
      queryCountUntreatedSystemMessage().then((res) => {
        let data = res.data;
        //总数量
        let messageTotalNum = 0;
        //系统消息数量
        if (this.authSystemMessage) {
          let sysMessageUnreadNum = data.systemMessageNum;
          messageTotalNum = messageTotalNum + sysMessageUnreadNum;
          this.sysMessageUnreadNum = sysMessageUnreadNum;
          notify().SET_SYSTEM_MESSAGE_NUM(sysMessageUnreadNum);
        }
        //多聊数量
        if (this.authChatMessage) {
          let chatMessageUnreadNum = data.chatMessageNum;
          messageTotalNum = messageTotalNum + chatMessageUnreadNum;
          this.chatMessageUnreadNum = chatMessageUnreadNum;
          this.initChatMessageUnreadNum = chatMessageUnreadNum;
          notify().SET_UNREAD_NUM(chatMessageUnreadNum);
        }
        //好友申请数量
        if (this.authFriendsApply) {
          let friendApplyUnreadNum = data.friendApplyNum;
          messageTotalNum = messageTotalNum + friendApplyUnreadNum;
          this.friendApplyUnreadNum = friendApplyUnreadNum;
          notify().SET_FRIEND_APPLY_NUM(friendApplyUnreadNum);
        }
        this.unreadMessageTotalNum = messageTotalNum;
      });
    },

    /**
     * 右下角弹窗
     * @param messageTitle
     * @param message
     * @param routePath
     */
    bottomRightMessage(messageTitle, message, routePath) {
      //函数作用域问题
      let _this = this;
      //开启动态改变title
      if (this.interval == null) {
        this.interval = setInterval(() => {
          document.title = document.title === title ? `【新消息】${title}` : title;
        }, 2000);
      }
      this.$notify({
        title: messageTitle,
        dangerouslyUseHTMLString: true,
        message: `<p style="color:red;margin-top:10px;">${message}</p>`,
        duration: 4500,
        type: 'info',
        customClass: 'pointer',
        onClick: function () {
          if (_this.$route.path !== routePath) {
            _this.$router.push({
              path: routePath,
              query: { t: new Date().getTime() },
            });
          }
          this.close();
        },
      });
    },
  },
};
</script>

<style scoped>
/* 这个起作用 */
.myItemBadge :deep(.el-badge__content.is-fixed) {
  top: 12px;
}
</style>
