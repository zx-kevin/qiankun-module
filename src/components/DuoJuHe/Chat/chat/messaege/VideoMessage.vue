<template>
  <div class="video-message" :class="{ full: isFull }">
    <div class="mask">
      <div class="toolbar">
        <p>
          <el-icon @click="toPlay" v-if="isPlay"><VideoPause /></el-icon>
          <el-icon @click="toPlay" v-else><VideoPlay /></el-icon>
        </p>
        <p v-show="isFull">
          <el-icon @click="refresh"><RefreshLeft /></el-icon>
        </p>
        <p>
          <el-icon @click="full"><FullScreen /></el-icon>
        </p>
        <p v-show="isFull">工具栏</p>
      </div>
    </div>
    <el-empty v-if="error" :image-size="100"> 视频加载失败... </el-empty>
    <video
      v-else
      ref="video"
      height="300"
      preload="auto"
      :src="base_url + src"
      @ended="ended"
      @pause="onPause"
      @error="onError"
      @resize="onResize"
      @canplay="onLoadstart"
    ></video>
  </div>
</template>

<script>
import useUserStore from '@/store/modules/user.js';
export default {
  name: 'VideoMessage',
  props: {
    src: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      base_url: useUserStore().fileBase,
      isPlay: false,
      isFull: false,
      error: false,
      duration: 0,
    };
  },
  methods: {
    full() {
      this.isFull = !this.isFull;
    },
    onPause() {
      this.isPlay = false;
    },
    ended() {
      this.isPlay = false;
    },
    toPlay() {
      let video = this.$refs.video;

      if (this.error) return;

      if (this.isPlay) {
        video.pause();
      } else {
        video.play();
      }

      this.isPlay = !this.isPlay;
    },
    onError() {
      this.error = true;
    },
    onResize() {
      console.log('onResize');
    },
    refresh() {
      this.$refs.video.currentTime = 0;
    },
    onLoadstart() {},
  },
};
</script>
<style lang="scss" scoped>
.video-message {
  position: relative;
  min-width: 150px;
  width: fit-content;
  video {
    border-radius: 3px;
    overflow: hidden;
    cursor: pointer !important;
    position: relative;
    margin-bottom: 0;
  }

  .mask {
    position: absolute;
    width: 100%;
    height: 100%;

    .toolbar {
      position: absolute;
      right: 8px;
      bottom: 8px;
      width: 40px;
      min-height: 10px;
      border-radius: 8px;
      background: rgba(117, 116, 116, 0.8);
      padding: 3px 0;
      overflow: hidden;
      z-index: 1;
      p {
        width: 100%;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        margin: 3px 0;
        border-bottom: 1px solid rgba(177, 175, 175, 0.5);
        font-size: 13px;
        i {
          font-size: 20px;
          cursor: pointer;
        }

        &:last-child {
          margin-bottom: 0;
          border-bottom: 0;
        }
      }
    }
  }

  &.full {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 99999999;
    background: rgba(33, 33, 33, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;

    video {
      height: 100vh;
      width: 100vw;
    }

    .mask {
      display: flex;
      align-items: center;
      justify-items: center;
      justify-content: center;

      .toolbar {
        right: 30px;
        width: 60px;
        bottom: unset;
        background: rgba(49, 48, 48, 0.9);
        p {
          height: 50px;
        }
      }
    }
  }
}
</style>
