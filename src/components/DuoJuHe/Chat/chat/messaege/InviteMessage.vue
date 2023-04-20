<!--
 * @Author: 杰 xuyongfeng@jeoho.com
 * @Date: 2023-02-07 18:12:24
 * @LastEditors: 杰 xuyongfeng@jeoho.com
 * @LastEditTime: 2023-02-17 15:11:16
 * @FilePath: \decision_engine_ui\src\components\DuoJuHe\Chat\chat\messaege\InviteMessage.vue
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
-->
<template>
  <div class="invite-message">
    <!-- v-if="item.groupMsgInvite?.inviteType == 0 || item.groupMsgInvite?.inviteType == 2" -->
    <div class="system-msg">
      <a
        @click="
          () => {
            return false;
          }
        "
      >
        {{ item.msgContent }}
      </a>
      <!-- <span>{{ inviteType == 0 ? '邀请了' : '将' }}</span>

      <span>{{ inviteType == 0 ? '加入了群聊' : '踢出了群聊' }}</span> -->
    </div>

    <!-- <div v-else-if="inviteType == 1" class="system-msg">
      <a
        @click="
          () => {
            return false;
          }
        "
      >
        {{ item.msgContent }}
      </a>
    </div> -->
  </div>
</template>
<script>
export default {
  name: 'InviteMessage',
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  methods: {
    toUser(userId) {
      this.$emit('cat', userId);
    },
  },
};
</script>
<style lang="scss" scoped>
.invite-message {
  display: flex;
  justify-content: center;
}

.system-msg {
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
</style>
