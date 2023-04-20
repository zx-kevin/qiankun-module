<template>
  <el-dialog
    title="选择成员"
    :visible.sync="visibleDialog"
    width="600px"
    append-to-body
    class="promoter_person"
  >
    <div class="person_body clear">
      <div class="person_tree l">
        <input
          type="text"
          placeholder="搜索成员"
          v-model="searchVal"
          @input="getDebounceData($event, 0)"
        />
        <p class="ellipsis tree_nav" v-if="!searchVal">
          <span
            v-for="(item, index) in departments.titleDepartments"
            class="ellipsis"
            :key="index + 'a'"
            @click="getDepartmentList(item.deptId)"
            >{{ item.deptName }}</span
          >
        </p>
        <ul>
          <li
            v-for="(item, index) in departments.childDepartments"
            :key="index + 'b'"
            class="check_box not"
          >
            <a @click="getDepartmentList(item.deptId)"
              ><img src="@/assets/images/dialog/icon_file.png" />{{ item.deptName }}</a
            >
            <i @click="getDepartmentList(item.deptId)">下级</i>
          </li>

          <li
            v-if="isMultipleUser"
            v-for="(item, index) in departments.employees"
            :key="index + 'c'"
            class="check_box"
          >
            <a
              :class="$func.toggleClass(checkedEmployessList, item, 'userId') && 'active'"
              @click="$func.toChecked(checkedEmployessList, item, 'userId')"
              :title="item.realName"
            >
              <img src="@/assets/images/dialog/icon_people.png" />{{ item.realName }}</a
            >
          </li>

          <li
            v-if="!isMultipleUser"
            v-for="(item, index) in departments.employees"
            :key="index + 'c'"
            class="check_box not"
            :class="$func.toggleClass(checkedEmployessList, item, 'userId') && 'active'"
            @click="checkedEmployessList = [item]"
          >
            <a :title="item.realName"
              ><img src="@/assets/images/dialog/icon_people.png" />{{ item.realName }}</a
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
          <li v-for="(item, index) in checkedEmployessList" :key="index + 'e'">
            <img src="@/assets/images/dialog/icon_people.png" />
            <span>{{ item.realName }}</span>
            <img
              src="@/assets/images/dialog/cancel.png"
              @click="$func.removeEle(checkedEmployessList, item, 'userId')"
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
  props: ['visible', 'data', 'isMultipleUser'],
  watch: {
    visible(val) {
      this.visibleDialog = this.visible;
      if (val) {
        this.getDepartmentList();
        this.searchVal = '';
        this.checkedEmployessList = this.data
          .filter((item) => item.type === 1)
          .map(({ name, targetId }) => ({
            realName: name,
            userId: targetId,
          }));
        this.checkedDepartmentList = this.data
          .filter((item) => item.type === 3)
          .map(({ name, targetId }) => ({
            deptName: name,
            deptId: targetId,
          }));
      }
    },
    visibleDialog(val) {
      this.$emit('update:visible', val);
    },
  },
  computed: {
    total() {
      return this.checkedDepartmentList.length + this.checkedEmployessList.length;
    },
  },
  data() {
    return {
      checkedDepartmentList: [],
      checkedEmployessList: [],
    };
  },
  methods: {
    saveDialog() {
      let checkedList = [...this.checkedDepartmentList, ...this.checkedEmployessList].map(
        (item) => ({
          type: item.realName ? 1 : 3,
          targetId: item.realName ? item.userId : item.deptId,
          name: item.realName || item.deptName,
        }),
      );
      this.$emit('change', checkedList);
    },
    delList() {
      this.checkedDepartmentList = [];
      this.checkedEmployessList = [];
    },
  },
};
</script>
<style scoped src="@/assets/styles/workflow/override-element-ui.css"></style>
<style>
@import '@/assets/styles/dialog/dialog.css';
</style>
