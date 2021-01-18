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
              placeholder="取件信息/订单号"
              @pressEnter="startSearch(true)"
            >
              <a-icon slot="prefix" type="search" />
            </a-input>

            <a-select
              class="big-select m-right-12"
              :allowClear="true"
              placeholder="订单状态"
              @change="statusListChange"
            >
              <a-select-option
                v-for="item in idleOrderStatusList"
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
        <div
          class="column-flexbox"
          slot="orderNumber"
          slot-scope="text, record"
        >
          <span>
            探物:
            <a @click="copy(text)">{{ text }}</a>
          </span>
          <span>
            闲鱼:
            <a @click="copy(record.bizOrderId)">{{ record.bizOrderId }}</a>
          </span>
        </div>
        <div class="column-align-center" slot="productInfo" slot-scope="record">
          <img
            :src="record.productImage"
            width="76px"
            style="margin-bottom:5px"
          />
          <span>{{ record.productName }}</span>
          <!-- <span>{{ record.twoCategoryName }}</span> -->
        </div>
        <!-- <div class="column-align-center" slot="sellerInfo" slot-scope="text, record">
          <span>{{ text }}</span>
          <span>{{ `芝麻分:${record.zmScore}` }}</span>
        </div> -->
        <!-- <div slot="orderType" slot-scope="text, record">
          <span>{{ record.creditPay ? "信用预付" : "普通订单" }}</span>
        </div>-->
        <div
          class="column-align-center"
          slot="takeInfo"
          slot-scope="text, record"
        >
          <span>{{ record.sellerRealName }}</span>
          <span>{{ record.sellerPhone }}</span>
          <span>{{ record.sellerAddress }}</span>
        </div>
        <div class="column-align-center" slot="estimate" slot-scope="record">
          <span style="font-size:17px">￥{{ record.apprizeAmount }}</span>
          <span v-if="record.creditPay"
            >预付款：￥{{ record.creditPayAmount }}</span
          >
          <a-button
            style="margin-top:5px"
            size="small"
            type="primary"
            @click="predictShow(record.id)"
            >预估报告</a-button
          >
          <a-button
            v-if="record.isQc === 1"
            style="margin-top:5px"
            size="small"
            type="primary"
            @click="qcShow(record.id)"
            >质检报告</a-button
          >
        </div>
        <div
          class="column-align-center"
          slot="amount"
          slot-scope="text, record"
        >
          <span v-if="record.bargainAmount"
            >成交价：￥{{ record.bargainAmount }}</span
          >
          <span v-if="record.qcPrice">质检价：￥{{ record.qcPrice }}</span>
          <span v-if="record.balancePrice"
            >尾款：￥{{ record.balancePrice }}</span
          >
          <span v-if="record.couponFee">加卷价：￥{{ record.couponFee }}</span>
        </div>
        <div class="column-align-center" slot="operation" slot-scope="record">
          <a
            v-if="record.orderStatusId === 60 && !record.negotiationFlag"
            @click="bargain(record)"
            >议价</a
          >
          <a v-if="record.negotiationFlag" @click="result(record.id)">查看</a>
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
    </a-card>

    <a-modal
      title="议价"
      class="modal-form"
      :visible="bargainVisible"
      :confirm-loading="confirmLoading"
      :maskClosable="false"
      okText="议价"
      @ok="bargainSubmit"
      @cancel="
        () => {
          this.bargainVisible = false;
        }
      "
    >
      <div class="modal-form-item-view row-align-center">
        <span class="modal-form-item-title m-right-12">质检价</span>
        <span class="color-red">{{ qcValue }}</span>
      </div>
      <a-alert class="modal-form-item-view" type="info" show-icon>
        <span slot="message">
          协商价不能大于预估价,当前预估价为
          <span style="color: red">{{ apprizeValue }}</span>
        </span>
      </a-alert>

      <div class="modal-form-item-view row-align-center">
        <span class="modal-form-item-title m-right-12">协商价</span>

        <a-input-number v-model="negotiateValue" :min="0" />
      </div>

      <div class="modal-form-item-view flexbox">
        <span class="modal-form-item-title m-right-12">备注：</span>
        <a-textarea
          style="width: 400px;"
          v-model="remark"
          placeholder="备注"
          :auto-size="{ minRows: 3, maxRows: 5 }"
        />
      </div>
    </a-modal>

    <a-modal
      title="议价详情"
      :visible="resultVisible"
      class="modal-form"
      :footer="null"
      @cancel="
        () => {
          this.resultVisible = false;
        }
      "
    >
      <div class="modal-form-item-view row-align-center">
        <span class="modal-form-item-title m-right-12">议价时间</span>
        <span>{{ negotiationResult.negotiationTime }}</span>
      </div>
      <div class="modal-form-item-view row-align-center">
        <span class="modal-form-item-title m-right-12">协商价</span>
        <span class="color-red">{{ negotiationResult.negotiationPrice }}</span>
      </div>
      <div class="modal-form-item-view row-align-center">
        <span class="modal-form-item-title m-right-12">备注</span>
        <span>{{ negotiationResult.remark }}</span>
      </div>
      <div class="modal-form-item-view row-align-center">
        <span class="modal-form-item-title m-right-12">操作人</span>
        <span>舒慕蓉</span>
      </div>
    </a-modal>

    <predict-report
      :predictVisible.sync="predictVisible"
      :predictData="predictData"
    />
    <qc-report :qcVisible.sync="qcVisible" :qcData="qcData" />
  </div>
