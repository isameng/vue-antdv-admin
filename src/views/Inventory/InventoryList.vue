<template>
  <div>
    <a-card class="theme-bg" :bordered="false">
      <div class="general-search-view">
        <div class="general-search-item">
          <div class="left-view">
            <a-input
              class="primary-input m-right-12"
              v-model="keyword"
              :allowClear="true"
              placeholder="商品名称/编码"
              @pressEnter="startSearch(true)"
            >
              <a-icon slot="prefix" type="search" />
            </a-input>

            <a-range-picker
              class="m-right-12"
              @change="enteringWarehouseTimeChange"
              :placeholder="['入库时间开始', '入库时间结束']"
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
              placeholder="库存状态"
              @change="stockStatusChange"
            >
              <a-select-option v-for="item in stockStatus" :key="item.value" :value="item.value">
                {{ item.key }}
              </a-select-option>
            </a-select>

            <a-select
              class="primary-select m-right-12"
              :allowClear="true"
              placeholder="所在仓库"
              @change="warehousesChange"
            >
              <a-select-option v-for="item in warehouses" :key="item.value" :value="item.value">
                {{ item.key }}
              </a-select-option>
            </a-select>

            <a-select
              class="primary-select m-right-12"
              :allowClear="true"
              placeholder="供应商"
              @change="suppliersChange"
            >
              <a-select-option v-for="item in suppliers" :key="item.value" :value="item.value">
                {{ item.key }}
              </a-select-option>
            </a-select>

            <a-button type="primary" :loading="searchLoading" @click="startSearch(true)">查询</a-button>
          </div>
        </div>
      </div>

      <a-table
        style="margin-top:12px"
        :pagination="false"
        :columns="columns"
        :data-source="data"
        :loading="tableLoading"
        :row-key="record => record.id"
      >
        <img slot="image" slot-scope="image" :src="image" width="100" />
        <template slot="productName" slot-scope="productName, record">
          <div>{{ productName }}</div>
          <div>{{ record.skuProperties }}</div>
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
import { listStocks } from "@/api/inventory";
const columns = [
  {
    title: "入库时间",
    dataIndex: "enteringWarehouseTime",
    align: "center"
  },
  {
    title: "商品信息",
    dataIndex: "productName",
    scopedSlots: { customRender: "productName" },
    align: "center"
  },
  {
    title: "品牌",
    dataIndex: "brandName",
    align: "center"
  },
  {
    title: "库存状态",
    dataIndex: "statusName",
    align: "center"
  },
  {
    title: "分类",
    dataIndex: "categoryName",
    align: "center"
  },
  {
    title: "库存编码",
    dataIndex: "serialNo",
    align: "center"
  },
  {
    title: "采购价",
    dataIndex: "purchasePrice",
    align: "center"
  },
  {
    title: "市场价",
    dataIndex: "marketPrice",
    align: "center"
  },
  {
    title: "成色",
    dataIndex: "quality",
    align: "center"
  },
  {
    title: "供应商",
    dataIndex: "supplierName",
    align: "center"
  },
  {
    title: "所在仓库",
    dataIndex: "warehouseName",
    align: "center"
  }
];
export default {
  name: "inventoryList",
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
      enteringWarehouseTime: "",
      searchStockStatus: "",
      searchCategories: [],
      searchWarehouses: "",
      searchSuppliers: "",
      warehouses: [],
      suppliers: [],
      stockStatus: [],
      categories: []
    };
  },
  mounted() {
    this.getCommonConditions();
    this.getListData();
  },
  methods: {
    getCommonConditions() {
      commonConditions("201,301,302,304").then(response => {
        console.log(response);
        const { warehouses, suppliers, stockStatus, categories } = response.details;
        this.warehouses = warehouses;
        this.suppliers = suppliers;
        this.stockStatus = stockStatus;
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
      listStocks({
        ...params,
        pageNum: this.pagination.pageNum,
        pageSize: this.pagination.pageSize
      })
        .then(response => {
          console.log(response);
          const { data, pageNum, pageSize, total } = response;
          this.pagination = { ...this.pagination, pageNum, pageSize, total };
          this.tableLoading = false;
          this.searchLoading = false;
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

      if (this.searchStockStatus) {
        requestData.statusIds = this.searchStockStatus;
      }

      if (this.searchWarehouses) {
        requestData.warehouseIds = this.searchWarehouses;
      }

      // if (this.searchSuppliers) {
      //   requestData.warehouseId = this.searchSuppliers;
      // }

      if (this.enteringWarehouseTime[0]) {
        requestData.startOfEnteringWarehouseTime = this.enteringWarehouseTime[0];
        requestData.endOfEnteringWarehouseTime = this.enteringWarehouseTime[1];
      }

      this.getListData(requestData);
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

    enteringWarehouseTimeChange(date, dateString) {
      console.log(date, dateString);
      this.enteringWarehouseTime = dateString;
    },

    categoriesChange(e) {
      console.log(e);
      this.searchCategories = e;
    },

    stockStatusChange(value) {
      console.log(value);
      this.searchStockStatus = value;
    },

    warehousesChange(value) {
      console.log(value);
      this.searchWarehouses = value;
    },

    suppliersChange(value) {
      console.log(value);
      this.searchSuppliers = value;
    }
  }
};
</script>
