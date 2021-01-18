<template>
  <transition name="context-menu">
    <div class="context-menu" v-show="visible" :style="style" @mousedown.stop @contextmenu.prevent>
      <div class="menu-item" v-for="item in itemList" :key="item.key">
        <slot name="menuList" :menuName="item.text" :menuIcon="item.icon">
          <div @click="handleClick(item.key)">
            <a-icon class="menu-icon" v-if="item.icon" :type="item.icon" />
            <span>{{ item.text }}</span>
          </div>
        </slot>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "context-menu",
  data() {
    return {
      left: 0,
      top: 0,
      target: null
    };
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    itemList: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  computed: {
    style() {
      return {
        left: `${this.left}px`,
        top: `${this.top}px`
      };
    }
  },

  mounted() {
    //将弹窗组件插入body，脱离文档流，不与定义处的父组件产生关系，并且方便使用 event.clientX/Y
    document.body.appendChild(this.$el);
    document.addEventListener("mousedown", this.clickDocumentHandler);
    document.addEventListener("contextmenu", this.contextMenuHandler);
  },

  beforeDestroy() {
    //在组件销毁时，把自己从 body 中移除
    let popperElm = this.$el;
    if (popperElm && popperElm.parentNode === document.body) {
      document.body.removeChild(popperElm);
    }
    document.removeEventListener("mousedown", this.clickDocumentHandler);
    document.removeEventListener("contextmenu", this.contextMenuHandler);
  },

  methods: {
    clickDocumentHandler() {
      if (this.visible) {
        this.$emit("update:visible", false);
      }
    },
    contextMenuHandler(e) {
      // console.log(e);
      this.left = e.pageX;
      this.top = e.pageY;
      this.target = e.target;
    },

    handleClick(key) {
      this.$emit("select", key, this.target);
      this.clickDocumentHandler();
    }
  }
};
</script>

<style lang="less" scoped>
.context-menu {
  z-index: 1000;
  display: block;
  border-radius: 4px;
  box-shadow: -4px 4px 16px 1px;
  padding: 4px;
  background-color: white;
  position: absolute;
  &-enter,
  &-leave-to {
    opacity: 0;
  }

  &-enter-active,
  &-leave-active {
    transition: opacity 0.5s;
  }

  .menu-item {
    padding: 4px;
    cursor: pointer;
    &:hover {
      color: #1890ff;
    }
    .menu-icon {
      margin-right: 4px;
    }
  }
}
</style>
