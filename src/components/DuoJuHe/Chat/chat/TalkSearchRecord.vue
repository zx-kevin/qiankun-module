<template>
  <div class="lum-dialog-mask">
    <el-container class="lum-dialog-box" :class="{ 'full-screen': fullscreen }">
      <el-header height="60px" class="header">
        <p>消息管理器</p>
        <p class="title">
          <span> 群【{{ title }}】</span>
        </p>
        <p class="tools">
          <i
            class="iconfont"
            style="transform: scale(0.85)"
            :class="fullscreen ? 'icon-tuichuquanping' : 'icon-quanping'"
            @click="fullscreen = !fullscreen"
          />
          <el-icon @click="$emit('close')"><Close /></el-icon>
        </p>
      </el-header>

      <el-header height="38px" class="sub-header">
        <i
          class="iconfont pointer"
          :class="{ 'icon-shouqi2': broadside, 'icon-zhankai': !broadside }"
          @click="triggerBroadside"
        />
        <div class="search-box no-select">
          <i class="el-icon-search" />
          <input
            v-model="search.keyword"
            type="text"
            maxlength="30"
            placeholder="关键字搜索"
            @keyup.enter="searchText($event)"
          />
        </div>
      </el-header>

      <el-container class="full-height ov-hidden">
        <el-aside width="200px" class="broadside" v-show="broadside">
          <el-container class="full-height">
            <el-header style="height: 40px" class="aside-header">
              <!-- <div
                class="item"
                :class="{ selected: contacts.show == 'friends' }"
                @click="contacts.show = 'friends'"
              >
                我的好友({{ contacts.friends.length }})
              </div>
              <div class="item-shuxian">|</div> -->
              <div
                class="item"
                :class="{ selected: contacts.show == 'groups' }"
                @click="contacts.show = 'groups'"
              >
                我的群组({{ contacts.groups.length }})
              </div>
            </el-header>
            <el-main class="no-padding">
              <el-scrollbar
                ref="main_scrollbar"
                @scroll="handleScroll"
                class="full-height"
                tag="section"
                :native="false"
              >
                <!-- {{ contacts }} -->
                <div
                  v-for="item in contacts[contacts.show]"
                  class="contacts-item pointer"
                  :class="{
                    selected: query.groupId == item.groupId,
                  }"
                  :key="item.groupId"
                  @click="triggerMenuItem(item)"
                >
                  <div class="avatar">
                    <el-avatar :size="20" :src="item.headPortrait">
                      <img src="@/assets/images/chat/detault-avatar.jpg" />
                    </el-avatar>
                  </div>
                  <div class="content" v-text="item.groupName"></div>
                </div>

                <!-- 数据加载状态栏 -->
                <div class="loading-toolbar">
                  <span v-if="user_list_loading == 0" class="color-blue">
                    <i class="el-icon-loading" /> 正在加载数据中...
                  </span>
                  <span
                    v-else-if="user_list_loading == 1"
                    class="pointer color-blue"
                    @click="loadGroups"
                  >
                    <i class="el-icon-bottom" /> 查看更多...
                  </span>
                  <span v-else> 没有更多了... </span>
                </div>
              </el-scrollbar>
            </el-main>
          </el-container>
        </el-aside>

        <!-- 聊天记录阅览 -->
        <el-main v-show="showBox == 0" class="no-padding">
          <el-container class="full-height">
            <el-header height="40px" class="type-items">
              <span
                v-for="tab in tabType"
                :class="{ active: query.msgType === tab.msgType }"
                @click="triggerLoadType(tab.msgType)"
                >{{ tab.name }}
              </span>
            </el-header>

            <el-main v-if="records.isEmpty" class="history-record animated fadeIn">
              <div class="empty-records">
                <img src="@/assets/images/chat/chat-search-no-message.png" />
                <p>暂无聊天记录</p>
              </div>
            </el-main>

            <el-main v-else class="history-record">
              <el-scrollbar class="full-height" tag="section" :native="false">
                <template v-for="record in filterMsgs">
                  <div
                    v-if="!['-1', '4', '-2'].includes(record.msgType)"
                    :key="record.groupMsgId"
                    class="message-group"
                  >
                    <div class="left-box">
                      <el-avatar
                        v-if="
                          Object.keys(group_user_list).length > 0 &&
                          group_user_list[record.sendUserId]?.avatar
                        "
                        class="pointer"
                        :size="30"
                        :src="group_user_list[record.sendUserId]?.avatar || ''"
                        :alt="group_user_list[record.sendUserId]?.userName || ''"
                        :title="group_user_list[record.sendUserId]?.userName || ''"
                      />
                      <el-avatar v-else :src="defaultAvatar" />
                      <!-- <el-avatar shape="square" fit="contain" :size="30" :src="record.headPortrait" /> -->
                    </div>

                    <div class="right-box">
                      <div class="msg-header">
                        <span class="name">
                          {{
                            Object.keys(group_user_list).length > 0
                              ? group_user_list[record.sendUserId]?.userName
                              : ''
                          }}
                        </span>
                        <el-divider direction="vertical" />
                        <span class="time">{{ record.sendTime }}</span>
                      </div>

                      <!-- 文本消息 -->
                      <text-message v-if="record.msgType == 0" :content="record.msgContent" />
                      <!-- 文本消息 -->
                      <!-- <text-message v-else-if="record.msgType == '-1'" :content="record.msgContent" /> -->

                      <!-- 加入视频 -->
                      <div v-else-if="record.msgType == '-3'" class="btn-open-video">
                        {{ record.msgContent }}
                      </div>

                      <!-- 文件 - 图片消息 -->
                      <image-message
                        v-else-if="record.msgType == 1 && record.fileType == 0"
                        :src="record.filePath || ''"
                      />

                      <!-- 文件 - 其它格式文件 -->
                      <file-message
                        v-else-if="record.msgType == 1 && record.fileType == 1"
                        :file="record"
                        :recordId="record.groupMsgId"
                      />

                      <!-- 文件 - 音频消息 -->

                      <audio-message
                        v-else-if="record.msgType == 1 && record.fileType == 2"
                        :file="record"
                        :src="record.filePath"
                      />

                      <!-- 文件 - 视频消息 -->
                      <video-message
                        v-else-if="record.msgType == 5 && record.fileType == 3"
                        :src="record.filePath"
                      />

                      <!-- 会话记录消息 -->
                      <!-- <forward-message
                        v-else-if="record.msgType == 3"
                        :forward="record.forward"
                        :recordId="record.recordId"
                      /> -->

                      <!-- 代码块消息 -->
                      <code-message
                        v-else-if="record.msgType == 2"
                        :code="record.groupMsgCode.codeContent"
                        :lang="record.groupMsgCode.codeLang"
                      />

                      <!-- 投票消息 -->
                      <vote-message
                        v-else-if="record.msgType == 3"
                        :recordId="record.groupMsgVote.groupMsgVoteId"
                        :vote="record"
                      />

                      <div v-else class="other-message">未知消息类型[{{ record.msgType }}]</div>
                    </div>
                  </div>
                </template>

                <!-- 数据加载栏 -->
                <div v-show="records.loadStatus == 1" class="load-button blue">
                  <el-icon><Loading /></el-icon>
                  <span>加载数据中...</span>
                </div>
                <div v-show="records.loadStatus == 0 && !isOver" class="load-button">
                  <el-icon><ArrowDown /></el-icon>
                  <span @click="loadChatRecord">加载更多...</span>
                </div>
              </el-scrollbar>
            </el-main>
          </el-container>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script>
