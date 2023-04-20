<template>
  <div class="lum-dialog-mask animated fadeIn">
    <el-container class="lum-dialog-box">
      <el-header class="header no-select" height="60px">
        <p>发起投票</p>
        <p class="tools">
          <el-icon @click="$emit('close')"><Close /></el-icon>
        </p>
      </el-header>
      <el-main class="main vote-from">
        <div class="vote-title">投票方式</div>
        <div>
          <el-radio-group :model-value="mode" @change="model_value">
            <el-radio v-for="item in chat_answer_module" :label="Number(item.value) + 1">{{
              item.label
            }}</el-radio>
            <!-- <el-radio :label="1">多选</el-radio> -->
          </el-radio-group>
        </div>
        <div class="vote-title">投票主题</div>
        <div>
          <el-input
            clear="vote-input"
            v-model.trim="title"
            placeholder="请输入投票主题，最多50字"
            :maxlength="50"
          />
        </div>

        <div class="vote-title">投票选项</div>
        <div>
          <div class="vote-options" v-for="(option, index) in options">
            <div class="lbox">
              <el-input
                clear="vote-input"
                v-model.trim="option.value"
                placeholder="请输入选项内容"
                :maxlength="120"
              >
                <template #prefix>
                  <span style="margin-left: 7px">{{ keyV(index) }}</span>
                </template>
              </el-input>
            </div>
            <div class="rbox">
              <el-icon @click="removeOption(index)"><Close /></el-icon>
            </div>
          </div>

          <h6 class="pointer add-option" @click="addOption">
            <el-icon><Plus /></el-icon> 添加选项
          </h6>
        </div>
      </el-main>
      <el-footer class="footer">
        <el-button plain @click="closeBox">取消</el-button>
        <el-button type="primary" :disabled="isCheck" :loading="loading" @click="submit"
          >发起投票</el-button
        >
      </el-footer>
    </el-container>
  </div>
</template>
<script>
import { sendTalkVote } from '@/api/module/chat/im/chatTalkRecord';
import dialogue from '@/store/modules/dialogue';
export default {
  name: 'MeEditorVote',
  props: {
    groupId: {
      type: [String, Number],
      default: 0,
    },
  },
  setup() {
    const im_dialogue = dialogue();

    return {
      im_dialogue,
    };
  },
  data() {
    return {
      loading: false,
      mode: 0,
      title: '',
      options: [
        {
          value: '',
          key: 'A',
        },
        {
          value: '',
          key: 'B',
        },
        {
          value: '',
          key: 'C',
        },
      ],
      chat_answer_module: [],
    };
  },
  computed: {
    isCheck() {
      if (this.title == '') return true;

      return this.options.some((option) => option.value == '');
    },
  },
  created() {
    let { chat_answer_module } = this.useDict('chat_answer_module');
    // chat_vote_status = toRaw(chat_vote_status);
    // console.log(chat_vote_status.value);
    this.chat_answer_module = chat_answer_module;
  },
  methods: {
    keyV(idx) {
      return String.fromCharCode(65 + idx);
    },
    model_value(val) {
      console.log(val);
      this.mode = val;
    },
    closeBox() {
      this.$emit('close');
    },
    submit() {
      if (this.mode == 0) {
        this.$notify.info({
          title: '通知',
          message: '请选择投票方式',
        });
        return false;
      }
      let items = [],
        chat_code = [];
      const { groupId } = this.im_dialogue;
      this.options.forEach((option, index) => {
        items.push({
          value: option.value,
          key: this.keyV(index),
        });
        chat_code.push(this.keyV(index));
      });

      this.$emit('confirm', {
        answerOptionContent: items,
        answerMode: this.mode - 1,
        answerOption: chat_code.join(','),
        msgContent: this.title,
        msgType: 3,
      });
      return;
      this.loading = true;

      sendTalkVote({
        groupId: groupId,
        answerMode: this.mode,
        voteTitle: this.title,
        answerOptionList: items,
        listId: 2,
      })
        .then((res) => {
          if (res && res.code === 200) {
            this.$emit('close');
            this.$notify({
              title: '友情提示',
              message: '发起投票成功!',
              type: 'success',
            });
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
    addOption() {
      if (this.options.length >= 6) {
        return false;
      }

      this.options.push({
        value: '',
      });
    },
    removeOption(index) {
      if (this.options.length <= 2) {
        return false;
      }
      this.options.splice(index, 1);
    },
  },
};
</script>
<style lang="scss" scoped>
.lum-dialog-box {
  height: 600px;
  max-width: 450px;

  .vote-from {
    box-sizing: border-box;
    padding: 15px 25px;
    overflow: hidden;

    .vote-title {
      margin: 10px 0 10px;
      &:first-child {
        margin-top: 0;
      }
    }

    .vote-options {
      display: flex;
      min-height: 30px;
      margin: 10px 0;

      .lbox {
        width: 100%;

        :deep(.el-input__prefix) {
          height: 36px;
          line-height: 36px;
        }
      }

      .rbox {
        flex-basis: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        i {
          font-size: 18px;
          cursor: pointer;
          &:hover {
            color: red;
          }
        }
      }
    }

    .add-option {
      margin-top: 5px;
      font-weight: 400;
      color: #3370ff;
    }
  }

  .footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 32px;
  }
}

:deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #606266;
}
</style>
