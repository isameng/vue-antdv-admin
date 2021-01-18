<template>
  <span>
    {{ content }}
    <a-popover overlayClassName="popover">
      <template slot="content">{{ popoverContent }}</template>
      <a-icon type="question-circle" style="color: #999999" />
    </a-popover>
  </span>
</template>

<script>
export default {
  props: {
    content: {
      type: String
    },
    popoverContent: {
      type: String
    }
  }
};
</script>

<style>
.popover {
  max-width: 300px;
}
</style>
