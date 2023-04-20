<!--
 * @Author: 杰 xuyongfeng@jeoho.com
 * @Date: 2023-02-07 18:12:24
 * @LastEditors: 杰 xuyongfeng@jeoho.com
 * @LastEditTime: 2023-02-17 10:24:39
 * @FilePath: \decision_engine_ui\src\components\DuoJuHe\Chat\editor\MeEditor.vue
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
-->
<template>
  <div>
    <el-container class="editor-container">
      <el-header class="no-padding toolbar" height="35px">
        <ul v-if="!chatMessage">
          <li>
            <el-popover
              ref="popoverEmoticon"
              placement="top-start"
              width="500"
              trigger="click"
              popper-class="no-padding"
            >
              <MeEditorEmoticon ref="editorEmoticon" @selected="selectEmoticon" />
              <template #reference>
                <div>
                  <i class="iconfont icon-icon_im_face" style="font-size: 15px" />
                  <p class="tip-title">表情符号</p>
                </div>
              </template>
            </el-popover>
          </li>
          <li @click="codeBlock.isShow = true">
            <i class="iconfont icon-daima" />
            <p class="tip-title">代码片段</p>
          </li>
          <li @click="recorder = true">
            <el-icon><Headset /></el-icon>
            <p class="tip-title">语音消息</p>
          </li>
          <li @click="$refs.restFile.click()">
            <el-icon><Picture /></el-icon>
            <p class="tip-title">图片</p>
          </li>
          <li @click="$refs.restFile2.click()">
            <el-icon><Folder /></el-icon>
            <p class="tip-title">附件</p>
          </li>
          <li @click="filesManager.isShow = true">
            <el-icon><FolderOpened /></el-icon>
            <p class="tip-title">上传管理</p>
          </li>
          <li v-show="isGroupTalk" @click="vote.isShow = true">
            <el-icon><Histogram /></el-icon>
            <p class="tip-title">发起投票</p>
          </li>
          <li @click="open_video_fn('')">
            <el-icon><Monitor /></el-icon>
            <p class="tip-title">发起视频</p>
          </li>

          <p class="text-tips no-select">
            <span>按Enter发送 / Shift+Enter 换行</span>
            <el-popover placement="top-end" width="600" trigger="click">
              <div class="editor-books">
                <div class="books-title">编辑说明:</div>
                <p>1. 支持上传QQ及微信截图，在QQ或微信中截图后使用Ctrl+v上传图片。</p>
                <p>2. 支持浏览器及Word文档中的图片复制上传、复制后使用Ctrl+v上传图片。</p>
                <p>3. 支持图片拖拽上传。</p>
                <p>4. 支持文件上传 ( 文件小于5M ) 。</p>
                <p>5. 按Enter发送 / Shift+Enter 换行。</p>
                <p>
                  6.
                  注意：当文件正在上传时，请勿关闭网页或离开当前对话框，否则将导致文件停止上传或上传失败。
                </p>
              </div>
              <template #reference>
                <el-icon><InfoFilled /></el-icon>
              </template>
            </el-popover>
          </p>
        </ul>

        <form enctype="multipart/form-data" style="display: none" ref="fileFrom">
          <input type="file" ref="restFile" accept="image/*" @change="uploadImageChange" />
          <input type="file" ref="restFile2" @change="uploadFileChange" />
        </form>
      </el-header>
      <el-main class="no-padding textarea">
        <textarea
          ref="textarea"
          v-paste="pasteImage"
          v-drag="dragPasteImage"
          v-model.trim="editorText"
          rows="6"
          :placeholder="chatMessage ? '当前已禁言' : '你想要的聊点什么呢 ...'"
          @keydown="keydownEvent($event)"
          @input="inputEvent($event)"
        />
      </el-main>
    </el-container>

    <!-- 图片查看器 -->
    <MeEditorImageView
      ref="imageViewer"
      v-model:show="imageViewer.isShow"
      :file="imageViewer.file"
      @confirm="confirmUploadImage"
    />

    <MeEditorRecorder v-if="recorder" @close="recorder = false" @confirm="confirmRecorder" />

    <!-- 代码块编辑器 -->
    <TalkCodeBlock
      v-if="codeBlock.isShow"
      v-model:editMode="codeBlock.editMode"
      @close="codeBlock.isShow = false"
      @confirm="confirmCodeBlock"
    />

    <!-- 文件上传管理器 -->
    <MeEditorFileManage
      ref="filesManager"
      v-model:show="filesManager.isShow"
      @close="
        () => {
          this.filesManager.isShow = false;
        }
      "
      @confirm="confirmUploadFile"
    />

    <MeEditorVote
      v-if="vote.isShow"
      @close="
        () => {
          this.vote.isShow = false;
        }
      "
      @confirm="confirmVote"
    />

    <onlineVideo
      v-if="video.isShow"
      :self="{
        ...group_user_list[userStore.userId],
        chatUserName: group_user_list[userStore.userId]?.userName,
      }"
      :currentRow="{
        ...params,
        Title: params.groupName,
        viewDomainName: 'https://dev-decision-engine-srs.jeoho.com',
        notarizeId: params.groupId,
      }"
      @close="video.isShow = false"
    ></onlineVideo>
  </div>
