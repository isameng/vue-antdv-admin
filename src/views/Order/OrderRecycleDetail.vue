<template>
  <div>
    <a-card class="theme-bg" :bordered="false" :loading="infoLoading">
      <a-descriptions bordered size="middle">
        <span slot="title">
          订单号：{{ detailsData.orderNumber }}
          <a-icon theme="twoTone" type="copy" @click="orderCopy" />
        </span>
        <a-descriptions-item label="闲鱼订单号" :span="2">
          {{ detailsData.bizOrderId }}
          <a-icon theme="twoTone" type="copy" @click="bizCopy" />
        </a-descriptions-item>
        <a-descriptions-item label="订单状态">
          <a-badge status="processing" :text="detailsData.orderStatus" />
        </a-descriptions-item>
        <a-descriptions-item label="订单创建时间" :span="2">{{ detailsData.gmtCreate }}</a-descriptions-item>
        <a-descriptions-item label="预付时间">{{ detailsData.creditDate }}</a-descriptions-item>
        <a-descriptions-item label="卖家账号" :span="2">{{ detailsData.sellerNick }}</a-descriptions-item>
        <a-descriptions-item label="芝麻分">{{ detailsData.zmScoreDesc }}</a-descriptions-item>
        <a-descriptions-item label="订单来源" :span="2">闲鱼</a-descriptions-item>
        <a-descriptions-item label="订单类型">
          {{ detailsData.creditPay ? "信用预付" : "普通订单" }}
        </a-descriptions-item>
        <a-descriptions-item label="取件信息" :span="2">
          {{ detailsData.sellerRealName }}
          <br />
          {{ detailsData.sellerPhone }}
          <br />
          {{ detailsData.sellerAddress }}
        </a-descriptions-item>
        <a-descriptions-item
          label="预约取件时间
