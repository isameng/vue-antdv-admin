<template>
  <div>
    <a-form-model ref="form" v-bind="formItemLayout">
      <a-form-model-item label="商品标签" :required="true">
        <template slot="extra">
          <a-tag color="orange">输入回车后添加标签</a-tag>
        </template>

        <template v-for="tag in tags">
          <a-tooltip v-if="tag.length > 20" :key="tag" :title="tag">
            <a-tag :key="tag" closable @close="() => handleClose(tag)">
              {{ `${tag.slice(0, 20)}...` }}
            </a-tag>
          </a-tooltip>
          <a-tag v-else :key="tag" closable @close="() => handleClose(tag)">
            {{ tag }}
          </a-tag>
        </template>

        <a-input
          v-if="inputVisible"
          ref="input"
          type="text"
          size="small"
          :style="{ width: '78px' }"
          v-model.trim="inputValue"
          @blur="handleInputConfirm"
          @keyup.enter="handleInputConfirm"
        />
        <a-tag v-else style="background: #fff; borderStyle: dashed;" @click="showInput">
          <a-icon type="plus" />
          新标签
        </a-tag>
      </a-form-model-item>

      <a-form-model-item label="常见问题" :wrapper-col="{ span: 10 }">
        <div class="content-view">
          <span style="color: #bfbfbf" v-if="regulationSelect.length === 0">请编辑常见问题</span>
          <span v-else v-for="item of regulationSelect" :key="item.value">{{ item.title }}</span>
        </div>
        <span style="color: #1890ff; cursor: pointer" @click="showRegulationModal">编辑常见问题</span>
      </a-form-model-item>

      <a-form-model-item label="上架渠道">
        <a-select mode="multiple" v-model="channelIds" placeholder="选择上架渠道">
          <a-select-option v-for="item of rentProductChannelList" :key="item.value">
            {{ item.key }}
          </a-select-option>
        </a-select>
      </a-form-model-item>

      <a-form-model-item :wrapper-col="{ span: 12, offset: 7 }">
        <a-button @click="prevStep">上一步</a-button>
        <a-button style="margin-left: 24px" type="primary" @click="handleSubmit">下一步</a-button>
      </a-form-model-item>
    </a-form-model>

    <a-modal
      :visible="regulationVisible"
      title="编辑常见问题"
      :width="1050"
      @cancel="handleRegulationCancel"
      :footer="null"
    >
      <a-transfer
        :data-source="rentRegulationList"
        :titles="['待选择的常见问题列表', '已选择的常见问题列表']"
        :list-style="{
          width: '450px',
          height: '500px'
        }"
        :operations="['移入', '移出']"
        :target-keys="regulationIds"
        :rowKey="record => record.value"
        :render="item => item.title"
        show-search
        :filter-option="filterOption"
        @change="handleChange"
      />
    </a-modal>
  </div>
</template>

<script>
import { commonConditions } from "@/api/common";
export default {
  data() {
    return {
      formItemLayout: {
        labelCol: { span: 7 },
        wrapperCol: { span: 7 }
      },
      regulationVisible: false,
      inputVisible: false,
      inputValue: "",
      tags: [],
      channelIds: [],
      regulationIds: [],
      regulationSelect: [],

      rentRegulationList: [],
      rentProductChannelList: []
    };
  },

  props: {
    productData: {
      type: Object,
      default: () => {}
    }
  },

  mounted() {
    this.initData();
  },

  methods: {
    initData() {
      commonConditions("206,208").then(response => {
        response.details.rentRegulationList.map(item => {
          item.title = item.key;
        });
        this.rentRegulationList = response.details.rentRegulationList;
        this.rentProductChannelList = response.details.rentProductChannelList;

        if (this.$route.query.rentProductId) {
          console.log(this.productData);
          this.tags = this.productData.tags;
          this.regulationIds = this.productData.regulationIds;
          this.regulationSelect = this.rentRegulationList.filter(item =>
            this.productData.regulationIds.includes(item.value)
          );
          this.channelIds = this.productData.channelIds;
        }
      });
    },

    showRegulationModal() {
      this.regulationVisible = true;
    },

    handleRegulationCancel() {
      this.regulationVisible = false;
    },

    handleClose(removedTag) {
      const tags = this.tags.filter(tag => tag !== removedTag);
      // console.log(tags);
      this.tags = tags;
    },

    showInput() {
      this.inputVisible = true;
      this.$nextTick(function() {
        this.$refs.input.focus();
      });
    },

    handleInputConfirm() {
      const inputValue = this.inputValue;
      let tags = this.tags;
      if (inputValue && tags.indexOf(inputValue) === -1) {
        tags = [...tags, inputValue];
      }
      // console.log(tags);
      Object.assign(this, {
        tags,
        inputVisible: false,
        inputValue: ""
      });
    },

    filterOption(inputValue, option) {
      return option.title.indexOf(inputValue) > -1;
    },

    handleChange(nextTargetKeys) {
      this.regulationIds = nextTargetKeys;
      this.regulationSelect = this.rentRegulationList.filter(item => nextTargetKeys.includes(item.value));
      // console.log("regulationIds: ", nextTargetKeys);
      // console.log("direction: ", direction);
      // console.log("moveKeys: ", moveKeys);
    },

    handleSubmit() {
      if (this.tags.length === 0) {
        this.$message.warning("商品标签不能为空!");
        return;
      }
      // const { $store } = this;
      // $store.commit({
      //   type: "shelvesLease/saveReleaseFormData",
      //   payload: {
      //     tags: this.tags,
      //     regulationIds: this.regulationIds,
      //     channelIds: this.channelIds
      //   }
      // });

      const requestData = {
        tags: this.tags,
        regulationIds: this.regulationIds,
        channelIds: this.channelIds
      };

      localStorage.setItem(`shelvesLeaseData${this.$route.query.rentProductId || ""}`, JSON.stringify({ ...this.releaseData(), ...requestData }));

      this.$emit("nextStep");
    },

    releaseData() {
      return JSON.parse(localStorage.getItem(`shelvesLeaseData${this.$route.query.rentProductId || ""}`));
    },

    prevStep() {
      this.$emit("prevStep");
    }
  }
};
</script>

<style>
.content-view {
  border: 1px solid #d9d9d9;
  background-color: white;
  border-radius: 4px;
  box-sizing: border-box;
  padding: 0 10px;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
}
</style>
