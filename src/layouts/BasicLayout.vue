<template>
  <div :class="[`nav-theme-${navTheme}`]">
    <a-back-top />
    <!-- .sync 关键字实现双向绑定的原理与 @update:visible="visible => (contextMenuVisible = visible)" 一致  -->
    <!-- 具体可见文档 https://cn.vuejs.org/v2/guide/components-custom-events.html#sync-%E4%BF%AE%E9%A5%B0%E7%AC%A6 -->
    <ContextMenu :itemList="menuItemList" :visible.sync="contextMenuVisible" @select="onMenuSelect">
      <!-- 这段代码实现自定义具名插槽作用域的样式 -->
      <!-- <template v-slot:menuList="{ menuName, menuIcon }">
        <div>
          <a-icon v-if="menuIcon" :type="menuIcon" />
          <span>{{ menuName }}</span>
        </div>
      </template> -->
    </ContextMenu>
    <a-layout id="components-layout">
      <a-layout-sider class="sider-layout" :theme="navTheme" @collapse="onCollapse" collapsible>
        <a-icon slot="trigger" class="trigger" :type="collapsed ? 'menu-unfold' : 'menu-fold'" />
        <SiderMenu :theme="navTheme" :collapsed="collapsed" />
      </a-layout-sider>

      <a-layout :style="{ marginLeft: collapsed ? '80px' : '200px' }" class="container">
        <navbar />
        <a-layout-content>
          <!-- @edit="onEdit" -->
          <a-tabs
            type="editable-card"
            :hide-add="true"
            :activeKey="activePage"
            :tabBarGutter="3"
            @change="changePage"
            @contextmenu="showContextMenu"
          >
            <a-tab-pane v-for="item in getToolData" :key="item.detail" :closable="getToolData.length !== 1">
              <!-- #tab -->
              <div slot="tab" class="tab">
                <a-icon
                  @click="onRefresh(item)"
                  :class="['icon-sync', { hide: item.detail !== activePage }]"
                  :type="refreshLoading ? 'loading' : 'sync'"
                />
                <span class="title" :pagekey="item.detail">{{ item.name }}</span>
                <a-icon
                  v-if="getToolData.length !== 1"
                  @click.stop="closeToolItem(item)"
                  class="icon-close"
                  type="close"
                />
              </div>
              <!-- <template v-slot:tab>
                <span :pagekey="item.detail">{{ item.name }}</span>
              </template> -->
            </a-tab-pane>
          </a-tabs>
          <router-view />
        </a-layout-content>

        <a-layout-footer style="text-align: center">
          <Footer />
        </a-layout-footer>
      </a-layout>
    </a-layout>
    <!-- <Authorized :authority="['ameng']">
      <SettingDrawer />
    </Authorized> -->
  </div>
</template>

<script>
import Navbar from "./Navbar";
import Footer from "./Footer";
import SiderMenu from "./SiderMenu";
// import SettingDrawer from "../components/SettingDrawer";
import ContextMenu from "@/components/ContextMenu";
import { mapGetters } from "vuex";

