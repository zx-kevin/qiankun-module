<template>
  <div class="welcome-box">
    <div class="famous-box">
      <img src="@/assets/images/chat/chat.png" width="300" />
      <p v-if="socketStatus">
        为梦想而创作，为梦想而努力<br />
        加油吧！ 程序员......
      </p>
      <p v-else>
        <span>连接中...</span>
      </p>
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia';
import useAppStore from '@/store/modules/app';
export default {
  components: {},
  data() {
    return {};
  },
  setup(props, { attrs, slots, emit, expose }) {},
  created() {},
  computed: {
    ...mapState(useAppStore, ['socketStatus']),
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
.welcome-box {
  height: 100%;
  width: 100%;

  .famous-box {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 100%;
    font-size: 24px;
    user-select: none;

    p {
      width: 100%;
      font-weight: 300;
      text-align: center;
      font-size: 15px;
      color: #b9b4b4;
      margin-top: -30px;
    }
  }
}
</style>
