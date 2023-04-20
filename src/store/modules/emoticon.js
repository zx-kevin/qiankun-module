/*
 * @Author: 杰 xuyongfeng@jeoho.com
 * @Date: 2023-02-07 18:12:25
 * @LastEditors: 杰 xuyongfeng@jeoho.com
 * @LastEditTime: 2023-02-16 09:08:45
 * @FilePath: \decision_engine_ui\src\store\modules\emoticon.js
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
 */
import { queryMyChatEmoticonItemRes, uploadDiyChatEmoticonItem, collectChatEmoticonItem } from '@/api/module/chat/im/chatEmoticon'

import { ElNotification } from 'element-plus'
import icon_face from '@/assets/images/chat/icon_face.png'
import icon_heart from '@/assets/images/chat/icon_heart.png'
const emoticon = defineStore(
  "im-emoticon",
  {
    state: () => ({
      items: [
        {
          categoryId: -1,
          categoryName: '符号表情',
          categoryIcon: icon_face,
          emoticonItemList: [],
        },
        // {
        //   categoryId: 0,
        //   categoryName: '我的收藏',
        //   categoryIcon: icon_heart,
        //   emoticonItemList: [],
        // },
      ],
    }),
    actions: {
      // 加载用户表情包
      LOAD_USER_EMOTICON () {
        // queryMyChatEmoticonItemRes().then(res => {
        //   const { collectEmoticonList, systemEmoticonList } = res.data

        //   this.items = this.items.slice(0, 2)

        //   // 用户收藏的系统表情包
        //   this.items[1].emoticonItemList = collectEmoticonList

        //   // 用户添加的系统表情包
        //   this.items.push(...systemEmoticonList)
        // })
      },

      // 收藏用户表情包
      SAVE_USER_EMOTICON (resoure) {
        collectChatEmoticonItem({
          groupMsgId: resoure.groupMsgId,
        }).then(res => {
          if (res && res.code === 200) {
            ElNotification({
              title: '收藏提示',
              message: '表情包收藏成功...',
              type: 'success',
            })
            this.LOAD_USER_EMOTICON()
          }
        })
      },

      // 自定义上传用户表情包
      UPLOAD_USER_EMOTICON (resoure) {
        let fileData = new FormData()
        fileData.append('file', resoure.file)
        uploadDiyChatEmoticonItem(fileData)
          .then(res => {
            this.items[1].emoticonItemList.push(res.data)
          })
          .catch(() => {
            ElNotification({
              message: '网络异常请稍后再试...',
              type: 'error',
              duration: 3000,
            })
          })
      },

      // 添加系统表情包
      APPEND_SYS_EMOTICON (resoure) {
        this.items.push(resoure)
      },

      // 移除系统表情包
      REMOVE_SYS_EMOTICON (resoure) {
        for (let i in this.items) {
          if (this.items[i].emoticonId === resoure.emoticonId) {
            this.items.splice(i, 1)
            break
          }
        }
      },
    },
  }
)
export default emoticon
