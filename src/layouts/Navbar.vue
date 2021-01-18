<template>
  <div class="header space-between-align-center">
    <div class="row-align-center">
      <a-breadcrumb :routes="routes">
        <template v-slot:itemRender="{ route, routes }">
          <span v-if="routes.indexOf(route) === routes.length - 1 || route.noRedirect">{{ route.breadcrumbName }}</span>
          <router-link v-else :to="route.path">
            {{ route.breadcrumbName }}
          </router-link>
        </template>
      </a-breadcrumb>
    </div>

    <div class="row-align-center">
      <a-dropdown>
        <div>
          <a-avatar size="small" icon="user" />
          <span class="user-name">{{ realName }}</span>
        </div>
        <a-menu style="width:140px" slot="overlay">
          <a-menu-item key="exit" @click="loginOut">
            <a-icon type="logout" />
            退出登录
          </a-menu-item>
          <a-menu-item key="password" @click="editPassword">
            <a-icon type="key" />
            修改密码
          </a-menu-item>
        </a-menu>
      </a-dropdown>
    </div>

    <a-modal
      title="修改密码"
      :visible="resetVisible"
      :confirm-loading="confirmLoading"
      @ok="resetOk"
      @cancel="resetCancel"
    >
      <a-form-model
        ref="restForm"
        :model="restForm"
        :rules="rules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 14 }"
      >
        <a-form-model-item label="账号名称" prop="userName">
          <a-input v-model.trim="restForm.userName" :disabled="true" />
        </a-form-model-item>

        <a-form-model-item has-feedback label="旧密码" prop="oldPassword">
          <a-input v-model.trim="restForm.oldPassword" type="password" autocomplete="off" />
        </a-form-model-item>

        <a-form-model-item has-feedback label="新密码" prop="password">
          <a-input v-model.trim="restForm.password" type="password" autocomplete="off" />
        </a-form-model-item>

        <a-form-model-item has-feedback label="再次确认" prop="checkPass">
          <a-input v-model="restForm.checkPass" type="password" autocomplete="off" />
          <a-alert message="请再次输入您的密码" type="info" show-icon />
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>
<script>
import { mapState } from "vuex";
import { editPassword, logout } from "@/api/user";
import { hex_md5 } from "@/utils/md5";
export default {
  name: "Navbar",
  watch: {
    $route(to) {
      if (to.name === "redirect") {
        return;
      }
      this.getRoutesData(to.matched);
    }
  },
  computed: {
    ...mapState("user", {
      realName: state => state.userInfo.realName
    })
  },

  data() {
    let validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入新密码"));
      } else {
        if (this.restForm.checkPass !== "") {
          this.$refs.restForm.validateField("checkPass");
        }
        callback();
      }
    };

    let validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入新密码"));
      } else if (value !== this.restForm.password) {
        callback(new Error("两次输入的密码不相同!"));
      } else {
        callback();
      }
    };
    return {
      routes: [],
      resetVisible: false,
      confirmLoading: false,

      rules: {
        oldPassword: [{ required: true, message: "请输入旧密码", trigger: "change" }],
        password: [{ required: true, validator: validatePass, trigger: "change" }],
        checkPass: [{ required: true, validator: validatePass2, trigger: "change" }]
      },

      restForm: {
        userName: "",
        oldPassword: "",
        password: "",
        checkPass: ""
      }
    };
  },
  mounted() {
    this.getRoutesData(this.$route.matched);
  },
  methods: {
    getRoutesData(matched) {
      // console.log(matched);
      this.routes = [];
      for (let item of matched) {
        // 如果设置为true，则不会在breadcrumb面包屑中显示
        if (item.meta.noBreadcrumb) {
          continue;
        }
        const routeItem = {
          noRedirect: item.meta.icon, //面包屑导航中是否可以点击
          path: item.path === "/dashboard/analysis" ? "" : item.path || "/dashboard/analysis",
          breadcrumbName: item.meta.title || "首页"
        };

        // 当路由设置了该属性，则会高亮相对应的侧边栏。
        // 在某些场景非常有用，比如：一个的列表页路由为：/order/order-recycle
        // 点击订单进入详情页，这时候路由为/order/order-recycle-detail，想在侧边栏高亮订单列表的路由，就可以设置。
        if (item.meta.activeMenu) {
          const activeRouteItem = {
            ...routeItem,
            path: item.meta.activeMenu,
            breadcrumbName: item.meta.activeMenuTitle
          };
          this.routes.push(activeRouteItem);
        }
        this.routes.push(routeItem);
      }
    },
    loginOut() {
      logout();
      localStorage.clear();
      this.$store.commit("user/clearToken");
      this.$store.commit("user/clearUserInfo");
      /* 重新实例化vue-router对象 防止切换角色时addRoutes重复添加路由导致出现警告 */
      location.reload();
    },

    editPassword() {
      // this.restForm.userName = record.userName;
      this.resetVisible = true;
    },

    resetOk() {
      this.$refs.restForm.validate(valid => {
        if (valid) {
          this.confirmLoading = true;
          const requestData = {};
          requestData.userId = this.operationRecord.id;
          requestData.userPassword = hex_md5(this.restForm.oldPassword);
          requestData.resetPassword = hex_md5(this.restForm.password);

          editPassword(requestData)
            .then(() => {
              this.resetVisible = false;
              this.confirmLoading = false;
              this.$message.success("修改密码成功");
              this.initRestFormFields();
            })
            .catch(() => {
              this.confirmLoading = false;
            });
        } else {
          return false;
        }
      });
    },

    resetCancel() {
      this.resetVisible = false;
      this.$refs.restForm.clearValidate();
      this.initRestFormFields();
    },

    initRestFormFields() {
      this.restForm = {
        userName: "",
        oldPassword: "",
        password: "",
        checkPass: ""
      };
    }
  }
};
</script>

<style lang="less" scoped>
.header {
  background-color: white;
  padding: 12px 24px;
  margin: 0;
  box-sizing: border-box;
  width: 100%;
  z-index: 50;
  box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.1);

  .title {
    margin-top: 12px;
    font-size: 20px;
    line-height: 32px;
    font-weight: bold;
    color: rgba(0, 0, 0, 0.85);
  }

  .user-name {
    margin-left: 10px;
  }
}
</style>
