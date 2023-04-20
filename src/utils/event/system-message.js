import Base from './base'
/**
 * 系统消息处理
 */
class SystemMessage extends Base {
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
    let { im_notify } = this.getStoreInstance()
    //系统消息类型
    let messageType = this.resource.untreatedType
    //未读未处理数量
    let untreatedNum = this.resource.untreatedNum
    console.log("有新消息" + messageType + ",数量" + untreatedNum)
    if ('UNTREATED_SYSTEM_MESSAGE' === messageType) {
      //系统消息
      im_notify.SET_SYSTEM_MESSAGE_NUM(untreatedNum)
    } else if ('UNTREATED_CHAT_MESSAGE' === messageType) {
      //多聊信息
      im_notify.SET_UNREAD_NUM(untreatedNum)
    } else if ('UNTREATED_FRIEND_APPLY' === messageType) {
      //好友申请
      im_notify.SET_FRIEND_APPLY_NUM(untreatedNum)
    }
  }
}

export default SystemMessage
