<template>
  <a-result
    status="403"
    title="403"
    sub-title="你没有权限访问该页面，具体请咨询斌爷."
  >
    <template #extra>
      <a-button type="primary" @click="backHome">
        返回首页
      </a-button>
    </template>
  </a-result>
</template>
<script>
export default {
  data() {
    return {};
  },
  methods: {
    backHome() {
      this.$router.replace("/");
    }
  }
};
</script>
