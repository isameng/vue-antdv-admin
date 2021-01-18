<template>
  <div>
    <a-drawer
      title="隐藏菜单"
      placement="right"
      :closable="false"
      :visible="visible"
      :after-visible-change="afterVisibleChange"
      @close="onClose"
      width="300px"
    >
      <template v-slot:handle>
        <div class="handle" @click="visible = !visible">
          <a-icon :type="visible ? 'close' : 'setting'"></a-icon>
        </div>
      </template>
      <div>
        <h4>主题颜色</h4>
        <a-radio-group
          style="margin-bottom: 36px;"
          :value="$route.query.navTheme || 'dark'"
          @change="e => handleSettingChange('navTheme', e.target.value)"
        >
          <a-radio value="dark">黑色</a-radio>
          <a-radio value="light">白色</a-radio>
        </a-radio-group>
        <!-- <h3 style="margin-top:10px">导航模式</h3>
        <a-radio-group
          :value="$route.query.navLayout || 'left'"
          @change="e => handleSettingChange('navLayout', e.target.value)"
        >
          <a-radio value="left">左侧</a-radio>
          <a-radio value="top">顶部</a-radio>
        </a-radio-group>-->
        <a-upload-dragger
          name="file"
          :action="QINIU_SERVER"
          :data="getUploadToken"
          :file-list="fileList"
          :before-upload="beforeUpload"
          @change="handleChange"
          @preview="handlePreview"
        >
          <p class="ant-upload-drag-icon">
            <a-icon type="inbox" />
          </p>
          <p class="ant-upload-text">斌爷专属上传图片工具</p>
          <p class="ant-upload-hint">
            支持拖拽、点击上传，图片大小限制3M，仅支持JPG/PNG格式的文件!
          </p>
        </a-upload-dragger>

        <div class="m-top-12 pointer" @click="copyItem(taobaoUrl[0])">
          {{ taobaoUrl[0] }}
        </div>
        <div class="m-top-12 pointer" @click="copyItem(taobaoUrl[1])">
          {{ taobaoUrl[1] }}
        </div>
      </div>
    </a-drawer>
  </div>
</template>
<script>
import CONFIG from "@/utils/common";
import { getToken } from "@/api/qiniu";
import { uploadTaoBaoImage } from "@/api/common";
const QINIU_SERVER = CONFIG.QINIU_SERVER;
export default {
  data() {
    return {
      visible: false,
      QINIU_SERVER,
      fileKey: "",
      uploadToken: "",
      imageUrl: "",
      taobaoUrl: "",
      fileList: []
    };
  },

  methods: {
    handlePreview(file) {
      this.$copyText(file.name).then(
        () => {
          this.$message.success("复制成功");
        },
        () => {
          this.$message.error("复制失败");
        }
      );
    },

    copyItem(name) {
      this.$copyText(name).then(
        () => {
          this.$message.success("复制成功");
        },
        () => {
          this.$message.error("复制失败");
        }
      );
    },
    handleChange(info) {
      let fileList = [...info.fileList];
      fileList = fileList.map(file => {
        if (file.response) {
          file.name = CONFIG.IMAGE_HOST + file.response.key;
        }
        return file;
      });
      this.fileList = fileList;
      // if (info.file.status === "uploading") {
      //   return;
      // }
      if (info.file.status === "done") {
        this.$message.success(`${info.file.name} 上传成功`);
        // setTimeout(() => {

        // }, 1000);
        uploadTaoBaoImage(CONFIG.IMAGE_HOST + info.file.response.key).then(
          response => {
            console.log(response);
            this.taobaoUrl = response.details.split(",");
            // notification.open({
            //   message: "上传成功",
            //   description: response.details,
            //   placement: "topLeft",
            //   duration: 0
            // });
          }
        );
      } else if (info.file.status === "error") {
        this.$message.error(`${info.file.name} 上传失败.`);
      }
    },
    //限制用户上传的图片格式和大小。
    beforeUpload(file) {
      const isJpgOrPng =
        file.type === "image/jpeg" || file.type === "image/png";
      if (!isJpgOrPng) {
        this.$message.error("仅支持JPG/PNG格式的文件!");
      }
      const isLt3M = file.size / 1024 / 1024 < 3;
      if (!isLt3M) {
        this.$message.error("图片大小必须小于3M！");
      }

      const _promise = new Promise((resolve, reject) => {
        if (isJpgOrPng && isLt3M) {
          const key =
            Date.now() +
            Math.floor(Math.random() * (999999 - 100000) + 100000) +
            1;

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
    afterVisibleChange(val) {
      console.log("visible", val);
    },
    // onChange(e, type) {
    //   console.log("radio checked", e.target.value);
    //   console.log("radio type", type);

    //   this.handleSettingChange(type, e.target.value);
    // },
    handleSettingChange(type, value) {
      this.$router.push({ query: { ...this.$route.query, [type]: value } });
    },
    // showDrawer() {
    //   this.visible = true;
    // },
    onClose() {
      this.visible = false;
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
.handle {
  position: absolute;
  right: 300px;
  top: 240px;
  width: 48px;
  height: 48px;
  background-color: #1890ff;
  color: white;
  font-size: 20px;
  text-align: center;
  line-height: 48px;
  border-radius: 3px 0 0 3px;
}
</style>
