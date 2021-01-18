<template>
  <div>
    <a-card class="theme-bg" :bordered="false">
      <div class="general-search-view">
        <div class="row-align-center m-bottom-12">
          <a-input
            class="primary-input m-right-12"
            v-model="keyword"
            placeholder="产品名称/订单号/取件信息"
            :allowClear="true"
            @pressEnter="startSearch(true)"
          >
            <a-icon slot="prefix" type="search" />
          </a-input>
          <a-range-picker class="m-right-12" @change="placeOrderChange" :placeholder="['创建日期开始', '创建日期结束']">
            <a-icon slot="suffixIcon" type="calendar" />
          </a-range-picker>
          <a-range-picker class="m-right-12" @change="takeChange" :placeholder="['取件日期开始', '取件日期结束']">
            <a-icon slot="suffixIcon" type="calendar" />
          </a-range-picker>
          <a-range-picker class="m-right-12" @change="qcChange" :placeholder="['质检日期开始', '质检日期结束']">
            <a-icon slot="suffixIcon" type="calendar" />
          </a-range-picker>
          <a-range-picker @change="finishChange" :placeholder="['完成日期开始', '完成日期结束']">
            <a-icon slot="suffixIcon" type="calendar" />
          </a-range-picker>
        </div>
        <div class="general-search-item">
          <div class="left-view">
            <a-select
              class="big-select m-right-12"
              :allowClear="true"
              placeholder="订单状态"
              @change="statusListChange"
            >
              <a-select-option v-for="item in idleOrderStatusList" :key="item.value" :value="item.value">
                {{ item.key }}
              </a-select-option>
            </a-select>

            <a-select
              class="big-select m-right-12"
              :allowClear="true"
              placeholder="退款状态"
              @change="refundListChange"
            >
              <a-select-option v-for="item in idleRefundStatusList" :key="item.value" :value="item.value">
                {{ item.key }}
              </a-select-option>
            </a-select>

            <!-- <a-select class="primary-select m-right-12" :allowClear="true" placeholder="超时订单">
              <a-select-option value="jack">Jack</a-select-option>
              <a-select-option value="lucy">Lucy</a-select-option>
            </a-select>-->

            <!-- <a-select class="primary-select m-right-12" :allowClear="true" placeholder="商品分类">
              <a-select-option value="jack">Jack</a-select-option>
              <a-select-option value="lucy">Lucy</a-select-option>
            </a-select>-->

            <a-button type="primary" :loading="searchLoading" @click="startSearch(true)">查询</a-button>
          </div>

          <!-- <div class="right-view">
            <a-button type="primary">打印</a-button>
            <a-button type="primary" class="m-left-12">导出</a-button>
          </div>-->
        </div>
      </div>
    </a-card>

    <a-card class="theme-bg" style="margin-top:6px;" :bordered="false">
      <a-spin :spinning="statusTabSpinning">
        <a-radio-group default-value="0" v-model="currentStatusTab" button-style="solid" @change="tabClick">
          <a-radio-button v-for="item in idleOrderStatusTabList" :key="item.value" :value="item.value">
            {{ item.key }}
          </a-radio-button>
        </a-radio-group>
      </a-spin>
      <a-table
        style="margin-top:12px"
        :pagination="false"
        :columns="columns"
        :data-source="data"
        :loading="tableLoading"
        :row-key="record => record.id"
      >
        <div class="column-flexbox" slot="orderNumber" slot-scope="text, record">
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
          <img :src="record.productImage" width="76px" style="margin-bottom:5px" />
          <span>{{ record.productName }}</span>
          <span>{{ record.twoCategoryName }}</span>
        </div>
        <div class="column-align-center" slot="sellerInfo" slot-scope="text, record">
          <span>{{ text }}</span>
          <!-- <span>{{ `芝麻分:${record.zmScore}` }}</span> -->
          <span>{{ record.sellerRealName }}</span>
          <span>{{ record.sellerPhone }}</span>
        </div>
        <div class="column-align-center order-status" slot="orderStatus" slot-scope="text, record">
          <span>{{ text }}</span>
          <a-tag style="margin-top:5px" v-if="record.isRefund" color="red">退款中</a-tag>
        </div>
        <template slot="orderType" slot-scope="record">
          <span>{{ record.creditPay ? "信用预付" : "普通订单" }}</span>
        </template>
        <!-- <div class="column-align-center" slot="takeInfo" slot-scope="record">
          <span>{{ record.sellerRealName }}</span>
          <span>{{ record.sellerPhone }}</span>
          <span>{{ record.sellerAddress }}</span>
        </div>-->
        <div class="column-align-center" slot="estimate" slot-scope="record">
          <span style="font-size:17px">￥{{ record.apprizeAmount }}</span>
          <span v-if="record.creditPay">预付款：￥{{ record.creditPayAmount }}</span>
          <a-button style="margin-top:5px" size="small" type="primary" @click="predictShow(record.id)">
            预估报告
          </a-button>
          <a-button
            v-if="record.isQc === 1"
            style="margin-top:5px"
            size="small"
            type="primary"
            @click="qcShow(record.id)"
          >
            质检报告
          </a-button>
        </div>
        <div class="column-flexbox" slot="amount" slot-scope="record">
          <span v-if="record.bargainAmount">成交价：￥{{ record.bargainAmount }}</span>
          <span v-if="record.qcPrice">质检价：￥{{ record.qcPrice }}</span>
          <span v-if="record.qcPrice">尾款：￥{{ record.balancePrice }}</span>
          <span v-if="record.couponFee">加卷价：￥{{ record.couponFee }}</span>
        </div>
        <div class="column-align-center" slot="operation" slot-scope="record">
          <a @click="goDetail(record.id)">详情</a>
          <a
            v-if="[10, 20, 30, 40, 50].includes(record.orderStatusId) && !record.isRefund"
            @click="clickRecord(record, 'cancelOrder')"
          >
            取消订单
          </a>
          <a v-if="record.orderStatusId === 20" @click="showTransUniTransfer(record.id, '1')">转账预付</a>
          <a
            v-if="
              (record.orderStatusId === 30 || record.orderStatusId === 31) &&
                (record.sendLogisticsNumber === undefined || !record.sendLogisticsNumber)
            "
            @click="clickRecord(record, 'appointmentTake')"
          >
            预约取件
          </a>
          <a
            v-if="record.orderStatusId === 30 && record.sendSysReserve && record.sendLogisticsNumber"
            @click="showCancelAppointment(record.id)"
          >
            取消预约
          </a>
          <!-- <template v-if="record.orderStatusId === 30"></template> -->
          <a v-if="record.orderStatusId === 40" @click="clickRecord(record, 'takeGoods')">确认收货</a>
          <a v-if="record.orderStatusId === 61" @click="showTransUniTransfer(record.id, '2')">转账尾款</a>
          <a v-if="[62, 130, 131, 140, 141].includes(record.orderStatusId)" @click="showExecutePayPlan(record.id)">
            代扣
          </a>
          <a
            v-if="record.orderStatusId === 110 && !record.backLogisticsCode"
            @click="clickRecord(record, 'returnGoods')"
          >
            确认退货
          </a>
          <a @click="clickRecord(record, 'remark')">备注</a>
        </div>

        <template slot="estimateCountTitle">
          <QuestionPopoverSpan content="预估价" popoverContent="卖家自主评估后回收商给出的预估回收价格" />
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

    <predict-report :predictVisible.sync="predictVisible" :predictData="predictData" />
    <qc-report :qcVisible.sync="qcVisible" :qcData="qcData" />

    <a-modal
      title="取消订单"
      :visible="cancelVisible"
      :confirm-loading="confirmLoading"
      :maskClosable="false"
      @ok="cancelOK"
      @cancel="
        () => {
          this.cancelVisible = false;
        }
      "
    >
      <a-textarea
        v-model="cancelOrderNote"
        allow-clear
        max-length="300"
        placeholder="请输入取消订单原因"
        :auto-size="{ minRows: 3, maxRows: 5 }"
      />
    </a-modal>

    <a-modal
      title="备注"
      :visible="remarkVisible"
      :confirm-loading="confirmLoading"
      :maskClosable="false"
      @ok="remarkOK"
      @cancel="
        () => {
          this.remarkVisible = false;
        }
      "
    >
      <a-textarea
        v-model="remark"
        allow-clear
        max-length="300"
        placeholder="备注"
        :auto-size="{ minRows: 3, maxRows: 5 }"
      />
    </a-modal>

    <a-modal
      title="确认退货"
      class="modal-form"
      :visible="returnGoodsVisible"
      :confirm-loading="confirmLoading"
      :maskClosable="false"
      okText="确认退货"
      @ok="returnGoodsSubmit"
      @cancel="
        () => {
          this.returnGoodsVisible = false;
        }
      "
    >
      <div class="modal-form-item-view flexbox">
        <span class="modal-form-item-title">退货信息：</span>
        <div>
          <span style="margin-right:30px">{{ backName }}</span>
          <span>{{ backPhone }}</span>
          <div style="margin-top:6px">{{ backAddress }}</div>
        </div>
      </div>
      <div class="modal-form-item-view row-align-center">
        <span class="modal-form-item-title m-right-12">快递名称</span>
        <a-select class="modal-form-select" placeholder="请选择快递" v-model="returnCourierValue">
          <a-select-option v-for="item in idleLogisticsList" :key="item.value" :value="item.value">
            {{ item.key }}
          </a-select-option>
        </a-select>
      </div>

      <div class="modal-form-item-view row-align-center">
        <span class="modal-form-item-title m-right-12">物流单号</span>
        <a-input class="modal-form-input" v-model="returnCourierNo"></a-input>
      </div>

      <div class="modal-form-item-view row-align-center">
        <span class="modal-form-item-title m-right-12">退货备注</span>
        <a-textarea
          class="modal-form-input"
          placeholder="请输入备注"
          v-model="returnCourierRemark"
          :auto-size="{ minRows: 3, maxRows: 6 }"
        />
      </div>
    </a-modal>

    <a-modal
      title="确认收货"
      class="modal-form"
      :visible="takeGoodsVisible"
      :confirm-loading="confirmLoading"
      :maskClosable="false"
      okText="确认收货"
      @ok="takeGoodsSubmit"
      @cancel="
        () => {
          this.takeGoodsVisible = false;
        }
      "
    >
      <div class="modal-form-item-view row-align-center">
        <span class="modal-form-item-title m-right-12">快递名称</span>
        <a-select class="modal-form-select" placeholder="请选择快递" v-model="courierValue">
          <a-select-option v-for="item in idleLogisticsList" :key="item.value" :value="item.value">
            {{ item.key }}
          </a-select-option>
        </a-select>
      </div>

      <div class="modal-form-item-view row-align-center">
        <span class="modal-form-item-title m-right-12">物流单号</span>
        <a-input class="modal-form-input" v-model="courierNo"></a-input>
      </div>

      <div class="modal-form-item-view row-align-center">
        <span class="modal-form-item-title m-right-12">收货备注</span>
        <a-textarea
          class="modal-form-input"
          placeholder="请输入备注"
          v-model="courierRemark"
          :auto-size="{ minRows: 3, maxRows: 6 }"
        />
      </div>
    </a-modal>

    <a-modal
      title="预约取件"
      :visible="appointmentTakeVisible"
      :confirm-loading="confirmLoading"
      class="modal-form"
      :maskClosable="false"
      okText="确认预约"
      @ok="appointmentTakeOK"
      @cancel="
        () => {
          this.appointmentTakeVisible = false;
        }
      "
    >
      <div class="modal-form-item-view flexbox">
        <span class="modal-form-item-title">取件时间：</span>
        <div>{{ shipTime }}</div>
      </div>

      <div class="modal-form-item-view flexbox">
        <span class="modal-form-item-title">取件信息：</span>
        <div>
          <span style="margin-right:30px">{{ sellerRealName }}</span>
          <span>{{ sellerPhone }}</span>
          <div style="margin-top:6px">{{ sellerAddress }}</div>
        </div>
      </div>

      <div class="modal-form-item-view row-align-center">
        <span class="modal-form-item-title m-right-12">快递名称</span>
        <a-select class="modal-form-select" placeholder="请选择快递" v-model="appointmentCourierValue">
          <a-select-option v-for="item in idleLogisticsList" :key="item.value" :value="item.value">
            {{ item.key }}
          </a-select-option>
        </a-select>
      </div>

      <div class="modal-form-item-view row-align-center">
        <span class="modal-form-item-title m-right-12">物流单号</span>
        <a-input class="modal-form-input" v-model="appointmentCourierNo"></a-input>
      </div>
    </a-modal>
  </div>
