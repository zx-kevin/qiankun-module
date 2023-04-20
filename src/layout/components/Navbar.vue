<!--
 * @Author: yangxiong yangxiong@jeoho.com
 * @Date: 2023-01-28 14:39:44
 * @LastEditors: yangxiong yangxiong@jeoho.com
 * @LastEditTime: 2023-04-13 09:18:49
 * @FilePath: \decision_engine_ui\src\layout\components\Navbar.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="navbar">
    <hamburger
      id="hamburger-container"
      :is-active="appStore.sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />
    <breadcrumb
      id="breadcrumb-container"
      class="breadcrumb-container"
      v-if="!settingsStore.topNav"
    />
    <top-nav id="topmenu-container" class="topmenu-container" v-if="settingsStore.topNav" />

    <div class="right-menu">
      <template v-if="appStore.device !== 'mobile'">
        <header-search id="header-search" class="right-menu-item" />

        <screenfull id="screenfull" class="right-menu-item hover-effect" />

        <el-tooltip content="布局大小" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip>
      </template>

      <el-dropdown
        class="roles"
        placement="bottom"
        @command="changeRole"
        v-if="userStore.users.length > 0"
      >
        <span class="el-dropdown-link">
          切换身份（{{ userStore.user.orgId ? userStore.user.org?.orgName : '个人身份' }}）
          <svg-icon v-if="userStore.users.length > 1" icon-class="xiangxiazhankai"></svg-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu class="roles-dropdown">
            <el-dropdown-item
              class="item"
              v-for="(item, index) in userStore.users"
              :key="item.userId"
              :command="item.userId"
              :disabled="item.userId == userStore.userId"
              ><span>{{ item.orgId ? item.org?.orgName : '个人身份' }}</span></el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <div class="avatar-container">
        <el-dropdown @command="handleCommand" class="right-menu-item hover-effect" trigger="click">
          <div class="avatar-wrapper">
            <img :src="avatarFormatter" class="user-avatar" />
            <el-icon><caret-bottom /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <router-link to="/user/profile">
                <el-dropdown-item>个人中心</el-dropdown-item>
              </router-link>
              <el-dropdown-item command="setLayout">
                <span>布局设置</span>
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ElMessageBox } from 'element-plus';
import Breadcrumb from '@/components/Breadcrumb';
import TopNav from '@/components/TopNav';
import Hamburger from '@/components/Hamburger';
import Screenfull from '@/components/Screenfull';
import SizeSelect from '@/components/SizeSelect';
import HeaderSearch from '@/components/HeaderSearch';
import useAppStore from '@/store/modules/app';
import useUserStore from '@/store/modules/user';
import useSettingsStore from '@/store/modules/settings';

import { switchApi } from '@/api/common/index.js';

import defAva from '@/assets/images/profile.png';

const router = useRouter();
const appStore = useAppStore();
const userStore = useUserStore();
const settingsStore = useSettingsStore();

const avatarFormatter = computed(() => {
  return userStore.avatar ? userStore.fileBase + userStore.avatar : defAva;
});

function toggleSideBar () {
  appStore.toggleSideBar();
}

function handleCommand (command) {
  switch (command) {
    case 'setLayout':
      setLayout();
      break;
    case 'logout':
      logout();
      break;
    default:
      break;
  }
}

function logout () {
  ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      userStore.logOut().then(() => {
        location.href = '/index';
      });
    })
    .catch(() => {});
}

function changeRole (id) {
  switchApi({ userId: id }).then((res) => {
    if (res.code == 200) {
      router.push('/');
      userStore.getInfo().then(() => {
        window.location.reload();
      });
    }
  });
}

const emits = defineEmits(['setLayout']);
function setLayout () {
  emits('setLayout');
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .topmenu-container {
    position: absolute;
    left: 50px;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;
    display: flex;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 40px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        i {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }

    .el-dropdown-link {
      line-height: 30px;
      height: 30px;
      font-size: 12px;
      color: #677999 !important;
      background-color: #f5f6f9;
      padding: 0 10px;
      border-radius: 4px;
      display: block;
    }
  }
  .roles {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 15px;
    .el-dropdown-link {
      cursor: pointer;
    }
  }
}
</style>