</template>

<script>
import MeEditorEmoticon from './MeEditorEmoticon';
import MeEditorFileManage from './MeEditorFileManage';
import MeEditorImageView from './MeEditorImageView';
import MeEditorRecorder from './MeEditorRecorder';
import MeEditorVote from './MeEditorVote';
import TalkCodeBlock from '@/components/DuoJuHe/Chat/chat/TalkCodeBlock';
import onlineVideo from '@/components/DuoJuHe/OnlineVideo/index.vue';
import { getPasteImgs, getDragPasteImg } from '@/utils/editor';
import { findTalk } from '@/utils/talk';
import dialogue from '@/store/modules/dialogue';
import useUserStore from '@/store/modules/user';

import {
  sendTalkCodeBlock,
  sendTalkImage,
  sendTalkEmoticon,
} from '@/api/module/chat/im/chatTalkRecord';
import { chatFileApi } from '@/api/module/chat/im/chatGroup.js';
import { forEach } from 'lodash';

export default {
  name: 'MeEditor',
  components: {
    MeEditorEmoticon,
    MeEditorFileManage,
    MeEditorImageView,
    TalkCodeBlock,
    MeEditorRecorder,
    MeEditorVote,
    onlineVideo,
  },
  props: {
    group_user_list: {
      default: {},
    },
    params: {
      default: {},
    },
    chatMessage: {
      default: false,
    },
  },
  setup() {
    const im_dialogue = dialogue();
    const userStore = useUserStore();
    return {
      im_dialogue,
      userStore,
    };
  },
  computed: {
    talkUser() {
      // console.log(this.im_dialogue.indexName);
      return this.im_dialogue.indexName;
    },
    isGroupTalk() {
      return true;
    },
  },
  watch: {},
  data() {
    return {
      // 当前编辑的内容
      editorText: '',

      // 图片查看器相关信息
      imageViewer: {
        isShow: false,
        file: null,
      },

      codeBlock: {
        isShow: false,
        editMode: true,
      },

      filesManager: {
        isShow: false,
      },

      vote: {
        isShow: false,
      },

      video: {
        isShow: false,
      },

      // 录音器
      recorder: false,

      // 上次发送消息的时间
      sendtime: 0,

      // 发送间隔时间（默认1秒）
      interval: 1000,
    };
  },
  mounted() {
    this.editorText = this.getDraftText(this.talkUser);
  },
  methods: {
    open_video_fn(val = '') {
      this.video.isShow = true;
      // console.log(val, this.group_user_list, this.userStore.userId);
      this.$emit('send', {
        msgType: '-3',
        msgContent: val
          ? `${val}加入了视频`
          : `${this.group_user_list[this.userStore.userId]?.userName}发起了视频`,
      });
    },
    // 读取对话编辑草稿信息
    getDraftText(indexName) {
      return findTalk(indexName).draftText || '';
    },

    //复制粘贴图片回调方法
    pasteImage(e) {
      console.log('图片', e);
      let files = getPasteImgs(e);
      if (files.length == 0) return;

      this.openImageViewer(files[0]);
    },

    //拖拽上传图片回调方法
    dragPasteImage(e) {
      let files = getDragPasteImg(e);
      if (files.length == 0) return;

      this.openImageViewer(files[0]);
    },

    inputEvent(e) {
      this.$emit('keyboard-event', e.target.value);
    },

    // 键盘按下监听事件
    keydownEvent(e) {
      if (e.keyCode == 13 && this.editorText == '') {
        e.preventDefault();
      }

      // 回车发送消息
      if (e.keyCode == 13 && e.shiftKey == false && this.editorText != '') {
        let currentTime = new Date().getTime();

        if (this.sendtime > 0) {
          // 判断 1秒内只能发送一条消息
          if (currentTime - this.sendtime < this.interval) {
            e.preventDefault();
            return false;
          }
        }

        this.$emit('send', { msgContent: this.editorText });
        this.editorText = '';
        this.sendtime = currentTime;
        e.preventDefault();
      }
    },

    // 选择图片文件后回调方法
    uploadImageChange(e) {
      let file = e.target.files[0];
      if (!/\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(file.name)) {
        this.$notify.warning({
          title: '消息',
          message: '请上传图片类型【jpg|jpeg|png|GIF|JPG|PNG】',
        });
        return;
      }

      this.openImageViewer(e.target.files[0]);
      this.$refs.restFile.value = null;
    },

    // 选择文件回调事件
    uploadFileChange(e) {
      let maxsize = 5 * 1024 * 1024;
      if (e.target.files.length == 0) {
        return false;
      }

      let file = e.target.files[0];
      console.log(file, /\.(gif|jpg|jpeg|png|webp|GIF|JPG|PNG|WEBP)$/.test(file.name));
      if (/\.(gif|jpg|jpeg|png|webp|GIF|JPG|PNG|WEBP)$/.test(file.name)) {
        this.openImageViewer(file);
        return;
      }

      if (file.size > maxsize) {
        this.$notify.info({
          title: '消息',
          message: '上传文件不能大于5M',
        });
        return;
      }
      this.filesManager.isShow = true;
      this.$refs.restFile2.value = null;
      this.$refs.filesManager.upload(file);
    },

    // 打开图片查看器
    openImageViewer(file) {
      this.imageViewer.isShow = true;
      this.imageViewer.file = file;
    },

    // 投票发送
    confirmVote(data) {
      console.log(this.group_user_list);
      let voteUsers = [];
      for (const key in this.group_user_list) {
        if (Object.hasOwnProperty.call(this.group_user_list, key)) {
          voteUsers.push(key);
        }
      }
      this.$emit('send', { ...data, voteUsers, chatType: 'vote' });
      this.vote.isShow = false;
    },

    // 代码块编辑器确认完成回调事件
    confirmCodeBlock(data) {
      const { listId, groupId } = this.im_dialogue;
      // sendTalkCodeBlock({
      //   listId,
      //   groupId,
      //   code: data.code,
      //   lang: data.language,
      // }).then((res) => {
      //   this.codeBlock.isShow = false;
      // });
      this.$emit('send', { ...data, msgType: 2, chatType: 'code' });
      this.codeBlock.isShow = false;
    },
    // 确认上传文件
    confirmUploadFile(data) {
      if (data.chatType == 'file') {
        // 文件
        this.$emit('send', { ...data, msgType: 1, fileType: '1', chatType: data.chatType });
      } else {
        // 视频
        this.$emit('send', { ...data, msgType: 5, fileType: '3', chatType: data.chatType });
      }
    },
    // 确认上传语音文件
    confirmRecorder(data) {
      this.$emit('send', { ...data, msgType: 1, fileType: '2', chatType: 'audio' });
    },
    // 确认上传图片消息回调事件
    confirmUploadImage() {
      const { listId, groupId } = this.im_dialogue;

      let fileData = new FormData();
      fileData.append('listId', listId);
      fileData.append('groupId', groupId);
      fileData.append('file', this.imageViewer.file);
      let ref = this.$refs.imageViewer;
      // let { chat_file_type } = this.useDict('chat_file_type');
      // console.log(chat_file_type);
      chatFileApi(fileData)
        .then((res) => {
          // console.log(ref);
          this.imageViewer.isShow = false;
          this.$emit('send', { ...res.data, msgType: 1, fileType: '0', chatType: 'img' });
        })
        .finally(() => {
          ref.loading = false;
        });
    },

    // 选中表情包回调事件
    selectEmoticon(data) {
      if (data.type == 1) {
        let value = this.editorText;
        let el = this.$refs.textarea;
        let startPos = el.selectionStart;
        let endPos = el.selectionEnd;
        let newValue =
          value.substring(0, startPos) + data.value + value.substring(endPos, value.length);

        this.editorText = newValue;

        if (el.setSelectionRange) {
          setTimeout(() => {
            let index = startPos + data.value.length;
            el.setSelectionRange(index, index);
            el.focus();
          }, 0);
        }
      } else {
        const { listId, groupId } = this.im_dialogue;
        sendTalkEmoticon({
          listId,
          groupId,
          emoticonId: data.value,
        });
      }
      this.$refs.popoverEmoticon.hide();
    },
  },
};
</script>
<style scoped>
.editor-container {
  height: 160px;
  width: 100%;
  background-color: white;
}

