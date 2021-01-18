<template>
  <a-modal
    title="预估报告"
    :visible="visible"
    :footer="null"
    :bodyStyle="bodyStyle"
    @cancel="cancel"
  >
    <a-card :title="predictData.productName" :bordered="false">
      <div class="space-between-align-center">
        <span>预估价</span>
        <span>￥{{ predictData.apprizeAmount }}</span>
      </div>
    </a-card>
    <a-card
      :title="`自主评估项（${predictData.accessNum}项）`"
      class="m-top-12"
      :bordered="false"
    >
      <div v-for="(item, index) in predictData.questions" :key="index">
        <div class="space-between-align-center">
          <span>{{ item.questionName }}</span>
          <div class="column-align-center">
            <span v-for="(cItem, cIndex) in item.answers" :key="cIndex">{{
              cItem.answerName
            }}</span>
          </div>
        </div>
        <a-divider v-if="index < predictData.questions.length - 1" />
      </div>
    </a-card>
  </a-modal>
</template>

<script>
export default {
  props: {
    predictVisible: {
      type: Boolean,
      default: false
    },
    predictData: {
      type: Object,
      default() {
        return {};
      }
    }
  },

  watch: {
    predictVisible(val) {
      this.visible = val;
    }
  },

  data() {
    return {
      visible: false,
      bodyStyle: {
        backgroundColor: "rgb(236, 236, 236)",
        maxHeight: "600px",
        overflow: "auto"
      }
    };
  },

  methods: {
    cancel() {
      this.visible = false;
      this.$emit("update:predictVisible", this.visible);
    }
  }
};
</script>
