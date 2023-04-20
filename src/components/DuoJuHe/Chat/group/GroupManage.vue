<template>
  <div class="lum-dialog-mask">
    <div class="lum-dialog-box">
      <el-container class="container">
        <el-header class="header no-select" height="60px">
          <p>群管理 ({{ detail.groupName }})</p>
          <p class="tools">
            <el-icon @click="$emit('close')"><Close /></el-icon>
          </p>
        </el-header>
        <el-main class="main no-padding">
          <el-container class="full-height">
            <el-aside width="100px" class="aside-border no-select">
              <div
                v-for="(menu, index) in menus"
                :key="menu.name"
                class="menu-list"
                :class="{ selectd: tabIndex == index }"
                @click="triggerTab(index)"
              >
                {{ menu.name }}
              </div>
            </el-aside>

            <!-- 群介绍模块 -->
            <el-main v-if="tabIndex == 0">
              <el-row>
                <el-col :span="14">
                  <el-form ref="groupForm" :model="form" :rules="rules">
                    <el-form-item label="群名:" prop="group_name">
                      <el-input
                        v-model="form.groupName"
                        placeholder="请输入群名称"
                        maxlength="20"
                        show-word-limit
                      />
                    </el-form-item>
                    <el-form-item label="群描述:">
                      <el-input
                        v-model="form.groupIntroduce"
                        type="textarea"
                        rows="3"
                        maxlength="200"
                        show-word-limit
                        placeholder="请输入群描述"
                      />
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" icon="Edit" :loading="loading" @click="editGroup"
                        >修改信息
                      </el-button>
                    </el-form-item>
                  </el-form>
                </el-col>
                <el-col :span="10" class="avatar-col">
                  <div class="avatar-box">
                    <img v-show="form.headPortrait" :src="form.headPortrait" />
                    <div class="upload-icon">
                      <el-icon><UploadFilled /></el-icon>
                    </div>
                    <div class="upload-mask" @click="$refs.restFile.click()">
                      <el-icon><Plus /></el-icon>
                    </div>
                  </div>
                  <p style="margin-top: 20px">设置头像</p>
                </el-col>
              </el-row>
            </el-main>

            <!-- 群成员模块 -->
            <el-main v-else-if="tabIndex == 1" class="no-padding">
              <el-container class="full-height">
                <el-header height="50px" class="notice-header">
                  <el-input
                    v-model="searchMembers"
                    style="width: 200px"
                    clearable
                    prefix-icon="Search"
                    :placeholder="`搜索群成员 ( 共${members.length}人 )`"
                  />
                  <p>
                    <el-button plain icon="Plus" @click="inviteFriendBox = true"
                      >邀请用户
                    </el-button>
                    <el-button
                      :loading="deleteLoading"
                      v-if="batchDelMember"
                      type="danger"
                      icon="Delete"
                      @click="deleteMembers"
                      >确认删除
                    </el-button>
                    <el-button v-else plain icon="Finished" @click="batchDelMember = true"
                      >批量操作
                    </el-button>
                  </p>
                </el-header>
                <el-main class="no-padding">
                  <el-scrollbar class="full-height" tag="section" :native="false">
                    <div class="members">
                      <div
                        v-for="member in filterMembers"
                        class="member no-select"
                        :class="{
                          selectd: member.isDelete && batchDelMember,
                        }"
                        :key="member.userId"
                        @click="batchDelMember && triggerDelBtn(member)"
                      >
                        <div class="item-header">
                          <div class="avatar">
                            <img
                              v-if="member.avatar"
                              style="width: 30px; height: 30px"
                              :src="base64ToImageFn(member.avatar)"
                            />
                            <el-avatar v-else :size="30" :src="base64ToImageFn(member.avatar)">
                              <img src="@/assets/images/chat/detault-avatar.jpg" />
                            </el-avatar>
                            <span class="nickname">{{ member.userName }}</span>
                            <span class="larkc-tag" v-show="member.groupUserType == 2"> 群主 </span>
                          </div>
                          <div v-show="batchDelMember && member.groupUserType != 2" class="tools">
                            <el-icon :class="{ 'is-delete': member.isDelete }"
                              ><SuccessFilled
                            /></el-icon>
                          </div>
                        </div>
                        <div class="profile">
                          签名 | {{ member.motto ? member.motto : '未设置' }}
                        </div>
                      </div>
                    </div>
                  </el-scrollbar>
                </el-main>
              </el-container>
            </el-main>

            <!-- 群公告模块 -->
            <el-main v-else-if="tabIndex == 2" class="no-padding">
              <el-container class="full-height">
                <el-header class="notice-header" height="50px" style="padding-left: 14px">
                  <span>群公告 </span>
                  <el-button plain icon="Plus" @click="showNoticeBox(0, '', '')">
                    添加公告
                  </el-button>
                </el-header>

                <el-main class="no-padding">
                  <el-scrollbar class="full-height" tag="section" :native="false">
                    <div v-if="notice.items.length == 0" class="empty-notice">
                      <!-- <SvgNotData style="width: 80px; margin-bottom: 10px" /> -->
                      <span>暂无群公告</span>
                    </div>
                    <div class="notices" v-else>
                      <div class="notice">{{ notice.items }}</div>
                    </div>
                    <!-- <div v-else>
                      <div
                        v-for="(item, index) in notice.items"
                        :key="item.noticeId"
                       
                      >
                        <div class="title">
                          <span
                            class="left-title"
                            v-text="item.noticeTitle"
                            @click="showNoticeBox(item.noticeId, item.noticeTitle, item.content)"
                          ></span>
                          <span class="right-tools no-select" @click="catNoticeDetail(index)">{{
                            item.isShow ? '收起' : '展开'
                          }}</span>
                        </div>
                        <p class="datetime">
                          <el-avatar :size="15" :src="item.headPortrait">
                            <img src="@/assets/images/chat/detault-avatar.jpg" />
                          </el-avatar>
                          <span
                            class="text nickname"
                            v-text="item.createUserName"
                            @click="$user(item.createUserId)"
                          />
                          <span class="text"> 发表于 {{ item.createTime.substr(0, 16) }} </span>
                        </p>
                        <p
                          class="content"
                          :class="{ retract: !item.isShow }"
                          v-text="item.content"
                        ></p>
                      </div>
                    </div> -->
                  </el-scrollbar>
                </el-main>
              </el-container>
            </el-main>

            <el-main v-else-if="tabIndex == 3" class="no-padding"> </el-main>
          </el-container>
        </el-main>
      </el-container>
    </div>

    <!-- 编辑公告信息 -->
    <div class="lum-dialog-mask animated fadeIn" v-show="notice.isShowform">
      <div class="notice-box">
        <h4>编辑群公告</h4>
        <el-form ref="noticeForm" :model="notice.form" :rules="notice.rules">
          <!-- <el-form-item label="标题" prop="title">
            <el-input
              v-model="notice.form.title"
              size="medium"
              placeholder="请输入标题..."
              maxlength="30"
              show-word-limit
            />
          </el-form-item> -->
          <el-form-item label="详情" prop="content">
            <el-input
              v-model="notice.form.content"
              type="textarea"
              rows="5"
              placeholder="请输入公告详情..."
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
          <el-form-item style="text-align: right">
            <el-button plain @click="notice.isShowform = false"> 取消 </el-button>
            <el-button type="primary" :loading="notice.loading" @click="onSubmitNotice"
              >提交
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <transition name="el-fade-in-linear">
      <AvatarCropper v-if="isAvatarCropper" :detail="detail" @close="closeAvatarCropper" />
    </transition>

    <transition name="el-fade-in-linear">
      <GroupLaunch
        v-if="inviteFriendBox"
        :group-id="groupId"
        @close="inviteFriendBox = false"
        @invite-success="inviteSuccess"
        @send="$emit('send', $event)"
      />
    </transition>

    <form enctype="multipart/form-data" style="display: none" ref="fileFrom">
      <input type="file" ref="restFile" accept="image/*" @change="uploadImageChange" />
    </form>
  </div>
