<template>
  <div>
    <a-form-model ref="form" :model="form" :rules="rules" v-bind="formItemLayout">
      <a-form-model-item :wrapper-col="{ span: 12, offset: 7 }">
        <a-checkbox v-model="form.enableBuyout">支持买断</a-checkbox>
        <a-checkbox v-model="form.enableRenew">支持续租</a-checkbox>
        <a-checkbox v-model="form.enableVirtualStock">虚拟库存</a-checkbox>
      </a-form-model-item>

      <a-form-model-item label="品牌" prop="brandId">
        <a-select v-model="form.brandId" placeholder="品牌" @change="brandsChange">
          <a-select-option v-for="item in brands" :key="item.value" :value="item.value">
            {{ item.key }}
          </a-select-option>
        </a-select>
      </a-form-model-item>

      <a-form-model-item label="商品分类" prop="categoryId">
        <a-cascader
          v-model="form.categoryId"
          :options="categories"
          placeholder="分类"
          @change="categoriesChange"
          :allowClear="false"
        />
      </a-form-model-item>

      <a-form-model-item label="绑定商品" prop="productId">
        <a-select v-model="form.productId" placeholder="请选择商品" @change="productNameChange">
          <a-select-option v-for="item in products" :key="item.productId" :value="item.productId">
            {{ item.name }}
          </a-select-option>
        </a-select>
        <!-- <a-checkbox v-model="form.pack">添加套餐产品</a-checkbox> -->
      </a-form-model-item>

      <a-form-model-item
        label="规格选择"
        :required="true"
        :wrapper-col="{ span: 12 }"
        v-if="form.productId && isSkuDatas"
      >
        <a-checkbox-group style="padding-top:8px" @change="propsChange" v-model="propsData">
          <a-row>
            <a-col v-for="item in skuDatas" :key="item.skuId" :span="skuSpan">
              <a-checkbox :value="item" v-if="item.props.length > 0">
                {{ item.propsStr.join() }}
              </a-checkbox>
            </a-col>
          </a-row>
        </a-checkbox-group>
      </a-form-model-item>
    </a-form-model>
    <!-- style="margin:12px 0 0 36px;" -->
    <a-table
      size="middle"
      :pagination="false"
      :columns="columnsTemp"
      :data-source="propsData"
      :row-key="record => record.skuId"
      v-if="propsData.length > 0"
    >
      <template slot="index" slot-scope="text, record, index">
        <span>{{ index + 1 }}</span>
      </template>
      <template slot="image" slot-scope="image">
        <img :src="image" width="76px" />
      </template>

      <template slot="depositAmount" slot-scope="record">
        <a-input-number v-model="record.depositAmount" />
      </template>
      <template slot="insurancePrice" slot-scope="record">
        <div class="row-align-center">
          <a-select v-model="record.insuranceStatus" style="margin-right:6px">
            <a-select-option v-for="item in insuranceSelect" :key="item.status" :value="item.status">
              {{ item.title }}
            </a-select-option>
          </a-select>
          <a-input-number v-model="record.insurancePrice" />
        </div>
      </template>
      <template slot="buyoutPrice" slot-scope="record">
        <a-input-number v-model="record.buyoutPrice" />
      </template>
      <template slot="marketPrice" slot-scope="record">
        <a-input-number v-model="record.marketPrice" />
      </template>
      <template slot="virtualStockNum" slot-scope="record">
        <a-input-number v-model="record.virtualStockNum" :precision="0" />
      </template>

      <template slot="expandedRowRender" slot-scope="record">
        <a-table
          style="width:300px; margin: 6px"
          size="small"
          :pagination="false"
          :columns="rentTimeColumns"
          :data-source="record.rentTimes"
          :row-key="record => record.rentTimeId"
        >
          <span slot="days" slot-scope="text">{{ text }}天</span>
          <template slot="dayRentAmount" slot-scope="record">
            <a-input-number v-model="record.dayRentAmount" />
          </template>
        </a-table>
      </template>
    </a-table>

    <div class="steps-action">
      <a-button @click="prevStep">上一步</a-button>
      <a-button style="margin-left: 24px" type="primary" @click="handleSubmit">下一步</a-button>
    </div>
  </div>
</template>

