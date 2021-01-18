<template>
  <div class="login-form">
    <div class="h1">探物后台</div>
    <a-form :form="form" @submit="handleSubmit">
      <a-form-item>
        <a-input
          v-decorator="['userName', { rules: [{ required: true, message: '请输入用户名!' }] }]"
          placeholder="账号"
          size="large"
        >
          <a-icon slot="prefix" type="user" style="color: rgba(0,0,0,.55);" />
        </a-input>
      </a-form-item>
      <a-form-item>
        <a-input-password
          v-decorator="['password', { rules: [{ required: true, message: '请输入密码!' }] }]"
          placeholder="密码"
          size="large"
        >
          <a-icon slot="prefix" type="lock" style="color: rgba(0,0,0,.55)" />
        </a-input-password>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" size="large" html-type="submit" class="login-form-button">登录</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import { hex_md5 } from "@/utils/md5";

const key = "loaddingKey";
export default {
  beforeCreate() {
    this.form = this.$form.createForm(this);
  },
  methods: {
    ...mapActions("user", ["login"]),
    ...mapActions("permission", ["fetchPermission"]),

    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields(async (err, values) => {
        if (!err) {
          this.$message.loading({ content: "登录中...", key });
          const userInfo = await this.login({
            userName: values.userName,
            userPassword: hex_md5(values.password)
          });
          if (userInfo && userInfo.userName) {
            const permissionList = await this.fetchPermission();
            if (permissionList) {
              // this.$message.success("登录成功！");
              this.$message.success({ content: "登录成功！", key, duration: 2 });
              this.$router.replace("/");
            } else {
              this.$message.error("获取权限失败，请重新登录");
            }
          } else {
            this.$message.error("获取用户信息失败，请重新登录");
          }
        }
      });
    }
  }
};
</script>
<style>
.h1 {
  color: #eeeeee;
  margin: 0 auto 40px;
  font-size: 26px;
  text-align: center;
  font-weight: bold;
}
.login-form {
  position: relative;
  width: 520px;
  max-width: 100%;
  padding: 200px 35px 0;
  margin: 0 auto;
  overflow: hidden;
}

.login-form-button {
  width: 100%;
}
</style>
