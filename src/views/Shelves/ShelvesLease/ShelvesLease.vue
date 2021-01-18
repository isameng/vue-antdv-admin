<template>
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

          <a-range-picker class="m-right-12" @change="updateTimeChange" :placeholder="['修改时间开始', '修改时间结束']">
            <a-icon slot="suffixIcon" type="calendar" />
          </a-range-picker>

          <a-cascader
            class="big-select m-right-12"
            :options="categories"
            change-on-select
            @change="categoriesChange"
            placeholder="分类"
          />

          <a-select class="primary-select m-right-12" :allowClear="true" placeholder="品牌" @change="brandsChange">
            <a-select-option v-for="item in brands" :key="item.value" :value="item.value">
              {{ item.key }}
            </a-select-option>
          </a-select>

          <a-select
            class="primary-select m-right-12"
            :allowClear="true"
            placeholder="商品状态"
            @change="productStatusListChange"
          >
            <a-select-option v-for="item in rentProductStatusList" :key="item.value" :value="item.value">
              {{ item.key }}
            </a-select-option>
          </a-select>

          <a-select
            class="primary-select m-right-12"
            :allowClear="true"
            placeholder="买断状态"
            @change="productBuyoutStatusChange"
          >
            <a-select-option v-for="item in buyoutStatus" :key="item.value" :value="item.value">
              {{ item.lable }}
            </a-select-option>
          </a-select>
          <a-button type="primary" :loading="loading" @click="startSearch(true)">查询</a-button>
        </div>
        <div class="right-view">
          <a-button type="primary" @click="goPubulish">发布商品</a-button>
        </div>
      </div>
    </div>
    <a-spin :spinning="spinning">
      <a-table
        style="margin-top:12px"
        :pagination="false"
        :columns="columns"
        :data-source="data"
        :loading="tableLoading"
        :row-key="record => record.rentProductId"
      >
        <template slot="image" slot-scope="image">
          <img :src="image" width="76px" />
        </template>
        <div slot="brand" slot-scope="text, record">
          <span>{{ text }}</span>
          /
          <span>{{ record.category }}</span>
        </div>

        <div class="column-align-center" slot="buyoutPrice" slot-scope="text, record">
          <span>{{ text }}</span>
          <a-tag v-if="record.buyoutStatus" color="green">
            支持买断
          </a-tag>
          <a-tag v-else color="red">
            不支持买断
          </a-tag>
        </div>
        <div class="column-align-center" slot="createTime" slot-scope="text">
          <span>{{ text | formatTime4 }}</span>
        </div>
        <div class="column-align-center" slot="updateTime" slot-scope="text">
          <span>{{ text | formatTime4 }}</span>
        </div>
        <template slot="status" slot-scope="status, record">
          <a-switch :checked="status === 1" @click="statusClick(record.rentProductId, status, 'status')">
            <!-- <span slot="checkedChildren">下架</span>
            <span slot="unCheckedChildren">上架</span>-->
            <a-icon slot="checkedChildren" type="check" />
            <a-icon slot="unCheckedChildren" type="close" />
          </a-switch>
        </template>
        <div class="column-align-center" slot="operation" slot-scope="record">
          <a @click="editProduct(record.rentProductId)">编辑商品</a>
          <a-popconfirm placement="topRight" title="确定删除该商品吗?" @confirm="deleteProduct(record.rentProductId)">
            <a>删除商品</a>
          </a-popconfirm>
        </div>
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
    </a-spin>
  </a-card>
</template>
<script>
import { productList, productDelete, updateStatus } from "@/api/shelves-lease";
import { commonConditions } from "@/api/common";
const columns = [
  {
    title: "商品ID",
    dataIndex: "rentProductId",
    align: "center",
    width: 80
  },
  {
    title: "主图",
    dataIndex: "image",
    scopedSlots: { customRender: "image" },
    align: "center"
  },
  {
    title: "商品名称",
    dataIndex: "name"
  },
  {
    title: "品牌/分类",
    dataIndex: "brand",
    scopedSlots: { customRender: "brand" },
    align: "center"
  },
  {
    title: "押金",
    dataIndex: "depositAmount"
  },
  {
    title: "买断价",
    dataIndex: "buyoutPrice",
    scopedSlots: { customRender: "buyoutPrice" }
  },
  {
    title: "最短租期",
    dataIndex: "days"
  },
  {
    title: "剩余库存",
    dataIndex: "stockNum"
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
    title: "商品状态",
    dataIndex: "status",
    scopedSlots: { customRender: "status" },
    align: "center"
  },
  {
    title: "操作",
    scopedSlots: { customRender: "operation" },
    align: "center",
    width: 100
  }
];