</template>

<script>
import {
  reportOfPredict,
  reportOfQc,
  updateOrderRemark,
  recycleOrderList,
  takeGoods,
  cancelOrder,
  cancelAppointment,
  fundTransUniTransfer,
  executePayPlan,
  takeToAppointment,
  returnGoods
} from "@/api/order";
import { commonConditions } from "@/api/common";
import QcReport from "@/components/QcReport";
import PredictReport from "@/components/PredictReport";
import QuestionPopoverSpan from "@/components/QuestionPopoverSpan";

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
    scopedSlots: { customRender: "sellerInfo" },
    align: "center"
  },
  {
    title: "订单状态",
    dataIndex: "orderStatus",
    scopedSlots: { customRender: "orderStatus" },
    align: "center"
  },
  {
    title: "订单类型",
    scopedSlots: { customRender: "orderType" },
    align: "center"
  },
  {
    title: "上门取件时间",
    dataIndex: "shipTime",
    align: "center",
    width: 140
  },
  // {
  //   title: "取件信息",
  //   scopedSlots: { customRender: "takeInfo" },
  //   align: "center",
  //   width: 170
  // },
  {
    scopedSlots: { customRender: "estimate" },
    slots: { title: "estimateCountTitle" },
    align: "center"
  },
  {
    title: "金额",
    scopedSlots: { customRender: "amount" },
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
  name: "orderRecycle",
  components: {
    QcReport,
    PredictReport,
    QuestionPopoverSpan
  },
  data() {
    return {
      keyword: "",
      data: [],
      columns,
      qcVisible: false,
      predictVisible: false,
      searchLoading: false,
      tableLoading: false,
      statusTabSpinning: false,
      cancelVisible: false,
      remarkVisible: false,
      confirmLoading: false,
      returnGoodsVisible: false,
      takeGoodsVisible: false,
      appointmentTakeVisible: false,

      courierValue: "",
      courierNo: "",
      courierRemark: "",

      returnCourierValue: "",
      returnCourierNo: "",
      returnCourierRemark: "",
      backName: "",
      backPhone: "",
      backAddress: "",

      shipTime: "",
      sellerRealName: "",
      sellerPhone: "",
      sellerAddress: "",
      appointmentCourierValue: "",
      appointmentCourierNo: "",

      cancelOrderNote: "",
      remark: "",
      recordId: "",
      pagination: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },
      bodyStyle: {
        backgroundColor: "rgb(236, 236, 236)",
        maxHeight: "600px",
        overflow: "auto"
      },
      currentStatusTab: "0",
      searchOrderStatus: "",
      searchRefundStatus: "",
      searchPlaceOrderTime: ["", ""],
      searchTakeTime: ["", ""],
      searchQcTime: ["", ""],
      searchFinishTime: ["", ""],
      idleOrderStatusList: [],
      idleOrderStatusTabList: [],
      idleLogisticsList: [],
      idleRefundStatusList: [],
      predictData: {},
      qcData: {}
    };
  },

  beforeCreate() {
    this.form = this.$form.createForm(this);
  },

  mounted() {
    console.log("mounted");
    this.getCommonConditions();
    this.getListData();
  },
  activated() {
    console.log("activated");
  },
  // beforeRouteLeave(to, from, next) {
  //   console.log(to.name);
  //   if (to.name !== "orderRecycleDetail") {
  //     this.$store.commit("noKeepAlive", from.name);
  //   }
  //   next();
  // },
  methods: {
    getCommonConditions() {
      this.statusTabSpinning = true;
      commonConditions("101,102,103,105")
        .then(response => {
          console.log(response);
          const {
            idleOrderStatusList,
            idleOrderStatusTabList,
            idleLogisticsList,
            idleRefundStatusList
          } = response.details;
          this.idleOrderStatusList = idleOrderStatusList;
          this.idleOrderStatusTabList = idleOrderStatusTabList;
          this.idleLogisticsList = idleLogisticsList;
          this.idleRefundStatusList = idleRefundStatusList;
          this.statusTabSpinning = false;
        })
        .catch(() => {
          this.statusTabSpinning = false;
        });
    },

    getListData(params = {}) {
      this.tableLoading = true;
      recycleOrderList({
        pageNum: this.pagination.pageNum,
        pageSize: this.pagination.pageSize,
        tabId: this.currentStatusTab,
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
    tabClick() {
      this.pagination = { ...this.pagination, pageNum: 1, pageSize: 10 };
      this.startSearch();
    },
    startSearch(isSearch = false) {
      if (isSearch) {
        this.searchLoading = true;
        this.pagination = { ...this.pagination, pageNum: 1, pageSize: 10 };
      }
      const requestData = {};
      if (this.searchOrderStatus) {
        requestData.orderStatusId = this.searchOrderStatus;
      }
      if (this.searchRefundStatus) {
        requestData.isRefund = true;
      }
      if (this.keyword) {
        requestData.keyword = this.keyword;
      }
      if (this.searchPlaceOrderTime[0]) {
        requestData.startTimeOfPlaceOrder = this.searchPlaceOrderTime[0];
        requestData.endTimeOfPlaceOrder = this.searchPlaceOrderTime[1];
      }
      if (this.searchTakeTime[0]) {
        requestData.startTimeOfTake = this.searchTakeTime[0];
        requestData.endTimeOfTake = this.searchTakeTime[1];
      }
      if (this.searchQcTime[0]) {
        requestData.startTimeOfQc = this.searchQcTime[0];
        requestData.endTimeOfQc = this.searchQcTime[1];
      }
      if (this.searchFinishTime[0]) {
        requestData.startTimeOfFinish = this.searchFinishTime[0];
        requestData.endTimeOfFinish = this.searchFinishTime[1];
      }
      this.getListData(requestData);
    },
    goDetail(id) {
      this.$router.push({
        path: "/order/order-recycle-detail",
        query: { id, navTheme: this.$route.query.navTheme }
      });

      // //下面是打开一个新的tab页
      // const routeData = this.$router.resolve({
      //   path: "/order/order-recycle-detail",
      //   query: { id, navTheme: this.$route.query.navTheme }
      // });
      // window.open(routeData.href, "_blank");
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

    showCancelAppointment(id) {
      const that = this;
      this.$modal.confirm({
        title: "确认取消预约？",
        // content: "确认取消预约？",
        okType: "danger",
        onOk() {
          return new Promise((resolve, reject) => {
            cancelAppointment(id)
              .then(response => {
                console.log(response);
                resolve();
                that.$message.success("取消预约成功!");
                that.startSearch();
              })
              .catch(reject);
          });
        }
      });
    },

    showTransUniTransfer(id, transferType) {
      const that = this;
      this.$modal.confirm({
        title: "确认转账？",
        okType: "danger",
        onOk() {
          return new Promise((resolve, reject) => {
            fundTransUniTransfer(id, transferType)
              .then(response => {
                console.log(response);
                resolve();
                that.$message.success("操作成功!");
                that.startSearch();
              })
              .catch(reject);
          });
        }
      });
    },

    showExecutePayPlan(id) {
      const that = this;
      this.$modal.confirm({
        title: "确认手动代扣？",
        okType: "danger",
        onOk() {
          return new Promise((resolve, reject) => {
            executePayPlan(id)
              .then(response => {
                console.log(response);
                resolve();
                that.$message.success("操作成功!");
                that.startSearch();
              })
              .catch(reject);
          });
        }
      });
    },

    appointmentTakeOK() {
      if (!this.appointmentCourierNo) {
        this.$message.error("物流单号不能为空！");
        return;
      }

      if (!this.appointmentCourierValue) {
        this.$message.error("快递名称不能为空！");
        return;
      }
      this.confirmLoading = true;
      takeToAppointment({
        id: this.recordId,
        sendLogisticsCode: this.appointmentCourierValue,
        sendLogisticsNumber: this.appointmentCourierNo
      })
        .then(response => {
          console.log(response);
          this.$message.success("预约取件成功!");
          this.appointmentTakeVisible = false;
          this.confirmLoading = false;
          this.appointmentCourierNo = "";
          this.appointmentCourierValue = "";
          this.startSearch();
        })
        .catch(() => {
          this.confirmLoading = false;
        });
    },

    takeGoodsSubmit() {
      if (!this.courierNo) {
        this.$message.error("物流单号不能为空！");
        return;
      }

      if (!this.courierValue) {
        this.$message.error("快递名称不能为空！");
        return;
      }
      this.confirmLoading = true;

      takeGoods({
        id: this.recordId,
        sendLogisticsCode: this.courierValue,
        sendLogisticsNumber: this.courierNo,
        remark: this.courierRemark
      })
        .then(response => {
          console.log(response);
          this.$message.success("确认收货成功!");
          this.takeGoodsVisible = false;
          this.confirmLoading = false;
          this.startSearch();
        })
        .catch(() => {
          this.confirmLoading = false;
        });
    },

    returnGoodsSubmit() {
      if (!this.returnCourierNo) {
        this.$message.error("物流单号不能为空！");
        return;
      }

      if (!this.returnCourierValue) {
        this.$message.error("快递名称不能为空！");
        return;
      }
      this.confirmLoading = true;
      returnGoods({
        id: this.recordId,
        backLogisticsCode: this.returnCourierValue,
        backLogisticsNumber: this.returnCourierNo,
        remark: this.returnCourierRemark
      })
        .then(response => {
          console.log(response);
          this.$message.success("确认退货成功!");
          this.returnGoodsVisible = false;
          this.confirmLoading = false;
          this.startSearch();
        })
        .catch(() => {
          this.confirmLoading = false;
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

    clickRecord(record, type) {
      this.recordId = record.id;
      switch (type) {
        case "remark":
          this.remarkVisible = true;
          break;
        case "takeGoods":
          this.takeGoodsVisible = true;
          this.courierValue = record.sendLogisticsCode;
          this.courierNo = record.sendLogisticsNumber;
          break;
        case "returnGoods":
          this.returnGoodsVisible = true;
          this.backName = record.backName;
          this.backPhone = record.backPhone;
          this.backAddress = record.backAddress;
          break;
        case "cancelOrder":
          this.cancelVisible = true;
          break;
        case "appointmentTake":
          this.appointmentTakeVisible = true;
          this.shipTime = record.shipTime;
          this.sellerRealName = record.sellerRealName;
          this.sellerPhone = record.sellerPhone;
          this.sellerAddress = record.sellerAddress;
          break;
      }
    },

    cancelOK() {
      this.confirmLoading = true;
      cancelOrder({
        id: this.recordId,
        reasons: this.cancelOrderNote
      })
        .then(response => {
          console.log(response);
          this.$message.success("取消订单成功!");
          this.cancelVisible = false;
          this.confirmLoading = false;
          this.cancelOrderNote = "";
          this.startSearch();
        })
        .catch(() => {
          this.confirmLoading = false;
        });
    },
    remarkOK() {
      if (!this.remark) {
        this.$message.error("备注不能为空!");
        return;
      }
      this.confirmLoading = true;
      updateOrderRemark({
        id: this.recordId,
        remark: this.remark
      })
        .then(response => {
          console.log(response);
          this.$message.success("备注成功!");
          this.remarkVisible = false;
          this.confirmLoading = false;
        })
        .catch(() => {
          this.confirmLoading = false;
        });
    },
    statusListChange(value) {
      console.log(value);
      this.searchOrderStatus = value;
    },

    refundListChange(value) {
      console.log(value);
      this.searchRefundStatus = value;
    },

    placeOrderChange(date, dateString) {
      console.log(date, dateString);
      this.searchPlaceOrderTime = dateString;
    },

    takeChange(date, dateString) {
      console.log(date, dateString);
      this.searchTakeTime = dateString;
    },
    qcChange(date, dateString) {
      console.log(date, dateString);
      this.searchQcTime = dateString;
    },
    finishChange(date, dateString) {
      console.log(date, dateString);
      this.searchFinishTime = dateString;
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

<style scoped>
.order-status >>> .ant-tag {
  margin: 0;
}

.line {
  height: 90px;
  width: 3px;
  background-color: green;
}
</style>