<script>
import { commonConditions } from "@/api/common";
import { simpleInfoList, skuList } from "@/api/shelves-lease";

const rentTimeColumns = [
  {
    title: "租期",
    align: "center",
    scopedSlots: { customRender: "days" },
    dataIndex: "days",
    width: 60
  },
  {
    title: "日租金",
    align: "center",
    scopedSlots: { customRender: "dayRentAmount" },
    width: 60
  }
];

const columns = [
  {
    title: "序号",
    scopedSlots: { customRender: "index" },
    align: "center"
  },
  {
    title: "图片",
    dataIndex: "image",
    scopedSlots: { customRender: "image" },
    align: "center"
  },
  {
    title: "剩余库存",
    dataIndex: "stockNum",
    align: "center"
  },
  {
    title: "押金",
    scopedSlots: { customRender: "depositAmount" },
    width: 120,
    align: "center"
  },
  {
    title: "保险",
    scopedSlots: { customRender: "insurancePrice" },
    width: 200,
    align: "center"
  },
  {
    title: "买断价",
    scopedSlots: { customRender: "buyoutPrice" },
    width: 120,
    align: "center"
  },
  {
    title: "官网市场价",
    scopedSlots: { customRender: "marketPrice" },
    width: 120,
    align: "center"
  },
  {
    title: "虚拟库存",
    scopedSlots: { customRender: "virtualStockNum" },
    width: 120,
    align: "center"
  }
];
export default {
  data() {
    return {
      formItemLayout: {
        labelCol: { span: 7 },
        wrapperCol: { span: 4 }
      },
      brands: [],
      categories: [],
      searchCategories: [],
      searchBrand: "",
      products: [],
      skuDatas: [],

      propsData: [],

      columnsTemp: columns,
      rentTimeColumns,

      insuranceSelect: [
        {
          status: 0,
          title: "不选"
        },
        {
          status: 1,
          title: "必选"
        },
        {
          status: 2,
          title: "可选"
        }
      ],

      form: {
        productId: undefined,
        enableBuyout: false,
        enableRenew: false,
        enableVirtualStock: false,
        // pack: false,
        categoryId: [],
        brandId: undefined
      },

      rules: {
        productId: [{ required: true, message: "请选择商品", trigger: "change" }],
        brandId: [{ required: true, message: "请选择品牌", trigger: "change" }],
        categoryId: [{ required: true, message: "请选择商品分类", trigger: "change" }]
      }
    };
  },

  props: {
    productData: {
      type: Object,
      default: () => {}
    }
  },

  computed: {
    isSkuDatas() {
      return this.skuDatas.length > 0 && this.skuDatas[0].props.length > 0;
    },

    skuSpan() {
      return 24 / (this.skuDatas.length > 4 ? 4 : this.skuDatas.length);
    }
  },

  activated() {
    console.log("activated");
    this.skuDatas = this.customeRentTimes(this.skuDatas);
  },

  mounted() {
    this.getCommonConditions();
    if (this.$route.query.rentProductId) {
      // console.log(this.productData);
      this.form = { ...this.form, ...this.productData };
      simpleInfoList({
        brandId: this.form.brandId,
        categoryIds: this.form.categoryId.join()
      }).then(response => {
        this.products = response.details.list;
      });

      skuList({
        productId: this.form.productId,
        rentProductId: this.form.rentProductId
      }).then(response => {
        const { details } = response;
        this.skuDatas = this.customeRentTimes(details.list);
        if (this.isSkuDatas) {
          //当有规格的时候才需要构造规格数据和规格参数表头
          this.generateProps();
        }
        this.propsData = details.list.filter(item => this.productData.skuIds.includes(item.skuId));
        // console.log(this.propsData);
      });
    }
  },

  methods: {
    releaseData() {
      return JSON.parse(localStorage.getItem(`shelvesLeaseData${this.$route.query.rentProductId||''}`));
    },

    getCommonConditions() {
      commonConditions("201,202").then(response => {
        const { brands, categories } = response.details;
        this.brands = brands;
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

    customeRentTimes(list) {
      for (let item of list) {
        const rentTimes = [];
        for (let citem of this.releaseData().rentTimes) {
          rentTimes.push({
            rentTimeId: citem.value,
            days: citem.key,
            dayRentAmount: ""
          });
        }
        if (item.rentTimes.length > 0) {
          for (let jitem of item.rentTimes) {
            for (let zitem of rentTimes) {
              if (jitem.rentTimeId === zitem.rentTimeId) {
                zitem.dayRentAmount = jitem.dayRentAmount;
              }
            }
          }
        }
        item.rentTimes = rentTimes;
      }
      return list;
    },

    getSimpleInfoList(params) {
      simpleInfoList(params).then(response => {
        if (this.form.productId) {
          this.form.productId = undefined;
          this.skuDatas = [];
          // this.form.props = [];
          this.propsData = [];
        }
        this.products = response.details.list;
      });
    },

    categoriesChange(e) {
      //   console.log(e);
      this.searchCategories = e;
      if (this.searchBrand) {
        this.getSimpleInfoList({
          brandId: this.searchBrand,
          categoryIds: e.join()
        });
      }
    },

    brandsChange(value) {
      console.log(value);
      this.searchBrand = value;
      if (this.searchCategories.length > 0) {
        this.getSimpleInfoList({
          brandId: value,
          categoryIds: this.searchCategories.join()
        });
      }
    },

    propsChange(value) {
      console.log(value);
      if (this.propsData.length === 0) {
        this.propsData = value;
        return;
      }
      const propsData = [...this.propsData];
      const newPropsData = [...value];

      const newPropsTemp = newPropsData.filter(item => {
        if (!propsData.some(citem => citem.skuId === item.skuId)) {
          return true;
        }
      });

      console.log("newPropsTemp", newPropsTemp);

      if (newPropsTemp.length === 0) {
        let clearItem = "";
        //没有新增数据，需要在源数据中过滤没有勾选的sku
        this.propsData = propsData.filter(item => {
          if (newPropsData.some(citem => citem.skuId === item.skuId)) {
            return true;
          } else {
            clearItem = item;
          }
        });
        const target = this.skuDatas.find(item => item.skuId === clearItem.skuId);
        if (target) {
          target.depositAmount = "";
          target.insurancePrice = "";
          target.buyoutPrice = "";
          target.marketPrice = "";
          target.virtualStockNum = "";
        }
        // console.log("target", target);
      } else {
        //有新增数据，加入到源数据中
        this.propsData = [...propsData, ...newPropsTemp];
      }

      console.log("propsData", this.propsData);
    },

    isEmpty(strings) {
      if (!strings && strings !== 0) {
        return true;
      } else {
        return false;
      }
    },

    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.propsData.length === 0) {
            this.$message.warning("请选择规格");
            return;
          }
          this.validInfo();
        }
      });
    },

    validInfo() {
      const skus = [];
      let isSkusResult = false;
      for (let i = 0; i < this.propsData.length; i++) {
        const item = this.propsData[i];
        if (this.form.enableBuyout && this.isEmpty(item.buyoutPrice)) {
          isSkusResult = false;
          this.$message.warning(`序号${i + 1}的买断价没有填写`);
          break;
        }

        if (this.form.enableVirtualStock && this.isEmpty(item.virtualStockNum)) {
          isSkusResult = false;
          this.$message.warning(`序号${i + 1}的虚拟库存没有填写`);
          break;
        }

        if (item.insuranceStatus !== 0 && this.isEmpty(item.insurancePrice)) {
          isSkusResult = false;
          this.$message.warning(`序号${i + 1}的保险没有填写`);
          break;
        }

        if (this.isEmpty(item.depositAmount)) {
          isSkusResult = false;
          this.$message.warning(`序号${i + 1}的押金没有填写`);
          break;
        }
        if (this.isEmpty(item.marketPrice)) {
          isSkusResult = false;
          this.$message.warning(`序号${i + 1}的市场价没有填写`);
          break;
        }
        let isRentTimes = true;
        for (let time of item.rentTimes) {
          if (this.isEmpty(time.dayRentAmount)) {
            isRentTimes = false;
            break;
          }
        }
        if (!isRentTimes) {
          isSkusResult = false;
          this.$message.warning(`序号${i + 1}的租期金额没有填写`);
          break;
        }

        isSkusResult = true;

        const skuObject = {};
        skuObject.skuId = item.skuId;
        skuObject.depositAmount = item.depositAmount;
        skuObject.insuranceStatus = item.insuranceStatus;
        skuObject.insurancePrice = item.insurancePrice;
        skuObject.buyoutPrice = item.buyoutPrice;
        skuObject.marketPrice = item.marketPrice;
        skuObject.virtualStockNum = item.virtualStockNum;
        skuObject.rentTimes = item.rentTimes;
        skus.push(skuObject);
      }
      // console.log(JSON.stringify(skus));
      if (!isSkusResult) {
        return;
      }
      // const { $store } = this;
      // $store.commit({
      //   type: "shelvesLease/saveReleaseFormData",
      //   payload: {
      //     brandId: this.form.brandId,
      //     categoryIds: this.form.categoryId,
      //     enableBuyout: this.form.enableBuyout,
      //     enableRenew: this.form.enableRenew,
      //     enableVirtualStock: this.form.enableVirtualStock,
      //     productId: this.form.productId,
      //     skus
      //   }
      // });
      const requestData = {
        brandId: this.form.brandId,
        categoryIds: this.form.categoryId,
        enableBuyout: this.form.enableBuyout,
        enableRenew: this.form.enableRenew,
        enableVirtualStock: this.form.enableVirtualStock,
        productId: this.form.productId,
        skus
      };
      localStorage.setItem(`shelvesLeaseData${this.$route.query.rentProductId||''}`, JSON.stringify({...this.releaseData(), ...requestData}));
      this.$emit("nextStep");
    },

    productNameChange(value) {
      console.log(value);
      if (value) {
        skuList({
          productId: value
        }).then(response => {
          const { details } = response;

          for (let item of details.list) {
            for (let citem of this.releaseData().rentTimes) {
              item.rentTimes.push({
                rentTimeId: citem.value,
                days: citem.key,
                dayRentAmount: ""
              });
            }

            // item.rentTimes.push({
            //   // rentTimeId: citem.rentTimeId,
            //   // days: citem.days,
            //   // dayRentAmount: ""
            //   rentTimeId: 1,
            //   days: "70",
            //   dayRentAmount: ""
            // });
          }

          this.propsData = [];
          this.skuDatas = details.list;
          if (this.isSkuDatas) {
            //当有规格的时候才需要构造规格数据和规格参数表头
            this.generateProps();
          } else {
            this.columnsTemp = [...columns];
            //没有规格数据的时候直接渲染sku数据
            this.propsData = this.skuDatas;
          }
        });
      }
    },

    generateProps() {
      for (let item of this.skuDatas) {
        const propsStr = [];
        for (let i = 0; i < item.props.length; i++) {
          propsStr.push(item.props[i].propValue);
          item[`propValue${i}`] = item.props[i].propValue;
        }
        item.propsStr = propsStr;
      }
      this.columnsTemp = [...columns];
      for (let i = 0; i < this.skuDatas[0].props.length; i++) {
        this.columnsTemp.splice(2, 0, {
          title: this.skuDatas[0].props[i].propName,
          dataIndex: `propValue${i}`
        });
      }
    },

    enableBuyoutChange(e) {
      console.log(e.target.checked);
      const columnsTemp = [...this.columnsTemp];
      if (e.target.checked) {
        columnsTemp.splice(-2, 0, {
          title: "买断价",
          scopedSlots: { customRender: "buyoutPrice" },
          width: 120,
          align: "center"
        });
        this.columnsTemp = [...columnsTemp];
      } else {
        this.columnsTemp = columnsTemp.filter(item => item.title !== "买断价");
      }
    },

    enableVirtualStockChange(e) {
      console.log(e.target.checked);
      const columnsTemp = [...this.columnsTemp];
      if (e.target.checked) {
        columnsTemp.splice(columnsTemp.length, 0, {
          title: "虚拟库存",
          scopedSlots: { customRender: "virtualStockNum" },
          width: 120,
          align: "center"
        });
        this.columnsTemp = [...columnsTemp];
      } else {
        this.columnsTemp = columnsTemp.filter(item => item.title !== "虚拟库存");
      }
    },

    prevStep() {
      this.$emit("prevStep");
    }
  }
};
</script>

<style>
.steps-action {
  margin-left: 488px;
  margin-top: 36px;
}
</style>
