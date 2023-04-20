<template>
  <el-dialog
    title="选择岗位"
    :visible.sync="visibleDialog"
    width="600px"
    append-to-body
    class="promoter_person"
  >
    <div class="person_body clear">
      <div class="person_tree l">
        <input
          type="text"
          placeholder="搜索岗位"
          v-model="searchVal"
          @input="getDebounceData($event, 4)"
        />
        <ul>
          <li v-for="(item, index) in posts" :key="index + 'p'" class="check_box">
            <a
              :title="item.postName"
              :class="$func.toggleClass(checkedPostList, item, 'postId') && 'active'"
              @click="$func.toChecked(checkedPostList, item, 'postId')"
            >
              <img src="@/assets/images/dialog/icon_role.png" />{{ item.postName }}</a
            >
          </li>
        </ul>
      </div>
      <div class="has_selected l">
        <p class="clear">
          已选（{{ total }}）
          <a @click="delList">清空</a>
        </p>
        <ul>
          <li v-for="(item, index) in checkedPostList" :key="index + 'p'">
            <img src="@/assets/images/dialog/icon_role.png" />
            <span>{{ item.postName }}</span>
            <img
              src="@/assets/images/dialog/cancel.png"
              @click="$func.removeEle(checkedPostList, item, 'postId')"
            />
          </li>
        </ul>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="$emit('update:visible', false)">取 消</el-button>
      <el-button type="primary" @click="saveDialog">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import mixins from './mixins';
export default {
  mixins: [mixins],
  props: ['visible', 'data'],
  watch: {
    visible(val) {
      this.visibleDialog = this.visible;
      if (val) {
        this.getPostList();
        this.searchVal = '';
        this.checkedPostList = this.data.map(({ name, targetId }) => ({
          postName: name,
          postId: targetId,
        }));
      }
    },
    visibleDialog(val) {
      this.$emit('update:visible', val);
    },
  },
  computed: {
    total() {
      return this.checkedPostList.length;
    },
  },
  data() {
    return {
      checkedPostList: [],
    };
  },
  methods: {
    saveDialog() {
      let checkedList = this.checkedPostList.map((item) => ({
        type: 4,
        targetId: item.postId,
        name: item.postName,
      }));
      this.$emit('change', checkedList);
    },
    delList() {
      this.checkedPostList = [];
    },
  },
};
</script>

<style scoped src="@/assets/styles/workflow/override-element-ui.css"></style>

<style>
@import '@/assets/styles/dialog/dialog.css';
</style>
