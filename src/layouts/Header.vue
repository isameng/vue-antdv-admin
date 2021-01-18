<template>
  <div class="top-view space-between-align-center">
    <div class="row-align-center">
      <img src="../assets/logo.png" width="32px" style="margin-right:10px" />
      <span style="font-size:15px">探物</span>
    </div>
    <div class="row-align-center" style="float: right">
      <a-dropdown>
        <div>
          <a-avatar size="small" icon="user" />
          <span class="user-name">user</span>
        </div>
        <a-menu style="width:140px" slot="overlay" @click="localeChange">
          <a-menu-item key="exit" @click="loginOut">
            <a-icon type="logout" />退出登录
          </a-menu-item>
        </a-menu>
      </a-dropdown>

      <!-- <a-dropdown>
            <div>
              <a-icon type="global" style="color:#ffffff; fontSize:16px" />
            </div>
            <a-menu
              style="width:140px"
              slot="overlay"
              @click="localeChange"
              :selectedKeys="[this.$route.query.locale || 'zhCN']"
            >
              <a-menu-item key="zhCN">中文</a-menu-item>
              <a-menu-item key="enUS">英文</a-menu-item>
            </a-menu>
      </a-dropdown>-->
    </div>
  </div>
</template>
<script>
export default {
  methods: {
    localeChange() {},
    // localeChange({ key }) {
    //   this.$router.push({ query: { ...this.$route.query, locale: key } });
    // }

    loginOut() {
      sessionStorage.removeItem("token");
      sessionStorage["authority"] = ["guest"];
      this.$router.replace("/user/login");
    }
  }
};
</script>

<style scoped>
.top-view {
  background-color: #001529;
  width: 100%;
  height: 48px;
  line-height: 48px;
  padding: 0 30px;
  color: #ffffff;
  position: fixed;
  left: 0;
  z-index: 100;
}

.user-name {
  margin-left: 10px;
}

/* .nav-theme-dark .logo {
  color: red;
} */
</style>
