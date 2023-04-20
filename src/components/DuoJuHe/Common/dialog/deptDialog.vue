<template>
  <el-dialog
    title="选择部门"
    :visible.sync="visibleDialog"
    width="600px"
    append-to-body
    class="promoter_person"
  >
    <div class="person_body clear">
      <div class="person_tree l">
        <input
          type="text"
          placeholder="搜索部门"
          v-model="searchVal"
          @input="getDebounceData($event, 3)"
        />
        <ul>
          <li v-for="(item, index) in depts" :key="index + 'b'" class="check_box">
            <a
              :class="$func.toggleClass(checkedDeptList, item, 'deptId') && 'active'"
              @click="$func.toChecked(checkedDeptList, item, 'deptId')"
            >
              <img src="@/assets/images/dialog/icon_file.png" />{{ item.deptName }}</a
            >
            <i @click="getDeptList(item.deptId)">下级</i>
          </li>
        </ul>
      </div>

      <div class="has_selected l">
        <p class="clear">
          已选（{{ total }}）
          <a @click="delList">清空</a>
        </p>
        <ul>
          <li v-for="(item, index) in checkedDeptList" :key="index + 'b'">
            <img src="@/assets/images/dialog/icon_file.png" />
            <span>{{ item.deptName }}</span>
            <img
              src="@/assets/images/dialog/cancel.png"
              @click="$func.removeEle(checkedDeptList, item, 'deptId')"
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
  props: ['visible', 'data', 'isDepartment'],
  watch: {
    visible(val) {
      this.visibleDialog = this.visible;
      this.getDeptList();
      this.searchVal = '';
      this.checkedDeptList = this.data.map(({ name, targetId }) => ({
        deptName: name,
        deptId: targetId,
      }));
    },
    visibleDialog(val) {
      this.$emit('update:visible', val);
    },
  },
  computed: {
    total() {
      return this.checkedDeptList.length;
    },
  },
  data() {
    return {
      checkedDeptList: [],
    };
  },
  methods: {
    saveDialog() {
      let checkedList = this.checkedDeptList.map((item) => ({
        type: 3,
        targetId: item.deptId,
        name: item.deptName,
      }));
      this.$emit('change', checkedList);
    },
    delList() {
      this.checkedDeptList = [];
    },
  },
};
</script>

<style scoped src="@/assets/styles/workflow/override-element-ui.css"></style>

<style>
@import '@/assets/styles/dialog/dialog.css';
</style>
