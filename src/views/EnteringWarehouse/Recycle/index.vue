<template>
  <div>
    <a-card class="theme-bg" :bordered="false">
      <a-radio-group default-value="a" button-style="solid" @change="change">
        <a-radio-button value="a">入库列表</a-radio-button>
        <a-radio-button value="b">入库记录</a-radio-button>
      </a-radio-group>
    </a-card>
    <a-card class="theme-bg" style="margin-top:12px" :bordered="false">
      <keep-alive>
        <List v-if="currentTab === 'a'" />
        <History v-if="currentTab === 'b'" />
      </keep-alive>
    </a-card>
  </div>
</template>

<script>
import List from "./List";
import History from "./History";
export default {
  name: "recycle",
  components: {
    List,
    History
  },
  data() {
    return {
      currentTab: "a"
    };
  },

  methods: {
    change(e) {
      this.currentTab = e.target.value;
    },
    nextStep() {
      if (this.currentTab < 1) {
        this.currentTab += 1;
      }
    },
    prevStep() {
      if (this.currentTab > 0) {
        this.currentTab -= 1;
      }
    }
  }
};
</script>
