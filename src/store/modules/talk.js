import { getSort, getMutipSort } from '@/utils/functions'
const talk = defineStore(
  'im-talk',
  {
    state: () => ({
      // 用户对话列表
      items: [1],

      // 最后一条消息
      unreadMessage: {
        num: 0,
        realName: '未知',
        msgContent: '...',
      },

      // 对话列表重载状态
      heavyLoad: false,

    }),
    getters: {
      // 过滤所有置顶对话列表
      topItems: (state) => {
        return state.items.filter(item => item.isTop == 1)
      },
      talkItems: (state) => {
        return state.items.sort(
          getMutipSort([getSort((a, b) => a.createTime < b.createTime)])
        )
      },
      // 消息未读数总计
      unreadNum: (state) => {
        return state.items.reduce((total, item) => {
          return total + parseInt(item.unreadNum)
        }, 0)
      },
      talkNum: (state) => { return state.items.length },

    },
    actions: {
      // 设置对话列表
      SET_TALK_ITEMS (resource) {
        this.items = resource.items
      },

      // 更新对话节点
      UPDATE_TALK_ITEM (resource) {
        let index = this.items.findIndex(
          item => item.indexName == resource.indexName
        )
        if (index >= 0) {
          Object.assign(this.items[index], resource)
        }
      },

      // 新增对话节点
      PUSH_TALK_ITEM (resource) {
        this.items.push(resource)
      },

      // 移除对话节点
      REMOVE_TALK_ITEM (indexName) {
        for (let i in this.items) {
          if (this.items[i].indexName === indexName) {
            this.items.splice(i, 1)
            break
          }
        }
      },

      // 更新对话消息
      UPDATE_TALK_MESSAGE (resource) {
        for (let i in this.items) {
          if (this.items[i].indexName === resource.indexName) {
            this.items[i].unreadNum++
            this.items[i].msgText = resource.msgText
            this.items[i].updateTime = resource.updateTime
            break
          }
        }
      },

      // 触发对话列表重新加载
      TRIGGER_TALK_ITEMS_LOAD (status = false) {
        this.heavyLoad = status
      },

      SET_TALK_UNREAD_MESSAGE (resource) {
        this.unreadMessage.num++
        this.unreadMessage.realName = resource.realName
        this.unreadMessage.msgContent = resource.msgContent
      },

      // 清除最后一条未读消息
      CLEAR_TALK_UNREAD_MESSAGE () {
        this.unreadMessage = {
          num: 0,
          realName: '未知',
          msgContent: '...',
        }
      },
    },
  })

export default talk
