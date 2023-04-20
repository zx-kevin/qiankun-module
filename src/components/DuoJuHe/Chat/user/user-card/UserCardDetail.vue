<template>
  <div class="lum-dialog-mask animated fadeIn">
    <el-container class="container" v-outside="close">
      <el-header class="no-padding header" height="180px">
        <i class="close el-icon-error pointer" @click="close" />
        <div class="img-banner">
          <img :src="detail.bag" class="img-banner" />
        </div>
        <div class="user-header">
          <div class="avatar">
            <div class="avatar-box">
              <img :src="detail.headPortrait" :onerror="userStore.defaultAvatar" />
            </div>
          </div>
          <div class="nickname">
            <i class="iconfont icon-qianming" />
            <span>{{ detail.realName || '未设置昵称' }}</span>
            <div class="share no-select">
              <i class="iconfont icon-fenxiang3" /> <span>分享</span>
            </div>
          </div>
        </div>
      </el-header>
      <el-main class="main">
        <div class="user-sign">
          <div class="sign-arrow"></div>
          <i class="iconfont" />
          <span>个性签名：{{ detail.motto || '--' }} </span>
        </div>

        <div class="card-rows no-select">
          <div class="card-row">
            <label>账号</label>
            <span>{{ detail.loginName }}</span>
          </div>
          <div class="card-row">
            <label>手机</label>
            <span>{{ detail.mobileNumber }}</span>
          </div>
          <div class="card-row">
            <label>昵称</label>
            <span>{{ detail.realName || '未设置昵称' }}</span>
          </div>
          <div class="card-row">
            <label>性别</label>
            <span>{{ detail.genderName }}</span>
          </div>
          <div v-show="detail.friendStatus === 2" class="card-row">
            <label>备注</label>
            <span v-if="editRemark.isShow === false">{{
              detail.friendRemark ? detail.friendRemark : '暂无备注'
            }}</span>
            <span v-else>
              <input
                v-model="editRemark.text"
                v-focus
                class="friend-remark"
                type="text"
                @keyup.enter="editRemarkSubmit"
              />
            </span>
            <i v-show="!editRemark.isShow" class="el-icon-edit-outline" @click="clickEditRemark" />
          </div>
        </div>
      </el-main>
      <el-footer v-show="detail.friendStatus !== 0" class="no-padding footer" height="50px">
        <el-button
          v-if="detail.friendStatus === 1 && detail.friendApply === 0"
          type="primary"
          size="small"
          icon="el-icon-circle-plus-outline"
          @click="apply.isShow = true"
          >添加好友
        </el-button>
        <el-button v-else-if="detail.friendApply === 1" type="primary" size="small"
          >已发送好友申请，请耐心等待...
        </el-button>
        <el-button
          v-else-if="detail.friendStatus === 2"
          type="primary"
          size="small"
          icon="el-icon-s-promotion"
          @click="sendMessage(detail)"
          >发消息
        </el-button>
      </el-footer>

      <!-- 添加好友申请表单 -->
      <div v-outside="closeApply" class="friend-from" :class="{ 'friend-from-show': apply.isShow }">
        <p>
          <span>请填写好友申请备注：</span>
          <span @click="closeApply">取消</span>
        </p>
        <div>
          <input v-model="apply.text" type="text" placeholder="(必填项)" @keyup.enter="sendApply" />
          <el-button type="primary" size="small" @click="sendApply"> 立即提交 </el-button>
        </div>
      </div>
    </el-container>
  </div>
