<template>
  <div>
    <div class="general-search-view">
      <div class="general-search-item">
        <div class="left-view">
          <a-input
            class="primary-input m-right-12"
            v-model="keyword"
            placeholder="订单编号/商品名称"
            :allowClear="true"
            @pressEnter="startSearch(true)"
          >
            <a-icon slot="prefix" type="search" />
          </a-input>

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
            @change="enteringStatusChange"
          >
            <a-select-option
              v-for="item in recycleEnteringStatus"
              :key="item.value"
              :value="item.value"
              >{{ item.key }}</a-select-option
            >
          </a-select>

          <a-select
            class="primary-select m-right-12"
            :allowClear="true"
            placeholder="所在仓库"
            @change="warehousesChange"
          >
            <a-select-option
              v-for="item in warehouses"
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

        <div class="right-view">
          <!-- <a-button type="primary">下载</a-button>
          <a-button type="primary" class="m-left-12">上传</a-button>
          <a-button type="primary" class="m-left-12">打印条码</a-button>-->
          <a-button type="primary" class="m-left-12" @click="enterWareHouse"
            >入库</a-button
          >
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
      :row-selection="{
        selectedRowKeys: selectedRowKeys,
        onChange: onSelectChange,
        getCheckboxProps: onCheckboxProps
      }"
    >
      <template slot="orderNumber" slot-scope="text">
        <a @click="copy(text)">{{ text }}</a>
      </template>
      <template slot="skuList" slot-scope="skuList, record">
        <span v-if="record.statusId === 1">{{
          skuList.find(item => item.id === record.skuId).properties
        }}</span>
        <a-select
          v-else
          style="width: 180px"
          :placeholder="record.skuId ? '' : '无规格'"
          :default-value="record.skuId"
          @change="onCellChange(record.id, 'skuId', $event)"
        >
          <a-select-option
            v-for="(item, index) in skuList"
            :key="index"
            :value="item.id"
            >{{ item.properties }}</a-select-option
          >
        </a-select>
      </template>
      <template slot="quality" slot-scope="text, record">
        <span v-if="record.statusId === 1">{{ text }}</span>
        <editable-cell
          v-else
          :text="String(text)"
          @change="onCellChange(record.id, 'quality', $event)"
        />
      </template>

      <template slot="statusName" slot-scope="text, record">
        <a-badge v-if="record.statusId === 1" status="success" text="已入库" />
        <a-badge
          v-if="record.statusId === 0"
          status="processing"
          text="待入库"
        />
      </template>

      <!-- <div class="column-align-center" slot="image" slot-scope="image">
        <img :src="image" width="76px" />
      </div>-->

      <template slot="actualRecyclePriceTitle">
        <QuestionPopoverSpan
          content="实际回收价"
          popoverContent="回收订单的最终成交价"
        />
      </template>

      <template slot="marketRecyclePriceTitle">
        <QuestionPopoverSpan
          content="市场回收价"
          popoverContent="回收商品上架填写的市场回收价，用于计算最终实际回收价"
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

    <a-modal
      class="modal-form"
      title="确认入库"
      :visible="visible"
      :confirm-loading="confirmLoading"
      :maskClosable="false"
      okText="入库"
      @ok="enterSubmit"
      @cancel="
        () => {
          this.visible = false;
        }
      "
    >
      <div class="modal-form-item-view row-align-center">
        <span class="modal-form-item-title">入库仓库：</span>
        <!-- <a-select style="width: 200px" placeholder="请选择仓库" @change="warehouseChange">
          <a-select-option value="0">Jack</a-select-option>
          <a-select-option value="1">Lucy</a-select-option>
        </a-select>-->

        <a-select
          class="modal-form-select"
          placeholder="请选择仓库"
          v-model="warehouseId"
        >
          <a-select-option
            v-for="item in warehouses"
            :key="item.value"
            :value="item.value"
            >{{ item.key }}</a-select-option
          >
        </a-select>
      </div>
      <div class="modal-form-item-view row-align-center">
        <span class="modal-form-item-title">入库数量：</span>
        <div>{{ this.targets.length }}</div>
      </div>

      <div class="modal-form-item-view flexbox">
        <span class="modal-form-item-title m-right-12">备注：</span>
        <a-textarea
          class="modal-form-input"
          v-model="remark"
          placeholder="备注"
          :auto-size="{ minRows: 3, maxRows: 5 }"
        />
      </div>
    </a-modal>
  </div>
</template>