.editor-container .toolbar {
  line-height: 35px;
  border-bottom: 1px solid #f5f0f0;
  border-top: 1px solid #f5f0f0;
}

.editor-container .toolbar li {
  list-style: none;
  float: left;
  width: 35px;
  margin-left: 3px;
  cursor: pointer;
  text-align: center;
  line-height: 35px;
  position: relative;
  color: #8d8d8d;
}

.editor-container .toolbar li .tip-title {
  display: none;
  position: absolute;
  top: 38px;
  left: 0px;
  height: 26px;
  line-height: 26px;
  background-color: rgba(31, 35, 41, 0.9);
  color: white;
  min-width: 30px;
  font-size: 10px;
  padding: 0 5px;
  border-radius: 2px;
  white-space: pre;
  text-align: center;
  user-select: none;
  z-index: 1;
}

.editor-container .toolbar li:hover .tip-title {
  display: block;
}

.editor-container .toolbar li:hover {
  background-color: #f7f5f5;
}

.editor-container .toolbar .text-tips {
  float: right;
  margin-right: 15px;
  font-size: 12px;
  color: #ccc;
}

.editor-container .toolbar .text-tips i {
  font-size: 14px;
  cursor: pointer;
  margin-left: 5px;
  color: rgb(255, 181, 111);
}