</template>
<script>
import useUserStore from '@/store/modules/user.js';
import {
  queryChatUsersDetailResByUserId,
  updateFriendRemark,
} from '@/api/module/chat/im/chatUsersFriends';
import { saveChatUsersFriendsApply } from '@/api/module/chat/im/chatUsersFriendsApply';
import { toTalk } from '@/utils/talk';
import default_banner from '@/assets/images/chat/default-user-banner.png';
export default {
  name: 'UserCardDetail',
  props: {
    userId: {
      type: [String, Number],
      default: 0,
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
      detail: {
        userId: '',
        mobileNumber: '',
        realName: '',
        headPortrait: '',
        motto: '',
        friendStatus: 0,
        loginName: '',
        friendApply: 0,
        friendRemark: '',
        bag: default_banner,
        genderName: '',
      },

      // 好友备注表单
      editRemark: {
        isShow: false,
        text: '',
      },

      // 好友申请表单
      apply: {
        isShow: false,
        text: '',
      },

      contacts: false,
    };
  },
  created() {
    console.log(this.userId);
    // this.loadUserDetail();
  },
  methods: {
    close() {
      if (this.contacts) return false;

      this.$emit('close');
    },

    // 点击编辑备注信息
    clickEditRemark() {
      this.editRemark.isShow = true;
      this.editRemark.text = this.detail.friendRemark;
    },

    // 获取用户信息
    loadUserDetail() {
      queryChatUsersDetailResByUserId({
        userId: this.userId,
      }).then((res) => {
        this.detail.userId = this.userId;
        Object.assign(this.detail, res.data);
      });
    },

    // 发送添加好友申请
    sendApply() {
      if (this.apply.text === '') {
        return;
      }
      saveChatUsersFriendsApply({
        friendId: this.detail.userId,
        applyDescription: this.apply.text,
      }).then((res) => {
        this.apply.isShow = false;
        this.apply.text = '';
        this.detail.friendApply = 1;
      });
    },

    // 编辑好友备注信息
    editRemarkSubmit() {
      let data = {
        friendId: this.detail.userId,
        friendRemark: this.editRemark.text,
      };

      if (data.friendRemark === this.detail.friendRemark) {
        this.editRemark.isShow = false;
        return;
      }
      updateFriendRemark(data).then((res) => {
        this.editRemark.isShow = false;
        this.detail.friendRemark = this.editRemark.text;
        this.$emit('changeRemark', data);
      });
    },

    // 隐藏申请表单
    closeApply() {
      this.apply.isShow = false;
    },

    // 发送好友消息
    sendMessage() {
      this.close();
      // toTalk(1, this.userId);
    },
  },
};
</script>
<style lang="scss" scoped>
.container {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  width: 350px;
  height: 600px;
  overflow: hidden;
  border-radius: 3px;

  .header {
    position: relative;

    .close {
      position: absolute;
      right: 10px;
      top: 10px;
      color: white;
      transition: all 1s;
      z-index: 1;
      font-size: 20px;
    }

    .img-banner {
      width: 100%;
      height: 100%;
      background-image: url(@/assets/images/chat/default-user-banner.png);
      background-size: 100%;
      transition: all 0.2s linear;
      cursor: pointer;
      overflow: hidden;

      img:hover {
        -webkit-transform: scale(1.1);
        transform: scale(1.1);
        -webkit-filter: contrast(130%);
        filter: contrast(130%);
      }
    }
  }

  .main {
    background-color: white;
    padding: 45px 16px 0;
  }

  .footer {
    display: flex;
    justify-content: center;
    align-items: center;
    border-top: 1px solid #f5eeee;

    button {
      width: 90%;
    }
  }
}

.user-header {
  width: 100%;
  height: 80px;
  position: absolute;
  bottom: -40px;
  display: flex;
  flex-direction: row;

  .avatar {
    width: 100px;
    flex-shrink: 0;
    display: flex;
    justify-content: center;

    .avatar-box {
      width: 80px;
      height: 80px;
      background-color: white;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;

      img {
        height: 70px;
        width: 70px;
        border-radius: 50%;
      }
    }
  }

  .nickname {
    flex: auto;
    padding-top: 50px;
    font-size: 16px;
    font-weight: 400;

    span {
      margin-left: 5px;
    }

    .share {
      display: inline-flex;
      width: 65px;
      height: 22px;
      background: #ff5722;
      color: white;
      align-items: center;
      justify-content: center;
      padding: 3px 8px;
      border-radius: 20px;
      transform: scale(0.7);
      cursor: pointer;
      i {
        margin-top: 2px;
      }
      span {
        font-size: 14px;
        margin-left: 4px;
      }
    }
  }
}

.user-sign {
  min-height: 26px;
  border-radius: 5px;
  padding: 5px;
  line-height: 25px;
  background: #f3f5f7;
  color: #7d7d7d;
  font-size: 12px;
  margin-bottom: 20px;
  position: relative;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  position: relative;

  .sign-arrow {
    position: absolute;
    width: 0;
    height: 0;
    font-size: 0;
    border: 5px solid hsla(0, 0%, 96.9%, 0);
    border-bottom-color: #f3f5f7;
    left: 28px;
    top: -9px;
  }
}

.card-rows {
  .card-row {
    height: 35px;
    line-height: 35px;
    font-size: 14px;
    position: relative;
    cursor: pointer;
    color: #736f6f;

    label {
      margin-right: 25px;
      color: #cbc5c5;
    }

    .friend-remark {
      border-bottom: 1px dashed #bec3d0;
      padding-bottom: 2px;
      color: #736f6f;
      width: 60%;
      padding-right: 5px;
    }

    .el-icon-edit-outline {
      margin-left: 3px !important;
    }
  }
}

/* 好友申请表单 */
.friend-from {
  position: absolute;
  background: #fbf6f6;
  height: 80px;
  z-index: 2;
  width: 100%;
  bottom: -80px;
  left: 0;
  transition: all 0.5s ease-in-out;

  p {
    height: 20px;
    line-height: 20px;
    padding: 7px 5px 5px 15px;
    font-size: 13px;

    span {
      &:nth-child(2) {
        float: right;
        margin-right: 13px;
        color: #32caff;
        cursor: pointer;
      }
    }
  }

  div {
    height: 31px;
    line-height: 20px;
    padding: 7px 5px 5px 15px;
    font-size: 13px;
  }

  input {
    height: 30px;
    line-height: 30px;
    width: 220px;
    border-radius: 3px;
    padding: 0 5px;
    margin-right: 5px;
  }
}

.friend-from-show {
  bottom: 0;
}
</style>
