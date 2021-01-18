<template>
  <div>
    <a-modal
      title="质检报告"
      :visible="visible"
      :footer="null"
      :bodyStyle="bodyStyle"
      @cancel="cancel"
    >
      <a-card :bordered="false">
        <div slot="title" class="row-align-center">
          <span class="m-right-12">{{ qcData.productName }}</span>
          <a-tag color="orange" v-if="qcData.noSameNum !== 0">不完全一致</a-tag>
        </div>
        <div class="space-between-align-center">
          <span>预估价</span>
          <span class="line-through">￥{{ qcData.apprizeAmount }}</span>
        </div>
        <div class="space-between-align-center m-top-12">
          <span>质检价</span>
          <span class="color-red font-size-16">￥{{ qcData.qcPrice }}</span>
        </div>
      </a-card>
      <a-card title="质检说明" class="m-top-12" :bordered="false">
        <span>{{ qcData.qcExplain }}</span>
        <div class="flex-wrap" v-if="qcData.qcImgUrl && qcData.qcImgUrl.length">
          <img
            class="img-view"
            v-for="(item, index) in qcData.qcImgUrl"
            :key="index"
            :src="item + '?imageView2/0/format/webp'"
            @click="handlePreview(item)"
          />
        </div>

        <div
          class="flex-wrap"
          v-if="qcData.qcVideoUrl && qcData.qcVideoUrl.length"
        >
          <div
            class="video-view column-justify-align-center"
            v-for="(item, index) in qcData.qcVideoUrl"
            :key="index"
            @click="handleVideoPreview(item)"
          >
            <a-icon
              :style="{ fontSize: '20px' }"
              type="play-circle"
              theme="twoTone"
            />
          </div>
        </div>
      </a-card>
      <a-card
        v-if="qcData.noSameNum !== 0"
        :title="`不一致的检测项（${qcData.noSameNum}项）`"
        class="m-top-12"
        :bordered="false"
      >
        <div v-for="(item, index) in qcData.noSameQuestions" :key="index">
          <div class="space-between">
            <span class="color-orange">{{ item.questionName }}</span>
            <div class="column-flexbox">
              <div style="text-align: right;">
                <span v-for="(cItem, cIndex) in item.qcAnswers" :key="cIndex">
                  {{ cItem.answerName
                  }}{{ cIndex !== item.qcAnswers.length - 1 ? "，" : "" }}
                </span>
              </div>

              <div class="m-top-6" style="text-align: right;">
                <span
                  v-for="(xItem, cIndex) in item.userAnswers"
                  :key="'userAnswers-' + cIndex"
                >
                  {{ cIndex === 0 ? "自主评估为：" : "" }}{{ xItem.answerName
                  }}{{ cIndex !== item.userAnswers.length - 1 ? "，" : "" }}
                </span>
              </div>
            </div>
          </div>
          <a-divider v-if="index < qcData.noSameQuestions.length - 1" />
        </div>
      </a-card>
      <a-card
        :title="`一致的检测项（${qcData.sameNum}项）`"
        class="m-top-12"
        :bordered="false"
      >
        <div
          class="space-between-align-center"
          :class="{ 'm-top-12': index !== 0 }"
          v-for="(item, index) in qcData.sameQuestions"
          :key="index"
        >
          <span>{{ item.questionName }}</span>
          <div class="column-align-center">
            <span v-for="(cItem, cIndex) in item.answers" :key="cIndex">
              {{ cItem.answerName }}
            </span>
          </div>
        </div>
      </a-card>

      <a-card title="订单信息" class="m-top-12" :bordered="false">
        <div class="space-between-align-center">
          <span>订单编号</span>
          <span>{{ qcData.orderNumber }}</span>
        </div>
        <div class="space-between-align-center m-top-12">
          <span>质检时间</span>
          <span>{{ qcData.qcDate }}</span>
        </div>
        <div class="space-between-align-center m-top-12">
          <span>质检员</span>
          <span>{{ qcData.qcPerson }}</span>
        </div>
        <div class="space-between-align-center m-top-12">
          <span>议价员</span>
          <span>{{ qcData.bargainPerson }}</span>
        </div>
      </a-card>
    </a-modal>

    <a-modal
      width="400px"
      destroyOnClose
      :visible="previewVisible"
      :footer="null"
      @cancel="handleCancel"
    >
      <img alt="example" style="width: 100%" :src="previewImage" />
    </a-modal>

    <a-modal
      width="400px"
      destroyOnClose
      :visible="videoVisible"
      :footer="null"
      @cancel="
        () => {
          this.videoVisible = false;
        }
      "
    >
      <video style="width: 100%" controls autoplay>
        <source :src="previewVideo" type="video/mp4" />
      </video>
    </a-modal>
  </div>
</template>

<script>
export default {
  props: {
    qcVisible: {
      type: Boolean,
      default: false
    },
    qcData: {
      type: Object,
      default() {
        return {};
      }
    }
  },

  watch: {
    qcVisible(val) {
      this.visible = val;
    },

    qcData(val) {
      if (val.qcImgUrl) {
        val.qcImgUrl = val.qcImgUrl.split(",");
      }

      if (val.qcVideoUrl) {
        val.qcVideoUrl = val.qcVideoUrl.split(",");
      }
    }
  },

  data() {
    return {
      qcAnswers: ["全新", "二手"],
      visible: false,
      previewVisible: false,
      videoVisible: false,
      previewImage: "",
      previewVideo: "",
      bodyStyle: {
        backgroundColor: "rgb(236, 236, 236)",
        maxHeight: "600px",
        overflow: "auto"
      }
    };
  },
  methods: {
    handleCancel() {
      this.previewVisible = false;
    },
    handlePreview(url) {
      this.previewImage = url;
      this.previewVisible = true;
    },

    handleVideoPreview(url) {
      this.previewVideo = url;
      this.videoVisible = true;
    },
    cancel() {
      this.visible = false;
      this.$emit("update:qcVisible", this.visible);
    }
  }
};
</script>

<style lang="less" scoped>
.flex-wrap {
  display: flex;
  flex-flow: row wrap;
  margin-top: 12px;
  // justify-content: center;
}

.img-view {
  display: block;
  width: 76px;
  // height: 96px;
  margin-right: 5px;
  margin-bottom: 5px;
}

.video-view {
  width: 76px;
  height: 96px;
  margin-right: 5px;
  margin-bottom: 5px;
  background-color: rgb(236, 236, 236);
}
</style>