import { queryMyChatUsersFriendsPageResList } from '@/api/module/chat/im/chatUsersFriends';
import { getGroupPageApi } from '@/api/module/chat/im/chatGroup';
import { getGroupMsgPageApi } from '@/api/module/chat/im/chatTalkRecord';
import { formateSize as renderSize, download, imgZoom } from '@/utils/functions';
import useUserStore from '@/store/modules/user.js';
export default {
  name: 'TalkSearchRecord',
  props: {
    params: {
      type: Object,
      default: () => {
        return {
          listId: 0,
          groupId: 0,
          title: '',
        };
      },
    },
    group_user_list: {
      default: {},
    },
  },
  setup() {},
  data() {
    return {
      fullscreen: false,
      userId: useUserStore().userId,
      defaultAvatar: useUserStore().defaultAvatar,
      title: '',
      //每次加载数量
      loadRows: 10,
      //分页数
      loadPage: 1,
      //总数量
      loadTotal: 0,
      isOver: false, // 最后一页
      // 侧边栏相关信息
      broadside: false,
      contacts: {
        show: 'groups',
        friends: [],
        groups: [],
      },

      query: {
        listId: 0,
        groupId: 0,
        msgType: '',
      },

      // 用户聊天记录
      records: {
        recordId: 0,
        items: [],
        isEmpty: false,
        loadStatus: 0,
      },

      showBox: 0,

      tabType: [
        { name: '全部', msgType: '' },
        { name: '文本消息', msgType: '0' },
        { name: '文件', msgType: '1' },
        // { name: '会话记录', msgType: '5' },
        { name: '代码块', msgType: '2' },
        { name: '群投票', msgType: '3' },
        { name: '视频', msgType: '5' },
      ],

      search: {
        keyword: '', // 关键字查询
        date: '', // 时间查询
        page: 1, // 当前分页
        totalPage: 50, // 总分页
        items: [], // 数据列表
        isShowDate: false,
      },

      queryParams: {
        pageNum: 1,
        pageSize: 10,
      },
      load_total: 0,
      user_list_loading: 1,
    };
  },
  mounted() {
    this.title = this.params.groupName;
    this.query = {
      listId: this.params.listId,
      groupId: this.params.groupId,
      msgType: '',
    };

    this.loadChatRecord(0);
  },
  created() {
    // this.loadFriends();
    this.loadGroups();
  },
  computed: {
    filterMsgs() {
      return this.search.keyword == ''
        ? this.records.items
        : this.records.items.filter((item) => {
            return item.msgContent.match(this.search.keyword) != null;
          });
    },
  },
  methods: {
    download,
    renderSize,

    // 获取图片信息
    getImgStyle(url) {
      return imgZoom(url, 200);
    },

    // 获取会话记录消息名称
    getForwardTitle(item) {
      let arr = [...new Set(item.map((v) => v.realName))];
      return arr.join('、') + '的会话记录';
    },

    // 获取好友列表
    loadFriends() {
      queryMyChatUsersFriendsPageResList({}).then((response) => {
        this.contacts.friends = response.data.records.map((item) => {
          return {
            groupId: item.groupId,
            listId: 1,
            headPortrait: item.headPortrait,
            realName: item.friendRemark ? item.friendRemark : item.realName,
          };
        });
      });
    },
    base64ToImageFn(avatar) {
      // console.log(avatar);
      let src = `data:image/png;base64,${avatar}`;
      // console.log(src);
      return src;
    },
    // 获取群聊列表
    loadGroups() {
      this.user_list_loading = 0;
      if (this.queryParams.pageNum > this.load_total && this.load_total != 0) {
        console.log(this.queryParams.pageNum, this.load_total);
        this.user_list_loading = 2;
        return;
      }
      getGroupPageApi(this.queryParams).then((response) => {
        this.queryParams.pageNum += 1;
        this.user_list_loading = 1;
        let data = response.rows.map((item) => {
          item.groupAvatar = this.base64ToImageFn(item.groupAvatar);
          return item;
        });
        this.load_total = Math.ceil(response.total / this.queryParams.pageSize);
        this.contacts.groups = this.contacts.groups.concat(data);
      });
    },

    // 左侧联系人菜单点击事件
    triggerMenuItem(item) {
      this.title = item.groupName;
      this.query.listId = item.listId;
      this.query.groupId = item.groupId;
      this.showBox = 0;

      this.triggerLoadType('');
    },

    // 加载历史记录
    loadChatRecord() {
      let data = {
        groupId: this.query.groupId,
        listId: this.query.listId,
        msgType: this.query.msgType,
        pageSize: this.loadRows,
        pageNum: this.loadPage,
      };

      if (this.records.loadStatus === 1) {
        return;
      }
      this.records.loadStatus = 1;
      getGroupMsgPageApi(data)
        .then((res) => {
          let records = data.recordId === 0 ? [] : this.records.items;
          records.push(...res.rows);
          this.records.items = records;
          //this.records.loadStatus = res.data.records.length < res.data.limit ? 2 : 0
          this.loadTotal = records.length + this.loadTotal;
          this.records.loadStatus = res.total > this.loadTotal ? 0 : 2;
          // console.log(res.total, this.loadTotal);
          if (this.records.loadStatus === 0) {
            this.loadPage++;
          } else if (this.records.loadStatus === 2) {
            this.isOver = true;
          }
          if (this.records.items.length === 0) {
            this.records.isEmpty = true;
          } else {
            this.records.lastRecordId = this.records.items[this.records.items.length - 1].recordId;
          }
        })
        .finally(() => {
          this.records.loadStatus = 0;
        });
    },

    triggerLoadType(type) {
      let lastRecordId = this.records.lastRecordId;
      this.records.lastRecordId = lastRecordId === 0 ? '' : lastRecordId;
      this.query.msgType = type;
      this.records.isEmpty = false;
      this.records.items = [];
      this.loadPage = 1;
      this.loadTotal = 0;
      this.loadChatRecord();
    },

    searchText() {
      if (this.search.keyword === '') {
        this.showBox = 0;
        return false;
      }
      this.records.isEmpty = false;
      this.records.items = [];
      this.loadPage = 1;
      this.loadTotal = 0;
      this.loadChatRecord();
      /* this.$notify.info({
        title: '消息',
        message: '查询功能正在开发中...',
      })*/
    },

    triggerBroadside() {
      this.broadside = !this.broadside;
    },

    // 滚动条监听
    handleScroll(val) {
      // console.log(val);
      let scrollTop = val.scrollTop;
      let { scrollHeight, clientHeight } = this.$refs.main_scrollbar.wrapRef;
      if (
        scrollTop + clientHeight >= scrollHeight - 60 &&
        this.queryParams.pageNum <= this.load_total &&
        this.user_list_loading == 0
      ) {
        this.loadGroups();
      }
    },
  },
};
</script>
<style lang="scss" scoped>
:deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}

