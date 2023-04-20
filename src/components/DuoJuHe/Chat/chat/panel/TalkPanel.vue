<template>
  <div>
    <el-container class="ov-hidden full-height">
      <PanelHeader
        ref="panelHeader"
        :data="params"
        :online="isOnline"
        :keyboard="inputEvent"
        @event="handleHeaderEvent"
      />

      <!-- 主体信息 -->
      <el-main class="main-box no-padding" style="height: 70%">
        <div
          id="duoJuHeChatPanel"
          class="talks-container lum-scrollbar"
          @scroll="talkPanelScroll($event)"
        >
          <!-- 数据加载状态栏 -->
          <div class="loading-toolbar">
            <span v-if="loadRecord.status == 0" class="color-blue">
              <i class="el-icon-loading" /> 正在加载数据中...
            </span>
            <span
              v-else-if="loadRecord.status == 1"
              class="pointer color-blue"
              @click="loadChatRecords"
            >
              <i class="el-icon-bottom" /> 查看更多消息...
            </span>
            <span v-else> 没有更多消息了... </span>
          </div>

          <!-- 消息主体 -->
          <template v-for="(item, idx) in records">
            <div v-if="item.msgType != '-1'" :key="item.groupMsgId">
              <!-- 群消息 -->
              <div v-if="item.msgType == 4" class="message-box">
                <invite-message @cat="catFriendDetail" :item="item" />
              </div>

              <!-- 撤回消息 -->
              <div v-else-if="item.msgType && item.msgType == -2" class="message-box">
                <revoke-message
                  :item="item"
                  :name="group_user_list[item.sendUserId]?.userName || ''"
                />
              </div>

              <!-- <div v-else-if="item.msgType == 0" class="message-box">
                <system-text-message :content="item.msgContent" />
              </div> -->

              <!-- 其它对话消息 -->
              <div
                v-else
                class="message-box record-box"
                :class="{
                  'direction-rt': item.float == 'right',
                  'checkbox-border': multiSelect.isOpen === true,
                }"
              >
                <aside
                  v-if="item.msgType === 1 || item.msgType === 2 || item.msgType === 4"
                  v-show="multiSelect.isOpen"
                  class="checkbox-column"
                >
                  <i
                    class="el-icon-success"
                    :class="{ selected: verifyMultiSelect(item.groupMsgId) }"
                    @click="triggerMultiSelect(item.groupMsgId)"
                  />
                </aside>
                <aside class="avatar-column">
                  <el-avatar
                    v-if="
                      Object.keys(group_user_list).length > 0 &&
                      group_user_list[item.sendUserId]?.avatar
                    "
                    class="pointer"
                    :size="30"
                    :src="group_user_list[item.sendUserId]?.avatar || ''"
                    :alt="group_user_list[item.sendUserId]?.userName || ''"
                    :title="group_user_list[item.sendUserId]?.userName || ''"
                    @click.native="catFriendDetail(item.sendUserId)"
                  />
                  <el-avatar v-else :src="defaultAvatar" />
                </aside>
                <main class="main-column">
                  <div class="talk-title">
                    <span
                      v-show="item.msgType == 0 || (item.msgType == 1 && item.float == 'right')"
                      class="time"
                    >
                      <i class="el-icon-time" />
                      {{ parseTime(item.sendTime, '{m}月{d}日 {h}:{i}') }}
                    </span>
                  </div>

                  <div class="talk-content">
                    <span v-show="item.msgType == 1 && item.float == 'left'" class="nickname">
                      {{
                        Object.keys(group_user_list).length > 0
                          ? group_user_list[item.sendUserId]?.userName
                          : ''
                      }}
                      |
                      {{ parseTime(item.sendTime, '{y}-{m}-{d} {h}:{i}') }}
                    </span>

                    <!-- 文本消息 -->
                    <text-message
                      v-if="item.msgType == 0"
                      :content="item.msgContent"
                      :groupMsgId="item.groupMsgId"
                      :float="item.float"
                      :full-width="false"
                      :arrow="true"
                      @contextmenu.native="onCopy(idx, item, $event)"
                    />
                    <!-- 删除消息 -->
                    <!-- <text-message
                      v-else-if="item.msgType == '-1'"
                      :content="item.msgContent"
                      :groupMsgId="item.groupMsgId"
                      :float="item.float"
                      :full-width="false"
                      :arrow="true"
                    /> -->

                    <!-- 加入视频 -->
                    <div
                      v-else-if="item.msgType == '-3'"
                      class="btn-open-video"
                      @click="MeEditor_fn"
                    >
                      {{ item.msgContent }}
                    </div>

                    <!-- 图片消息 -->
                    <image-message
                      v-else-if="item.msgType == 1 && item.fileType == 0"
                      :src="item.filePath || ''"
                      @contextmenu.native="onCopy(idx, item, $event)"
                    />

                    <!-- 文件消息 -->
                    <file-message
                      v-else-if="item.msgType == 1 && item.fileType == 1"
                      :file="item"
                      :recordId="item.groupMsgId"
                      @contextmenu.native="onCopy(idx, item, $event)"
                    />

                    <!-- 音频文件预留 -->
                    <audio-message
                      v-else-if="item.msgType == 1 && item.fileType == 2"
                      :src="item.filePath"
                      :file="item"
                      @contextmenu.native="onCopy(idx, item, $event)"
                    />

                    <!-- 视频文件预留 -->
                    <video-message
                      v-else-if="item.msgType == 5 && item.fileType == 3"
                      :src="item.filePath"
                      @contextmenu.native="onCopy(idx, item, $event)"
                    />

                    <!-- 会话记录消息 -->
                    <!-- <forward-message
                      v-else-if="item.msgType == 3"
                      :forward="item.forward"
                      :recordId="item.groupMsgId"
                      @contextmenu.native="onCopy(idx, item, $event)"
                    /> -->

                    <!-- 代码块消息 -->
                    <code-message
                      v-else-if="item.msgType == 2"
                      :code="item.groupMsgCode.codeContent"
                      :lang="item.groupMsgCode.codeLang"
                      :maxwidth="true"
                      @contextmenu.native="onCopy(idx, item, $event)"
                    />

                    <!-- 投票消息 -->
                    <vote-message
                      v-else-if="item.msgType == 3"
                      :recordId="item.groupMsgVote.groupMsgVoteId"
                      :vote="item"
                    />

                    <!-- 登录消息 -->
                    <login-message v-else-if="item.msgType == 8" :detail="item.login" />

                    <!-- 未知消息 -->
                    <div class="unknown-msg" v-else>未知消息类型[{{ item.msgType }}]</div>

                    <!-- 消息引用(预留) -->
                    <!-- <reply-message /> -->
                  </div>
                </main>
              </div>

              <!-- 消息时间 -->
              <div
                v-show="compareTime(idx, item.sendTime)"
                class="datetime no-select"
                v-text="sendTime(item.sendTime)"
              ></div>
            </div>
          </template>
        </div>

        <!-- 置底按钮 -->
        <transition name="el-fade-in-linear">
          <div v-show="tipsBoard" class="tips-board pointer" @click="talkPanelScrollBottom">
            <i class="el-icon-arrow-down" />
            <span>回到底部</span>
          </div>
        </transition>

        <!-- 新消息气泡 -->
        <div
          v-show="tipsBoard && unreadMessage.num"
          class="talk-bubble pointer no-select"
          @click="talkPanelScrollBottom"
        >
          <i class="el-icon-chat-dot-round" />
          <span>新消息({{ unreadMessage.num }}条)</span>
          <span>
            &nbsp;#{{ unreadMessage.realName }}#
            {{ unreadMessage.msgContent }}
          </span>
        </div>
      </el-main>

      <!-- 页脚信息 -->
      <el-footer class="footer-box" style="height: 30%">
        <template v-if="multiSelect.isOpen === false">
          <MeEditor
            ref="MeEditor"
            :chatMessage="chatMessage"
            :params="params"
            :group_user_list="group_user_list"
            @send="submitSendMessage"
            @keyboard-event="onKeyboardEvent"
          />
        </template>
        <template v-else>
          <PanelToolbar v-model="multiSelect.items.length" @event="handleMultiMode" />
        </template>
      </el-footer>

      <!-- 群设置侧边栏 -->
      <div class="sidebar-box" :class="{ show: group.panel }" v-show="group.panel">
        <GroupPanel
          v-if="params.groupId"
          :groupId="params.groupId"
          @close="hideChatGroup"
          @send-group="hideChatGroup"
          @send="submitSendMessage"
          @quit-group="quitGroupSuccess"
          @disturb-change="disturbChange"
          @group-info="syncGroupInfo"
          @no-message="chatMessage = $event.status"
        />
      </div>
    </el-container>

    <!-- 消息管理器 -->
    <transition name="el-fade-in-linear">
      <TalkSearchRecord
        v-if="findChatRecord"
        :group_user_list="group_user_list"
        :params="params"
        @close="findChatRecord = false"
      />
    </transition>

    <!-- 群公告组件 -->
    <transition name="el-fade-in-linear">
      <GroupNotice
        v-if="group.notice"
        :groupNotice="group.notice"
        :groupId="params.groupId"
        @close="group.notice = false"
      />
    </transition>
  </div>
