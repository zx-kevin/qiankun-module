import { queryNormalSelectSystemRoleResList } from '@/api/system/systemRole'

import { queryNormalSelectSystemPostResList } from '@/api/system/systemPost'

import { querySelectSystemUserResList } from '@/api/system/systemUser'

import { querySelectSystemDeptAndUserResList,queryNormalSelectSystemDeptResList } from '@/api/system/systemDept'

export default {
  data(){
    return {
      visibleDialog: false,
      searchVal: "",
      activeName: "1",
      departments: {},
      roles: [],
      posts: [],
      depts: [],
    }
  },
  methods:{
    getRoleList() {
      queryNormalSelectSystemRoleResList({}).then(response => {
        this.roles = response.data;
      });
    },

    getPostList() {
      queryNormalSelectSystemPostResList({}).then(response => {
        this.posts = response.data;
      });
    },


    getDeptList(parentId = -1) {
      const search={parentId:parentId};
      queryNormalSelectSystemDeptResList(search).then(response => {
        this.depts = response.data;
      });
    },

    getDepartmentList(parentId = -1) {
      const search={parentId:parentId};
      querySelectSystemDeptAndUserResList(search).then(response => {
          this.departments = response.data;
        });
    },
    getDebounceData(event, type = 1) {
      this.$func.debounce(function () {
          if (event.target.value) {
              if (type == 0) {
                this.departments.childDepartments = [];
                const search={realName:event.target.value,rows:0};
                querySelectSystemUserResList(search).then(response => {
                  this.departments.employees = response.data.records;
                });
              }else  if (type == 1) {
                this.departments.childDepartments = [];
                const search={keyword:event.target.value,rows:0};
                querySelectSystemDeptAndUserResList(search).then(response => {
                  this.departments = response.data;
                });
              } else if (type == 3){
                const search={deptName:event.target.value};
                queryNormalSelectSystemDeptResList(search).then(response => {
                  this.depts = response.data;
                });
              } else if (type == 4){
                const search={postName:event.target.value};
                queryNormalSelectSystemPostResList(search).then(response => {
                  this.posts = response.data;
                });
              } else {
                const search={roleName:event.target.value};
                queryNormalSelectSystemRoleResList(search).then(response => {
                  this.roles = response.data;
                });
              }
          } else {
            if (type == 0){
              this.getDepartmentList();
            }else if (type == 1){
              this.getDepartmentList();
            }else if(type==3){
              this.getDeptList();
            }else if(type==4){
              this.getPostList();
            }else {
              this.getRoleList();
            }
          }
      }.bind(this))()
    },
  }
}