.lum-dialog-mask {
  z-index: 1;
}

.lum-dialog-box {
  width: 100%;
  height: 600px;
  max-width: 800px;
  transition: 1s ease;

  &.full-screen {
    width: 100%;
    height: 100%;
    max-width: unset;
    margin: 0;
    border-radius: 0px;
  }

  .sub-header {
    height: 38px;
    line-height: 38px;
    font-size: 12px;
    border-bottom: 1px solid #f9f4f4;
    margin-top: 10px;
    padding: 0 10px;
    position: relative;

    i {
      font-size: 22px;
      color: #6f6a6a;
    }

    .search-box {
      position: absolute;
      width: 230px;
      height: 32px;
      top: 2px;
      right: 10px;
      background: #f9f4f4;
      border-radius: 5px;

      i {
        position: absolute;
        left: 10px;
        top: 8px;
        font-size: 16px;
      }

      input {
        position: absolute;
        left: 35px;
        top: 3px;
        height: 25px;
        width: 184px;
        color: #7d7171;
        background: #f9f4f4;
      }
    }
  }

  .broadside {
    $border: 1px solid #f9f9f9;
    border-right: $border;
    user-select: none;
    transition: 3s ease;

    .aside-header {
      display: flex;
      flex-direction: row;
      height: 100%;
      border-bottom: $border;
      padding: 0;

      > div {
        text-align: center;
        line-height: 40px;
        font-size: 13px;
        font-weight: 400;
      }

      .item {
        flex: 1;
        cursor: pointer;

        &.selected {
          color: #66b1ff;
        }
      }

      .item-shuxian {
        flex-basis: 1px;
        flex-shrink: 0;
        color: rgb(232 224 224);
      }
    }

    .contacts-item {
      height: 35px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      padding-left: 10px;
      position: relative;

      .avatar {
        flex-basis: 40px;
        flex-shrink: 0;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .content {
        flex: 1 1;
        height: 100%;
        line-height: 35px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 13px;
        padding-right: 10px;
      }

      &:hover,
      &.selected {
        background-color: #f5f5f5;
      }
    }
  }
}

/* first box */
.type-items {
  padding: 0 0 0 10px;
  line-height: 40px;
  user-select: none;
  border-bottom: 1px solid #f9f4f4;

  .active {
    color: #03a9f4;
    font-weight: 500;
    font-size: 13px;
  }

  span {
    height: 40px;
    width: 45px;
    text-align: center;
    cursor: pointer;
    margin: 0 10px;
    font-size: 12px;
    font-weight: 400;
  }
}

.history-record {
  padding: 10px 0;
}

.load-button {
  width: 100%;
  height: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;

  &.blue {
    color: #51b2ff;
  }

  span {
    margin-left: 5px;
    font-size: 13px;
    cursor: pointer;
    user-select: none;
  }
}

.empty-records {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: #cccccc;
  font-weight: 300;
  font-size: 14px;

  img {
    width: 100px;
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
@import '@/assets/styles/chat/talk-records.scss';
</style>
