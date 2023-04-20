<template>
  <div class="lum-dialog-mask">
    <el-container class="lum-dialog-box" v-outside="close">
      <el-header class="no-padding header no-select" height="60px">
        <p>
          {{ from.groupId == 0 ? '创建群组' : '请选择需要拉入群聊的用户' }}
        </p>
        <p class="tools">
          <el-icon @click="close"><Close /></el-icon>
        </p>
      </el-header>
      <el-main class="main no-padding">
        <el-container class="full-height">
          <el-aside width="250px" class="aside-border">
            <el-container class="full-height no-select">
              <el-header
                class="search-header"
                height="50px"
                :class="{ shadow: searchHeaderShadow }"
              >
                <el-input
                  v-model="keywords"
                  placeholder="搜索 | 名称"
                  prefix-icon="el-icon-search"
                  clearable
                  size="small"
                />
              </el-header>
              <el-main class="no-padding">
                <el-scrollbar
                  ref="main_scrollbar"
                  @scroll="handleScroll"
                  class="full-height"
                  tag="section"
                  :native="false"
                >
                  <ul class="friend-items no-select">
                    <template v-for="item in search">
                      <li
                        :key="item.userId"
                        v-if="userStore.userId != item.userId"
                        @click="triggerContacts(item)"
                      >
                        <el-avatar
                          class="avatar"
                          style="margin-top: 5px"
                          :size="25"
                          :src="base_url + item.people.avatar"
                        >
                          <img src="@/assets/images/chat/detault-avatar.jpg" />
                        </el-avatar>
                        <span class="realName">{{ item.people.userName }}</span>
                        <span class="select-btn">
                          <el-icon :class="{ 'icon-active': item.checked }"
                            ><SuccessFilled
                          /></el-icon>
                        </span>
                      </li>
                    </template>
                  </ul>
                  <!-- 数据加载状态栏 -->
                  <div class="loading-toolbar">
                    <span v-if="user_list_loading == 0" class="color-blue">
                      <i class="el-icon-loading" /> 正在加载数据中...
                    </span>
                    <span
                      v-else-if="user_list_loading == 1"
                      class="pointer color-blue"
                      @click="friendsApi"
                    >
                      <i class="el-icon-bottom" /> 查看更多...
                    </span>
                    <span v-else> 没有更多了... </span>
                  </div>
                </el-scrollbar>
              </el-main>
            </el-container>
          </el-aside>

          <el-main class="no-padding">
            <el-container class="full-height">
              <el-header height="50px" v-show="!readonly">
                <div class="group-from no-select">
                  <label>群名称</label>
                  <p style="display: flex; align-items: center">
                    <span style="color: red; margin-right: 5px">*</span>
                    <el-input
                      required
                      v-model="from.groupName"
                      placeholder="请输入群名称(必填)"
                      size="small"
                      :maxlength="20"
                      show-word-limit
                    />
                  </p>
                </div>
              </el-header>
              <el-header height="40px" :class="{ mt40: !readonly }">
                <el-divider content-position="left" class="no-select">
                  <span style="color: #c4c5c7"> 邀请成员 ({{ selected.length }}) </span>
                </el-divider>
              </el-header>
              <el-main>
                <el-scrollbar :native="false" tag="section" class="full-height">
                  <div class="selectd-items">
                    <div v-for="item in selected" :key="item.userId" class="selectd-item no-select">
                      <el-avatar :size="25" :src="base_url + item.people.avatar" />
                      <p>{{ item.people.userName }}</p>
                      <div class="triangle-topleft"></div>
                      <div class="del-mask" @click="delContacts(item)">
                        <i class="el-icon-delete" />
                      </div>
                    </div>
                  </div>
                </el-scrollbar>
              </el-main>
            </el-container>
          </el-main>
        </el-container>
      </el-main>
      <el-footer height="50px" class="no-padding footer">
        <el-button size="small" @click="close" plain>取消</el-button>
        <el-button
          :loading="createSubmitLoading"
          v-if="from.groupId == 0"
          type="primary"
          @click="createSubmit"
        >
          创建群组<span v-show="selected.length">({{ selected.length }})</span>
        </el-button>
        <el-button
          v-else
          :loading="insertLoading"
          type="primary"
          :disabled="selected.length === 0"
          @click="inviteSubmit"
        >
          立即邀请({{ selected.length }})
        </el-button>
      </el-footer>
    </el-container>
  </div>
