<template>
  <div>
    <a-spin :spinning="spinning">
      <div v-if="data.length">
        <a-table
          v-for="(item, index) in data"
          :key="index"
          :columns="columns"
          :data-source="item.details"
          :row-key="record => record.id"
          :pagination="false"
          size="middle"
          bordered
          :class="{ 'm-top-24': index !== 0 }"
        >
          <template slot="index" slot-scope="text, record, index">
            <span>{{ index + 1 }}</span>
          </template>
          <template slot="title">
            <span style="margin-right: 36px;"
              >入库时间：{{ item.gmtCreate }}</span
            >
            <span style="margin-right: 36px;">入库人：舒慕蓉</span>
            <span>入库仓库：{{ item.warehouseName }}</span>
          </template>
          <template slot="footer">入库备注：{{ item.remark }}</template>
        </a-table>
      </div>

      <a-empty v-else />
    </a-spin>

    <a-pagination
      class="pagination"
      show-size-changer
      :current="pagination.pageNum"
      :total="pagination.total"
      :showTotal="total => `共 ${total} 条数据`"
      @showSizeChange="onShowSizeChange"
      @change="paginationChange"
    />
  </div>
</template>
<script>
import { listStockRecycleRecords } from "@/api/warehouse";
const columns = [
  {
    title: "入库记录",
    scopedSlots: { customRender: "index" },
    align: "center"
  },
  {
    title: "商品名称",
    dataIndex: "productName",
    align: "center"
  },
  {
    title: "商品规格",
    dataIndex: "skuProperties",
    align: "center"
  },
  {
    title: "库存编码",
    dataIndex: "serialNo",
    align: "center"
  },
  {
    title: "采购价",
    dataIndex: "actualRecyclePrice",
    align: "center"
  },
  {
    title: "市场价",
    dataIndex: "marketRecyclePrice",
    align: "center"
  }
];
export default {
  data() {
    return {
      data: [],
      spinning: false,
      pagination: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },
      columns
    };
  },
  mounted() {
    this.getListData();
  },
  methods: {
    getListData() {
      this.spinning = true;
      listStockRecycleRecords({
        pageNum: this.pagination.pageNum,
        pageSize: this.pagination.pageSize
      })
        .then(response => {
          console.log(response);
          const { data, pageNum, pageSize, total } = response;
          this.pagination = { ...this.pagination, pageNum, pageSize, total };
          this.spinning = false;
          this.data = data;
        })
        .catch(() => {
          this.spinning = false;
        });
    },

    onShowSizeChange(pageNum, pageSize) {
      // console.log(pageNum, pageSize);
      this.pagination = { ...this.pagination, pageNum, pageSize };
      this.getListData();
    },
    paginationChange(pageNum, pageSize) {
      // console.log(pageNum, pageSize);
      this.pagination = { ...this.pagination, pageNum, pageSize };
      this.getListData();
    }
  }
};
</script>
