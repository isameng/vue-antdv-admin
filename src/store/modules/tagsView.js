import router from "@/router/index";
export default {
  namespaced: true,
  state: {
    toolBarData: [], // 保存标签button的数组
    cacheView: [] // 保存需要缓存的数组
  },
  getters: {
    getToolData(state) {
      return state.toolBarData;
    },
    getCacheView(state) {
      return state.cacheView;
    }
  },
  mutations: {
    setToolData(state, data) {
      // 添加标签按钮，如果当前路由已经打开，则不再重复添加
      const inToolbar = state.toolBarData.find(item => item.detail === data.detail);
      !inToolbar && state.toolBarData.push({ ...data });
    },
    setCacheView(state, data) {
      // 与setToolData类似
      if (state.cacheView.includes(data.componentName)) return;
      state.cacheView.push(data.componentName);
    },
    clearToolItem(state, detail) {
      const index = state.toolBarData.findIndex(item => item.detail === detail);
      const isActive = router.app.$route.path == state.toolBarData[index]["detail"];
      const len = state.toolBarData.length - 1;
      state.toolBarData.splice(index, 1);
      (index == len || isActive) && router.push({ path: state.toolBarData[state.toolBarData.length - 1]["detail"] });
    },
    clearCacheView(state, viewName) {
      const index = state.cacheView.findIndex(item => item == viewName);
      state.cacheView.splice(index, 1);
    },
    clearOthersToolItem(state, detail){
      state.toolBarData = state.toolBarData.filter(item => item.detail === detail);
      router.push({ path: state.toolBarData[state.toolBarData.length - 1]["detail"] });
    },
    clearOthersCacheView(state, viewName){
      state.cacheView =  state.cacheView.filter(item => item === viewName);
    }
  },
  actions: {
    commitToolBar({ commit }, data) {
      commit("setToolData", data);
      commit("setCacheView", data);
    },
    clearToolBar({ commit }, data) {
      commit("clearToolItem", data.detail);
    },
    clearCache({ commit }, data) {
      commit("clearCacheView", data);
    },
    clearOthers({ commit }, data){
      commit("clearOthersToolItem", data.detail);
      commit("clearOthersCacheView", data.componentName);
    }
  }
};
