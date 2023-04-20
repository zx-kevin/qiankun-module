<template>
  <div class="lum-dialog-mask">
    <el-container class="lum-dialog-box">
      <el-header class="header no-select" height="60px">
        <p>群公告</p>
        <p class="tools">
          <el-icon @click="$emit('close')"><Close /></el-icon>
        </p>
      </el-header>
      <el-main class="main no-padding">
        <template v-if="items.length == 0">
          <div class="loading">
            <p>暂无群公告</p>
          </div>
        </template>
        <template v-else>
          <el-scrollbar class="full-height" :native="false" tag="section">
            <div class="notice-item">
              <p>{{ items }}</p>
            </div>

            <!-- <div v-for="(item, index) in items" :key="item.noticeId" class="notice-item">
              <div class="title">
                <span class="left-title">{{ item.noticeTitle }}</span>
                <span class="right-tools no-select" @click="catNoticeDetail(index)">
                  {{ item.isShow ? '收起' : '展开' }}
                </span>
              </div>
              <p class="datetime">
                <el-avatar :size="15" :src="item.headPortrait">
                  <img src="@/assets/images/chat/detault-avatar.jpg" />
                </el-avatar>
                <span class="text nickname" @click="$user(item.createUserId)">
                  {{ item.createUserName }}
                </span>
                <span class="text">发表于 {{ item.createTime }}</span>
              </p>
              <p class="content" :class="{ retract: !item.isShow }">
                {{ item.content }}
              </p>
            </div> -->
          </el-scrollbar>
        </template>
      </el-main>
    </el-container>
  </div>
</template>
<script>
import { queryChatGroupNoticePageResList } from '@/api/module/chat/im/chatGroup';
import Loading from '@/components/DuoJuHe/Chat/global/Loading';
import { getGroupDetailApi } from '@/api/module/chat/im/chatGroup';
export default {
  name: 'GroupNotice',
  props: {
    groupId: {
      type: [String, Number],
      default: null,
    },
    groupNotice: {
      default: null,
    },
  },
  components: {
    Loading,
  },
  data() {
    return {
      // 公告列表
      items: '',
      loadStatus: 0,
    };
  },
  created() {
    this.loadNotices();
  },
  methods: {
    // 加载群组公告列表
    loadNotices() {
      // this.items = this.groupNotice;
      getGroupDetailApi({
        groupId: this.groupId,
      }).then((res) => {
        this.items = res.data.groupNotice;
      });
      // this.loadStatus = 0;
      // queryChatGroupNoticePageResList({
      //   groupId: this.groupId,
      // })
      //   .then((res) => {
      //     this.items = res.data.records.map((item) => {
      //       item.isShow = false;
      //       return item;
      //     });
      //     this.loadStatus = 1;
      //   })
      //   .catch(() => {
      //     this.loadStatus = 2;
      //   });
    },
    // 展开/收起群公告详情
    catNoticeDetail(index) {
      this.items[index].isShow = !this.items[index].isShow;
    },
  },
};
</script>
<style lang="scss" scoped>
.lum-dialog-box {
  width: 650px;
  max-width: 650px;
  height: 550px;

  .main {
    overflow: hidden;

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 70%;
      font-size: 12px;

      p {
        margin-top: 20px;
      }

      .svg-icon {
        width: 80px;
        margin-bottom: 10px;
      }
    }

    .notice-item {
      cursor: pointer;
      min-height: 76px;
      overflow: hidden;
      border-bottom: 1px dashed #e2dcdc;
      padding-bottom: 5px;
      margin: 2px 20px 15px 15px;

      h6 {
        font-size: 15px;
        font-weight: 300;
      }

      .title {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        height: 30px;

        .left-title {
          flex: 1 1;
          height: 100%;
          line-height: 30px;
          font-size: 15px;
        }

        .right-tools {
          flex-basis: 70px;
          flex-shrink: 0;
          height: 100%;
          line-height: 30px;
          text-align: right;
          font-weight: 300;
          font-size: 12px;
          color: #2196f3;
        }
      }

      .datetime {
        font-size: 10px;
        color: #a59696;
        font-weight: 300;
        display: flex;
        flex-direction: row;
        align-items: center;
        margin: 10px 0;

        .text {
          margin: 0 5px;
        }

        .nickname {
          color: #2196f3;
          font-weight: 400;
        }
      }

      .retract {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .content {
        font-size: 13px;
        line-height: 28px;
        font-weight: 400;
        color: #706a6a;
      }
    }
  }
}

:deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}
</style>
