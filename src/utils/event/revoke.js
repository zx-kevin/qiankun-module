import Base from './base'
import talk from '@/store/modules/talk.js'
import dialogue from '@/store/modules/dialogue.js'
import { parseTime } from '@/utils/functions'

/**
 * 撤回消息处理
 */
class Revoke extends Base {
  /**
   * @var resource 资源
   */
  resource

  /**
   * 初始化构造方法
   *
   * @param {Object} resource Socket消息
   */
  constructor (resource) {
    super()
    // console.log(resource, 'constructor  revoke')
    this.resource = resource
  }


  /**
   * 判断消息发送者是否来自于我
   * @returns
   */
  isCurrSender () {
    return this.resource.senderId == this.getAccountId()
  }
  /**
   * 获取对话索引
   *
   * @return String
   */
  getIndexName () {
    // console.log(this.resource, 'revoke');
    // if (this.resource.listId) {
    //   return `${this.resource.listId}_${this.resource.listId}`
    // }

    let listId = this.isCurrSender() ? this.resource.listId : this.resource.senderId

    return `${this.resource.groupId}_${this.resource.groupId}`
  }

  handle () {
    // console.log('revole_handle', this.getIndexName());
    talk().UPDATE_TALK_ITEM({
      indexName: this.getIndexName(),
      msgText: "撤回一条消息",
      updateTime: parseTime(new Date()),
    })
    if (!this.isTalk(this.resource.listId, this.resource.groupId)) {
      return false
    }


    console.log(this.resource.groupMsgId);
    dialogue().UPDATE_DIALOGUE({
      groupMsgId: this.resource.groupMsgId,
      msgType: -2,
    })
  }
}

export default Revoke
