<!--
 * @Author: yangxiong yangxiong@jeoho.com
 * @Date: 2023-01-28 14:39:44
 * @LastEditors: K
 * @LastEditTime: 2023-03-29 15:29:15
 * @FilePath: \decision_engine_ui\src\views\module\system\user\profile\index.vue
 * @Description: 个人中心
-->
<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="6" :xs="24">
        <el-card class="box-card">
          <template v-slot:header>
            <div class="clearfix">
              <span>个人信息</span>
            </div>
          </template>
          <div>
            <div class="text-center">
              <userAvatar :user="avatarFormatter" />
            </div>
            <ul class="list-group list-group-striped">
              <!-- 个体信息 -->
              <el-tag class="ml-2" type="success">个体信息</el-tag>
              <li class="list-group-item">
                <svg-icon icon-class="user" />用户名称
                <div class="pull-right">{{ state.people.userName }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="phone" />手机号码
                <div class="pull-right">{{ state.people.phonenumber }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="email" />用户邮箱
                <div class="pull-right">{{ state.people.email }}</div>
              </li>

              <!-- 用户信息 -->
              <el-tag class="ml-2" type="success">用户信息</el-tag>
              <li class="list-group-item">
                <svg-icon icon-class="tree" />所属部门
                <div class="pull-right" v-if="state.exitsDept">
                  {{ state.people.user.dept.deptName }} / {{ state.postNames }}
                </div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="peoples" />所属角色
                <div class="pull-right">{{ state.roleNames }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="date" />创建日期
                <div class="pull-right">{{ state.createTime }}</div>
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18" :xs="24">
        <el-card>
          <template v-slot:header>
            <div class="clearfix">
              <span>基本资料</span>
            </div>
          </template>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本资料" name="userinfo">
              <userInfo :people="state.people" />
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd">
              <resetPwd />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Profile">
import userAvatar from './userAvatar';
import userInfo from './userInfo';
import resetPwd from './resetPwd';
import { getUserProfile } from '@/api/module/system/user';
import useUserStore from '@/store/modules/user';

import defAva from '@/assets/images/profile.png';

const userStore = useUserStore();

const activeTab = ref('userinfo');
const state = reactive({
  people: {},
  roleNames: {},
  postNames: {},
  exitsDept: false,
  createTime: '',
  postNames: '',
});

const avatarFormatter = computed(() => {
  return state.people.avatar ? userStore.fileBase + state.people.avatar : defAva;
});

function getUser() {
  getUserProfile().then((response) => {
    state.people = response.data;
    state.roleNames = response.data.user.roleNames?.join();
    state.postNames = response.data.user.postNames?.join();
    state.exitsDept = state.people.user.dept;
    state.createTime = state.people.user.createTime;
  });
}

getUser();
</script>