export default {
  name: "BasicLayout",

  components: {
    Navbar,
    Footer,
    SiderMenu,
    // SettingDrawer,
    ContextMenu
  },

  data() {
    return {
      refreshLoading: false,
      activePage: "",
      collapsed: false,
      contextMenuVisible: false
    };
  },

  created() {
    this.activePage = this.$route.fullPath;
  },

  mounted() {
    this.getRoutesData(this.$route);
  },

  computed: {
    navTheme() {
      return this.$route.query.navTheme || "dark";
    },

    menuItemList() {
      return [
        { key: "1", icon: "sync", text: "刷新" },
        { key: "2", icon: "close", text: "关闭其他" }
      ];
    },

    ...mapGetters("tagsView", ["getToolData", "getCacheView"])
  },

  watch: {
    $route() {
      this.getRoutesData(this.$route);
    }
  },

  methods: {
    onCollapse(collapsed) {
      this.collapsed = collapsed;
    },
    changePage(key) {
      this.activePage = key;
      this.$router.push(key);
    },
    getRoutesData(route) {
      // console.log(route);
      if (route.name === "redirect") {
        return;
      }
      this.activePage = route.fullPath;
      // 路由组件名称（自定义）
      const componentName = route.matched[route.matched.length - 1]["components"]["default"]["name"];
      // 路由组件path
      const detail = route.fullPath;
      const name = route.meta.title;
      this.$store.dispatch("tagsView/commitToolBar", { name, detail, componentName });
    },

    onEdit(targetKey, action) {
      const item = this.getToolData.find(item => item.detail === targetKey);
      if (action === "remove") {
        this.closeToolItem(item);
      }
    },

    closeToolItem(item) {
      this.refreshLoading = false;
      this.$store.dispatch("tagsView/clearToolBar", item);
      this.$store.dispatch("tagsView/clearCache", item.componentName);
    },

    showContextMenu(e) {
      const pageKey = getPageKey(e.target);
      if (pageKey) {
        e.preventDefault();
        this.contextMenuVisible = true;
      }
    },

    onRefresh(item) {
      const that = this;
      this.refreshLoading = true;
      this.$store.dispatch("tagsView/clearCache", item.componentName).then(() => {
        //$nextTick 在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM。
        this.$nextTick(() => {
          this.$router.replace({
            path: "/redirect" + item.detail
          });
        });
        setTimeout(() => {
          that.refreshLoading = false;
        }, 500);
      });
    },

    reload(key) {
      const item = this.getToolData.find(item => item.detail === key);
      this.$store.dispatch("tagsView/clearCache", item.componentName).then(() => {
        //$nextTick 在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM。
        this.$nextTick(() => {
          this.$router.replace({
            path: "/redirect" + key
          });
        });
      });
    },

    closeOthers(key) {
      const item = this.getToolData.find(item => item.detail === key);
      this.$store.dispatch("tagsView/clearOthers", item);
    },
    onMenuSelect(key, target) {
      const pageKey = getPageKey(target);
      switch (key) {
        case "1":
          this.onRefresh(this.getToolData.find(item => item.detail === pageKey));
          break;
        case "2":
          this.closeOthers(pageKey);
          break;
        default:
          break;
      }
    }
  }
};
/**
 * 由于ant-design-vue组件库的TabPane组件暂不支持自定义监听器，无法直接获取到右键target所在标签页的 pagekey 。故增加此方法用于
 * 查询右键target所在标签页的标识 pagekey ，以用于自定义右键菜单的事件处理。
 * @param target 查询开始目标
 * @param depth 查询层级深度 （查找层级最多不超过3层，超过3层深度直接返回 null）
 * @returns {String}
 */
function getPageKey(target, depth = 0) {
  if (depth > 2 || !target) {
    return null;
  }
  return target.getAttribute("pagekey") || getPageKey(target.firstElementChild, ++depth);
}
</script>

<style lang="less" scoped>
#components-layout {
  min-height: 100vh;
}
.sider-layout {
  overflow: auto;
  height: 100vh;
  position: fixed;
  z-index: 100;
  left: 0;
}

.container {
  overflow: hidden;
  /deep/ .ant-tabs-card {
    /deep/ .ant-tabs-bar {
      border-color: #f0f0f0;
      //  border: none;
      margin: 6px 0 0 0;
      .ant-tabs-tab {
        border-top: none;
        border-left: none;
        border-right: none;
      }
    }
  }
}

.trigger {
  font-size: 18px;
  cursor: pointer;
  transition: color 0.3s;
  &:hover {
    color: #1890ff;
  }
}

.tab {
  margin: 0 -16px;
  padding: 0 16px;
  font-size: 14px;
  user-select: none;
  transition: all 0.2s;
  .title {
    display: inline-block;
    height: 100%;
  }
  .icon-sync {
    color: #1890ff;
    margin-left: -4px;
    transition: all 0.3s ease-in-out;
    font-size: 14px;
    &.hide {
      font-size: 0;
    }
  }
  .icon-close {
    font-size: 12px;
    margin-left: 6px;
    margin-right: -4px;
    color: rgba(0, 0, 0, 0.45);
    &:hover {
      color: rgba(0, 0, 0, 0.65);
    }
  }
}

/* .nav-theme-dark {
  /deep/ .logo {
    color: #ffffff;
  }
} */
</style>