</template>
<script>
import { nextTick } from 'vue';
import { mapState } from 'pinia';

import talk from '@/store/modules/talk';
import notify from '@/store/modules/notify';
import dialogue from '@/store/modules/dialogue';
import useUserStore from '@/store/modules/user';
import emoticon from '@/store/modules/emoticon';
import settings from '@/store/modules/settings';

import TalkSearchRecord from '@/components/DuoJuHe/Chat/chat/TalkSearchRecord';
import GroupPanel from '@/components/DuoJuHe/Chat/group/GroupPanel';
import GroupNotice from '@/components/DuoJuHe/Chat/group/GroupNotice';
import MeEditor from '@/components/DuoJuHe/Chat/editor/MeEditor';
import PanelHeader from './PanelHeader';
import PanelToolbar from './PanelToolbar';
import SocketInstance from '@/utils/socket-instance';
import { formateTime, parseTime, copyTextToClipboard } from '@/utils/functions';
import {
  getGroupMsgPageApi,
  forwardTalkRecord,
  batchDeleteRecordByRecordIdList,
  revokeRecordByRecordId,
  deleteRecordByRecordId,
} from '@/api/module/chat/im/chatTalkRecord';
const im_dialogue_data = storeToRefs(dialogue());

import { Picture, Finished, Delete, Flag, Copy } from './svg';

