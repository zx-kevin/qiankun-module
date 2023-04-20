<!--
 * @Author: 杰 xuyongfeng@jeoho.com
 * @Date: 2023-02-07 18:12:24
 * @LastEditors: 杰 xuyongfeng@jeoho.com
 * @LastEditTime: 2023-02-15 18:32:02
 * @FilePath: \decision_engine_ui\src\components\DuoJuHe\Chat\editor\MeEditorEmoticon.vue
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
-->
<template>
  <div>
    <el-container class="container">
      <el-header height="30px" class="header">
        <span v-text="showTitle"></span>
        <!--<div class="addbtn" @click="systemEmojiBox = true">系统表情</div>-->
      </el-header>
      <el-main class="no-padding main lum-scrollbar">
        <input
          type="file"
          ref="fileCustomEmoji"
          accept="image/*"
          style="display: none"
          @change="customUploadEmoji"
        />

        <div v-show="showEmoticonId == -1" class="emoticon">
          <div class="title">我的表情</div>
          <div
            v-for="(elImg, text) in emoji.emojis"
            v-html="elImg"
            class="emoticon-item"
            @click="clickEmoticon(text)"
          ></div>
          <div class="clear"></div>
          <div class="title">符号表情</div>
          <div
            v-for="(item, i) in emoji.symbol"
            :key="i"
            class="emoticon-item symbol"
            @click="clickEmoticon(item)"
          >
            {{ item }}
          </div>
          <div class="clear"></div>
        </div>

        <div
          v-for="item in emojiItem.slice(1)"
          v-show="item.categoryId == showEmoticonId"
          :key="item.categoryId"
          class="emoji-box"
        >
          <div
            v-if="item.categoryId == 0"
            class="emoji-item custom-emoji"
            @click="$refs.fileCustomEmoji.click()"
          >
            <i class="el-icon-picture" />
            <span>自定义</span>
          </div>
          <div
            v-for="subitem in item.emoticonItemList"
            :key="subitem.itemId"
            class="emoji-item"
            @click="clickImageEmoticon(subitem)"
          >
            <el-image :src="subitem.emoticonUrl" fit="cover" />
          </div>
          <div class="clear"></div>
        </div>
      </el-main>
      <el-footer height="40px" class="no-padding footer">
        <div class="toolbar-items">
          <div v-show="emojiItem.length > 13" class="toolbar-item prev-page" @click="turnPage(1)">
            <i class="el-icon-caret-left" />
          </div>
          <div
            v-for="(item, index) in showItems"
            :key="index"
            class="toolbar-item"
            @click="triggerItem(item)"
          >
            <img :src="item.categoryIcon" />
            <p class="title">{{ item.categoryName }}</p>
          </div>
          <div
            v-show="emojiItem.length > 13 && showItems.length == 13"
            class="toolbar-item next-page"
            @click="turnPage(2)"
          >
            <i class="el-icon-caret-right" />
          </div>
        </div>
      </el-footer>
    </el-container>

    <MeEditorSystemEmoticon v-if="systemEmojiBox" @close="systemEmojiBox = false" />
  </div>
</template>

<script>
import MeEditorSystemEmoticon from '@/components/DuoJuHe/Chat/editor/MeEditorSystemEmoticon';
import { emojiList as emoji } from '@/utils/emojis';
import { mapState } from 'pinia';
import emoticon from '@/store/modules/emoticon';

export default {
  name: 'MeEditorEmoticon',
  components: {
    MeEditorSystemEmoticon,
  },
  setup() {
    const im_emoticon = emoticon();
    const emojiItem = im_emoticon.items;
    return {
      im_emoticon,
      emojiItem,
    };
  },
  computed: {
    showItems() {
      let start = (this.page - 1) * this.pageSize;
      let end = start + this.pageSize;
      return this.emojiItem.slice(start, end);
    },
    pageTotal() {
      return this.emojiItem.length / this.pageSize;
    },
  },
  data() {
    return {
      emoji,

      // 系统表情包套弹出窗
      systemEmojiBox: false,

      showEmoticonId: -1,
      showTitle: '符号表情',

      page: 1,
      pageSize: 13,
    };
  },
  created() {
    emoticon().LOAD_USER_EMOTICON();
  },
  methods: {
    // 表情包导航翻页
    turnPage(type) {
      if (type == 1) {
        if (this.page == 1) return false;
        this.page--;
      } else {
        if (this.page >= this.pageTotal) return false;
        this.page++;
      }
    },

    // 点击表情包导航
    triggerItem(item) {
      this.showEmoticonId = item.categoryId;
      this.showTitle = item.categoryName;
    },

    // 选中表情
    clickEmoticon(emoji) {
      this.callback({
        type: 1,
        value: emoji,
      });
    },

    // 发送图片表情包
    clickImageEmoticon(item) {
      this.callback({
        type: 2,
        value: item.itemId,
      });
    },

    callback(data) {
      this.$emit('selected', data);
    },

    // 自定义上传表情
    customUploadEmoji(e) {
      if (e.target.files.length == 0) {
        return false;
      }

      emoticon().UPLOAD_USER_EMOTICON({
        file: e.target.files[0],
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.container {
  height: 300px;
  width: 500px;
  background-color: white;

  .header {
    line-height: 30px;
    font-size: 13px;
    font-weight: 400;
    padding-left: 5px;
    user-select: none;
    position: relative;
    border-bottom: 1px solid #fbf5f5;

    .addbtn {
      position: absolute;
      right: 10px;
      top: 1px;
      color: #409eff;
      cursor: pointer;
    }
  }

  .footer {
    background-color: #eff1f7;

    .toolbar-items {
      width: 100%;
      height: 40px;
      line-height: 40px;
      display: flex;
      flex-direction: row;
      align-items: center;

      .toolbar-item {
        height: 30px;
        width: 30px;
        margin: 0 2px;
        background-color: #fff;
        display: inline-block;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;

        img {
          width: 20px;
          height: 20px;
        }

        .title {
          display: none;
          position: absolute;
          top: -25px;
          left: 0px;
          height: 20px;
          line-height: 20px;
          background: #353434;
          color: white;
          min-width: 30px;
          font-size: 10px;
          padding-left: 5px;
          padding-right: 5px;
          border-radius: 2px;
          white-space: pre;
        }

        &:hover .title {
          display: block;
        }
      }
    }
  }
}

.container .footer .toolbar-items .prev-page:active i,
.container .footer .toolbar-items .next-page:active i {
  transform: scale(1.2);
}

.emoji-box,
.emoticon {
  width: 100%;
}

.emoticon {
  .title {
    width: 50%;
    height: 25px;
    line-height: 25px;
    color: #ccc;
    font-weight: 400;
    padding-left: 3px;
    font-size: 12px;
    text-align: left;
    margin: 0;
  }

  .emoticon-item {
    width: 30px;
    height: 30px;
    margin: 2px;
    float: left;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
      transform: scale(1.3);
    }
  }

  .symbol {
    font-size: 22px;
  }
}

.emoji-box {
  .emoji-item {
    width: 67px;
    height: 67px;
    margin: 2px;
    background-color: #eff1f7;
    float: left;
    cursor: pointer;
    transition: ease-in 0.3s;
  }

  .custom-emoji {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    font-size: 10px;

    i {
      font-size: 30px;
      margin-bottom: 3px;
    }

    &:active {
      color: #409eff;
    }
  }
}

:deep(.el-image) {
  width: 100%;
  height: 100%;
  transition: ease-in 0.3s;
}

.emoji-box .emoji-item:hover .el-image,
.emoji-box .emoji-item:hover {
  border-radius: 10px;
}
</style>
