import UserCardDetail from './UserCardDetail'


export default {
  install (Vue) {
    console.log(1, Vue);
    function user (userId, options) {
      let _vm = this
      console.log(_vm);
      const mountNode = document.createElement('div')
      const el = createApp({
        render () {
          return h(UserCardDetail, {
            on: {
              close: () => {
                el.destroy()
                document.body.removeChild(el.$el)
              },
              changeRemark: data => {
                options.editRemarkCallbak && options.editRemarkCallbak(data)
              },
            },
            props: {
              userId,
            },
          })
        },
      }).mount(mountNode)
      console.log(el);
      document.body.appendChild(el.$el)
    }
    Vue.config.globalProperties.userbox = user
  },
}