</template>
<script>
import AvatarCropper from '@/components/DuoJuHe/Chat/layout/AvatarCropper';
import GroupLaunch from '@/components/DuoJuHe/Chat/group/GroupLaunch';
import useUserStore from '@/store/modules/user.js';
import { deepClone } from '@/utils/index.js';
import {
  getGroupUserPageApi,
  queryChatGroupNoticePageResList,
  updateGroupNoticeApi,
  deleteGroupUserApi,
  getGroupDetailApi,
  updateChatGroup,
  updateGroupNameApi, // 群名称
  updateGroupIntroduceApi, // 群简介
  updateGroupAvtarApi, // 群头像
  chatFileApi,
} from '@/api/module/chat/im/chatGroup';
export default {
  name: 'GroupManage',
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
    AvatarCropper,
    GroupLaunch,
    // SvgNotData,
  },
  data() {
    return {
      base_url: useUserStore().fileBase,
      // 当前选中菜单
      tabIndex: 0,
      menus: [
        { name: '群信息' },
        { name: '群成员' },
        { name: '群公告' },
        /*{ name: '群设置' },*/
      ],

      loading: false,
      form: {
        groupName: '',
        groupIntroduce: '',
        headPortrait: '',
      },
      rules: {
        groupName: [
          {
            required: true,
            message: '用户昵称不能为空!',
            trigger: 'blur',
          },
        ],
      },

      detail: {
        groupName: '',
        groupIntroduce: '',
        headPortrait: '',
      },

      // 群成员列表
      searchMembers: '',
      batchDelMember: false,
      members: [],

      // 群公告相关数据
      notice: {
        isShowform: false,
        loading: false,
        form: {
          id: 0,
          title: '',
          content: '',
        },
        rules: {
          title: [
            {
              required: true,
              message: '标题不能为空!',
              trigger: 'blur',
            },
          ],
          content: [
            {
              required: true,
              message: '详情不能为空',
              trigger: 'blur',
            },
          ],
        },
        items: '',
      },

      inviteFriendBox: false,
      isAvatarCropper: false,
      deleteLoading: false,
    };
  },
  setup() {},
  computed: {
    filterMembers() {
      return this.searchMembers == ''
        ? this.members
        : this.members.filter((item) => {
            return item.userName.match(this.searchMembers) != null;
          });
    },
  },
  created() {
    this.loadGroupDetail();
    this.loadMembers();
    this.loadNotices();
  },
  methods: {
    // 选择图片文件后回调方法
    uploadImageChange(e) {
      let file = e.target.files[0];
      if (!/\.(jpg|jpeg|png|GIF|JPG|PNG)$/.test(file.name)) {
        this.$notify.info({
          title: '消息',
          message: '请上传图片文件【jpg|jpeg|png|GIF|JPG|PNG】',
        });
        return;
      }
      let fileData = new FormData();
      fileData.append('file', e.target.files[0]);
      // let { chat_file_type } = this.useDict('chat_file_type');
      // console.log(chat_file_type);
      chatFileApi(fileData)
        .then((res) => {
          // console.log(ref);
          updateGroupAvtarApi({
            groupAvatar: res.data.path,
            groupId: this.groupId,
          })
            .then((item) => {
              if (item.code == 200) {
                this.$message({
                  message: '信息修改成功...',
                  type: 'success',
                });
                this.detail.groupName = this.form.groupName;
                this.detail.groupIntroduce = this.form.groupIntroduce;
                this.detail.headPortrait = this.form.headPortrait = this.base_url + res.data.path;
              }
            })
            .finally(() => {});
        })
        .finally(() => {
          this.$refs.restFile.value = null;
        });
    },
    base64ToImageFn(avatar) {
      // console.log(avatar);
      let src = `data:image/png;base64,${avatar}`;
      // console.log(src);
      return src;
    },
    // 加载群信息
    loadGroupDetail() {
      getGroupDetailApi({
        groupId: this.groupId,
      }).then((res) => {
        let result = res.data;
        this.form = this.detail = {
          groupName: result.groupName,
          groupIntroduce: result.groupIntroduce,
          headPortrait: this.base64ToImageFn(result.groupAvtar),
          groupAvatar: this.base64ToImageFn(result.groupAvtar),
        };
      });
    },

    // 加载群组成员列表
    loadMembers() {
      getGroupUserPageApi({
        groupId: this.groupId,
      }).then((res) => {
        this.members = res.data.map((item) => {
          item.isDelete = false;
          return item;
        });
        let data = deepClone(this.members);
      });
    },

    // 加载群组公告列表
    loadNotices() {
      this.notice.items = this.groupNotice;
      // queryChatGroupNoticePageResList({
      //   groupId: this.groupId,
      // }).then((res) => {
      //   this.notice.items = res.data.records.map((item) => {
      //     item.isShow = false;
      //     return item;
      //   });
      // });
    },

    // 修改群信息
    editGroup() {
      this.$refs.groupForm.validate(async (valid) => {
        if (!valid) return false;
        this.loading = true;
        await updateGroupNameApi({
          groupId: this.groupId,
          groupName: this.form.groupName,
        }).then((res) => {});
        updateGroupIntroduceApi({
          groupId: this.groupId,
          groupIntroduce: this.form.groupIntroduce,
        })
          .then((res) => {
            if (res.code == 200) {
              this.$emit('success', {
                groupName: this.form.groupName,
                groupIntroduce: this.form.groupIntroduce,
                headPortrait: this.form.headPortrait,
              });
              this.$message({
                message: '信息修改成功...',
                type: 'success',
              });
              this.detail.groupName = this.form.groupName;
              this.detail.groupIntroduce = this.form.groupIntroduce;
              this.detail.headPortrait = this.form.headPortrait;
            }
          })
          .finally(() => {
            this.loading = false;
          });
      });
    },

    // 左侧菜单栏切换事件
    triggerTab(i) {
      this.tabIndex = i;
    },

    // 关闭头像裁剪弹出层
    closeAvatarCropper(type, avatar = '') {
      this.isAvatarCropper = false;
      if (type == 1 && avatar != '') {
        // this.form.headPortrait = avatar;
        this.loadGroupDetail();
      }
    },

    // 显示编辑公告窗口
    showNoticeBox(id = 0, title = '', content = '') {
      this.notice.isShowform = true;
      this.notice.form.id = id;
      this.notice.form.title = title;
      this.notice.form.content = content;
    },

    // 编辑公告提交事件
    onSubmitNotice() {
      this.$refs.noticeForm.validate((valid) => {
        if (!valid) return false;
        this.notice.loading = true;
        //添加
        updateGroupNoticeApi({
          groupId: this.groupId,
          // noticeTitle: this.notice.form.title,
          groupNotice: this.notice.form.content,
        })
          .then((res) => {
            if (res && res.code === 200) {
              this.notice.isShowform = false;

              this.$emit('update:groupNotice', this.notice.form.content);
              this.notice.items = this.notice.form.content;
              // this.loadNotices();
              this.$notify({
                title: '消息提示',
                message: '群公告添加成功...',
                type: 'success',
              });
            }
          })
          .catch(() => {
            this.$notify({
              title: '消息提示',
              message: '网络异常，请稍后再试...',
              position: 'bottom-right',
              type: 'warning',
            });
          })
          .finally(() => {
            this.notice.loading = false;
          });
      });
    },

    // 展开/收起群公告详情
    catNoticeDetail(index) {
      this.notice.items[index].isShow = !this.notice.items[index].isShow;
    },

    // 查看群成员信息事件
    catUserDetail(item) {
      this.$user(item.userId);
    },

    // 选中删除成员事件
    triggerDelBtn(member) {
      if (member.groupUserType == 2) return;
      let i = this.members.findIndex((item) => {
        return item.userId === member.userId;
      });

      this.members[i].isDelete = !this.members[i].isDelete;
    },

    // 批量删除群成员
    deleteMembers() {
      let groupUserIds = [],
        names = [],
        userName = '';
      this.members.forEach((item) => {
        if (item.isDelete) {
          groupUserIds.push(item.groupUserId);
          names.push(item.userName);
        }
        if (item.userId == useUserStore().userId) {
          userName = item.userName;
        }
      });
      if (groupUserIds.length == 0) {
        this.batchDelMember = false;
        return;
      }

      if (groupUserIds.length > 10) {
        this.batchDelMember = false;
        this.$modal.msgError('一次最多只能删除移除10个用户!');
        return false;
      }
      console.log(groupUserIds);
      this.$confirm(`您确定要将【 ${names.join('、')}】移出群聊?`, '温馨提示', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        dangerouslyUseHTMLString: true,
      })
        .then(() => {
          this.deleteLoading = true;
          deleteGroupUserApi({
            groupId: this.groupId,
            groupUserIds: groupUserIds.join(','),
          })
            .then((res) => {
              if (res && res.code === 200) {
                this.loadMembers();
                this.$notify({
                  title: '删除成功',
                  message: `已成功将群成员移除群组...`,
                  type: 'success',
                });
                this.batchDelMember = false;
                // this.$emit('send', {
                //   inviteType: '2',
                //   msgType: '4',
                //   msgContent: `${userName}将【${names.join('、')}】踢出群聊`,
                // });
                this.$emit('deleteUser');
              }
            })
            .finally(() => {
              this.deleteLoading = false;
            });
        })
        .catch(() => {
          this.members.map((item) => {
            return (item.isDelete = false);
          });
          this.batchDelMember = false;
        });
    },

    // 好友邀请成功回调方法
    inviteSuccess() {
      this.inviteFriendBox = false;
      this.loadGroupDetail();
      this.loadMembers();
      this.$emit('deleteUser');
      this.$notify({
        title: '邀请成功',
        message: `用户已成功加入群组...`,
        type: 'success',
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.lum-dialog-box {
  width: 80%;
  height: 500px;
  max-width: 800px;
}

.aside-border {
  display: flex;
  flex-direction: column;
  padding: 8px;
  border-right: 1px solid #f5f5f5;

  .menu-list {
    height: 25px;
    line-height: 25px;
    margin: 8px 2px;
    font-weight: 400;
    font-size: 13px;
    background-color: white;
    cursor: pointer;
    border-left: 3px solid white;
    padding-left: 10px;

    &.selectd {
      color: #2196f3;
      border-color: #2196f3;
    }
  }
}

.avatar-col {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}

.avatar-box {
  width: 100px;
  height: 100px;
  box-shadow: 0px 0px 7px 1px #e8e4e4;
  border-radius: 50%;
  position: relative;
  cursor: pointer;
  transition: ease 0.5s;

  .upload-icon {
    position: absolute;
    right: 0;
    top: 0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: rgba(184, 184, 197, 0.2);
    display: flex;
    justify-content: center;
    align-items: center;

    i {
      font-size: 30px;
      color: #1bb0f3;
    }
  }

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    z-index: 0;
  }

  .upload-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.2);
    z-index: 3;
    display: none;
    justify-content: center;
    align-items: center;

    i {
      font-size: 30px;
      color: white;
    }
  }

  &:hover .upload-mask {
    display: flex;
  }
}