</template>
<script>
import {
  insertGroupApi,
  insertGroupUserApi,
  queryInviteChatGroupUserPageResList,
} from '@/api/module/chat/im/chatGroup';
import useUserStore from '@/store/modules/user.js';
export default {
  name: 'GroupLaunch',
  props: {
    groupId: {
      type: [String, Number],
      default: null,
    },
  },
  setup() {
    let userStore = useUserStore();
    return {
      userStore,
    };
  },
  data() {
    return {
      readonly: false,
      from: {
        groupId: undefined,
        groupName: '',
      },
      base_url: useUserStore().fileBase,
      contacts: [],
      search: [],
      searchHeaderShadow: false,
      keywords: '',
      isAvatarCropper: false,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
      },
      load_total: 0,
      user_list_loading: 1,
      userNames: [],
      createSubmitLoading: false,
      insertLoading: false,
    };
  },
  computed: {
    selected() {
      return this.contacts.filter((item) => item.checked);
    },
  },
  watch: {
    keywords(val) {
      this.search =
        val == ''
          ? this.contacts
          : this.contacts.filter((item) => {
              // console.log(item.people.userName);
              return item.people.userName && item.people.userName.match(this.keywords) != null;
            });
    },
    contacts(arr) {
      if (this.keywords == '') {
        this.search = arr;
      }
    },
  },
  created() {
    if (this.groupId) {
      // console.log( this.groupId);
      this.readonly = true;
      this.from.groupId = this.groupId;
    } else {
      // console.log(this.groupId);
      this.from.groupId = 0;
    }
    this.friendsApi();
  },
  mounted() {
    // this.handleScroll();
  },
  methods: {
    // 触发选择联系人事件
    triggerContacts(item) {
      let index = this.contacts.findIndex((val) => {
        return val.userId === item.userId;
      });

      this.contacts[index].checked = !this.contacts[index].checked;
    },

    // 取消选中的联系人
    delContacts(item) {
      let index = this.contacts.findIndex((val) => {
        return val.userId === item.userId;
      });

      this.contacts[index].checked = false;
    },

    // 移除所有选中选项
    delAll() {
      this.contacts.forEach((item, i) => {
        this.contacts[i].checked = false;
      });
    },

    // 关闭窗口
    close() {
      this.$emit('close');
    },

    // 获取选中的ID列表
    getIds() {
      this.userNames = [];
      return this.selected.map((item) => {
        this.userNames.push(item.people?.userName);
        return item.userId;
      }); //
    },

    // 加载好友列表
    friendsApi() {
      this.user_list_loading = 0;
      if (this.queryParams.pageNum > this.load_total && this.load_total != 0) {
        console.log(this.queryParams.pageNum, this.load_total);
        this.user_list_loading = 2;
        return;
      }
      queryInviteChatGroupUserPageResList(this.queryParams)
        .then((res) => {
          this.queryParams.pageNum += 1;
          this.user_list_loading = 1;
          // this.contacts = [];
          let data = res.rows.map((item) => {
            return Object.assign({}, item, {
              checked: false,
              userId: item.userId,
            });
          });
          this.load_total = Math.ceil(res.total / this.queryParams.pageSize);
          this.contacts = this.contacts.concat(data);
        })
        .catch(() => {
          this.user_list_loading = 2;
        });
    },

    //创建聊天群
    createSubmit() {
      let data = {
        groupAvatar: '',
        groupName: this.from.groupName,
        groupIntroduce: '',
        userIdList: this.getIds(),
      };
      if (data.groupName == '') {
        this.$message('群聊名称不能为空！');
        return;
      }
      if (this.getIds().length < 1) {
        this.$message('群聊人数必须大于俩人！');
        return;
      }
      this.createSubmitLoading = true;
      insertGroupApi(data)
        .then((res) => {
          this.$emit('create-success', res.data);
          this.$emit('close');
        })
        .finally(() => {
          this.createSubmitLoading = false;
        });
    },

    //好友邀请提交
    inviteSubmit() {
      if (this.selected.length === 0) {
        this.$message('邀请人数必须选择！');
        return;
      }
      this.insertLoading = true;
      insertGroupUserApi({
        groupId: this.from.groupId,
        sysUserIdList: this.getIds(),
      })
        .then((res) => {
          this.$emit('invite-success');
          this.$emit('close');
          // this.$emit('send', {
          //   inviteType: '0',
          //   msgType: '4',
          //   msgContent: `${useUserStore().name}邀请了【${this.userNames.join('、')}】加入了群聊`,
          // });
        })
        .finally((res) => {
          this.insertLoading = false;
        });
    },
    // 滚动条监听
    handleScroll(val) {
      // console.log(val);
      let scrollTop = val.scrollTop;
      let { scrollHeight, clientHeight } = this.$refs.main_scrollbar.wrapRef;
      this.searchHeaderShadow = val.scrollTop != 0;
      if (
        scrollTop + clientHeight >= scrollHeight - 60 &&
        this.queryParams.pageNum <= this.load_total &&
        this.user_list_loading == 0
      ) {
        this.friendsApi();
      }
    },
  },
};
</script>
<style lang="scss" scoped>
:deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}

