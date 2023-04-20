import Base from './base'
import dialogue from '@/store/modules/dialogue.js'

/**
 * 删除消息处理
 */
class Delete extends Base {
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
    this.resource = resource
  }

  handle () {
    if (
      !this.isTalk(
        this.resource.listId,
        this.resource.groupId,
        this.resource.senderId
      )
    ) {
      return false
    }
    dialogue().BATCH_DELETE_DIALOGUE(this.resource)
  }
}

export default Delete