/* 群成员相关 start */
.members {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 5px 20px;
  justify-content: space-between;

  .member {
    width: 48%;
    height: 70px;
    border-radius: 3px;
    cursor: pointer;
    border: 1px dashed #e2dcdc;
    margin: 5px 0;
    padding: 3px;
    transition: ease 0.5s;

    .larkc-tag {
      color: #3370ff;
      background-color: #e1eaff;
    }

    .item-header {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;

      .avatar {
        flex: 1 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 3px 5px;

        .nickname {
          font-size: 13px;
          margin: 0 5px 0 15px;
        }
      }

      .tools {
        flex-basis: 50px;
        overflow: hidden;
        text-align: right;
        padding-right: 5px;

        i {
          color: #cccccc;
        }

        .is-delete {
          color: #03a9f4;
        }
      }
    }

    .profile {
      color: #8f8a8a;
      font-size: 12px;
      padding: 3px 5px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin: 3px 0;
    }

    &:hover,
    &.selectd {
      border-color: #2196f3;
    }
  }
}

/* 群成员相关 end */

/* 公告相关 start */
.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-notice {
  width: 100%;
  height: 100%;
  min-height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  span {
    color: #cccccc;
    font-size: 13px;
  }
}

.notices {
  .notice {
    cursor: pointer;
    min-height: 76px;
    overflow: hidden;
    border-bottom: 1px dashed #e2dcdc;
    margin-bottom: 15px;
    margin-right: 15px;
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
        font-size: 14px;
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
      font-size: 12px;
      line-height: 28px;
      font-weight: 500;
      color: #7d7a7a;
    }
  }
}

.notice-box {
  position: relative;
  padding: 28px;
  background: #fff;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  overflow: hidden;
  box-sizing: border-box;
  height: 415px;
  width: 420px;

  h4 {
    margin-bottom: 20px;
    font-weight: 400;
  }
}

/* 公告相关 end */

:deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}
</style>
