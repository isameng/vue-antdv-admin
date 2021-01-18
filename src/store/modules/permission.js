import { recursionRouter, getNeedMenuList } from "@/utils/routerUtils";
import router, { authRoutes } from "@/router/index";
import dynamicRouter from "@/router/dynamic-router";
import { fetchUserInfo } from "@/api/user";

export default {
  namespaced: true,
  state: {
    /** 导航菜单 */
    menuList: [],
    /** 所有路由 */
    permissionList: null,
    roleTags: []
  },

  mutations: {
    setMenuList(state, m) {
      state.menuList = m;
    },

    clearMenuList(state) {
      state.menuList = [];
    },

    setPermission(state, routes) {
      state.permissionList = routes;
    },

    clearPermission(state) {
      state.permissionList = null;
    },

    setRoleTags(state, roleTags) {
      state.roleTags = roleTags;
    }
  },

  actions: {
    async fetchPermission({ commit }, isAsync = true) {
      const mainContainer = authRoutes.find(v => v.path === "/");

      if (isAsync) {
        /*  获取后台给的权限数组 */
        const { details } = await fetchUserInfo();
        // const details = data.details;
        //因为后端返回所有的目录，所以先筛选用户拥有权限的目录
        const menuList = getNeedMenuList(details.roleTags, details.menus);
        //先设置当前用户拥有的权限
        commit("setRoleTags", details.roleTags);
        /* 筛选出我们设置好的路由并并加入到path='/'的children */
        const routes = recursionRouter(menuList, dynamicRouter);
        // console.log(routes);
        mainContainer.children.push(...routes);
      } else {
        mainContainer.children.push(...dynamicRouter);
      }

      /* 生成左侧导航菜单 */
      commit("setMenuList", mainContainer.children);

      const initialRoutes = router.options.routes;
      router.addRoutes(authRoutes);

      /* 完整的路由表 */
      commit("setPermission", [...initialRoutes, ...authRoutes]);

      return [...initialRoutes, ...authRoutes];
    }
  }
};
