
const dialogue = defineStore(
  'im-dialogue',
  {
    // * listId -> listId
    // * listId-> groupId
    state: () => ({
      // 对话来源[会话id]
      listId: 0,

      // 群id
      groupId: 0,

      isRobot: 0,

      // 聊天记录
      records: [],

      // 对话索引（聊天对话的唯一索引）
      indexName: null,
    }),
    getters: {
      getIndexName (state) {
        return state.indexName
      },
      getRecords (state) {
        return state.records
      }
    },
    actions: {
      // 更新对话
      UPDATE_DIALOGUE_MESSAGE (data) {
        let resource = toRaw(data)
        this.records = []
        this.listId = resource.listId
        this.groupId = resource.groupId
        this.isRobot = parseInt(resource.isRobot)

        if (this.listId === 0 || this.groupId === 0) {
          this.indexName = null
        } else {
          this.indexName = `${resource.groupId}_${resource.groupId}`
        }
        // console.log(this.indexName);
      },

      // 数组头部压入对话记录
      UNSHIFT_DIALOGUE (records) {
        this.records.unshift(...records)
      },

      // 推送对话记录
      PUSH_DIALOGUE (record) {
        this.records.push(record)
      },

      // 更新对话记录
      UPDATE_DIALOGUE (resource) {
        // console.log(resource);
        // console.log(this.records);
        for (let i in this.records) {
          if (this.records[i].groupMsgId == resource.groupMsgId) {
            // console.log(this.records[i]);
            Object.assign(this.records[i], resource)
            break
          }
        }
      },

      // 删除对话记录
      DELETE_DIALOGUE (index) {
        this.records.splice(index, 1)
      },

      // 多选操作
      BATCH_DELETE_DIALOGUE (ids) {
        let index = this.records.findIndex(item => item.groupMsgId == ids.groupMsgId)
        if (index >= 0) this.records.splice(index, 1)
        // ids.forEach(groupMsgId => {
        // })
      },

      // 数组头部压入对话记录
      SET_DIALOGUE (records) {
        this.records = records
      },
    }
  })

export default dialogue