<template>
  <div>
    <a-card class="theme-bg" :bordered="false">
      <div class="general-search-view">
        <div class="general-search-item">
          <div class="left-view">
            <a-input
              class="primary-input m-right-12"
              v-model="keyword"
              placeholder="商品名称/ID"
              :allowClear="true"
              @pressEnter="startSearch(true)"
            >
              <a-icon slot="prefix" type="search" />
            </a-input>
            <a-range-picker
              class="m-right-12"
              @change="updateTimeChange"
              :placeholder="['修改时间开始', '修改时间结束']"
            >
              <a-icon slot="suffixIcon" type="calendar" />
            </a-range-picker>

            <a-cascader
              class="big-select m-right-12"
              :options="categories"
              change-on-select
              @change="categoriesChange"
              placeholder="分类"
            />

            <a-select
              class="primary-select m-right-12"
              :allowClear="true"
              placeholder="品牌"
              @change="brandsChange"
            >
              <a-select-option
                v-for="item in brands"
                :key="item.value"
                :value="item.value"
                >{{ item.key }}</a-select-option
              >
            </a-select>

            <a-button
              type="primary"
              :loading="searchLoading"
              @click="startSearch(true)"
              >查询</a-button
            >
          </div>

          <!-- <div class="right-view">
            <a-button type="primary">创建商品</a-button>
          </div> -->
        </div>
      </div>

      <a-table
        style="margin-top:12px"
        :pagination="false"
        :columns="columns"
        :data-source="data"
        :loading="tableLoading"
        :row-key="record => record.productId"
      >
        <img slot="image" slot-scope="image" :src="image" width="100" />
        <div
          class="column-align-center"
          slot="category"
          slot-scope="category, record"
        >
          <span>{{ record.brand }}</span>
          <span>{{ category }}</span>
        </div>

        <template slot="properties" slot-scope="properties">
          <span v-if="!properties.length">无规格</span>
          <div v-else v-for="(item, index) in properties" :key="index">
            {{ item.propName }}：{{ item.propValues }}
          </div>
        </template>
        <template slot="createTime" slot-scope="text">
          <span>{{ text | formatTime4 }}</span>
        </template>
        <template slot="updateTime" slot-scope="text">
          <span>{{ text | formatTime4 }}</span>
        </template>
        <div class="column-align-center" slot="operation" slot-scope="record">
          <a @click="goDetail(record.productId)">商品明细</a>
        </div>
        <template slot="recycleNumCountTitle">
          <QuestionPopoverSpan
            content="回收总量"
            popoverContent="通过回收渠道入库成功的商品数量之和"
          />
        </template>
        <template slot="sellNumCountTitle">
          <QuestionPopoverSpan
            content="销售总量"
            popoverContent="通过销售出库成功的商品数量之和"
          />
        </template>
        <template slot="stockNumCountTitle">
          <QuestionPopoverSpan
            content="剩余库存"
            popoverContent="该商品当前在库数量之和"
          />
        </template>
      </a-table>
      <a-pagination
        class="pagination"
        show-size-changer
        :current="pagination.pageNum"
        :total="pagination.total"
        :showTotal="total => `共 ${total} 条数据`"
        @showSizeChange="onShowSizeChange"
        @change="paginationChange"
      />
    </a-card>
  </div>
</template>

