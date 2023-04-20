import Base from './base'

/**
 * 好友状态事件
 */
class Login extends Base {
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
    im_notify.ACT_UPDATE_FRIEND_STATUS({
      status: this.resource.status,
      friendId: this.resource.userId,
    })
  }
}

export default Login
