<template>
  <div>
    <a-form-model ref="form" v-bind="formItemLayout">
      <a-form-model-item label="商品缩略图" :required="true">
        <template slot="extra">
          <a-alert
            message="商品列表中的缩略图，最多上传1张，建议尺寸800*800像素，60Kb以内JPEG或PNG图片"
            style="margin-top:10px"
            type="info"
            show-icon
            closable
          />
        </template>
        <a-upload
          name="file"
          :action="QINIU_SERVER"
          :data="getUploadToken"
          :before-upload="obj => beforeUpload(obj, 1)"
          @change="obj => normFile(obj, 1)"
          list-type="picture"
          :file-list="fileList_1"
        >
          <a-button icon="upload">图片</a-button>
        </a-upload>
      </a-form-model-item>

      <a-form-model-item label="商品轮播图" :required="true">
        <template slot="extra">
          <a-alert
            message="商品详情中的轮播图，最多上传9张，建议尺寸1000*800像素，2M以内JPEG或PNG图片"
            style="margin-top:10px"
            type="info"
            show-icon
            closable
          />
        </template>
        <a-upload
          name="file"
          multiple
          :action="QINIU_SERVER"
          :data="getUploadToken"
          :before-upload="obj => beforeUpload(obj, 3)"
          @change="obj => normFile(obj, 3)"
          list-type="picture"
          :file-list="fileList_3"
        >
          <a-button icon="upload">图片</a-button>
        </a-upload>
      </a-form-model-item>

      <a-form-model-item label="商品详情图" :required="true">
        <template slot="extra">
          <a-alert
            message="商品详情中的详细介绍图，可上传多张，建议尺寸1000*2000像素，2M以内JPEG或PNG图片"
            style="margin-top:10px"
            type="info"
            show-icon
            closable
          />
        </template>
        <a-upload
          name="file"
          multiple
          :action="QINIU_SERVER"
          :data="getUploadToken"
          :before-upload="obj => beforeUpload(obj, 4)"
          @change="obj => normFile(obj, 4)"
          list-type="picture"
          :file-list="fileList_4"
        >
          <a-button icon="upload">图片</a-button>
        </a-upload>
      </a-form-model-item>

      <a-form-model-item :wrapper-col="{ span: 12, offset: 7 }">
        <a-button @click="prevStep" :disabled="loading">上一步</a-button>
        <a-button style="margin-left: 24px" :loading="loading" type="primary" @click="handleSubmit">提交</a-button>
      </a-form-model-item>
    </a-form-model>
  </div>
</template>

