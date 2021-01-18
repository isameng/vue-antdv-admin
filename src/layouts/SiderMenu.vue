<template>
  <a-menu :selectedKeys="selectedKeys" :openKeys.sync="openKeys" mode="inline" :theme="theme">
    <template v-for="item in menuData">
      <a-menu-item
        v-if="!item.children"
        :key="item.path"
        @click="
          () =>
            $router.push({
              path: item.path,
              query: { navTheme: $route.query.navTheme }
            })
        "
      >
        <a-icon v-if="item.meta.icon" :type="item.meta.icon" />
        <span>{{ item.meta.title }}</span>
      </a-menu-item>
      <sub-menu v-else :key="item.path" :menu-info="item" />
    </template>
  </a-menu>
</template>

<script>
import SubMenu from "./SubMenu";
// import { check } from "../utils/auth";
// import { mapState } from "vuex";
export default {
  props: {
    theme: {
      type: String,
      default: "dark"
    },
    collapsed: {
      type: Boolean,
      default: false
    }
  },
  components: {
    "sub-menu": SubMenu
  },
  watch: {
    $route: function(val) {
      let path = val.path;
      if (val.meta.activeMenu) {
        path = val.meta.activeMenu;
      }
      this.selectedKeys = this.selectedKeysMap[path];
      this.openKeys = this.collapsed ? [] : this.openKeysMap[path];
    },

    collapsed(val) {
      if (val) {
        this.openKeys = [];
      } else {
        let path = this.$route.path;
        if (this.$route.meta.activeMenu) {
          path = this.$route.meta.activeMenu;
        }
        this.openKeys = this.openKeysMap[path];
      }
    }
  },

  // computed: {
  //   menuList() {
  //     return this.$store.state.permission.menuList;
  //   }
  // },

  data() {
    this.selectedKeysMap = {};
    this.openKeysMap = {};
    const menuData = this.getMenuData(this.$store.state.permission.menuList);
    // const menuData = this.getMenuData(this.menuList);
    // console.log(menuData);
    return {
      menuData,
      selectedKeys: this.selectedKeysMap[this.$route.meta.activeMenu || this.$route.path],
      openKeys: this.openKeysMap[this.$route.meta.activeMenu || this.$route.path]
    };
  },

  // created() {
  //   this.menuData = this.getMenuData(this.menuList);
  // },

  methods: {
    getMenuData(routes = [], parentKeys = [], selectedKey) {
      // console.log(routes);
      const menuData = [];
      for (let item of routes) {
        // if(item.meta && item.meta.authority && !check(item.meta.authority)){
        //    break;
        // }
        if (item.name && !item.hideInMenu) {
          this.openKeysMap[item.path] = parentKeys;
          this.selectedKeysMap[item.path] = [selectedKey || item.path];
          const newItem = { ...item };
          delete newItem.children;
          if (item.children && !item.hideChildrenInMenu) {
            newItem.children = this.getMenuData(item.children, [...parentKeys, item.path]);
          } else {
            this.getMenuData(
              item.children,
              selectedKey ? parentKeys : [...parentKeys, item.path],
              selectedKey || item.path
            );
          }
          menuData.push(newItem);
        } else if (!item.hideInMenu && !item.hideChildrenInMenu && item.children) {
          menuData.push(...this.getMenuData(item.children, [...parentKeys, item.path]));
        }
      }
      return menuData;
    }
  }
};
</script>