export default {
  name: 'TalkEditorPanel',
  components: {
    MeEditor,
    GroupPanel,
    TalkSearchRecord,
    GroupNotice,
    PanelToolbar,
    PanelHeader,
  },
  props: {
    // 对话相关参数
    params: {
      type: Object,
      default: function () {
        return {
          // 会话id）
          listId: 0,
          // 群聊ID）
          groupId: 0,
          //名称
          realName: '',
        };
      },
    },

    // 用户是否在线
    isOnline: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      // 记录加载相关参数
      loadRecord: {
        status: 0,
        minRecord: 0,
      },

      //每次加载数量
      loadRows: 10,
      //分页数
      loadPage: 1,
      //总数量
      loadTotal: 0,
      // 多选相关操作
      multiSelect: {
        isOpen: false,
        items: [],
        mode: 0,
      },

      // 群组Box
      group: {
        panel: false,
        notice: false,
      },

      // 键盘输入事件
      keyboardEvent: {
        isShow: false,
        time: 0,
      },

      // 聊天记录管理器数据
      findChatRecord: false,

      // 置底按钮是否显示
      tipsBoard: false,

      group_user_list: {},

      chatMessage: false, // 是否禁言
    };
  },
  setup() {
    let { getRecords: records } = im_dialogue_data;
    // console.log(records);
    return {
      records,
      // indexName,
    };
  },
  computed: {
    ...mapState(talk, ['unreadMessage']),
    ...mapState(notify, ['inputEvent']),
    ...mapState(dialogue, ['indexName']),
    ...mapState(settings, ['keyboardEventNotify']),
    ...mapState(useUserStore, {
      uid: 'userId',
      defaultAvatar: 'defaultAvatar',
    }),
  },
  watch: {
    // 监听面板传递参数
    params: {
      handler(val) {
        this.group_user_list = {};
        // console.log('deep', this.group_user_list);
        // console.log('对话', val);
        this.loadRecord.minRecord = 0;
        this.loadTotal = 0;
        this.loadPage = 1;
        this.tipsBoard = false;
        this.multiSelect = {
          isOpen: false,
          items: [],
          mode: 0,
        };
        this.loadChatRecords();
      },
      deep: true,
    },
  },
  mounted() {
    // console.log(this.params);
    this.loadChatRecords();
  },
  methods: {
    parseTime,
    sendTime: formateTime,

    // 处理 Header 组件事件
    handleHeaderEvent(event_name) {
      switch (event_name) {
        case 'history':
          this.findChatRecord = true;
          break;
        case 'notice':
          this.group.notice = true;
          break;
        case 'setting':
          this.group.panel = true;
          break;
      }
    },
    MeEditor_fn() {
      console.log(this.$refs.MeEditor);
      this.$refs.MeEditor.open_video_fn(this.group_user_list[this.uid]?.userName);
    },
    // 回车键发送消息回调事件
    submitSendMessage(content) {
      let data = {
        operate: 'event_talk',
        msgType: 0,
        senderId: this.uid,
        groupId: this.params.groupId,
        listId: this.params.listId,
        msgContent: content,
      };

      if (
        content.chatType == 'img' ||
        content.chatType == 'file' ||
        content.chatType == 'video' ||
        content.chatType == 'audio'
      ) {
        // 图片   文件
        data.msgContent = content.name;
        data.filePath = content.path;
        data.msgType = content.msgType || 0;
        data.fileType = content.fileType || '';
      } else if (content.chatType == 'code' || content.chatType == 'vote') {
        // 代码 投票
        data = Object.assign({}, data, content);
      } else {
        data = Object.assign({}, data, content);
      }

      if (content.events == 'event_system_message') {
        // 系统通知事件
        SocketInstance.emit('event_system_message', data);
      } else {
        SocketInstance.emit('event_talk', data);
      }

      talk().UPDATE_TALK_ITEM({
        indexName: this.indexName,
        draftText: '',
      });
      return new Promise((resolve, reject) => {
        resolve();
      });
    },

    // 推送编辑事件消息
    onKeyboardEvent(text) {
      talk().UPDATE_TALK_ITEM({
        indexName: this.indexName,
        draftText: text,
      });

      // 判断当前对话是否属于私聊信息
      if (this.params.listId == 2 || !this.isOnline) return;

      // 判断是否推送键盘输入事件消息
      if (!this.keyboardEventNotify) {
        return false;
      }

      let time = new Date().getTime();
      // 判断在两秒内是否已推送事件
      if (this.keyboardEvent.time != 0 && time - this.keyboardEvent.time < 2000) return;

      this.keyboardEvent.time = time;

      // 调用父类Websocket组件发送消息
      SocketInstance.emit('event_keyboard', {
        senderId: this.uid,
        groupId: this.params.groupId,
      });
    },

    // 加载用户聊天详情信息
    loadChatRecords() {
      const userId = this.uid;
      let lastRecordId = this.loadRecord.minRecord;
      const data = {
        lastRecordId: lastRecordId === 0 ? '' : lastRecordId,
        groupId: this.params.groupId,
        listId: this.params.listId,
        pageSize: this.loadRows,
        pageNum: this.loadPage,
      };

      this.loadRecord.status = 0;
      let el = document.getElementById('duoJuHeChatPanel');
      let scrollHeight = el.scrollHeight;
      // console.log(data);
      getGroupMsgPageApi(data)
        .then((res) => {
          // 防止点击切换过快消息返回延迟，导致信息错误
          if (data.listId != this.params.listId) {
            return;
          }

          const records = res.rows.map((item) => {
            item.float = 'center';
            if (item.sendUserId) {
              item.float = item.sendUserId == userId ? 'right' : 'left';
            }
            this.loadRecord.minRecord = item.groupMsgId;
            return item;
          });

          // 判断是否是初次加载
          if (data.lastRecordId == 0) {
            this.loadPage = 1;
            dialogue().SET_DIALOGUE([]);
          }
          // console.log(records, this.loadTotal);
          dialogue().UNSHIFT_DIALOGUE(records.reverse());

          //this.loadRecord.status = records.length >= this.loadRows ? 1 : 2
          this.loadTotal = records.length + this.loadTotal;
          this.loadRecord.status = res.total > this.loadTotal ? 1 : 2;
          // console.log(this.loadRecord);
          if (this.loadRecord.status === 1) {
            this.loadPage++;
          }
          //this.loadRecord.minRecord = res.data.recordId

          nextTick(() => {
            if (data.lastRecordId == 0) {
              el.scrollTop = el.scrollHeight;
            } else {
              el.scrollTop = el.scrollHeight - scrollHeight;
            }
          });
        })
        .catch(() => {
          this.loadRecord.status = 1;
        });
    },

    // 多选处理方式
    handleMultiMode(value) {
      if (value == 'close') {
        this.closeMultiSelect();
        return false;
      }

      if (this.multiSelect.items.length <= 1) {
        this.$modal.msgError('至少选择两条记录!');
        return false;
      }

      if (this.multiSelect.items.length > 10) {
        this.$modal.msgError('一次最多只能转发10条记录!');
        return false;
      }

      if (value == 'forward' || value == 'merge_forward') {
        this.multiSelect.mode = value == 'forward' ? 1 : 2;
        if (this.verifyMultiSelectType(3)) {
          this.$notify({
            title: '消息转发',
            message: '会话记录不支持合并转发',
          });
          return false;
        }

        this.$contacts({
          confirm: this.confirmSelectContacts,
        });
      } else if (value == 'delete') {
        this.multiSelect.mode = 3;
        // 批量删除
        let ids = this.multiSelect.items;
        batchDeleteRecordByRecordIdList({
          listId: this.params.listId,
          listId: this.params.listId,
          recordIdList: ids,
        }).then((res) => {
          this.delRecords(ids).closeMultiSelect();
        });
      }
    },

    // 确认消息转发联系人事件
    confirmSelectContacts(data) {
      let user_ids = [];
      let group_ids = [];
      data.forEach((item) => {
        if (item.listId == 1) {
          user_ids.push(item.listId);
        } else {
          group_ids.push(item.listId);
        }
      });
      if (user_ids.length === 0 && group_ids.length === 0) {
        this.$modal.msgError('请选择转发联系人!');
        return false;
      }

      forwardTalkRecord({
        forwardMode: this.multiSelect.mode,
        listId: this.params.listId,
        listId: this.params.listId,
        recordIdList: this.multiSelect.items,
        receiveUserIdList: user_ids,
        receiveGroupIdList: group_ids,
      }).then((res) => {
        if (res && res.code === 200) {
          this.closeMultiSelect();
          this.$notify({
            title: '消息转发',
            message: '消息转发成功...',
            type: 'success',
          });
        }
      });
    },

    // 处理消息时间是否显示
    compareTime(index, datetime) {
      // console.log(datetime);
      if (datetime == undefined) {
        return false;
      }

      if (this.records[index].msgType == -2) {
        return false;
      }
      datetime = datetime.replace(/-/g, '/');
      let time = Math.floor(Date.parse(datetime) / 1000);
      let currTime = Math.floor(new Date().getTime() / 1000);

      // 当前时间5分钟内时间不显示
      if (currTime - time < 300) return false;

      // 判断是否是最后一条消息,最后一条消息默认显示时间
      if (index == this.records.length - 1) {
        return true;
      }

      let nextDate = this.records[index + 1].sendTime.replace(/-/g, '/');

      return !(
        parseTime(new Date(datetime), '{y}-{m}-{d} {h}:{i}') ==
        parseTime(new Date(nextDate), '{y}-{m}-{d} {h}:{i}')
      );
    },

    // 查看好友用户信息
    catFriendDetail(value) {
      // this.$user(value);
    },

    // 撤回消息
    async revokeRecords(index, item) {
      await this.submitSendMessage({
        groupId: item.groupId,
        msgContent: `${this.group_user_list[item.sendUserId]?.userName}撤回了一条消息`,
        groupMsgId: item.groupMsgId,
        msgType: '-2',
        operate: 'event_revoke_talk',
      }).then((res) => {
        dialogue().UPDATE_DIALOGUE({ groupMsgId: item.groupMsgId, msgType: -2 });
      });
    },

    // 删除消息
    async removeRecords(index, item) {
      await this.submitSendMessage({
        groupId: item.groupId,
        msgContent: `${this.group_user_list[item.sendUserId]?.userName}删除了一条消息`,
        groupMsgId: item.groupMsgId,
        msgType: '-1',
        operate: 'event_delete_talk',
      }).then((res) => {
        dialogue().DELETE_DIALOGUE(index);
      });
    },

    // 单条转发消息
    forwardRecords(idx, item) {
      this.multiSelect.mode = 1;
      this.multiSelect.items.push(item.groupMsgId);
      this.$contacts({
        confirm: this.confirmSelectContacts,
      });
    },

    // 从列表中删除记录
    delRecords(arr) {
      dialogue().BATCH_DELETE_DIALOGUE(arr);
      return this;
    },

    // 开启多选模式
    openMultiSelect() {
      this.multiSelect.isOpen = true;
    },

    // 关闭多选模式
    closeMultiSelect() {
      this.multiSelect.isOpen = false;
      this.multiSelect.items = [];
    },

    // 判断记录是否选中
    verifyMultiSelect(recordsId) {
      return this.multiSelect.items.indexOf(recordsId) >= 0;
    },

    // 触发多选事件
    triggerMultiSelect(recordsId) {
      let i = this.multiSelect.items.indexOf(recordsId);
      if (i >= 0) {
        this.multiSelect.items.splice(i, 1);
      } else {
        if (this.multiSelect.items.length > 10) {
          this.$notify({
            title: '温馨提示',
            message: '批量操作最大支持10条数据...',
          });
          return false;
        }
        this.multiSelect.items.push(recordsId);
      }
    },

    // 验证是否存在选择的指定类型的消息
    verifyMultiSelectType(type) {
      return this.records.some((item) => {
        return this.verifyMultiSelect(item.groupMsgId) && item.msgType == type;
      });
    },

    // 消息点击右键触发自定义菜单
    onCopy(idx, item, event) {
      let menus = [];
      let content = '';
      if (document.getElementById('copy_class_' + item.groupMsgId)) {
        content = document.getElementById('copy_class_' + item.groupMsgId).innerText;
      }

      if (content) {
        menus.push({
          label: '复制',
          icon: Copy,
          click: () => {
            copyTextToClipboard(content);
          },
        });
      }

      if (item.sendUserId == this.uid) {
        let time = new Date().getTime() - Date.parse(item.sendTime.replace(/-/g, '/'));
        if (Math.floor(time / 1000 / 60) < 2) {
          menus.push({
            label: '撤回',
            icon: Flag,
            click: () => {
              this.revokeRecords(idx, item);
            },
          });
        }
      }

      menus.push({
        label: '删除',
        icon: Delete,
        click: () => {
          this.removeRecords(idx, item);
        },
      });

      let msgType = item.msgType;
      if (msgType === 1 || msgType === 2 || msgType === 4) {
        // menus.push({
        //   label: '转发',
        //   icon: 'el-icon-s-promotion',
        //   customClass: 'cus-contextmenu-item',
        //   onClick: () => {
        //     this.forwardRecords(idx, item);
        //   },
        // });

        menus.push({
          label: '多选',
          icon: Finished,
          click: () => {
            this.openMultiSelect();
          },
        });
      }

      /*    menus.push({
        label: '引用',
        icon: 'el-icon-connection',
        customClass: 'cus-contextmenu-item',
        onClick: () => {
          this.$modal.msgError("功能开发中!")
        },
      })*/

      // 判断是否是图片消息
      if (item.msgType == 2 && item.fileType == 1) {
        menus.push({
          label: '收藏',
          icon: Picture,
          click: () => {
            emoticon().SAVE_USER_EMOTICON({ groupMsgId: item.groupMsgId });
          },
        });
      }

      let items = shallowRef({
        menus: menus,
        event: event,
        zIndex: 3,
      });
      this.contextmenu(event, items.value);
      this.closeMultiSelect();
      event.preventDefault();
    },

    hideChatGroup() {
      this.group.panel = false;
    },

    // 修改群聊免打扰状态
    disturbChange(detail) {
      talk().UPDATE_TALK_ITEM({
        indexName: `${detail.groupId}_${detail.groupId}`,
        isDisturb: parseInt(detail.isDisturb),
      });
    },

    // 退出群聊回调事件
    quitGroupSuccess(data = '') {
      if (data != '') {
        this.submitSendMessage(data);
      }
      this.$emit('close-talk');
    },

    // 同步群信息
    syncGroupInfo(groupInfo) {
      this.$refs.panelHeader.setGroupNum(groupInfo.membersNum);
      for (let index = 0; index < groupInfo.members.length; index++) {
        let data = groupInfo.members[index];
        // console.log(data);
        this.group_user_list[data.userId] = data;
      }
    },

    // 对话面板滚动事件
    talkPanelScroll(e) {
      // console.log('talkPanelScroll', e.target.scrollTop, e.target.clientHeight);
      if (e.target.scrollTop == 0 && this.loadRecord.status == 1) {
        this.loadChatRecords();
        return;
      }

      const height = e.target.scrollTop + e.target.clientHeight;
      this.tipsBoard = height < e.target.scrollHeight;
      if (this.tipsBoard == false && this.unreadMessage.num > 0) {
        talk().CLEAR_TALK_UNREAD_MESSAGE();
      }
    },

    // 聊天版本滚动到底部
    talkPanelScrollBottom() {
      let el = document.getElementById('duoJuHeChatPanel');
      el.scrollTop = el.scrollHeight;
    },
  },
};
</script>
<style lang="scss" scoped>
.main-box {
  position: relative;
}