<script>
import CONFIG from "@/utils/common";
import { getToken } from "@/api/qiniu";
import { productSaveOrUpdate } from "@/api/shelves-lease";
import { mapGetters } from "vuex";
import { closeToolItem, onRefreshAndDelete } from "@/utils/toolBarUtils";
const QINIU_SERVER = CONFIG.QINIU_SERVER;
export default {
  data() {
    return {
      formItemLayout: {
        labelCol: { span: 7 },
        wrapperCol: { span: 7 }
      },
      loading: false,
      QINIU_SERVER,
      uploadToken: "",
      fileKey: "",
      // 1 商品缩略图 2 商品视频 3 轮播图 4 商品详情图
      mediaType: 1,
      fileList_1: [],
      fileList_3: [],
      fileList_4: []
    };
  },

  props: {
    productData: {
      type: Object,
      default: () => {}
    }
  },

  computed: {
    ...mapGetters("tagsView", {
      toolDatas: "getToolData"
    })
  },

  mounted() {
    if (this.$route.query.rentProductId) {
      console.log(this.productData);
      for (let item of this.productData.media) {
        const data = {
          uid: item.url.slice(item.url.lastIndexOf("/") + 1),
          name: `${item.url.slice(item.url.lastIndexOf("/") + 1)}.png`,
          status: "done",
          url: item.url,
          mediaType: item.type
        };
        switch (item.type) {
          case 1:
            this.fileList_1.push(data);
            break;
          case 3:
            this.fileList_3.push(data);
            break;
          case 4:
            this.fileList_4.push(data);
            break;
        }
      }
    }
  },

  methods: {
    releaseData() {
      return JSON.parse(localStorage.getItem(`shelvesLeaseData${this.$route.query.rentProductId || ""}`));
    },
    handleSubmit() {
      if (this.fileList_1.length === 0) {
        this.$message.warning("商品缩略图不能为空!");
        return;
      }
      if (this.fileList_3.length === 0) {
        this.$message.warning("商品轮播图不能为空!");
        return;
      }
      if (this.fileList_4.length === 0) {
        this.$message.warning("商品详情图不能为空!");
        return;
      }

      this.loading = true;

      const fileList = [...this.fileList_1, ...this.fileList_3, ...this.fileList_4];
      // const media = [
      //   { type: 1, url: "http://test.resource.tanwuapp.com/1603874972493" },
      //   { type: 3, url: "http://test.resource.tanwuapp.com/1603874972493" },
      //   { type: 4, url: "http://test.resource.tanwuapp.com/1603874972493" }
      // ];
      const media = [];
      for (let item of fileList) {
        media.push({
          type: item.mediaType,
          url: item.url
        });
      }
      // console.log(JSON.stringify(media));
      const requestData = {
        productId: this.releaseData().productId,
        status: this.releaseData().status,
        name: this.releaseData().name,
        customizeRentTime: this.releaseData().customizeRentTime,
        freightTemplateId: this.releaseData().freightTemplateId,
        alipayPreAuthCategoryCode: this.releaseData().alipayPreAuthCategoryCode,
        desc: this.releaseData().desc,
        accessories: this.releaseData().accessories,
        brandId: this.releaseData().brandId,
        categoryIds: this.releaseData().categoryIds,
        enableBuyout: this.releaseData().enableBuyout,
        enableRenew: this.releaseData().enableRenew,
        enableVirtualStock: this.releaseData().enableVirtualStock,
        skus: this.releaseData().skus,
        tags: this.releaseData().tags,
        regulationIds: this.releaseData().regulationIds,
        channelIds: this.releaseData().channelIds,
        media

        // productId: 346,
        // status: 1,
        // name: "商品啊117",
        // customizeRentTime: false,
        // // freightTemplateId: this.releaseData.freightTemplateId,
        // alipayPreAuthCategoryCode: 1,
        // desc: "aa",
        // accessories: [
        //   {
        //     name: "是的",
        //     quantity: 2,
        //     price: 23,
        //     accessoryUnit: "是的",
        //     imageUrl: "http://test.resource.tanwuapp.com/1603873745548"
        //   }
        // ],
        // brandId: 2,
        // categoryIds: ["1", "3"],
        // enableBuyout: false,
        // enableRenew: false,
        // enableVirtualStock: false,
        // skus: [
        //   {
        //     skuId: 8421,
        //     depositAmount: 23,
        //     insuranceStatus: 0,
        //     insurancePrice: 23,
        //     buyoutPrice: 23,
        //     marketPrice: 23,
        //     virtualStockNum: 23,
        //     rentTimes: [{ rentTimeId: "5", days: "90", dayRentAmount: 23 }]
        //   }
        // ],
        // tags: ["是的"],
        // regulationIds: ["1"],
        // channelIds: ["2"],
        // media
      };

      if (this.$route.query.rentProductId) {
        requestData.rentProductId = this.$route.query.rentProductId;
      }

      // console.log(requestData);
      // localStorage.setItem(`shelvesLeaseData${this.$route.query.rentProductId || ""}`, JSON.stringify(requestData));

      productSaveOrUpdate(requestData)
        .then(response => {
          console.log(response);
          this.loading = false;
          localStorage.removeItem(`shelvesLeaseData${this.$route.query.rentProductId || ""}`);
          const closeToolbar = this.toolDatas.find(item => item.detail === this.$route.fullPath);
          const refreshToolbar = this.toolDatas.find(item => item.detail === "/shelves/shelves-lease");
          if (refreshToolbar) {
            onRefreshAndDelete(refreshToolbar, closeToolbar);
          } else {
            closeToolItem(closeToolbar);
            this.$router.push({
              path: "/shelves/shelves-lease"
            });
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },

    prevStep() {
      this.$emit("prevStep");
    },

    // mediaType: 1 商品缩略图 2 商品视频 3 轮播图 4 商品详情图
    normFile(info, mediaType) {
      console.log("上传的数据:", info);
      let fileList = [...info.fileList];
      if (mediaType === 1) {
        fileList = fileList.slice(-1);
      }
      fileList = fileList.map(file => {
        if (file.response) {
          file.url = CONFIG.IMAGE_HOST + file.response.key;
          file.mediaType = mediaType;
        }
        return file;
      });
      switch (mediaType) {
        case 1:
          this.fileList_1 = fileList;
          break;
        case 3:
          this.fileList_3 = fileList;
          break;
        case 4:
          this.fileList_4 = fileList;
          break;
      }
    },

    //限制用户上传的图片格式和大小。
    beforeUpload(file, mediaType) {
      //   console.log(file);
      const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
      if (!isJpgOrPng) {
        this.$message.error("仅支持JPG/PNG格式的文件!");
      }
      const isLt60k = file.size / 1024 / 1024 < 0.06;
      const isLt2M = file.size / 1024 / 1024 < 2;
      let isLimt = true;
      if (mediaType === 1 && !isLt60k) {
        this.$message.error("图片大小必须小于60KB！");
        isLimt = false;
      }

      if (mediaType !== 1 && !isLt2M) {
        this.$message.error("图片大小必须小于2M！");
        isLimt = false;
      }

      const _promise = new Promise((resolve, reject) => {
        if (isJpgOrPng && isLimt) {
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

<style></style>
