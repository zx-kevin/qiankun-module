<template>
  <div>
    <div class="vote-message">
      <div class="vote-from">
        <div class="vheader">
          <p>
            {{ answerMode == 1 ? '[多选投票]' : '[单选投票]' }}
            <el-icon v-show="isVote" class="pointer" @click="loadRefresh">
              <Refresh v-if="!refresh" />
              <Loading v-else />
            </el-icon>
            <!-- title="刷新投票结果" -->
          </p>
          <p>{{ title }}</p>
        </div>

        <template v-if="isVote">
          <div class="vbody">
            <div class="vote-view" v-for="(option, index) in options">
              <p class="vote-option">{{ option.value }}. {{ option.text }}</p>
              <p class="vote-census">{{ option.num }} 票 {{ option.progress }}%</p>
              <p class="vote-progress">
                <el-progress :show-text="false" :percentage="parseInt(option.progress)" />
              </p>
            </div>
          </div>
          <div class="vfooter vote-view">
            <p>应参与人数：{{ answerNum }} 人</p>
            <p>实际参与人数：{{ answeredNum }} 人</p>
          </div>
        </template>
        <template v-else>
          <div class="vbody">
            <p class="option" v-for="(option, index) in options">
              <el-checkbox v-model="option.isChecked" @change="toSelect2(option)" />
              <span @click="toSelect(option, index)" style="margin-left: 10px">
                {{ option.value }} 、{{ option.text }}
              </span>
            </p>
          </div>
          <div class="vfooter">
            <el-button plain round @click="toVote">
              {{ isUserVote ? '立即投票' : '请选择进行投票' }}
            </el-button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { userVoteApi, getGroupMsgVoteDetailApi } from '@/api/module/chat/im/chatTalkRecord';
import useUserStore from '@/store/modules/user.js';
export default {
  name: 'VoteMessage',
  props: {
    vote: {
      type: Object,
      required: true,
    },
    recordId: {
      type: [String, Number],
      required: true,
    },
  },
  data() {
    return {
      answerMode: 0,
      title: '投票标题',
      radioValue: '',
      options: [],
      isVote: false,
      answerNum: 0,
      answeredNum: 0,
      refresh: false,
    };
  },
  computed: {
    isUserVote() {
      return this.options.some((iten) => {
        return iten.isChecked;
      });
    },
  },
  created() {
    let userId = useUserStore().userId;
    let { groupMsgVote, msgContent } = this.vote;
    this.title = msgContent;
    this.answerMode = groupMsgVote.answerMode;
    this.answerNum = groupMsgVote.answerNum;
    this.answeredNum = groupMsgVote.answeredNum;
    let answerOptionList = JSON.parse(groupMsgVote.answerOptionContent);
    answerOptionList.forEach((item) => {
      this.options.push({
        value: item.key,
        text: item.value,
        isChecked: false,
        num: 0,
        progress: '00.0',
      });
    });
    groupMsgVote.operUserIdList = groupMsgVote.operUserIdList || [];
    this.isVote = groupMsgVote.operUserIdList.some((value) => {
      // console.log(value);
      return value == userId;
    });

    this.loadRefresh();
  },
  methods: {
    loadRefresh() {
      let that = this;
      this.refresh = true;
      getGroupMsgVoteDetailApi({
        groupMsgVoteId: this.recordId,
      })
        .then((response) => {
          that.refresh = false;
          that.updateStatistics(response.data);
        })
        .catch(function () {
          that.refresh = false;
        });
      /*  setTimeout(() => {
        this.refresh = false
      }, 500)*/
    },
    updateStatistics(data) {
      let count = data.answerNum;
      this.answeredNum = data.operUserIdList.length;
      let statisticsMap = data.statisticsMap;
      this.options.forEach((option) => {
        option.num = statisticsMap[option.value];

        if (count > 0) {
          option.progress = Math.floor((statisticsMap[option.value] / count) * 10000) / 100;
        }
      });
    },

    toSelect(option, index) {
      if (this.answerMode == 0) {
        this.options.forEach((option) => {
          option.isChecked = false;
        });
      }

      this.options[index].isChecked = !option.isChecked;
    },
    toSelect2(option) {
      if (this.answerMode == 0) {
        this.options.forEach((item) => {
          if (option.value == item.value) {
            item.isChecked = option.isChecked;
          } else {
            item.isChecked = false;
          }
        });
      }
    },
    toVote() {
      if (this.isUserVote == false) {
        return false;
      }

      let items = [];
      this.options.forEach((item) => {
        if (item.isChecked) {
          items.push(item.value);
        }
      });
      userVoteApi({
        answerOption: items.join(','),
        groupMsgId: this.vote.groupMsgId,
      }).then((res) => {
        if (res && res.code === 200) {
          this.isVote = true;
          this.loadRefresh();
        }
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.vote-message {
  width: 300px;
  min-height: 150px;
  border: 1px solid #eceff1;
  box-sizing: border-box;
  border-radius: 5px;
  overflow: hidden;

  .vote-from {
    width: 100%;

    .vheader {
      min-height: 50px;
      background: #4e83fd;
      padding: 8px;
      position: relative;
      p {
        margin: 3px 0;
        &:first-child {
          color: rgb(245, 237, 237);
          font-size: 13px;
          margin-bottom: 8px;
        }

        &:last-child {
          color: white;
        }
      }

      &::before {
        content: '投票';
        position: absolute;
        font-size: 60px;
        color: white;
        opacity: 0.1;
        top: -5px;
        right: 10px;
      }
    }

    .vbody {
      min-height: 80px;
      width: 100%;
      padding: 5px 15px;
      box-sizing: border-box;
      .option {
        margin: 14px 0px;
        font-size: 13px;
        span {
          cursor: pointer;
          user-select: none;
          line-height: 22px;
        }

        .el-radio {
          margin-right: 0;
          .el-radio__label {
            padding-left: 5px;
          }
        }
      }
      margin-bottom: 10px;
    }

    .vfooter {
      height: 55px;
      text-align: center;
      box-sizing: border-box;

      .el-button {
        width: 80%;
        font-weight: 400;
      }

      &.vote-view {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        padding-left: 15px;

        p {
          border-left: 2px solid #2196f3;
          padding-left: 5px;
        }
      }
    }
  }

  .vote-view {
    width: 100%;
    min-height: 30px;
    margin: 15px 0;
    box-sizing: border-box;

    > p {
      margin: 6px 0px;
      font-size: 13px;
    }

    .vote-option {
      min-height: 20px;
      line-height: 20px;
    }

    .vote-census {
      height: 20px;
      line-height: 20px;
    }
  }
}
</style>