/* 面板页脚 */
.footer-box {
  height: 160px !important;
  padding: 0;
  border-top: 1px solid #f5f5f5;
}

/* 侧边栏css */
.sidebar-box {
  position: absolute;
  width: 365px;
  height: 100%;
  top: 0px;
  right: -350px;
  z-index: 1;
  background: white;
  transition: all 0.5s ease-in-out;
  -moz-transition: all 0.5s ease-in-out;
  -webkit-transition: all 0.5s ease-in-out;
  -o-transition: all 0.5s ease-in-out;

  &.show {
    right: 0;
    box-shadow: 0 0 14px #e2e1e1;
  }
}

.tips-board {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 0;
  right: 0;
  margin: 0 auto;
  bottom: 20px;
  height: 30px;
  width: 100px;
  border-radius: 20px;
  font-size: 12px;
  background-color: #fff;
  box-shadow: 0 2.5px 10px 0 rgba(31, 35, 41, 0.1);
  color: #1f2329;

  span {
    margin-left: 5px;
    margin-top: -2px;
  }

  .svg {
    width: 10px;
    height: 10px;
    color: black;
  }
}

.talk-bubble {
  position: absolute;
  left: 0px;
  bottom: 20px;
  max-width: 300px;
  height: 40px;
  line-height: 40px;
  border-radius: 0 20px 20px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: white;
  padding: 0 15px 0 30px;
  font-size: 13px;
  background: #409eff;

  i {
    font-size: 22px;
    position: absolute;
    left: 5px;
    top: 9px;
  }
}

