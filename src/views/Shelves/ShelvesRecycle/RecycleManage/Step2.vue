<template>
  <div>
    <a-skeleton :loading="skeletonLoading">
      <!-- bordered -->
      <a-descriptions class="content">
        <a-descriptions-item label="商品名称">{{ detailsData.name }}</a-descriptions-item>
        <a-descriptions-item label="商品编号">{{ detailsData.serialNo }}</a-descriptions-item>
        <a-descriptions-item label="品牌">{{ detailsData.brandName }}</a-descriptions-item>
        <a-descriptions-item label="商品分类">{{ detailsData.categoryName }}</a-descriptions-item>
        <a-descriptions-item label="市场回收价">
          <a-input v-model="marketPrice" :disabled="loading" />
        </a-descriptions-item>
        <a-descriptions-item label="上架数量">
          <a-input v-model="storeNum" :disabled="loading" />
        </a-descriptions-item>
      </a-descriptions>

      <a-table
        style="margin-top:12px"
        :pagination="false"
        :columns="columns"
        :data-source="data"
        :row-key="record => record.id"
      >
        <img slot="image" slot-scope="image" :src="image" width="100" />

        <template slot="props" slot-scope="props">
          <span v-if="!props.length">无规格</span>
          <div v-else v-for="(item, index) in props" :key="index">{{ item.propName }}：{{ item.propValue }}</div>
        </template>
      </a-table>

      <div class="steps-action">
        <a-button @click="prevStep" :disabled="loading">上一步</a-button>
        <a-button style="margin-left: 24px" :loading="loading" type="primary" @click="nextStep">提交</a-button>
      </div>
    </a-skeleton>
  </div>
</template>

<script>
import { productInfo } from "@/api/product";
import { productSaveOrUpdate } from "@/api/shelves-recycle";
import { closeToolItem, onRefreshAndDelete } from "@/utils/toolBarUtils";
import { mapGetters } from "vuex";
const columns = [
  {
    title: "序号",
    dataIndex: "id",
    align: "center"
  },
  {
    title: "主图",
    dataIndex: "image",
    scopedSlots: { customRender: "image" },
    align: "center"
  },
  {
    title: "规格",
    dataIndex: "props",
    scopedSlots: { customRender: "props" },
    align: "center"
  },
  {
    title: "剩余库存",
    dataIndex: "stockNum",
    align: "center"
  }
];

export default {
  data() {
    return {
      formItemLayout: {
        labelCol: { span: 8 },
        wrapperCol: { span: 6 }
      },
      loading: false,
      skeletonLoading: false,
      columns,
      data: [],
      detailsData: {},
      marketPrice: "",
      storeNum: ""
    };
  },
  // mounted() {
  //   this.getProductInfo();
  // },

  props: ["productId"],

  activated() {
    this.getProductInfo();
  },

  computed: {
    // release() {
    //   return this.$store.state.shelvesRecycle.release;
    // },
    ...mapGetters("tagsView", {
      toolDatas: "getToolData"
    })
  },

  methods: {
    release() {
      return JSON.parse(localStorage.getItem(`shelvesRecycleData${this.$route.query.recycleProductId || ""}`));
    },
    getProductInfo() {
      this.skeletonLoading = true;
      productInfo(this.productId).then(response => {
        this.skeletonLoading = false;
        console.log(response);
        this.detailsData = response.details;
        this.data = response.details.skus;
        this.marketPrice = this.release().recycleMarketPrice;
        this.storeNum = this.release().quantity;
      });
    },
    nextStep() {
      if (!this.marketPrice) {
        this.$message.error("回收市场价不能为空");
        return;
      }
      if (!this.storeNum) {
        this.$message.error("上架数量不能为空");
        return;
      }
      this.loading = true;

      const requestData = {
        image: this.release().image,
        productId: this.release().productId,
        quoteQuestionIds: this.release().questions,
        quoteTemplateId: this.release().quoteTemplateId,
        recycleMarketPrice: this.marketPrice,
        quantity: this.storeNum,
        status: this.release().status,
        serialNoPrefix: this.detailsData.serialNoPrefix
      };

      if (this.$route.query.recycleProductId) {
        requestData.recycleProductId = this.$route.query.recycleProductId;
      }

      productSaveOrUpdate(requestData)
        .then(response => {
          console.log(response);
          this.loading = false;
          localStorage.removeItem(`shelvesRecycleData${this.$route.query.recycleProductId || ""}`);
          const closeToolbar = this.toolDatas.find(item => item.detail === this.$route.fullPath);
          const refreshToolbar = this.toolDatas.find(item => item.detail === "/shelves/shelves-recycle");
          if (refreshToolbar) {
            onRefreshAndDelete(refreshToolbar, closeToolbar);
          } else {
            closeToolItem(closeToolbar);
            this.$router.push({
              path: "/shelves/shelves-recycle"
            });
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
    prevStep() {
      this.$emit("prevStep");
    }
  }
};
</script>

<style>
.content {
  padding: 0 60px;
}
.steps-action {
  float: right;
  margin-top: 36px;
}

.primary-title {
  color: rgba(0, 0, 0, 0.85);
  font-size: 15px;
}
</style>