<script>
import { commonConditions } from "@/api/common";
import { productList } from "@/api/product";
import QuestionPopoverSpan from "@/components/QuestionPopoverSpan";
const columns = [
  {
    title: "商品ID",
    dataIndex: "productId",
    align: "center",
    width: 80
  },
  {
    title: "图片",
    dataIndex: "image",
    scopedSlots: { customRender: "image" },
    align: "center"
  },
  {
    title: "商品名称",
    dataIndex: "name",
    align: "center"
  },
  {
    title: "商品分类",
    dataIndex: "category",
    scopedSlots: { customRender: "category" },
    align: "center"
  },
  {
    title: "商品规格",
    dataIndex: "properties",
    scopedSlots: { customRender: "properties" },
    align: "center"
  },
  {
    dataIndex: "recycleNumCount",
    slots: { title: "recycleNumCountTitle" },
    align: "center"
  },
  {
    dataIndex: "sellNumCount",
    slots: { title: "sellNumCountTitle" },
    align: "center"
  },
  {
    dataIndex: "stockNumCount",
    slots: { title: "stockNumCountTitle" },
    align: "center"
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
    scopedSlots: { customRender: "createTime" },
    align: "center"
  },
  {
    title: "修改时间",
    dataIndex: "updateTime",
    scopedSlots: { customRender: "updateTime" },
    align: "center"
  },
  {
    title: "操作",
    scopedSlots: { customRender: "operation" }
  }
];
export default {
  name: "productList",
  components: {
    QuestionPopoverSpan
  },
  data() {
    return {
      searchLoading: false,
      tableLoading: false,
      data: [],
      pagination: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },
      columns,
      keyword: "",
      searchBrand: "",
      updateTime: "",
      searchCategories: [],
      brands: [],
      categories: []
    };
  },
  mounted() {
    this.getCommonConditions();
    this.getListData();
  },
  activated() {
    console.log("activated");
  },
  // beforeRouteLeave(to, from, next) {
  //   console.log(to.name);
  //   if (to.name !== "productDetailList") {
  //     this.$store.commit("noKeepAlive", from.name);
  //   }
  //   next();
  // },
  methods: {
    getCommonConditions() {
      commonConditions("201,202").then(response => {
        console.log(response);
        const { brands, categories } = response.details;
        this.brands = brands;
        this.categories.push(...this.getCategories(categories));
      });
    },

    getCategories(categories) {
      const datas = [];
      for (let item of categories) {
        const newItem = { ...item, label: item.key };
        delete newItem.children;
        // newItem.label = item.key;
        if (item.children.length > 0) {
          newItem.children = this.getCategories(item.children);
        }
        datas.push(newItem);
      }
      return datas;
    },

    getListData(params = {}) {
      this.tableLoading = true;
      productList({
        pageNum: this.pagination.pageNum,
        pageSize: this.pagination.pageSize,
        ...params
      })
        .then(response => {
          console.log(response);
          const { data, pageNum, pageSize, total } = response;
          this.pagination = { ...this.pagination, pageNum, pageSize, total };
          this.tableLoading = false;
          this.searchLoading = false;
          for (var item of data) {
            if (item.properties && item.properties.length) {
              for (var cItem of item.properties) {
                cItem.propValues = cItem.propValues.join();
              }
            }
          }
          this.data = data;
        })
        .catch(() => {
          this.tableLoading = false;
          this.searchLoading = false;
        });
    },
    startSearch(isSearch) {
      if (isSearch) {
        this.searchLoading = true;
        this.pagination = { ...this.pagination, pageNum: 1, pageSize: 10 };
      }

      const requestData = {};
      if (this.keyword) {
        requestData.keyword = this.keyword;
      }
      if (this.searchCategories.length > 0) {
        requestData.categoryIds = this.searchCategories.join();
      }

      if (this.searchBrand) {
        requestData.brandIds = this.searchBrand;
      }
      if (this.updateTime[0]) {
        requestData.startTimeOfUpdate = this.updateTime[0];
        requestData.endTimeOfUpdate = this.updateTime[1];
      }

      this.getListData(requestData);
    },
    goDetail(productId) {
      this.$router.push({
        path: "/product/product-detail-list",
        query: { productId, navTheme: this.$route.query.navTheme }
      });
    },
    onShowSizeChange(pageNum, pageSize) {
      // console.log(pageNum, pageSize);
      this.pagination = { ...this.pagination, pageNum, pageSize };
      this.startSearch();
    },
    paginationChange(pageNum, pageSize) {
      // console.log(pageNum, pageSize);
      this.pagination = { ...this.pagination, pageNum, pageSize };
      this.startSearch();
    },
    updateTimeChange(date, dateString) {
      console.log(date, dateString);
      this.updateTime = dateString;
    },

    categoriesChange(e) {
      console.log(e);
      this.searchCategories = e;
    },

    brandsChange(value) {
      console.log(value);
      this.searchBrand = value;
    }
  }
};
</script>
