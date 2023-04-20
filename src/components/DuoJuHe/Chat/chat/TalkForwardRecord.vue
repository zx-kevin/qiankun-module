<template>
  <div class="lum-dialog-mask" v-show="isShow">
    <el-container class="lum-dialog-box" v-outside="close">
      <el-header class="no-padding header" height="60px">
        <p>会话记录 ({{ records.length }})</p>
        <p class="tools">
          <i class="el-icon-close" @click="close" />
        </p>
      </el-header>
      <el-main class="no-padding main" v-loading="loading">
        <el-scrollbar class="full-height" tag="section" :native="false">
          <div v-for="record in records" :key="record.id" class="message-group">
            <div class="left-box">
              <el-avatar fit="contain" shape="square" :size="30" :src="record.headPortrait" />
            </div>

            <div class="right-box">
              <div class="msg-header">
                <span class="name">
                  {{ record.friendRemark ? record.friendRemark : record.realName }}
                </span>
                <el-divider direction="vertical" />
                <span class="time">{{ record.createTime }}</span>
              </div>

              <!-- 文本消息 -->
              <text-message v-if="record.msgType == 1" :content="record.content" />

              <!-- 文件 - 图片消息 -->
              <image-message
                v-else-if="record.msgType == 2 && record.file.fileType == 1"
                :src="record.file.fileUrl"
              />

              <!-- 文件 - 音频消息 -->
              <audio-message
                v-else-if="record.msgType == 2 && record.file.fileType == 2"
                :src="record.file.fileUrl"
              />

              <!-- 文件 - 视频消息 -->
              <video-message v-else-if="record.msgType == 2 && record.file.fileType == 3" />

              <!-- 文件 - 其它格式文件 -->
              <file-message
                v-else-if="record.msgType == 2 && record.file.fileType == 4"
                :file="record.file"
                :recordId="record.recordId"
              />

              <!-- 代码块消息 -->
              <code-message
                v-else-if="record.msgType == 4"
                :code="record.codeBlock.codeContent"
                :lang="record.codeBlock.codeLang"
              />

              <div v-else class="other-message">未知消息类型</div>
            </div>
          </div>
        </el-scrollbar>
      </el-main>
    </el-container>
  </div>
</template>
<script>
import { queryChatTalkRecordForwardPageResList } from '@/api/module/chat/im/chatTalkRecord';

export default {
  name: 'TalkForwardRecord',
  data() {
    return {
      recordId: 0,
      records: [],
      loading: false,
      isShow: false,
    };
  },
  methods: {
    open(recordId) {
      if (recordId !== this.recordId) {
        this.recordId = recordId;
        this.records = [];
        this.loadRecords();
      }

      this.isShow = true;
    },
    close() {
      this.isShow = false;
    },
    loadRecords() {
      this.loading = true;
      queryChatTalkRecordForwardPageResList({
        recordId: this.recordId,
      })
        .then((res) => {
          this.records = res.data.records;
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>
<style lang="scss" scoped>
.lum-dialog-mask {
  z-index: 99999;
}

.lum-dialog-box {
  width: 500px;
  max-width: 500px;
  height: 600px;
}

:deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}

@import '@/assets/styles/chat/talk-records.scss';
</style>