.lum-dialog-box {
  width: 650px;
  max-width: 650px;
  height: 550px;

  .main {
    .aside-border {
      border-right: 1px solid #f5eeee;
    }
  }

  .footer {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-right: 10px;
    border-top: 1px solid #f5eeee;
  }
}

.search-header {
  padding: 8px;
  display: flex;
  justify-content: center;
  align-items: center;

  &.shadow {
    box-shadow: 0 2px 6px 0 rgba(31, 35, 41, 0.05);
  }
}

.friend-items {
  li {
    padding: 10px;
    cursor: pointer;
    position: relative;

    &:hover {
      background: #f5f5f5;
    }

    .avatar {
      margin-top: 3px;
    }

    .realName {
      width: 60%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      position: absolute;
      top: 10px;
      left: 52px;
      height: 35px;
      line-height: 35px;
      font-weight: 400;
      font-size: 13px;
    }

    .select-btn {
      position: absolute;
      width: 32px;
      height: 35px;
      right: 3px;
      top: 10px;
      line-height: 35px;
      text-align: center;

      i {
        color: #ccc;

        &.icon-active {
          color: #26bcfe !important;
        }
      }
    }
  }
}

.group-from {
  label {
    height: 45px;
    line-height: 47px;
    width: 50px;
    color: #606266;
    padding-right: 3px;
    font-size: 13px;
  }

  input {
    height: 25px;
    width: 100%;
    text-indent: 3px;
    color: #a9a4a4;
    font-size: 12px;
    border-bottom: 1px solid #efebeb;
  }
}

.selectd-items {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;

  .selectd-item {
    width: 23%;
    height: 65px;
    margin: 6px 2px 0px 2px;
    cursor: pointer;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    box-shadow: 0px 0px 3px 0 rgba(0, 0, 0, 0.1);

    p {
      width: 90%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 10px;
      margin-top: 8px;
      text-align: center;
    }

    .del-mask {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(31, 35, 41, 0.5);
      display: none;
      justify-content: center;
      align-items: center;
      color: white;
      transition: ease 0.5s;
      border-radius: 2px;
    }

    &:hover .del-mask {
      display: flex;
    }
  }
}

.loading-toolbar {
  height: 30px;
  line-height: 30px;
  margin: 5px 0;
  text-align: center;
  user-select: none;
  font-size: 13px;
  color: #cec4c4;

  .color-blue {
    color: #409eff;
  }
}

.mt40 {
  margin-top: 40px;
}
</style>