export default {
  name: "ShelvesLease",

  data() {
    return {
      loading: false,
      tableLoading: false,
      spinning: false,
      data: [],
      pagination: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },
      columns,
      keyword: "",
      updateTime: "",
      searchBrand: "",
      searchCategories: [],
      searchProductStatus: "",
      searchBuyoutStatus: "",
      brands: [],
      rentProductStatusList: [],
      buyoutStatus: [
        {
          value: 1,
          lable: "支持买断"
        },
        {
          value: 0,
          lable: "不支持买断"
        }
      ],
      categories: [],
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
  //   if (to.name !== "shelvesRecycleManage") {
  //     this.$store.commit("noKeepAlive", from.name);
  //   }
  //   next();
  // },
  methods: {
    getCommonConditions() {
      commonConditions("201,202,203").then(response => {
        console.log(response);
        const { brands, rentProductStatusList, categories } = response.details;
        this.brands = brands;
        this.rentProductStatusList = rentProductStatusList;
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
          this.loading = false;
          this.data = data;
        })
        .catch(() => {
          this.tableLoading = false;
          this.loading = false;
        });
    },

    goPubulish() {
      this.$router.push({
        path: "/shelves/shelves-lease-release",
        query: { ...this.$route.query }
      });

      // //下面是打开一个新的tab页
      // const routeData = this.$router.resolve({
      //   path: "/order/order-recycle-detail",
      //   query: { id, navTheme: this.$route.query.navTheme }
      // });
      // window.open(routeData.href, "_blank");
    },

    editProduct(id) {
      this.$router.push({
        path: "/shelves/shelves-lease-release",
        query: { ...this.$route.query, rentProductId: id }
      });
    },

    deleteProduct(id) {
      productDelete(id).then(response => {
        console.log(response);
        this.$message.success("删除成功！");
        this.data.splice(
          this.data.findIndex(item => item.rentProductId === id),
          1
        );
      });
    },
    startSearch(isSearch = false) {
      const requestData = {};
      if (isSearch) {
        this.loading = true;
        this.pagination = { ...this.pagination, pageNum: 1, pageSize: 10 };
      }

      if (this.keyword) {
        requestData.keyword = this.keyword;
      }

      if (this.searchCategories.length > 0) {
        requestData.categoryIds = this.searchCategories.join();
      }

      if (this.searchBrand) {
        requestData.brandIds = this.searchBrand;
      }

      if (this.searchProductStatus) {
        requestData.productStatus = this.searchProductStatus;
      }

      if (this.searchBuyoutStatus || this.searchBuyoutStatus === 0) {
        requestData.buyoutStatus = this.searchBuyoutStatus === 1;
      }

      if (this.updateTime[0]) {
        requestData.startTimeOfUpdate = this.updateTime[0];
        requestData.endTimeOfUpdate = this.updateTime[1];
      }

      this.getListData(requestData);
    },

    updateCell(params = {}, responseCall, errorCall) {
      updateStatus(params)
        .then(response => {
          console.log(response);
          responseCall();
        })
        .catch(() => {
          errorCall();
        });
    },

    statusClick(key, status, dataIndex) {
      const that = this;
      this.$modal.confirm({
        title: status === 1 ? "确认下架该商品吗？" : "确认上架该商品吗？",
        okType: "danger",
        onOk() {
          return new Promise(resolve => {
            const dataSource = [...that.data];
            const target = dataSource.find(item => item.rentProductId === key);
            if (target) {
              that.updateCell(
                {
                  rentProductId: key,
                  status: status === 1 ? 0 : 1
                },
                () => {
                  target[dataIndex] = status === 1 ? 0 : 1;
                  that.data = dataSource;
                  that.$message.success("更改状态成功！");
                  resolve();
                },
                resolve
              );
            } else {
              that.$message.error("修改状态出现问题，请重试！");
              resolve();
            }
          });
        }
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
    },

    productStatusListChange(value) {
      console.log(value);
      this.searchProductStatus = value;
    },
    productBuyoutStatusChange(value) {
      console.log(value);
      this.searchBuyoutStatus = value;
    }
  }
};
</script>
