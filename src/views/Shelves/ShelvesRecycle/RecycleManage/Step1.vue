<template>
  <div>
    <a-form :form="form" v-bind="formItemLayout">
      <a-form-item label="商品状态">
        <a-radio-group v-model="status">
          <a-radio :value="1">
            <a-tag color="green">上架</a-tag>
          </a-radio>
          <a-radio :value="0">
            <a-tag color="orange">下架</a-tag>
          </a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item label="商品分类">
        <a-cascader
          v-decorator="['categories', { rules: [{ required: true, message: '请选择商品分类！' }] }]"
          :options="categories"
          @change="categoriesChange($event, false)"
          :allowClear="false"
          placeholder="请选择商品分类"
        />
      </a-form-item>
      <a-form-item label="商品名称">
        <a-select
          v-decorator="[
            'productId',
            {
              rules: [{ required: true, message: '请选择商品名称！' }]
            }
          ]"
          :showSearch="true"
          placeholder="请先选择商品名称"
          optionFilterProp="children"
        >
          <a-select-option v-for="item in products" :key="item.productId" :value="item.productId">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="评估项目" :required="true" :help="questionsHelp" :validateStatus="questionsStauts">
        <!-- <a-checkbox-group
          v-decorator="[
          'questions',
          { rules: [{ required: true, message: '请选择评估项目！' }] }
        ]"
          style="width: 100%;"
          :options="questions"
        ></a-checkbox-group>-->
        <div v-if="dragItems.length">
          <SlickList
            :lockToContainerEdges="true"
            lockAxis="y"
            v-model="dragItems"
            class="SortableList"
            @input="getChangeList"
          >
            <SlickItem class="SortableItem" v-for="(item, index) in dragItems" :index="index" :key="index">
              <div style="width: 100%" class="space-between-align-center">
                <span>{{ item.label }}</span>
                <a-icon type="delete" @mousedown.stop @mouseup="deleteDragClick(item.value)" />
              </div>
            </SlickItem>
          </SlickList>
          <span class="extra">备注：拖拽可以进行排序</span>
        </div>

        <a-button type="primary" @click="handelAdd">添加</a-button>
      </a-form-item>

      <a-form-item label="商品图片" :help="fieldAHelp" :validateStatus="fieldAStauts" :required="true">
        <template slot="extra">
          <a-tag color="orange">建议尺寸：800w*800h；图片大小：小于2M</a-tag>
        </template>
        <!-- v-decorator="[
          'upload',
          {
            valuePropName: 'fileList'
            getValueFromEvent: normFile,
            rules: [{ required: true, message: '请上传商品图片！' }]
          }
        ]"-->
        <a-upload
          name="file"
          :action="QINIU_SERVER"
          list-type="picture-card"
          class="picture-uploader"
          :show-upload-list="false"
          :data="getUploadToken"
          :before-upload="beforeUpload"
          @change="normFile"
        >
          <img v-if="imageUrl" :src="imageUrl" alt="avatar" width="250" />
          <div v-else>
            <a-icon :type="loading ? 'loading' : 'plus'" />
            <div class="ant-upload-text">上传</div>
          </div>
        </a-upload>
      </a-form-item>

      <a-form-item :wrapper-col="{ span: 12, offset: 7 }">
        <a-button type="primary" @click="handleSubmit">下一步</a-button>
      </a-form-item>
    </a-form>

    <a-modal
      title="添加评估项"
      :visible="modelVisible"
      :maskClosable="false"
      @ok="questionsTakeOK"
      @cancel="modelCancel"
    >
      <a-checkbox-group
        v-if="questions.length > 0"
        :value="changeQuestions"
        :options="questions"
        @change="questionsChange"
      />
      <a-empty v-else />
    </a-modal>
  </div>
</template>

<script>
import CONFIG from "@/utils/common";
import { SlickList, SlickItem } from "vue-slicksort";
import { commonConditions } from "@/api/common";
import { getToken } from "@/api/qiniu";
import { productQuoteInfo, productDetail } from "@/api/shelves-recycle";
// function getBase64(img, callback) {
//   const reader = new FileReader();
//   reader.addEventListener("load", () => callback(reader.result));
//   reader.readAsDataURL(img);
// }

