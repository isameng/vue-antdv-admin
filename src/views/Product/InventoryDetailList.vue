<template>
  <div>
    <a-card class="theme-bg" :bordered="false">
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
    </a-card>
  </div>
</template>

<script>
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
  props: ["productId"],
  data() {
    return {
      tableLoading: false,
      data: [],
      columns
    };
  },
  mounted() {
    this.getListData({
      productId: this.productId
    });
  },
  methods: {
    getListData(params = {}) {
      this.tableLoading = true;
      listStocks(params)
        .then(response => {
          console.log(response);
          const { data } = response;
          this.tableLoading = false;
          this.data = data;
        })
        .catch(() => {
          this.tableLoading = false;
        });
    }
  }
};
</script>