"
        >
          {{ detailsData.shipTime }}
        </a-descriptions-item>
        <a-descriptions-item label="备注">{{ detailsData.remark }}</a-descriptions-item>
      </a-descriptions>

      <div class="action-view">
        <div>
          <a-button type="primary" @click="tradingRecord">交易记录</a-button>
          <a-button type="primary" @click="predictShow">预估报告</a-button>
          <a-button v-if="detailsData.isQc === 1" type="primary" @click="qcShow">质检报告</a-button>
        </div>
      </div>

      <a-descriptions style="margin-top:46px" layout="vertical" :column="6" bordered size="middle">
        <a-descriptions-item label="商品信息">
          <img :src="detailsData.productImage" width="64px" style="margin-right:10px" />
          <span>{{ detailsData.productName }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="数量">{{ detailsData.productNum }}</a-descriptions-item>
        <a-descriptions-item label="市场回收价">￥{{ detailsData.marketPrice }}</a-descriptions-item>
        <a-descriptions-item>
          <template slot="label">
            <QuestionPopoverSpan content="预估价" popoverContent="卖家自主评估后回收商给出的预估回收价格" />
          </template>
          <span v-if="detailsData.apprizeAmount">￥{{ detailsData.apprizeAmount }}</span>
          <span v-if="detailsData.creditPayAmount">( 预付金额：￥{{ detailsData.creditPayAmount }})</span>
        </a-descriptions-item>
        <a-descriptions-item>
          <template slot="label">
            <QuestionPopoverSpan content="质检价" popoverContent="回收商质检成功后给出的质检价，影响最终成交价" />
          </template>
          <span v-if="detailsData.qcPrice">{{ detailsData.qcPrice }}</span>
          <span v-if="detailsData.qcPrice">( 尾款：￥{{ detailsData.balancePrice }})</span>
        </a-descriptions-item>
        <a-descriptions-item label="成交金额">
          <span style="color:#ff7875; font-size:16px" v-if="detailsData.bargainAmount">
            ￥{{ detailsData.bargainAmount }}
          </span>
          <span v-if="detailsData.couponFee">( 含加卷价：￥{{ detailsData.couponFee }})</span>
        </a-descriptions-item>
      </a-descriptions>
    </a-card>
    <a-card class="theme-bg" style="margin-top:6px" :bordered="false" :loading="infoLoading">
      <p class="descriptions-title">物流信息</p>
      <a-radio-group v-model="logisticsType" button-style="solid">
        <a-radio-button value="send">发货</a-radio-button>
        <a-radio-button value="back">退货</a-radio-button>
      </a-radio-group>
      <div v-if="logisticsType === 'send'">
        <div
          v-if="
            detailsData.sendLogisticsName || (detailsData.sendLogisticsList && detailsData.sendLogisticsList.length)
          "
        >
          <p style="margin-top:20px">物流公司：{{ detailsData.sendLogisticsName }}</p>
          <p>
            快递单号：{{ detailsData.sendLogisticsNumber }}
            <a-icon type="edit" theme="twoTone" @click="editLogisticsInfo" />
            <a class="m-left-24" @click="editLogisticsHistory">
              修改记录
              <a-icon type="right" />
            </a>
          </p>
          <a-divider dashed />
          <a-timeline>
            <a-timeline-item v-for="(item, index) in detailsData.sendLogisticsList" :key="index">
              <span class="m-right-12">{{ item.logisticsTime }}</span>
              <span>{{ item.logisticsInfo }}</span>
            </a-timeline-item>
          </a-timeline>
        </div>
        <a-empty v-else />
      </div>
      <div v-if="logisticsType === 'back'">
        <div
          v-if="
            detailsData.backLogisticsName || (detailsData.backLogisticsList && detailsData.backLogisticsList.length)
          "
        >
          <p style="margin-top:20px">物流公司：{{ detailsData.backLogisticsName }}</p>
          <p>
            快递单号：{{ detailsData.backLogisticsNumber }}
            <a-icon type="edit" theme="twoTone" @click="editLogisticsInfo" />
            <a class="m-left-24" @click="editLogisticsHistory">
              修改记录
              <a-icon type="right" />
            </a>
          </p>
          <a-divider dashed />
          <a-timeline>
            <a-timeline-item v-for="(item, index) in detailsData.backLogisticsList" :key="index">
              <span class="m-right-12">{{ item.logisticsTime }}</span>
              <span>{{ item.logisticsInfo }}</span>
            </a-timeline-item>
          </a-timeline>
        </div>
        <a-empty v-else />
      </div>
    </a-card>

    <a-card class="theme-bg" style="margin-top:6px" :bordered="false" :loading="trackingLoading">
      <p class="descriptions-title">订单跟踪</p>
      <a-timeline v-if="trackingData.length">
        <a-timeline-item v-for="(item, index) in trackingData" :key="index">
          <a-tag style="margin-right: 60px;" color="blue">
            {{ item.title }}
          </a-tag>
          <span style="margin-right: 30px;">{{ item.gmtCreate }}</span>
          <span>操作人：{{ item.operatorName }}</span>
          <div style="margin-top: 14px;">{{ item.info }}</div>
        </a-timeline-item>
      </a-timeline>
      <a-empty v-else />
    </a-card>

    <a-modal
      title="交易记录"
      :visible="tradingRecordVisible"
      :footer="null"
      width="1000px"
      @cancel="
        () => {
          this.tradingRecordVisible = false;
        }
      "
    >
      <a-table :columns="columns" :data-source="tradingRecordData" :loading="tradingRecordLoding" :pagination="false">
        <template slot="payType" slot-scope="payType">
          <span v-if="payType === 0">处理中</span>
          <span v-else-if="payType === 1">预付款</span>
          <span v-else-if="payType === 2">尾款</span>
          <span v-else-if="payType === 3">退款</span>
        </template>
        <span slot="sellerNick" slot-scope="sellerNick, record">{{ sellerNick }}/{{ record.recordNo }}</span>

        <template slot="payAmount" slot-scope="payAmount, record">
          <span v-if="record.payType === 1 || record.payType === 2">+{{ payAmount }}</span>
          <span v-else-if="record.payType === 3">-{{ payAmount }}</span>
          <span v-else>{{ payAmount }}</span>
        </template>

        <template slot="payState" slot-scope="payState">
          <span v-if="payState === -1">失败</span>
          <span v-else-if="payState === 0">处理中</span>
          <span v-else-if="payState === 1">成功</span>
        </template>
      </a-table>
    </a-modal>

    <a-modal
      title="修改记录"
      :visible="logisticsHistory"
      :footer="null"
      width="900px"
      :bodyStyle="bodyStyle"
      @cancel="
        () => {
          this.logisticsHistory = false;
        }
      "
    >
      <div v-if="logisticsHistoryList.length">
        <div v-for="(item, index) of logisticsHistoryList" :key="index">
          <a-divider v-if="index !== 0" dashed />
          <a-descriptions>
            <a-descriptions-item label="操作时间">{{ item.gmtCreate }}</a-descriptions-item>
            <a-descriptions-item label="物流公司">{{ item.logistisName }}</a-descriptions-item>
            <a-descriptions-item label="快递单号">{{ item.logistisNumber }}</a-descriptions-item>
            <a-descriptions-item label="操作人">舒慕蓉</a-descriptions-item>
            <a-descriptions-item label="备注">{{ item.remark }}</a-descriptions-item>
          </a-descriptions>
        </div>
      </div>
      <a-empty v-else />
    </a-modal>

    <a-modal
      title="修改物流信息"
      class="modal-form"
      :visible="logisticsVisible"
      :confirm-loading="confirmLoading"
      :maskClosable="false"
      @ok="editLogisticsSubmit"
      @cancel="
        () => {
          this.logisticsVisible = false;
        }
      "
    >
      <div class="modal-form-item-view row-align-center">
        <span class="modal-form-item-title m-right-12">快递名称</span>
        <a-select class="modal-form-select" placeholder="请选择快递" v-model="logisticsValue">
          <a-select-option v-for="item in idleLogisticsList" :key="item.value" :value="item.value">
            {{ item.key }}
          </a-select-option>
        </a-select>
      </div>

      <div class="modal-form-item-view row-align-center">
        <span class="modal-form-item-title m-right-12">物流单号</span>
        <a-input class="modal-form-input" v-model="logisticsNo"></a-input>
      </div>

      <div class="modal-form-item-view row-align-center">
        <span class="modal-form-item-title m-right-12">收货备注</span>
        <a-textarea
          class="modal-form-input"
          placeholder="请输入备注"
          v-model="logisticsRemark"
          :auto-size="{ minRows: 3, maxRows: 6 }"
        />
      </div>
    </a-modal>

    <predict-report :predictVisible.sync="predictVisible" :predictData="predictData" />
    <qc-report :qcVisible.sync="qcVisible" :qcData="qcData" />
  </div>
</template>

<script>
import {
  recycleOrderDetail,
  tracking,
  tradingRecord,
  editLogisticsInfo,
  getOrderLogisticsModify,
  reportOfPredict,
  reportOfQc
} from "@/api/order";
import { commonConditions } from "@/api/common";
import QcReport from "@/components/QcReport";
import PredictReport from "@/components/PredictReport";
import QuestionPopoverSpan from "@/components/QuestionPopoverSpan";
const columns = [
  {
    title: "创建时间",
    dataIndex: "gmtCreate",
    align: "center"
  },
  {
    title: "类型",
    dataIndex: "payType",
    scopedSlots: { customRender: "payType" },
    align: "center"
  },
  {
    title: "名称/交易号",
    dataIndex: "sellerNick",
    scopedSlots: { customRender: "sellerNick" },
    align: "center"
  },
  {
    title: "交易金额",
    scopedSlots: { customRender: "payAmount" },
    dataIndex: "payAmount",
    align: "center"
  },
  {
    title: "状态",
    dataIndex: "payState",
    scopedSlots: { customRender: "payState" },
    align: "center"
  },
  {
    title: "备注",
    dataIndex: "remark",
    align: "center"
  }
];

export default {
  name: "orderRecycleDetail",
  components: {
    QcReport,
    PredictReport,
    QuestionPopoverSpan
  },
  data() {
    this.form = this.$form.createForm(this);
    return {
      tradingRecordVisible: false,
      logisticsVisible: false,
      confirmLoading: false,
      logisticsHistory: false,

      qcVisible: false,
      predictVisible: false,
      predictData: {},
      qcData: {},

      logisticsValue: "",
      logisticsNo: "",
      logisticsRemark: "",
      idleLogisticsList: [],

      logisticsHistoryList: [],

      detailsData: {},
      trackingData: [],

      trackingLoading: false,
      infoLoading: false,
      tradingRecordLoding: false,
      tradingRecordData: [],

      bodyStyle: {
        maxHeight: "700px",
        overflow: "auto"
      },

      logisticsType: "send",
      columns
    };
  },

  mounted() {
        console.log("mounted");
    this.getCommonConditions();
    this.getDetailData();
    this.getTrackingData();
  },

  activated() {
    console.log("activated");
  },

  methods: {
    getCommonConditions() {
      commonConditions(103).then(response => {
        console.log(response);
        const { idleLogisticsList } = response.details;
        this.idleLogisticsList = idleLogisticsList;
      });
    },
    getDetailData() {
      this.infoLoading = true;
      recycleOrderDetail(this.$route.query.id)
        .then(response => {
          console.log(response);
          this.detailsData = response.details;
          this.infoLoading = false;
        })
        .catch(() => {
          this.infoLoading = false;
        });
    },

    getTrackingData() {
      this.trackingLoading = true;
      tracking(this.$route.query.id)
        .then(response => {
          console.log(response);
          this.trackingData = response.details;
          this.trackingLoading = false;
        })
        .catch(() => {
          this.trackingLoading = false;
        });
    },

    tradingRecord() {
      this.tradingRecordVisible = true;
      this.tradingRecordLoding = true;
      tradingRecord(this.$route.query.id)
        .then(response => {
          console.log(response);
          this.tradingRecordData = response.details;
          this.tradingRecordLoding = false;
        })
        .catch(() => {
          this.tradingRecordLoding = false;
        });
    },

    editLogisticsSubmit() {
      if (!this.logisticsNo) {
        this.$message.error("物流单号不能为空！");
        return;
      }

      if (!this.logisticsValue) {
        this.$message.error("快递名称不能为空！");
        return;
      }
      this.confirmLoading = true;

      editLogisticsInfo({
        id: this.$route.query.id,
        logisticsCode: this.logisticsValue,
        logisticsNumber: this.logisticsNo,
        remark: this.logisticsRemark,
        type: this.logisticsType === "send" ? 0 : 1
      })
        .then(response => {
          console.log(response);
          this.$message.success("物流信息变更成功!");
          const target = this.idleLogisticsList.find(item => item.value === this.logisticsValue);
          if (this.logisticsType === "send") {
            this.detailsData = {
              ...this.detailsData,
              sendLogisticsNumber: this.logisticsNo,
              sendLogisticsName: target.key,
              sendLogisticsCode: this.logisticsValue
            };
          } else {
            this.detailsData = {
              ...this.detailsData,
              backLogisticsNumber: this.logisticsNo,
              backLogisticsName: target.key,
              backLogisticsCode: this.logisticsValue
            };
          }

          this.logisticsVisible = false;
          this.confirmLoading = false;
          // this.getDetailData();
        })
        .catch(() => {
          this.confirmLoading = false;
        });
    },

    editLogisticsInfo() {
      this.logisticsVisible = true;
      if (this.logisticsType === "send") {
        this.logisticsValue = this.detailsData.sendLogisticsCode;
        this.logisticsNo = this.detailsData.sendLogisticsNumber;
      } else {
        this.logisticsValue = this.detailsData.backLogisticsCode;
        this.logisticsNo = this.detailsData.backLogisticsNumber;
      }
    },

    editLogisticsHistory() {
      getOrderLogisticsModify(this.$route.query.id, this.logisticsType === "send" ? 0 : 1).then(response => {
        console.log(response);
        this.logisticsHistory = true;
        this.logisticsHistoryList = response.details;
      });
    },

    predictShow() {
      reportOfPredict(this.$route.query.id).then(response => {
        console.log(response);
        this.predictVisible = true;
        this.predictData = response.details;
      });
    },

    qcShow() {
      reportOfQc(this.$route.query.id).then(response => {
        console.log(response);
        this.qcVisible = true;
        this.qcData = response.details;
      });
    },

    orderCopy() {
      this.$copyText(this.detailsData.orderNumber).then(
        () => {
          this.$message.success("复制成功");
        },
        () => {
          this.$message.error("复制失败");
        }
      );
    },
    bizCopy() {
      this.$copyText(this.detailsData.bizOrderId).then(
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

<style>
.action-view {
  margin-top: 24px;
}

.ant-btn {
  margin-right: 10px;
}

.price::before {
  content: "￥";
}
</style>
