<template>
  <div class="revoke-message">
    <div class="content">
      <span v-if="userStore.userId == item.userId">
        你撤回了一条消息 | {{ sendTime(item.sendTime) }}
      </span>
      <span v-else-if="item.listId == 1"> 对方撤回了一条消息 | {{ sendTime(item.sendTime) }} </span>
      <span v-else> "{{ name }}" 撤回了一条消息 | {{ sendTime(item.sendTime) }} </span>
    </div>
  </div>
</template>
<script>
import { formateTime as sendTime } from '@/utils/functions';
import useUserStore from '@/store/modules/user.js';
export default {
  name: 'RevokeMessage',
  props: {
    item: {
      type: Object,
    },
    name: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    let userStore = useUserStore();
    return {
      userStore,
    };
  },
  methods: {
    sendTime,
  },
};
</script>
<style lang="scss" scoped>
.revoke-message {
  display: flex;
  justify-content: center;

  .content {
    margin: 10px auto;
    background-color: #f5f5f5;
    font-size: 11px;
    line-height: 30px;
    padding: 0 8px;
    word-break: break-all;
    word-wrap: break-word;
    color: #979191;
    user-select: none;
    font-weight: 300;
    display: inline-block;
    border-radius: 3px;

    span {
      margin: 0 5px;
    }

    a {
      color: #939596;
      cursor: pointer;
      font-size: 12px;
      font-weight: 400;

      &:hover {
        color: black;
      }
    }
  }
}
</style>
