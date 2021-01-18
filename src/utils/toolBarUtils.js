import store from "@/store";
import router from "@/router/index";

export function closeToolItem(item) {
  store.commit("tagsView/clearToolItem", item.detail);
  store.commit("tagsView/clearCacheView", item.componentName);
}

export function onRefreshAndDelete(refreshToolbar, closeToolbar) {
  store.dispatch("tagsView/clearCache", refreshToolbar.componentName).then(() => {
    router.replace({
      path: "/redirect" + refreshToolbar.detail
    });
    closeToolItem(closeToolbar)
  });
}
