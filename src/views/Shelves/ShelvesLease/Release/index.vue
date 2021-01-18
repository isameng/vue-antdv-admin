<template>
  <a-card class="theme-bg" :bordered="false">
    <a-steps :current="currentTab" :style="stepStyle">
      <a-step v-for="item in steps" :key="item.title" :title="item.title" />
    </a-steps>
    <div class="content">
      <keep-alive>
        <step1 v-if="currentTab === 0" @nextStep="nextStep" :productData="step1Data" />
        <step2 v-if="currentTab === 1" @prevStep="prevStep" @nextStep="nextStep" :productData="step2Data" />
        <step3 v-if="currentTab === 2" @prevStep="prevStep" @nextStep="nextStep" :productData="step3Data" />
        <step4 v-if="currentTab === 3" @prevStep="prevStep" :productData="step4Data"/>
      </keep-alive>
    </div>
  </a-card>
</template>

<script>
import { productDetail } from "@/api/shelves-lease";

import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
export default {
  name: "shelvesLeaseRelease",
  components: {
    Step1,
    Step2,
    Step3,
    Step4
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
        },
        {
          title: "扩展信息"
        },
        {
          title: "商品详情"
        }
      ],
      stepStyle: {
        marginBottom: "40px",
        padding: "0 400px"
      },
      productId: "",
      productData: {},
      step1Data: {},
      step2Data: {},
      step3Data: {},
      step4Data: {}
    };
  },
  beforeRouteEnter(to, from, next) {
    if (to.query.rentProductId) {
      to.meta.title = "编辑商品";
    } else {
      to.meta.title = "发布商品";
    }
    next();
  },

  mounted() {
    if (this.$route.query.rentProductId) {
      this.getProductData(this.$route.query.rentProductId);
    }
  },
  methods: {
    getProductData(rentProductId) {
      productDetail(rentProductId).then(response => {
        const { details } = response;
        this.productData = details;

        const step1Data = {
          status: details.status,
          productName: details.name,
          rentTimes: details.rentTimeIds,
          customizeRentTime: details.customizeRentTime,
          freightTemplateId: details.freightTemplateId || undefined,
          alipayPreAuthCategoryCode: details.alipayPreAuthCategoryCode,
          desc: details.desc,
          accessories: details.accessories
        };

        const step2Data = {
          skuIds: details.skuIds,
          rentProductId: details.rentProductId,
          productId: details.productId,
          enableBuyout: details.enableBuyout,
          enableRenew: details.enableRenew,
          enableVirtualStock: details.enableVirtualStock,
          categoryId: details.categoryIds,
          brandId: details.brandId
        };

        const step3Data = {
          tags: details.tags,
          regulationIds: details.regulationIds,
          channelIds: details.channelIds
        };

        this.step1Data = Object.assign({}, step1Data);
        this.step2Data = Object.assign({}, step2Data);
        this.step3Data = Object.assign({}, step3Data);
        this.step4Data = Object.assign({}, {media: details.media});
      });
    },
    nextStep() {
      // console.log("nextStep_productId", productId);
      if (this.currentTab < 3) {
        this.currentTab += 1;
      }
      // this.productId = productId;
    },
    prevStep() {
      if (this.currentTab > 0) {
        this.currentTab -= 1;
      }
    }
  }
};
</script>