.talks-container {
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  padding: 10px 15px 30px;
  overflow-y: auto;

  .message-box {
    width: 100%;
    min-height: 30px;
    margin-bottom: 5px;
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

  .datetime {
    height: 30px;
    line-height: 30px;
    color: #ccc9c9;
    font-size: 12px;
    text-align: center;
    margin: 5px 0;
  }

  .record-box {
    display: flex;
    flex-direction: row;
    transition: 0.5s ease;

    .checkbox-column {
      display: flex;
      justify-content: center;
      flex-basis: 40px;
      flex-shrink: 0;
      order: 1;
      user-select: none;
      padding-top: 25px;

      i {
        color: #ccc;
        cursor: pointer;
        font-size: 22px;
        &.selected {
          color: #409eff !important;
        }
      }
    }

    .avatar-column {
      width: 40px;
      flex-basis: 40px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      order: 2;
      user-select: none;
      padding-top: 22px;
      flex-direction: column;
    }

    .main-column {
      flex: 1 auto;
      order: 3;
      position: relative;
      box-sizing: border-box;
      padding: 5px;
      overflow: hidden;

      .talk-title {
        display: flex;
        align-items: center;
        height: 15px;
        margin-bottom: 2px;
        font-size: 10px;
        user-select: none;
        color: #a7a0a0;
        opacity: 0;
        transition: 0.5s ease;

        &.show {
          opacity: 1 !important;
        }

        span {
          transform: scale(0.9);
        }
      }

      .talk-content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        box-sizing: border-box;
        width: 100%;

        .nickname {
          font-size: 12px;
          color: #a7a0a0;
          margin: -4px 0 4px -8px;
          transform: scale(0.9);
        }
      }

      &:hover {
        .talk-title {
          opacity: 1;
        }
      }
    }

    &.direction-rt {
      .avatar-column {
        order: 3;
      }

      .main-column {
        order: 2;

        .talk-title {
          justify-content: flex-end;
        }

        .talk-content {
          align-items: flex-end;
        }
      }
    }

    &.checkbox-border {
      border: 1px dashed #c4c4ec;
      &:hover {
        border-color: #409eff;
      }
    }
  }
}
aside {
  background-color: transparent;
}
.btn-open-video {
  padding: 10px;
  border-radius: 4px;
  font-size: 13px;
  background-color: #1ebafc;
  color: #fff;
  cursor: pointer;
}
</style>
