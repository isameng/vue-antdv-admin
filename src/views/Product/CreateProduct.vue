<template>
  <div>
    <a-form-model ref="form" :model="form" :rules="rules" v-bind="formItemLayout">
      <a-form-model-item label="商品名称" prop="brandId">
        <a-select v-model="form.brandId" placeholder="品牌" @change="brandsChange">
          <a-select-option v-for="item in brands" :key="item.value" :value="item.value">
            {{ item.key }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
    </a-form-model>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  }
};
</script>

<style></style>