</template>

<script>
import {
  listRecycleNegotiationOrders,
  getRecycleNegotiationOrderResult,
  saveRecycleNegotiationOrderResult
} from "@/api/bargain";
import { reportOfPredict, reportOfQc } from "@/api/order";
import { commonConditions } from "@/api/common";
import QcReport from "@/components/QcReport";
import PredictReport from "@/components/PredictReport";
const columns = [
  {
    title: "创建时间",
    dataIndex: "gmtCreate",
    align: "center",
    width: 140
  },
  {
    title: "订单号",
    dataIndex: "orderNumber",
    scopedSlots: { customRender: "orderNumber" },
    width: 240
  },
  {
    title: "商品信息",
    scopedSlots: { customRender: "productInfo" },
    align: "center"
  },
  {
    title: "卖家信息",
    dataIndex: "sellerNick",
    align: "center"
  },
  {
    title: "订单状态",
    dataIndex: "orderStatus",
    align: "center"
  },
  {
    title: "取件信息",
    dataIndex: "takeInfo",
    scopedSlots: { customRender: "takeInfo" },
    align: "center",
    width: 170
  },
  {
    title: "预估价",
    scopedSlots: { customRender: "estimate" },
    align: "center"
  },
  {
    title: "金额",
    dataIndex: "amount",
    scopedSlots: { customRender: "amount" },
    align: "center"
  },
  {
    title: "操作",
    scopedSlots: { customRender: "operation" },
    align: "center"
  }
];
export default {
  name: "serviceBargain",
  components: {
    QcReport,
    PredictReport
  },
  data() {
    return {
      searchLoading: false,
      tableLoading: false,
      bargainVisible: false,
      resultVisible: false,
      confirmLoading: false,
      data: [],
      pagination: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },
      qcVisible: false,
      predictVisible: false,
      predictData: {},
      qcData: {},
      columns,
      qcValue: 0,
      negotiateValue: 0,
      apprizeValue: 0,
      negotiationResult: {},
      remark: "",
      keyword: "",
      idleOrderStatusList: [],
      searchOrderStatus: "",
      currentId: ""
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
      commonConditions(101).then(response => {
        console.log(response);
        const { idleOrderStatusList } = response.details;
        this.idleOrderStatusList = idleOrderStatusList;
      });
    },

    getListData(params = {}) {
      this.tableLoading = true;
      listRecycleNegotiationOrders({
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

      if (this.searchOrderStatus) {
        requestData.orderStatusIds = this.searchOrderStatus;
      }

      this.getListData(requestData);
    },

    bargain(record) {
      this.qcValue = record.qcPrice;
      this.negotiateValue = record.qcPrice;
      this.apprizeValue = record.apprizeAmount;
      this.currentId = record.id;
      this.bargainVisible = true;
    },

    result(id) {
      getRecycleNegotiationOrderResult(id).then(response => {
        console.log(response);
        this.negotiationResult = response.details;
        this.resultVisible = true;
      });
    },

    predictShow(id) {
      reportOfPredict(id).then(response => {
        console.log(response);
        this.predictVisible = true;
        this.predictData = response.details;
      });
    },

    qcShow(id) {
      reportOfQc(id).then(response => {
        console.log(response);
        this.qcVisible = true;
        this.qcData = response.details;
      });
    },

    bargainSubmit() {
      if (!this.negotiateValue) {
        this.$message.error("协商价不能为空");
        return;
      }
      const requestData = {
        orderId: this.currentId,
        negotiationPrice: this.negotiateValue,
        remark: this.remark
      };
      this.confirmLoading = true;
      saveRecycleNegotiationOrderResult(requestData)
        .then(response => {
          console.log(response);
          // const dataSource = [...this.data];
          // const target = dataSource.find(item => item.id === requestData.orderId);
          // if (target) {
          //   console.log(target);
          //   // target["resultId"] = requestData.resultId;
          //   // this.data = dataSource;
          // }
          this.startSearch();
          this.bargainVisible = false;
          this.confirmLoading = false;
        })
        .catch(() => {
          this.confirmLoading = false;
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

    statusListChange(value) {
      console.log(value);
      this.searchOrderStatus = value;
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
