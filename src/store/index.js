import Vue from "vue";
import Vuex from "vuex";
import shelvesRecycle from "./modules/shelvesRecycle";
import shelvesLease from "./modules/shelvesLease";
import tagsView from "./modules/tagsView";
import user from "./modules/user";
import permission from "./modules/permission";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    shelvesLease,
    shelvesRecycle,
    tagsView,
    user,
    permission
  }
});