.editor-container .textarea {
  overflow: hidden;
  position: relative;
}

textarea {
  width: calc(100% - 10px);
  width: -moz-calc(100% - 10px);
  width: -webkit-calc(100% - 10px);
  height: calc(100% - 10px);
  height: -moz-calc(100% - 10px);
  height: -webkit-calc(100% - 10px);
  border: 0 none;
  outline: none;
  resize: none;
  font-size: 15px;
  overflow-y: auto;
  color: #464545;
  padding: 5px;
  position: relative;
}

textarea::-webkit-scrollbar {
  width: 4px;
  height: 1px;
}

textarea::-webkit-scrollbar-thumb {
  background: #d5cfcf;
}

textarea::-webkit-scrollbar-track {
  background: #ededed;
}

textarea::-webkit-input-placeholder {
  color: #dccdcd;
  font-size: 12px;
  font-weight: 400;
}

/* 编辑器文档说明 --- start */
.editor-books .books-title {
  font-size: 16px;
  height: 30px;
  line-height: 22px;
  margin-top: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid #cbcbcb;
  color: #726f6f;
  font-weight: 400;
  margin-left: 11px;
}

.editor-books p {
  text-indent: 10px;
  font-size: 12px;
  height: 30px;
  line-height: 30px;
  color: #7f7c7c;
}

/* 编辑器文档说明 --- end */
</style>