// const QINIU_SERVER = "https://up.qiniup.com";
// const QINIU_SERVER = "https://up-z2.qiniup.com";
// const IMAGE_HOST = 'https://resource.tanwuapp.com/';
// const IMAGE_HOST = "http://test.resource.tanwuapp.com/";

const QINIU_SERVER = CONFIG.QINIU_SERVER;

export default {
  components: {
    SlickList,
    SlickItem
  },
  data() {
    this.form = this.$form.createForm(this);
    return {
      formItemLayout: {
        labelCol: { span: 8 },
        wrapperCol: { span: 6 }
      },
      QINIU_SERVER,
      // IMAGE_HOST,
      imageUrl: "",
      loading: false,
      status: 0,
      categories: [],
      products: [],
      questions: [],
      selectCategories: [],
      changeQuestions: [],
      selectQuestions: [],
      uploadToken: "",
      fileKey: "",
      fieldAHelp: "",
      fieldAStauts: "",
      questionsHelp: "",
      questionsStauts: "",
      quoteTemplateId: "",
      dragItems: [],
      modelVisible: false,
      productData: {},
      isEditor: false
    };
  },

  // beforeCreate() {
  //   this.form = this.$form.createForm(this);
  // },

  mounted() {
    this.getCommonConditions();
  },
  watch: {
    imageUrl(val) {
      if (val) {
        this.fieldAStauts = "success";
        this.fieldAHelp = "";
      }
    },
    dragItems(val) {
      if (val.length > 0) {
        this.questionsHelp = "";
        this.questionsStauts = "success";
      }
    }
  },
  methods: {
    questionsTakeOK() {
      console.log(this.selectQuestions);
      //每次选择新的评估项目时，按照之前已选排序做增删
      if (this.selectQuestions.length > 0) {
        const a = this.changeQuestions.filter(item => !this.selectQuestions.includes(item));
        const b = this.selectQuestions.filter(item => !this.changeQuestions.includes(item));
        const c = this.selectQuestions.filter(item => !b.includes(item));
        this.selectQuestions = [...c, ...a];
      } else {
        this.selectQuestions = this.changeQuestions;
      }
      console.log(this.selectQuestions);
      //根据value筛选出已选择的项目
      const newItems = this.questions.filter(item => this.selectQuestions.includes(item.value));
      //根据已选的value排序
      newItems.sort((a, b) => this.selectQuestions.indexOf(a.value) - this.selectQuestions.indexOf(b.value));
      this.dragItems = newItems;
      this.modelVisible = false;
    },

    questionsChange(value) {
      console.log(value);
      this.changeQuestions = value;
    },

    deleteDragClick(value) {
      this.dragItems.splice(
        this.dragItems.findIndex(item => item.value === value),
        1
      );
      this.selectQuestions.splice(
        this.selectQuestions.findIndex(item => item === value),
        1
      );
      this.changeQuestions = this.selectQuestions;
    },

    modelCancel() {
      this.modelVisible = false;
      this.changeQuestions = this.selectQuestions;
    },

    handelAdd() {
      if (this.selectCategories.length > 0) {
        this.modelVisible = true;
      } else {
        this.$message.error("请先选择商品分类");
      }
    },

    getChangeList(value) {
      const sortQuestions = [];
      for (let item of value) {
        sortQuestions.push(item.value);
      }
      this.selectQuestions = sortQuestions;
      console.log(this.selectQuestions);
      this.dragItems = value;
    },

    getCommonConditions() {
      commonConditions(201).then(response => {
        console.log(response);
        const { categories } = response.details;
        this.categories.push(...this.getCategories(categories));
        if (this.$route.query.recycleProductId) {
          this.isEditor = true;
          this.getProductData(this.$route.query.recycleProductId);
        }
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

    categoriesChange(value, isInit = false) {
      console.log(value);
      console.log(isInit);
      if (this.selectCategories[this.selectCategories.length - 1] === value[value.length - 1]) {
        return;
      }
      this.selectCategories = value;
      this.form.setFieldsValue({ productId: "" });
      // this.selectQuestions = [];
      this.changeQuestions = [];
      this.dragItems = [];
      productQuoteInfo(value[value.length - 1]).then(response => {
        console.log(response);
        const { products, questions, quoteTemplateId } = response.details;
        this.products = products;
        const newQuestions = [];
        for (let item of questions) {
          const newItem = { label: item.name, value: item.questionId };
          newQuestions.push(newItem);
        }
        this.questions = newQuestions;
        this.quoteTemplateId = quoteTemplateId;
        if (isInit) {
          if (this.productData.productId) {
            this.form.setFieldsValue({ productId: this.productData.productId });
          }
          if (this.productData.questionIds && this.productData.questionIds.length > 0) {
            this.changeQuestions = this.productData.questionIds;
            this.questionsTakeOK();
          }
        }
      });
    },

    getProductData(recycleProductId) {
      productDetail(recycleProductId).then(response => {
        console.log(response);
        const { details } = response;
        this.productData = details;
        this.status = details.status;
        this.imageUrl = details.image;
        for (let item of this.categories) {
          if (item.value === details.firstCategoryId.toString()) {
            let selectCategories = [];
            if (item.children && item.children.length > 0) {
              selectCategories = [
                item.value,
                ...this.getSelectCategories(item.children, details.categoryId.toString())
              ];
            } else {
              selectCategories = [item.value];
            }
            console.log(selectCategories);
            this.form.setFieldsValue({ categories: selectCategories });
            this.categoriesChange(selectCategories, true);
            break;
          }
        }
      });
    },

    getSelectCategories(categories, id) {
      for (let item of categories) {
        if (item.value === id) {
          return [item.value];
        }
        if (item.children && item.children.length > 0) {
          let node = this.getSelectCategories(item.children, id);
          if (node !== undefined) {
            return [item.value, ...node];
          }
        }
      }
    },

    handleSubmit() {
      const { form } = this;
      let isImageUrl = true;
      if (!this.imageUrl) {
        this.fieldAStauts = "error";
        this.fieldAHelp = "请上传商品图片！";
        isImageUrl = false;
      }
      let isDragItems = true;
      if (!this.dragItems.length) {
        this.questionsHelp = "请选择评估项目！";
        this.questionsStauts = "error";
        isDragItems = false;
      }
      form.validateFields((err, values) => {
        if (!err && isImageUrl && isDragItems) {
          console.log("values: ", values);
          let recycleMarketPrice = "";
          let quantity = "";
          if (this.isEditor) {
            recycleMarketPrice = this.productData.recycleMarketPrice;
            quantity = this.productData.quantity;
          }
          // $store.commit({
          //   type: "shelvesRecycle/saveReleaseFormData",
          //   payload: {
          //     status: this.status,
          //     image: this.imageUrl,
          //     quoteTemplateId: this.quoteTemplateId,
          //     questions: this.selectQuestions,
          //     recycleMarketPrice,
          //     quantity,
          //     ...values
          //   }
          // });

          const requestData = {
            status: this.status,
            image: this.imageUrl,
            quoteTemplateId: this.quoteTemplateId,
            questions: this.selectQuestions,
            recycleMarketPrice,
            quantity,
            ...values
          };

          localStorage.setItem(
            `shelvesRecycleData${this.$route.query.recycleProductId || ""}`,
            JSON.stringify(requestData)
          );
          this.$emit("nextStep", values.productId);
        }
      });
    },

    normFile(info) {
      console.log("上传的数据:", info);
      if (info.file.status === "uploading") {
        this.loading = true;
        return;
      }
      if (info.file.status === "done") {
        // getBase64(info.file.originFileObj, imageUrl => {
        //   this.imageUrl = imageUrl;
        // });
        this.imageUrl = CONFIG.IMAGE_HOST + info.file.response.key;
        this.loading = false;
        this.$message.success(`${info.file.name} 上传成功`);
      } else if (info.file.status === "error") {
        this.$message.error(`${info.file.name} 上传失败.`);
      }
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
<style>
.picture-uploader > .ant-upload {
  width: 128px;
  height: 128px;
}
.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}

.SortableList {
  width: 320px;
  background-color: #f3f3f3;
  border: 1px solid #efefef;
  border-radius: 3;
}
.SortableItem {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 3px 12px;
  background-color: #fff;
  border-bottom: 1px solid #efefef;
  box-sizing: border-box;
  user-select: none;
}
.extra {
  color: #999;
  font-size: 13px;
}
</style>
