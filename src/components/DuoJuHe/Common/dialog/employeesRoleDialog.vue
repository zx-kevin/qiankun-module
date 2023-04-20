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
          :placeholder="placeholderTitle"
          v-model="searchVal"
          @input="getDebounceData($event, activeName)"
        />
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="部门列表" name="1"></el-tab-pane>
          <el-tab-pane label="角色列表" name="2"></el-tab-pane>
        </el-tabs>
        <p class="ellipsis tree_nav" v-if="activeName == 1 && !searchVal">
          <span
            v-for="(item, index) in departments.titleDepartments"
            class="ellipsis"
            :key="index + 'a'"
            @click="getDepartmentList(item.deptId)"
            >{{ item.deptName }}</span
          >
        </p>
        <ul style="height: 360px" v-if="activeName == 1">
          <li
            v-for="(item, index) in departments.childDepartments"
            :key="index + 'b'"
            class="check_box"
            :class="{ not: !isDepartment }"
          >
            <a
              v-if="isDepartment"
              :class="$func.toggleClass(checkedDepartmentList, item, 'deptId') && 'active'"
              @click="$func.toChecked(checkedDepartmentList, item, 'deptId')"
            >
              <img src="@/assets/images/dialog/icon_file.png" />{{ item.deptName }}</a
            >
            <a v-else><img src="@/assets/images/dialog/icon_file.png" />{{ item.deptName }}</a>
            <i @click="getDepartmentList(item.deptId)">下级</i>
          </li>
          <li v-for="(item, index) in departments.employees" :key="index + 'c'" class="check_box">
            <a
              :class="$func.toggleClass(checkedEmployessList, item, 'userId') && 'active'"
              @click="$func.toChecked(checkedEmployessList, item, 'userId')"
              :title="item.realName"
            >
              <img src="@/assets/images/dialog/icon_people.png" />{{ item.realName }}</a
            >
          </li>
        </ul>
        <ul style="height: 360px" v-if="activeName == 2">
          <li v-for="(item, index) in roles" :key="index + 'c'" class="check_box">
            <a
              :class="$func.toggleClass(checkedRoleList, item, 'roleId') && 'active'"
              @click="$func.toChecked(checkedRoleList, item, 'roleId')"
              :title="item.roleName"
            >
              <img src="@/assets/images/dialog/icon_role.png" />{{ item.roleName }}</a
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
          <li v-for="(item, index) in checkedRoleList" :key="index + 'e'">
            <img src="@/assets/images/dialog/icon_role.png" />
            <span>{{ item.roleName }}</span>
            <img
              src="@/assets/images/dialog/cancel.png"
              @click="$func.removeEle(checkedRoleList, item, 'roleId')"
            />
          </li>
          <template v-if="isDepartment">
            <li v-for="(item, index) in checkedDepartmentList" :key="index + 'e1'">
              <img src="@/assets/images/dialog/icon_file.png" />
              <span>{{ item.deptName }}</span>
              <img
                src="@/assets/images/dialog/cancel.png"
                @click="$func.removeEle(checkedDepartmentList, item, 'deptId')"
              />
            </li>
          </template>
          <li v-for="(item, index) in checkedEmployessList" :key="index + 'e2'">
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
  props: ['visible', 'data', 'isDepartment'],
  watch: {
    visible(val) {
      this.visibleDialog = this.visible;
      if (val) {
        this.activeName = '1';
        this.getDepartmentList();
        this.searchVal = '';
        this.checkedEmployessList = this.data
          .filter((item) => item.type === 1)
          .map(({ name, targetId }) => ({
            realName: name,
            userId: targetId,
          }));
        this.checkedRoleList = this.data
          .filter((item) => item.type === 2)
          .map(({ name, targetId }) => ({
            roleName: name,
            roleId: targetId,
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
      return (
        this.checkedEmployessList.length +
        this.checkedRoleList.length +
        this.checkedDepartmentList.length
      );
    },
  },
  data() {
    return {
      placeholderTitle: '搜索成员',
      checkedRoleList: [],
      checkedEmployessList: [],
      checkedDepartmentList: [],
    };
  },
  methods: {
    handleClick() {
      this.searchVal = '';
      this.conditionRoleSearchName = '';
      if (this.activeName == 1) {
        this.placeholderTitle = '搜索成员';
        this.getDepartmentList();
      } else {
        this.placeholderTitle = '搜索角色';
        this.getRoleList();
      }
    },
    saveDialog() {
      let checkedList = [
        ...this.checkedRoleList,
        ...this.checkedEmployessList,
        ...this.checkedDepartmentList,
      ].map((item) => ({
        type: item.realName ? 1 : item.roleName ? 2 : 3,
        targetId: item.realName ? item.userId : item.roleName ? item.roleId : item.deptId,
        name: item.realName || item.roleName || item.deptName,
      }));
      this.$emit('change', checkedList);
    },
    delList() {
      this.checkedEmployessList = [];
      this.checkedRoleList = [];
      this.checkedDepartmentList = [];
    },
  },
};
</script>

<style scoped src="@/assets/styles/workflow/override-element-ui.css"></style>

<style>
@import '@/assets/styles/dialog/dialog.css';
</style>