<script>
import { listStockRecycles, enterWarehouse } from "@/api/warehouse";
import { commonConditions } from "@/api/common";
import EditableCell from "../../../components/EditableCell";
import QuestionPopoverSpan from "@/components/QuestionPopoverSpan";
const columns = [
  {
    title: "回收订单号",
    dataIndex: "orderNumber",
    scopedSlots: { customRender: "orderNumber" },
    align: "center"
  },
  {
    title: "商品名称",
    dataIndex: "productName",
    align: "center"
  },
  {
    title: "商品分类",
    dataIndex: "categoryName",
    align: "center"
  },
  {
    title: "商品规格",
    dataIndex: "skuList",
    scopedSlots: { customRender: "skuList" },
    align: "center"
  },
  {
    title: "库存编码",
    dataIndex: "serialNo",
    align: "center"
  },
  {
    title: "入库状态",
    dataIndex: "statusName",
    scopedSlots: { customRender: "statusName" },
    align: "center"
  },
  {
    dataIndex: "actualRecyclePrice",
    slots: { title: "actualRecyclePriceTitle" },
    align: "center"
  },
  {
    dataIndex: "marketRecyclePrice",
    slots: { title: "marketRecyclePriceTitle" },
    align: "center"
  },
  {
    title: "成色",
    dataIndex: "quality",
    scopedSlots: { customRender: "quality" }
  },
  // {
  //   title: "图片",
  //   dataIndex: "image",
  //   scopedSlots: { customRender: "image" },
  //   align: "center"
  // },
  {
    title: "入库仓库",
    dataIndex: "warehouseName",
    align: "center"
  }
];
export default {
  components: {
    EditableCell,
    QuestionPopoverSpan
  },

  data() {
    return {
      searchLoading: false,
      tableLoading: false,
      confirmLoading: false,
      visible: false,
      data: [],
      pagination: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },
      columns,
      startPrice: 1,
      endPrice: 10,
      currentPage: 1,
      selectedRowKeys: [],

      targets: [], //勾选好的列表
      remark: "",
      warehouseId: "",

      keyword: "",
      searchEnteringStatus: "",
      searchCategories: [],
      searchWarehouses: "",
      warehouses: [],
      recycleEnteringStatus: [],
      categories: []
    };
  },

  mounted() {
    console.log("mounted");
    this.getCommonConditions();
    this.getListData();
  },
  activated() {
    console.log("activated");
  },
  methods: {
    getCommonConditions() {
      commonConditions("201,301,303").then(response => {
        console.log(response);
        const {
          warehouses,
          recycleEnteringStatus,
          categories
        } = response.details;
        this.warehouses = warehouses;
        this.recycleEnteringStatus = recycleEnteringStatus;
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
      listStockRecycles({
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
    enterWareHouse() {
      const dataSource = [...this.data];
      const targets = dataSource.filter(item =>
        this.selectedRowKeys.includes(item.id)
      );
      console.log(targets);
      if (targets.length > 0) {
        this.visible = true;
        this.targets = targets;
      } else {
        this.$message.warning("请至少选择一项");
      }
    },
    enterSubmit() {
      console.log(this.remark);
      console.log(this.warehouseId);
      if (!this.warehouseId) {
        this.$message.error("仓库不能为空");
        return;
      }
      let isReturn = false;
      const requestData = {};
      const detailsArray = [];
      for (let item of this.targets) {
        const quality = Number(item.quality);
        if (isNaN(quality)) {
          this.$message.error(`${item.productName}的成色必须是数字表示!`);
          isReturn = true;
          break;
        }
        if (quality === 0) {
          this.$message.error(`${item.productName}的成色必须大于零!`);
          isReturn = true;
          break;
        }
        const obj = {
          id: item.id,
          image: "image",
          quality,
          skuId: item.skuId
        };
        detailsArray.push(obj);
      }
      if (isReturn) {
        return;
      }
      requestData.details = detailsArray;
      requestData.remark = this.remark;
      requestData.warehouseId = this.warehouseId;
      this.confirmLoading = true;
      enterWarehouse(requestData)
        .then(response => {
          console.log(response);
          this.visible = false;
          this.confirmLoading = false;
          this.selectedRowKeys = [];
          this.startSearch();
        })
        .catch(() => {
          this.confirmLoading = false;
        });
    },
    startSearch(isSearch = false) {
      if (isSearch) {
        this.searchLoading = true;
        this.pagination = { ...this.pagination, pageNum: 1, pageSize: 10 };
      }

      const requestData = {};
      if (this.keyword) {
        requestData.keyword = this.keyword;
      }

      if (this.searchCategories.length > 0) {
        requestData.categoryIdList = this.searchCategories.join();
      }

      if (this.searchEnteringStatus) {
        requestData.statusIdList = this.searchEnteringStatus;
      }

      if (this.searchWarehouses) {
        requestData.warehouseIdList = this.searchWarehouses;
      }

      this.getListData(requestData);
    },
    onSelectChange(selectedRowKeys) {
      console.log("selectedRowKeys changed: ", selectedRowKeys);
      this.selectedRowKeys = selectedRowKeys;
    },

    onCheckboxProps(record) {
      return {
        props: {
          disabled: record.statusId === 1
        }
      };
    },

    // skuListChange(key, dataIndex, value) {
    //   console.log(value);
    //   // console.log(option);
    //   const dataSource = [...this.data];
    //   const target = dataSource.find(item => item.id === key);
    //   if (target) {
    //     target[dataIndex] = value;
    //     this.data = dataSource;
    //   }
    // },

    onCellChange(key, dataIndex, value) {
      const dataSource = [...this.data];
      const target = dataSource.find(item => item.id === key);
      if (target) {
        target[dataIndex] = value;
        this.data = dataSource;
      }
    },

    categoriesChange(e) {
      console.log(e);
      this.searchCategories = e;
    },

    enteringStatusChange(value) {
      console.log(value);
      this.searchEnteringStatus = value;
    },

    warehousesChange(value) {
      console.log(value);
      this.searchWarehouses = value;
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
    copy(txt) {
      this.$copyText(txt).then(
        () => {
          this.$message.success("复制成功");
        },
        () => {
          this.$message.error("复制失败");
        }
      );
    }
  }
};
</script>
