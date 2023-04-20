import Base from './base'
/**
 * 心跳处理
 */
class EventHeartbeat extends Base {
  /**
   * @var resource 资源
   */
  resource

  /**
   * 初始化构造方法
   *
   * @param {Object} resource Socket消息
   */
  constructor(resource) {
    super()
    this.resource = resource.data
  }

  handle() {
    console.log("----心跳检测正常----")
  }
}

export default EventHeartbeat
