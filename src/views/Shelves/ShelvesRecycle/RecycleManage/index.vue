<template>
  <a-card class="theme-bg" :bordered="false">
    <a-steps :current="currentTab" :style="stepStyle">
      <a-step v-for="item in steps" :key="item.title" :title="item.title" />
    </a-steps>
    <div class="content">
      <keep-alive>
        <step1 v-if="currentTab === 0" @nextStep="nextStep" />
        <step2 v-if="currentTab === 1" @prevStep="prevStep" :product-id="productId" />
      </keep-alive>
    </div>
  </a-card>
</template>

<script>
import Step1 from "./Step1";
import Step2 from "./Step2";
export default {
  name: "shelvesRecycleRelease",
  components: {
    Step1,
    Step2
  },
  data() {
    return {
      currentTab: 0,
      steps: [
        {
          title: "基本信息"
        },
        {
          title: "价格库存"
        }
      ],
      stepStyle: {
        marginBottom: "40px",
        padding: "0 400px"
      },
      productId: ""
    };
  },
  beforeRouteEnter(to, from, next) {
    if (to.query.recycleProductId) {
      to.meta.title = "编辑商品";
    } else {
      to.meta.title = "发布商品";
    }
    next();
  },
  methods: {
    nextStep(productId) {
      console.log("nextStep_productId", productId);
      if (this.currentTab < 1) {
        this.currentTab += 1;
      }
      this.productId = productId;
    },
    prevStep() {
      if (this.currentTab > 0) {
        this.currentTab -= 1;
      }
    }
  }
};
</script>
