<template>
  <div>
    <a-card class="theme-bg" :bordered="false">
      <a-table
        :pagination="false"
        :columns="columns"
        :data-source="data"
        :loading="tableLoading"
        :row-key="record => record.productSkuId"
      >
        <template slot="props" slot-scope="props">
          <span v-if="!props.length">无规格</span>
          <span v-for="(item, index) in props" :key="index">
            {{ index !== props.length - 1 ? `${item.propValue},` : item.propValue }}
          </span>
        </template>
        <div class="column-align-center" slot="createTime" slot-scope="text">
          <span>{{ text | formatTime4 }}</span>
        </div>
        <template slot="operation" slot-scope="record">
          <a @click="goDetail(record.productSkuId)">库存明细</a>
        </template>
      </a-table>
    </a-card>

    <a-modal
      title="库存明细"
      :visible="visible"
      :footer="null"
      width="1000px"
      destroyOnClose
      @cancel="
        () => {
          this.visible = false;
        }
      "
    >
      <a-table
        :pagination="false"
        :columns="inventoryColumns"
        :data-source="inventoryData"
        :row-key="record => record.id"
      />
    </a-modal>
  </div>
</template>

<script>
import { skuList } from "@/api/product";
import { listStocks } from "@/api/inventory";
const columns = [
  {
    title: "创建时间",
    dataIndex: "createTime",
    scopedSlots: { customRender: "createTime" },
    align: "center"
  },
  {
    title: "商品名称",
    dataIndex: "name",
    align: "center"
  },
  {
    title: "商品规格",
    dataIndex: "props",
    scopedSlots: { customRender: "props" },
    align: "center"
  },
  {
    title: "品牌",
    dataIndex: "brand",
    align: "center"
  },

  {
    title: "商品分类",
    dataIndex: "category",
    align: "center"
  },

  // {
  //   title: "库存总量",
  //   dataIndex: "stockCount",
  //   align: "center"
  // },

  {
    title: "剩余库存",
    dataIndex: "stockNum",
    align: "center"
  },
  {
    title: "操作",
    scopedSlots: { customRender: "operation" }
  }
];

const inventoryColumns = [
  {
    title: "入库时间",
    dataIndex: "enteringWarehouseTime",
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
  name: "productDetailList",
  data() {
    return {
      tableLoading: false,
      visible: false,
      data: [],
      inventoryData: [],
      columns,
      inventoryColumns
    };
  },
  mounted() {
    this.getListData();
  },

  methods: {
    getListData() {
      this.tableLoading = true;
      skuList(this.$route.query.productId)
        .then(response => {
          console.log(response);
          const { data } = response;
          this.tableLoading = false;
          this.data = data;
        })
        .catch(() => {
          this.tableLoading = false;
        });
    },

    goDetail(productSkuId) {
      listStocks({
        productSkuId
      }).then(response => {
        console.log(response);
        const { data } = response;
        this.inventoryData = data;
        this.visible = true;
      });
    }
  }
};
</script>
