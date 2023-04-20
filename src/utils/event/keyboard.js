import Base from './base'

/**
 * 键盘输入事件
 */
class Keyboard extends Base {
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

    this.resource = resource.data
  }

  handle () {
    let params = this.getTalkParams()

    // 判断当前是否正在对话
    if (params.indexName === null) {
      return false
    }

    // 判断是否是私信
    if (params.listId != 1) {
      return false
    }

    // 判断消息是否来当前对话
    if (params.receiverId != this.resource.senderId) {
      return false
    }

    let { im_notify } = this.getStoreInstance()

    im_notify.UPDATE_KEYBOARD_EVENT()
  }
}

export default Keyboard
