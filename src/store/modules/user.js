import { login, logout, getInfo, getFileDomainApi } from '@/api/common/login';
import { getToken, setToken, removeToken } from '@/utils/auth';
import defAva from '@/assets/images/profile.png';
import defaultAvatar from '@/assets/images/chat/detault-avatar.jpg';

const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    name: '',
    avatar: '',
    roles: [],
    permissions: [],
    userId: -1,
    users: [],
    user: {},
    defaultAvatar: defaultAvatar,
    fileBase: '',
    address: '',
    email: '',
    phonenumber: '',
    orgId: '',
    // 个人
    idcard: '',
    nickName: '',
    // 企业
    orgName: '',
    orgNo: '',
  }),
  actions: {
    // 登录
    login(userInfo) {
      const username = userInfo.username.trim();
      const password = userInfo.password;
      const code = userInfo.code;
      const uuid = userInfo.uuid;
      return new Promise((resolve, reject) => {
        login(username, password, code, uuid)
          .then((res) => {
            setToken(res.data.token);
            this.token = res.data.token;
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    // 获取用户信息
    getInfo() {
      return new Promise((resolve, reject) => {
        getInfo()
          .then((res) => {
            const { user, people } = res.data;
            const avatar = people.avatar;
            this.userId = user.userId;
            this.users = people.users;
            this.user = people.user;
            if (user.roleKeys && user.roleKeys.length > 0) {
              // 验证返回的roleKeys是否是一个非空数组
              this.roles = user.roleKeys;
              this.permissions = user.permissions;
            } else {
              this.roles = ['ROLE_DEFAULT'];
            }
            this.name = people.userName || user.userName;
            this.avatar = avatar;

            this.address = people.address;
            this.email = people.email;
            this.phonenumber = people.phonenumber;
            this.orgId = user.orgId;

            this.idcard = people.idcard;
            this.nickName = people.nickName;

            this.orgName = user.org?.orgName;
            this.orgNo = user.org?.orgNo;
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    getFileDomain() {
      return new Promise((resolve, reject) => {
        getFileDomainApi().then((res) => {
          this.fileBase = res;
          // if (res) {
          //   this.avatar =
          //     this.avatar == '' || this.avatar == null ? defAva : this.fileBase + this.avatar;
          // }
        });
      });
    },

    // 退出系统
    logOut() {
      return new Promise((resolve, reject) => {
        logout(this.token)
          .then(() => {
            this.token = '';
            this.roles = [];
            this.permissions = [];
            removeToken();
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
  },
});

export default useUserStore;
