<template>
  <a-card class="theme-bg" :bordered="false">
    <div class="general-search-view">
      <div class="row-align-center m-bottom-12">
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
          <a-select-option v-for="item in brands" :key="item.value" :value="item.value">{{ item.key }}</a-select-option>
        </a-select>

        <a-select
          class="primary-select m-right-12"
          :allowClear="true"
          placeholder="商品状态"
          @change="productStatusListChange"
        >
          <a-select-option v-for="item in idleProductStatusList" :key="item.value" :value="item.value">
            {{ item.key }}
          </a-select-option>
        </a-select>
      </div>
      <div class="general-search-item">
        <div class="left-view">
          <span class="m-right-12">市场回收价</span>
          <a-input class="small-input m-right-12" v-model="startPrice" :allowClear="true" />
          <span class="m-right-12">~</span>
          <a-input class="small-input m-right-12" v-model="endPrice" :allowClear="true" />
          <a-button type="primary" :loading="loading" @click="startSearch(true)">查询</a-button>
        </div>

        <div class="right-view">
          <!-- <a-button type="primary">商品关联</a-button> -->
          <a-button type="primary" class="m-left-12" @click="goPubulish">发布商品</a-button>
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
        :row-key="record => record.recycleProductId"
      >
        <template slot="image" slot-scope="image">
          <img :src="image" width="76px" />
        </template>
        <div slot="brand" slot-scope="text, record">
          <span>{{ text }}</span>
          /
          <span>{{ record.category }}</span>
        </div>
        <template slot="recycleMarketPrice" slot-scope="text, record">
          <editable-cell
            :text="String(text)"
            @change="onCellChange(record.recycleProductId, 'recycleMarketPrice', $event)"
          />
        </template>
        <template slot="quantity" slot-scope="text, record">
          <editable-cell :text="String(text)" @change="onCellChange(record.recycleProductId, 'quantity', $event)" />
        </template>
        <div class="column-align-center" slot="createTime" slot-scope="text">
          <span>{{ text | formatTime4 }}</span>
        </div>
        <div class="column-align-center" slot="updateTime" slot-scope="text">
          <span>{{ text | formatTime4 }}</span>
        </div>
        <template slot="status" slot-scope="status, record">
          <a-switch :checked="status === 1" @click="statusClick(record.recycleProductId, status, 'status')">
            <!-- <span slot="checkedChildren">下架</span>
            <span slot="unCheckedChildren">上架</span>-->
            <a-icon slot="checkedChildren" type="check" />
            <a-icon slot="unCheckedChildren" type="close" />
          </a-switch>
        </template>
        <div class="column-align-center" slot="operation" slot-scope="record">
          <a @click="editProduct(record.recycleProductId)">编辑商品</a>
          <a-popconfirm
            placement="topRight"
            title="确定删除该商品吗?"
            @confirm="deleteProduct(record.recycleProductId)"
          >
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
import { productList, productDelete, productUpdateProps } from "@/api/shelves-recycle";
import { commonConditions } from "@/api/common";
import EditableCell from "@/components/EditableCell";
const columns = [
  {
    title: "商品ID",
    dataIndex: "recycleProductId",
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
    title: "市场回收价",
    dataIndex: "recycleMarketPrice",
    scopedSlots: { customRender: "recycleMarketPrice" }
  },
  {
    title: "已回收量",
    dataIndex: "recycleNumCount"
  },
  {
    title: "上架数量",
    dataIndex: "quantity",
    scopedSlots: { customRender: "quantity" }
  },
  {
    title: "剩余库存",
    dataIndex: "stockNumCount"
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
  name: "shelvesRecycle",
  components: {
    EditableCell
  },

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
      startPrice: "",
      endPrice: "",
      keyword: "",
      updateTime: "",
      searchBrand: "",
      searchCategories: [],
      searchProductStatus: "",
      brands: [],
      idleProductStatusList: [],
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
      commonConditions("201,202,104").then(response => {
        console.log(response);
        const { brands, idleProductStatusList, categories } = response.details;
        this.brands = brands;
        this.idleProductStatusList = idleProductStatusList;
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
        path: "/shelves/shelves-recycle-release",
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
        path: "/shelves/shelves-recycle-release",
        query: { ...this.$route.query, recycleProductId: id }
      });
    },

    deleteProduct(id) {
      productDelete(id).then(response => {
        console.log(response);
        this.data.splice(
          this.data.findIndex(item => item.recycleProductId === id),
          1
        );
      });
    },
    startSearch(isSearch = false) {
      const requestData = {};
      if (this.startPrice || this.startPrice === 0) {
        if (this.endPrice || this.endPrice === 0) {
          requestData.priceOfStart = this.startPrice;
          requestData.priceOfEnd = this.endPrice;
        } else {
          this.$message.error("结束价格不能为空");
          return;
        }
      } else if (this.endPrice || this.endPrice === 0) {
        if (this.startPrice || this.startPrice === 0) {
          requestData.priceOfStart = this.startPrice;
          requestData.priceOfEnd = this.endPrice;
        } else {
          this.$message.error("开始价格不能为空");
          return;
        }
      }
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
        requestData.status = this.searchProductStatus;
      }

      if (this.updateTime[0]) {
        requestData.startTimeOfUpdate = this.updateTime[0];
        requestData.endTimeOfUpdate = this.updateTime[1];
      }

      this.getListData(requestData);
    },

    updateCell(params = {}, responseCall, errorCall) {
      productUpdateProps(params)
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
            const target = dataSource.find(item => item.recycleProductId === key);
            if (target) {
              that.updateCell(
                {
                  recycleProductId: key,
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

    onCellChange(key, dataIndex, value) {
      this.spinning = true;
      const dataSource = [...this.data];
      const target = dataSource.find(item => item.recycleProductId === key);
      if (target) {
        this.updateCell(
          {
            recycleProductId: key,
            [dataIndex]: value
          },
          () => {
            target[dataIndex] = value;
            this.data = dataSource;
            this.spinning = false;
          },
          () => {
            this.spinning = false;
          }
        );
      } else {
        this.$message.error("修改状态出现问题，请重试！");
        this.spinning = false;
      }
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
    }
  }
};
</script>
