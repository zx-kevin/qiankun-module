const notify = defineStore(
  'im-notify',
  {
    state: () => ({
      // 聊天消息未读数
      unreadNum: 0,

      // 系统消息数量
      systemMessageNum: 0,

      //好友申请数量
      friendApplyNum: 0,

      // 好友申请未读数
      applyNum: 0,

      // 好友键盘事件监听
      inputEvent: 0,

      // 好友登录状态监听
      friendStatus: {
        // 登录状态[0:下线;1:在线;]
        status: 0,
        // 好友ID
        friendId: 0,
      },
    }),
    actions: {
      // 消息未读数自增
      INCR_UNREAD_NUM () {
        this.unreadNum++
      },
      // 好友申请事件监听
      INCR_APPLY_NUM () {
        this.applyNum++
      },

      // 设置消息未读数
      SET_UNREAD_NUM (value) {
        this.unreadNum = value
      },

      // 设置系统消息未读数
      SET_SYSTEM_MESSAGE_NUM (value) {
        this.systemMessageNum = value
      },

      // 设置好友申请数量
      SET_FRIEND_APPLY_NUM (value) {
        this.friendApplyNum = value
      },

      // 好友申请事件监听
      SET_APPLY_NUM (value) {
        this.applyNum = value
      },

      // 自增好友键盘输入事件
      UPDATE_KEYBOARD_EVENT () {
        this.inputEvent++
      },

      // 更新好友登录状态
      UPDATE_FRIEND_STATUS (value) {
        this.friendStatus = value
      },
      ACT_UPDATE_FRIEND_STATUS (value) {
        return new Promise(resolve => {
          setTimeout(() => {
            this.UPDATE_FRIEND_STATUS(value)
            resolve()
          }, 0)
        })
      },
    }
  })

export default notify
