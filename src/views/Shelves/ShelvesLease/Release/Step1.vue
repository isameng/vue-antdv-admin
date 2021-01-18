<template>
  <div>
    <a-form-model ref="form" :model="form" :rules="rules" v-bind="formItemLayout">
      <a-form-model-item label="商品状态" prop="status">
        <a-radio-group v-model="form.status">
          <a-radio :value="1">
            <a-tag color="green">上架</a-tag>
          </a-radio>
          <a-radio :value="0">
            <a-tag color="orange">下架</a-tag>
          </a-radio>
        </a-radio-group>
      </a-form-model-item>
      <a-form-model-item label="商品名称" prop="productName">
        <a-input v-model.trim="form.productName" :max-length="40" placeholder="请输入商品名称" />
      </a-form-model-item>

      <a-form-model-item label="租期选择" prop="rentTimes" :wrapper-col="{ span: 12 }">
        <a-checkbox-group v-model="form.rentTimes">
          <a-checkbox v-for="item in times" :key="item.value" :value="item">{{ item.key }}天</a-checkbox>
        </a-checkbox-group>
      </a-form-model-item>

      <a-form-model-item label="用户自定义" prop="customizeRentTime">
        <a-checkbox v-model="form.customizeRentTime"></a-checkbox>
      </a-form-model-item>

      <a-form-model-item label="运费模板" prop="freightTemplateId">
        <a-select v-model="form.freightTemplateId" :allowClear="true" placeholder="请选择运费模板">
          <a-select-option v-for="item in templates" :key="item.value" :value="item.value">
            {{ item.key }}
          </a-select-option>
        </a-select>
      </a-form-model-item>

      <a-form-model-item label="预授权类目分类" prop="alipayPreAuthCategoryCode">
        <a-select v-model="form.alipayPreAuthCategoryCode" placeholder="请选择分类">
          <a-select-option v-for="item in categories" :key="item.value" :value="item.value">
            {{ item.key }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item label="商品简介" prop="desc">
        <a-textarea
          v-model="form.desc"
          allow-clear
          :max-length="200"
          placeholder="请输入商品简介"
          :auto-size="{ minRows: 3, maxRows: 5 }"
        />
      </a-form-model-item>
      <a-form-model-item label="产品清单" :required="true" v-bind="{ wrapperCol: { span: 10 } }">
        <div v-for="(item, index) in form.accessories" :key="index" class="accessory-item">
          <a-input v-model="item.name" placeholder="配件名称" style="width: 160px" />
          X
          <a-input-number
            v-model="item.quantity"
            :precision="0"
            placeholder="数量"
            style="width: 70px"
            class="m-right-6"
          />
          <a-input-number v-model="item.price" placeholder="价格" style="width: 80px" class="m-right-6" />
          <a-input v-model="item.accessoryUnit" placeholder="数量单位" style="width: 80px" class="m-right-6" />
          <a-upload
            name="file"
            style="width: 80px"
            :action="QINIU_SERVER"
            :data="getUploadToken"
            :before-upload="beforeUpload"
            @change="obj => normFile(obj, index)"
            :file-list="item.fileList"
          >
            <a-button icon="upload">图片</a-button>
          </a-upload>

          <a-icon
            v-if="form.accessories.length > 1"
            class="accessory-delete-button"
            type="minus-circle-o"
            :disabled="form.accessories.length === 1"
            @click="removeAccessory(item)"
          />
        </div>
        <a-button type="dashed" icon="plus" style="width: 12%" @click="addAccessory">
          配件
        </a-button>
      </a-form-model-item>

      <a-form-model-item :wrapper-col="{ span: 12, offset: 7 }">
        <a-button type="primary" @click="handleSubmit">下一步</a-button>
      </a-form-model-item>
    </a-form-model>
  </div>
</template>

<script>
import CONFIG from "@/utils/common";
import { getToken } from "@/api/qiniu";
import { commonConditions } from "@/api/common";

const QINIU_SERVER = CONFIG.QINIU_SERVER;

export default {
  data() {
    return {
      formItemLayout: {
        labelCol: { span: 7 },
        wrapperCol: { span: 4 }
      },
      QINIU_SERVER,
      loading: false,
      modelVisible: false,
      isEditor: false,
      uploadToken: "",
      fileKey: "",
      times: [],
      templates: [],
      categories: [],

      form: {
        status: 0,
        productName: "",
        rentTimes: [],
        customizeRentTime: false,
        freightTemplateId: undefined,
        alipayPreAuthCategoryCode: undefined,
        desc: "",
        accessories: [
          {
            name: "",
            quantity: "",
            price: "",
            accessoryUnit: "",
            fileList: []
          }
        ]
      },

      rules: {
        status: [{ required: true }],
        productName: [{ required: true, message: "请输入商品名称", trigger: "change" }],
        rentTimes: [
          {
            type: "array",
            required: true,
            message: "请选择租期",
            trigger: "change"
          }
        ],
        alipayPreAuthCategoryCode: [{ required: true, message: "请选择分类", trigger: "change" }],
        desc: [{ required: true, message: "请输入商品简介", trigger: "blur" }]
      }
    };
  },

  props: {
    productData: {
      type: Object,
      default: () => {}
    }
  },

  watch: {
    productData(value) {
      // console.log(value);
      if (value) {
        //accessoriesData 因为上传图片组件出现一些未知错误，需要新的对象赋值，不能直接复制引用
        const accessoriesData = [];
        for (let item of value.accessories) {
          accessoriesData.push({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            accessoryUnit: item.accessoryUnit,
            fileList: [
              {
                uid: "-1",
                name: `${item.imageUrl.slice(item.imageUrl.lastIndexOf("/") + 1)}.png`,
                status: "done",
                url: item.imageUrl
              }
            ]
          });
        }
        this.form = { ...this.form, ...value, accessories: accessoriesData };
        // console.log(this.form.accessories);
        this.initData();
      }
    },

    times(value) {
      if (this.$route.query.rentProductId) {
        this.form.rentTimes = value.filter(item => this.form.rentTimes.includes(item.value));
      }
    }
  },

  mounted() {
    !this.$route.query.rentProductId && this.initData();
  },

  methods: {
    initData() {
      commonConditions("205,207,209").then(response => {
        this.templates = response.details.rentProductFreightTemplateList;
        this.times = response.details.rentTimeList;
        this.categories = response.details.rentPreAuthCategoryList;
      });
    },

    removeAccessory(item) {
      let index = this.form.accessories.indexOf(item);
      if (index !== -1) {
        this.form.accessories.splice(index, 1);
      }
    },
    addAccessory() {
      this.form.accessories.push({
        name: "",
        quantity: "",
        price: "",
        accessoryUnit: "",
        fileList: []
      });
    },

    judgeObjectComplete(ObjectValue) {
      let flag = new Boolean();
      flag = true;
      for (let key in ObjectValue) {
        if (Object.prototype.toString.call(ObjectValue[key]) === "[object Array]" && !ObjectValue[key].length > 0) {
          flag = false;
        } else if (!ObjectValue[key] && ObjectValue[key] !== 0) {
          flag = false;
        }
      }
      if (!flag) {
        return false;
      } else {
        return true;
      }
    },
    judgeListComplete(list) {
      let result = true;
      let isNotComplete = list.findIndex(item => {
        return this.judgeObjectComplete(item) === false;
      });
      // console.log(isNotComplete)
      if (isNotComplete > -1) {
        result = false;
      } else {
        result = true;
      }
      return {
        result,
        index: isNotComplete
      };
    },

    handleSubmit() {
      // const { $store } = this;

      this.$refs.form.validate(valid => {
        if (valid) {
          const obj = this.judgeListComplete(this.form.accessories);
          if (obj.result) {
            const accessoriesArray = [];
            for (let item of this.form.accessories) {
              accessoriesArray.push({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                accessoryUnit: item.accessoryUnit,
                imageUrl: item.fileList[0].url
              });
            }
            // console.log(accessoriesArray);
            // $store.commit({
            //   type: "shelvesLease/saveReleaseFormData",
            //   payload: {
            //     status: this.form.status,
            //     name: this.form.productName,
            //     rentTimes: this.form.rentTimes,
            //     customizeRentTime: this.form.customizeRentTime,
            //     freightTemplateId: this.form.freightTemplateId,
            //     alipayPreAuthCategoryCode: this.form.alipayPreAuthCategoryCode,
            //     desc: this.form.desc,
            //     accessories: accessoriesArray
            //   }
            // });
            const requestData = {
              status: this.form.status,
              name: this.form.productName,
              rentTimes: this.form.rentTimes,
              customizeRentTime: this.form.customizeRentTime,
              freightTemplateId: this.form.freightTemplateId,
              alipayPreAuthCategoryCode: this.form.alipayPreAuthCategoryCode,
              desc: this.form.desc,
              accessories: accessoriesArray
            };
            localStorage.setItem(
              `shelvesLeaseData${this.$route.query.rentProductId || ""}`,
              JSON.stringify(requestData)
            );
            this.$emit("nextStep");
          } else {
            this.$message.error(`第${obj.index + 1}个配件信息需要填写完整!`);
          }
        }
      });
    },

    normFile(info, index) {
      // console.log(index);
      console.log("上传的数据:", info);
      console.log(this.form.accessories);
      let fileList = [...info.fileList];
      fileList = fileList.slice(-1);
      fileList = fileList.map(file => {
        if (file.response) {
          file.url = CONFIG.IMAGE_HOST + file.response.key;
        }
        return file;
      });
      this.form.accessories[index].fileList = fileList;
    },
    //限制用户上传的图片格式和大小。
    beforeUpload(file) {
      const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
      if (!isJpgOrPng) {
        this.$message.error("仅支持JPG/PNG格式的文件!");
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        this.$message.error("图片大小必须小于2M！");
      }

      const _promise = new Promise((resolve, reject) => {
        if (isJpgOrPng && isLt2M) {
          const key = Date.now() + Math.floor(Math.random() * (999999 - 100000) + 100000) + 1;

          getToken().then(response => {
            console.log(response);
            if (response.details.token) {
              this.uploadToken = response.details.token;
              this.fileKey = key;
              resolve();
            } else {
              reject();
            }
          });
        } else {
          reject();
        }
      });
      // await this.fetchUploadToken();
      return _promise;
    },

    getUploadToken() {
      return {
        token: this.uploadToken,
        key: this.fileKey
      };
    }
  }
};
</script>
<style lang="less" scoped>
.accessory-delete-button {
  cursor: pointer;
  position: absolute;
  top: 8px;
  right: 154px;
  margin-left: 6px;
  font-size: 24px;
  color: #999;
  transition: all 0.3s;
}
.accessory-delete-button:hover {
  color: #777;
}
.accessory-delete-button[disabled] {
  cursor: not-allowed;
  opacity: 0.5;
}
.accessory-item {
  position: relative;
  margin-top: 12px;
}
.accessory-item:first-child {
  margin-top: 0;
}

/deep/ .ant-upload-list {
  width: 400px;
}
</style>
